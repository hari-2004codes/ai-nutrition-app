// src/services/profileService.js
import api from '../api';
import authService from './authService';

class ProfileService {
  // Get user profile
  async getProfile() {
    try {
      const { data } = await api.get('/profile');
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error(error.response?.data?.msg || 'Failed to fetch profile');
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const { data } = await api.put('/profile', profileData);
      
      // Update localStorage with latest data
      authService.refreshProfile();
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.response?.data?.msg || 'Failed to update profile');
    }
  }

  // Calculate BMR using Mifflin-St Jeor equation
  calculateBMR(profile) {
    if (!profile.weightKg || !profile.heightCm || !profile.age || !profile.gender) {
      return null;
    }

    const { weightKg, heightCm, age, gender } = profile;
    
    if (gender === 'male') {
      return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
  }

  // Calculate TDEE based on BMR and activity level
  calculateTDEE(bmr, activityLevel) {
    if (!bmr || !activityLevel) return null;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extra: 1.9
    };

    return bmr * (activityMultipliers[activityLevel] || 1.2);
  }

  // Update profile with calculated BMR and TDEE
  async updateProfileWithCalculations(profileData) {
    const bmr = this.calculateBMR(profileData);
    const tdee = this.calculateTDEE(bmr, profileData.activityLevel);

    const updatedData = {
      ...profileData,
      bmr,
      tdee
    };

    return this.updateProfile(updatedData);
  }
}

export default new ProfileService();
