const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    console.log('🛠️ setupProxy.js 적용됨');
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};
