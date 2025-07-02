import express from 'express';
import { searchFoods } from '../services/fatSecretApi.js';

const router = express.Router();

// Test endpoint to verify API configurations
router.get('/api-status', async (req, res) => {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    apis: {
      logmeal: {
        configured: !!process.env.LOGMEAL_API_KEY,
        key_prefix: process.env.LOGMEAL_API_KEY ? process.env.LOGMEAL_API_KEY.substring(0, 8) + '...' : 'Not set'
      },
      fatsecret: {
        configured: !!(process.env.FATSECRET_API_KEY && process.env.FATSECRET_API_SECRET),
        key_prefix: process.env.FATSECRET_API_KEY ? process.env.FATSECRET_API_KEY.substring(0, 8) + '...' : 'Not set',
        secret_prefix: process.env.FATSECRET_API_SECRET ? process.env.FATSECRET_API_SECRET.substring(0, 8) + '...' : 'Not set'
      },
      gemini: {
        configured: !!process.env.GEMINI_API_KEY,
        key_prefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + '...' : 'Not set'
      },
      mongodb: {
        configured: !!process.env.MONGO_URI,
        connection_prefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 20) + '...' : 'Not set'
      }
    }
  };

  res.json(status);
});

// Test FatSecret API connection
router.get('/test-fatsecret', async (req, res) => {
  try {
    if (!process.env.FATSECRET_API_KEY || !process.env.FATSECRET_API_SECRET) {
      return res.status(500).json({
        error: 'FatSecret API credentials not configured',
        message: 'Please set FATSECRET_API_KEY and FATSECRET_API_SECRET environment variables'
      });
    }

    console.log('Testing FatSecret API with search term: apple');
    const results = await searchFoods('apple');
    
    res.json({
      success: true,
      message: 'FatSecret API is working correctly',
      resultsCount: results.length,
      sampleResult: results[0] || null
    });
  } catch (error) {
    console.error('FatSecret test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

export default router;
