// routes/recognition.js
import express from 'express';
import { handleUpload, handleFlexibleUpload } from '../middleware/upload.js';

const router = express.Router();
// Health check endpoint
router.get('/health', (req, res) => {
    console.log('Health check endpoint called');
    res.json({ 
        status: 'OK', 
        message: 'Recognition service is running',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint without file upload
router.post('/test', (req, res) => {
    console.log('Test endpoint called');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    res.json({
        message: 'Test endpoint working',
        body: req.body,
        timestamp: new Date().toISOString()
    });
});

// Simple file upload test
router.post('/upload-test', handleUpload('file'), (req, res) => {
    console.log('=== UPLOAD TEST ENDPOINT ===');
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    if (!req.file) {
        return res.status(400).json({
            error: 'No file uploaded',
            message: 'Please upload a file with field name "file"'
        });
    }
    
    res.json({
        message: 'File uploaded successfully',
        file: {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path
        },
        timestamp: new Date().toISOString()
    });
});

// Flexible plate recognition endpoint - accepts multiple field names
router.post('/plate', handleFlexibleUpload(['plateImage', 'image', 'file']), (req, res) => {
    console.log('=== PLATE RECOGNITION ENDPOINT ===');
    console.log('File received:', req.file ? 'Yes' : 'No');
    console.log('Field name used:', req.file ? req.file.fieldname : 'None');
    console.log('Request body:', req.body);
    
    // Simulate plate recognition processing
    res.json({
        message: 'Plate image processed successfully',
        fieldUsed: req.file.fieldname,
        file: {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        },
        // Mock recognition results
        recognition: {
            status: 'success',
            message: 'This is a mock response. Actual AI processing will be implemented here.'
        },
        timestamp: new Date().toISOString()
    });
});

// Simple plate endpoint that only accepts 'plateImage'
router.post('/plate-strict', handleUpload('plateImage'), (req, res) => {
    console.log('=== STRICT PLATE RECOGNITION ENDPOINT ===');
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    if (!req.file) {
        return res.status(400).json({
            error: 'No image uploaded',
            message: 'Please upload an image with field name "plateImage"'
        });
    }
    
    res.json({
        message: 'Plate image processed successfully (strict mode)',
        file: {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        },
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
    console.error('Route error:', error);
    
    // Handle specific error types
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'Invalid request format',
            message: 'Request body could not be parsed'
        });
    }
    
    if (error.message.includes('Unexpected end of form')) {
        return res.status(400).json({
            error: 'Form data incomplete',
            message: 'The form data appears to be incomplete or corrupted. Please try again.'
        });
    }
    
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

export default router;