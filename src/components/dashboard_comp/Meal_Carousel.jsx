import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Calendar, Flame, ChefHat, Utensils } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { allPlaceholderPlans } from '../../data/mealPlanPlaceholders';
import api from '../../api';

function flattenPlaceholderPlans() {
  // Use day 1 of each placeholder plan for carousel
  return allPlaceholderPlans.map((placeholder) => {
    const plan = placeholder.plan[0];
    return {
      id: placeholder.id,
      name: placeholder.name + ' (Sample)',
      description: plan.meals.map(m => m.name).join(', '),
      duration: '5 days',
      calories: plan.meals.reduce((sum, m) => sum + (m.calories || 0), 0),
      difficulty: 'moderate',
      prepTime: '',
      image: plan.image || '',
      tags: [placeholder.name, 'Sample'],
      meals: plan.meals.length * 5, // 3 meals x 5 days
      data: placeholder.plan,
      rating: 5.0,
      planType: 'placeholder',
      generated: false,
      custom: false,
      createdAt: null,
      sample: true
    };
  });
}

function MealPlanCarousel({ onSelect }) {
  const [allPlans, setAllPlans] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch custom meal plans and combine with placeholder plans
  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const response = await api.get('/mealplans');
        if (response.data.success) {
          const customPlans = response.data.data
            .filter(plan => plan.planType === 'custom' || plan.planType === 'ai-generated')
            .map(plan => ({
              id: plan._id,
              name: plan.name,
              description: plan.description,
              duration: `${plan.duration} days`,
              calories: plan.targetCalories,
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
              createdAt: plan.createdAt,
              sample: false
            }));

          // Combine placeholder plans with custom plans
          const placeholderPlans = flattenPlaceholderPlans();
          setAllPlans([...customPlans, ...placeholderPlans]);
        } else {
          // If no custom plans, just show placeholder plans
          setAllPlans(flattenPlaceholderPlans());
        }
      } catch (error) {
        console.error('Error fetching meal plans:', error);
        // Fallback to placeholder plans only
        setAllPlans(flattenPlaceholderPlans());
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealPlans();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-200/50 border-2 border-card-border rounded-xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-DEFAULT mb-2"></div>
          <p className="text-white text-sm">Loading meal plans...</p>
        </div>
      </div>
    );
  }

  if (!allPlans.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-white text-xl font-bold">No Meal Plans Available</h3>
        <p className="text-text-muted">Generate or create a meal plan to see recommendations here.</p>
      </div>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? allPlans.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === allPlans.length - 1 ? 0 : prevIndex + 1
    );
  };

  const plan = allPlans[currentIndex];
  const fallbackImage = 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg';
  const imageUrl = plan.image && plan.image.trim() ? plan.image : fallbackImage;

  const handleViewPlan = () => {
    navigate('/meal-plans');
  };

  return (
    <div className="flex flex-row items-center justify-center bg-dark-200/50 border-2 border-card-border rounded-xl w-full h-full p-4">
      {allPlans.length > 1 && (
        <button className="text-white border-2 border-card-border rounded-xl p-2 ml-2" onClick={handlePrevious}><ChevronLeft size={20}/></button>
      )}
      <div className="flex flex-col items-center justify-center w-full h-full p-2">
        <h3 className="text-white text-2xl font-bold text-center py-2 mb-2 capitalize">{plan.name}</h3>
        <div className="relative w-full flex justify-center">
          <img src={imageUrl} alt={plan.name} className="w-full h-40 object-cover rounded-xl mb-4" style={{maxWidth:'340px'}} />
          {plan.sample && (
            <span className="absolute top-2 left-2 bg-primary-DEFAULT text-white text-xs px-3 py-1 rounded-full shadow">Sample</span>
          )}
          {plan.custom && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow">Custom</span>
          )}
        </div>
        <p className="text-white text-base text-center mb-4">{plan.description}</p>
        <div className="flex flex-wrap gap-4 justify-center py-2 mb-4 text-text-muted text-sm">
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{plan.duration}</span>
          <span className="flex items-center gap-1"><Flame className="w-4 h-4" />{plan.calories} cal</span>
          <span className="flex items-center gap-1"><ChefHat className="w-4 h-4" />{plan.difficulty}</span>
          <span className="flex items-center gap-1"><Utensils className="w-4 h-4" />{plan.meals} meals</span>
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary-DEFAULT/10 text-primary-DEFAULT rounded-xl hover:bg-primary-DEFAULT hover:text-white transition-all duration-300 font-semibold text-lg"
          onClick={handleViewPlan}
        >
          <BookOpen className="w-5 h-5" />
          View Plan
        </button>
      </div>
      {allPlans.length > 1 && (
        <button className="text-white border-2 border-card-border rounded-xl p-2 mr-2" onClick={handleNext}><ChevronRight size={20}/></button>
      )}
    </div>
  );
}

export default MealPlanCarousel;    
