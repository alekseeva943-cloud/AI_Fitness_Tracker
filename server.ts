import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Recommendations
  app.post("/api/analyze", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is missing in server environment.");
        return res.status(500).json({ 
          error: "API ключ AI не настроен в серверном окружении.",
          detail: "Убедитесь, что переменная GEMINI_API_KEY установлена в настройках проекта."
        });
      }

      const { goal, analytics, semanticContext } = req.body;
      const genAI = new GoogleGenAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const prompt = `
        Ты – профессиональный фитнес-аналитик и коуч. Твоя задача – проанализировать прогресс пользователя относительно его КОНКРЕТНОЙ ЦЕЛИ.
        
        ЦЕЛЬ ПОЛЬЗОВАТЕЛЯ: ${goal ? `"${goal.title}" (Показатель: ${goal.metricLabel}, Цель: ${goal.targetValue} ${goal.unit})` : 'Не установлена'}
        
        ДАННЫЕ ДЛЯ АНАЛИЗА:
        - Аналитика: ${JSON.stringify(analytics)}
        - Семантика процесса: ${JSON.stringify(semanticContext)}
        
        ВЫХОДНОЙ ФОРМАТ: JSON
        {
          "summary": "Краткое описание прогресса",
          "trend": "IMPROVING" | "STAGNATING" | "DECLINING",
          "recommendations": [
            { "type": "EXERCISE" | "DIET" | "REST" | "MOTIVATION", "text": "Текст рекомендации", "priority": "LOW" | "MEDIUM" | "HIGH" }
          ]
        }
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
      });

      const responseText = result.response.text();
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze progress" });
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
