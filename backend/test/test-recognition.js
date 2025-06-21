const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

async function testRecognitionAPI() {
  try {
    console.log('Testing Food Recognition API...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/recognition/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test 2: Upload image (you'll need to have a test image)
    console.log('\n2. Testing image upload...');
    
    // Create a test image path - you'll need to have an actual image file
    const testImagePath = path.join(__dirname, 'test-plate.jpg');
    
    if (fs.existsSync(testImagePath)) {
      const formData = new FormData();
      formData.append('plateImage', fs.createReadStream(testImagePath));

      const uploadResponse = await axios.post(`${API_BASE}/recognition/plate`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      console.log('✅ Image recognition result:');
      console.log(JSON.stringify(uploadResponse.data, null, 2));
    } else {
      console.log('⚠️ Test image not found at:', testImagePath);
      console.log('Create a test image or update the path to test image upload');
    }

    // Test 3: Error handling - no file
    console.log('\n3. Testing error handling (no file)...');
    try {
      await axios.post(`${API_BASE}/recognition/plate`);
    } catch (error) {
      console.log('✅ Expected error for no file:', error.response.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests
testRecognitionAPI();