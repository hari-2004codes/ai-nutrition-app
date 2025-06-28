// routes/diaryRoutes.js
import express from 'express';
import { 
  addMealEntry, 
  getMealEntriesByDate, 
  updateMealEntry, 
  deleteMealEntry,
  getDailyNutritionSummary 
} from '../controllers/diaryController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// POST /api/diary/meal - Add food item to meal
router.post('/meal', addMealEntry);

// GET /api/diary/:date - Get all meal entries for a specific date
// Format: YYYY-MM-DD
router.get('/:date', getMealEntriesByDate);

// PUT /api/diary/meal/:id - Update meal entry
router.put('/meal/:id', updateMealEntry);

// DELETE /api/diary/meal/:id - Delete meal entry
router.delete('/meal/:id', deleteMealEntry);

// GET /api/diary/:date/summary - Get daily nutrition summary
router.get('/:date/summary', getDailyNutritionSummary);

export default router;