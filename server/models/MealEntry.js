// models/MealEntry.js
import mongoose from 'mongoose';

const mealEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snacks'], required: true },
  
  // array of foods and their details
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'g' },
    
    // nutritional information
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    
    // AI-generated suggestions
    suggestion: {
      healthiness: { type: String }, // e.g., "Excellent", "Good", "Fair", "Poor"
      recommendation: { type: String }, // personalized recommendation text
      tips: [{ type: String }], // array of tips
      alternatives: [{ type: String }], // suggested healthier alternatives
      portion: { type: String }, // portion size feedback
      timing: { type: String }, // meal timing feedback
      generatedAt: { type: Date, default: Date.now }
    }
  }],

  // meal summary (calculated values)
  totalNutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('MealEntry', mealEntrySchema);
