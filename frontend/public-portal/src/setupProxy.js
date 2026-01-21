const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // Preserve /api prefix
      },
      logLevel: 'debug',
      onProxyRes: (proxyRes, req, res) => {
        console.log(`[PROXY] ${req.method} ${req.path} -> ${proxyRes.statusCode}`);
      },
    })
  );
};

