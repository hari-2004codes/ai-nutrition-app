const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');

// Sample nutrition data - in a real app, this would come from a database
const nutritionDatabase = {
  'rice': {
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    sugar: 0.1
  },
  'chicken': {
    calories: 239,
    protein: 27,
    carbs: 0,
    fat: 14,
    fiber: 0,
    sugar: 0
  },
  'broccoli': {
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    sugar: 1.5
  },
  'pasta': {
    calories: 220,
    protein: 8,
    carbs: 44,
    fat: 1.1,
    fiber: 2.5,
    sugar: 0.8
  },
  'salad': {
    calories: 15,
    protein: 1.4,
    carbs: 3,
    fat: 0.2,
    fiber: 1.4,
    sugar: 1.8
  }
};

/**
 * Main function to recognize food items in a plate image
 * @param {string} imagePath - Path to the uploaded image
 * @returns {Promise<Array>} Array of recognized food items with nutrition info
 */
async function recognizePlate(imagePath) {
  try {
    // Verify image exists
    await fs.access(imagePath);
    console.log('Processing image at:', imagePath);

    // Option 1: Use Python script (uncomment to use)
    // return await callPythonModel(imagePath);

    // Option 2: Use external API (uncomment to use)
    // return await callExternalAPI(imagePath);

    // Option 3: Mock recognition for development (current implementation)
    return await mockRecognition(imagePath);

  } catch (error) {
    console.error('Error in recognizePlate:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Mock recognition function for development/testing
 * Replace this with actual ML model calls
 */
async function mockRecognition(imagePath) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock detected items based on filename or random selection
  const foodItems = ['rice', 'chicken', 'broccoli', 'pasta', 'salad'];
  const detectedItems = [];

  // Randomly select 2-4 food items
  const numItems = Math.floor(Math.random() * 3) + 2;
  const selectedItems = [];
  
  for (let i = 0; i < numItems; i++) {
    const randomItem = foodItems[Math.floor(Math.random() * foodItems.length)];
    if (!selectedItems.includes(randomItem)) {
      selectedItems.push(randomItem);
    }
  }

  // Create detection results
  selectedItems.forEach(item => {
    const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence
    const portion = Math.random() * 150 + 50; // 50-200g portion
    
    detectedItems.push({
      name: item,
      confidence: Math.round(confidence * 100) / 100,
      portion_grams: Math.round(portion),
      nutrients: calculateNutrients(item, portion)
    });
  });

  return detectedItems;
}

/**
 * Calculate nutrients based on food item and portion size
 */
function calculateNutrients(foodItem, portionGrams) {
  const baseNutrients = nutritionDatabase[foodItem];
  if (!baseNutrients) {
    return null;
  }

  // Base nutrients are typically per 100g, adjust for portion
  const multiplier = portionGrams / 100;

  return {
    calories: Math.round(baseNutrients.calories * multiplier),
    protein: Math.round(baseNutrients.protein * multiplier * 10) / 10,
    carbs: Math.round(baseNutrients.carbs * multiplier * 10) / 10,
    fat: Math.round(baseNutrients.fat * multiplier * 10) / 10,
    fiber: Math.round(baseNutrients.fiber * multiplier * 10) / 10,
    sugar: Math.round(baseNutrients.sugar * multiplier * 10) / 10
  };
}

/**
 * Call Python ML model (example implementation)
 * Uncomment and modify this function to use a Python script
 */
async function callPythonModel(imagePath) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../ml/food_recognition.py'),
      imagePath
    ]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const results = JSON.parse(output);
          resolve(results);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${error}`));
      }
    });
  });
}

/**
 * Call external API (example implementation)
 * Uncomment and modify this function to use services like Clarifai, Google Vision, etc.
 */
async function callExternalAPI(imagePath) {
  const axios = require('axios');
  const FormData = require('form-data');

  try {
    const formData = new FormData();
    formData.append('image', await fs.readFile(imagePath), {
      filename: path.basename(imagePath),
      contentType: 'image/jpeg'
    });

    const response = await axios.post('YOUR_API_ENDPOINT', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_API_KEY'
      }
    });

    // Process API response and convert to our format
    return processAPIResponse(response.data);
  } catch (error) {
    throw new Error(`External API call failed: ${error.message}`);
  }
}

/**
 * Process external API response and convert to our format
 */
function processAPIResponse(apiData) {
  // This would depend on your chosen API's response format
  // Convert API response to our standard format
  return [];
}

module.exports = {
  recognizePlate,
  nutritionDatabase
};