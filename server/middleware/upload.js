import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure storage: files go to /uploads with unique filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${randomNum}${extension}`;
    cb(null, filename);
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
