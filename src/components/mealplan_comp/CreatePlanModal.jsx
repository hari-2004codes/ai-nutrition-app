
import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreatePlanModal({ isOpen, onClose, onGenerate }) {
  const [formData, setFormData] = useState({
    name: '',
    duration: '7',
    calories: '2200',
    diet: 'omnivore',
    excludes: [],
    intolerances: [],
    meals: ['breakfast', 'lunch', 'dinner'],
    difficulty: 'easy',
    time: '15-30',
    ingredients: '10'
  });

  const diets = ['omnivore', 'vegetarian', 'vegan', 'keto', 'mediterranean', 'paleo', 'high-protein', 'low-carb'];
  const excludeOptions = ['meat', 'poultry', 'seafood', 'eggs', 'dairy'];
  const intolerances = ['gluten-free', 'lactose-free', 'nut-free', 'soy-free', 'shellfish-free'];
  const meals = ['breakfast', 'lunch', 'dinner', 'snack'];
  const difficulties = ['easy', 'moderate', 'advanced'];
  const times = ['5-15', '15-30', '30+'];
  const ingredientCounts = ['5', '10', 'unlimited'];

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
    onGenerate(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-200 rounded-2xl w-full max-w-3xl border border-card-border p-6 relative text-white max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-text-muted hover:text-white">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Create Custom Meal Plan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-text-muted">Plan Name</label>
            <input
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              placeholder="Optional"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-text-muted">Duration (days)</label>
            <select
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.duration}
              onChange={e => handleChange('duration', e.target.value)}
            >
              {[3, 5, 7, 14].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-text-muted">Calories/day</label>
            <input
              type="number"
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.calories}
              onChange={e => handleChange('calories', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-text-muted">Diet Type</label>
            <select
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.diet}
              onChange={e => handleChange('diet', e.target.value)}
            >
              {diets.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-text-muted">Exclude Ingredients</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {excludeOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleArrayValue('excludes', opt)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${formData.excludes.includes(opt) ? 'bg-primary-DEFAULT text-white' : 'text-text-muted border-card-border'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-text-muted">Intolerances</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {intolerances.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleArrayValue('intolerances', opt)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${formData.intolerances.includes(opt) ? 'bg-primary-DEFAULT text-white' : 'text-text-muted border-card-border'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-text-muted">Meal Types</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {meals.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleArrayValue('meals', opt)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${formData.meals.includes(opt) ? 'bg-primary-DEFAULT text-white' : 'text-text-muted border-card-border'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-text-muted">Prep Difficulty</label>
            <select
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.difficulty}
              onChange={e => handleChange('difficulty', e.target.value)}
            >
              {difficulties.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-text-muted">Prep Time per Meal</label>
            <select
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.time}
              onChange={e => handleChange('time', e.target.value)}
            >
              {times.map(t => <option key={t}>{t} mins</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-text-muted">Max Ingredients/Meal</label>
            <select
              className="w-full mt-1 p-2 bg-dark-300/60 border border-card-border rounded-xl text-white"
              value={formData.ingredients}
              onChange={e => handleChange('ingredients', e.target.value)}
            >
              {ingredientCounts.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary-DEFAULT text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition"
          >
            Generate Plan
          </button>
        </div>
      </div>
    </div>
  );
}
