require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const scanRoutes = require('./routes/scan');
const registerRoutes = require('./routes/register');
const reportRoutes = require('./routes/report');

// Initialize nodemailer transporter (configuration in src/email.js)
require('./src/email');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers (helmet alternative)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + path.basename(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Only PNG and JPEG images are allowed'), false);
  }
};
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// Rate limiting: 10 requests per IP per hour
const rateLimitMap = new Map();
const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  const timestamps = rateLimitMap.get(ip);
  // Remove old timestamps
  while (timestamps.length > 0 && now - timestamps[0] > windowMs) {
    timestamps.shift();
  }
  if (timestamps.length >= 10) {
    return res.status(429).send('Too many requests');
  }
  timestamps.push(now);
  next();
};

// Apply rate limiting to POST /register and POST /report
app.use('/register', (req, res, next) => {
  if (req.method === 'POST') {
    rateLimitMiddleware(req, res, next);
  } else {
    next();
  }
});
app.use('/report', (req, res, next) => {
  if (req.method === 'POST') {
    rateLimitMiddleware(req, res, next);
  } else {
    next();
  }
});

// Apply multer to /report route
app.use('/report', upload.single('photo'));

// Routes
app.use('/scan', scanRoutes);
app.use('/', registerRoutes);
app.use('/', reportRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});