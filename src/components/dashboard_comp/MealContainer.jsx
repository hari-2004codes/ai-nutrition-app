import React from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import MealCard from './MealCard';

const MealContainer = () => {
  const meals = [
    {
      id: 1,
      type: 'Breakfast',
      time: '8:00 AM',
      calories: 450,
      macros: {
        protein: 25,
        carbs: 45,
        fat: 15,
        total: 85
      }
    },
    {
      id: 2,
      type: 'Lunch',
      time: '12:30 PM',
      calories: 650,
      macros: {
        protein: 35,
        carbs: 65,
        fat: 22,
        total: 122
      }
    },
    {
      id: 3,
      type: 'Dinner',
      time: '7:00 PM',
      calories: 550,
      macros: {
        protein: 30,
        carbs: 55,
        fat: 20,
        total: 105
      }
    }
  ];

  return (
    <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card_border">
      <div className="flex items-center gap-2 mb-6">
        <Utensils className="w-8 h-8 text-white" />
        <h2 className="text-xl font-bold text-white">Today's Meals</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal, index) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MealCard meal={meal} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MealContainer; 