import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Endpoint
  app.post("/api/ai", async (req, res) => {
    console.log('[AI API HIT]');
    const startTime = Date.now();
    const { actionType, systemPrompt, userPrompt, provider = 'openai' } = req.body;

    console.log(`[AI REQUEST START] ${new Date().toISOString()}`);
    console.log(`[REQUEST BODY]`, { 
      actionType, 
      provider, 
      systemPromptLength: systemPrompt?.length, 
      userPromptLength: userPrompt?.length 
    });

    try {
      if (provider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          console.error("[AI ERROR] OPENAI_API_KEY is missing in environment");
          return res.status(500).json({ error: "Server Configuration Error: OPENAI_API_KEY is not set." });
        }

        const openai = new OpenAI({ apiKey });
        console.log("[OPENAI REQUEST START] Model: gpt-4o");

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        console.log("[OPENAI RESPONSE OK]");
        const duration = Date.now() - startTime;
        const rawContent = response.choices[0].message.content;
        
        console.log(`[OPENAI RAW RESPONSE] Received in ${duration}ms`);
        console.log(`[OPENAI RAW RESPONSE] Length: ${rawContent?.length} chars`);

        if (!rawContent) {
          throw new Error("Empty response from OpenAI");
        }

        console.log("[JSON PARSE START] Attempting to parse response...");
        try {
          const parsed = JSON.parse(rawContent);
          console.log("[JSON PARSE SUCCESS]");
          return res.json(parsed);
        } catch (parseError) {
          console.error("[JSON PARSE ERROR] Malformed JSON from AI", rawContent);
          return res.status(502).json({ 
            error: "Malformed JSON from AI", 
            rawResponse: rawContent,
            details: parseError instanceof Error ? parseError.message : String(parseError)
          });
        }
      } else {
        return res.status(400).json({ error: "Unsupported provider" });
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`[AI ERROR] Failed after ${duration}ms:`, error);
      
      return res.status(error.status || 500).json({
        error: error.message || "Internal AI Pipeline Error",
        status: error.status,
        code: error.code,
        type: error.type,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
