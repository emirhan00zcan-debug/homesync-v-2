const https = require('https');

const soapReq = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>11111111111</TCKimlikNo>
      <Ad>TEST</Ad>
      <Soyad>TEST</Soyad>
      <DogumYili>1990</DogumYili>
    </TCKimlikNoDogrula>
  </soap12:Body>
</soap12:Envelope>`;

const options = {
  hostname: 'tckimlik.nvi.gov.tr',
  port: 443,
  path: '/Service/KPSPublic.asmx',
  method: 'POST',
  headers: {
    'Content-Type': 'application/soap+xml; charset=utf-8',
    'Content-Length': Buffer.byteLength(soapReq),
    'Host': 'tckimlik.nvi.gov.tr',
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('BODY:', data.substring(0, 500)); });
});
req.write(soapReq);
req.end();
