# Final App - AI Nutrition Tracker

## Build/Test Commands
- **Frontend Dev**: `npm run dev` (starts Vite dev server on :5173)
- **Frontend Build**: `npm run build` (creates dist/ folder)
- **Frontend Lint**: `npm run lint` (ESLint check)
- **Backend Dev**: `cd server && npm run dev` (nodemon on :4000)
- **Backend Start**: `cd server && npm start` (production mode)
- **Manual Tests**: `cd server && node test-server.js` (integration tests), `node test-endpoints.js`

## Architecture
- **Frontend**: React + Vite + TailwindCSS + Framer Motion on port 5173
- **Backend**: Express.js server on port 4000
- **Database**: MongoDB with Mongoose ODM (env: MONGO_URI)
- **Authentication**: Firebase Auth client-side + JWT server-side with middleware
- **External APIs**: LogMeal (food recognition), FatSecret (nutrition), Google Gemini AI
- **Key Models**: User, Profile, MealEntry, MealPlan, Progress
- **Structure**: `/server` (backend), `/src` (frontend), `/server/controllers`, `/server/models`, `/server/routes`

## Code Style
- **Type**: ES modules (`"type": "module"`)
- **React**: Functional components with hooks, PascalCase component names
- **Imports**: Named imports preferred, group: external → internal → relative
- **Styling**: TailwindCSS classes, Framer Motion animations
- **Error Handling**: Try-catch in controllers, consistent HTTP status codes (400/401/404/500)
- **Response Format**: `{ msg: "message", error?: errorDetails }` for errors
- **Auth**: Firebase client + JWT server with middleware protection
- **Files**: camelCase for JS/JSX, kebab-case for routes
- **Testing**: Manual integration tests using axios (no formal test framework)
