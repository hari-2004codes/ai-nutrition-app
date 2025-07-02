import api from '../api';

class MealPlanService {
  // Get all meal plans for the current user
  async getUserMealPlans() {
    try {
      const response = await api.get('/mealplans');
      return response.data;
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      throw error;
    }
  }

  // Get a specific meal plan
  async getMealPlan(id) {
    try {
      const response = await api.get(`/mealplans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      throw error;
    }
  }

  // Save sample meal plan
  async saveSampleMealPlan(planData, planName, planDescription) {
    try {
      const response = await api.post('/mealplans/save-sample', {
        planData,
        planName,
        planDescription
      });
      return response.data;
    } catch (error) {
      console.error('Error saving sample meal plan:', error);
      throw error;
    }
  }

  // Generate custom meal plan
  async generateCustomMealPlan(formData) {
    try {
      const response = await api.post('/mealplans/generate-custom', formData);
      return response.data;
    } catch (error) {
      console.error('Error generating custom meal plan:', error);
      throw error;
    }
  }

  // Function removed - no longer supporting meal plan updates

  // Delete meal plan
  async deleteMealPlan(id) {
    try {
      const response = await api.delete(`/mealplans/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  }
}

export default new MealPlanService(); 