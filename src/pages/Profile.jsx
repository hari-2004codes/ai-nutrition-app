import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Settings, Target, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateBMR, calculateTDEE } from '../utils/calculations';

export default function Profile() {
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const stored = localStorage.getItem('nutritionUser');
    if (stored) {
      const data = JSON.parse(stored);
      setUserData(data);
      reset(data);
    }
  }, [reset]);

  const onSubmit = (data) => {
    const bmr = calculateBMR(data);
    const tdee = calculateTDEE(bmr, data.activityLevel);
    
    const updatedData = {
      ...data,
      bmr,
      tdee,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('nutritionUser', JSON.stringify(updatedData));
    setUserData(updatedData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-text-base mb-2">Profile Settings</h1>
        <p className="text-text-muted text-lg">Manage your personal information and nutrition goals</p>
      </div>

      {/* Profile Overview */}
      <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-8 border border-card-border shadow-xl shadow-card-border/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-base flex items-center gap-2">
            <User className="w-6 h-6" />
            Personal Information
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-primary-DEFAULT/50 text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-text-base mb-2">Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-card-border focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 text-text-base placeholder:text-text-muted"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-base mb-2">Age</label>
                <input
                  type="number"
                  {...register('age', { required: 'Age is required', min: 16, max: 100 })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-300/60 border border-card-border focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 text-text-base placeholder:text-text-muted"
                />
                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-base mb-2">Gender</label>
                <select
                  {...register('gender', { required: 'Gender is required' })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-300/60 border border-card-border focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 text-text-base"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-base mb-2">Height (cm)</label>
                <input
                  type="number"
                  {...register('height', { required: 'Height is required', min: 120, max: 250 })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-300/60 border border-card-border focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 text-text-base placeholder:text-text-muted"
                />
                {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-base mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('weight', { required: 'Weight is required', min: 30, max: 300 })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-300/60 border border-card-border focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 text-text-base placeholder:text-text-muted"
                />
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-base mb-2">Activity Level</label>
                <select
                  {...register('activityLevel', { required: 'Activity level is required' })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-300/60 border border-card-border focus:border-primary-DEFAULT focus:ring-2 focus:ring-primary-DEFAULT/20 transition-all duration-200 text-text-base"
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Lightly Active</option>
                  <option value="moderate">Moderately Active</option>
                  <option value="very">Very Active</option>
                  <option value="extra">Extremely Active</option>
                </select>
                {errors.activityLevel && <p className="text-red-500 text-sm mt-1">{errors.activityLevel.message}</p>}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-primary-DEFAULT/50 text-white rounded-xl hover:bg-primary-600 hover:shadow-md hover:shadow-primary-600/20 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Name', value: userData.name },
              { label: 'Age', value: `${userData.age} years` },
              { label: 'Gender', value: userData.gender },
              { label: 'Height', value: `${userData.height} cm` },
              { label: 'Weight', value: `${userData.weight} kg` },
              { label: 'Activity Level', value: userData.activityLevel },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-dark-300/60 rounded-xl border border-card-border">
                <div className="text-sm text-text-muted font-medium">{item.label}</div>
                <div className="text-lg font-semibold text-text-base capitalize">
                  {item.value || 'Not set'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calculated Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20">
          <h3 className="text-xl font-bold text-text-base mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Metabolic Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-dark-300/60 rounded-xl border border-card-border">
              <div>
                <div className="font-semibold text-text-base">BMR</div>
                <div className="text-sm text-text-muted">Basal Metabolic Rate</div>
              </div>
              <div className="text-2xl font-bold text-primary-DEFAULT">
                {Math.round(userData.bmr || 0)} cal
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-dark-300/60 rounded-xl border border-card-border">
              <div>
                <div className="font-semibold text-text-base">TDEE</div>
                <div className="text-sm text-text-muted">Total Daily Energy Expenditure</div>
              </div>
              <div className="text-2xl font-bold text-primary-DEFAULT">
                {Math.round(userData.tdee || 0)} cal
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border border-card-border shadow-xl shadow-card-border/20">
          <h3 className="text-xl font-bold text-text-base mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goals & Preferences
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-dark-300/60 rounded-xl border border-card-border">
              <div className="font-semibold text-text-base mb-1">Primary Goal</div>
              <div className="text-text-muted capitalize">
                {userData.goal === 'lose' && 'Weight Loss'}
                {userData.goal === 'maintain' && 'Weight Maintenance'}
                {userData.goal === 'gain' && 'Weight Gain'}
              </div>
            </div>
            <div className="p-4 bg-dark-300/60 rounded-xl border border-card-border">
              <div className="font-semibold text-text-base mb-1">Diet Type</div>
              <div className="text-text-muted capitalize">
                {userData.dietType || 'No specific diet'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}