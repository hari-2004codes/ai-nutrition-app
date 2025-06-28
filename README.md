
A modern nutrition tracking application with image-based food recognition capabilities.
## Features

- Track daily meals and nutrition intake
- Search for foods using the FatSecret API
- Image-based food recognition using LogMeal API
- Calorie and macronutrient tracking
- Weekly trends visualization

## Setup Instructions

### 1. Frontend Setup

```bash
# Navigate to the project directory
cd final-app

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 2. Backend Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file with the following content:
# PORT=4000
# LOGMEAL_API_KEY=your_logmeal_api_key_here

# Start the server
node index.js
```

### 3. LogMeal API Integration

To use the image-based food recognition feature, you need to:

1. Sign up for a LogMeal API key at [https://api.logmeal.es/](https://api.logmeal.es/)
2. Add your API key to the `.env` file in the server directory
3. Make sure the server is running when using the image recognition feature

## Using Image-Based Food Recognition

1. Navigate to the Meal Logging page
2. Click on "Add with Image" button
3. Upload a photo of your meal
4. The system will analyze the image and detect food items
5. Select the correct food from the suggestions for each detected item
6. Set the quantity for each confirmed food item
7. The food items will be added to your meal log with nutritional information

## Technical Implementation

The image-based food recognition workflow:

1. User uploads an image through the frontend
2. Backend sends the image to LogMeal API for segmentation and recognition
3. LogMeal API returns predictions for each food item in the image
4. User confirms the correct food items from the predictions
5. Backend sends confirmed items back to LogMeal API
6. LogMeal API returns nutritional information for each confirmed item
7. User sets the quantity for each food item
8. Items are added to the meal log with complete nutritional information

## Technologies Used

- React with Vite
- Tailwind CSS
- Framer Motion for animations
- Express.js backend
- LogMeal API for food recognition
- FatSecret API for food database
