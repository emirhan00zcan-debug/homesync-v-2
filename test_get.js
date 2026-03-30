const https = require('https');

const options = {
  hostname: 'tckimlik.nvi.gov.tr',
  port: 443,
  path: '/Service/KPSPublic.asmx',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('BODY:', data.substring(0, 300)); });
});
req.end();
