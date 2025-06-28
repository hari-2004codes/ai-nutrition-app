import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import Meal_Carousel from "../components/dashboard_comp/Meal_Carousel";

export default function Dashboard() { 
  const [userData, setUserData] = useState({});
  const [todayStats, setTodayStats] = useState({
    caloriesConsumed: 1000,
    targetCalories: 2000,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
    targetWater: 0,
  });

  useEffect(() => {
    // Helper function to safely parse localStorage data
    const safeParseJSON = (value) => {
      if (!value || value === "undefined" || value === "null" || value === "{}") {
        return null;
      }
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    };

    // Try to get user data from localStorage
    const stored = localStorage.getItem("nutritionUser");
    const parsedData = safeParseJSON(stored);
    
    if (parsedData) {
      setUserData(parsedData);
      return;
    }

    // Fallback: try the 'user' key
    const userStored = localStorage.getItem("user");
    const parsedUserData = safeParseJSON(userStored);
    
    if (parsedUserData) {
      setUserData(parsedUserData);
      return;
    }

    // No valid data found - set empty object
    console.log("No valid user data found in localStorage");
    setUserData({});
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Welcome Section */}
      <div className="text-center lg:text-left">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-white mb-2"
        >
          Welcome back, {userData.name || userData.displayName || "User"}!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white text-lg"
        >
          Here's your nutrition overview for today
        </motion.p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
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
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calorie Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <CalorieProgress
            consumed={todayStats.caloriesConsumed}
            target={todayStats.targetCalories}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-card-border shadow-lg shadow-gray-500/5"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 h-[400px]">
            {[
              {
                label: "Log Breakfast",
                color: "bg-dark-200/50 border border-primary-DEFAULT",
              },
              {
                label: "Add Snack",
                color: "bg-dark-200/50 border border-primary-DEFAULT",
              },
              {
                label: "Log Water",
                color: "bg-dark-200/50 border border-primary-DEFAULT",
              },
              {
                label: "View Recipes",
                color: "bg-dark-200/50 border border-primary-DEFAULT",
              },
            ].map((action, index) => (
              <button
                key={action.label}
                className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-semibold hover:shadow-lg hover:shadow-gray-500/25 transition-all duration-200 transform hover:scale-105`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-1"
        >
          <Meal_Carousel />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <WeeklyTrends />
        </motion.div>

        {/* Meal History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-3"
        >
          <MealContainer />
        </motion.div>
      </div>

      {/* Quick Actions */}
    </motion.div>
  );
}