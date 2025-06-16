import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';

export default function MealEntry({ food }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-between p-4 bg-dark-200/40 rounded-xl border border-card-border hover:border-primary-DEFAULT hover:bg-dark-200/70 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-primary-DEFAULT to-primary-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">🍎</span>
        </div>
        <div>
          <h4 className="font-semibold text-text-base">{food.name}</h4>
          <p className="text-sm text-text-muted">{food.serving || '1 serving'}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="font-bold text-text-base">{food.calories} cal</div>
          <div className="text-xs text-text-muted">
            P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-text-base hover:text-primary-DEFAULT hover:bg-dark-300/60 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" />
          </button> 
          <button className="p-2 text-text-base hover:text-red-500 hover:bg-dark-300/60 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}   