import express from 'express';
import generateMealPlan from '../services/generateMealPlan.js'; // Your service to call Groq
import { 
  getUserMealPlans, 
  getMealPlan, 
  generateDefaultMealPlans, 
  generateCustomMealPlan, 
  updateMealPlan, 
  deleteMealPlan 
} from '../controllers/mealPlanController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all meal plans for a user
router.get('/', auth, getUserMealPlans);

// Get a specific meal plan
router.get('/:id', auth, getMealPlan);

// Generate personalized meal plans (called once during onboarding)
// router.post('/generate-personalized', auth, generatePersonalizedMealPlans);

// Generate default meal plans
router.post('/generate-default', auth, generateDefaultMealPlans);

// Generate custom meal plan
router.post('/generate-custom', auth, generateCustomMealPlan);

// Update meal plan
router.put('/:id', auth, updateMealPlan);

// Delete meal plan
router.delete('/:id', auth, deleteMealPlan);

// Create meal plan (legacy endpoint for backward compatibility)
router.post('/generate', express.json(), async (req, res, next) => {
  try {
    console.log('Received request body:', req.body);
    const formData = req.body;
    
    // Basic validation
    const required = ['duration', 'calories', 'diet', 'mealTypes'];
    const missing = [];
    
    for (const field of required) {
      if (formData[field] == null || formData[field] === '') {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Missing required fields: ${missing.join(', ')}`,
        error: { 
          code: 400, 
          details: `The following fields are required: ${missing.join(', ')}`,
          missingFields: missing
        }
      });
    }

    // Additional validation
    if (formData.duration <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Duration must be a positive number',
        error: { code: 400, details: 'Duration must be greater than 0' }
      });
    }

    if (formData.calories <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Calories must be a positive number',
        error: { code: 400, details: 'Calories must be greater than 0' }
      });
    }

    if (!Array.isArray(formData.mealTypes) || formData.mealTypes.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Meal types must be a non-empty array',
        error: { code: 400, details: 'At least one meal type must be specified' }
      });
    }

    console.log('Validation passed, generating meal plan...');
    const mealPlan = await generateMealPlan(formData);
    
    res.json({ 
      status: 'success', 
      data: mealPlan,
      message: 'Meal plan generated successfully'
    });
  } catch (err) {
    console.error('Error generating meal plan:', err);
    next(err);
  }
});

export default router;