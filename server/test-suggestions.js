// Simple test script to verify suggestion functionality
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Test data
const testFood = {
  name: 'Apple',
  quantity: 100,
  unit: 'g',
  calories: 52,
  protein: 0.3,
  carbs: 14,
  fat: 0.2
};

const testDailyIntake = {
  calories: 500,
  protein: 20,
  carbs: 60,
  fat: 15
};

async function testSuggestionGeneration() {
  try {
    console.log('🧪 Testing AI suggestion generation...');
    
    // You'll need to add a valid auth token here
    const authToken = 'your-jwt-token'; // Replace with actual token
    
    const response = await axios.post(`${API_URL}/meals/suggest`, {
      foodData: testFood,
      dailyIntake: testDailyIntake
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Suggestion generated successfully:');
    console.log('Healthiness:', response.data.healthiness);
    console.log('Recommendation:', response.data.recommendation);
    console.log('Tips:', response.data.tips);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSuggestionGeneration();
}

export { testSuggestionGeneration };
