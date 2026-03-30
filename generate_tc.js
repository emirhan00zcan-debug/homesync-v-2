function generateValidTc() {
    let tc = [3, 2, 1, 4, 5, 6, 7, 8, 9]; // first 9 digits (randomized)
    let s1 = tc[0] + tc[2] + tc[4] + tc[6] + tc[8];
    let s2 = tc[1] + tc[3] + tc[5] + tc[7];
    let d10 = (s1 * 7 - s2) % 10;
    if (d10 < 0) d10 += 10;
    tc.push(d10);
    let sTotal = 0;
    for(let i=0; i<10; i++) sTotal += tc[i];
    let d11 = sTotal % 10;
    tc.push(d11);
    return tc.join('');
}

const https = require('https');
const validTc = generateValidTc();

const soapReq = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>${validTc}</TCKimlikNo>
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
    'User-Agent': 'Mozilla/5.0'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('BODY:', data); });
});
req.write(soapReq);
req.end();
