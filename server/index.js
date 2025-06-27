import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mealsRouter from './routes/meals.js';
import mealplansRouter from './routes/mealplans.js';
//import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Serve static files from previews directory
// app.use('/previews', express.static(path.join(process.cwd(), 'previews')));

// Allow calls from your React dev server
app.use(cors({ origin: 'http://localhost:5173' }));


app.use('/api/meals', mealsRouter);
app.use('/api/mealplans', mealplansRouter);

// Basic health check
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
