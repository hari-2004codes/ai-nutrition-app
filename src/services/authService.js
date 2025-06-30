// src/services/authService.js
import api from '../api';
import { auth } from '../firebase';

class AuthService {
  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('nutritionUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  // Check if user has completed onboarding
  hasCompletedOnboarding() {
    const user = this.getCurrentUser();
    return user?.onboardingCompleted || false;
  }

  // Refresh user profile from backend
  async refreshProfile() {
    try {
      const profile = await this.getProfile();
      
      // Update localStorage with latest profile data
      const currentUser = this.getCurrentUser();
      if (currentUser && profile) {
        const updatedUser = { 
          ...currentUser, 
          onboardingCompleted: profile.onboardingCompleted || false,
          ...profile // Include all profile data
        };
        localStorage.setItem('nutritionUser', JSON.stringify(updatedUser));
      }
      
      return profile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      throw error;
    }
  }

  // Sync Firebase user with backend
  async syncWithBackend(idToken, isNewUser = false, userName = null) {
    try {
      const payload = { idToken };
      if (isNewUser && userName) {
        payload.name = userName;
        payload.isNewUser = true;
      }
      
      const { data } = await api.post('/auth/firebase', payload);
      
      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('nutritionUser', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.error('Backend sync error:', error);
      throw new Error(error.response?.data?.msg || 'Failed to sync with backend');
    }
  }

  // Get user profile from backend
  async getProfile() {
    try {
      const { data } = await api.get('/profile');
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const { data } = await api.put('/profile', profileData);
      
      // Update localStorage user data
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...data };
        localStorage.setItem('nutritionUser', JSON.stringify(updatedUser));
      }
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('nutritionUser');
    
    // Sign out from Firebase
    if (auth.currentUser) {
      auth.signOut();
    }
  }

  // Refresh token if needed
  async refreshToken() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated Firebase user');
      }

      const idToken = await currentUser.getIdToken(true); // Force refresh
      await this.syncWithBackend(idToken);
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.logout();
      throw error;
    }
  }
}

export default new AuthService(); 