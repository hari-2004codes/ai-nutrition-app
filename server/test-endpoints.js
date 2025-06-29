    // server/test-endpoints.js
    import express from 'express';
    import listEndpoints from 'express-list-endpoints';
    import axios from 'axios';

    const app = express();

    // A simple, direct route
    app.get('/hello', (req, res) => {
      res.send('Hello from test route!');
    });

    // Another simple route
    app.post('/data', (req, res) => {
      res.json({ message: 'Data received!' });
    });

    // List the endpoints
    console.log("--- Test Endpoints ---");
    const endpoints = listEndpoints(app);
    console.table(endpoints.map(e => ({
        method: e.methods.join(","),
        path:   e.path
    })));
    console.log("--- End Test Endpoints ---");

    // Start a minimal server to ensure it runs
    const PORT = 5000; // Use a different port to avoid conflict with your main app
    app.listen(PORT, () => {
      console.log(`Test server listening on http://localhost:${PORT}`);
    });

    const API_BASE = 'http://localhost:4000/api';

    // Test meal plan generation
    const testMealPlanGeneration = async () => {
      try {
        console.log('Testing meal plan generation...');
        
        // First, test if the server is running
        const healthCheck = await axios.get('http://localhost:4000/');
        console.log('✅ Server is running:', healthCheck.data);
        
        // Test the mealplans endpoint
        const mealPlansResponse = await axios.get(`${API_BASE}/mealplans`);
        console.log('✅ Meal plans endpoint accessible:', mealPlansResponse.status);
        
        console.log('✅ All tests passed!');
      } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
      }
    };

    // Run the test
    testMealPlanGeneration();
    