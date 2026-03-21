const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/cars/test/debug',
  method: 'GET'
};

console.log('Testing debug endpoint...\n');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Debug Info:');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.error('Error parsing:', e.message);
      console.log('Raw:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.end();
