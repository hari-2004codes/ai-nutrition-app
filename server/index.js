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
import foodRoutes from './routes/foodRoutes.js';


const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files from previews directory
// app.use('/previews', express.static(path.join(process.cwd(), 'previews')));

// Allow CORS for your React dev server
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware for parsing request bodies (MUST come before routes that use req.body)
app.use(express.json()); // Parses JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded payloads
// Mount our meals API under /api/meals
app.use('/api/meals', mealsRouter);
app.use('/api/mealplans', mealplansRouter);

// Basic health check
// Connect to the database - rely on connectDB from db.js
await connectDB(); // This will connect and log inside db.js


// --- Define all your routes and middleware HERE ---

// Basic health check route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// !!! DIAGNOSTIC ROUTE - CHECK IF THIS APPEARS IN THE LIST !!!
app.get('/__test_route', (req, res) => {
  res.status(200).send('Diagnostic route working!');
});
// !!! END DIAGNOSTIC ROUTE !!!


// Mount your API routes
// Ensure mealsRouter, authRoutes, profileRoutes are actual Express Router instances
app.use('/api/meals', mealsRouter);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/diary",diaryRoutes);
app.use('/api/progress',progressRoutes);
app.use('/api/food', foodRoutes);

// --- Now, list the endpoints (after they've been defined) ---
console.log("Registered routes:");
const endpoints = listEndpoints(app);
// console.log("Raw endpoints array:", JSON.stringify(endpoints, null, 2)); // Uncomment for more detailed raw output
console.table(endpoints.map(e => ({
    method: e.methods.join(","),
    path:   e.path
})));


// Central error handler (MUST be the last middleware)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full stack trace for better debugging
  res.status(500).json({ error: err.message || "Internal Server Error" });
});


// Start the server
app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
