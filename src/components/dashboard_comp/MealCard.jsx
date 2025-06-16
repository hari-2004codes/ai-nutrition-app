import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, UtensilsCrossed } from "lucide-react";

const MealCard = ({ meal }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="relative h-[240px] w-full"
      style={{ perspective: "1000px" }}
    >
      <AnimatePresence initial={false} mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            className="absolute w-full h-full cursor-pointer"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -180 }}
            transition={{ duration: 0.3 }}
            onClick={flipCard}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="h-full bg-dark-200 backdrop-blur-lg rounded-2xl p-6 border-2 border-card-border shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-primary-DEFAULT" />
                  <h3 className="text-xl font-bold text-white">{meal.type}</h3>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{meal.time}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {meal.calories} cal
              </div>
              <div className="text-text-muted text-sm">Click to view macros</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            className="absolute w-full h-full cursor-pointer"
            initial={{ rotateY: 180 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 180 }}
            transition={{ duration: 0.3 }}
            onClick={flipCard}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="h-full bg-dark-200 backdrop-blur-lg rounded-2xl p-6 border border-dark-300/50 shadow-lg">
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-bold text-white mb-4">
                  Macro Breakdown
                </h3>
                <div className="space-y-3 flex-1">
                  <MacroBar
                    label="Protein"
                    value={meal.macros.protein}
                    total={meal.macros.total}
                    color="from-blue-400 to-blue-600"
                  />
                  <MacroBar
                    label="Carbs"
                    value={meal.macros.carbs}
                    total={meal.macros.total}
                    color="from-green-400 to-green-600"
                  />
                  <MacroBar
                    label="Fat"
                    value={meal.macros.fat}
                    total={meal.macros.total}
                    color="from-yellow-400 to-yellow-600"
                  />
                </div>
                <div className="text-text-muted text-sm mt-4">
                  Click to flip back
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MacroBar = ({ label, value, total, color }) => {
  const percentage = (value / total) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-white">{label}</span>
        <span className="text-text-muted">{value}g</span>
      </div>
      <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
};

export default MealCard;