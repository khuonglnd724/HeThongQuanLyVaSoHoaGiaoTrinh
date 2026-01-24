const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('✅ setupProxy.js LOADED!');
  // Proxy all /api/* requests to API Gateway (port 8080)
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080', // API Gateway
      changeOrigin: true,
//x
      // When request comes as: /api/workflows/xxx/approve
      // Express mount point '/api' strips it to: /workflows/xxx/approve
      // We need to rewrite it back to: /api/workflows/xxx/approve for the gateway
      pathRewrite: (path, req) => {
        // path is already without /api prefix (Express strips it)
        const rewritten = '/api' + path;
        return rewritten;

      // The API Gateway expects /api/* paths
      // When app.use('/api', ...) is used, the /api prefix is stripped before reaching this middleware
      // So we need to re-add it for the backend
      pathRewrite: (path) => {
        // path is just '/users', '/auth/login', etc (without /api prefix)
        return `/api${path}`

      },
       
//x
      logLevel: 'debug',
      ws: true,
      onProxyReq: (proxyReq, req, res) => {
        // CRITICAL: Manually ensure Authorization header is forwarded
        // http-proxy-middleware should do this automatically, but let's be explicit
        const authHeader = req.headers['authorization'];
        if (authHeader) {
          proxyReq.setHeader('Authorization', authHeader);
          console.log(`[PROXY REQ] ${req.method} ${req.originalUrl} -> Authorization: [present]`);
        } else {
          console.log(`[PROXY REQ] ${req.method} ${req.originalUrl} -> Authorization: [MISSING - THIS IS THE PROBLEM!]`);
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`[PROXY RES] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode}`);
      },
      onError: (err, req, res) => {
        console.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}:`, err.message);
        res.status(503).json({
          error: 'Service Unavailable',
          message: 'Cannot connect to backend API Gateway',
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


