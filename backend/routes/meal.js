// routes/meal.js
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { handleUpload } from '../middleware/upload.js';

const LOGMEAL_API_KEY = process.env.LOGMEAL_API_KEY;
const LOGMEAL_API_URL = process.env.LOGMEAL_API_URL;
// Expect model version (e.g., '1.0') in env
const LOGMEAL_MODEL_VERSION = process.env.LOGMEAL_MODEL_VERSION;

if (!LOGMEAL_API_KEY || !LOGMEAL_API_URL || !LOGMEAL_MODEL_VERSION) {
  console.error(
    '⚠️ Missing LogMeal configuration. Please set LOGMEAL_API_KEY, LOGMEAL_API_URL, and LOGMEAL_MODEL_VERSION in your .env'
  );
}

async function recognizeWithSegmentation(imagePath) {
  try {
    const version = LOGMEAL_MODEL_VERSION;
    const url = `${LOGMEAL_API_URL}/image/segmentation/complete/${version}`;
    console.log('Calling LogMeal segmentation endpoint:', url);

    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(url, formData, {
      headers: { Authorization: `Bearer ${LOGMEAL_API_KEY}`, ...formData.getHeaders() }
    });
    const result = response.data;
    if (!Array.isArray(result.segmentation) || result.segmentation.length === 0) {
      return result;
    }
    const foodItems = await Promise.all(
      result.segmentation.map(async (seg, idx) => {
        const position = seg.food_item_position ?? idx;
        const boundingBox = seg.bounding_box || seg.coordinates;
        // Adjust alternatives endpoint if needed: use documented path
        const altUrl = `${LOGMEAL_API_URL}/image/segmentation/alternatives`;
        const [alternativesResp, nutritionResp] = await Promise.all([
          axios.get(altUrl, {
            params: { image_id: result.imageId, position },
            headers: { Authorization: `Bearer ${LOGMEAL_API_KEY}` }
          }).then(r => r.data.alternatives).catch(err => {
            console.error('Alternatives error:', err.response?.status, err.response?.data);
            return [];
          }),
          axios.get(`${LOGMEAL_API_URL}/dish/${seg.food_dish_id}/preview/nutrition`, {
            headers: { Authorization: `Bearer ${LOGMEAL_API_KEY}` }
          }).then(r => r.data).catch(err => {
            console.error('Nutrition preview error:', err.response?.status, err.response?.data);
            return null;
          })
        ]);
        return {
          food_dish_id: seg.food_dish_id,
          food_dish_name: seg.food_dish_name,
          food_item_position: position,
          confidence: seg.confidence,
          boundingBox,
          suggested_quantity: seg.suggested_quantity ?? 1,
          suggested_unit: seg.suggested_unit ?? 'serving',
          alternatives: Array.isArray(alternativesResp) ? alternativesResp.slice(0, 3) : [],
          nutrition_preview: nutritionResp
        };
      })
    );
    return { imageId: result.imageId, segmentation: result.segmentation, foodItems };
  } catch (err) {
    console.error('Segmentation recognition error:', err.response?.data || err.message);
    throw new Error(`Failed to recognize food with segmentation: ${err.message}`);
  }
}

async function getAllDishes() {
  const url = `${LOGMEAL_API_URL}/dishes`;
  const response = await axios.get(url, { headers: { Authorization: `Bearer ${LOGMEAL_API_KEY}` } });
  return response.data;
}

async function getAlternativePredictions(imageId, position) {
  const url = `${LOGMEAL_API_URL}/image/segmentation/alternatives`;
  const response = await axios.get(url, {
    params: { image_id: imageId, position },
    headers: { Authorization: `Bearer ${LOGMEAL_API_KEY}` }
  });
  return response.data.alternatives;
}

async function confirmMultipleDishes(imageId, items) {
  return items.map(it => ({
    dishId: it.confirmedClass,
    quantity: it.quantity,
    food_item_position: it.food_item_position
  }));
}

async function getNutrition(dishId, value, unit) {
  const url = `${LOGMEAL_API_URL}/dish/${dishId}/nutrition`;
  const response = await axios.get(url, {
    params: { quantity: value, unit },
    headers: { Authorization: `Bearer ${LOGMEAL_API_KEY}` }
  });
  return response.data;
}

const router = express.Router();

// GET /api/meal/dishes
router.get('/dishes', async (req, res, next) => {
  try {
    const data = await getAllDishes();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/meal/segment
router.post('/segment', handleUpload('image'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded', message: 'Field name should be "image"' });
  }
  try {
    const result = await recognizeWithSegmentation(req.file.path);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/meal/segment/:imageId/alternatives/:position
router.get('/segment/:imageId/alternatives/:position', async (req, res, next) => {
  const { imageId, position } = req.params;
  try {
    const alternatives = await getAlternativePredictions(imageId, position);
    res.json({ imageId, position, alternatives });
  } catch (err) {
    next(err);
  }
});

// POST /api/meal/confirm
router.post('/confirm', express.json(), async (req, res, next) => {
  const { imageId, items } = req.body;
  if (!imageId || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid body', message: 'Expect { imageId, items: [...] }' });
  }
  try {
    const confirmation = await confirmMultipleDishes(imageId, items);
    res.json({ imageId, confirmation });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/meal/confirm/:imageId/:position/quantity
router.patch('/confirm/:imageId/:position/quantity', express.json(), async (req, res, next) => {
  const { imageId, position } = req.params;
  const { quantity, unit } = req.body;
  if (quantity == null) {
    return res.status(400).json({ error: 'Missing quantity in body' });
  }
  try {
    res.json({ imageId, position, updated: { quantity, unit: unit || 'serving' } });
  } catch (err) {
    next(err);
  }
});

// POST /api/meal/nutrition
router.post('/nutrition', express.json(), async (req, res, next) => {
  const { dishId, quantity, unit } = req.body;
  if (!dishId || quantity == null) {
    return res.status(400).json({ error: 'Invalid body', message: 'Expect { dishId, quantity, unit }' });
  }
  try {
    const nutrition = await getNutrition(dishId, quantity, unit);
    res.json(nutrition);
  } catch (err) {
    next(err);
  }
});

// GET /api/meal/analysis/:imageId
router.get('/analysis/:imageId', async (req, res, next) => {
  const { imageId } = req.params;
  try {
    res.json({
      imageId,
      analysis: 'Analysis endpoint not yet implemented.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
