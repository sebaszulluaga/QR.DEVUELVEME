const express = require('express');
const fs = require('fs');
const path = require('path');
const { createDevice } = require('../db/db');
const { sendRegistrationEmail } = require('../src/email');

const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
  const { codeId, owner_name, owner_email, owner_phone, reward } = req.body;

  // Validate required fields
  if (!codeId || !owner_name || !owner_email) {
    return res.status(400).send('Missing required fields: codeId, owner_name, owner_email');
  }

  // Basic sanitization (trim and escape)
  const sanitized = {
    id: codeId.trim(),
    owner_name: owner_name.trim().replace(/[<>\"']/g, ''),
    owner_email: owner_email.trim(),
    owner_phone: owner_phone ? owner_phone.trim() : null,
    reward: reward ? parseInt(reward) || 0 : 0
  };

  try {
    createDevice(sanitized);
    try {
      await sendRegistrationEmail(sanitized.owner_email, { codeId: sanitized.id, owner_name: sanitized.owner_name });
    } catch (emailError) {
      console.error('Error sending registration email:', emailError);
      // Continue anyway
    }

    // Respond with confirmation page
    fs.readFile(path.join(__dirname, '..', 'views', 'register_confirmation.html'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).send('Error loading confirmation page');
      }
      const html = data
        .replace(/{{codeId}}/g, sanitized.id)
        .replace(/{{owner_name}}/g, sanitized.owner_name)
        .replace(/{{owner_email}}/g, sanitized.owner_email);
      res.send(html);
    });
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).send('Error registering device.');
  }
});

module.exports = router;