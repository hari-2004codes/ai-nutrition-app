import multer from 'multer';
import path from 'path';

// Configure storage: files go to /uploads with original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    // preserve original name; you could also generate a unique one
    cb(null, file.originalname);
  }
});

// Only accept image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files allowed'), false);
};

// 5 MB max file size
const limits = { fileSize: 5 * 1024 * 1024 };

export const upload = multer({ storage, fileFilter, limits });
