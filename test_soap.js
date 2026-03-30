const https = require('https');

const soapReq = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>11111111111</TCKimlikNo>
      <Ad>TEST</Ad>
      <Soyad>TEST</Soyad>
      <DogumYili>1990</DogumYili>
    </TCKimlikNoDogrula>
  </soap:Body>
</soap:Envelope>`;

const options = {
  hostname: 'tckimlik.nvi.gov.tr',
  port: 443,
  path: '/Service/KPSPublic.asmx',
  method: 'POST',
  headers: {
    'Content-Type': 'text/xml; charset=utf-8',
    'Content-Length': Buffer.byteLength(soapReq),
    'SOAPAction': '"http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula"',
    'Host': 'tckimlik.nvi.gov.tr',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('BODY:', data.substring(0, 300)); });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(soapReq);
req.end();
