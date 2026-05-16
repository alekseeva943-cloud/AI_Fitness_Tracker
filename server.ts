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

      const { userPrompt, actionType, systemPrompt } = req.body;
      const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('[AI API ERROR] No API key found (OPENAI_API_KEY or GEMINI_API_KEY)');
        return res.status(500).json({ success: false, error: 'AI API key not configured' });
      }

      const isOpenAI = !!process.env.OPENAI_API_KEY;
      const openai = new OpenAI({ 
        apiKey,
        baseURL: isOpenAI ? undefined : "https://generativelanguage.googleapis.com/v1beta/openai/"
      });

      const isConversationalMode = actionType === 'WORKOUT_COACH' || actionType === 'EXERCISE_COACH';

      console.log(`[AI START] Action: ${actionType} using ${isOpenAI ? 'OpenAI' : 'Gemini'}`);

      const finalSystemPrompt = isConversationalMode 
        ? (systemPrompt || 'Ты элитный fitness coach. Отвечай только на русском языке.')
        : `${systemPrompt || 'Ты элитный fitness coach.'} ВАЖНО: Твой ответ ДОЛЖЕН быть в формате JSON. ГОВОРИ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ.`;

      const completion = await openai.chat.completions.create({
        model: isOpenAI ? 'gpt-4o-mini' : 'gemini-1.5-flash',
        messages: [
          {
            role: 'system',
            content: finalSystemPrompt
          },
          {
            role: 'user',
            content: userPrompt || 'Analyze my data'
          }
        ],
        ...(isConversationalMode ? {} : { response_format: { type: "json_object" } }),
        temperature: isConversationalMode ? 0.7 : 0.5,
        max_tokens: isConversationalMode ? 700 : 1200
      });

      console.log('[AI RESPONSE RECEIVED]', completion.id);
      const rawContent = completion.choices[0]?.message?.content || '{}';
      
      if (isConversationalMode) {
        return res.status(200).json({
          success: true,
          summary: rawContent,
          verdict: null,
          trend: 'STABLE',
          recommendations: [],
          nextSteps: [],
          tacticalPlan: [],
          suggestedEvents: [],
          followupQuestions: [],
          insights: [],
          trends: [],
          warnings: [],
          overallProgress: 0,
          motivation: null,
          mainRisk: null,
          date: new Date().toISOString()
        });
      }

      try {
        const parsed = JSON.parse(rawContent);
        console.log('[AI API SUCCESS] Parsed JSON response');
        return res.status(200).json({
          ...parsed,
          success: true,
          date: new Date().toISOString()
        });
      } catch (parseErr) {
        console.warn('[AI API WARNING] Failed to parse AI JSON');
        return res.status(200).json({
          success: true,
          summary: rawContent,
          verdict: "Анализ завершен, но данные требуют ручной проверки.",
          recommendations: [],
          nextSteps: [],
          motivation: "Продолжай в том же духе!",
          date: new Date().toISOString()
        });
      }

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
