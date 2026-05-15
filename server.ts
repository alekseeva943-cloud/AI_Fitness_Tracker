import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });

  // AI Endpoint
  app.post("/api/ai", async (req, res) => {
    console.log('[AI ROUTE START]');
    console.group(`[AI API HIT] ${req.method} ${req.url}`);
    const startTime = Date.now();
    
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        console.error("[AI ERROR] Empty request body");
        console.groupEnd();
        return res.status(400).json({ success: false, error: "Empty request body" });
      }

      const { actionType, systemPrompt, userPrompt, provider = 'openai' } = req.body;

      console.log(`[AI REQUEST DATA]`, { 
        actionType, 
        provider, 
        systemPromptLength: systemPrompt?.length, 
        userPromptLength: userPrompt?.length 
      });

      if (provider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          console.error("[AI ERROR] OPENAI_API_KEY is missing");
          console.groupEnd();
          return res.status(500).json({ success: false, error: "OPENAI_API_KEY is not set." });
        }

        const openai = new OpenAI({ apiKey });
        
        // TEMPORARY SIMPLE REQUEST for stability testing
        console.log(`[OPENAI REQUEST START] Model: gpt-4o-mini, Time: ${new Date().toISOString()}`);

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Faster and more stable for simple text testing
          messages: [
            { role: "system", content: "You are a fitness AI assistant. Always return valid JSON." },
            { role: "user", content: `Action: ${actionType}. Context provided. User says: ${userPrompt || 'Analyze my data'}` }
          ],
          // response_format: { type: "json_object" }, // Temporarily disabled for stability
          temperature: 0.3,
        });

        console.log("[OPENAI RESPONSE OK]", response.id);
        const duration = Date.now() - startTime;
        const rawContent = response.choices[0]?.message?.content;
        
        console.log(`[OPENAI RAW] Length: ${rawContent?.length || 0} chars`);

        if (!rawContent) {
          console.error("[AI ERROR] OpenAI returned null content");
          console.groupEnd();
          return res.status(502).json({ success: false, error: "OpenAI returned empty content" });
        }

        // Try to return as JSON if it looks like JSON, otherwise return as text object
        try {
          const parsed = JSON.parse(rawContent);
          
          // Ensure structure compatibility
          const response = {
            success: true,
            summary: parsed.summary || parsed.text || "Анализ завершен",
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
            insights: Array.isArray(parsed.insights) ? parsed.insights : [],
            trends: Array.isArray(parsed.trends) ? parsed.trends : [],
            warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
            overallProgress: typeof parsed.overallProgress === 'number' ? parsed.overallProgress : 0,
            trend: parsed.trend || "STABLE",
            mainRisk: parsed.mainRisk || null
          };

          console.log('[AI ROUTE SUCCESS RESPONSE (JSON)]');
          console.groupEnd();
          return res.status(200).json(response);
        } catch (e) {
          console.warn("[AI WARNING] Response was not valid JSON, returning normalized structure");
          console.log('[AI ROUTE SUCCESS RESPONSE (NORMALIZED TEXT)]');
          console.groupEnd();
          return res.status(200).json({ 
            success: true, 
            summary: rawContent,
            recommendations: [],
            insights: [],
            trends: [],
            warnings: [],
            overallProgress: 0,
            trend: "STABLE",
            mainRisk: null,
            isRawText: true 
          });
        }
      } else {
        console.error(`[AI ERROR] Unsupported provider: ${provider}`);
        console.groupEnd();
        return res.status(400).json({ success: false, error: `Unsupported provider: ${provider}` });
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('[AI ROUTE CRASH]', error);
      console.error(`[AI ERROR DETAIL] Failed after ${duration}ms:`, {
        message: error.message,
        status: error.status,
        code: error.code
      });
      console.groupEnd();
      
      return res.status(error.status || 500).json({
        success: false,
        error: {
          message: error.message || "Internal AI Pipeline Error",
          type: error.constructor.name
        }
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
