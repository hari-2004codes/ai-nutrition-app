import React, { useState, useEffect } from "react";
import api from '../api';
import {
  BookOpen,
  Plus,
  AlertCircle,
  Calendar,
  Flame,
  ChefHat,
  Utensils
} from "lucide-react";
import CreatePlanModal from "../components/mealplan_comp/CreatePlanModal";
import MealRecipeModal from '../components/mealplan_comp/MealRecipeModal';
import toast from 'react-hot-toast';
import { allPlaceholderPlans } from '../data/mealPlanPlaceholders';

export default function MealPlans() {
  const [allMealPlans, setAllMealPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all custom meal plans for the user
  const fetchAllMealPlans = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/mealplans');
      if (response.data.success) {
        const plans = response.data.data
          .filter(plan => plan.planType === 'custom' || plan.planType === 'ai-generated')
          .map(plan => ({
            id: plan._id,
            name: plan.name,
            description: plan.description,
            duration: `${plan.duration} days`,
            calories: `${plan.targetCalories}`,
            difficulty: plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1),
            prepTime: `${plan.prepTime} mins`,
            image: plan.image,
            tags: plan.tags || [],
            meals: plan.duration * (plan.mealTypes?.length || 3),
            data: plan.days,
            rating: plan.rating || 4.5,
            planType: plan.planType,
            generated: plan.isGenerated,
            custom: plan.isCustom,
            createdAt: plan.createdAt
          }));
        setAllMealPlans(plans);
      } else {
        throw new Error(response.data.message || 'Failed to fetch meal plans');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Please log in again to view your meal plans.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generate custom meal plan
  const handleGenerateCustomPlan = async (formData) => {
    setIsGenerating(true);
    toast.loading('Generating your meal plan. This may take up to a minute...');
    try {
      const response = await api.post('/mealplans/generate-custom', formData);
      if (response.data.success) {
        toast.dismiss();
        toast.success('Custom meal plan generated successfully!');
        await fetchAllMealPlans();
        setShowCreateModal(false);
      } else {
        toast.dismiss();
        throw new Error(response.data.message || 'Failed to generate custom meal plan');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate custom meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchAllMealPlans();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT"></div>
          <p className="mt-4 text-text-muted">Loading your meal plans...</p>
        </div>
      </div>
    );
  }

  // Helper to flatten placeholder plan for card
  const getPlaceholderCard = (placeholder) => {
    const plan = placeholder.plan[0]; // Only day 1 for card preview
    return {
      id: placeholder.id,
      name: placeholder.name + ' (Sample)',
      description: plan.meals.map(m => m.name).join(', '),
      duration: '5 days',
      calories: plan.meals.reduce((sum, m) => sum + (m.calories || 0), 0),
      difficulty: 'Sample',
      prepTime: '',
      image: '',
      tags: [placeholder.name, 'Sample'],
      meals: 15,
      data: placeholder.plan,
      rating: 5.0,
      planType: 'placeholder',
      generated: false,
      custom: false,
      createdAt: null,
      sample: true
    };
  };

  const displayPlans = allMealPlans.length > 0
    ? allMealPlans
    : allPlaceholderPlans.map(getPlaceholderCard);

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-DEFAULT to-primary-600 bg-clip-text text-transparent">
            My Meal Plans
          </h1>
          <p className="text-text-muted text-lg">
            All your custom meal plans in one place
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-primary-DEFAULT text-white rounded-xl hover:bg-primary-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {isGenerating ? 'Generating...' : 'Create Custom Plan'}
        </button>
      </div>

      {/* Custom Plans Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-base">Custom Plans</h2>
          <span className="text-text-muted text-sm">
            {displayPlans.length} plan{displayPlans.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPlans.length > 0 ? displayPlans.map((plan) => (
            <MealPlanCard 
              key={plan.id} 
              plan={plan} 
              onSelect={setSelectedMealPlan}
            />
          )) : (
            <div className="text-center py-12 col-span-full">
              <div className="bg-dark-200/50 rounded-2xl p-8 border border-card-border max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-base mb-2">No Meal Plans Yet</h3>
                <p className="text-text-muted mb-6">
                  Start by creating your first meal plan.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-dark-300 text-text-base rounded-xl hover:bg-dark-400 transition-all duration-300 disabled:opacity-50"
                >
                  Create Custom Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreatePlanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGenerate={handleGenerateCustomPlan}
        isGenerating={isGenerating}
      />
      {selectedMealPlan && (
        <MealRecipeModal
          mealPlan={selectedMealPlan}
          onClose={() => setSelectedMealPlan(null)}
        />
      )}
    </div>
  );
}

// Meal Plan Card Component
function MealPlanCard({ plan, onSelect }) {
  if (!plan || !plan.name || !plan.duration || !plan.planType || !Array.isArray(plan.data) || plan.data.length === 0) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
        Invalid meal plan data. Please try regenerating this plan.
      </div>
    );
  }
  // Fallback image if plan.image is missing
  const fallbackImage = 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg';
  const imageUrl = plan.image && plan.image.trim() ? plan.image : fallbackImage;
  return (
    <div
      onClick={() => onSelect(plan)}
      className="group cursor-pointer"
    >
      <div className="bg-dark-200 rounded-2xl overflow-hidden border border-card-border hover:border-primary-DEFAULT transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary-DEFAULT/10">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={plan.name} 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-200 to-transparent opacity-60" />
          {plan.sample && (
            <span className="absolute top-2 left-2 bg-primary-DEFAULT text-white text-xs px-3 py-1 rounded-full shadow">Sample Plan</span>
          )}
        </div>
        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-primary-DEFAULT transition-colors">
              {plan.name}
            </h3>
            <p className="text-text-muted mt-2 text-sm line-clamp-2">
              {plan.description}
            </p>
          </div>
          {/* Stats Grid with icons */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-text-muted">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{plan.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Flame className="w-4 h-4" />
              <span className="text-sm">{plan.calories} cal</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <ChefHat className="w-4 h-4" />
              <span className="text-sm">{plan.difficulty}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Utensils className="w-4 h-4" />
              <span className="text-sm">{plan.meals} meals</span>
            </div>
          </div>
          {/* Tags */}
          {plan.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {plan.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary-DEFAULT/10 text-primary-DEFAULT text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {plan.tags.length > 3 && (
                <span className="px-3 py-1 bg-dark-300 text-text-muted text-xs rounded-full">
                  +{plan.tags.length - 3} more
                </span>
              )}
            </div>
          )}
          {/* Action Button */}
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary-DEFAULT/10 text-primary-DEFAULT rounded-xl group-hover:bg-primary-DEFAULT group-hover:text-white transition-all duration-300">
            <BookOpen className="w-4 h-4" />
            View Plan
          </button>
        </div>
      </div>
    </div>
  );
}