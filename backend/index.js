// app.js or server.js - Add this to your main server file
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mealRouter from './routes/meal.js'; // Import the meal router
// ... other imports

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Existing routes (keep these)
// app.use('/api/recognition', recognitionRouter); // Your existing router

// Add the new meal router
app.use('/api/meal', mealRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// 404 handler with better route info
app.use('*', (req, res) => {
  const availableRoutes = [
    'GET /',
    'GET /api/recognition/health',
    'POST /api/recognition/test', 
    'POST /api/recognition/upload-test',
    'POST /api/recognition/plate',
    // Add the new meal routes
    'GET /api/meal/dishes',
    'POST /api/meal/segment',
    'GET /api/meal/segment/:imageId/alternatives/:position',
    'POST /api/meal/confirm',
    'PATCH /api/meal/confirm/:imageId/:position/quantity',
    'POST /api/meal/nutrition',
    'GET /api/meal/analysis/:imageId'
  ];
  
  res.status(404).json({
    error: 'Route not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available routes:`);
  console.log(`  - GET http://localhost:${PORT}/api/recognition/health`);
  console.log(`  - POST http://localhost:${PORT}/api/recognition/plate`);
  console.log(`  - POST http://localhost:${PORT}/api/meal/segment`);
  console.log(`  - GET http://localhost:${PORT}/api/meal/dishes`);
});

export default app;