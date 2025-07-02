const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 华为云IAM代理
  app.use(
    '/api/iam',
    createProxyMiddleware({
      target: 'https://iam.cn-north-4.myhuaweicloud.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/iam': '', // 移除 /api/iam 前缀
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('代理IAM请求:', req.url);
      },
      onError: (err, req, res) => {
        console.error('IAM代理错误:', err);
      }
    })
  );

  // 华为云IoT代理
  app.use(
    '/api/iot',
    createProxyMiddleware({
      target: 'https://3b42e90b15.st1.iotda-app.cn-north-4.myhuaweicloud.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/iot': '', // 移除 /api/iot 前缀
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('代理IoT请求:', req.url);
      },
      onError: (err, req, res) => {
        console.error('IoT代理错误:', err);
      }
    })
  );
};
