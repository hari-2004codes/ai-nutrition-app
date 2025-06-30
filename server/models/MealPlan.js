import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  ingredients: [{
    name: String,
    amount: String,
    unit: String
  }],
  instructions: [String],
  prepTime: Number, // in minutes
  cookTime: Number, // in minutes
  servings: Number,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  fiber: Number,
  image: String,
  tags: [String],
  cuisine: String,
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'advanced'],
    default: 'moderate'
  }
}, { timestamps: true });

const dayPlanSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  meals: {
    breakfast: mealSchema,
    lunch: mealSchema,
    dinner: mealSchema,
    snack: mealSchema
  },
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number
}, { timestamps: true });

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  targetCalories: {
    type: Number,
    required: true,
    min: 1200,
    max: 4000
  },
  cuisine: {
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'vegan', 'jain', 'south-indian', 'north-indian', 'gujarati', 'punjabi'],
    default: 'vegetarian'
  },
  dietaryRestrictions: [{
    type: String,
    enum: ['gluten-free', 'lactose-free', 'nut-free', 'soy-free']
  }],
  excludedIngredients: [String],
  mealTypes: [{
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'evening-snack'],
    default: ['breakfast', 'lunch', 'dinner']
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'advanced'],
    default: 'moderate'
  },
  prepTime: {
    type: Number,
    default: 30,
    min: 15,
    max: 120
  },
  maxIngredients: {
    type: String,
    enum: ['5', '8', '10', '15', 'unlimited'],
    default: '10'
  },
  days: [dayPlanSchema],
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number,
  image: String,
  tags: [String],
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  isGenerated: {
    type: Boolean,
    default: false
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  planType: {
    type: String,
    enum: ['default', 'custom', 'personalized', 'ai-generated'],
    default: 'default'
  }
}, { timestamps: true });

// Index for efficient queries
mealPlanSchema.index({ user: 1, isActive: 1 });
mealPlanSchema.index({ user: 1, createdAt: -1 });

// Update the updatedAt field before saving
mealPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for total meals count
mealPlanSchema.virtual('totalMeals').get(function() {
  return this.days.reduce((total, day) => {
    return total + Object.keys(day.meals).filter(mealType => day.meals[mealType]).length;
  }, 0);
});

// Method to calculate nutritional totals
mealPlanSchema.methods.calculateTotals = function() {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  this.days.forEach(day => {
    Object.values(day.meals).forEach(meal => {
      if (meal) {
        totalCalories += meal.calories || 0;
        totalProtein += meal.protein || 0;
        totalCarbs += meal.carbs || 0;
        totalFat += meal.fat || 0;
      }
    });
  });

  this.totalCalories = totalCalories;
  this.totalProtein = totalProtein;
  this.totalCarbs = totalCarbs;
  this.totalFat = totalFat;

  return this;
};

export default mongoose.model('MealPlan', mealPlanSchema); 