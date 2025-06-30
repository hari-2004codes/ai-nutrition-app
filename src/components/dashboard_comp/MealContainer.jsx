import React from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import MealCard from './MealCard';

const MealContainer = ({ meals = [] }) => {
  return (
    <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card_border">
      <div className="flex items-center gap-2 mb-6">
        <Utensils className="w-8 h-8 text-white" />
        <h2 className="text-xl font-bold text-white">Today's Meals</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal, index) => (
          <motion.div
            key={meal.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MealCard meal={meal} />
          </motion.div>
        ))}
        {meals.length === 0 && (
          <div className="text-white col-span-full text-center">No meals logged for today.</div>
        )}
      </div>
    </div>
  );
};

export default MealContainer; 