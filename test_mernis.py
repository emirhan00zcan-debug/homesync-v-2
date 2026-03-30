import urllib.request
url = "https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx"
soap = """<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>11111111111</TCKimlikNo>
      <Ad>EMIRHAN</Ad>
      <Soyad>TEST</Soyad>
      <DogumYili>1990</DogumYili>
    </TCKimlikNoDogrula>
  </soap:Body>
</soap:Envelope>"""
headers = {
    'Content-Type': 'text/xml; charset=utf-8',
    'SOAPAction': '"http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula"',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
req = urllib.request.Request(url, data=soap.encode('utf-8'), headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        print(resp.read().decode('utf-8'))
except Exception as e:
    print(e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
