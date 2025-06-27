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

export default function MealPlans() {
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const defaultPlans = [
    {
      id: 1,
      name: "Indian Vegetarian Thali",
      description: "Traditional Indian vegetarian meals with balanced nutrition",
      duration: "7 days",
      calories: "1,800-2,000",
      difficulty: "Moderate",
      cuisine: "Indian",
      rating: 4.8,
      image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
      tags: ["Vegetarian", "Traditional", "Balanced"],
      meals: 21,
      generated: false
    },
    {
      id: 2,
      name: "South Indian Special",
      description: "Authentic South Indian dishes with rich flavors",
      duration: "5 days",
      calories: "2,000-2,200",
      difficulty: "Easy",
      cuisine: "South Indian",
      rating: 4.9,
      image: "https://images.pexels.com/photos/4331489/pexels-photo-4331489.jpeg",
      tags: ["South Indian", "Authentic", "Spicy"],
      meals: 15,
      generated: false
    }
  ];

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

      {/* Meal Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...defaultPlans, ...mealPlans].map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => {
              if (plan.generated) {
                setSelectedMealPlan(plan);
              } else {
                setSelectedMeal(plan);
              }
            }}
            className="group cursor-pointer"
          >
            <div className="bg-dark-200 rounded-2xl overflow-hidden border border-card-border hover:border-primary-DEFAULT transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-primary-DEFAULT/10">
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={plan.image} 
                  alt={plan.name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-200 to-transparent opacity-60" />
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-dark-200/80 backdrop-blur-sm rounded-full px-3 py-1">
                  <Heart className="w-4 h-4 text-primary-DEFAULT" />
                  <span className="text-sm font-medium">{plan.rating}</span>
                </div>
                {plan.generated && (
                  <div className="absolute top-4 left-4 bg-primary-DEFAULT/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-xs font-medium text-white">AI Generated</span>
                  </div>
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

                {/* Stats Grid */}
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
                <div className="flex flex-wrap gap-2">
                  {plan.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary-DEFAULT/10 text-primary-DEFAULT text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary-DEFAULT/10 text-primary-DEFAULT rounded-xl group-hover:bg-primary-DEFAULT group-hover:text-white transition-all duration-300">
                  <BookOpen className="w-4 h-4" />
                  View Plan
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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