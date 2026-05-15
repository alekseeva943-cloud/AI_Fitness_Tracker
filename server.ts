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
    const startTime = Date.now();
    console.log('[AI ROUTE START] Received request');
    console.group(`[AI API HIT] ${req.method} ${req.url} - ${new Date().toISOString()}`);
    
    try {
      if (!req.body || typeof req.body !== 'object') {
        console.error("[AI ERROR] Invalid or empty request body");
        return res.status(400).json({ success: false, error: "Invalid request body" });
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
          console.error("[AI ERROR] OPENAI_API_KEY environment variable is NOT set");
          return res.status(500).json({ success: false, error: "OPENAI_API_KEY is not configured on the server." });
        }

        const openai = new OpenAI({ apiKey });
        
        console.log(`[OPENAI EXECUTION] model: gpt-4o-mini`);

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini", 
          messages: [
            { role: "system", content: "You are a fitness AI assistant. Always return valid JSON." },
            { role: "user", content: `Action: ${actionType}. User prompt: ${userPrompt || 'Analyze my data'}` }
          ],
          temperature: 0.3,
        });

        console.log("[OPENAI RESPONSE RECEIVED]", response.id);
        const rawContent = response.choices[0]?.message?.content;
        
        if (!rawContent) {
          console.error("[AI ERROR] OpenAI choices[0].message.content was empty/null");
          return res.status(502).json({ success: false, error: "AI provider returned an empty body" });
        }

        console.log(`[SERIALIZATION START] Length: ${rawContent.length} chars`);

        try {
          const parsed = JSON.parse(rawContent);
          const normalizedResponse = {
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

          const duration = Date.now() - startTime;
          console.log(`[AI ROUTE SUCCESS] JSON Parsed. Duration: ${duration}ms`);
          return res.status(200).json(normalizedResponse);
        } catch (jsonErr) {
          console.warn("[AI WARNING] AI output was not valid JSON. Returning raw text as summary.");
          const fallback = { 
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
          };
          console.log('[AI ROUTE SUCCESS] Fallback structure used.');
          return res.status(200).json(fallback);
        }
      } else {
        console.error(`[AI ERROR] Requested unsupported provider: ${provider}`);
        return res.status(400).json({ success: false, error: `Unsupported provider: ${provider}` });
      }
    } catch (error: any) {
      console.error('[AI ROUTE FATAL CRASH]', error);
      const duration = Date.now() - startTime;
      
      return res.status(error.status || 500).json({
        success: false,
        error: {
          message: error.message || "Unknown server error during AI processing",
          type: error.constructor.name,
          durationMs: duration
        }
      });
    } finally {
      console.log('[AI ROUTE EXIT]');
      console.groupEnd();
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
