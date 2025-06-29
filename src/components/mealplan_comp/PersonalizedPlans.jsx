import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Calendar,
  Clock,
  ChefHat,
  Heart,
  Utensils,
  Flame,
  BookOpen,
  Sparkles,
  Target,
  Activity
} from "lucide-react";
import CreatePlanModal from "./CreatePlanModal";
import MealRecipeModal from './MealRecipeModal';

export default function PersonalizedPlans({ onCustomPlanCreate }) {
  const [userData, setUserData] = useState(null);
  const [personalizedPlans, setPersonalizedPlans] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const stored = localStorage.getItem('nutritionUser');
    if (stored) {
      const data = JSON.parse(stored);
      setUserData(data);
      
      // Only generate personalized plans if user has completed onboarding
      if (data.onboardingCompleted && data.tdee && data.goal && data.preferences) {
        generatePersonalizedPlans(data);
      }
    }
  }, []);

  const generatePersonalizedPlans = async (userProfile) => {
    if (!userProfile) return;

    setIsGenerating(true);
    const plans = [];

    try {
      // Plan 1: Weight Loss Focus
      if (userProfile.goal === 'lose') {
        try {
          const weightLossPlan = await generatePlan({
            name: "Weight Loss Journey",
            description: "Calorie-controlled meals to help you achieve your weight loss goals",
            duration: 7,
            calories: Math.max(1200, userProfile.tdee - 500),
            diet: mapPreferencesToDiet(userProfile.preferences),
            exclude: [],
            intolerances: getIntolerances(userProfile.preferences),
            mealTypes: ['breakfast', 'lunch', 'dinner'],
            difficulty: 'easy',
            prepTime: 30,
            ingredients: '10'
          });
          if (weightLossPlan) plans.push(weightLossPlan);
        } catch (error) {
          console.error("Error generating weight loss plan:", error);
        }
      }

      // Plan 2: Weight Maintenance
      if (userProfile.goal === 'maintain') {
        try {
          const maintenancePlan = await generatePlan({
            name: "Balanced Lifestyle",
            description: "Perfectly balanced meals to maintain your current weight",
            duration: 7,
            calories: userProfile.tdee,
            diet: mapPreferencesToDiet(userProfile.preferences),
            exclude: [],
            intolerances: getIntolerances(userProfile.preferences),
            mealTypes: ['breakfast', 'lunch', 'dinner'],
            difficulty: 'moderate',
            prepTime: 45,
            ingredients: '15'
          });
          if (maintenancePlan) plans.push(maintenancePlan);
        } catch (error) {
          console.error("Error generating maintenance plan:", error);
        }
      }

      // Plan 3: Weight Gain/Muscle Building
      if (userProfile.goal === 'gain') {
        try {
          const gainPlan = await generatePlan({
            name: "Muscle Building Power",
            description: "High-protein meals to support muscle growth and weight gain",
            duration: 7,
            calories: userProfile.tdee + 300,
            diet: mapPreferencesToDiet(userProfile.preferences),
            exclude: [],
            intolerances: getIntolerances(userProfile.preferences),
            mealTypes: ['breakfast', 'lunch', 'dinner', 'evening-snack'],
            difficulty: 'moderate',
            prepTime: 45,
            ingredients: '15'
          });
          if (gainPlan) plans.push(gainPlan);
        } catch (error) {
          console.error("Error generating gain plan:", error);
        }
      }

      // Plan 4: Quick & Easy (for busy lifestyles)
      try {
        const quickPlan = await generatePlan({
          name: "Quick & Healthy",
          description: "Fast and nutritious meals perfect for your busy lifestyle",
          duration: 5,
          calories: userProfile.tdee,
          diet: mapPreferencesToDiet(userProfile.preferences),
          exclude: [],
          intolerances: getIntolerances(userProfile.preferences),
          mealTypes: ['breakfast', 'lunch', 'dinner'],
          difficulty: 'easy',
          prepTime: 15,
          ingredients: '8'
        });
        if (quickPlan) plans.push(quickPlan);
      } catch (error) {
        console.error("Error generating quick plan:", error);
      }

      // Plan 5: Weekend Special (more elaborate)
      try {
        const weekendPlan = await generatePlan({
          name: "Weekend Feast",
          description: "Special weekend meals with more elaborate recipes",
          duration: 2,
          calories: userProfile.tdee + 200,
          diet: mapPreferencesToDiet(userProfile.preferences),
          exclude: [],
          intolerances: getIntolerances(userProfile.preferences),
          mealTypes: ['breakfast', 'lunch', 'dinner'],
          difficulty: 'advanced',
          prepTime: 60,
          ingredients: 'unlimited'
        });
        if (weekendPlan) plans.push(weekendPlan);
      } catch (error) {
        console.error("Error generating weekend plan:", error);
      }

      // Plan 6: Budget-Friendly
      try {
        const budgetPlan = await generatePlan({
          name: "Budget-Friendly Meals",
          description: "Delicious meals that are easy on your wallet",
          duration: 7,
          calories: userProfile.tdee,
          diet: mapPreferencesToDiet(userProfile.preferences),
          exclude: ['expensive-ingredients'],
          intolerances: getIntolerances(userProfile.preferences),
          mealTypes: ['breakfast', 'lunch', 'dinner'],
          difficulty: 'easy',
          prepTime: 30,
          ingredients: '8'
        });
        if (budgetPlan) plans.push(budgetPlan);
      } catch (error) {
        console.error("Error generating budget plan:", error);
      }

      setPersonalizedPlans(plans);
      
      if (plans.length === 0) {
        console.warn("No personalized plans were generated successfully");
      } else {
        console.log(`Successfully generated ${plans.length} personalized plans`);
      }
    } catch (error) {
      console.error("Error generating personalized plans:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePlan = async (planConfig) => {
    try {
      const response = await axios.post('/api/mealplans/generate', planConfig, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        id: Date.now() + Math.random(),
        name: planConfig.name,
        description: planConfig.description,
        duration: `${planConfig.duration} days`,
        calories: `${planConfig.calories}`,
        difficulty: planConfig.difficulty.charAt(0).toUpperCase() + planConfig.difficulty.slice(1),
        prepTime: `${planConfig.prepTime} mins`,
        image: getPlanImage(planConfig.name),
        tags: planConfig.mealTypes.map(meal => 
          meal.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        ),
        meals: planConfig.duration * planConfig.mealTypes.length,
        data: response.data.data,
        rating: 5.0,
        generated: true,
        personalized: true
      };
    } catch (error) {
      console.error(`Error generating plan ${planConfig.name}:`, error);
      return null;
    }
  };

  const mapPreferencesToDiet = (preferences) => {
    const dietMap = {
      'vegan': 'vegan',
      'vegetarian': 'vegetarian',
      'paleo': 'non-vegetarian',
      'keto': 'non-vegetarian',
      'mediterranean': 'non-vegetarian',
      'gluten-free': 'vegetarian',
      'lactose-free': 'vegetarian',
      'no-preference': 'vegetarian'
    };
    return dietMap[preferences] || 'vegetarian';
  };

  const getIntolerances = (preferences) => {
    const intolerances = [];
    if (preferences === 'gluten-free') intolerances.push('gluten-free');
    if (preferences === 'lactose-free') intolerances.push('lactose-free');
    return intolerances;
  };

  const getPlanImage = (planName) => {
    const imageMap = {
      'Weight Loss Journey': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      'Balanced Lifestyle': 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
      'Muscle Building Power': 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
      'Quick & Healthy': 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg',
      'Weekend Feast': 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg',
      'Budget-Friendly Meals': 'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg'
    };
    return imageMap[planName] || 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg';
  };

  const handleCreateCustomPlan = (formData) => {
    // Pass the custom plan data to the parent component
    if (onCustomPlanCreate) {
      onCustomPlanCreate(formData);
    }
    setShowCreateModal(false);
  };

  if (!userData) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted">Please complete your profile to see personalized meal plans.</p>
      </div>
    );
  }

  // Check if user has completed onboarding
  if (!userData.onboardingCompleted || !userData.tdee || !userData.goal || !userData.preferences) {
    return (
      <div className="text-center py-8">
        <div className="bg-dark-200/50 rounded-2xl p-6 border border-card-border">
          <h3 className="text-xl font-bold text-text-base mb-2">Complete Your Profile</h3>
          <p className="text-text-muted mb-4">
            To see personalized meal plans tailored to your preferences and goals, please complete your profile setup.
          </p>
          <button
            onClick={() => window.location.href = '/profile'}
            className="px-6 py-3 bg-primary-DEFAULT text-white rounded-xl hover:bg-primary-600 transition-all duration-300"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Loading State */}
      {isGenerating && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-DEFAULT"></div>
          <p className="mt-2 text-text-muted">Generating your personalized meal plans...</p>
        </div>
      )}

      {/* Personalized Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {personalizedPlans.length > 0 ? (
          personalizedPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setSelectedMealPlan(plan)}
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
                  <div className="absolute top-4 left-4 bg-primary-DEFAULT/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-xs font-medium text-white">AI Personalized</span>
                  </div>
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
          ))
        ) : (
          !isGenerating && (
            <div className="col-span-full text-center py-8">
              <div className="bg-dark-200/50 rounded-2xl p-6 border border-card-border">
                <h3 className="text-xl font-bold text-text-base mb-2">No Personalized Plans Available</h3>
                <p className="text-text-muted mb-4">
                  We couldn't generate personalized plans at the moment. Please try creating a custom plan instead.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-primary-DEFAULT text-white rounded-xl hover:bg-primary-600 transition-all duration-300"
                >
                  Create Custom Plan
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Modals */}
      <CreatePlanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGenerate={handleCreateCustomPlan}
      />

      {selectedMealPlan && (
        <MealRecipeModal
          mealPlan={selectedMealPlan}
          onClose={() => setSelectedMealPlan(null)}
        />
      )}
    </motion.div>
  );
} 