import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Target, Activity, User, Apple, Trophy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { calculateBMR, calculateMacroTargets, calculateTDEE } from '../utils/calculations';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Activity Level', icon: Activity },
  { id: 3, title: 'Goals', icon: Target },
  { id: 4, title: 'Food Preferences', icon: Apple },
  { id: 5, title: 'Personalized Plan', icon: Trophy },
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const { register, handleSubmit, formState: { errors } } = useForm();

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const onSubmit = (data) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);

    if (currentStep < 5) {
      nextStep();
    } else {
      // Calculate BMR and TDEE
      const bmr = calculateBMR(newFormData);
      const tdee = calculateTDEE(bmr, newFormData.activityLevel);
      
      const userData = {
        ...newFormData,
        bmr,
        tdee,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('nutritionUser', JSON.stringify(userData));
      toast.success('Profile created successfully!');
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-dark-100 flex items-center justify-center p-4 overflow-x-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Progress Steps */}
        <div className="flex justify-center mb-4 sm:mb-8">
          <div className="flex items-center space-x-1 sm:space-x-4 min-w-max py-2 overflow-x-hidden">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={` flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 sm:w-12 sm:h-12 ${
                  currentStep >= step.id
                    ? 'bg-primary-DEFAULT  text-white shadow-lg shadow-primary/25'
                    : 'bg-dark-200 text-text-muted border-2 border-dark-300'
                }`}>
                  <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-6 h-1 rounded-full transition-all duration-300 sm:w-12 ${
                    currentStep > step.id ? 'bg-primary-DEFAULT' : 'bg-dark-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          key={currentStep}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-dark-200 rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-text-base mb-2">Personal Info</h2>
                    <p className="text-text-muted">We'll use this to calculate your daily calorie needs</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-text-base mb-2">Name</label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-4 py-3 rounded-xl border border-dark-300 bg-dark-100 text-text-base placeholder-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        placeholder="Your name"
                      />
                      {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-base mb-2">Age</label>
                      <input
                        type="number"
                        {...register('age', { required: 'Age is required', min: 16, max: 100 })}
                        className="w-full px-4 py-3 rounded-xl border border-dark-300 bg-dark-100 text-text-base placeholder-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        placeholder="25"
                      />
                      {errors.age && <p className="text-error text-sm mt-1">{errors.age.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-base mb-2">Gender</label>
                      <select
                        {...register('gender', { required: 'Gender is required' })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-dark-300 bg-dark-100 text-text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Prefer not to say</option>
                      </select>
                      {errors.gender && <p className="text-error text-sm mt-1">{errors.gender.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-base mb-2">Height (cm)</label>
                      <input
                        type="number"
                        {...register('height', { required: 'Height is required', min: 120, max: 250 })}
                        className="w-full px-4 py-3 rounded-xl border border-dark-300 bg-dark-100 text-text-base placeholder-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        placeholder="175"
                      />
                      {errors.height && <p className="text-error text-sm mt-1">{errors.height.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-text-base mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        {...register('weight', { required: 'Weight is required', min: 30, max: 300 })}
                        className="w-full px-4 py-3 rounded-xl border border-dark-300 bg-dark-100 text-text-base placeholder-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        placeholder="70.5"
                      />
                      {errors.weight && <p className="text-error text-sm mt-1">{errors.weight.message}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-text-base mb-2">Activity Level</h2>
                    <p className="text-text-muted">How active are you on a typical day?</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                      { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                      { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                      { value: 'very', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
                      { value: 'extra', label: 'Extremely Active', desc: 'Very hard exercise, physical job' },
                    ].map((level) => (
                      <label key={level.value} className="flex items-start gap-4 p-4 rounded-xl border border-dark-300 bg-dark-100 hover:border-primary hover:bg-dark-200 cursor-pointer transition-all duration-200">
                        <input
                          type="radio"
                          {...register('activityLevel', { required: 'Activity level is required' })}
                          value={level.value}
                          className="mt-1 w-5 h-5 text-primary focus:ring-primary"
                        />
                        <div>
                          <h3 className="font-semibold text-text-base">{level.label}</h3>
                          <p className="text-sm text-text-muted">{level.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.activityLevel && <p className="text-error text-sm">{errors.activityLevel.message}</p>}
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-text-base mb-2">Your Goals</h2>
                    <p className="text-text-muted">What's your primary fitness goal?</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { value: 'lose', label: 'Lose Weight', desc: 'Create a calorie deficit for weight loss' },
                      { value: 'maintain', label: 'Maintain Weight', desc: 'Maintain current weight and build healthy habits' },
                      { value: 'gain', label: 'Gain Weight', desc: 'Build muscle and increase body weight' },
                    ].map((goal) => (
                      <label key={goal.value} className="flex items-start gap-4 p-4 rounded-xl border border-dark-300 bg-dark-100 hover:border-primary hover:bg-dark-200 cursor-pointer transition-all duration-200">
                        <input
                          type="radio"
                          {...register('goal', { required: 'Goal is required' })}
                          value={goal.value}
                          className="mt-1 w-5 h-5 text-primary focus:ring-primary"
                        />
                        <div>
                          <h3 className="font-semibold text-text-base">{goal.label}</h3>
                          <p className="text-sm text-text-muted">{goal.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.goal && <p className="text-error text-sm">{errors.goal.message}</p>}
                </motion.div>
              )}
              
              {currentStep === 4 && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-text-base mb-2">Food Preferences</h2>
                    <p className="text-text-muted">This is used to personalize your meal recommendations</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: 'vegan', label: 'Vegan', desc: 'Powered by plants only — no moo, no cluck, no buzz.' },
                      { value: 'vegetarian', label: 'Vegetarian', desc: 'Plants + dairy & eggs. No meat, no fishy business.' },
                      { value: 'paleo', label: 'Paleo', desc: 'Eat like a caveman — meats, nuts, and berries. No grains!' },
                      { value: 'keto', label: 'Ketogenic', desc: 'Low on carbs, high on fat. Bacons basically a veggie.' },
                      { value: 'mediterranean', label: 'Mediterranean', desc: 'Olive oil, fish, and sunshine on a plate.' },
                      { value: 'gluten-free', label: 'Gluten-Free', desc: 'No gluten here — just belly-happy food.' },
                      { value: 'lactose-free', label: 'Lactose-Free', desc: 'No moo juice — dairy-free and proud!' },
                      { value: 'no-preference', label: 'No Preference', desc: 'I eat everything. Surprise me!' },
                    ].map((pref) => (
                      <label key={pref.value} className="flex items-start gap-4 p-4 rounded-xl border border-dark-300 bg-dark-100 hover:border-primary hover:bg-dark-200 has-checked:border-primary has-checked:bg-dark-200 cursor-pointer transition-all duration-200">
                        <input
                          type="radio"
                          {...register('preferences', { required: "No preference is required" })}
                          value={pref.value}
                          className="mt-1 w-5 h-5 text-primary focus:ring-primary"
                        />
                        <div>
                          <h3 className="font-semibold text-text-base">{pref.label}</h3>
                          <p className="text-sm text-text-muted">{pref.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.preferences && <p className="text-error text-sm">{errors.preferences.message}</p>}
                </motion.div>
              )}
                  
              {currentStep === 5 && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-dark-100 rounded-lg p-6 mt-6">
                    <h3 className="font-semibold text-text-base mb-4">Your Personalized Plan</h3>
                    <p className="text-text-muted mb-4">We've calculated your nutrition needs based on your information.</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-dark-200 p-4 rounded-lg">
                        <div className="text-text-base">Daily Calories</div>
                        <div className="font-bold text-primary-DEFAULT text-2xl">
                          {formData ? 
                            calculateMacroTargets(calculateTDEE(calculateBMR(formData), formData.activityLevel), formData.goal).calories : 0} kcal
                        </div>
                      </div>
                      <div className="bg-dark-200 p-4 rounded-lg">
                        <div className="text-text-base">BMR</div>
                        <div className="font-bold text-primary-DEFAULT text-2xl">
                          {formData ? Math.round(calculateBMR(formData)) : 0} kcal
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 bg-dark-300 rounded-xl text-text-base border border-dark-300 hover:bg-dark-200 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-primary-DEFAULT text-white rounded-xl hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 cursor-pointer"
              >
                {currentStep === 5 ? 'Complete Setup' : 'Next'}
                {<ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}