import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Setting destination to:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `upload-${uniqueSuffix}${path.extname(file.originalname)}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter function
export const fileFilter = (req, file, cb) => {
  console.log('File filter - Original name:', file.originalname);
  console.log('File filter - Mimetype:', file.mimetype);
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    fieldSize: 10 * 1024 * 1024 // 10MB
  }
});

// Wrapper for single-field upload with error handling
export const handleUpload = (fieldName) => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large', message: 'Max size is 10MB' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: 'Unexpected field', message: `Expected '${fieldName}'` });
        }
        return res.status(400).json({ error: 'Upload error', message: err.message, code: err.code });
      } else if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ error: 'Upload failed', message: err.message });
      }
      console.log('Upload successful:', req.file?.filename);
      next();
    });
  };
};

// Flexible upload handler for multiple allowed field names
export const handleFlexibleUpload = (allowedFields) => {
  return (req, res, next) => {
    const uploadAny = upload.any();
    uploadAny(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large', message: 'Max size is 10MB' });
        }
        return res.status(400).json({ error: 'Upload error', message: err.message, code: err.code });
      } else if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ error: 'Upload failed', message: err.message });
      }

      if (!req.files?.length) {
        return res.status(400).json({ error: 'No file uploaded', message: `Allowed fields: ${allowedFields.join(', ')}` });
      }

      const uploadedFile = req.files.find(f => allowedFields.includes(f.fieldname));
      if (!uploadedFile) {
        const received = req.files.map(f => f.fieldname).join(', ');
        return res.status(400).json({ error: 'Invalid field name', message: `Expected: ${allowedFields.join(', ')}, got: ${received}` });
      }

      req.file = uploadedFile;
      console.log('Flexible upload successful:', uploadedFile.filename);
      next();
    });
  };
};