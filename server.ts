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

  // Test endpoint for architecture verification
  app.get("/api/test", (req, res) => {
    console.log('[TEST API HIT] server diagnostics check');
    return res.status(200).json({
      success: true,
      message: 'Server diagnostics: Route is reachable',
      timestamp: new Date().toISOString()
    });
  });

  // AI Endpoint
  app.post("/api/ai", async (req, res) => {
    // 1. ENTRY LOGS
    console.log('[AI API ENTRY] Route hit at:', new Date().toISOString());
    console.group(`[AI_TRACE] ${req.method} ${req.url}`);
    
    const startTime = Date.now();
    
    try {
      // Set explicit headers
      res.setHeader('Content-Type', 'application/json');

      if (!req.body || typeof req.body !== 'object') {
        console.error('[AI API ERROR] No body received or not JSON');
        return res.status(400).json({ 
          success: false, 
          error: "Invalid request body (empty or not JSON)" 
        });
      }

      const { userPrompt, actionType } = req.body;
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        console.error('[AI API ERROR] OPENAI_API_KEY is missing');
        return res.status(500).json({ success: false, error: 'OpenAI API key not configured' });
      }

      const openai = new OpenAI({ apiKey });

      console.log('[OPENAI START] Requesting completion from gpt-4o-mini');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a fitness AI assistant. Respond briefly and EXCLUSIVELY in Russian language. (Отвечай только на русском языке).'
          },
          {
            role: 'user',
            content: `Action: ${actionType || 'general'}. Prompt: ${userPrompt || 'Check connection'}`
          }
        ],
        temperature: 0.7
      });

      console.log('[OPENAI RESPONSE RECEIVED]', completion.id);
      const text = completion.choices[0]?.message?.content || '';
      console.log('[OPENAI TEXT LENGTH]', text.length);

      const response = {
        success: true,
        summary: text,
        recommendations: [],
        insights: [],
        trends: [],
        warnings: [],
        overallProgress: 0,
        trend: "STABLE",
        mainRisk: null,
        date: new Date().toISOString()
      };

      const duration = Date.now() - startTime;
      console.log(`[AI API SUCCESS] Sending response. Time: ${duration}ms`);
      
      // Explicitly end the response with the JSON
      return res.status(200).json(response);

    } catch (error: any) {
      console.error('[AI API FATAL CRASH]', error);
      
      return res.status(500).json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Fatal server error",
          type: error.constructor.name || 'UnknownError'
        }
      });
    } finally {
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
