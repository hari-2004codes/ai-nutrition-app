// models/FoodItem.js
import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  calories: Number,
  macros: {
    protein: Number,
    carbs: Number,
    fat: Number
  },
  servingSize: {
    amount: Number,
    unit: String
  }
}, { timestamps: true });

export default mongoose.model('FoodItem', foodItemSchema);
