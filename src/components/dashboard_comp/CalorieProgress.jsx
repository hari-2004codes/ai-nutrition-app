import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function CalorieProgress({ consumed, target }) {
  const percentage = Math.min((consumed / target) * 100, 100);
  const remaining = Math.max(target - consumed, 0);

  return (
    <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-card-border shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-8 h-8" />
          Calories Today
        </h3>
        <div className="text-bold text-white">
          {Math.round(percentage)}% of goal
        </div>
      </div>

      {/* Progress Ring */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#2a2a2a"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#calorieGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - percentage / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00A67E" />
                <stop offset="100%" stopColor="#00A67E" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white">{consumed}</div>
              <div className="text-sm text-gray-400">/ {target} kcal</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Macronutrients */}
        <div className="space-y-4">
        <h4 className="text-lg font-bold text-text-base mb-4">Macronutrients</h4>
        
        {/* Protein */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-text-muted">
            <span className="text-text-muted">Protein</span>
            <span className="text-text-base">120g</span>
          </div>
          <div className="w-full bg-card-border rounded-full h-2.5">
            <motion.div
              className="bg-primary-DEFAULT h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Carbs</span>
            <span className="text-white">200g</span>
          </div>
          <div className="w-full bg-card-border rounded-full h-2">
            <motion.div
              className="bg-primary-DEFAULT h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Fat</span>
            <span className="text-white">60g</span>
          </div>
          <div className="w-full bg-card-border rounded-full h-2">
            <motion.div
              className="bg-primary-DEFAULT h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '30%' }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}