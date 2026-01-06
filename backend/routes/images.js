import express from 'express';
import multer from 'multer';
import ImageController from '../controllers/ImageController.js';

const router = express.Router();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes
router.post('/remove-background', upload.single('image'), ImageController.removeBackground);
router.get('/stats', ImageController.getStats);
router.get('/account-status', ImageController.getAccountStatus);

export default router;