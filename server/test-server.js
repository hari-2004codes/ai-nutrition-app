// Test script to verify server functionality
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:4000/api';
const TEST_IMAGE_PATH = path.join(process.cwd(), 'uploads', 'test-image.jpg');

// Check if test image exists
if (!fs.existsSync(TEST_IMAGE_PATH)) {
  console.error('Test image not found at:', TEST_IMAGE_PATH);
  console.log('Please place a test image at this location to run the test.');
  process.exit(1);
}

async function testServer() {
  console.log('🧪 Testing server functionality...');
  
  try {
    // 1. Test basic server health
    console.log('\n📡 Testing server health...');
    const healthResponse = await axios.get('http://localhost:4000/');
    console.log('✅ Server is running:', healthResponse.data);
    
    // 2. Test image segmentation
    console.log('\n🔍 Testing image segmentation...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));
    
    const segmentResponse = await axios.post(
      `${API_URL}/meals/segment`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    if (segmentResponse.data.imageId) {
      console.log('✅ Image segmentation successful!');
      console.log(`📊 Detected ${segmentResponse.data.predictions?.length || 0} food items`);
      
      // 3. Test dish confirmation with first prediction
      if (segmentResponse.data.predictions?.length > 0) {
        const prediction = segmentResponse.data.predictions[0];
        const topResult = prediction.recognition_results[0];
        
        console.log('\n✓ Testing dish confirmation...');
        const confirmResponse = await axios.post(
          `${API_URL}/meals/confirm`,
          {
            imageId: segmentResponse.data.imageId,
            items: [
              {
                dishId: topResult.id,
                confirmedClass: [topResult.id, topResult.name],
                source: ['logmeal', 'test'],
                foodItemPosition: [prediction.food_item_position, `food_item_${prediction.food_item_position}`]
              }
            ]
          }
        );
        
        console.log('✅ Dish confirmation successful!');
        
        // 4. Test nutrition info
        console.log('\n🍎 Testing nutrition info...');
        const nutritionResponse = await axios.post(
          `${API_URL}/meals/nutrition`,
          {
            dishId: topResult.id,
            quantity: 100,
            unit: 'g'
          }
        );
        
        console.log('✅ Nutrition info retrieved!');
        console.log('📊 Calories:', nutritionResponse.data.calories);
        console.log('📊 Protein:', nutritionResponse.data.nutrients?.protein);
        console.log('📊 Carbs:', nutritionResponse.data.nutrients?.carbohydrate);
        console.log('📊 Fat:', nutritionResponse.data.nutrients?.fat);
      }
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testServer(); 