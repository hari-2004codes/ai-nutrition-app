// server/routes/diary.js
import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import {
  addMeal,
  getMeals,
  
} from "../controllers/diaryController.js";

const router = Router();

// Meals
router.post("/meals", auth, addMeal);
router.get("/meals", auth, getMeals);


export default router;