const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all /api/* requests to API Gateway (port 8080)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080', // API Gateway
      changeOrigin: true,
      // The API Gateway expects /api/* paths
      // When app.use('/api', ...) is used, the /api prefix is stripped before reaching this middleware
      // So we need to re-add it for the backend
      pathRewrite: (path) => {
        // path is just '/users', '/auth/login', etc (without /api prefix)
        return `/api${path}`
      },
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

  // Proxy WebSocket connections to API Gateway
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'ws://localhost:8080',
      changeOrigin: true,
      ws: true,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error(`[WS PROXY ERROR]:`, err.message);
      }
    })
  );
};


