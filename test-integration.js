// test-integration.js
// Simple test script to verify frontend-backend integration

const testBackendConnection = async () => {
  try {
    console.log('🧪 Testing backend connection...');
    
    const response = await fetch('http://localhost:4000/');
    if (response.ok) {
      console.log('✅ Backend is running');
      return true;
    } else {
      console.log('❌ Backend responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    return false;
  }
};

const testAPIEndpoints = async () => {
  try {
    console.log('🧪 Testing API endpoints...');
    
    // Test health check
    const healthResponse = await fetch('http://localhost:4000/');
    console.log('Health check:', healthResponse.ok ? '✅' : '❌');
    
    // Test auth endpoint (should return 400 for missing token)
    const authResponse = await fetch('http://localhost:4000/api/auth/firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log('Auth endpoint (no token):', authResponse.status === 400 ? '✅' : '❌');
    
    // Test profile endpoint (should return 401 for no auth)
    const profileResponse = await fetch('http://localhost:4000/api/profile');
    console.log('Profile endpoint (no auth):', profileResponse.status === 401 ? '✅' : '❌');
    
    return true;
  } catch (error) {
    console.log('❌ API test failed:', error.message);
    return false;
  }
};

const runTests = async () => {
  console.log('🚀 Starting integration tests...\n');
  
  const backendOk = await testBackendConnection();
  if (!backendOk) {
    console.log('\n❌ Backend is not running. Please start the server first:');
    console.log('cd server && npm start');
    return;
  }
  
  await testAPIEndpoints();
  
  console.log('\n✅ Integration tests completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the frontend: npm run dev');
  console.log('2. Open http://localhost:5173');
  console.log('3. Try signing up/logging in');
  console.log('4. Complete the onboarding process');
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
}

export { testBackendConnection, testAPIEndpoints }; 