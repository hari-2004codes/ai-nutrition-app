// src/components/mealLog_comp/FoodSuggestionCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Lightbulb, 
  ArrowRight, 
  Clock,
  Scale,
  Loader,
  AlertTriangle,
  CheckCircle,
  Info,
  Sparkles
} from 'lucide-react';

const HealthinessIcon = ({ healthiness }) => {
  const config = {
    'Excellent': { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20' },
    'Good': { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/20' },
    'Fair': { icon: Info, color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
    'Poor': { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/20' }
  };
  
  const { icon: Icon, color, bg } = config[healthiness] || config['Fair'];
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${bg}`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <span className={`text-sm font-medium ${color}`}>{healthiness}</span>
    </div>
  );
};

const LoadingCard = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20 h-full"
  >
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="text-center space-y-4">
        <Loader className="w-8 h-8 mx-auto animate-spin text-primary-DEFAULT" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text-base">Analyzing Food...</h3>
          <p className="text-text-muted text-sm">Getting personalized recommendations</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const FoodSuggestionCard = ({ suggestion, loading, foodName, error }) => {
  if (loading) {
    return <LoadingCard />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20 h-full"
      >
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <div className="text-center space-y-4">
            <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-text-base">Analysis Unavailable</h3>
              <p className="text-text-muted text-sm">
                AI suggestions require Gemini API key configuration
              </p>
              <p className="text-text-muted text-xs mt-2">
                Contact admin to enable AI-powered food analysis
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!suggestion) {
    return (
      <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20 h-full">
        <div className="flex items-center justify-center h-full min-h-[300px]">
          <div className="text-center space-y-4">
            <div className="relative">
              <Heart className="w-8 h-8 mx-auto text-text-muted" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-text-base">AI Food Analysis</h3>
              <p className="text-text-muted text-sm">Click on any food item to get personalized health insights</p>
              <p className="text-text-muted text-xs">
                ✨ Powered by Gemini AI
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-primary-DEFAULT" />
          <h3 className="text-xl font-bold text-text-base">Food Analysis</h3>
        </div>
        <HealthinessIcon healthiness={suggestion.healthiness} />
      </div>

      <div className="space-y-6">
        {/* Food Name */}
        {foodName && (
          <div className="text-center py-2">
            <h4 className="text-lg font-semibold text-text-base capitalize">{foodName}</h4>
          </div>
        )}

        {/* Recommendation */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-text-base uppercase tracking-wide">
            Personalized Recommendation
          </h4>
          <p className="text-text-base leading-relaxed">{suggestion.recommendation}</p>
        </div>

        {/* Tips Section */}
        {suggestion.tips && suggestion.tips.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-text-base uppercase tracking-wide flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Smart Tips
            </h4>
            <ul className="space-y-2">
              {suggestion.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-text-muted text-sm">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-primary-DEFAULT flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Portion & Timing Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestion.portion && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-base uppercase tracking-wide flex items-center gap-1">
                <Scale className="w-3 h-3" />
                Portion
              </h4>
              <p className="text-text-muted text-sm">{suggestion.portion}</p>
            </div>
          )}
          
          {suggestion.timing && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-base uppercase tracking-wide flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Timing
              </h4>
              <p className="text-text-muted text-sm">{suggestion.timing}</p>
            </div>
          )}
        </div>

        {/* Alternatives */}
        {suggestion.alternatives && suggestion.alternatives.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-text-base uppercase tracking-wide">
              Healthier Alternatives
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestion.alternatives.map((alternative, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-text-base bg-primary-DEFAULT/20 rounded-full border border-primary-DEFAULT/30"
                >
                  {alternative}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FoodSuggestionCard;
