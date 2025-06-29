import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2, AlertCircle, Plus } from 'lucide-react';
import { getFoodAutocomplete, getFoodDetails, parseNutritionData } from '../../services/fatSecretApi';

export default function FoodSearch({ onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodDetails, setFoodDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Debounce search function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const searchFoods = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getFoodAutocomplete(searchQuery);
      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search foods. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(searchFoods, 500), []);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleFoodSelect = async (food) => {
    setSelectedFood(food);
    setLoadingDetails(true);
    setError('');

    try {
      const details = await getFoodDetails(food.food_id);
      const nutritionData = parseNutritionData(details);
      setFoodDetails(nutritionData);
    } catch (err) {
      console.error('Details error:', err);
      setError(err.message || 'Failed to load food details.');
      setFoodDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddFood = () => {
    if (foodDetails) {
      onSelect(foodDetails);
      onClose();
    }
  };

  const handleBackToSearch = () => {
    setSelectedFood(null);
    setFoodDetails(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {selectedFood ? 'Food Details' : 'Search Foods'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {!selectedFood ? (
          <>
            {/* Search Input */}
            <div className="p-6 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for foods..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-900/50 border border-red-700 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-200">{error}</span>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="ml-2 text-gray-400">Searching...</span>
                </div>
              )}

              {!loading && !error && query.length >= 2 && results.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-400">No foods found for "{query}"</p>
                  <p className="text-sm text-gray-500 mt-2">Try different keywords</p>
                </div>
              )}

              {!loading && query.length < 2 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🥗</div>
                  <p className="text-gray-400">Start typing to search for foods</p>
                  <p className="text-sm text-gray-500 mt-2">Enter at least 2 characters</p>
                </div>
              )}

              <div className="space-y-2">
                {results.map((food, index) => (
                  <button
                    key={`${food.food_id}-${index}`}
                    onClick={() => handleFoodSelect(food)}
                    className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 text-left transition-colors"
                  >
                    <div className="font-medium text-white">{food.food_name}</div>
                    {food.brand_name && (
                      <div className="text-sm text-gray-400 mt-1">{food.brand_name}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {food.food_description || 'Click for nutrition details'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Food Details */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingDetails && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="ml-2 text-gray-400">Loading details...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-900/50 border border-red-700 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-200">{error}</span>
                </div>
              )}

              {foodDetails && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{foodDetails.name}</h3>
                    {foodDetails.brand && (
                      <p className="text-gray-400">{foodDetails.brand}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Serving: {foodDetails.servingSize}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <div className="text-2xl font-bold text-white">{foodDetails.calories}</div>
                      <div className="text-sm text-gray-400">Calories</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <div className="text-2xl font-bold text-white">{foodDetails.protein}g</div>
                      <div className="text-sm text-gray-400">Protein</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <div className="text-2xl font-bold text-white">{foodDetails.carbs}g</div>
                      <div className="text-sm text-gray-400">Carbs</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <div className="text-2xl font-bold text-white">{foodDetails.fat}g</div>
                      <div className="text-sm text-gray-400">Fat</div>
                    </div>
                  </div>

                  {(foodDetails.fiber || foodDetails.sugar || foodDetails.sodium) && (
                    <div className="grid grid-cols-3 gap-4">
                      {foodDetails.fiber > 0 && (
                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 text-center">
                          <div className="font-semibold text-white">{foodDetails.fiber}g</div>
                          <div className="text-xs text-gray-400">Fiber</div>
                        </div>
                      )}
                      {foodDetails.sugar > 0 && (
                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 text-center">
                          <div className="font-semibold text-white">{foodDetails.sugar}g</div>
                          <div className="text-xs text-gray-400">Sugar</div>
                        </div>
                      )}
                      {foodDetails.sodium > 0 && (
                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 text-center">
                          <div className="font-semibold text-white">{foodDetails.sodium}mg</div>
                          <div className="text-xs text-gray-400">Sodium</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={handleBackToSearch}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Search
              </button>
              {foodDetails && (
                <button
                  onClick={handleAddFood}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Meal
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}