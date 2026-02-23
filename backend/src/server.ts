import app, { ensureDatabaseConnection } from './app';

const PORT = process.env.PORT || 5000;

const runServer = async () => {
  try {
    await ensureDatabaseConnection();

    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Health check at http://localhost:${PORT}/health`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err && (err as any).code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Kill the process using that port or set a different PORT.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// In serverless environments (e.g. Vercel) the default export is used by the function handler.
if (process.env.VERCEL !== '1') {
  runServer();

  process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
  });
}

export default app;
