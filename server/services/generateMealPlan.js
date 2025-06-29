// The library is now @google/generative-ai
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// --- Initialization with API Key ---
// 1. Initialize the main Generative AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Define the exact JSON schema for the model's output.
// This is the most reliable way to enforce a valid JSON structure.
const mealPlanSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      day: { type: "NUMBER" },
      meals: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            mealType: { type: "STRING" },
            name: { type: "STRING" },
            description: { type: "STRING" },
            calories: { type: "NUMBER" },
            prepTime: { type: "STRING" },
            recipe: {
              type: "OBJECT",
              properties: {
                ingredients: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                },
                instructions: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                }
              },
              required: ["ingredients", "instructions"]
            }
          },
          required: ["mealType", "name", "description", "calories", "prepTime", "recipe"]
        }
      }
    },
    required: ["day", "meals"]
  }
};


// 3. Configure and get the model, now including the responseSchema
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    responseMimeType: 'application/json',
    responseSchema: mealPlanSchema,
  },
});

async function generateMealPlan(formData) {
  // --- The improved prompts remain IDENTICAL ---
  const system_prompt = `You are an expert Indian culinary AI assistant specializing in creating structured, personalized meal plans. Your primary function is to generate a response that strictly adheres to the provided JSON schema.

Your **ONLY** output must be a single, valid JSON array of "day" objects that matches the schema. Do not include any introductory text, explanations, or markdown formatting.

**Meal Planning Rules:**
1.  **Authenticity:** All dishes must be authentic Indian recipes.
2.  **Preferences:** Strictly adhere to the user's dietary (vegetarian, non-vegetarian, vegan, jain), regional (north indian, south indian, gujarati), and ingredient exclusion requests.
3.  **Measurements:** Use common Indian kitchen measurements (e.g., katori, cup, tsp, tbsp).
4.  **Caloric Balance:** Distribute the total daily calories intelligently across the requested meals.
5.  **Recipe Quality:** Provide detailed, clear, and easy-to-follow ingredients and instructions for each recipe.
6.  **Completeness:** Ensure every field in the JSON structure is populated with a valid value.`.trim();

  const user_prompt = `Please generate a personalized Indian meal plan based on the following criteria. Follow all rules and the JSON structure defined in the system prompt.

**User Requirements:**
- **Plan Duration:** ${formData.duration} days
- **Target Daily Calories:** ${formData.calories}
- **Dietary Profile:** ${formData.diet}
- **Specific Dietary Restrictions:** ${formData.intolerances?.length ? formData.intolerances.join(', ') : 'None'}
- **Excluded Ingredients:** ${formData.exclude?.length ? formData.exclude.join(', ') : 'None'}
- **Required Meals per Day:** ${formData.mealTypes.join(', ')}
- **Preferred Cooking Difficulty:** ${formData.difficulty}
- **Max Prep Time per Meal:** ${formData.prepTime} minutes
- **Max Ingredients per Recipe:** ${formData.ingredients}

Remember: Your response must be the JSON array only, conforming to the schema.`.trim();

  try {
    // Input validation logic remains IDENTICAL and correct
    const requiredFields = ['duration', 'calories', 'diet', 'mealTypes', 'prepTime', 'ingredients'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    // ... (rest of the validation is correct)

    console.log('Sending request to Google AI Gemini API...');

    const result = await model.generateContent([system_prompt, user_prompt]);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('Invalid or empty response from Gemini API');
    }
    
    console.log('Raw JSON response from Gemini:', content);

    // Add a cleaning step as a safeguard. This removes potential markdown
    // wrappers (e.g., ```json ... ```) that can cause parsing errors.
    const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

    // The entire validation block for the response remains IDENTICAL and correct
    try {
      // Use the cleaned content for parsing to improve reliability.
      const mealPlanData = JSON.parse(cleanedContent);

      if (!Array.isArray(mealPlanData)) {
         throw new Error('Response is not a JSON array as expected.');
      }
      if (mealPlanData.length === 0) {
        throw new Error('Meal plan array is empty');
      }

      // Deep validation of the array structure
      mealPlanData.forEach((day, dayIndex) => {
        if (!day.day || !Array.isArray(day.meals) || day.meals.length === 0) {
          throw new Error(`Invalid structure for day ${dayIndex + 1}`);
        }
        day.meals.forEach((meal, mealIndex) => {
          const requiredMealFields = ['mealType', 'name', 'description', 'calories', 'prepTime', 'recipe'];
          const missingMealFields = requiredMealFields.filter(field => meal[field] === undefined);
          if (missingMealFields.length > 0) {
            throw new Error(`Missing fields (${missingMealFields.join(', ')}) in meal ${mealIndex + 1} of day ${dayIndex + 1}`);
          }
          if (!meal.recipe || !Array.isArray(meal.recipe.ingredients) || !Array.isArray(meal.recipe.instructions)) {
            throw new Error(`Invalid recipe structure in meal ${mealIndex + 1} of day ${dayIndex + 1}`);
          }
        });
      });

      console.log('Meal plan validation successful');
      return mealPlanData;

    } catch (validationError) {
      console.error('Validation error:', validationError.message);
      console.error('Problematic content received from API:', content); 
      throw new Error(`Meal plan validation failed: ${validationError.message}`);
    }
  } catch (error) {
    console.error('Error in generateMealPlan:', error.message);
    throw new Error(error.message || 'Failed to generate meal plan');
  }
}

export default generateMealPlan;
