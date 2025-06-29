// routes/auth.js
import { Router } from "express";
import { signup, login } from "../controllers/authController.js";
import { firebaseAuth } from '../controllers/firebaseController.js'; 
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post('/firebase', firebaseAuth);  

export default router;
