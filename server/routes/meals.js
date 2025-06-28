import express from 'express';
import { upload } from '../middleware/upload.js';
import {
  recognizeWithSegmentation,
  confirmMultipleDishes,
  getNutritionForImage,
} from '../services/logmeal.js';

const router = express.Router();

// Image segmentation
router.post('/segment', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const result = await recognizeWithSegmentation(req.file.path);
    
    // Check if we got valid results
    if (!result || !result.segmentation_results) {
      return res.status(400).json({ error: 'Invalid response from image recognition service' });
    }

    // Even if no food items detected, we still return the result
    res.json(result);
  } catch (err) {
    console.error('Segmentation error:', err.response?.data || err);
    res.status(500).json({ 
      error: 'Image processing failed',
      details: err.response?.data?.message || err.message 
    });
  }
});

// Confirm dishes
router.post('/confirm', express.json(), async (req, res) => {
  try {
    const { imageId, confirmedClass, source, food_item_position } = req.body;
    
    // Allow empty arrays for no selections
    if (!imageId || !Array.isArray(confirmedClass) || !Array.isArray(source) || !Array.isArray(food_item_position)) {
      return res.status(400).json({ 
        error: 'Invalid payload format',
        details: {
          imageId: !!imageId,
          confirmedClass: Array.isArray(confirmedClass),
          source: Array.isArray(source),
          food_item_position: Array.isArray(food_item_position)
        }
      });
    }

    // Check array lengths match if not empty
    if (confirmedClass.length > 0 && 
        (confirmedClass.length !== source.length || source.length !== food_item_position.length)) {
      return res.status(400).json({ 
        error: 'Arrays must have matching lengths when not empty',
        details: {
          confirmedClass: confirmedClass.length,
          source: source.length,
          food_item_position: food_item_position.length
        }
      });
    }

    // If no dishes selected, return empty success response
    if (confirmedClass.length === 0) {
      return res.json({ success: true, message: 'No dishes to confirm' });
    }

    const confirmed = await confirmMultipleDishes(
      imageId,
      confirmedClass,
      source,
      food_item_position
    );
    res.json(confirmed);
  } catch (err) {
    console.error('Confirm error:', err.response?.data || err);
    res.status(500).json({ 
      error: 'Failed to confirm dishes',
      details: err.response?.data?.message || err.message
    });
  }
});

// Get nutrition for the whole image
router.post('/nutrition', express.json(), async (req, res) => {
  try {
    const { imageId } = req.body;
    if (!imageId) {
      return res.status(400).json({ error: 'imageId is required' });
    }

    const nutrition = await getNutritionForImage(imageId);
    
    if (!nutrition || !nutrition.nutritional_info_per_item) {
      return res.status(400).json({ 
        error: 'Invalid nutrition data received',
        details: 'Missing required nutrition information'
      });
    }

    res.json(nutrition);
  } catch (err) {
    console.error('Nutrition route error:', err.response?.data || err);
    res.status(500).json({ 
      error: 'Failed to get nutrition information',
      details: err.response?.data?.message || err.message
    });
  }
});

export default router;