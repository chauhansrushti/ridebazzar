// Quick diagnostic script to test car creation
// Run this in the browser console to see the exact error

async function testCarUpload() {
    console.log('🔍 Starting car upload diagnostic...\n');
    
    try {
        // 1. Check auth token
        const token = localStorage.getItem('authToken');
        console.log('1️⃣ Auth Token:', token ? token.substring(0, 30) + '...' : '❌ MISSING');
        
        if (!token) {
            console.error('❌ No authentication token found. Please login first!');
            return;
        }
        
        // 2. Decode token to see user info
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('2️⃣ Token User Info:', payload);
        } catch (e) {
            console.warn('⚠️ Could not decode token:', e.message);
        }
        
        // 3. Prepare minimal car data
        const carData = {
            make: 'Toyota',
            model: 'Fortuner',
            year: 2023,
            price: 25000000,
            fuelType: 'Diesel',      // ⚠️ MUST match exact enum value
            transmission: 'Automatic', // ⚠️ MUST match exact enum value
            conditionStatus: 'Good',   // ⚠️ MUST match exact enum value
            images: []
        };
        
        console.log('3️⃣ Car Data to Send:', carData);
        console.log('   Payload Size:', new Blob([JSON.stringify(carData)]).size, 'bytes');
        
        // 4. Make the API request
        console.log('\n4️⃣ Sending POST request to /api/cars...');
        
        const response = await fetch(`${window.location.origin}/api/cars`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(carData)
        });
        
        console.log('5️⃣ Response Status:', response.status, response.statusText);
        
        // 5. Parse response
        const result = await response.json();
        console.log('6️⃣ Response Body:', result);
        
        if (!response.ok) {
            console.error('\n❌ ERROR:');
            console.error('   Message:', result.message);
            if (result.debug) {
                console.error('   Debug Info:', result.debug);
            }
        } else {
            console.log('\n✅ SUCCESS! Car ID:', result.data.carId);
        }
        
    } catch (error) {
        console.error('\n❌ Network Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the diagnostic
testCarUpload();
