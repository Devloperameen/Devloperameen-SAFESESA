import app, { ensureDatabaseConnection } from '../src/app';

export default async function handler(req: any, res: any) {
  try {
    await ensureDatabaseConnection();
    return app(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
    });
  }
}
