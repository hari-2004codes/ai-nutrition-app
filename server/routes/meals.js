import express from 'express';
import { upload } from '../middleware/upload.js';
import {
  recognizeWithSegmentation,
  confirmMultipleDishes,
  getNutrition,
  getAllDishes
} from '../services/logmeal.js';

const router = express.Router();

// 🆕 GET All Dishes for Manual Search
router.get('/dishes', async (req, res, next) => {
  try {
    const dishes = await getAllDishes();
    res.json({ dishes });
  } catch (err) {
    next(err);
  }
});

// 🆕 SEGMENTATION-BASED RECOGNITION
router.post('/segment', upload.single('image'), async (req, res, next) => {
  try {
    const result = await recognizeWithSegmentation(req.file.path);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ✅ Confirm one or more dishIds for an image
router.post('/confirm', express.json(), async (req, res, next) => {
  try {
    const { imageId, items } = req.body; // items is an array of { confirmedClass, source?, food_item_position? }
    const confirmed = await confirmMultipleDishes(imageId, items);
    res.json(confirmed); // send back all confirmations
  } catch (err) {
    next(err);
  }
});

// ✅ Nutrition Lookup
router.post('/nutrition', express.json(), async (req, res, next) => {
  try {
    const { dishId, quantity, unit } = req.body;
    const nutri = await getNutrition(dishId, quantity, unit);
    res.json(nutri);
  } catch (err) {
    next(err);
  }
});

export default router;
