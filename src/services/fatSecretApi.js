import axios from 'axios';

const API_KEY = import.meta.env.VITE_FATSECRET_API_KEY;
const API_SECRET = import.meta.env.VITE_FATSECRET_API_SECRET;
const BASE_URL = '/api/fatsecret';

// Helper function to generate OAuth signature using Web Crypto API
const generateOAuthSignature = async (params, httpMethod = 'GET', baseUrl = 'https://platform.fatsecret.com/rest/server.api') => {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  // Create parameter string
  const parameterString = Object.entries(sortedParams)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  // Create signature base string
  const signatureBaseString = `${httpMethod}&${encodeURIComponent(baseUrl)}&${encodeURIComponent(parameterString)}`;

  console.log('Signature Base String:', signatureBaseString);

  // Create signing key (API_SECRET + "&" for OAuth 1.0)
  const encoder = new TextEncoder();
  const keyData = encoder.encode(`${API_SECRET}&`);
  
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    // Sign the message
    const messageData = encoder.encode(signatureBaseString);
    const signature = await crypto.subtle.sign('HMAC', key, messageData);

    // Convert to base64
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  } catch (error) {
    console.error('Error generating signature:', error);
    throw new Error('Failed to generate OAuth signature');
  }
};

// Generate OAuth parameters
const generateOAuthParams = () => {
  return {
    oauth_consumer_key: API_KEY,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    oauth_version: '1.0'
  };
};

// Get food autocomplete suggestions
export const getFoodAutocomplete = async (query) => {
  if (!API_KEY || !API_SECRET) {
    throw new Error('FatSecret API credentials are not configured. Please check your environment variables.');
  }

  if (!query || query.trim().length < 2) {
    throw new Error('Search query must be at least 2 characters long');
  }

  try {
    // Create base parameters
    const baseParams = {
      method: 'foods.search',
      format: 'json',
      search_expression: query.trim(),
      max_results: '20'
    };

    // Add OAuth parameters
    const oauthParams = generateOAuthParams();
    const allParams = { ...baseParams, ...oauthParams };

    // Generate signature
    const signature = await generateOAuthSignature(allParams);
    allParams.oauth_signature = signature;

    console.log('Making foods.search request with params:', {
      ...allParams,
      oauth_signature: signature.substring(0, 10) + '...' // Log partial signature for debugging
    });

    const response = await axios.get(BASE_URL, { 
      params: allParams,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('Foods search API Response:', response.data);

    // Handle different response structures
    if (response.data.foods && response.data.foods.food) {
      return Array.isArray(response.data.foods.food) 
        ? response.data.foods.food 
        : [response.data.foods.food];
    } else if (response.data.error) {
      throw new Error(`API Error: ${response.data.error.message || 'Unknown error'}`);
    } else {
      return [];
    }

  } catch (error) {
    console.error('Error fetching food autocomplete:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Please check your API credentials.');
      } else if (error.response.status === 403) {
        throw new Error('Access forbidden. Please check your API permissions.');
      } else if (error.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Get detailed food information
export const getFoodDetails = async (foodId) => {
  if (!API_KEY || !API_SECRET) {
    throw new Error('FatSecret API credentials are not configured. Please check your environment variables.');
  }

  if (!foodId) {
    throw new Error('Food ID is required');
  }

  try {
    // Create base parameters
    const baseParams = {
      method: 'food.get.v4', // Using v4 for more detailed nutrition info
      format: 'json',
      food_id: foodId.toString()
    };

    // Add OAuth parameters
    const oauthParams = generateOAuthParams();
    const allParams = { ...baseParams, ...oauthParams };

    // Generate signature
    const signature = await generateOAuthSignature(allParams);
    allParams.oauth_signature = signature;

    console.log('Making food.get request with params:', {
      ...allParams,
      oauth_signature: signature.substring(0, 10) + '...'
    });

    const response = await axios.get(BASE_URL, { 
      params: allParams,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });

    console.log('Food details API Response:', response.data);

    if (response.data.food) {
      return response.data.food;
    } else if (response.data.error) {
      throw new Error(`API Error: ${response.data.error.message || 'Unknown error'}`);
    } else {
      throw new Error('No food data found');
    }

  } catch (error) {
    console.error('Error fetching food details:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Please check your API credentials.');
      } else if (error.response.status === 403) {
        throw new Error('Access forbidden. Please check your API permissions.');
      } else if (error.response.status === 404) {
        throw new Error('Food not found. Please check the food ID.');
      } else if (error.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Helper function to parse nutrition data from FatSecret response
export const parseNutritionData = (foodData) => {
  if (!foodData || !foodData.servings || !foodData.servings.serving) {
    return null;
  }

  const serving = Array.isArray(foodData.servings.serving) 
    ? foodData.servings.serving[0] 
    : foodData.servings.serving;

  return {
    id: foodData.food_id,
    name: foodData.food_name,
    brand: foodData.brand_name || '',
    calories: parseFloat(serving.calories) || 0,
    protein: parseFloat(serving.protein) || 0,
    carbs: parseFloat(serving.carbohydrate) || 0,
    fat: parseFloat(serving.fat) || 0,
    fiber: parseFloat(serving.fiber) || 0,
    sugar: parseFloat(serving.sugar) || 0,
    sodium: parseFloat(serving.sodium) || 0,
    servingDescription: serving.serving_description || '1 serving',
    servingSize: serving.metric_serving_amount ? 
      `${serving.metric_serving_amount}${serving.metric_serving_unit}` : 
      serving.serving_description
  };
};