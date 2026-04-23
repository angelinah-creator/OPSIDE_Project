const http = require('http');

const PORT = Number(process.env.ROUTER_PORT || 3001);
const ROUTES = {
  'opside.code-talent.fr': { host: '127.0.0.1', port: 3201 },
  'app.opside.code-talent.fr': { host: '127.0.0.1', port: 3101 },
  'api-app.opside.code-talent.fr': { host: '127.0.0.1', port: 3101 },
};

function pickTarget(hostHeader) {
  const host = (hostHeader || '').split(':')[0].toLowerCase();
  return ROUTES[host] || ROUTES['app.opside.code-talent.fr'];
}

const server = http.createServer((req, res) => {
  const target = pickTarget(req.headers.host);
  const proxyReq = http.request(
    {
      host: target.host,
      port: target.port,
      method: req.method,
      path: req.url,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`Backend router upstream error: ${err.message}`);
  });

  req.pipe(proxyReq);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[domain-router-backend] listening on 127.0.0.1:${PORT}`);
});
