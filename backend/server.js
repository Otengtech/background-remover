import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES6 __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());
// Serve processed images statically
app.use('/processed', express.static(path.join(__dirname, 'processed'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Type', 'image/png');
  }
}));

// ======================
// MULTER CONFIGURATION
// ======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ======================
// HELPER FUNCTIONS
// ======================
const createDirectories = async () => {
  const dirs = ['uploads', 'processed'];
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
};

const cleanupOldFiles = async () => {
  try {
    const now = Date.now();
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours
    
    const dirs = ['uploads', 'processed'];
    
    for (const dir of dirs) {
      try {
        const files = await fs.readdir(path.join(__dirname, dir));
        
        for (const file of files) {
          const filePath = path.join(__dirname, dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtimeMs < cutoff) {
            await fs.unlink(filePath);
            console.log(`Cleaned up: ${filePath}`);
          }
        }
      } catch (err) {
        // Directory might not exist yet
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

// ======================
// REMOVE.BG API FUNCTION
// ======================
const removeBackground = async (imageBuffer) => {
  try {
    const formData = new FormData();
    formData.append('image_file', imageBuffer, 'image.png');
    formData.append('size', 'auto');
    formData.append('format', 'png');
    formData.append('type', 'auto'); // Auto-detect foreground
    
    const response = await axios({
      method: 'post',
      url: 'https://api.remove.bg/v1.0/removebg',
      data: formData,
      responseType: 'arraybuffer',
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': process.env.REMOVEBG_API_KEY
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    return {
      success: true,
      data: Buffer.from(response.data, 'binary'),
      headers: response.headers
    };
  } catch (error) {
    console.error('Remove.bg API error:', error.response?.data?.toString() || error.message);
    
    if (error.response?.status === 402) {
      throw new Error('API credits exhausted. Please try again later.');
    } else if (error.response?.status === 413) {
      throw new Error('Image too large. Maximum size is 10MB.');
    } else if (error.response?.status === 422) {
      throw new Error('Unable to process image. Please try a different image.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again with a smaller image.');
    }
    
    throw new Error('Failed to remove background. Please try again.');
  }
};

// ======================
// ROUTES
// ======================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Background Remover API',
    timestamp: new Date().toISOString()
  });
});

// Process single image
app.post('/api/process', upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    if (!process.env.REMOVEBG_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    const inputPath = req.file.path;
    const originalSize = req.file.size;
    
    // Read image buffer
    const imageBuffer = await fs.readFile(inputPath);
    
    // Call remove.bg API
    const result = await removeBackground(imageBuffer);
    
    // Generate unique filename for processed image
    const processedFilename = `processed-${Date.now()}.png`;
const outputPath = path.join(__dirname, 'processed', processedFilename);
await fs.writeFile(outputPath, result.data, { mode: 0o644 }); // Add permissions
console.log(`File saved to: ${outputPath}`); 
    
    // Save processed image
    await fs.writeFile(outputPath, result.data);
    
    // Calculate metrics
    const processingTime = Date.now() - startTime;
    const processedSize = result.data.length;
    const reduction = ((1 - (processedSize / originalSize)) * 100).toFixed(1);
    
    // Clean up original file
    await fs.unlink(inputPath);
    
    // Return success response
    res.json({
      success: true,
      filename: processedFilename,
      url: `/processed/${processedFilename}`,
      downloadUrl: `/processed/${processedFilename}`,
      metrics: {
        originalSize,
        processedSize,
        reduction: `${reduction}%`,
        processingTime: `${processingTime}ms`,
        format: 'PNG'
      }
    });
    
  } catch (error) {
    console.error('Processing error:', error);
    
    // Clean up on error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process image'
    });
  }
});

// Download endpoint
// Download endpoint - FIXED VERSION
app.get('/api/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    // Validate filename to prevent directory traversal
    if (!/^processed-\d+\.png$/.test(filename)) {
      return res.status(400).json({ error: 'Invalid filename format' });
    }
    
    const filePath = path.join(__dirname, 'processed', filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'File not found or expired' });
    }
    
    // Get file stats
    const stats = await fs.stat(filePath);
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', stats.size);
    
    // Stream file
    const fileStream = fs.createReadStream(filePath);
    
    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });
    
    // Pipe to response
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'Failed to download file',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get processed image (for preview)
app.get('/api/image/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'processed', filename);
    
    // Check if file exists
    await fs.access(filePath);
    
    res.setHeader('Content-Type', 'image/png');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
});

// ======================
// ERROR HANDLING
// ======================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        success: false,
        error: 'File too large. Maximum size is 25MB' 
      });
    }
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
  
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

// ======================
// SERVER STARTUP
// ======================
const startServer = async () => {
  try {
    await createDirectories();
    
    // Clean up old files every hour
    setInterval(cleanupOldFiles, 60 * 60 * 1000);
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();