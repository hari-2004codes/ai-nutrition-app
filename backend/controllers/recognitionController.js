const { recognizePlate } = require('../services/imageRecognition');
const fs = require('fs').promises;
const path = require('path');

exports.recognizePlateController = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file uploaded',
        message: 'Please upload an image file',
        acceptedFields: ['plateImage', 'image', 'file', 'photo', 'picture'],
        instructions: {
          postman: 'In Postman: Body → form-data → Key: any of the accepted fields → Key Type: File → Value: choose image file',
          curl: 'curl -X POST -F "image=@/path/to/image.jpg" http://localhost:5000/api/recognition/plate'
        }
      });
    }

    console.log('Processing image:', req.file.filename);
    console.log('File path:', req.file.path);
    console.log('Original field name:', req.file.fieldname);

    // Call the recognition service
    const results = await recognizePlate(req.file.path);

    // Clean up: delete the uploaded file after processing
    try {
      await fs.unlink(req.file.path);
      console.log('Cleaned up uploaded file:', req.file.filename);
    } catch (cleanupError) {
      console.warn('Failed to cleanup uploaded file:', cleanupError.message);
    }

    // Return the recognition results
    res.json({
      success: true,
      filename: req.file.filename,
      fieldName: req.file.fieldname,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recognition error:', error);

    // Clean up file if there was an error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup file after error:', cleanupError.message);
      }
    }

    // Pass error to error handler middleware
    next(error);
  }
};