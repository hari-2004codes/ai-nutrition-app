    // server/test-endpoints.js
    import express from 'express';
    import listEndpoints from 'express-list-endpoints';

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
    