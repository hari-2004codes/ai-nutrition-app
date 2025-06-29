# Frontend-Backend Integration Guide

## Overview
This guide explains how the frontend React app integrates with the Node.js backend for user authentication and profile management.

## Architecture

### Authentication Flow
1. **Firebase Authentication**: Users sign up/login via Firebase (email/password or Google)
2. **Backend Sync**: Firebase ID token is sent to backend for verification
3. **JWT Token**: Backend issues a JWT token for subsequent API calls
4. **Profile Management**: User profile data is stored in MongoDB

### Data Flow
```
Frontend (React) ↔ Firebase Auth ↔ Backend (Node.js) ↔ MongoDB
```

## Key Components

### 1. Authentication Service (`src/services/authService.js`)
- Centralized authentication management
- Handles Firebase-Backend synchronization
- Manages JWT tokens and user state
- Provides methods for login, logout, and profile management

### 2. API Configuration (`src/api.js`)
- Centralized Axios instance
- Automatic token injection
- Error handling for 401 responses

### 3. Auth Modal (`src/components/AuthModal.jsx`)
- Handles user signup/login
- Integrates Firebase authentication
- Syncs with backend after successful auth

### 4. Onboarding (`src/pages/Onboarding.jsx`)
- Collects user profile information
- Saves data to backend via Profile API
- Updates user state after completion

## Backend Integration

### User Model
- Stores basic user information (name, email, password)
- Supports both traditional and Firebase authentication
- Includes Google OAuth fields

### Profile Model
- Stores detailed user profile information
- Linked to User model via user ID
- Includes onboarding completion status

### API Endpoints
- `POST /api/auth/firebase` - Firebase authentication sync
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Environment Setup

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
```

### Backend (.env)
```env
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_connection_string
PORT=4000
```

## Usage

### Starting the Application

1. **Start Backend**:
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start Frontend**:
   ```bash
   npm install
   npm run dev
   ```

### Authentication Flow

1. User opens the app
2. If not authenticated, AuthModal appears
3. User signs up/logs in via Firebase
4. Backend syncs with Firebase and issues JWT
5. User completes onboarding (if new user)
6. User accesses the main application

### Profile Management

- Profile data is automatically saved during onboarding
- Profile can be updated via the Profile page
- All profile data is stored in MongoDB
- JWT token is used for authenticated API calls

## Error Handling

- 401 errors automatically clear authentication state
- Firebase errors are handled with user-friendly messages
- Backend errors are logged and displayed to users
- Network errors are handled gracefully

## Security

- Firebase handles authentication security
- JWT tokens are used for API authorization
- Passwords are hashed using bcrypt
- CORS is configured for development
- Environment variables are used for sensitive data

## Troubleshooting

### Common Issues

1. **Backend not running**: Ensure server is started on port 4000
2. **CORS errors**: Check CORS configuration in backend
3. **Authentication failures**: Verify Firebase configuration
4. **Database connection**: Check MongoDB connection string

### Debug Mode

Enable debug logging by checking browser console and server logs for detailed error information. 