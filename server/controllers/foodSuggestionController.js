// controllers/foodSuggestionController.js
import FoodSuggestion from '../models/FoodSuggestion.js';
import Profile from '../models/Profile.js';
import generateFoodSuggestion from '../services/generateFoodSuggestion.js';

// Get suggestion for a specific food item
export const getFoodSuggestion = async (req, res) => {
  try {
    const { foodHash } = req.params;
    const userId = req.user.userId;

    console.log('🔍 Getting suggestion for foodHash:', foodHash, 'user:', userId);

    const suggestion = await FoodSuggestion.findOne({ 
      user: userId, 
      foodHash: foodHash 
    });

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    console.log('✅ Found suggestion with status:', suggestion.status);
    res.json(suggestion);
  } catch (error) {
    console.error('❌ Error getting suggestion:', error.message);
    res.status(500).json({ error: 'Failed to get suggestion' });
  }
};

// Generate suggestion for a food item
export const generateSuggestionForFood = async (req, res) => {
  try {
    const { foodData, dailyIntake } = req.body;
    const userId = req.user.userId;

    console.log('🤖 Generating suggestion for:', foodData.name, 'user:', userId);

    // Validate input
    if (!foodData || !foodData.name) {
      return res.status(400).json({ error: 'Food data is required' });
    }

    // Generate food hash
    const foodHash = FoodSuggestion.generateFoodHash(foodData);
    
    // Check if suggestion already exists and is valid
    let existingSuggestion = await FoodSuggestion.findOne({ 
      user: userId, 
      foodHash: foodHash 
    });

    if (existingSuggestion && existingSuggestion.isValid()) {
      console.log('✅ Using existing valid suggestion');
      return res.json(existingSuggestion);
    }

    // Get user profile
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Create or update suggestion record with "generating" status
    const suggestionData = {
      user: userId,
      foodHash: foodHash,
      foodData: {
        name: foodData.name,
        quantity: foodData.quantity,
        unit: foodData.unit || 'g',
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat
      },
      userContext: {
        bmr: profile.bmr,
        tdee: profile.tdee,
        goal: profile.goal,
        activityLevel: profile.activityLevel
      },
      status: 'generating'
    };

    // Upsert suggestion record
    existingSuggestion = await FoodSuggestion.findOneAndUpdate(
      { user: userId, foodHash: foodHash },
      suggestionData,
      { upsert: true, new: true }
    );

    console.log('📝 Created suggestion record with status: generating');

    // Return immediately with generating status
    res.json(existingSuggestion);

    // Generate suggestion asynchronously
    generateSuggestionAsync(existingSuggestion._id, foodData, profile, dailyIntake);

  } catch (error) {
    console.error('❌ Error generating suggestion:', error.message);
    res.status(500).json({ error: 'Failed to generate suggestion' });
  }
};

// Async function to generate suggestion in background
async function generateSuggestionAsync(suggestionId, foodData, profile, dailyIntake) {
  try {
    console.log('🔄 Starting async suggestion generation for ID:', suggestionId);

    // Prepare user profile data
    const userProfile = {
      bmr: profile.bmr,
      tdee: profile.tdee,
      age: profile.age,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      preferences: profile.preferences,
      dailyIntake: dailyIntake || { calories: 0, protein: 0, carbs: 0, fat: 0 }
    };

    // Generate suggestion using Gemini AI
    const suggestion = await generateFoodSuggestion(foodData, userProfile);
    
    console.log('✅ AI suggestion generated successfully');

    // Update suggestion record with completed data
    await FoodSuggestion.findByIdAndUpdate(suggestionId, {
      suggestion: {
        ...suggestion,
        generatedAt: new Date()
      },
      status: 'completed'
    });

    console.log('✅ Suggestion saved to database');

  } catch (error) {
    console.error('❌ Async suggestion generation failed:', error.message);
    
    // Update suggestion record with error status
    await FoodSuggestion.findByIdAndUpdate(suggestionId, {
      status: 'failed',
      error: error.message
    });
  }
}

// Get all suggestions for a user (for debugging/admin)
export const getUserSuggestions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const suggestions = await FoodSuggestion.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(suggestions);
  } catch (error) {
    console.error('❌ Error getting user suggestions:', error.message);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
};

// Delete suggestion (for cache invalidation)
export const deleteFoodSuggestion = async (req, res) => {
  try {
    const { foodHash } = req.params;
    const userId = req.user.userId;

    await FoodSuggestion.deleteOne({ user: userId, foodHash: foodHash });
    
    console.log('🗑️ Deleted suggestion for foodHash:', foodHash);
    res.json({ message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting suggestion:', error.message);
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
};
