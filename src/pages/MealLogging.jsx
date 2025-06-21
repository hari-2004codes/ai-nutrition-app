import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Clock, Utensils, Camera, X, Check } from 'lucide-react';
import MealEntry from '../components/mealLog_comp/MealEntry';
import FoodSearch from '../components/mealLog_comp/FoodSearch';
import ImageRecognitionInput from '../components/mealLog_comp/ImageRecognitionInput';
import DetectedFoodsList from '../components/mealLog_comp/DetectedFoodList';
// Import your meal save function - adjust path as needed
// import { saveMealToLog } from '../services/fatSecretApi';

export default function MealLog() {
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showImageRecognition, setShowImageRecognition] = useState(false);
  const [detectedFoods, setDetectedFoods] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  });

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'from-yellow-400 to-orange-500' },
    { id: 'lunch', label: 'Lunch', icon: '☀️', color: 'from-green-400 to-emerald-500' },
    { id: 'dinner', label: 'Dinner', icon: '🌙', color: 'from-blue-400 to-indigo-500' },
    { id: 'snacks', label: 'Snacks', icon: '🍎', color: 'from-purple-400 to-pink-500' }
  ];

  const addFoodToMeal = (food) => {
    setMeals(prev => ({
      ...prev,
      [selectedMeal]: [...prev[selectedMeal], { ...food, id: Date.now() }]
    }));
    setShowFoodSearch(false);
  };

  const handleFoodsDetected = (foods) => {
    console.log('Foods detected:', foods);
    setDetectedFoods(foods);
    setMessage('');
  };

  const handleConfirmSelectedFoods = async (selectedFoods) => {
    setIsLoading(true);
    setMessage('');

    try {
      // Process each selected food and save to meal log
      const savedFoods = [];
      
      for (const food of selectedFoods) {
        const mealData = {
          name: food.name,
          mealType: selectedMeal,
          nutrients: food.nutrients,
          confidence: food.confidence,
          source: 'image_recognition',
          timestamp: new Date().toISOString(),
          // Convert nutrients to the format your existing system expects
          calories: food.nutrients?.calories || 0,
          protein: food.nutrients?.protein || 0,
          carbs: food.nutrients?.carbs || 0,
          fat: food.nutrients?.fat || 0,
          id: Date.now() + Math.random() // Unique ID
        };

        // Uncomment and adjust this line to use your actual save function
        // await saveMealToLog(mealData);
        
        // For now, just add to local state
        savedFoods.push(mealData);
        console.log('Saving meal:', mealData);
      }

      // Add recognized foods to the current meal
      setMeals(prev => ({
        ...prev,
        [selectedMeal]: [...prev[selectedMeal], ...savedFoods]
      }));

      setMessage(`✅ Successfully added ${selectedFoods.length} food item(s) to your ${selectedMeal} log!`);
      setDetectedFoods(null);
      setShowImageRecognition(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving meals:', error);
      setMessage('❌ Error saving meals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelFoodSelection = () => {
    setDetectedFoods(null);
    setMessage('');
  };

  const handleCloseImageRecognition = () => {
    setShowImageRecognition(false);
    setDetectedFoods(null);
    setMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl text-white font-bold text-shadow-text-base mb-2">Meal Logger</h1>
        <p className="text-text-muted text-lg">Track your daily nutrition intake</p>
      </div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border text-center font-medium ${
            message.includes('✅')
              ? 'bg-green-500/20 border-green-500/30 text-green-300'
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Date Selector */}
      <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-text-muted" />
            <span className="font-semibold text-text-base">Today - {new Date().toLocaleDateString()}</span>
          </div>
          <div className="bg-primary-DEFAULT/50 rounded-2xl px-4 py-2 border border-card-border shadow-xl shadow-card-border/20 text-lg font-semibold text-text-base">
            Total: {Object.values(meals).flat().reduce((acc, food) => acc + Number(food.caloriesn), 0)} calories
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
                ? 'bg-primary-DEFAULT/50 border-none shadow-lg shadow-primary-DEFAULT/20'
                : 'bg-dark-200/40 border-card-border hover:bg-dark-200/70 hover:border-primary-DEFAULT'
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
          <div className="flex gap-3">
            <button
              onClick={() => setShowImageRecognition(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/50 text-white rounded-xl hover:bg-purple-600 hover:shadow-md hover:shadow-purple-600/20 transition-colors duration-200 ease-in-out"
            >
              <Camera className="w-4 h-4" />
              Scan Food
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
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowImageRecognition(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600/50 text-white rounded-xl hover:bg-purple-600 hover:shadow-md hover:shadow-purple-600/20 transition-colors duration-200 ease-in-out"
              >
                <Camera className="w-4 h-4" />
                Scan Food
              </button>
              <button
                onClick={() => setShowFoodSearch(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-DEFAULT/50 text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition-colors duration-200 ease-in-out"
              >
                <Plus className="w-4 h-4" />
                Add Manually
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {meals[selectedMeal].map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MealEntry food={food} />
              </motion.div>
            ))}
            
            {/* Meal Summary */}
            <div className="mt-6 p-4 bg-dark-300/50 rounded-xl border border-card-border">
              <h4 className="font-semibold text-text-base mb-2">Meal Summary</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                <div className='flex justify-center items-center bg-dark-100/50 rounded-xl p-2'>
                  <span className="text-text-muted font-semibold">Calories:</span>
                  <span className="ml-2 font-semibold text-text-base">
                    {meals[selectedMeal].reduce((acc, food) => acc + (Number(food.calories) || 0), 0)} kcal
                  </span>
                </div>
                <div className='flex justify-center items-center bg-dark-100/50 rounded-xl p-2'>
                  <span className="text-text-muted font-semibold">Protein:</span>
                  <span className="ml-2 font-semibold text-text-base">
                    {Number(meals[selectedMeal].reduce((acc, food) => acc + (Number(food.protein) || 0), 0)).toFixed(1)}g
                  </span>
                </div>
                <div className='flex justify-center items-center bg-dark-100/50 rounded-xl p-2'>
                  <span className="text-text-muted font-semibold">Carbs:</span>
                  <span className="ml-2 font-semibold text-text-base">
                    {Number(meals[selectedMeal].reduce((acc, food) => acc + (Number(food.carbs) || 0), 0)).toFixed(1)}g
                  </span>
                </div>
                <div className='flex justify-center items-center bg-dark-100/50 rounded-xl p-2'>
                  <span className="text-text-muted font-semibold">Fat:</span>
                  <span className="ml-2 font-semibold text-text-base">
                    {Number(meals[selectedMeal].reduce((acc, food) => acc + (Number(food.fat) || 0), 0)).toFixed(1)}g
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

      {/* Image Recognition Modal */}
      {showImageRecognition && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-200 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-card-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-base flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Scan Your Food
              </h3>
              <button
                onClick={handleCloseImageRecognition}
                className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <p className="text-text-muted mb-6">
              Take a photo or upload an image of your meal to automatically detect and log foods for your {selectedMeal}.
            </p>

            {/* Image Recognition Input with dark theme wrapper */}
            <div className="bg-dark-300/30 rounded-xl p-4 border border-card-border">
              <ImageRecognitionInput 
                onFoodsDetected={handleFoodsDetected}
                disabled={isLoading}
              />
            </div>

            {/* Show detected foods list */}
            {detectedFoods && (
              <div className="mt-6">
                {/* Dark theme wrapper for DetectedFoodsList */}
                <div className="bg-dark-300/30 rounded-xl p-4 border border-card-border">
                  <DetectedFoodsList
                    detectedFoods={detectedFoods}
                    onConfirmSelection={handleConfirmSelectedFoods}
                    onCancel={handleCancelFoodSelection}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-200 rounded-2xl p-8 text-center border border-card-border"
          >
            <div className="w-12 h-12 border-4 border-primary-DEFAULT/30 border-t-primary-DEFAULT rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-base font-medium">Saving meals to your log...</p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}