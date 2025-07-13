export default async function handler(req, res) {
  const { path = '' } = req.query;

  if (!path) return res.status(400).json({ error: 'Missing path parameter' });

  const url = `https://octra.network/${path}`;

  try {
    const headers = { ...req.headers };
    delete headers.host;

    const options = {
      method: req.method,
      headers,
    };

    if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase()) && req.body) {
      options.body = JSON.stringify(req.body);
      options.headers['Content-Type'] = 'application/json';
    }

    console.log('📤 Forwarding to:', url);
    console.log('📨 Payload:', req.body);

    const proxyRes = await fetch(url, options);
    const contentType = proxyRes.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await proxyRes.json();
      return res.status(proxyRes.status).json(json);
    } else {
      const text = await proxyRes.text();
      console.error('🧨 Raw response text:', text); // Debug RPC error
      return res.status(proxyRes.status).send(text);
    }
  } catch (err) {
    console.error('❌ Proxy Error:', err);
    return res.status(500).json({ error: 'Proxy failed', detail: err.message });
  }
}

