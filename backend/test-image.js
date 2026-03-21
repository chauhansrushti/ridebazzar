const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/images/bmw.jpg',
  method: 'GET'
};

console.log('Testing image file request to: http://127.0.0.1:5000/images/bmw.jpg\n');

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  console.log('Content-Length:', res.headers['content-length']);
  
  if (res.statusCode === 200) {
    console.log('\n✅ Image file is being served correctly!');
  } else {
    console.log('\n❌ Error serving image file');
  }
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
