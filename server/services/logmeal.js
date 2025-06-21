import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_URL = 'https://api.logmeal.es/v2';

/**
 * 1️⃣ Segment & recognize dishes from image
 * Endpoint: POST /image/segmentation/complete
 * Returns: imageId, segmentation_results (array of {"dishId","name","prob","subclasses",...})
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
 * 2️⃣ Confirm one or many dishes for a recognized image
 * Endpoint: POST /image/confirm/dish/{model_version}
 * Accepts: imageId, dishId, confirmedClass, source?, food_item_position?
 */
export async function confirmMultipleDishes(imageId, items) {
  const confirmations = [];
  for (const item of items) {
    const {
      dishId,
      confirmedClass,       // [classId, className]
      source,               // e.g. ['logmeal','user']
      foodItemPosition      // e.g. [0, 'plate_1']
    } = item;

    const payload = {
      imageId,
      confirmedClass,
      ...(source && { source }),
      ...(foodItemPosition && { food_item_position: foodItemPosition })
    };

    const res = await axios.post(
      `${API_URL}/image/confirm/dish/v1.0`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.LOGMEAL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: {
          language: 'eng'
        }
      }
    );
    confirmations.push(res.data);
  }
  return confirmations;
}

/**
 * 3️⃣ Retrieve nutrition info for a dish + quantity
 * Endpoint: POST /nutrition/recipe/nutritionalInfo
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
      },
      params: {
        language: 'eng'
      }
    }
  );
  return res.data;
}

/**
 * 4️⃣ Fetch full list of available LogMeal dishes
 * Endpoint: GET /dataset/dishes/{model_version}
 */
export async function getAllDishes() {
  const res = await axios.get(
    `${API_URL}/dataset/dishes/v1.0`,
    {
      headers: {
        Authorization: `Bearer ${process.env.LOGMEAL_API_KEY}`
      },
      params: {
        language: 'eng'
      }
    }
  );
  return res.data;
}
