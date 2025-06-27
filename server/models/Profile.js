// models/Profile.js
import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // basic demographics
  dateOfBirth: Date,
  gender: { type: String, enum: ['male','female','other'] },
  heightCm: Number,
  weightKg: Number,

  // goals & targets
  goalWeightKg: Number,
  goalDate: Date,
  activityLevel: { type: String, enum: ['sedentary','light','moderate','active','very active'] }
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);
