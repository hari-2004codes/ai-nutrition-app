import React, { useState } from "react";
import axios from 'axios';
import { motion } from "framer-motion";
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
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);


  const handleGeneratePlan = async (formData) => {
    setIsGenerating(true);
    
    try {
      console.log('Generating meal plan with data:', formData);

      const response = await axios.post('/api/mealplans/generate', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response.data);

      const planData = response.data.data;

      const newPlan = {
        id: Date.now(),
        name: formData.name || 'Custom Indian Meal Plan',
        description: 'AI generated personalized Indian meal plan',
        duration: `${formData.duration} days`,
        calories: `${formData.calories}`,
        difficulty: formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1),
        prepTime: `${formData.prepTime} mins`,
        image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
        tags: formData.mealTypes.map(meal => 
          meal.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        ),
        meals: formData.duration * formData.mealTypes.length,
        data: planData,
        rating: 5.0,
        generated: true
      };

      setMealPlans(prevPlans => [newPlan, ...prevPlans]);
      console.log('Meal plan generated successfully:', newPlan);
      
      // Show success message
      alert('Meal plan generated successfully!');

    } catch (error) {
      console.error("Error generating meal plan:", error);
      
      let errorMessage = 'Failed to generate meal plan. ';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-8"
    >
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
    </motion.div>
  );
}