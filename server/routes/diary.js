import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import {
  addMeal,
  getMeals,
  updateMeal,
  deleteMeal,
  getMealsByDateRange,
  deleteFoodItem
} from "../controllers/diaryController.js";

const router = Router();

// Meal routes - order matters! More specific routes first
router.post("/meals", auth, addMeal);
router.get("/meals", auth, getMeals);
router.get("/meals/range", auth, getMealsByDateRange);
router.delete("/meals/:mealId/items/:itemIndex", auth, deleteFoodItem); // More specific route first
router.put("/meals/:mealId", auth, updateMeal);
router.delete("/meals/:mealId", auth, deleteMeal);

export default router;