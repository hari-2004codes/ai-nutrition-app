// models/Progress.js
import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  weightKg: Number,
  bodyFatPct: Number
}, { timestamps: true });

export default mongoose.model('Progress', progressSchema);
