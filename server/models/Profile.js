// models/Profile.js
import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

 
  name: String,
  age: Number,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  heightCm: Number,
  weightKg: Number,

  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'light', 'moderate', 'very', 'extra'] 
  },

  goal: { 
    type: String, 
    enum: ['lose', 'maintain', 'gain'] 
  },
  goalWeightKg: Number,
  goalDate: Date,

  preferences: { 
    type: String, 
    enum: ['vegan', 'vegetarian', 'paleo', 'keto', 'mediterranean', 'gluten-free', 'lactose-free', 'no-preference'] 
  },

  bmr: Number,
  tdee: Number,

  onboardingCompleted: { type: Boolean, default: false },
  onboardingCompletedAt: Date,
  
  // Track if personalized meal plans have been generated
  personalizedPlansGenerated: { type: Boolean, default: false },
  personalizedPlansGeneratedAt: Date
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);