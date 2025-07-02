import api from '../api';

// Get food autocomplete suggestions from backend
export const getFoodAutocomplete = async (query) => {
  if (!query || query.trim().length < 2) {
    throw new Error('Search query must be at least 2 characters long');
  }

  try {
    console.log('Making backend food search request for:', query);
    
    const response = await api.get('/fatsecret/search', {
      params: { q: query.trim() }
    });

    console.log('Backend food search response:', response.data);

    if (response.data.success) {
      return response.data.data || [];
    } else {
      throw new Error(response.data.error || 'Food search failed');
    }

  } catch (error) {
    console.error('Error fetching food autocomplete from backend:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response.status === 403) {
        throw new Error('Access forbidden. Please check your permissions.');
      } else if (error.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response.data?.error) {
        throw new Error(error.response.data.error);
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Get detailed food information from backend
export const getFoodDetails = async (foodId) => {
  if (!foodId) {
    throw new Error('Food ID is required');
  }

  try {
    console.log('Making backend food details request for ID:', foodId);
    
    const response = await api.get(`/fatsecret/food/${foodId}`);

    console.log('Backend food details response:', response.data);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to get food details');
    }

  } catch (error) {
    console.error('Error fetching food details from backend:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response.status === 403) {
        throw new Error('Access forbidden. Please check your permissions.');
      } else if (error.response.status === 404) {
        throw new Error('Food not found. Please check the food ID.');
      } else if (error.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.response.data?.error) {
        throw new Error(error.response.data.error);
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Helper function to parse nutrition data (same as before)
export const parseNutritionData = (foodData) => {
  if (!foodData) {
    return null;
  }

  // The backend already parsed the data, so we can return it as-is
  // or do additional parsing if needed
  return {
    id: foodData.id,
    name: foodData.name,
    brand: foodData.brand || '',
    calories: foodData.calories || 0,
    protein: foodData.protein || 0,
    carbs: foodData.carbs || 0,
    fat: foodData.fat || 0,
    fiber: foodData.fiber || 0,
    sugar: foodData.sugar || 0,
    sodium: foodData.sodium || 0,
    servingDescription: foodData.servingDescription || '1 serving',
    servingSize: foodData.servingSize || foodData.servingDescription || '1 serving'
  };
};
