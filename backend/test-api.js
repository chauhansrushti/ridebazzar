const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/cars',
  method: 'GET'
};

console.log('Connecting to API at http://127.0.0.1:5000/api/cars');

const req = http.request(options, (res) => {
  console.log('✅ Connected! Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('\n📦 RAW RESPONSE LENGTH:', data.length, 'bytes');
    console.log('\n📋 RESPONSE:');
    console.log(data.substring(0, 1000));
    
    try {
      const parsed = JSON.parse(data);
      console.log('\n✅ Parsed JSON:');
      console.log('  success:', parsed.success);
      console.log('  data:', parsed.data ? 'exists' : 'MISSING');
      if (parsed.data) {
        console.log('  data.cars:', parsed.data.cars ? 'exists, length=' + parsed.data.cars.length : 'MISSING');
        if (parsed.data.cars && parsed.data.cars.length > 0) {
          console.log('\n🚗 First car:');
          console.log('  Make:', parsed.data.cars[0].make);
          console.log('  Model:', parsed.data.cars[0].model);
          console.log('  Images:', JSON.stringify(parsed.data.cars[0].images));
        }
      }
    } catch (e) {
      console.error('\n❌ Error parsing response:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Connection error:', e.message);
  process.exit(1);
});

req.end();
