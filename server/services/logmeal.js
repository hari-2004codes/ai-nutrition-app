import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_URL = 'https://api.logmeal.com/v2';

/**
 * Segment & recognize dishes from image
 */
export async function recognizeWithSegmentation(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('Image file not found');
  }

  const form = new FormData();
  form.append('image', fs.createReadStream(filePath));

  try {
    const res = await axios.post(
      `${API_URL}/image/segmentation/complete`,
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.LOGMEAL_API_KEY}`,
          ...form.getHeaders()
        },
        params: {
          language: 'eng'
        }
      }
    );
    
    return res.data;
  } catch (error) {
    console.error('Image recognition error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Confirm multiple dishes in a single request with correct array formats
 */
export async function confirmMultipleDishes(imageId, confirmedClass, source, food_item_position) {
  try {
    // Handle empty selection case
    if (!confirmedClass.length) {
      return { success: true, message: 'No dishes to confirm' };
    }

    // Build payload matching ConfirmFoodDish schema
    const confirmationData = {
      imageId: Number(imageId),
      confirmedClass: confirmedClass,
      source: source,
      food_item_position: food_item_position.map(Number) // Ensure positions are numbers
    };

    console.log('Confirming dishes payload:', JSON.stringify(confirmationData, null, 2));

    const res = await axios.post(
      `${API_URL}/image/confirm/dish/v1.0`,
      confirmationData,
      {
        headers: {
          Authorization: `Bearer ${process.env.LOGMEAL_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Confirmation error for dishes:",
      error.response?.data || error.message,
      "Request payload:",
      JSON.stringify({ imageId, confirmedClass, source, food_item_position }, null, 2)
    );
    throw error;
  }
}

/**
 * Get nutrition info for a whole image
 */
export async function getNutritionForImage(imageId) {
  // Handle case where no dishes were confirmed
  if (!imageId) {
    return {
      nutritional_info_per_item: [],
      message: 'No dishes to analyze'
    };
  }

  const body = {
    imageId: Number(imageId),
    get_all_nutrients: true,
    get_nutritional_info_per_item: true,
    language: 'eng'
  };

  try {
    const res = await axios.post(
      `${API_URL}/nutrition/recipe/nutritionalInfo`,
      body,
      {
        headers: {
          Authorization: `Bearer ${process.env.LOGMEAL_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!res.data) {
      throw new Error('No response data received from nutrition API');
    }

    // Ensure we have the expected data structure
    if (!res.data.nutritional_info_per_item) {
      res.data.nutritional_info_per_item = [];
    }

    return res.data;
  } catch (error) {
    console.error('Nutrition fetch error:', error.response?.data || error.message);
    throw error;
  }
}