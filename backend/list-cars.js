const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/cars',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.data && parsed.data.cars) {
        console.log('✅ All Cars with Images:\n');
        parsed.data.cars.forEach((car, idx) => {
          console.log(`${idx + 1}. ${car.make} ${car.model}`);
          console.log(`   Images: ${JSON.stringify(car.images)}`);
        });
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  });
});

req.end();
