import api from '../api';

export const addMealEntry = async (mealData) => {
  try {
    const response = await api.post('/api/diary/meals', mealData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMealEntries = async (date) => {
  try {
    const response = await api.get('/api/diary/meals', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 