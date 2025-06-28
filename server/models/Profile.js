// models/Profile.js
import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Basic demographics (from onboarding step 1)
  name: String,
  age: Number,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  heightCm: Number,
  weightKg: Number,

  // Activity level (from onboarding step 2)
  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'light', 'moderate', 'very', 'extra'] 
  },

  // Goals (from onboarding step 3)
  goal: { 
    type: String, 
    enum: ['lose', 'maintain', 'gain'] 
  },
  goalWeightKg: Number,
  goalDate: Date,

  // Food preferences (from onboarding step 4)
  preferences: { 
    type: String, 
    enum: ['vegan', 'vegetarian', 'paleo', 'keto', 'mediterranean', 'gluten-free', 'lactose-free', 'no-preference'] 
  },

  // Calculated values (from onboarding step 5)
  bmr: Number,
  tdee: Number,

  // Onboarding completion status
  onboardingCompleted: { type: Boolean, default: false },
  onboardingCompletedAt: Date
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);