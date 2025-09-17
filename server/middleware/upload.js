const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Get category from request body
    const category = req.body.category;
    
    // Map category to assets folder
    let assetsFolder = '../assets/';
    switch(category) {
      case 'canvas':
        assetsFolder += 'canvas/';
        break;
      case 'sketches':
        assetsFolder += 'sketch/';
        break;
      case 'color':
        assetsFolder += 'color paint/';
        break;
      default:
        assetsFolder += 'canvas/'; // Default to canvas
    }
    
    // Ensure directory exists
    if (!fs.existsSync(assetsFolder)) {
      fs.mkdirSync(assetsFolder, { recursive: true });
    }
    
    cb(null, assetsFolder);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
