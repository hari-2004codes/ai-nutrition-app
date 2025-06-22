// routes/foodRoutes.js
import express from 'express';
import { 
  addFoodItem, 
  getFoodItems, 
  getFoodItemById, 
  updateFoodItem, 
  deleteFoodItem 
} from '../controllers/foodController.js';
import auth from '../middleware/authMiddleware.js'; // Import the default export

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// GET /api/food - Get all food items (with search and pagination)
// Query params: ?search=banana&page=1&limit=20
router.get('/', getFoodItems);

// GET /api/food/:id - Get specific food item by ID
router.get('/:id', getFoodItemById);

// POST /api/food - Create new food item
router.post('/', addFoodItem);

// PUT /api/food/:id - Update food item
router.put('/:id', updateFoodItem);

// DELETE /api/food/:id - Delete food item
router.delete('/:id', deleteFoodItem);

export default router;