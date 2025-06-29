import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2, AlertCircle, Plus } from 'lucide-react';
import { getFoodAutocomplete, getFoodDetails, parseNutritionData } from '../../services/fatSecretApi';
import ReactDOM from 'react-dom';

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

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-200/90 backdrop-blur-md rounded-2xl border border-card-border shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <h2 className="text-xl font-semibold text-text-base">
            {selectedFood ? 'Food Details' : 'Search Foods'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-300/70 rounded-lg transition-colors text-text-muted hover:text-text-base"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!selectedFood ? (
          <>
            {/* Search Input */}
            <div className="p-6 border-b border-card-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search for foods..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-dark-100/50 border border-card-border rounded-lg text-text-base placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/50 rounded-lg mb-4 text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-DEFAULT" />
                  <span className="ml-2 text-text-muted">Searching...</span>
                </div>
              )}

              {!loading && !error && query.length >= 2 && results.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-text-muted">No foods found for "{query}"</p>
                  <p className="text-sm text-text-muted mt-2">Try different keywords</p>
                </div>
              )}

              {!loading && query.length < 2 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🥗</div>
                  <p className="text-text-muted">Start typing to search for foods</p>
                  <p className="text-sm text-text-muted mt-2">Enter at least 2 characters</p>
                </div>
              )}

              <div className="space-y-2">
                {results.map((food, index) => (
                  <button
                    key={`${food.food_id}-${index}`}
                    onClick={() => handleFoodSelect(food)}
                    className="w-full p-4 bg-dark-100/50 hover:bg-dark-200 rounded-lg border border-card-border text-left transition-colors"
                  >
                    <div className="font-medium text-text-base">{food.food_name}</div>
                    {food.brand_name && (
                      <div className="text-sm text-text-muted mt-1">{food.brand_name}</div>
                    )}
                    <div className="text-xs text-text-muted mt-2">
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
                  <Loader2 className="w-6 h-6 animate-spin text-primary-DEFAULT" />
                  <span className="ml-2 text-text-muted">Loading details...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/50 rounded-lg mb-4 text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {foodDetails && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-text-base mb-2">{foodDetails.name}</h3>
                    {foodDetails.brand && (
                      <p className="text-text-muted">{foodDetails.brand}</p>
                    )}
                    <p className="text-sm text-text-muted mt-1">
                      Serving: {foodDetails.servingSize}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-200 p-4 rounded-lg border border-card-border">
                      <div className="text-2xl font-bold text-text-base">{foodDetails.calories}</div>
                      <div className="text-sm text-text-muted">Calories</div>
                    </div>
                    <div className="bg-dark-200 p-4 rounded-lg border border-card-border">
                      <div className="text-2xl font-bold text-text-base">{foodDetails.protein}g</div>
                      <div className="text-sm text-text-muted">Protein</div>
                    </div>
                    <div className="bg-dark-200 p-4 rounded-lg border border-card-border">
                      <div className="text-2xl font-bold text-text-base">{foodDetails.carbs}g</div>
                      <div className="text-sm text-text-muted">Carbs</div>
                    </div>
                    <div className="bg-dark-200 p-4 rounded-lg border border-card-border">
                      <div className="text-2xl font-bold text-text-base">{foodDetails.fat}g</div>
                      <div className="text-sm text-text-muted">Fat</div>
                    </div>
                  </div>

                  {(foodDetails.fiber || foodDetails.sugar || foodDetails.sodium) && (
                    <div className="grid grid-cols-3 gap-4">
                      {foodDetails.fiber > 0 && (
                        <div className="bg-dark-200 p-3 rounded-lg border border-card-border text-center">
                          <div className="font-semibold text-text-base">{foodDetails.fiber}g</div>
                          <div className="text-xs text-text-muted">Fiber</div>
                        </div>
                      )}
                      {foodDetails.sugar > 0 && (
                        <div className="bg-dark-200 p-3 rounded-lg border border-card-border text-center">
                          <div className="font-semibold text-text-base">{foodDetails.sugar}g</div>
                          <div className="text-xs text-text-muted">Sugar</div>
                        </div>
                      )}
                      {foodDetails.sodium > 0 && (
                        <div className="bg-dark-200 p-3 rounded-lg border border-card-border text-center">
                          <div className="font-semibold text-text-base">{foodDetails.sodium}mg</div>
                          <div className="text-xs text-text-muted">Sodium</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-6 border-t border-card-border">
              <button
                onClick={handleBackToSearch}
                className="px-4 py-2 rounded-lg bg-dark-300/70 text-text-base hover:bg-dark-300 transition-colors"
              >
                Back to Search
              </button>
              <button
                onClick={handleAddFood}
                disabled={!foodDetails}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  foodDetails ? 'bg-primary-DEFAULT text-white hover:bg-primary-600' : 'bg-dark-300/70 text-text-muted cursor-not-allowed'
                }`}
              >
                Add Food
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}