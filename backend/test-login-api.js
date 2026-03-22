const fetch = require('node-fetch');

async function testLoginAPI() {
  const apiUrl = 'http://localhost:5000/api/auth/login';
  
  const testUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'srushti', password: 'srushti123' },
    { username: 'priti', password: 'priti17' },
    { username: 'neel', password: 'neel123' },
    { username: 'tanisha', password: 'tan123' }
  ];

  console.log('\n=== TESTING LOGIN API ===');
  
  for (const user of testUsers) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.username,
          password: user.password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${user.username}: Login successful! Role: ${data.data.user.role}`);
      } else {
        console.log(`❌ ${user.username}: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ ${user.username}: Connection error - ${error.message}`);
    }
  }
}

testLoginAPI();
