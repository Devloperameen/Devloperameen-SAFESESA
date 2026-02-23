import app, { ensureDatabaseConnection } from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

const runServer = async () => {
  try {
    console.log(`[server] Starting EduFlow backend...`);
    console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[server] Connecting to database...`);

    await ensureDatabaseConnection();

    const server = app.listen(PORT, HOST, () => {
      console.log(`[server] ✅ Server running on ${HOST}:${PORT}`);
      console.log(`[server] API available at http://localhost:${PORT}/api`);
      console.log(`[server] Health check at http://localhost:${PORT}/health`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[server] ❌ Port ${PORT} is already in use. Set a different PORT environment variable.`);
        process.exit(1);
      }
      console.error('[server] ❌ Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('[server] ❌ Unable to start server:', error);
    process.exit(1);
  }
};

// In serverless environments (e.g. Vercel) the default export is used by the function handler.
if (process.env.VERCEL !== '1') {
  runServer();

  process.on('unhandledRejection', (err: Error) => {
    console.error('[server] Unhandled Rejection:', err.message);
    process.exit(1);
  });
}

export default app;
