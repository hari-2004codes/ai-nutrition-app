import MealPlan from '../models/MealPlan.js';
import Profile from '../models/Profile.js';
import generateMealPlan from '../services/generateMealPlan.js';
import { calculateMacroTargets } from '../utils/calculations.js';

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

// Generate 6 default meal plans based on user profile
export const generateDefaultMealPlans = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user profile
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found. Please complete onboarding first.'
      });
    }

    // Calculate target calories based on goal
    const macroTargets = calculateMacroTargets(profile.tdee, profile.goal);
    const targetCalories = macroTargets.calories;

    // Check if user already has default meal plans
    const existingDefaultPlans = await MealPlan.find({ 
      user: userId, 
      planType: 'default',
      isActive: true 
    });

    if (existingDefaultPlans.length >= 6) {
      return res.json({
        success: true,
        message: 'Default meal plans already exist',
        data: existingDefaultPlans
      });
    }

    // Define 6 different meal plan types based on user preferences
    const planTypes = getPlanTypesForUser(profile);

    const generatedPlans = [];

    for (const planType of planTypes) {
      try {
        // Generate meal plan using AI
        const formData = {
          duration: 7,
          calories: targetCalories,
          diet: planType.cuisine,
          mealTypes: ['breakfast', 'lunch', 'dinner'],
          difficulty: planType.difficulty,
          prepTime: 30,
          ingredients: '10',
          exclude: [],
          intolerances: getDietaryRestrictions(profile.preferences)
        };

        let aiGeneratedPlan;
        try {
          aiGeneratedPlan = await generateMealPlan(formData);
        } catch (aiError) {
          console.error(`AI generation failed for ${planType.name}:`, aiError);
          // Use fallback meal plan data
          aiGeneratedPlan = getFallbackMealPlan(planType, targetCalories);
        }

        // Create meal plan document
        const mealPlan = new MealPlan({
          user: userId,
          name: planType.name,
          description: planType.description,
          duration: 7,
          targetCalories: targetCalories,
          cuisine: planType.cuisine,
          dietaryRestrictions: formData.intolerances,
          mealTypes: formData.mealTypes,
          difficulty: planType.difficulty,
          prepTime: 30,
          maxIngredients: '10',
          days: aiGeneratedPlan,
          tags: planType.tags,
          planType: 'default',
          isGenerated: true,
          rating: planType.rating || 4.5
        });

        // Calculate totals
        mealPlan.calculateTotals();
        await mealPlan.save();

        generatedPlans.push(mealPlan);
      } catch (error) {
        console.error(`Error generating plan ${planType.name}:`, error);
        // Continue with other plans even if one fails
      }
    }

    res.json({
      success: true,
      message: `Generated ${generatedPlans.length} meal plans`,
      data: generatedPlans
    });

  } catch (error) {
    console.error('Error generating default meal plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate default meal plans'
    });
  }
};

// Helper function to get plan types based on user preferences
function getPlanTypesForUser(profile) {
  const basePlans = [
    {
      name: 'Balanced Indian Diet',
      description: 'A well-balanced Indian meal plan with traditional dishes',
      cuisine: 'vegetarian',
      difficulty: 'moderate',
      tags: ['Balanced', 'Traditional', 'Indian'],
      rating: 4.5
    },
    {
      name: 'Quick & Easy',
      description: 'Simple and quick Indian recipes for busy lifestyles',
      cuisine: 'vegetarian',
      difficulty: 'easy',
      tags: ['Quick', 'Easy', 'Simple'],
      rating: 4.3
    },
    {
      name: 'South Indian Special',
      description: 'Authentic South Indian cuisine with rice and lentils',
      cuisine: 'south-indian',
      difficulty: 'moderate',
      tags: ['South Indian', 'Authentic', 'Traditional'],
      rating: 4.6
    },
    {
      name: 'North Indian Delights',
      description: 'Rich and flavorful North Indian dishes',
      cuisine: 'north-indian',
      difficulty: 'advanced',
      tags: ['North Indian', 'Rich', 'Flavorful'],
      rating: 4.4
    },
    {
      name: 'Healthy & Light',
      description: 'Light and nutritious Indian meals',
      cuisine: 'vegetarian',
      difficulty: 'easy',
      tags: ['Healthy', 'Light', 'Nutritious'],
      rating: 4.2
    },
    {
      name: 'Protein Rich',
      description: 'High-protein Indian meals for fitness goals',
      cuisine: 'non-vegetarian',
      difficulty: 'moderate',
      tags: ['Protein', 'Fitness', 'Muscle Building'],
      rating: 4.4
    }
  ];

  // Customize plans based on user preferences
  const customizedPlans = basePlans.map(plan => {
    let customizedPlan = { ...plan };

    // Adjust based on dietary preferences
    if (profile.preferences === 'vegan') {
      if (plan.cuisine === 'non-vegetarian') {
        customizedPlan.cuisine = 'vegan';
        customizedPlan.name = 'Vegan Protein Rich';
        customizedPlan.description = 'High-protein vegan Indian meals';
        customizedPlan.tags = ['Vegan', 'Protein', 'Plant-based'];
      }
    } else if (profile.preferences === 'keto') {
      customizedPlan.name = `Keto ${plan.name}`;
      customizedPlan.description = `Low-carb version of ${plan.description}`;
      customizedPlan.tags = ['Keto', 'Low-Carb', ...plan.tags];
    } else if (profile.preferences === 'mediterranean') {
      customizedPlan.name = `Mediterranean ${plan.name}`;
      customizedPlan.description = `Mediterranean-style ${plan.description}`;
      customizedPlan.tags = ['Mediterranean', 'Healthy', ...plan.tags];
    }

    // Adjust based on goals
    if (profile.goal === 'lose') {
      customizedPlan.name = `Weight Loss ${plan.name}`;
      customizedPlan.description = `Low-calorie version of ${plan.description}`;
      customizedPlan.tags = ['Weight Loss', 'Low Calorie', ...plan.tags];
    } else if (profile.goal === 'gain') {
      customizedPlan.name = `Muscle Building ${plan.name}`;
      customizedPlan.description = `High-protein version of ${plan.description}`;
      customizedPlan.tags = ['Muscle Building', 'High Protein', ...plan.tags];
    }

    return customizedPlan;
  });

  return customizedPlans;
}

// Helper function to get dietary restrictions
function getDietaryRestrictions(preferences) {
  const restrictions = [];
  
  if (preferences === 'gluten-free') {
    restrictions.push('gluten-free');
  } else if (preferences === 'lactose-free') {
    restrictions.push('lactose-free');
  } else if (preferences === 'vegan') {
    restrictions.push('vegan');
  }

  return restrictions;
}

// Fallback meal plan data in case AI generation fails
function getFallbackMealPlan(planType, targetCalories) {
  const dailyCalories = Math.round(targetCalories / 7);
  const mealCalories = Math.round(dailyCalories / 3);

  return Array.from({ length: 7 }, (_, dayIndex) => ({
    day: dayIndex + 1,
    meals: [
      {
        mealType: 'breakfast',
        name: `${planType.name} Breakfast`,
        description: 'A nutritious breakfast to start your day',
        calories: mealCalories,
        prepTime: '15 minutes',
        recipe: {
          ingredients: ['Oats', 'Milk', 'Honey', 'Nuts'],
          instructions: ['Mix oats with milk', 'Add honey and nuts', 'Serve warm']
        }
      },
      {
        mealType: 'lunch',
        name: `${planType.name} Lunch`,
        description: 'A balanced lunch meal',
        calories: mealCalories,
        prepTime: '30 minutes',
        recipe: {
          ingredients: ['Rice', 'Dal', 'Vegetables', 'Spices'],
          instructions: ['Cook rice', 'Prepare dal', 'Add vegetables and spices']
        }
      },
      {
        mealType: 'dinner',
        name: `${planType.name} Dinner`,
        description: 'A light and healthy dinner',
        calories: mealCalories,
        prepTime: '25 minutes',
        recipe: {
          ingredients: ['Roti', 'Sabzi', 'Curd', 'Salad'],
          instructions: ['Make rotis', 'Prepare sabzi', 'Serve with curd and salad']
        }
      }
    ]
  }));
}

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

    // Generate meal plan using AI
    const aiGeneratedPlan = await generateMealPlan(formData);

    // Create meal plan document
    const mealPlan = new MealPlan({
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
      days: aiGeneratedPlan,
      tags: formData.tags || ['Custom', 'AI Generated'],
      planType: 'custom',
      isGenerated: true,
      isCustom: true
    });

    // Calculate totals
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

// Update meal plan
export const updateMealPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updates = req.body;

    const mealPlan = await MealPlan.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Meal plan updated successfully',
      data: mealPlan
    });

  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meal plan'
    });
  }
};

// Delete meal plan (soft delete)
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