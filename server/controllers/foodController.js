// controllers/foodController.js
import FoodItem from "../models/FoodItem.js";

export const addFoodItem = async (req, res) => {
  try {
    console.log("\n🔍 ADD FOOD ITEM DEBUG:");
    console.log("req.body:", req.body);
    
    const { name, brand, calories, macros, servingSize } = req.body;
    
    // Basic validation
    if (!name) {
      return res.status(400).json({ msg: "Food name is required" });
    }
    
    if (!calories || calories < 0) {
      return res.status(400).json({ msg: "Valid calories value is required" });
    }
    
    const foodItem = new FoodItem({
      name,
      brand,
      calories,
      macros,
      servingSize
    });
    
    await foodItem.save();
    
    console.log("✅ Food item created:", foodItem);
    res.status(201).json(foodItem);
    
  } catch (err) {
    console.error("❌ Add Food Item Error:", err);
    
    // Handle duplicate name error
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Food item with this name already exists" });
    }
    
    res.status(500).json({ msg: "Could not add food item", error: err.message });
  }
};

export const getFoodItems = async (req, res) => {
  try {
    console.log("\n🔍 GET FOOD ITEMS DEBUG:");
    console.log("req.query:", req.query);
    
    const { search, page = 1, limit = 50 } = req.query;
    let query = {};
    
    // Search functionality
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    const foodItems = await FoodItem.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await FoodItem.countDocuments(query);
    
    console.log(`✅ Found ${foodItems.length} food items (${total} total)`);
    
    res.json({
      foodItems,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: foodItems.length,
        totalItems: total
      }
    });
    
  } catch (err) {
    console.error("❌ Get Food Items Error:", err);
    res.status(500).json({ msg: "Could not fetch food items", error: err.message });
  }
};

export const getFoodItemById = async (req, res) => {
  try {
    console.log("\n🔍 GET FOOD ITEM BY ID DEBUG:");
    console.log("req.params.id:", req.params.id);
    
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ msg: "Invalid food item ID format" });
    }
    
    const foodItem = await FoodItem.findById(id);
    
    if (!foodItem) {
      return res.status(404).json({ msg: "Food item not found" });
    }
    
    console.log("✅ Food item found:", foodItem);
    res.json(foodItem);
    
  } catch (err) {
    console.error("❌ Get Food Item Error:", err);
    res.status(500).json({ msg: "Could not fetch food item", error: err.message });
  }
};

export const updateFoodItem = async (req, res) => {
  try {
    console.log("\n🔍 UPDATE FOOD ITEM DEBUG:");
    console.log("req.params.id:", req.params.id);
    console.log("req.body:", req.body);
    
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ msg: "Invalid food item ID format" });
    }
    
    const updatedFoodItem = await FoodItem.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedFoodItem) {
      return res.status(404).json({ msg: "Food item not found" });
    }
    
    console.log("✅ Food item updated:", updatedFoodItem);
    res.json(updatedFoodItem);
    
  } catch (err) {
    console.error("❌ Update Food Item Error:", err);
    res.status(500).json({ msg: "Could not update food item", error: err.message });
  }
};

export const deleteFoodItem = async (req, res) => {
  try {
    console.log("\n🔍 DELETE FOOD ITEM DEBUG:");
    console.log("req.params.id:", req.params.id);
    
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ msg: "Invalid food item ID format" });
    }
    
    const deletedFoodItem = await FoodItem.findByIdAndDelete(id);
    
    if (!deletedFoodItem) {
      return res.status(404).json({ msg: "Food item not found" });
    }
    
    console.log("✅ Food item deleted:", deletedFoodItem);
    res.json({ msg: "Food item deleted successfully", deletedItem: deletedFoodItem });
    
  } catch (err) {
    console.error("❌ Delete Food Item Error:", err);
    res.status(500).json({ msg: "Could not delete food item", error: err.message });
  }
};