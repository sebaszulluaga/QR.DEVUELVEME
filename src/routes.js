const express = require('express');
const multer = require('multer');
const path = require('path');
const { getDevice, createDevice, saveReport } = require('../db/db');
const { sendRegistrationEmail, sendReportEmail } = require('./email');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// GET /scan/:codeId
router.get('/scan/:codeId', (req, res) => {
  const { codeId } = req.params;
  const device = getDevice(codeId);

  if (device) {
    // Show finder form
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Report Found Device</title></head>
      <body>
        <h1>Report Found Device</h1>
        <p>Device ID: ${codeId}</p>
        <p>Owner: ${device.owner_name}</p>
        <form action="/report" method="post" enctype="multipart/form-data">
          <input type="hidden" name="codeId" value="${codeId}">
          <label>Finder Name: <input type="text" name="finder_name" required></label><br>
          <label>Contact: <input type="text" name="finder_contact" required></label><br>
          <label>Photo: <input type="file" name="photo" accept="image/*" required></label><br>
          <label>Latitude: <input type="number" step="any" name="latitude"></label><br>
          <label>Longitude: <input type="number" step="any" name="longitude"></label><br>
          <button type="submit">Report</button>
        </form>
      </body>
      </html>
    `);
  } else {
    // Show registration form
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Register Device</title></head>
      <body>
        <h1>Register Your Device</h1>
        <p>Device ID: ${codeId}</p>
        <form action="/register" method="post">
          <input type="hidden" name="codeId" value="${codeId}">
          <label>Owner Name: <input type="text" name="owner_name" required></label><br>
          <label>Email: <input type="email" name="owner_email" required></label><br>
          <label>Phone: <input type="tel" name="owner_phone"></label><br>
          <label>Reward ($): <input type="number" name="reward"></label><br>
          <button type="submit">Register</button>
        </form>
      </body>
      </html>
    `);
  }
});

// POST /register
router.post('/register', (req, res) => {
  const { codeId, owner_name, owner_email, owner_phone, reward } = req.body;
  try {
    createDevice({ id: codeId, owner_name, owner_email, owner_phone, reward: parseInt(reward) || 0 });
    sendRegistrationEmail(owner_email, { codeId, owner_name });
    res.send('Device registered successfully. Confirmation email sent.');
  } catch (error) {
    res.status(500).send('Error registering device.');
  }
});

// POST /report
router.post('/report', upload.single('photo'), (req, res) => {
  const { codeId, finder_name, finder_contact, latitude, longitude } = req.body;
  const photoPath = req.file ? req.file.path : null;
  const ip = req.ip;

  try {
    saveReport({
      device_id: codeId,
      finder_name,
      finder_contact,
      finder_photo_path: photoPath,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      ip
    });

    const device = getDevice(codeId);
    if (device) {
      sendReportEmail(device.owner_email, {
        device,
        finder_name,
        finder_contact,
        photoPath,
        latitude,
        longitude
      });
    }

    res.send('Report submitted successfully. Owner notified.');
  } catch (error) {
    res.status(500).send('Error submitting report.');
  }
});

module.exports = router;