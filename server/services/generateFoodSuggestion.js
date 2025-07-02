// server/services/generateFoodSuggestion.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize the Generative AI client
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is not set!');
  console.error('Please add GEMINI_API_KEY to your .env file in the server directory');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define JSON schema for food suggestion response
const foodSuggestionSchema = {
  type: "OBJECT",
  properties: {
    healthiness: { 
      type: "STRING",
      description: "Overall healthiness rating: Excellent, Good, Fair, or Poor"
    },
    recommendation: { 
      type: "STRING",
      description: "Personalized recommendation based on user's profile and goals"
    },
    tips: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Array of 2-3 specific tips for this food item"
    },
    alternatives: {
      type: "ARRAY", 
      items: { type: "STRING" },
      description: "Array of 2-3 healthier alternative foods"
    },
    portion: { 
      type: "STRING",
      description: "Feedback on portion size - appropriate, too much, or too little"
    },
    timing: { 
      type: "STRING", 
      description: "Feedback on meal timing appropriateness"
    }
  },
  required: ["healthiness", "recommendation", "tips", "alternatives", "portion", "timing"]
};

// Configure the model
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    responseMimeType: 'application/json',
    responseSchema: foodSuggestionSchema,
  },
});

async function generateFoodSuggestion(foodData, userProfile) {
  // Check if API key is available
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to the .env file.');
  }
  const systemPrompt = `You are an expert nutritionist AI providing personalized food analysis and recommendations. Your primary function is to analyze a specific food item and provide detailed, actionable feedback based on the user's profile and health goals.

Your **ONLY** output must be a single, valid JSON object that matches the provided schema. Do not include any introductory text, explanations, or markdown formatting.

**Analysis Guidelines:**
1. **Healthiness Rating:** Rate as "Excellent", "Good", "Fair", or "Poor" based on nutritional value and user goals
2. **Personalized Recommendations:** Consider user's BMR, TDEE, goals, and current nutrition
3. **Actionable Tips:** Provide specific, practical advice for this food item
4. **Smart Alternatives:** Suggest similar but healthier options when applicable
5. **Portion Assessment:** Evaluate if the quantity aligns with user's goals and daily needs
6. **Timing Feedback:** Comment on appropriateness for the meal type and user's routine

**Context Considerations:**
- User's metabolic profile (BMR/TDEE)
- Current daily nutrition vs targets
- Health and fitness goals
- Meal timing and type
- Food's role in overall diet balance`;

  const userPrompt = `Please analyze this food item and provide personalized recommendations based on the user's profile:

**Food Item Details:**
- **Name:** ${foodData.name}
- **Quantity:** ${foodData.quantity} ${foodData.unit}
- **Calories:** ${foodData.calories}
- **Protein:** ${foodData.protein}g
- **Carbohydrates:** ${foodData.carbs}g
- **Fat:** ${foodData.fat}g
- **Meal Type:** ${foodData.mealType}

**User Profile:**
- **BMR:** ${userProfile.bmr} calories/day
- **TDEE:** ${userProfile.tdee} calories/day
- **Age:** ${userProfile.age} years
- **Gender:** ${userProfile.gender}
- **Activity Level:** ${userProfile.activityLevel}
- **Goal:** ${userProfile.goal} (lose/maintain/gain weight)
- **Dietary Preferences:** ${userProfile.preferences || 'None specified'}

**Current Daily Intake (so far):**
- **Calories:** ${userProfile.dailyIntake?.calories || 0}/${userProfile.tdee}
- **Protein:** ${userProfile.dailyIntake?.protein || 0}g
- **Carbs:** ${userProfile.dailyIntake?.carbs || 0}g
- **Fat:** ${userProfile.dailyIntake?.fat || 0}g

Provide specific, actionable advice that helps the user make informed decisions about their nutrition.`;

  try {
    // Input validation
    if (!foodData || !foodData.name || !foodData.calories) {
      throw new Error('Invalid food data provided');
    }

    if (!userProfile || !userProfile.bmr || !userProfile.tdee) {
      throw new Error('Invalid user profile data provided');
    }

    console.log('Generating food suggestion for:', foodData.name);

    const result = await model.generateContent([systemPrompt, userPrompt]);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('Invalid or empty response from Gemini API');
    }

    console.log('Raw JSON response from Gemini:', content);

    // Clean potential markdown wrappers
    const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const suggestionData = JSON.parse(cleanedContent);

      // Validate response structure
      const requiredFields = ['healthiness', 'recommendation', 'tips', 'alternatives', 'portion', 'timing'];
      const missingFields = requiredFields.filter(field => !suggestionData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate healthiness rating
      const validRatings = ['Excellent', 'Good', 'Fair', 'Poor'];
      if (!validRatings.includes(suggestionData.healthiness)) {
        throw new Error(`Invalid healthiness rating: ${suggestionData.healthiness}`);
      }

      // Validate arrays
      if (!Array.isArray(suggestionData.tips) || suggestionData.tips.length === 0) {
        throw new Error('Tips must be a non-empty array');
      }

      if (!Array.isArray(suggestionData.alternatives) || suggestionData.alternatives.length === 0) {
        throw new Error('Alternatives must be a non-empty array');
      }

      console.log('Food suggestion validation successful');
      return suggestionData;

    } catch (validationError) {
      console.error('Validation error:', validationError.message);
      console.error('Problematic content received from API:', content);
      throw new Error(`Food suggestion validation failed: ${validationError.message}`);
    }

  } catch (error) {
    console.error('Error in generateFoodSuggestion:', error.message);
    throw new Error(error.message || 'Failed to generate food suggestion');
  }
}

export default generateFoodSuggestion;
