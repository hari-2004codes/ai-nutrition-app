// routes/foodSuggestions.js
import express from 'express';
import auth from '../middleware/authMiddleware.js';
import {
  getFoodSuggestion,
  generateSuggestionForFood,
  getUserSuggestions,
  deleteFoodSuggestion
} from '../controllers/foodSuggestionController.js';

const router = express.Router();

// Get suggestion for specific food hash
router.get('/:foodHash', auth, getFoodSuggestion);

// Generate new suggestion for food item
router.post('/generate', auth, express.json(), generateSuggestionForFood);

// Get all suggestions for user (debugging)
router.get('/', auth, getUserSuggestions);

// Delete specific suggestion
router.delete('/:foodHash', auth, deleteFoodSuggestion);

export default router;
