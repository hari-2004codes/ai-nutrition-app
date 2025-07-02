# Render Deployment Guide

## Required Environment Variables

Add these environment variables in your Render dashboard:

### Backend Environment Variables (Node.js Service)
```
NODE_ENV=production
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# LogMeal API
LOGMEAL_API_KEY=your_logmeal_api_key

# FatSecret API (Server-side only)
FATSECRET_API_KEY=your_fatsecret_consumer_key
FATSECRET_API_SECRET=your_fatsecret_consumer_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Environment Variables (Static Site)
```
# Only if needed for Firebase or other client-side services
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
# etc...
```

## API Changes Made

### 1. FatSecret API
- **Problem**: CORS issues and client-side OAuth exposure
- **Solution**: Moved to backend with server-side OAuth 1.0 authentication
- **New Endpoints**: 
  - `GET /api/fatsecret/search?q=query` - Search foods
  - `GET /api/fatsecret/food/:id` - Get food details

### 2. LogMeal API  
- **Problem**: File upload and CORS issues
- **Solution**: Already on backend, ensure proper error handling
- **Endpoints**: 
  - `POST /api/meals/segment` - Upload image for recognition
  - `POST /api/meals/confirm` - Confirm detected dishes
  - `POST /api/meals/nutrition` - Get nutrition info

## Deployment Steps

1. **Deploy Backend Service**:
   - Service Type: Web Service
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Add all backend environment variables

2. **Deploy Frontend Static Site**:
   - Service Type: Static Site
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add frontend environment variables (if any)

3. **Update CORS Settings**:
   The backend is already configured with your Render domain in CORS settings:
   ```javascript
   app.use(cors({
     origin: ['https://ai-nutrition-app-avgx.onrender.com'],
     credentials: true
   }));
   ```

## Testing the Fixes

1. **Test FatSecret Search**:
   - Go to meal logging page
   - Click "Add Food Manually" 
   - Search for foods like "apple" or "chicken"
   - Should see autocomplete results

2. **Test LogMeal Image Recognition**:
   - Go to meal logging page
   - Upload an image of food
   - Should see food detection and nutrition analysis

## Common Issues and Solutions

### Issue: "API credentials not configured"
- **Solution**: Check environment variables are set correctly in Render dashboard

### Issue: "CORS error" 
- **Solution**: Update the CORS origin array in `server/index.js` with your actual Render frontend URL

### Issue: "Network error"
- **Solution**: Ensure backend and frontend are both deployed and running

### Issue: LogMeal file upload fails
- **Solution**: Check that uploaded files have proper permissions and the temp directory exists

## Environment Variable Priorities

1. **Critical**: MONGO_URI, JWT_SECRET, LOGMEAL_API_KEY, FATSECRET_API_KEY, FATSECRET_API_SECRET
2. **Important**: GEMINI_API_KEY (for meal plan generation)
3. **Optional**: Firebase variables (if using Firebase features)
