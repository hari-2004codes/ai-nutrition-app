// backend/models/MealLog.js
import mongoose from 'mongoose';

const NutritionSchema = new mongoose.Schema({
  calories: Number,
  fat: Number,
  carbohydrates: Number,
  protein: Number,
  // add other fields returned by LogMeal nutrition API
}, { _id: false });

const ItemSchema = new mongoose.Schema({
  position: Number,
  dishId: Number,
  name: String,
  probability: Number,
  quantity: Number,
  unit: String,
  nutrition: NutritionSchema
}, { _id: false });

const MealLogSchema = new mongoose.Schema({
  imagePath: String,       // local path or URL reference
  imageId: Number,         // LogMeal’s imageId if desired
  items: [ItemSchema],
  totalCalories: Number,
  totalFat: Number,
  totalCarbs: Number,
  totalProtein: Number,
  createdAt: { type: Date, default: Date.now }
  // optionally: userId if you have auth
});

export default mongoose.model('MealLog', MealLogSchema);
