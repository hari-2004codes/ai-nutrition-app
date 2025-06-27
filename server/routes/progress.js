// server/routes/progress.js
import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import {
  addProgress,
  getProgress
} from "../controllers/progressController.js";

const router = Router();

// Progress tracking
router.post("/", auth, addProgress);
router.get("/", auth, getProgress);

export default router;