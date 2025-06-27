// models/MealEntry.js
import mongoose from 'mongoose';

const mealEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },

  // e.g. breakfast / lunch / snack
  mealType: { type: String, enum: ['breakfast','lunch','dinner','snack'] },

  // array of foods and quantity
  items: [{
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    quantity: Number    // how many servings
  }]
}, { timestamps: true });

export default mongoose.model('MealEntry', mealEntrySchema);
