import OpenAI from 'openai';

export const runtime = 'nodejs';

export default async function handler(req: any, res: any) {

  console.log('[AI API ENTRY] Serverless function triggered');

  try {

    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    const startTime = Date.now();

    const {
      actionType,
      userPrompt,
      systemPrompt
    } = req.body || {};

    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error(
        '[AI API ERROR] No API key found (OPENAI_API_KEY or GEMINI_API_KEY)'
      );

      return res.status(500).json({
        success: false,
        error: 'AI API key not configured'
      });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_API_KEY ? undefined : "https://generativelanguage.googleapis.com/v1beta/openai/"
    });

    console.log(
      `[OPENAI START] Action: ${actionType} using ${process.env.OPENAI_API_KEY ? 'OpenAI' : 'Gemini'}`
    );

    // =========================================
    // CHAT MODES
    // =========================================

    const isConversationalMode =
      actionType === 'WORKOUT_COACH' ||
      actionType === 'EXERCISE_COACH';

    // =========================================
    // OPENAI REQUEST
    // =========================================

    const finalSystemPrompt = isConversationalMode 
      ? (systemPrompt || 'Ты элитный fitness coach. Отвечай только на русском языке.')
      : `${systemPrompt || 'Ты элитный fitness coach.'} ВАЖНО: Твой ответ ДОЛЖЕН быть в формате JSON. ГОВОРИ ТОЛЬКО НА РУССКОМ ЯЗЫКЕ.`;

    const completion =
      await openai.chat.completions.create({

        model: process.env.OPENAI_API_KEY ? 'gpt-4o-mini' : 'gemini-1.5-flash',

        messages: [
          {
            role: 'system',
            content: finalSystemPrompt
          },
          {
            role: 'user',
            content:
              userPrompt ||
              'Помоги пользователю.'
          }
        ],

        // ВАЖНО:
        // JSON ТОЛЬКО ДЛЯ DASHBOARD/ANALYTICS
        ...(isConversationalMode
          ? {}
          : {
              response_format: {
                type: 'json_object'
              }
            }),

        temperature:
          isConversationalMode
            ? 0.7
            : 0.5,

        max_tokens:
          isConversationalMode
            ? 700
            : 1200
      });

    console.log(
      '[OPENAI RESPONSE RECEIVED]',
      completion.id
    );

    const rawContent =
      completion.choices?.[0]?.message?.content || '';

    console.log(
      '[OPENAI TEXT LENGTH]',
      rawContent.length
    );

    // =========================================
    // CONVERSATIONAL MODES
    // =========================================

    if (isConversationalMode) {

      console.log(
        '[AI MODE] Conversational coach mode'
      );

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

    // =========================================
    // STRUCTURED MODES
    // =========================================

    try {

      const parsed = JSON.parse(rawContent);

      console.log(
        '[AI API SUCCESS] Parsed structured JSON'
      );

      return res.status(200).json({

        ...parsed,

        success: true,

        date: new Date().toISOString()
      });

    } catch (parseErr) {

      console.warn(
        '[AI API WARNING] Failed to parse JSON'
      );

      return res.status(200).json({

        success: true,

        summary: rawContent,

        verdict:
          'Ответ требует проверки',

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

        motivation:
          'Продолжаем работу.',

        mainRisk: null,

        date: new Date().toISOString()
      });
    }

  } catch (error: any) {

    console.error(
      '[AI API FATAL ERROR]',
      error
    );

    return res.status(500).json({

      success: false,

      error:
        error instanceof Error
          ? error.message
          : String(error),

      type: 'ServerlessCrash'
    });
  }
}

