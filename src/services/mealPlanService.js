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

  // Generate 6 default meal plans based on user profile
  async generateDefaultMealPlans() {
    try {
      const response = await api.post('/mealplans/generate-default');
      return response.data;
    } catch (error) {
      console.error('Error generating default meal plans:', error);
      throw error;
    }
  }

  // Check if user has default meal plans and generate if needed
  async ensureDefaultMealPlans() {
    try {
      const response = await this.getUserMealPlans();
      const plans = response.data || [];
      const defaultPlans = plans.filter(plan => plan.planType === 'default');
      
      if (defaultPlans.length === 0) {
        console.log('No default meal plans found, generating...');
        return await this.generateDefaultMealPlans();
      }
      
      return { data: defaultPlans };
    } catch (error) {
      console.error('Error ensuring default meal plans:', error);
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

  // Update meal plan
  async updateMealPlan(id, updates) {
    try {
      const response = await api.put(`/mealplans/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    }
  }

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