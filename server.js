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

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes
app.use('/scan', scanRoutes);
app.use('/', registerRoutes);
app.use('/', reportRoutes);

// Apply multer to /report route
app.use('/report', upload.single('photo'));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});