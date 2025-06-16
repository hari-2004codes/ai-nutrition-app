import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus } from 'lucide-react';
import { getFoodAutocomplete, getFoodDetails } from '../../services/fatSecretApi';

export default function FoodSearch({ onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchTerm.trim().length > 2) {
        setLoading(true);
        setError(null);
        setDebugInfo(null);
        
        try {
          console.log('Searching for:', searchTerm);
          const response = await getFoodAutocomplete(searchTerm);
          console.log('Search response:', response);
          
          if (response.foods && response.foods.food) {
            const foods = Array.isArray(response.foods.food)
              ? response.foods.food
              : [response.foods.food];
            
            console.log('Processing foods:', foods);
            
            // Get details for each food
            const detailedResults = await Promise.all(
              foods.map(async (food) => {
                try {
                  console.log('Fetching details for:', food.food_name);
                  const details = await getFoodDetails(food.food_id);
                  console.log('Food details:', details);
                  
                  if (!details.food || !details.food.servings || !details.food.servings.serving) {
                    console.warn('Invalid food details structure:', details);
                    return null;
                  }

                  const serving = Array.isArray(details.food.servings.serving)
                    ? details.food.servings.serving[0]
                    : details.food.servings.serving;

                  return {
                    id: food.food_id,
                    name: food.food_name,
                    calories: serving.calories || 0,
                    protein: serving.protein || 0,
                    carbs: serving.carbohydrate || 0,
                    fat: serving.fat || 0,
                    serving: `${serving.metric_serving_amount || 1} ${serving.metric_serving_unit || 'serving'}`
                  };
                } catch (error) {
                  console.error('Error fetching food details:', error);
                  setDebugInfo(prev => ({
                    ...prev,
                    detailsError: error.message,
                    foodId: food.food_id
                  }));
                  return null;
                }
              })
            );
            
            const validResults = detailedResults.filter(result => result !== null);
            console.log('Final processed results:', validResults);
            setSearchResults(validResults);
            
            if (validResults.length === 0) {
              setDebugInfo(prev => ({
                ...prev,
                noValidResults: true,
                totalFoods: foods.length
              }));
            }
          } else {
            console.warn('No foods in response:', response);
            setDebugInfo(prev => ({
              ...prev,
              noFoods: true,
              response
            }));
          }
        } catch (error) {
          console.error('Error searching foods:', error);
          setError('Failed to search foods. Please try again.');
          setDebugInfo(prev => ({
            ...prev,
            searchError: error.message,
            searchTerm
          }));
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-dark-200/50 backdrop-blur-lg rounded-2xl shadow-xl shadow-card-border/20 w-full max-w-2xl max-h-[80vh] overflow-hidden border border-card-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-card-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-text-base">Add Food</h2>
              <button
                onClick={onClose}
                className="p-2 text-text-muted hover:text-text-base hover:bg-dark-300/60 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search for foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-300/60 border border-card-border rounded-xl focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 text-text-base placeholder:text-text-muted"
                autoFocus
              />
            </div>
          </div>

          {/* Debug Info - Only visible in development */}
          {import.meta.env.DEV && debugInfo && (
            <div className="p-4 bg-dark-300/60 border-b border-card-border">
              <h3 className="text-sm font-semibold text-text-base mb-2">Debug Info:</h3>
              <pre className="text-xs text-text-muted overflow-auto max-h-32">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* Food List */}
          <div className="p-6 overflow-y-auto max-h-96">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-DEFAULT mx-auto"></div>
                <p className="text-text-muted mt-4">Searching foods...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-text-muted">{error}</p>
                {import.meta.env.DEV && (
                  <p className="text-xs text-red-400 mt-2">{debugInfo?.searchError}</p>
                )}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-text-muted">
                  {searchTerm.trim().length > 2 
                    ? `No foods found matching "${searchTerm}"`
                    : 'Start typing to search for foods...'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((food, index) => (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border border-card-border rounded-xl hover:border-primary-DEFAULT hover:bg-dark-300/60 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-DEFAULT to-primary-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">🥗</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-base">{food.name}</h4>
                        <p className="text-sm text-text-muted">{food.serving}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-text-base">{food.calories} cal</div>
                        <div className="text-xs text-text-muted">
                          P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onSelect(food)}
                        className="p-2 bg-primary-DEFAULT/50 text-white rounded-lg hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-card-border bg-dark-300/60">
            <p className="text-sm text-text-muted text-center">
              Powered by FatSecret API. Search for any food to get detailed nutritional information.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}