import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function generateMealPlan(formData) {
  const system = `You are a structured meal-planning assistant that generates Indian meal plans. You must respond with a valid JSON array of day objects.

Each day object must follow this EXACT structure:
{
  "day": number,
  "meals": [
    {
      "mealType": string (exactly one of: "Breakfast", "Lunch", "Dinner", "Evening Snack"),
      "name": string (Indian dish name),
      "description": string (brief description of the dish),
      "calories": number,
      "prepTime": string (format: "X mins"),
      "recipe": {
        "ingredients": string[],
        "instructions": string[]
      }
    }
  ]
}

Guidelines for meal planning:
1. All dishes must be authentic Indian recipes
2. Respect dietary restrictions (vegetarian, non-vegetarian, vegan, jain)
3. Follow regional preferences (north indian, south indian, gujarati, punjabi)
4. Use Indian measurements (katori, tsp, tbsp)
5. Include traditional breakfast items for morning meals
6. Maintain caloric distribution across meals
7. Each recipe must have detailed ingredients and detailed instructions clearly guiding each step and the process`.trim();

  const user = `Generate a ${formData.duration}-day Indian meal plan with:
- Daily calories: ${formData.calories}
- Cuisine type: ${formData.diet}
- Excluded ingredients: ${formData.exclude?.length ? formData.exclude.join(', ') : 'none'}
- Dietary restrictions: ${formData.intolerances?.length ? formData.intolerances.join(', ') : 'none'}
- Meal types: ${formData.mealTypes.join(', ')}
- Cooking difficulty: ${formData.difficulty}
- Maximum prep time: ${formData.prepTime} minutes
- Maximum ingredients per recipe: ${formData.ingredients}

IMPORTANT: Respond with ONLY a JSON array of day objects. No wrapper object, no additional text.`.trim();

  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.7,
  };

  try {
    // Validate required fields
    const requiredFields = ['duration', 'calories', 'diet', 'mealTypes'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate numeric fields
    if (isNaN(parseInt(formData.duration)) || parseInt(formData.duration) <= 0) {
      throw new Error('Duration must be a positive number');
    }
    if (isNaN(parseInt(formData.calories)) || parseInt(formData.calories) < 1200) {
      throw new Error('Calories must be at least 1200');
    }
    if (isNaN(parseInt(formData.prepTime)) || parseInt(formData.prepTime) <= 0) {
      throw new Error('Prep time must be a positive number');
    }

    console.log('Sending request to Groq API...');
    const resp = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!resp.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from Groq API');
    }

    const content = resp.data.choices[0].message.content;
    console.log('Raw response from Groq:', content);

    try {
      let mealPlanData;
      try {
        mealPlanData = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', content);
        throw new Error('Invalid JSON response from API');
      }

      // Handle both array and object responses
      if (Array.isArray(mealPlanData)) {
        // Response is already an array
        console.log('Received array response');
      } else if (mealPlanData.days && Array.isArray(mealPlanData.days)) {
        // Response is wrapped in an object
        console.log('Received object response with days array');
        mealPlanData = mealPlanData.days;
      } else {
        throw new Error('Response is neither an array nor contains a days array');
      }

      // Validate the meal plan structure
      if (mealPlanData.length === 0) {
        throw new Error('Meal plan array is empty');
      }

      // Validate each day's structure
      mealPlanData.forEach((day, dayIndex) => {
        if (!day.day || !Array.isArray(day.meals)) {
          throw new Error(`Invalid structure for day ${dayIndex + 1}`);
        }

        if (day.meals.length === 0) {
          throw new Error(`No meals defined for day ${dayIndex + 1}`);
        }

        day.meals.forEach((meal, mealIndex) => {
          const requiredFields = ['mealType', 'name', 'description', 'calories', 'prepTime', 'recipe'];
          const missingFields = requiredFields.filter(field => !meal[field]);

          if (missingFields.length > 0) {
            throw new Error(`Missing fields (${missingFields.join(', ')}) in meal ${mealIndex + 1} of day ${dayIndex + 1}`);
          }

          if (!Array.isArray(meal.recipe?.ingredients) || !Array.isArray(meal.recipe?.instructions)) {
            throw new Error(`Invalid recipe structure in meal ${mealIndex + 1} of day ${dayIndex + 1}`);
          }
        });
      });

      console.log('Meal plan validation successful');
      return mealPlanData;

    } catch (validationError) {
      console.error('Validation error:', validationError);
      throw new Error(`Meal plan validation failed: ${validationError.message}`);
    }
  } catch (error) {
    console.error('Error in generateMealPlan:', error);
    throw new Error(error.message || 'Failed to generate meal plan');
  }
}

export default generateMealPlan; 