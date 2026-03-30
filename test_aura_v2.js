const http = require('http');

const data = JSON.stringify({
  message: "Işıkları kapat",
  chatHistory: []
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ai/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('--- AURA v2.0 API TEST ---');
    console.log('Status Code:', res.statusCode);
    try {
      const parsed = JSON.parse(body);
      console.log('Response:', JSON.stringify(parsed, null, 2));
      if (parsed.command === 'SET_THEME:DARK') {
        console.log('\n✅ Intent Detection: SUCCESS (Theme command detected)');
      } else {
        console.log('\n❌ Intent Detection: FAILED (Expected SET_THEME:DARK)');
      }
    } catch (e) {
      console.log('Raw Response:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('API Error:', error.message);
});

req.write(data);
req.end();
