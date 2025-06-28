import express from 'express';
import { upload } from '../middleware/upload.js';
import {
  recognizeWithSegmentation,
  confirmMultipleDishes,
  getNutritionForImage,
} from '../services/logmeal.js';

const router = express.Router();

// Image segmentation
router.post('/segment', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const result = await recognizeWithSegmentation(req.file.path);
    if (!result.segmentation_results?.length) {
      return res.status(400).json({ error: 'No food items detected' });
    }
    res.json(result);
  } catch (err) {
    console.error('Segmentation error:', err);
    res.status(500).json({ error: 'Image processing failed' });
  }
});

// Confirm dishes
router.post('/confirm', express.json(), async (req, res, next) => {
  try {
    const { imageId, confirmedClass, source, food_item_position } = req.body;
    
    // Validate required fields
    if (!imageId || !Array.isArray(confirmedClass) || !Array.isArray(source) || !Array.isArray(food_item_position)) {
      return res.status(400).json({ 
        error: 'Invalid payload. All fields must be arrays.',
        received: {
          confirmedClass: Array.isArray(confirmedClass),
          source: Array.isArray(source),
          food_item_position: Array.isArray(food_item_position)
        }
      });
    }

    // Ensure all arrays have the same length
    if (confirmedClass.length !== source.length || source.length !== food_item_position.length) {
      return res.status(400).json({ 
        error: 'Arrays must have the same length',
        lengths: {
          confirmedClass: confirmedClass.length,
          source: source.length,
          food_item_position: food_item_position.length
        }
      });
    }

    const confirmed = await confirmMultipleDishes(
      imageId,
      confirmedClass,
      source,
      food_item_position
    );
    res.json(confirmed);
  } catch (err) {
    console.error('Confirm error:', err.response?.data || err.message);
    next(err);
  }
});

// Get nutrition for the whole image
router.post('/nutrition', express.json(), async (req, res, next) => {
  try {
    const { imageId } = req.body;
    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }
    const nutrition = await getNutritionForImage(imageId);
    res.json(nutrition);
  } catch (err) {
    console.error('Nutrition route error:', err);
    res.status(500).json({ error: 'Failed to get nutrition information', details: err.message });
  }
});

export default router;