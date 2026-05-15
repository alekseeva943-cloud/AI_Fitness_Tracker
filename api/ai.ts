import OpenAI from 'openai';

export const runtime = 'nodejs';

export default async function handler(req: any, res: any) {
  console.log('[AI API ENTRY] Serverless function triggered');
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const startTime = Date.now();
    const { actionType, userPrompt, systemPrompt } = req.body || {};

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[AI API ERROR] OPENAI_API_KEY is missing');
      return res.status(500).json({ success: false, error: 'OpenAI API key not configured' });
    }

    const openai = new OpenAI({ apiKey });
    
    console.log('[OPENAI START] Requesting structured completion from gpt-4o-mini');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'You are a fitness AI assistant. Always return valid JSON in Russian.'
        },
        {
          role: 'user',
          content: userPrompt || 'Analyze my data'
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5
    });

    console.log('[OPENAI RESPONSE RECEIVED]', completion.id);
    const rawContent = completion.choices[0]?.message?.content || '{}';
    
    try {
      const parsed = JSON.parse(rawContent);
      console.log('[AI API SUCCESS] Parsed JSON response');
      return res.status(200).json({
        ...parsed,
        success: true,
        date: new Date().toISOString()
      });
    } catch (parseErr) {
      console.warn('[AI API WARNING] Failed to parse OpenAI JSON');
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
    console.error('[AI API FATAL ERROR]', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      type: 'ServerlessCrash'
    });
  }
}
