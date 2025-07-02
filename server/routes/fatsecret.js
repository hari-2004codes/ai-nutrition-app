import express from 'express';
import { searchFoods, getFoodDetails, parseNutritionData } from '../services/fatSecretApi.js';

const router = express.Router();

// Search foods
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }

    console.log('FatSecret search request for:', q);
    
    const foods = await searchFoods(q);
    
    console.log('FatSecret search results:', foods.length, 'foods found');
    
    res.json({
      success: true,
      data: foods
    });
  } catch (error) {
    console.error('FatSecret search error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get food details
router.get('/food/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        error: 'Food ID is required' 
      });
    }

    console.log('FatSecret food details request for ID:', id);
    
    const foodData = await getFoodDetails(id);
    const parsedData = parseNutritionData(foodData);
    
    if (!parsedData) {
      return res.status(404).json({
        success: false,
        error: 'Could not parse food data'
      });
    }
    
    console.log('FatSecret food details found for:', parsedData.name);
    
    res.json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    console.error('FatSecret food details error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
