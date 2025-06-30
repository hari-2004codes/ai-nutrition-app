import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreatePlanModal({ isOpen, onClose, onGenerate, isGenerating }) {
  const [formData, setFormData] = useState({
    name: '',
    duration: '7',
    calories: '2200',
    diet: 'vegetarian',
    exclude: [], // Changed from 'excludes' to 'exclude'
    intolerances: [],
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    difficulty: 'moderate',
    prepTime: '30',
    ingredients: '10'
  });

  const diets = [
    'vegetarian',
    'non-vegetarian',
    'vegan',
    'jain',
    'south-indian',
    'north-indian',
    'gujarati',
    'punjabi'
  ];

  const excludeOptions = [
    'onion-garlic',
    'meat',
    'seafood',
    'eggs',
    'dairy'
  ];

  const intolerances = [
    'gluten-free',
    'lactose-free',
    'nut-free',
    'soy-free'
  ];

  const mealTypes = [
    'breakfast',
    'lunch',
    'dinner',
    'evening-snack'
  ];

  const difficulties = ['easy', 'moderate', 'advanced'];
  const prepTimes = ['15', '30', '45', '60'];
  const ingredientCounts = ['5', '10', '15', 'unlimited'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field, value) => {
    setFormData(prev => {
      const arr = new Set(prev[field]);
      arr.has(value) ? arr.delete(value) : arr.add(value);
      return { ...prev, [field]: [...arr] };
    });
  };

  const handleSubmit = () => {
    if (isGenerating) return; // Prevent double submit
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter a plan name');
      return;
    }

    if (formData.mealTypes.length === 0) {
      alert('Please select at least one meal type');
      return;
    }

    const formattedData = {
      name: formData.name,
      duration: parseInt(formData.duration),
      calories: parseInt(formData.calories),
      diet: formData.diet,
      exclude: formData.exclude, // This now matches the backend expectation
      intolerances: formData.intolerances,
      mealTypes: formData.mealTypes,
      difficulty: formData.difficulty,
      prepTime: parseInt(formData.prepTime),
      ingredients: formData.ingredients
    };

    console.log('Submitting form data:', formattedData);
    onGenerate(formattedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-dark-200 rounded-2xl w-full max-w-3xl border border-card-border p-6 relative text-white max-h-[90vh] overflow-y-auto">
        <button onClick={isGenerating ? undefined : onClose} className="absolute top-4 right-4 p-1 text-text-muted hover:text-white" disabled={isGenerating}>
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Create Indian Meal Plan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-base">Plan Name</label>
            <input
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              placeholder="Enter plan name"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-text-base">Duration (days)</label>
            <select
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.duration}
              onChange={e => handleChange('duration', e.target.value)}
            >
              {[1, 3, 5, 7, 14, 30].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-text-base">Daily Calories</label>
            <input
              type="number"
              min="1200"
              max="4000"
              step="100"
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.calories}
              onChange={e => handleChange('calories', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-text-base">Cuisine Type</label>
            <select
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.diet}
              onChange={e => handleChange('diet', e.target.value)}
            >
              {diets.map(d => (
                <option key={d} value={d}>
                  {d.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-text-base">Exclude Ingredients</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {excludeOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleArrayValue('exclude', opt)} // Changed from 'excludes'
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    formData.exclude.includes(opt) // Changed from 'excludes'
                      ? 'bg-primary-DEFAULT text-white'
                      : 'text-text-muted border-card-border'
                  }`}
                >
                  {opt.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-text-base">Dietary Restrictions</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {intolerances.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleArrayValue('intolerances', opt)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    formData.intolerances.includes(opt)
                      ? 'bg-primary-DEFAULT text-white'
                      : 'text-text-muted border-card-border'
                  }`}
                >
                  {opt.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-text-base">Meal Types *</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {mealTypes.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleArrayValue('mealTypes', opt)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    formData.mealTypes.includes(opt)
                      ? 'bg-primary-DEFAULT text-white'
                      : 'text-text-muted border-card-border'
                  }`}
                >
                  {opt.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-text-base">Cooking Difficulty</label>
            <select
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.difficulty}
              onChange={e => handleChange('difficulty', e.target.value)}
            >
              {difficulties.map(d => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-text-base">Prep Time (minutes)</label>
            <select
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.prepTime}
              onChange={e => handleChange('prepTime', e.target.value)}
            >
              {prepTimes.map(t => (
                <option key={t} value={t}>{t} mins</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-text-base">Max Ingredients per Recipe</label>
            <select
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.ingredients}
              onChange={e => handleChange('ingredients', e.target.value)}
            >
              {ingredientCounts.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary-DEFAULT text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition flex items-center gap-2 disabled:opacity-60"
            disabled={isGenerating}
          >
            {isGenerating && <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full mr-2"></span>}
            {isGenerating ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}