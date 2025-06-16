import axios from 'axios';

const API_KEY = import.meta.env.VITE_FATSECRET_API_KEY;
const API_SECRET = import.meta.env.VITE_FATSECRET_API_SECRET;
const BASE_URL = '/api/fatsecret'; // Updated to use proxy

// Helper function to generate OAuth signature using Web Crypto API
const generateOAuthSignature = async (params) => {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  // Create base string
  const baseString = Object.entries(sortedParams)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  // Create signature base string
  const signatureBaseString = `GET&${encodeURIComponent('https://platform.fatsecret.com/rest/server.api')}&${encodeURIComponent(baseString)}`;

  // Convert API secret to key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(`${API_SECRET}&`);
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
};

// Get food autocomplete suggestions
export const getFoodAutocomplete = async (query) => {
  try {
    const params = {
      method: 'foods.search',
      format: 'json',
      search_expression: query,
      oauth_consumer_key: API_KEY,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_nonce: Math.random().toString(36).substring(7),
      oauth_version: '1.0'
    };

    const signature = await generateOAuthSignature(params);
    params.oauth_signature = signature;

    console.log('Making request with params:', params);
    const response = await axios.get(BASE_URL, { 
      params,
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching food autocomplete:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
};

// Get detailed food information
export const getFoodDetails = async (foodId) => {
  try {
    const params = {
      method: 'food.get.v2',
      format: 'json',
      food_id: foodId,
      oauth_consumer_key: API_KEY,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_nonce: Math.random().toString(36).substring(7),
      oauth_version: '1.0'
    };

    const signature = await generateOAuthSignature(params);
    params.oauth_signature = signature;

    console.log('Making request with params:', params);
    const response = await axios.get(BASE_URL, { 
      params,
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching food details:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
}; 