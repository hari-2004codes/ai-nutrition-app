import React, { useState } from "react";
import api from '../api';
import {
  Calendar,
  Clock,
  ChefHat,
  Heart,
  Plus,
  Utensils,
  Flame,
  BookOpen
} from "lucide-react";
import CreatePlanModal from "../components/mealplan_comp/CreatePlanModal";
import MealRecipeModal from '../components/mealplan_comp/MealRecipeModal';
import PersonalizedPlans from '../components/mealplan_comp/PersonalizedPlans';

export default function MealPlans() {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = async (formData) => {
    setIsGenerating(true);
    
    try {
      console.log('Generating custom meal plan with data:', formData);

      const response = await api.post('/mealplans/generate-custom', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response.data);

      if (response.data.success) {
        const planData = response.data.data;

        const newPlan = {
          id: planData._id,
          name: planData.name,
          description: planData.description || 'AI generated personalized meal plan',
          duration: `${planData.duration} days`,
          calories: `${planData.targetCalories}`,
          difficulty: planData.difficulty.charAt(0).toUpperCase() + planData.difficulty.slice(1),
          prepTime: `${planData.prepTime} mins`,
          image: planData.image || "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
          tags: planData.tags || formData.mealTypes.map(meal => 
            meal.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          ),
          meals: planData.duration * (planData.mealTypes?.length || formData.mealTypes.length),
          data: planData.days,
          rating: planData.rating || 5.0,
          generated: true,
          custom: true
        };

        console.log('Custom meal plan generated and saved successfully:', newPlan);
        
        // Show success message
        alert('Custom meal plan generated and saved successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to generate meal plan');
      }

    } catch (error) {
      console.error("Error generating custom meal plan:", error);
      
      let errorMessage = 'Failed to generate custom meal plan. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-DEFAULT to-primary-600 bg-clip-text text-transparent">
            Indian Meal Plans
          </h1>
          <p className="text-text-muted text-lg">
            Discover authentic Indian recipes and personalized meal plans
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

      {/* Loading State */}
      {isGenerating && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-DEFAULT"></div>
          <p className="mt-2 text-text-muted">Generating your custom meal plan...</p>
        </div>
      )}

      {/* Personalized Plans Section */}
      <PersonalizedPlans onCustomPlanCreate={handleGeneratePlan} />

      {/* Modals */}
      <CreatePlanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGenerate={handleGeneratePlan}
      />

      {selectedMeal && (
        <MealRecipeModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}

      {selectedMealPlan && (
        <MealRecipeModal
          mealPlan={selectedMealPlan}
          onClose={() => setSelectedMealPlan(null)}
        />
      )}
    </div>
  );
}