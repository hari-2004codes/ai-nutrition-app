// src/services/foodRecognitionApi.js
import axios from 'axios'; // Adjust import path as needed

/**
 * Send image to food recognition API
 * @param {FormData} formData - FormData containing the image file
 * @returns {Promise} API response with detected foods
 */
export const recognizePlate = (formData) => {
  return axios.post('/api/recognition/plate', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Wrapper function with error handling for food recognition
 * @param {FormData} formData - FormData containing the image file
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const recognizePlateWithErrorHandling = async (formData) => {
  try {
    const response = await recognizePlate(formData);
    
    // Check if the response contains the expected data structure
    if (response.data && Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data
      };
    }
    
    // Handle different response structures based on your API
    if (response.data && response.data.foods) {
      return {
        success: true,
        data: response.data.foods
      };
    }
    
    if (response.data && response.data.detectedFoods) {
      return {
        success: true,
        data: response.data.detectedFoods
      };
    }
    
    return {
      success: false,
      error: 'No foods detected in the image'
    };
    
  } catch (error) {
    console.error('Food recognition API error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;
      
      switch (status) {
        case 400:
          return {
            success: false,
            error: message || 'Invalid image format. Please try a different image.'
          };
        case 401:
          return {
            success: false,
            error: 'Authentication failed. Please log in again.'
          };
        case 413:
          return {
            success: false,
            error: 'Image file is too large. Please use a smaller image.'
          };
        case 429:
          return {
            success: false,
            error: 'Too many requests. Please wait a moment and try again.'
          };
        case 500:
          return {
            success: false,
            error: 'Server error. Please try again later.'
          };
        default:
          return {
            success: false,
            error: message || `Request failed with status ${status}`
          };
      }
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    } else {
      // Other error
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      };
    }
  }
};

/**
 * Helper function to validate image file before sending
 * @param {File} file - Image file to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validateImageFile = (file) => {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' };
  }
  
  // Check file size (e.g., max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: 'Image file is too large. Please use an image smaller than 10MB.' };
  }
  
  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedFormats.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Unsupported image format. Please use JPEG, PNG, or WebP.' };
  }
  
  return { valid: true };
};