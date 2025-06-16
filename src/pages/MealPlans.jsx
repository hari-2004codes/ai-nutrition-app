import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  ChefHat,
  Star,
  Bookmark,
  Filter,
  Search
} from 'lucide-react';

export default function MealPlans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'

  const mealPlans = [
    {
      id: 1,
      name: 'Mediterranean Week',
      description: 'Heart-healthy Mediterranean diet plan with fresh ingredients',
      duration: '7 days',
      calories: '1,800-2,200',
      difficulty: 'Easy',
      rating: 4.8,
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['Mediterranean', 'Heart-healthy', 'Vegetarian-friendly'],
      meals: 21
    },
    {
      id: 2,
      name: 'High Protein Muscle Gain',
      description: 'Protein-rich meal plan designed for muscle building and recovery',
      duration: '5 days',
      calories: '2,400-2,800',
      difficulty: 'Moderate',
      rating: 4.9,
      image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['High-protein', 'Muscle gain', 'Post-workout'],
      meals: 15
    },
    {
      id: 3,
      name: 'Plant-Based Power',
      description: 'Complete vegan nutrition plan with balanced macronutrients',
      duration: '7 days',
      calories: '1,600-2,000',
      difficulty: 'Easy',
      rating: 4.7,
      image: 'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['Vegan', 'Plant-based', 'Sustainable'],
      meals: 21
    },
    {
      id: 4,
      name: 'Keto Fat Burn',
      description: 'Low-carb ketogenic meal plan for effective fat burning',
      duration: '14 days',
      calories: '1,500-1,900',
      difficulty: 'Advanced',
      rating: 4.6,
      image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['Keto', 'Low-carb', 'Fat loss'],
      meals: 42
    }
  ];

  const todaysMeals = [
    {
      time: '8:00 AM',
      meal: 'Breakfast',
      name: 'Greek Yogurt Parfait',
      calories: 320,
      prep: '5 min'
    },
    {
      time: '12:30 PM',
      meal: 'Lunch',
      name: 'Mediterranean Quinoa Bowl',
      calories: 450,
      prep: '15 min'
    },
    {
      time: '3:00 PM',
      meal: 'Snack',
      name: 'Almond & Apple Slices',
      calories: 180,
      prep: '2 min'
    },
    {
      time: '7:00 PM',
      meal: 'Dinner',
      name: 'Grilled Salmon with Vegetables',
      calories: 520,
      prep: '25 min'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-base mb-2">Meal Plans</h1>
          <p className="text-text-muted text-lg">Discover and follow personalized meal plans</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-DEFAULT/50 text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition-colors">
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>
      </div>

      {/* Today's Meal Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-base flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Today's Meal Plan
          </h2>
          <div className="text-sm text-text-muted">
            Total: {todaysMeals.reduce((acc, meal) => acc + meal.calories, 0)} calories
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {todaysMeals.map((meal, index) => (
            <motion.div
              key={meal.meal}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-4 bg-dark-300/60 rounded-xl border border-card-border hover:bg-dark-200/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-DEFAULT">{meal.time}</span>
                <Clock className="w-4 h-4 text-text-muted" />
              </div>
              <h4 className="font-semibold text-text-base mb-1">{meal.meal}</h4>
              <p className="text-sm text-text-muted mb-2">{meal.name}</p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{meal.calories} cal</span>
                <span>{meal.prep}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search meal plans..."
            className="w-full pl-10 pr-4 py-3 bg-dark-300/60 rounded-xl border border-card-border focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 text-text-base placeholder:text-text-muted"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-dark-300/60 border border-card-border rounded-xl hover:bg-dark-200/70 transition-colors text-text-base">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Meal Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-dark-200/50 backdrop-blur-lg rounded-2xl overflow-hidden border border-card-border shadow-xl shadow-card-border/20 hover:shadow-2xl hover:shadow-card-border/30 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedPlan(plan)}
          >
            {/* Plan Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={plan.image}
                alt={plan.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <button className="p-2 bg-dark-300/60 backdrop-blur-sm rounded-full hover:bg-dark-200/70 transition-colors">
                  <Bookmark className="w-4 h-4 text-text-muted" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-dark-300/60 backdrop-blur-sm rounded-full px-2 py-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-text-base">{plan.rating}</span>
              </div>
            </div>

            {/* Plan Details */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-text-base mb-2">{plan.name}</h3>
              <p className="text-text-muted text-sm mb-4">{plan.description}</p>

              {/* Plan Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-muted">{plan.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-muted">{plan.meals} meals</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-muted">{plan.difficulty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-muted">{plan.calories}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {plan.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary-DEFAULT/20 text-primary-DEFAULT text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <button className="w-full py-3 bg-primary-DEFAULT/50 text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition-all duration-200">
                Start Plan
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Custom Plan CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-8 border border-card-border shadow-xl shadow-card-border/20"
      >
        <h3 className="text-2xl font-bold text-text-base mb-2">Need a Custom Plan?</h3>
        <p className="text-text-muted mb-6">
          Let our AI create a personalized meal plan based on your specific goals and preferences
        </p>
        <button className="px-8 py-3 bg-primary-DEFAULT/50 text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition-all duration-200">
          Generate Custom Plan
        </button>
      </motion.div>
    </motion.div>
  );
}