import React, { useState, useEffect } from "react";
import {
  Target,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  BarChart3,
} from "lucide-react";
import CalorieProgress from "../components/dashboard_comp/CalorieProgress";
import WeeklyTrends from "../components/dashboard_comp/WeeklyTrends";
import MealContainer from "../components/dashboard_comp/MealContainer";
import MealPlanCarousel from "../components/dashboard_comp/Meal_Carousel";
import { getMealEntries, getMealsByDateRange } from "../services/mealApi";
import { useNavigate } from 'react-router-dom';

export default function Dashboard() { 
  const [userData, setUserData] = useState({});
  const [, setSelectedPlan] = useState(null);
  const [meals, setMeals] = useState([]);
  const [todayStats, setTodayStats] = useState({
    caloriesConsumed: 0,
    targetCalories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [weeklyTrends, setWeeklyTrends] = useState({
    labels: [],
    calories: [],
    targets: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("nutritionUser");
    if (stored) {
      const user = JSON.parse(stored);
      setUserData(user);
      setTodayStats((prev) => ({ ...prev, targetCalories: user.tdee || 2000 }));
    }
    // Fetch today's meals
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    getMealEntries(dateStr).then((meals) => {
      console.log('Fetched meals for today:', meals);
      // Transform meals for MealCard
      const transformedMeals = meals.map((meal) => {
        // Aggregate calories and macros from items if not present
        let calories = 0, protein = 0, carbs = 0, fat = 0;
        if (Array.isArray(meal.items)) {
          meal.items.forEach((item) => {
            calories += Number(item.calories) || 0;
            protein += Number(item.protein) || 0;
            carbs += Number(item.carbs) || 0;
            fat += Number(item.fat) || 0;
          });
        }
        return {
          id: meal._id || meal.id,
          type: meal.mealType || meal.type || 'Meal',
          time: meal.time || '',
          calories: calories,
          macros: {
            protein,
            carbs,
            fat,
            total: protein + carbs + fat,
          },
        };
      });
      setMeals(transformedMeals);
      // Aggregate today's stats
      let calories = 0, protein = 0, carbs = 0, fat = 0;
      transformedMeals.forEach((meal) => {
        calories += meal.calories;
        protein += meal.macros.protein;
        carbs += meal.macros.carbs;
        fat += meal.macros.fat;
      });
      setTodayStats((prev) => ({
        ...prev,
        caloriesConsumed: calories,
        protein,
        carbs,
        fat,
      }));
    });
    // Fetch weekly trends
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);
    const start = weekAgo.toISOString().split('T')[0];
    const end = dateStr;
    getMealsByDateRange(start, end).then((mealsArr) => {
      // Group by day
      const dayMap = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekAgo);
        d.setDate(weekAgo.getDate() + i);
        const key = d.toISOString().split('T')[0];
        dayMap[key] = { calories: 0 };
      }
      mealsArr.forEach((meal) => {
        const key = meal.date.split('T')[0];
        if (dayMap[key]) {
          meal.items.forEach((item) => {
            dayMap[key].calories += Number(item.calories) || 0;
          });
        }
      });
      const labels = Object.keys(dayMap);
      const calories = labels.map((d) => dayMap[d].calories);
      const targets = labels.map(() => userData.tdee || 2000);
      setWeeklyTrends({ labels, calories, targets });
    });
  }, []);

  const stats = [
    {
      label: "BMR",
      value: Math.round(userData.bmr || 0),
      unit: "cal",
      icon: Zap,
      color: "from-orange-400 to-red-500",
    },
    {
      label: "TDEE",
      value: Math.round(userData.tdee || 0),
      unit: "cal",
      icon: Target,
      color: "from-blue-400 to-indigo-500",
    },
    {
      label: "Streak",
      value: 7,
      unit: "days",
      icon: Award,
      color: "from-green-400 to-emerald-500",
    },
    {
      label: "Progress",
      value: 84,
      unit: "%",
      icon: TrendingUp,
      color: "from-purple-400 to-pink-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {userData.name || "User"}!
        </h1>
        <p className="text-white text-lg">
          Here's your nutrition overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-card-border shadow-lg shadow-gray-500/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-bold text-white">
                {stat.value}
                <span className="text-lg text-white ml-1">{stat.unit}</span>
              </p>
              <p className="text-white font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calorie Progress */}
        <div className="lg:col-span-2">
          <CalorieProgress
            consumed={todayStats.caloriesConsumed}
            target={todayStats.targetCalories}
            protein={todayStats.protein}
            carbs={todayStats.carbs}
            fat={todayStats.fat}
          />
        </div>

        <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-card-border shadow-lg shadow-gray-500/5">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 h-[400px]">
            {[
              {
                label: "Log Breakfast",
                color: "bg-dark-200/50 border border-primary-DEFAULT",
                mealType: "breakfast",
              },
              {
                label: "Log Lunch",
                color: "bg-dark-200/50 border border-primary-DEFAULT",
                mealType: "lunch",
              },
              {
                label: "Log Snacks",
                color: "bg-dark-200/50 border border-primary-DEFAULT",
                mealType: "snacks",
              },
              {
                label: "Log Dinner",
                color: "bg-dark-200/50 border border-primary-DEFAULT",
                mealType: "dinner",
              },
            ].map((action) => (
              <button
                key={action.label}
                className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-semibold hover:shadow-lg hover:shadow-gray-500/25 transition-all duration-200 transform hover:scale-105`}
                onClick={() => navigate('/meals', { state: { mealType: action.mealType } })}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <MealPlanCarousel onSelect={setSelectedPlan} />
        </div>
        
        <div className="lg:col-span-2">
          <WeeklyTrends
            labels={weeklyTrends.labels}
            calories={weeklyTrends.calories}
            targets={weeklyTrends.targets}
          />
        </div>

        {/* Meal History */}
        <div className="lg:col-span-3">
          <MealContainer meals={meals} />
        </div>
      </div>

      {/* Quick Actions */}
    </div>
  );
}
