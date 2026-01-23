const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all /api/* requests to API Gateway (port 8080)
  // IMPORTANT: Do NOT strip /api prefix - keep full path when forwarding
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080', // API Gateway
      changeOrigin: true,
      // Express strips the mount path when using app.use('/api', ...).
      // Re-add the `/api` prefix so the gateway receives the full path.
      pathRewrite: (path) => '/api' + path,
      logLevel: 'debug',
      ws: true, // Enable WebSocket support
      onProxyReq: (proxyReq, req, res) => {
        try {
          const auth = proxyReq.getHeader('authorization') || req.headers['authorization'] || null
          console.log(`[PROXY REQ] ${req.method} ${req.originalUrl} -> http://localhost:8080${req.url} (forwarding Authorization: ${auth ? '[present]' : '[missing]'})`);
        } catch (e) {
          console.log(`[PROXY REQ] ${req.method} ${req.originalUrl} -> http://localhost:8080${req.url}`);
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`[PROXY RES] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`);
      },
      onError: (err, req, res) => {
        console.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}:`, err.message);
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Backend service is not responding',
          details: err.message
        });
      }
    })
  );
};


