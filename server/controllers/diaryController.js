// server/controllers/diaryController.js
import MealEntry from "../models/MealEntry.js";

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
    
    await meal.save();
    
    console.log("✅ Meal saved successfully:", meal);
    
    res.status(201).json(meal);
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