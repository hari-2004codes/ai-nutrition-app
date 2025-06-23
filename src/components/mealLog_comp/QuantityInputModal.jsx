import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Minus, Plus, X, Utensils } from 'lucide-react';

export default function QuantityInputModal({ isOpen, onClose, dish, onConfirm }) {
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState('g');
  const [loading, setLoading] = useState(false);
  const [nutritionInfo, setNutritionInfo] = useState(null);
  const [error, setError] = useState(null);
  const [dishImage, setDishImage] = useState(null);

  const fetchNutritionInfo = useCallback(async (qty, unt) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('/api/meals/nutrition', {
        dishId: dish.dishId,
        quantity: qty,
        unit: unt
      });
      
      setNutritionInfo(res.data);
    } catch (error) {
      console.error('Nutrition fetch error:', error);
      setError('Failed to load nutrition data. Using estimated values.');
      
      // Fallback nutrition data
      setNutritionInfo({
        calories: Math.round(150 * (qty / 100)),
        nutrients: {
          protein: Math.round(5 * (qty / 100)),
          carbohydrate: Math.round(20 * (qty / 100)),
          fat: Math.round(8 * (qty / 100))
        }
      });
    } finally {
      setLoading(false);
    }
  }, [dish?.dishId]);

  useEffect(() => {
    if (isOpen && dish) {
      setQuantity(100);
      setUnit('g');
      setNutritionInfo(null);
      setError(null);
      fetchNutritionInfo(100, 'g');
      
      // Fetch dish image from LogMeal if available
      if (dish.dishId) {
        axios.get(`/api/meals/dishes/${dish.dishId}/image`)
          .then(res => {
            if (res.data.imageUrl) {
              setDishImage(res.data.imageUrl);
            }
          })
          .catch(() => {
            // Ignore errors for image
          });
      }
    }
  }, [isOpen, dish, fetchNutritionInfo]);

  const handleQuantityChange = (newQuantity) => {
    const validQuantity = Math.max(10, Math.min(1000, newQuantity));
    setQuantity(validQuantity);
    fetchNutritionInfo(validQuantity, unit);
  };

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    setUnit(newUnit);
    fetchNutritionInfo(quantity, newUnit);
  };

  const handleSubmit = async () => {
    if (!nutritionInfo) return;
    
    const food = {
      id: dish.dishId,
      name: dish.name,
      quantity,
      unit,
      calories: nutritionInfo?.calories || 0,
      protein: nutritionInfo?.nutrients?.protein || 0,
      carbs: nutritionInfo?.nutrients?.carbohydrate || 0,
      fat: nutritionInfo?.nutrients?.fat || 0,
      source: 'image',
      imageUrl: dishImage
    };
    
    onConfirm(food);
  };

  if (!dish || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-dark-200/90 backdrop-blur-md rounded-2xl p-6 w-[95%] max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-card-border relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-base">Set Quantity</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-dark-300/70 text-text-muted hover:text-text-base transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden mb-3 bg-dark-300 flex items-center justify-center">
                {dishImage ? (
                  <img 
                    src={dishImage} 
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Utensils size={32} className="text-text-muted" />
                )}
              </div>
              <div className="text-xl font-semibold text-text-base text-center">
                {dish.name}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-dark-300/70 rounded-xl p-4 border border-card-border">
              <div className="flex justify-between items-center mb-4">
                <div className="text-text-muted">Quantity:</div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(quantity - 10)}
                    disabled={quantity <= 10}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-200/70 hover:bg-dark-400/70 disabled:opacity-50"
                  >
                    <Minus size={16} className="text-text-base" />
                  </button>
                  
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    className="w-20 mx-2 px-2 py-1 text-center bg-dark-200/70 border border-card-border rounded-lg text-text-base"
                  />
                  
                  <button
                    onClick={() => handleQuantityChange(quantity + 10)}
                    disabled={quantity >= 1000}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-dark-200/70 hover:bg-dark-400/70 disabled:opacity-50"
                  >
                    <Plus size={16} className="text-text-base" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-text-muted">Unit:</div>
                <select
                  value={unit}
                  onChange={handleUnitChange}
                  className="px-3 py-2 bg-dark-200/70 border border-card-border rounded-lg text-text-base"
                >
                  <option value="g">grams (g)</option>
                  <option value="ml">milliliters (ml)</option>
                  <option value="oz">ounces (oz)</option>
                  <option value="cup">cups</option>
                  <option value="tbsp">tablespoons</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-DEFAULT"></div>
              </div>
            ) : nutritionInfo ? (
              <div className="bg-dark-300/70 rounded-xl p-4 border border-card-border">
                <h3 className="text-text-base font-medium mb-3">Nutrition Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-dark-200/70 p-3 rounded-lg">
                    <div className="text-text-muted text-sm">Calories</div>
                    <div className="text-text-base font-semibold">{nutritionInfo.calories || 0} kcal</div>
                  </div>
                  <div className="bg-dark-200/70 p-3 rounded-lg">
                    <div className="text-text-muted text-sm">Protein</div>
                    <div className="text-text-base font-semibold">{nutritionInfo.nutrients?.protein || 0}g</div>
                  </div>
                  <div className="bg-dark-200/70 p-3 rounded-lg">
                    <div className="text-text-muted text-sm">Carbs</div>
                    <div className="text-text-base font-semibold">{nutritionInfo.nutrients?.carbohydrate || 0}g</div>
                  </div>
                  <div className="bg-dark-200/70 p-3 rounded-lg">
                    <div className="text-text-muted text-sm">Fat</div>
                    <div className="text-text-base font-semibold">{nutritionInfo.nutrients?.fat || 0}g</div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-card-border hover:bg-dark-300/70 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !nutritionInfo}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                  loading || !nutritionInfo
                    ? 'bg-dark-300/70 text-text-muted cursor-not-allowed'
                    : 'bg-primary-DEFAULT text-white hover:bg-primary-600'
                }`}
              >
                Add to Meal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}