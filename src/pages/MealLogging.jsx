import React, { useState, useEffect } from "react";
import { Plus, Search, Clock, Utensils, Camera, Trash2, Pencil, Sparkles } from "lucide-react";
import FoodSearch from "../components/mealLog_comp/FoodSearch";
import ImageUploadModal from "../components/mealLog_comp/ImageUploadModal";
import FoodSuggestionCard from "../components/mealLog_comp/FoodSuggestionCard";
import { addMealEntry, getMealEntries, deleteFoodItem, updateMealEntry, generateFoodSuggestion, getFoodSuggestion, generateFoodHash, deleteFoodSuggestion } from "../services/mealApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import QuantityInputModal from "../components/mealLog_comp/QuantityInputModal";
import toast from "react-hot-toast";
import { useLocation } from 'react-router-dom';

export default function MealLog() {
  const location = useLocation();
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });
  const [mealEntries, setMealEntries] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    snacks: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingFood, setEditingFood] = useState(null);
  
  // Food suggestion states
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [selectedFoodForSuggestion, setSelectedFoodForSuggestion] = useState(null);
  const [suggestionError, setSuggestionError] = useState(false);

  // Set selectedMeal from navigation state if present
  useEffect(() => {
    if (location.state && location.state.mealType) {
      setSelectedMeal(location.state.mealType);
    }
  }, [location.state]);

  // Reset suggestion card when meal type changes
  useEffect(() => {
    setCurrentSuggestion(null);
    setSuggestionLoading(false);
    setSuggestionError(false);
    setSelectedFoodForSuggestion(null);
    console.log('🔄 Reset suggestion card for meal type:', selectedMeal);
  }, [selectedMeal]);

  // Function to show AI suggestion for a food item using new suggestion service
  const showFoodSuggestion = async (foodItem) => {
    try {
      setSuggestionLoading(true);
      setSuggestionError(false);
      setSelectedFoodForSuggestion(foodItem.name);
      
      console.log('🔍 showFoodSuggestion called for:', foodItem.name);
      console.log('🔍 Food item data:', foodItem);
      
      // Generate food hash
      const foodData = {
        name: foodItem.name,
        quantity: foodItem.quantity,
        unit: foodItem.unit,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat
      };
      
      const foodHash = generateFoodHash(foodData);
      console.log('🔍 Generated food hash:', foodHash);
      
      // Try to get existing suggestion
      let suggestionData = await getFoodSuggestion(foodHash);
      
      if (suggestionData && suggestionData.status) {
        console.log('✅ Found existing suggestion with status:', suggestionData.status);
        
        if (suggestionData.status === 'completed') {
          console.log('✅ Using completed suggestion');
          setCurrentSuggestion(suggestionData.suggestion);
          setSuggestionLoading(false);
          toast.success('✅ AI analysis loaded from cache');
          return;
        } else if (suggestionData.status === 'generating') {
          console.log('⏳ Suggestion is generating, polling for completion...');
          toast.success('🤖 AI analysis in progress...');
          // Poll for completion
          pollForSuggestionCompletion(foodHash);
          return;
        } else if (suggestionData.status === 'failed') {
          console.log('❌ Previous suggestion failed, generating new one');
        }
      } else {
        console.log('❌ No existing suggestion found, generating new one');
      }

      // No existing suggestion or failed, generate new one
      console.log('🤖 Generating new suggestion for:', foodItem.name);
      toast.success('🤖 Starting AI analysis...');
      
      // Calculate current daily intake
      const dailyIntake = Object.values(meals)
        .flat()
        .reduce(
          (acc, food) => ({
            calories: acc.calories + (Number(food.calories) || 0),
            protein: acc.protein + (Number(food.protein) || 0),
            carbs: acc.carbs + (Number(food.carbs) || 0),
            fat: acc.fat + (Number(food.fat) || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

      console.log('🔍 Daily intake:', dailyIntake);
      
      // Start suggestion generation
      try {
        suggestionData = await generateFoodSuggestion(foodData, dailyIntake);
        console.log('✅ Started suggestion generation:', suggestionData);
        
        if (suggestionData && suggestionData.status === 'completed') {
          // Immediate completion
          console.log('✅ Suggestion completed immediately');
          setCurrentSuggestion(suggestionData.suggestion);
          setSuggestionLoading(false);
          toast.success('✨ AI analysis complete!');
        } else if (suggestionData && suggestionData.status === 'generating') {
          // Poll for completion
          console.log('⏳ Suggestion generating, starting poll');
          toast.success('🤖 Generating AI analysis...');
          pollForSuggestionCompletion(foodHash);
        } else {
          console.log('❌ Unexpected suggestion data:', suggestionData);
          setSuggestionError(true);
          setSuggestionLoading(false);
          toast.error('Failed to start suggestion generation');
        }
      } catch (generateError) {
        console.error('❌ Failed to start generation:', generateError);
        throw generateError; // Re-throw to be caught by outer catch
      }
      
    } catch (error) {
      console.error('❌ Failed to show suggestion:', error);
      setSuggestionError(true);
      setSuggestionLoading(false);
      
      // More specific error messages
      if (error.message?.includes('API key')) {
        toast.error('AI analysis unavailable - API key not configured');
      } else if (error.message?.includes('expired')) {
        toast.error('AI analysis unavailable - API key expired');
      } else if (error.message?.includes('profile not found')) {
        toast.error('Please complete your profile setup first');
      } else {
        toast.error('Failed to load food suggestion');
      }
    }
  };

  // Poll for suggestion completion
  const pollForSuggestionCompletion = async (foodHash, maxAttempts = 30) => {
    let attempts = 0;
    
    const poll = async () => {
      attempts++;
      console.log(`🔄 Polling attempt ${attempts}/${maxAttempts} for foodHash:`, foodHash);
      
      try {
        const suggestionData = await getFoodSuggestion(foodHash);
        console.log(`🔍 Poll result:`, suggestionData);
        
        if (suggestionData?.status === 'completed') {
          console.log('✅ Suggestion completed!');
          setCurrentSuggestion(suggestionData.suggestion);
          setSuggestionLoading(false);
          toast.success('✨ AI analysis saved!');
          return;
        } else if (suggestionData?.status === 'failed') {
          console.log('❌ Suggestion generation failed');
          setSuggestionError(true);
          setSuggestionLoading(false);
          toast.error('AI suggestion generation failed');
          return;
        } else if (suggestionData?.status === 'generating') {
          console.log('⏳ Still generating...');
        } else {
          console.log('❓ Unknown status or no data:', suggestionData?.status);
        }
        
        // Continue polling if still generating
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          console.log('⏰ Polling timeout reached');
          setSuggestionError(true);
          setSuggestionLoading(false);
          toast.error('Suggestion generation timed out');
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
        setSuggestionError(true);
        setSuggestionLoading(false);
        toast.error('Failed to check suggestion status');
      }
    };
    
    // Start polling after 1 second
    setTimeout(poll, 1000);
  };

  // Fetch meals for selected date
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const dateStr = selectedDate.toISOString().split('T')[0];
        const mealEntries = await getMealEntries(dateStr);
        
        // Organize meals by type
        const organizedMeals = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
        };
        
        const mealEntriesMap = {
          breakfast: null,
          lunch: null,
          dinner: null,
          snacks: null,
        };
        
        mealEntries.forEach(entry => {
          if (entry.items && entry.items.length > 0) {
            organizedMeals[entry.mealType] = entry.items;
            mealEntriesMap[entry.mealType] = entry;
            
            // Log suggestion data for debugging
            const itemsWithSuggestions = entry.items.filter(item => item.suggestion).length;
            console.log(`🔍 Loaded ${entry.mealType}: ${entry.items.length} items, ${itemsWithSuggestions} with suggestions`);
          }
        });
        
        console.log('🔍 Organized meals data:', organizedMeals);
        setMeals(organizedMeals);
        setMealEntries(mealEntriesMap);
      } catch (error) {
        console.error('Failed to fetch meals:', error);
        setError(error.code === 'ERR_NETWORK' 
          ? 'Unable to connect to the server. Please check if the server is running.'
          : 'Failed to load meals. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
  }, [selectedDate]);

  const deleteFoodFromMeal = async (mealType, itemIndex) => {
    try {
      const mealEntry = mealEntries[mealType];
      if (!mealEntry) {
        console.error('No meal entry found for:', mealType);
        return;
      }

      // Get the food item before deletion to delete its suggestion
      const foodItem = meals[mealType][itemIndex];
      console.log('🗑️ Deleting food item:', foodItem.name);

      // Delete from backend
      await deleteFoodItem(mealEntry._id, itemIndex);
      
      // Delete the associated food suggestion
      try {
        const foodData = {
          name: foodItem.name,
          calories: foodItem.calories,
          protein: foodItem.protein,
          carbs: foodItem.carbs,
          fat: foodItem.fat
        };
        const foodHash = generateFoodHash(foodData);
        console.log('🗑️ Deleting food suggestion for hash:', foodHash);
        
        await deleteFoodSuggestion(foodHash);
        console.log('✅ Food suggestion deleted successfully');
      } catch (suggestionError) {
        console.warn('⚠️ Failed to delete food suggestion:', suggestionError.message);
        // Don't show error to user as this is not critical
      }
      
      // Update local state
      setMeals(prev => ({
        ...prev,
        [mealType]: prev[mealType].filter((_, index) => index !== itemIndex)
      }));
      
      // Update meal entries
      setMealEntries(prev => {
        const updatedEntry = { ...prev[mealType] };
        updatedEntry.items = updatedEntry.items.filter((_, index) => index !== itemIndex);
        
        // If no items left, remove the meal entry
        if (updatedEntry.items.length === 0) {
          const newEntries = { ...prev };
          delete newEntries[mealType];
          return newEntries;
        }
        
        return {
          ...prev,
          [mealType]: updatedEntry
        };
      });

      toast.success(`${foodItem.name} removed successfully`);
    } catch (error) {
      console.error('Failed to delete food item:', error);
      toast.error('Failed to remove food item');
    }
  };

  const addFoodToMeal = async (food) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      console.log('Food object received:', food);
      
      // Parse quantity properly - handle the actual food object structure
      let quantity = 100; // Default quantity
      let calories = 0;
      let protein = 0;
      let carbs = 0;
      let fat = 0;
      
      // Check if this is a food object with servings
      if (food.food && food.food.servings && food.food.servings.serving) {
        const serving = Array.isArray(food.food.servings.serving) 
          ? food.food.servings.serving[0] 
          : food.food.servings.serving;
        
        quantity = parseFloat(serving.metric_serving_amount) || 100;
        calories = parseFloat(serving.calories) || 0;
        protein = parseFloat(serving.protein) || 0;
        carbs = parseFloat(serving.carbohydrate) || 0;
        fat = parseFloat(serving.fat) || 0;
        
        console.log('Using serving data:', { quantity, calories, protein, carbs, fat });
      } else {
        // Handle direct food object (from search results)
        quantity = food.quantity || food.servingSize || 100;
        if (typeof quantity === 'string') {
          const numMatch = quantity.match(/(\d+(?:\.\d+)?)/);
          quantity = numMatch ? parseFloat(numMatch[1]) : 100;
        } else {
          quantity = Number(quantity) || 100;
        }
        
        calories = Number(food.calories) || 0;
        protein = Number(food.protein) || 0;
        carbs = Number(food.carbs) || 0;
        fat = Number(food.fat) || 0;
        
        console.log('Using direct food data:', { quantity, calories, protein, carbs, fat });
      }

      const newFoodItem = {
        name: food.food?.food_name || food.name,
        quantity: quantity,
        unit: 'g',
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
      };

      // Check if meal entry already exists for this meal type and date
      const existingMealEntry = mealEntries[selectedMeal];
      
      if (existingMealEntry) {
        // Update existing meal entry by adding the new food item
        const updatedItems = [...existingMealEntry.items, newFoodItem];
        const updatedMealEntry = await updateMealEntry(existingMealEntry._id, { items: updatedItems });
        
        console.log('🔍 Updated meal entry from backend:', updatedMealEntry);
        
        // Update local state with backend data (includes suggestions!)
        setMeals(prev => ({
          ...prev,
          [selectedMeal]: updatedMealEntry.items || updatedItems,
        }));
        
        setMealEntries(prev => ({
          ...prev,
          [selectedMeal]: updatedMealEntry
        }));
        
        console.log('✅ Updated existing meal entry with suggestions');
      } else {
        // Create new meal entry
        const mealData = {
          date: dateStr,
          mealType: selectedMeal,
          items: [newFoodItem]
        };

        console.log('🔍 Creating new meal entry:', mealData);

        const newMealEntry = await addMealEntry(mealData);
        
        console.log('🔍 New meal entry from backend:', newMealEntry);
        
        // Update local state with backend data (includes suggestions!)
        setMeals(prev => ({
          ...prev,
          [selectedMeal]: newMealEntry.items || [newFoodItem],
        }));
        
        setMealEntries(prev => ({
          ...prev,
          [selectedMeal]: newMealEntry
        }));
        
        console.log('✅ Created new meal entry with suggestions');
      }
      
      toast.success('Food added successfully!');
    } catch (error) {
      console.error('Failed to add food:', error);
      toast.error('Failed to add food item');
    }
    setShowFoodSearch(false);
  };

  const handleImageUploadComplete = async (nutritionData) => {
    if (!nutritionData || !nutritionData.nutritional_info_per_item) {
      console.error("Invalid nutrition data received:", nutritionData);
      setShowImageUpload(false);
      return;
    }
    
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const items = nutritionData.nutritional_info_per_item.map((item, index) => {
        const info = item.nutritional_info || {};
        const nutrients = info.totalNutrients || {};
        
        // Parse serving size properly
        let quantity = item.serving_size || 100;
        if (typeof quantity === 'string') {
          const numMatch = quantity.match(/(\d+(?:\.\d+)?)/);
          quantity = numMatch ? parseFloat(numMatch[1]) : 100;
        } else {
          quantity = Number(quantity) || 100;
        }
        // Round all values to 1 decimal place
        quantity = Number(quantity.toFixed(1));
        const calories = info.calories ? Number(Number(info.calories).toFixed(1)) : 0;
        const protein = nutrients.PROCNT ? Number(Number(nutrients.PROCNT.quantity).toFixed(1)) : 0;
        const carbs = nutrients.CHOCDF ? Number(Number(nutrients.CHOCDF.quantity).toFixed(1)) : 0;
        const fat = nutrients.FAT ? Number(Number(nutrients.FAT.quantity).toFixed(1)) : 0;
        
        return {
          name: nutritionData.foodName?.[index] || `Food Item ${index + 1}`,
          quantity,
          unit: 'g',
          calories,
          protein,
          carbs,
          fat,
        };
      });

      // Check if meal entry already exists for this meal type and date
      const existingMealEntry = mealEntries[selectedMeal];
      
      if (existingMealEntry) {
        // Update existing meal entry by adding the new food items
        const updatedItems = [...existingMealEntry.items, ...items];
        const updatedMealEntry = await updateMealEntry(existingMealEntry._id, { items: updatedItems });
        
        // Update local state
        const newFoods = items.map((item, index) => ({
          ...item,
          id: `${Date.now()}-${index}`
        }));
        
        setMeals(prev => ({
          ...prev,
          [selectedMeal]: [...prev[selectedMeal], ...newFoods],
        }));
        
        setMealEntries(prev => ({
          ...prev,
          [selectedMeal]: updatedMealEntry
        }));
        
        console.log('Updated existing meal entry with image foods:', updatedMealEntry);
      } else {
        // Create new meal entry
        const mealData = {
          date: dateStr,
          mealType: selectedMeal,
          items
        };

        const newMealEntry = await addMealEntry(mealData);

        // Update local state
        const newFoods = items.map((item, index) => ({
          ...item,
          id: `${Date.now()}-${index}`
        }));

        setMeals(prev => ({
          ...prev,
          [selectedMeal]: newFoods,
        }));
        
        setMealEntries(prev => ({
          ...prev,
          [selectedMeal]: newMealEntry
        }));
        
        console.log('Created new meal entry with image foods:', newMealEntry);
      }
    } catch (error) {
      console.error('Failed to add foods from image:', error);
      // You might want to show an error toast here
    }
    
    setShowImageUpload(false);
  };

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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl text-white font-bold text-shadow-text-base mb-2">
          Meal Logger
        </h1>
        <p className="text-text-muted text-lg">
          Track your daily nutrition intake with AI-powered suggestions
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-center">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-DEFAULT"></div>
        </div>
      ) : (
        <>
          {/* Date Selector */}
          <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-text-muted" />
                <span className="font-semibold text-text-base">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="bg-dark-100 text-white rounded-lg px-3 py-2 border border-card-border focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
                    maxDate={new Date()}
                  />
                </span>
              </div>
              <div className="bg-primary-DEFAULT/50 rounded-2xl px-4 py-2 border border-card-border shadow-xl shadow-card-border/20 text-lg font-semibold text-text-base">
                Total:{" "}
                {Object.values(meals)
                  .flat()
                  .reduce(
                    (acc, food) => acc + Number(food.calories || 0),
                    0
                  )}{" "}
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
                  <div className="font-semibold text-text-base">
                    {meal.label}
                  </div>
                  <div className="text-sm text-text-muted">
                    {meals[meal.id].length} items
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Current Meal Section - Modified Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Meal Entry Area */}
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
                <h3 className="text-xl font-semibold text-text-base mb-2">
                  No food logged yet
                </h3>
                <p className="text-text-muted mb-4">
                  Start tracking your {selectedMeal} to see your nutrition data
                </p>
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
                  <div
                    key={food.id || index}
                    onClick={() => showFoodSuggestion(food)}
                    className="bg-dark-300/50 rounded-xl p-4 border border-card-border relative group cursor-pointer hover:bg-dark-300/70 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-4">
                        <h3 className="font-semibold text-text-base flex items-center gap-2">
                          {food.name}
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            AI Ready
                          </span>
                        </h3>
                        <p className="text-sm text-text-muted">
                          {Number(food.quantity).toFixed(1)} {food.unit}
                        </p>
                        <p className="text-xs text-purple-400 mt-1">
                          Click for AI health analysis
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="flex items-center gap-2 p-2 text-text-muted rounded-xl border border-card-border hover:bg-dark-200/50 hover:border-primary-DEFAULT transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFood({ food, index });
                          }}
                          title="Edit quantity"
                        >
                          <Pencil className="text-primary-DEFAULT w-5 h-5" />
                          <span className="text-primary-DEFAULT font-medium">
                            Edit Quantity
                          </span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFoodFromMeal(selectedMeal, index);
                          }}
                          className="relative p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-card-border hover:border-red-500 rounded-lg transition-all duration-200"
                          title="Delete this food item"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                        <div className="font-semibold text-text-base">
                          {Number(food.calories).toFixed(1)} kcal
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-dark-200 p-2 rounded-lg text-center">
                        <div className="text-sm text-text-muted">Protein</div>
                        <div className="font-semibold text-text-base">
                          {Number(food.protein).toFixed(1)}g
                        </div>
                      </div>
                      <div className="bg-dark-200 p-2 rounded-lg text-center">
                        <div className="text-sm text-text-muted">Carbs</div>
                        <div className="font-semibold text-text-base">
                          {Number(food.carbs).toFixed(1)}g
                        </div>
                      </div>
                      <div className="bg-dark-200 p-2 rounded-lg text-center">
                        <div className="text-sm text-text-muted">Fat</div>
                        <div className="font-semibold text-text-base">
                          {Number(food.fat).toFixed(1)}g
                        </div>
                      </div>
                    </div>
                  </div>
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
                        {Number(
                          meals[selectedMeal].reduce(
                            (acc, food) => acc + (Number(food.calories) || 0),
                            0
                          )
                        ).toFixed(1)}
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
                      <span className="text-text-muted font-semibold">
                        Carbs:
                      </span>
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
                      <span className="text-text-muted font-semibold">
                        Fat:
                      </span>
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

            {/* Food Suggestion Card */}
            <div>
              <FoodSuggestionCard
                suggestion={currentSuggestion}
                loading={suggestionLoading}
                foodName={selectedFoodForSuggestion}
                error={suggestionError}
              />
            </div>
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
              addFoodToMeal={addFoodToMeal}
            />
          )}

          {editingFood && (
            <QuantityInputModal
              food={editingFood.food}
              onClose={() => setEditingFood(null)}
              onSave={async (newQuantity, servingLabel, servingGrams) => {
                // Calculate per-gram nutrients
                const perGram = {
                  calories:
                    editingFood.food.calories / editingFood.food.quantity,
                  protein: editingFood.food.protein / editingFood.food.quantity,
                  carbs: editingFood.food.carbs / editingFood.food.quantity,
                  fat: editingFood.food.fat / editingFood.food.quantity,
                };
                const newFood = {
                  ...editingFood.food,
                  quantity: newQuantity,
                  servingLabel,
                  servingGrams,
                  calories: +(perGram.calories * newQuantity).toFixed(1),
                  protein: +(perGram.protein * newQuantity).toFixed(1),
                  carbs: +(perGram.carbs * newQuantity).toFixed(1),
                  fat: +(perGram.fat * newQuantity).toFixed(1),
                };
                // Update in meals state
                setMeals((prev) => ({
                  ...prev,
                  [selectedMeal]: prev[selectedMeal].map((f, i) =>
                    i === editingFood.index ? newFood : f
                  ),
                }));
                // Update in backend
                const mealEntry = mealEntries[selectedMeal];
                if (mealEntry) {
                  const updatedItems = mealEntry.items.map((f, i) =>
                    i === editingFood.index ? newFood : f
                  );
                  await updateMealEntry(mealEntry._id, { items: updatedItems });
                  setMealEntries((prev) => ({
                    ...prev,
                    [selectedMeal]: { ...mealEntry, items: updatedItems },
                  }));
                  toast.success("Quantity updated!");
                }
                setEditingFood(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}