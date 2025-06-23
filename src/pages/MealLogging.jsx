import React, { useState } from "react";
import { motion as m } from "framer-motion";
import { Plus, Search, Clock, Utensils, Camera } from "lucide-react";
import MealEntry from "../components/mealLog_comp/MealEntry";
import FoodSearch from "../components/mealLog_comp/FoodSearch";
import ImageUploadModal from "../components/mealLog_comp/ImageUploadModal";

export default function MealLog() {
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });

  const mealTypes = [
    {
      id: "breakfast",
      label: "Breakfast",
      icon: "🌅",
      color: "from-yellow-400 to-orange-500",
    },
    {
      id: "lunch",
      label: "Lunch",
      icon: "☀️",
      color: "from-green-400 to-emerald-500",
    },
    {
      id: "dinner",
      label: "Dinner",
      icon: "🌙",
      color: "from-blue-400 to-indigo-500",
    },
    {
      id: "snacks",
      label: "Snacks",
      icon: "🍎",
      color: "from-purple-400 to-pink-500",
    },
  ];

  const addFoodToMeal = (food) => {
    setMeals((prev) => ({
      ...prev,
      [selectedMeal]: [...prev[selectedMeal], { ...food, id: Date.now() }],
    }));
    setShowFoodSearch(false);
  };

  const handleImageUploadComplete = (recognizedFoods) => {
    setMeals((prev) => ({
      ...prev,
      [selectedMeal]: [
        ...prev[selectedMeal],
        ...recognizedFoods.map((food) => ({
          ...food,
          id: Date.now(),
          serving: `${food.quantity} ${food.unit}`,
        })),
      ],
    }));
    setShowImageUpload(false);
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl text-white font-bold text-shadow-text-base mb-2">
          Meal Logger
        </h1>
        <p className="text-text-muted text-lg">
          Track your daily nutrition intake
        </p>
      </div>

      {/* Date Selector */}
      <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-text-muted" />
            <span className="font-semibold text-text-base">
              Today - {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="bg-primary-DEFAULT/50 rounded-2xl px-4 py-2 border border-card-border shadow-xl shadow-card-border/20 text-lg font-semibold text-text-base">
            Total:{" "}
            {Object.values(meals)
              .flat()
              .reduce((acc, food) => acc + Number(food.calories || 0), 0)}{" "}
            calories
          </div>
        </div>
      </div>

      {/* Meal Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mealTypes.map((meal) => (
          <button
            key={meal.id}
            onClick={() => setSelectedMeal(meal.id)}
            className={`p-4 rounded-2xl border transition-all duration-200 ${
              selectedMeal === meal.id
                ? "bg-primary-DEFAULT/50 border-none shadow-lg shadow-primary-DEFAULT/20"
                : "bg-dark-200/40 border-card-border hover:bg-dark-200/70 hover:border-primary-DEFAULT"
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{meal.icon}</div>
              <div className="font-semibold text-text-base">{meal.label}</div>
              <div className="text-sm text-text-muted">
                {meals[meal.id].length} items
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Current Meal Section */}
      <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-base flex items-center gap-2 capitalize">
            <Utensils className="w-6 h-6" />
            {selectedMeal}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImageUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-300/70 text-white rounded-xl hover:bg-dark-400 hover:shadow-md transition-colors duration-200 ease-in-out"
            >
              <Camera className="w-4 h-4" />
              Add with Image
            </button>
            <button
              onClick={() => setShowFoodSearch(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-DEFAULT/50 text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition-colors duration-200 ease-in-out"
            >
              <Plus className="w-4 h-4" />
              Add Food
            </button>
          </div>
        </div>

        {meals[selectedMeal].length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-text-base mb-2">No food logged yet</h3>
            <p className="text-text-muted mb-4">Start tracking your {selectedMeal} to see your nutrition data</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowImageUpload(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-dark-300/70 text-white rounded-xl hover:bg-dark-400 hover:shadow-md transition-colors duration-200 ease-in-out"
              >
                <Camera className="w-4 h-4" />
                Add with Image
              </button>
              <button
                onClick={() => setShowFoodSearch(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-DEFAULT/50 text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition-colors duration-200 ease-in-out"
              >
                <Plus className="w-4 h-4" />
                Add First Item
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {meals[selectedMeal].map((food, index) => (
              <m.div
                key={food.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MealEntry food={food} />
              </m.div>
            ))}

            {/* Meal Summary */}
            <div className="mt-6 p-4 bg-dark-300/50 rounded-xl border border-card-border">
              <h4 className="font-semibold text-text-base mb-2">
                Meal Summary
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                <div className="flex justify-center items-center bg-dark-100/50 rounded-xl p-2">
                  <span className="text-text-muted font-semibold">
                    Calories:
                  </span>
                  <span className="ml-2 font-semibold text-text-base">
                    {meals[selectedMeal].reduce(
                      (acc, food) => acc + (Number(food.calories) || 0),
                      0
                    )}{" "}
                    kcal
                  </span>
                </div>
                <div className="flex justify-center items-center bg-dark-100/50 rounded-xl p-2">
                  <span className="text-text-muted font-semibold">
                    Protein:
                  </span>
                  <span className="ml-2 font-semibold text-text-base">
                    {Number(
                      meals[selectedMeal].reduce(
                        (acc, food) => acc + (Number(food.protein) || 0),
                        0
                      )
                    ).toFixed(1)}
                    g
                  </span>
                </div>
                <div className="flex justify-center items-center bg-dark-100/50 rounded-xl p-2">
                  <span className="text-text-muted font-semibold">Carbs:</span>
                  <span className="ml-2 font-semibold text-text-base">
                    {Number(
                      meals[selectedMeal].reduce(
                        (acc, food) => acc + (Number(food.carbs) || 0),
                        0
                      )
                    ).toFixed(1)}
                    g
                  </span>
                </div>
                <div className="flex justify-center items-center bg-dark-100/50 rounded-xl p-2">
                  <span className="text-text-muted font-semibold">Fat:</span>
                  <span className="ml-2 font-semibold text-text-base">
                    {Number(
                      meals[selectedMeal].reduce(
                        (acc, food) => acc + (Number(food.fat) || 0),
                        0
                      )
                    ).toFixed(1)}
                    g
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Food Search Modal */}
      {showFoodSearch && (
        <FoodSearch
          onClose={() => setShowFoodSearch(false)}
          onSelect={addFoodToMeal}
        />
      )}

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUploadModal
          isOpen={showImageUpload}
          onClose={() => setShowImageUpload(false)}
          onDishesConfirmed={handleImageUploadComplete}
        />
      )}
    </m.div>
  );
}
