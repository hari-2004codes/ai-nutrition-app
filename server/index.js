import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mealsRouter from './routes/meals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Allow calls from your React dev server (usually http://localhost:3000)
app.use(cors({ origin: 'http://localhost:3000' }));

// Mount our meals API under /api/meals
app.use('/api/meals', mealsRouter);

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
