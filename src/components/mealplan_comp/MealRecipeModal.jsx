import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function MealRecipeModal({ meal, mealPlan, onClose }) {
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);

  if (!meal && !mealPlan) return null;

  // For legacy single-meal modal
  if (meal) {
    return (
      <motion.div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="bg-dark-200/80 p-6 rounded-2xl shadow-xl w-full max-w-xl border border-card-border relative" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-dark-300/60 rounded-full hover:bg-dark-200/70 transition-colors">
            <X className="w-4 h-4 text-text-muted" />
          </button>
          <h2 className="text-2xl font-bold text-text-base mb-2">{meal.name}</h2>
          <p className="text-sm text-text-muted mb-4">{meal.description}</p>
          <div className="text-sm text-text-muted mb-4">
            <span className="mr-4">Calories: <span className="text-text-base font-medium">{meal.calories}</span></span>
            <span>Prep Time: <span className="text-text-base font-medium">{meal.prepTime}</span></span>
          </div>
          {meal.recipe && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-text-base mb-1">Ingredients</h4>
                <ul className="list-disc list-inside text-sm text-text-muted space-y-1">
                  {meal.recipe.ingredients.map((ing, idx) => <li key={idx}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-text-base mb-1">Instructions</h4>
                <ol className="list-decimal list-inside text-sm text-text-muted space-y-1">
                  {meal.recipe.instructions.map((step, idx) => <li key={idx}>{step}</li>)}
                </ol>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // For full plan modal
  if (!mealPlan || !Array.isArray(mealPlan.data) || mealPlan.data.length === 0) {
    return (
      <motion.div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="bg-dark-200/90 p-6 rounded-2xl shadow-xl w-full max-w-4xl border border-card-border relative space-y-6" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-dark-300/60 rounded-full hover:bg-dark-200/70 transition-colors">
            <X className="w-4 h-4 text-text-muted" />
          </button>
          <div className="text-center text-red-400 font-semibold">Invalid or missing meal plan data.</div>
        </motion.div>
      </motion.div>
    );
  }

  // Defensive: Only use days with valid meals object
  const validDays = mealPlan.data.filter(day => day && day.meals && typeof day.meals === 'object');
  const allMealTypes = Array.from(
    new Set(validDays.flatMap(day => Object.keys(day.meals || {})))
  );
  const totalDays = validDays.length;
  const mealsForSelected = (() => {
    const dayObj = validDays.find(day => day.day === selectedDay);
    if (!dayObj || !dayObj.meals || typeof dayObj.meals !== 'object') return [];
    // Convert meals object to array
    return Object.entries(dayObj.meals)
      .filter(([type, meal]) => selectedMealType ? type === selectedMealType : true)
      .map(([type, meal]) => ({ ...meal, mealType: type }));
  })();

  return (
    <motion.div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="bg-dark-200/90 p-6 rounded-2xl shadow-xl w-full max-w-4xl border border-card-border relative space-y-6" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-dark-300/60 rounded-full hover:bg-dark-200/70 transition-colors">
          <X className="w-4 h-4 text-text-muted" />
        </button>

        {/* Meal Type Tabs */}
        <div className="flex gap-2 justify-center flex-wrap">
          {allMealTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedMealType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${selectedMealType === type ? 'bg-primary-DEFAULT text-white border-primary-DEFAULT' : 'bg-dark-300 text-text-muted border-dark-400'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 justify-center flex-wrap">
          {[...Array(totalDays)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setSelectedDay(idx + 1)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border ${selectedDay === idx + 1 ? 'bg-primary-DEFAULT text-white border-primary-DEFAULT' : 'bg-dark-300 text-text-muted border-dark-400'}`}
            >
              Day {idx + 1}
            </button>
          ))}
        </div>

        {/* Selected Meal Details */}
        {selectedMealType && mealsForSelected.length > 0 ? (
          <div className="flex flex-col gap-4">
            {mealsForSelected.map((meal, i) => (
              <div key={i} className="bg-dark-300/50 p-4 rounded-xl border border-card-border">
                <h3 className="text-xl font-bold text-text-base mb-1">{meal.name}</h3>
                <p className="text-sm text-text-muted mb-2">{meal.description}</p>
                <div className="text-sm text-text-muted mb-4 flex flex-wrap gap-4">
                  <span>Type: <span className="text-text-base font-medium">{meal.mealType}</span></span>
                  <span>Calories: <span className="text-text-base font-medium">{meal.calories}</span></span>
                  <span>Prep Time: <span className="text-text-base font-medium">{meal.prepTime}</span> min</span>
                </div>
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <div className="mb-2">
                    <h4 className="font-semibold text-text-base mb-1">Ingredients</h4>
                    <ul className="list-disc list-inside text-sm text-text-muted space-y-1">
                      {meal.ingredients.map((ing, idx) => <li key={idx}>{ing.name || ing}</li>)}
                    </ul>
                  </div>
                )}
                {meal.instructions && meal.instructions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-text-base mb-1">Instructions</h4>
                    <ol className="list-decimal list-inside text-sm text-text-muted space-y-1">
                      {meal.instructions.map((step, idx) => <li key={idx}>{step}</li>)}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : selectedMealType ? (
          <div className="text-center text-text-muted py-8">No meal found for this type on the selected day.</div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
