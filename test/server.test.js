const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');
const { app } = require('../server');

test('POST /api/book returns a mailto fallback when no delivery provider is configured', async () => {
  process.env.TWILIO_ACCOUNT_SID = '';
  process.env.TWILIO_AUTH_TOKEN = '';
  process.env.TWILIO_FROM_NUMBER = '';
  process.env.SMTP_HOST = '';
  process.env.SMTP_USER = '';
  process.env.SMTP_PASS = '';
  process.env.EMAIL_TO = '';

  const server = http.createServer(app);
  server.listen(0);
  await once(server, 'listening');

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        phone: '5551234',
        address: '123 Main St',
        message: 'Need service',
        preferCall: false,
      }),
    });

    const data = await response.json();
    assert.equal(response.status, 202);
    assert.equal(data.fallback, 'mailto');
    assert.equal(data.ok, false);
  } finally {
    server.close();
    await once(server, 'close').catch(() => {});
  }
});
