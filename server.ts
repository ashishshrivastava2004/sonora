import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './src/server/app';

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sonora Music Server running on http://localhost:${PORT}`);
  });
}

// When run directly as standalone server (local dev or container runtime)
if (!process.env.VERCEL) {
  startServer();
}

export default app;
