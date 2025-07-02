// server/controllers/diaryController.js
import MealEntry from "../models/MealEntry.js";
import Profile from "../models/Profile.js";
import generateFoodSuggestion from "../services/generateFoodSuggestion.js";

// Helper function to generate AI suggestions for food items
const generateAndStoreSuggestions = async (mealEntry, userId) => {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.log('⚠️ GEMINI_API_KEY not configured, skipping suggestion generation');
      return mealEntry;
    }

    // Get user profile for personalized suggestions
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      console.log('⚠️ No profile found for user, skipping suggestion generation');
      return mealEntry;
    }

    // Calculate current daily intake from all meals
    const dateStr = mealEntry.date.toISOString().split('T')[0];
    const allMealsToday = await MealEntry.find({ 
      user: userId, 
      date: { 
        $gte: new Date(dateStr), 
        $lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000) 
      } 
    });

    const dailyIntake = allMealsToday
      .flatMap(meal => meal.items)
      .reduce(
        (acc, item) => ({
          calories: acc.calories + (item.calories || 0),
          protein: acc.protein + (item.protein || 0),
          carbs: acc.carbs + (item.carbs || 0),
          fat: acc.fat + (item.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

    // Prepare user profile data
    const userProfile = {
      bmr: profile.bmr,
      tdee: profile.tdee,
      age: profile.age,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
      preferences: profile.preferences,
      dailyIntake
    };

    // Generate suggestions for each item that doesn't have one
    const updatedItems = await Promise.all(
      mealEntry.items.map(async (item, index) => {
        if (item.suggestion) {
          console.log(`✅ Item ${index + 1} already has suggestion: ${item.name}`);
          return item;
        }

        try {
          console.log(`🤖 Generating suggestion for: ${item.name}`);
          
          const foodData = {
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            mealType: mealEntry.mealType
          };

          const suggestion = await generateFoodSuggestion(foodData, userProfile);
          console.log(`✅ Generated suggestion for ${item.name}:`, suggestion.healthiness);
          
          return {
            ...item,
            suggestion: {
              ...suggestion,
              generatedAt: new Date()
            }
          };
        } catch (error) {
          console.error(`❌ Failed to generate suggestion for ${item.name}:`, error.message);
          return item;
        }
      })
    );

    // Update the meal entry with suggestions
    console.log('🔄 Updating meal with generated suggestions...');
    const updatedMeal = await MealEntry.findByIdAndUpdate(
      mealEntry._id,
      { items: updatedItems },
      { new: true }
    );

    const itemsWithSuggestions = updatedItems.filter(item => item.suggestion).length;
    console.log(`✅ Successfully generated and saved suggestions for ${itemsWithSuggestions}/${updatedItems.length} items`);
    
    // Verify the suggestions were saved
    const verifyMeal = await MealEntry.findById(mealEntry._id);
    const savedSuggestions = verifyMeal.items.filter(item => item.suggestion).length;
    console.log(`🔍 Verification: ${savedSuggestions} suggestions found in database`);
    
    return updatedMeal;

  } catch (error) {
    console.error('❌ Error generating suggestions:', error.message);
    return mealEntry;
  }
};

// — Meals —
export const addMeal = async (req, res) => {
  try {
    console.log("\n🔍 ADD MEAL DEBUG:");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);
    
    // Use userId from JWT token
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(400).json({ msg: "Invalid token - no userId found" });
    }
    
    // Validate required fields
    const { date, mealType, items } = req.body;
    
    if (!date) {
      return res.status(400).json({ msg: "Date is required" });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: "Items array is required and cannot be empty" });
    }
    
    // Validate each item has required fields
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name) {
        return res.status(400).json({ msg: `Item ${i + 1}: name is required` });
      }
      
      // Convert and validate quantity
      let quantity = item.quantity;
      if (typeof quantity === 'string') {
        // Extract number from strings like "125.000g" or "125g"
        const numMatch = quantity.match(/(\d+(?:\.\d+)?)/);
        quantity = numMatch ? parseFloat(numMatch[1]) : 0;
      } else {
        quantity = Number(quantity) || 0;
      }
      
      if (quantity <= 0) {
        return res.status(400).json({ msg: `Item ${i + 1}: quantity must be greater than 0` });
      }
      
      // Convert numeric fields
      items[i] = {
        ...item,
        quantity: quantity,
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
      };
    }
    
    console.log("🔍 Creating meal entry with userId:", userId);
    
    const meal = new MealEntry({ 
      user: userId, 
      date,
      mealType,
      items
    });
    
    console.log("🔍 Meal object before save:", meal);
    
    // Save the meal first, then generate AI suggestions in the background
    const savedMeal = await meal.save();
    console.log("✅ Meal saved successfully:", savedMeal._id);

    // Return the saved meal (suggestions will be generated separately via new service)
    res.status(201).json(savedMeal);
  } catch (err) {
    console.error("❌ Add Meal Error:", err);
    console.error("Error details:", err.message);
    
    // Handle validation errors specifically
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        msg: "Validation failed", 
        errors: errors,
        details: err.message 
      });
    }
    
    res.status(500).json({ msg: "Could not log meal", error: err.message });
  }
};

export const getMeals = async (req, res) => {
  try {
    console.log("\n🔍 GET MEALS DEBUG:");
    console.log("req.user:", req.user);
    
    const userId = req.user.userId;
    
    if (!userId) {
      return res.status(400).json({ msg: "Invalid token - no userId found" });
    }
    
    console.log("🔍 Fetching meals for userId:", userId);
    
    // Get date filter if provided
    const { date } = req.query;
    let dateFilter = {};
    
    if (date) {
      // Filter by specific date
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      dateFilter = {
        date: {
          $gte: targetDate,
          $lt: nextDate
        }
      };
    }
    
    const query = { user: userId, ...dateFilter };
    console.log("🔍 Query:", query);
    
    const meals = await MealEntry.find(query)
      .sort({ date: -1, createdAt: -1 });
    
    console.log("✅ Found meals:", meals.length);
    
    // Log suggestion data for debugging
    meals.forEach(meal => {
      const itemsWithSuggestions = meal.items.filter(item => item.suggestion).length;
      console.log(`🔍 ${meal.mealType}: ${meal.items.length} items, ${itemsWithSuggestions} with suggestions`);
    });
    
    res.json(meals);
  } catch (err) {
    console.error("❌ Get Meals Error:", err);
    res.status(500).json({ msg: "Could not fetch meals", error: err.message });
  }
};

export const updateMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const userId = req.user.userId;
    
    // Verify meal belongs to user
    const meal = await MealEntry.findOne({ _id: mealId, user: userId });
    if (!meal) {
      return res.status(404).json({ msg: "Meal not found or unauthorized" });
    }
    
    // Update the meal
    const updatedMeal = await MealEntry.findByIdAndUpdate(
      mealId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    // Return the updated meal (suggestions handled by separate service)
    res.json(updatedMeal);
  } catch (err) {
    console.error("Update Meal Error:", err);
    res.status(500).json({ msg: "Could not update meal", error: err.message });
  }
};

export const deleteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const userId = req.user.userId;
    
    // Verify meal belongs to user
    const meal = await MealEntry.findOne({ _id: mealId, user: userId });
    if (!meal) {
      return res.status(404).json({ msg: "Meal not found or unauthorized" });
    }
    
    await MealEntry.findByIdAndDelete(mealId);
    res.json({ msg: "Meal deleted successfully" });
  } catch (err) {
    console.error("Delete Meal Error:", err);
    res.status(500).json({ msg: "Could not delete meal", error: err.message });
  }
};

export const getMealsByDateRange = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: "Start date and end date are required" });
    }
    
    const meals = await MealEntry.find({
      user: userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .sort({ date: -1, createdAt: -1 });
    
    res.json(meals);
  } catch (err) {
    console.error("Get Meals by Date Range Error:", err);
    res.status(500).json({ msg: "Could not fetch meals", error: err.message });
  }
};

export const deleteFoodItem = async (req, res) => {
  try {
    const { mealId, itemIndex } = req.params;
    const userId = req.user.userId;
    
    // Verify meal belongs to user
    const meal = await MealEntry.findOne({ _id: mealId, user: userId });
    if (!meal) {
      return res.status(404).json({ msg: "Meal not found or unauthorized" });
    }
    
    const index = parseInt(itemIndex);
    if (isNaN(index) || index < 0 || index >= meal.items.length) {
      return res.status(400).json({ msg: "Invalid item index" });
    }
    
    // Remove the item at the specified index
    meal.items.splice(index, 1);
    
    // If no items left, delete the entire meal
    if (meal.items.length === 0) {
      await MealEntry.findByIdAndDelete(mealId);
      return res.json({ msg: "Meal deleted (no items remaining)" });
    }
    
    // Save the updated meal
    await meal.save();
    
    res.json(meal);
  } catch (err) {
    console.error("Delete Food Item Error:", err);
    res.status(500).json({ msg: "Could not delete food item", error: err.message });
  }
};