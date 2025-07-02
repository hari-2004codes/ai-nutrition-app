// server/index.js
import express from 'express';
import dotenv from 'dotenv';
// IMPORTANT: dotenv.config() should be called as early as possible
dotenv.config();
console.log("Environment check:");
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("JWT_SECRET value:", process.env.JWT_SECRET);
console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);

import cors from 'cors';
import connectDB from "./config/db.js"; // This should be your DB connection function
import listEndpoints from 'express-list-endpoints'; // For debugging routes

// Import your route files
import mealsRouter from './routes/meals.js';
import mealplansRouter from './routes/mealplans.js';
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import diaryRoutes from './routes/diary.js';
import progressRoutes from './routes/progress.js';
import foodSuggestionsRouter from './routes/foodSuggestions.js';
import fatSecretRouter from './routes/fatsecret.js';
import testRouter from './routes/test.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Allow CORS for development and production
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'https://ai-nutrition-app-avgx.onrender.com',
    // Add any other Render URLs you might have
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove undefined values
  credentials: true
}));

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to the database
await connectDB();

// Basic health check route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Mount API routes
app.use('/api/meals', mealsRouter);
app.use('/api/mealplans', mealplansRouter);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/diary", diaryRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/food-suggestions', foodSuggestionsRouter);
app.use('/api/fatsecret', fatSecretRouter);
app.use('/api/test', testRouter);

import path from 'path';
app.use(express.static(path.join(process.cwd(), '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), '../dist/index.html'));
});

// List all registered routes
console.log("\nRegistered routes:");
const endpoints = listEndpoints(app);
console.table(endpoints.map(e => ({
    method: e.methods.join(","),
    path: e.path
})));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Start the server
app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
