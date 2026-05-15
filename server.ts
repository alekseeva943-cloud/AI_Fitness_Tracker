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
    // 1. ENTRY LOGS
    console.log('[AI API ENTRY] Route hit at:', new Date().toISOString());
    console.group(`[AI_TRACE] ${req.method} ${req.url}`);
    
    const startTime = Date.now();
    
    try {
      // 2. WRAP ENTIRE LOGIC
      if (!req.body || typeof req.body !== 'object') {
        console.error('[AI API ERROR] No body received');
        return res.status(400).json({ 
          success: false, 
          error: "Invalid request body (empty or not JSON)" 
        });
      }

      const { userPrompt, actionType } = req.body;
      console.log('[AI API REQUEST DATA]', { actionType, prompt: userPrompt?.slice(0, 30) });

      // 3. ZERO-OPENAI TEST MODE (Phase 1: confirm transport)
      // Мы временно отключаем OpenAI, чтобы гарантировать, что backend ВООБЩЕ отвечает
      console.log('[AI API STATUS] STABILITY_TEST_MODE: Bypassing real AI call');

      const testResponse = {
        success: true,
        summary: "Бэкенд диагностика: Канал связи активен. Serverless runtime работает корректно. AI временно в режиме теста.",
        recommendations: [
          { type: 'system', text: 'Backend transport layer is OK', priority: 'high', icon: 'check-circle' }
        ],
        insights: ["Response lifecycle completed", "Serialization successful"],
        trends: ["STABLE"],
        warnings: [],
        overallProgress: 100,
        trend: "STABLE",
        mainRisk: null,
        date: new Date().toISOString(),
        isTestResponse: true
      };

      const duration = Date.now() - startTime;
      console.log(`[AI API SUCCESS RESPONSE] Sent test payload. Total time: ${duration}ms`);
      
      // 4. HARD RETURN GUARANTEE (Explicit res.json)
      return res.status(200).json(testResponse);

    } catch (error: any) {
      console.error('[AI API FATAL CRASH]', error);
      
      return res.status(error.status || 500).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Fatal serverless error",
          type: error.constructor.name || 'UnknownError'
        }
      });
    } finally {
      // 5. EXIT LOGS
      console.log('[AI API EXIT] Cycle finished');
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
