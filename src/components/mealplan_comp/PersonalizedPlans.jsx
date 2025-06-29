import React, { useState, useEffect } from 'react';
import api from '../../api';
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMealPlan, setSelectedMealPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const stored = localStorage.getItem('nutritionUser');
    if (stored) {
      const data = JSON.parse(stored);
      setUserData(data);
      
      // Only fetch personalized plans if user has completed onboarding
      if (data.onboardingCompleted && data.tdee && data.goal && data.preferences) {
        fetchPersonalizedPlans();
      }
    }
  }, []);

  const fetchPersonalizedPlans = async () => {
    setIsLoading(true);
    
    try {
      // Check if we have an auth token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found');
        return;
      }
      
      console.log('🔍 Fetching personalized plans with token:', token.substring(0, 20) + '...');
      console.log('🔍 Token length:', token.length);
      
      // Check if user data exists
      const userData = localStorage.getItem('nutritionUser');
      console.log('🔍 User data exists:', !!userData);
      
      // First, try to fetch existing personalized plans
      console.log('🔍 Making API call to /mealplans...');
      const existingPlansResponse = await api.get('/mealplans');
      console.log('✅ API call successful:', existingPlansResponse.status);
      
      if (existingPlansResponse.data.success) {
        const personalizedPlans = existingPlansResponse.data.data
          .filter(plan => plan.planType === 'personalized')
          .map(plan => ({
            id: plan._id,
            name: plan.name,
            description: plan.description,
            duration: `${plan.duration} days`,
            calories: `${plan.targetCalories}`,
            difficulty: plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1),
            prepTime: `${plan.prepTime} mins`,
            image: plan.image || getPlanImage(plan.name),
            tags: plan.tags || [],
            meals: plan.duration * (plan.mealTypes?.length || 3),
            data: plan.days,
            rating: plan.rating || 5.0,
            generated: true,
            personalized: true
          }));
        
        if (personalizedPlans.length > 0) {
          setPersonalizedPlans(personalizedPlans);
          console.log(`✅ Successfully fetched ${personalizedPlans.length} existing personalized plans`);
          return;
        }
      }
      
      // If no existing plans, try to generate new ones
      console.log('🚀 No existing personalized plans found, generating new ones...');
      const response = await api.post('/mealplans/generate-personalized');
      
      if (response.data.success) {
        const plans = response.data.data.map(plan => ({
          id: plan._id,
          name: plan.name,
          description: plan.description,
          duration: `${plan.duration} days`,
          calories: `${plan.targetCalories}`,
          difficulty: plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1),
          prepTime: `${plan.prepTime} mins`,
          image: plan.image || getPlanImage(plan.name),
          tags: plan.tags || [],
          meals: plan.duration * (plan.mealTypes?.length || 3),
          data: plan.days,
          rating: plan.rating || 5.0,
          generated: true,
          personalized: true
        }));
        
        setPersonalizedPlans(plans);
        console.log(`✅ Successfully generated ${plans.length} personalized plans`);
      }
    } catch (error) {
      console.error("❌ Error fetching/generating personalized plans:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      
      // Handle specific authentication errors
      if (error.response?.status === 401) {
        console.error("❌ Authentication failed - token may be invalid or expired");
        console.error("❌ Current token:", localStorage.getItem('token')?.substring(0, 20) + '...');
        // You might want to redirect to login or refresh the token here
      }
    } finally {
      setIsLoading(false);
    }
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
    <div className="space-y-8">
      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-DEFAULT"></div>
          <p className="mt-2 text-text-muted">Loading your personalized meal plans...</p>
        </div>
      )}

      {/* Personalized Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {personalizedPlans.length > 0 ? (
          personalizedPlans.map((plan) => (
            <div
              key={plan.id}
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
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="col-span-full text-center py-8">
              <div className="bg-dark-200/50 rounded-2xl p-6 border border-card-border">
                <h3 className="text-xl font-bold text-text-base mb-2">No Personalized Plans Available</h3>
                <p className="text-text-muted mb-4">
                  We couldn't load your personalized plans at the moment. Please try creating a custom plan instead.
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
    </div>
  );
} 