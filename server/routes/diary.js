import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import {
  addMeal,
  getMeals,
  updateMeal,
  deleteMeal,
  getMealsByDateRange
} from "../controllers/diaryController.js";

const router = Router();

// Meal routes
router.post("/meals", auth, addMeal);
router.get("/meals", auth, getMeals);
router.get("/meals/range", auth, getMealsByDateRange);
router.put("/meals/:mealId", auth, updateMeal);
router.delete("/meals/:mealId", auth, deleteMeal);

export default router;