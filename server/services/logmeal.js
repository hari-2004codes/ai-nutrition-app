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
    let confirmedClass, source;
    
    // Handle subclass items
    if (item.subclassIndex !== null && item.parentId && item.parentName) {
      confirmedClass = [
        item.dishId,
        item.name,
        item.parentId,
        item.parentName
      ];
      source = ["logmeal", "logmeal", "logmeal", "logmeal"];
    } else {
      // Handle regular items
      confirmedClass = [item.dishId, item.name];
      source = ["logmeal", "logmeal"];
    }

    const confirmationData = {
      imageId,
      confirmedClass,
      source,
      food_item_position: [
        item.position,
        `food_item_${item.position}`
      ]
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