// models/DiaryEntry.js
import mongoose from 'mongoose';

const diaryEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Store food data directly
  foodName: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: ''
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'g'
  },
  date: {
    type: Date,
    required: true
  },
  // Nutritional data for this specific entry
  calories: {
    type: Number,
    default: 0
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  },
  // Optional: additional nutrients
  fiber: {
    type: Number,
    default: 0
  },
  sugar: {
    type: Number,
    default: 0
  },
  sodium: {
    type: Number,
    default: 0
  },
  dailyIntakeReference: {
    calories: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'NONE'],
      default: 'NONE'
    },
    protein: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'NONE'],
      default: 'NONE'
    },
    carbs: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'NONE'],
      default: 'NONE'
    },
    fat: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'NONE'],
      default: 'NONE'
    }
  },
  // Optional: source of the food data
  source: {
    type: String,
    enum: ['manual', 'search', 'image', 'barcode'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Efficient indexes
diaryEntrySchema.index({ userId: 1, date: 1 });
diaryEntrySchema.index({ userId: 1, mealType: 1, date: 1 });
diaryEntrySchema.index({ userId: 1, foodName: 1 }); // For food search/autocomplete

export default mongoose.model('DiaryEntry', diaryEntrySchema);