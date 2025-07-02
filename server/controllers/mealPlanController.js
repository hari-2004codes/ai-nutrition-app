import MealPlan from '../models/MealPlan.js';
import generateMealPlan from '../services/generateMealPlan.js';

// Get all meal plans for a user
export const getUserMealPlans = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const mealPlans = await MealPlan.find({ 
      user: userId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: mealPlans
    });
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal plans'
    });
  }
};

// Get a specific meal plan
export const getMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const mealPlan = await MealPlan.findOne({
      _id: id,
      user: userId,
      isActive: true
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found'
      });
    }

    res.json({
      success: true,
      data: mealPlan
    });
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal plan'
    });
  }
};

// Generate custom meal plan
export const generateCustomMealPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const formData = req.body;

    // Validate required fields
    const required = ['name', 'duration', 'calories', 'diet', 'mealTypes'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    let aiGeneratedPlan;
    try {
      // Generate meal plan using AI
      aiGeneratedPlan = await generateMealPlan(formData);
    } catch (aiError) {
      console.error('AI generation failed:', aiError);
      // Use a simple fallback
      aiGeneratedPlan = createFallbackPlan(formData);
    }

    // Map AI data to database schema
    const mappedDays = mapAIMealPlanToSchema(aiGeneratedPlan);
    
    const mealPlanData = {
      user: userId,
      name: formData.name,
      description: formData.description || 'Custom AI-generated meal plan',
      duration: formData.duration,
      targetCalories: formData.calories,
      cuisine: formData.diet,
      dietaryRestrictions: formData.intolerances || [],
      excludedIngredients: formData.exclude || [],
      mealTypes: formData.mealTypes,
      difficulty: formData.difficulty || 'moderate',
      prepTime: formData.prepTime || 30,
      maxIngredients: formData.ingredients || '10',
      days: mappedDays,
      tags: formData.tags || ['Custom', 'AI Generated'],
      planType: 'custom',
      isGenerated: true,
      isCustom: true
    };

    // Validate and coerce enum values
    coerceMealPlanEnums(mealPlanData);

    const mealPlan = new MealPlan(mealPlanData);
    mealPlan.calculateTotals();
    await mealPlan.save();

    res.json({
      success: true,
      message: 'Custom meal plan generated successfully',
      data: mealPlan
    });

  } catch (error) {
    console.error('Error generating custom meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate custom meal plan'
    });
  }
};

// Save a sample/placeholder meal plan for user
export const saveSampleMealPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planData, planName, planDescription } = req.body;

    if (!planData || !Array.isArray(planData)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan data provided'
      });
    }

    // Map placeholder data to database schema
    const mappedDays = mapPlaceholderToSchema(planData);
    
    const mealPlanData = {
      user: userId,
      name: planName || 'Sample Meal Plan',
      description: planDescription || 'A curated sample meal plan',
      duration: planData.length,
      targetCalories: calculateTotalCalories(planData),
      cuisine: 'vegetarian', // Default, can be inferred from plan data
      mealTypes: ['breakfast', 'lunch', 'dinner'],
      difficulty: 'moderate',
      prepTime: 30,
      maxIngredients: '10',
      days: mappedDays,
      tags: ['Sample', 'Curated'],
      planType: 'default',
      isGenerated: false,
      isCustom: false
    };

    const mealPlan = new MealPlan(mealPlanData);
    mealPlan.calculateTotals();
    await mealPlan.save();

    res.json({
      success: true,
      message: 'Sample meal plan saved successfully',
      data: mealPlan
    });

  } catch (error) {
    console.error('Error saving sample meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save sample meal plan'
    });
  }
};

// Delete meal plan
export const deleteMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const mealPlan = await MealPlan.findOneAndUpdate(
      { _id: id, user: userId },
      { isActive: false },
      { new: true }
    );

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meal plan'
    });
  }
};

// Helper functions
function createFallbackPlan(formData) {
  const mealCalories = Math.round(formData.calories / formData.mealTypes.length);
  
  return Array.from({ length: formData.duration }, (_, dayIndex) => ({
    day: dayIndex + 1,
    meals: formData.mealTypes.map(mealType => ({
      mealType,
      name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Meal`,
      description: `A nutritious ${mealType} meal`,
      calories: mealCalories,
      prepTime: '30 minutes',
      recipe: {
        ingredients: ['Basic ingredients based on preferences'],
        instructions: ['Follow standard cooking instructions']
      }
    }))
  }));
}

function mapAIMealPlanToSchema(aiPlan) {
  return aiPlan.map(day => {
    const mealsObj = {};
    if (Array.isArray(day.meals)) {
      day.meals.forEach(meal => {
        if (meal && meal.mealType) {
          mealsObj[meal.mealType] = {
            name: meal.name,
            description: meal.description,
            calories: meal.calories,
            prepTime: parseInt(meal.prepTime) || 30,
            ingredients: (meal.recipe && meal.recipe.ingredients)
              ? meal.recipe.ingredients.map(i => ({ name: typeof i === 'string' ? i : i.name || 'Unknown', amount: '', unit: '' }))
              : [],
            instructions: (meal.recipe && meal.recipe.instructions) ? meal.recipe.instructions : []
          };
        }
      });
    }
    return {
      day: day.day,
      meals: mealsObj
    };
  });
}

function mapPlaceholderToSchema(planData) {
  return planData.map(day => {
    const mealsObj = {};
    if (Array.isArray(day.meals)) {
      day.meals.forEach(meal => {
        if (meal && meal.mealType) {
          mealsObj[meal.mealType] = {
            name: meal.name,
            description: meal.description,
            calories: meal.calories,
            prepTime: parseInt(meal.prepTime) || 30,
            ingredients: (meal.recipe && meal.recipe.ingredients)
              ? meal.recipe.ingredients.map(i => ({ name: typeof i === 'string' ? i : i.name || i, amount: '', unit: '' }))
              : [],
            instructions: (meal.recipe && meal.recipe.instructions) ? meal.recipe.instructions : []
          };
        }
      });
    }
    return {
      day: day.day,
      meals: mealsObj
    };
  });
}

function calculateTotalCalories(planData) {
  return planData.reduce((total, day) => {
    return total + day.meals.reduce((dayTotal, meal) => dayTotal + (meal.calories || 0), 0);
  }, 0) / planData.length; // Average daily calories
}

// Utility: Coerce and validate enum fields for MealPlan
function coerceMealPlanEnums(planData) {
  // Coerce maxIngredients to string and validate
  if (planData.maxIngredients != null) {
    planData.maxIngredients = String(planData.maxIngredients);
    const allowed = ['5', '8', '10', '15', 'unlimited'];
    if (!allowed.includes(planData.maxIngredients)) {
      throw new Error(`maxIngredients: ${planData.maxIngredients} is not a valid value`);
    }
  }
  
  // Coerce difficulty
  if (planData.difficulty) {
    planData.difficulty = String(planData.difficulty).toLowerCase();
    const allowed = ['easy', 'moderate', 'advanced'];
    if (!allowed.includes(planData.difficulty)) {
      throw new Error(`difficulty: ${planData.difficulty} is not a valid value`);
    }
  }
  
  // Coerce cuisine
  if (planData.cuisine) {
    planData.cuisine = String(planData.cuisine).toLowerCase();
    const allowedCuisines = ['vegetarian', 'non-vegetarian', 'vegan', 'jain', 'south-indian', 'north-indian', 'gujarati', 'punjabi'];
    if (!allowedCuisines.includes(planData.cuisine)) {
      // Default to vegetarian if invalid
      planData.cuisine = 'vegetarian';
    }
  }
  
  // Coerce mealTypes - normalize case
  if (planData.mealTypes && Array.isArray(planData.mealTypes)) {
    planData.mealTypes = planData.mealTypes.map(mt => String(mt).toLowerCase());
    const allowed = ['breakfast', 'lunch', 'dinner', 'evening-snack'];
    for (const mt of planData.mealTypes) {
      if (!allowed.includes(mt)) {
        throw new Error(`mealType: ${mt} is not a valid value. Allowed: ${allowed.join(', ')}`);
      }
    }
  }
  
  return planData;
}
