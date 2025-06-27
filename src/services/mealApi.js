// frontend/src/api/mealApi.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const resp = await axios.post(`${BASE_URL}/api/meal/segment`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return resp.data; // segmentation result
}

export async function confirmMeal(payload) {
  // payload: { imagePath?, imageId, items: [...] }
  const resp = await axios.post(`${BASE_URL}/api/meal/confirm`, payload);
  return resp.data;
}

export async function fetchLogs() {
  const resp = await axios.get(`${BASE_URL}/api/meal/logs`);
  return resp.data;
}
