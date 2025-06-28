// services/apiService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Use in-memory storage instead of localStorage for Claude.ai compatibility
  const token = window.sessionToken || null; // Store token in window object
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Diary API functions
export const diaryAPI = {
  // Add meal entry
  addMealEntry: async (mealData) => {
    const response = await fetch(`${API_BASE_URL}/diary/meal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(mealData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add meal entry');
    }
    
    return response.json();
  },

  // Get meal entries for a date
  getMealEntriesByDate: async (date) => {
    const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
    const response = await fetch(`${API_BASE_URL}/diary/${formattedDate}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get meal entries');
    }
    
    return response.json();
  },

  // Update meal entry
  updateMealEntry: async (id, updateData) => {
    const response = await fetch(`${API_BASE_URL}/diary/meal/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update meal entry');
    }
    
    return response.json();
  },

  // Delete meal entry
  deleteMealEntry: async (id) => {
    const response = await fetch(`${API_BASE_URL}/diary/meal/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete meal entry');
    }
    
    return response.json();
  },

  // Get daily nutrition summary
  getDailyNutritionSummary: async (date) => {
    const formattedDate = date instanceof Date ? date.toISOString().split('T')[0] : date;
    const response = await fetch(`${API_BASE_URL}/diary/${formattedDate}/summary`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get nutrition summary');
    }
    
    return response.json();
  }
};

// Food API functions
export const foodAPI = {
  // Search food items
  searchFoodItems: async (query, page = 1, limit = 20) => {
    const response = await fetch(
      `${API_BASE_URL}/food?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search food items');
    }
    
    return response.json();
  },

  // Get food item by ID
  getFoodItemById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/food/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get food item');
    }
    
    return response.json();
  }
};