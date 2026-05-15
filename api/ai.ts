export const runtime = 'nodejs';

export default async function handler(req: any, res: any) {
  console.log('[AI API ENTRY] Serverless function triggered');
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const startTime = Date.now();
    const { actionType, userPrompt } = req.body || {};

    console.log('[AI API STATUS] STABILITY_TEST_MODE: Returning test payload from serverless function');

    const testResponse = {
      success: true,
      summary: "Бэкенд диагностика (Serverless): Канал связи активен. AI временно в режиме теста для проверки транспорта.",
      recommendations: [
        { type: 'system', text: 'Serverless transport layer verified', priority: 'high', icon: 'check-circle' }
      ],
      insights: ["Native Vercel route detected", "Body parsing OK"],
      trends: ["STABLE"],
      warnings: [],
      overallProgress: 100,
      trend: "STABLE",
      mainRisk: null,
      date: new Date().toISOString(),
      isTestResponse: true,
      receivedPrompt: userPrompt ? userPrompt.slice(0, 20) + '...' : 'none'
    };

    const duration = Date.now() - startTime;
    console.log(`[AI API SUCCESS] Internal processing took ${duration}ms`);
    
    return res.status(200).json(testResponse);
  } catch (error: any) {
    console.error('[AI API FATAL ERROR]', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      type: 'ServerlessCrash'
    });
  }
}
