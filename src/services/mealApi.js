import api from '../api';

const handleApiError = (error, operation) => {
  if (error.code === 'ERR_NETWORK') {
    console.error(`Network error during ${operation}. Please check if the server is running on http://localhost:4000`);
  } else if (error.response) {
    console.error(`API error during ${operation}:`, error.response.data);
  } else {
    console.error(`Error during ${operation}:`, error.message);
  }
  throw error;
};

export const addMealEntry = async (mealData) => {
  try {
    const response = await api.post('/diary/meals', mealData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'adding meal entry');
  }
};

export const getMealEntries = async (date) => {
  try {
    const response = await api.get('/diary/meals', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'getting meal entries');
  }
};

export const updateMealEntry = async (mealId, mealData) => {
  try {
    const response = await api.put(`/diary/meals/${mealId}`, mealData);
    return response.data;
  } catch (error) {
    handleApiError(error, 'updating meal entry');
  }
};

export const deleteMealEntry = async (mealId) => {
  try {
    const response = await api.delete(`/diary/meals/${mealId}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'deleting meal entry');
  }
};

export const deleteFoodItem = async (mealId, itemIndex) => {
  try {
    const response = await api.delete(`/diary/meals/${mealId}/items/${itemIndex}`);
    return response.data;
  } catch (error) {
    handleApiError(error, 'deleting food item');
  }
};

export const getMealsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get('/diary/meals/range', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'getting meals by date range');
  }
};

// Generate food suggestion using new suggestion service
export const generateFoodSuggestion = async (foodData, dailyIntake) => {
  try {
    const response = await api.post('/food-suggestions/generate', {
      foodData,
      dailyIntake
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'generating food suggestion');
  }
};

// Get food suggestion by hash
export const getFoodSuggestion = async (foodHash) => {
  try {
    const response = await api.get(`/food-suggestions/${foodHash}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Suggestion not found
    }
    handleApiError(error, 'getting food suggestion');
  }
};

// Delete food suggestion
export const deleteFoodSuggestion = async (foodHash) => {
  try {
    const response = await api.delete(`/food-suggestions/${foodHash}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Suggestion not found (already deleted or never existed)
    }
    handleApiError(error, 'deleting food suggestion');
  }
};

// Generate food hash (same logic as backend)
export const generateFoodHash = (foodData) => {
  const normalizedData = {
    name: foodData.name.toLowerCase().trim(),
    calories: Math.round(foodData.calories),
    protein: Math.round(foodData.protein * 10) / 10,
    carbs: Math.round(foodData.carbs * 10) / 10,
    fat: Math.round(foodData.fat * 10) / 10
  };
  
  return btoa(JSON.stringify(normalizedData));
};