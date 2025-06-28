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
    
    if (!result.segmentation_results || result.segmentation_results.length === 0) {
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
    const { imageId, items } = req.body;
    const confirmed = await confirmMultipleDishes(imageId, items);
    res.json(confirmed);
  } catch (err) {
    next(err);
  }
});

// router.get('/dishes/:dishId/image', async (req, res) => {
//   try {
//     const dishId = req.params.dishId;
//     const metadata = await getDishMetadata(dishId);
    
//     if (metadata?.imageUrl) {
//       return res.json({ imageUrl: metadata.imageUrl });
//     }
    
//     // Fallback to generic food image
//     res.json({ imageUrl: null });
//   } catch (error) {
//     console.error('Dish image error:', error);
//     res.json({ imageUrl: null });
//   }
// });

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
    res.status(500).json({
      error: 'Failed to get nutrition information',
      details: err.message,
    });
  }
});

export default router;