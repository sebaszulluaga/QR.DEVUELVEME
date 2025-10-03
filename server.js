/**
 * QR-Return MVP Server
 * Main application entry point for the QR code-based device return system.
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const scanRoutes = require('./routes/scan');
const registerRoutes = require('./routes/register');
const reportRoutes = require('./routes/report');

// Initialize nodemailer transporter (configuration in src/email.js)
require('./src/email');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers (basic helmet alternative)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route: serve the main index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Configure multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const sanitizedOriginalName = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      '_',
    );
    cb(null, Date.now() + '_' + sanitizedOriginalName);
  },
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
  fileFilter,
});

// Global rate limiting: 10 requests per IP per hour
const rateLimitMap = new Map();
const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  const timestamps = rateLimitMap.get(ip);
  // Remove old timestamps outside the window
  while (timestamps.length > 0 && now - timestamps[0] > windowMs) {
    timestamps.shift();
  }
  if (timestamps.length >= 10) {
    return res.status(429).send('Too many requests');
  }
  timestamps.push(now);
  next();
};

// Apply rate limiting to POST /register and POST /report endpoints
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

// Apply multer middleware to /report route for photo uploads
app.use('/report', upload.single('photo'));

// Mount route handlers
app.use('/scan', scanRoutes);
app.use('/', registerRoutes);
app.use('/', reportRoutes);

// Ensure uploads directory exists
fs.mkdirSync('uploads', { recursive: true });

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
