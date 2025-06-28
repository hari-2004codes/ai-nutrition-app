import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_URL = 'https://api.logmeal.es/v2';

/**
 * Segment & recognize dishes from image
 */
export async function recognizeWithSegmentation(filePath) {
  const form = new FormData();
  form.append('image', fs.createReadStream(filePath));

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
}

/**
 * Confirm one or many dishes
 */
export async function confirmMultipleDishes(imageId, items) {
  const confirmations = [];
 
  for (const item of items) {
    const confirmationData = {
      imageId: imageId,
      confirmedClass: [item.dishId, item.name],
      source: ["logmeal", "other"],
      food_item_position: [item.position, `extra_dish_${item.position}`]
    };
    
    try {
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
      confirmations.push(res.data);
    } catch (error) {
      console.error(
        "Confirmation error for dish:",
        item.name,
        error.response?.data || error.message
      );
      throw error;
    }
  }
  return confirmations;
}

/**
 * Get nutrition info for a whole image
 */
export async function getNutritionForImage(imageId) {
  const body = { imageId: Number(imageId) };

  try {
    const res = await axios.post(
      `${API_URL}/nutrition/recipe/nutritionalInfo`,
      body,
      {
        headers: {
          Authorization: `Bearer ${process.env.LOGMEAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        params: {
          language: 'eng',
        },
      }
    );

    if (!res.data) {
      console.error('Empty nutrition response from LogMeal');
      throw new Error('Empty response from LogMeal API');
    }

    // This is a key part of the response for multi-item images.
    if (!res.data.nutritional_info_per_item) {
      console.warn(
        'LogMeal response did not contain nutritional_info_per_item. The image might not have been segmented or confirmed correctly.',
        res.data
      );
    }

    return res.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      console.error('LogMeal API error on getNutritionForImage:', {
        status,
        data,
        url: error.config?.url,
        requestBody: error.config?.data,
      });
      if (status === 401) {
        throw new Error('LogMeal API authentication failed. Check API key.');
      }
      if (data?.message) {
        throw new Error(`LogMeal API error: ${data.message}`);
      }
    }
    throw new Error(`Failed to get nutrition data: ${error.message}`);
  }
}

/**
 * Get nutrition info
 */
export async function getNutrition(dishId, quantity, unit = 'g') {
  const body = { dishId, quantity, unit };
  const res = await axios.post(
    `${API_URL}/nutrition/recipe/nutritionalInfo`,
    body,
    {
      headers: {
        Authorization: `Bearer ${process.env.LOGMEAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return res.data;
}

/**
 * Get dish metadata
 */
export async function getDishMetadata(dishId) {
  try {
    const res = await axios.get(
      `${API_URL}/dataset/dishes/v1.0/${dishId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LOGMEAL_API_KEY}`
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error('Dish metadata error:', error);
    return null;
  }
	}