// controllers/diaryController.js
import DiaryEntry from '../models/DiaryEntry.js';

// Add meal entry
export const addMealEntry = async (req, res) => {
  try {
    const { 
      date, 
      mealType, 
      foodName, 
      brand,
      quantity, 
      unit, 
      calories, 
      protein, 
      carbs, 
      fat,
      fiber,
      sugar,
      sodium,
      dailyIntakeReference,
      source 
    } = req.body;

    // Validate required fields
    if (!date || !mealType || !foodName || quantity === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: date, mealType, foodName, quantity' 
      });
    }

    // Create diary entry with all data stored directly
    const diaryEntry = new DiaryEntry({
      userId: req.user.id, // From auth middleware
      foodName: foodName.trim(),
      brand: brand || '',
      mealType,
      quantity,
      unit: unit || 'g',
      date: new Date(date),
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fiber: fiber || 0,
      sugar: sugar || 0,
      sodium: sodium || 0,
      dailyIntakeReference: {
        calories: dailyIntakeReference?.calories || 'NONE',
        protein: dailyIntakeReference?.protein || 'NONE',
        carbs: dailyIntakeReference?.carbs || 'NONE',
        fat: dailyIntakeReference?.fat || 'NONE'
      },
      source: source || 'manual'
    });

    await diaryEntry.save();

    res.status(201).json({
      _id: diaryEntry._id,
      foodName: diaryEntry.foodName,
      brand: diaryEntry.brand,
      mealType: diaryEntry.mealType,
      quantity: diaryEntry.quantity,
      unit: diaryEntry.unit,
      date: diaryEntry.date,
      calories: diaryEntry.calories,
      protein: diaryEntry.protein,
      carbs: diaryEntry.carbs,
      fat: diaryEntry.fat,
      fiber: diaryEntry.fiber,
      sugar: diaryEntry.sugar,
      sodium: diaryEntry.sodium,
      dailyIntakeReference: diaryEntry.dailyIntakeReference,
      source: diaryEntry.source,
      createdAt: diaryEntry.createdAt
    });

  } catch (error) {
    console.error('Error adding meal entry:', error);
    res.status(500).json({ error: 'Failed to add meal entry' });
  }
};

// Get meal entries by date
export const getMealEntriesByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    // Parse date and create date range for the entire day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const entries = await DiaryEntry.find({
      userId: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: 1 });

    res.json(entries);

  } catch (error) {
    console.error('Error fetching meal entries:', error);
    res.status(500).json({ error: 'Failed to fetch meal entries' });
  }
};

// Update meal entry
export const updateMealEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const diaryEntry = await DiaryEntry.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!diaryEntry) {
      return res.status(404).json({ error: 'Meal entry not found' });
    }

    res.json(diaryEntry);

  } catch (error) {
    console.error('Error updating meal entry:', error);
    res.status(500).json({ error: 'Failed to update meal entry' });
  }
};

// Delete meal entry
export const deleteMealEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const diaryEntry = await DiaryEntry.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!diaryEntry) {
      return res.status(404).json({ error: 'Meal entry not found' });
    }

    res.json({ message: 'Meal entry deleted successfully' });

  } catch (error) {
    console.error('Error deleting meal entry:', error);
    res.status(500).json({ error: 'Failed to delete meal entry' });
  }
};

// Get daily nutrition summary
export const getDailyNutritionSummary = async (req, res) => {
  try {
    const { date } = req.params;
    
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Aggregate nutrition data by meal type
    const summary = await DiaryEntry.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$mealType',
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFat: { $sum: '$fat' },
          totalFiber: { $sum: '$fiber' },
          totalSugar: { $sum: '$sugar' },
          totalSodium: { $sum: '$sodium' },
          itemCount: { $sum: 1 }
        }
      }
    ]);

    // Calculate daily totals
    const dailyTotals = summary.reduce((totals, mealSummary) => ({
      calories: totals.calories + mealSummary.totalCalories,
      protein: totals.protein + mealSummary.totalProtein,
      carbs: totals.carbs + mealSummary.totalCarbs,
      fat: totals.fat + mealSummary.totalFat,
      fiber: totals.fiber + mealSummary.totalFiber,
      sugar: totals.sugar + mealSummary.totalSugar,
      sodium: totals.sodium + mealSummary.totalSodium,
      totalItems: totals.totalItems + mealSummary.itemCount
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      totalItems: 0
    });

    // Format meal summaries
    const mealSummaries = {};
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
      const mealData = summary.find(s => s._id === mealType);
      mealSummaries[mealType] = mealData ? {
        calories: mealData.totalCalories,
        protein: mealData.totalProtein,
        carbs: mealData.totalCarbs,
        fat: mealData.totalFat,
        fiber: mealData.totalFiber,
        sugar: mealData.totalSugar,
        sodium: mealData.totalSodium,
        itemCount: mealData.itemCount
      } : {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        itemCount: 0
      };
    });

    res.json({
      date,
      dailyTotals,
      mealSummaries
    });

  } catch (error) {
    console.error('Error getting daily nutrition summary:', error);
    res.status(500).json({ error: 'Failed to get nutrition summary' });
  }
};

// Get user's food history for autocomplete
export const getUserFoodHistory = async (req, res) => {
  try {
    const { search } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    let query = { userId: req.user.id };
    
    if (search) {
      query.foodName = { $regex: new RegExp(search, 'i') };
    }

    // Get unique food items user has logged before
    const foods = await DiaryEntry.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            foodName: '$foodName',
            brand: '$brand'
          },
          lastUsed: { $max: '$createdAt' },
          avgQuantity: { $avg: '$quantity' },
          unit: { $first: '$unit' },
          calories: { $first: '$calories' },
          protein: { $first: '$protein' },
          carbs: { $first: '$carbs' },
          fat: { $first: '$fat' },
          usageCount: { $sum: 1 }
        }
      },
      { $sort: { usageCount: -1, lastUsed: -1 } },
      { $limit: limit }
    ]);

    const formattedFoods = foods.map(food => ({
      name: food._id.foodName,
      brand: food._id.brand,
      quantity: Math.round(food.avgQuantity),
      unit: food.unit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      usageCount: food.usageCount,
      lastUsed: food.lastUsed
    }));

    res.json(formattedFoods);

  } catch (error) {
    console.error('Error getting food history:', error);
    res.status(500).json({ error: 'Failed to get food history' });
  }
};