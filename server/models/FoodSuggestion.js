// models/FoodSuggestion.js
import mongoose from 'mongoose';

const foodSuggestionSchema = new mongoose.Schema({
  // User who the suggestion belongs to
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Food identifier (hash of normalized food data)
  foodHash: { 
    type: String, 
    required: true,
    index: true
  },
  
  // Original food data used for suggestion
  foodData: {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'g' },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true }
  },
  
  // Generated suggestion data
  suggestion: {
    healthiness: { 
      type: String, 
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      required: true 
    },
    recommendation: { type: String, required: true },
    tips: [{ type: String }],
    alternatives: [{ type: String }],
    portion: { type: String, required: true },
    timing: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now }
  },
  
  // User profile data at time of generation (for context)
  userContext: {
    bmr: { type: Number },
    tdee: { type: Number },
    goal: { type: String },
    activityLevel: { type: String }
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  },
  
  // Error information if generation failed
  error: { type: String },
  
  // Cache TTL (suggestions expire after 30 days)
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 }
  }
}, { 
  timestamps: true 
});

// Compound index for efficient lookups
foodSuggestionSchema.index({ user: 1, foodHash: 1 }, { unique: true });

// Static method to generate food hash
foodSuggestionSchema.statics.generateFoodHash = function(foodData) {
  // Create a consistent hash based on food characteristics
  const normalizedData = {
    name: foodData.name.toLowerCase().trim(),
    calories: Math.round(foodData.calories),
    protein: Math.round(foodData.protein * 10) / 10,
    carbs: Math.round(foodData.carbs * 10) / 10,
    fat: Math.round(foodData.fat * 10) / 10
  };
  
  return Buffer.from(JSON.stringify(normalizedData)).toString('base64');
};

// Instance method to check if suggestion is valid/recent
foodSuggestionSchema.methods.isValid = function() {
  return this.status === 'completed' && this.expiresAt > new Date();
};

export default mongoose.model('FoodSuggestion', foodSuggestionSchema);
