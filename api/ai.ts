import OpenAI from 'openai';

export const runtime = 'nodejs';

export default async function handler(req: any, res: any) {
  console.log('[AI API ENTRY] Serverless function triggered');
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const startTime = Date.now();
    const { actionType, userPrompt } = req.body || {};

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
      date: new Date().toISOString(),
      receivedPrompt: userPrompt ? userPrompt.slice(0, 20) + '...' : 'none'
    };

    const duration = Date.now() - startTime;
    console.log(`[AI API SUCCESS] Total serverless time: ${duration}ms`);
    
    return res.status(200).json(response);
  } catch (error: any) {
    console.error('[AI API FATAL ERROR]', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      type: 'ServerlessCrash'
    });
  }
}
