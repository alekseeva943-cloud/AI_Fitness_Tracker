export const runtime = 'nodejs';

export default async function handler(req: any, res: any) {
  console.log('[TEST API HIT] serverless test hit');
  
  // Set headers explicitly for safety
  res.setHeader('Content-Type', 'application/json');
  
  return res.status(200).json({
    success: true,
    message: 'Test route works',
    timestamp: new Date().toISOString()
  });
}
