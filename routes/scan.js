const express = require('express');
const fs = require('fs');
const path = require('path');
const { getDevice } = require('../db/db');

const router = express.Router();

// GET /scan/:codeId
router.get('/scan/:codeId', (req, res) => {
  const { codeId } = req.params;
  const device = getDevice(codeId);

  if (device) {
    // Device exists, show registered form
    fs.readFile(path.join(__dirname, '..', 'views', 'scan_registered.html'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).send('Error loading page');
      }
      const html = data
        .replace(/{{codeId}}/g, codeId)
        .replace(/{{owner_name}}/g, device.owner_name)
        .replace(/{{reward}}/g, device.reward || 0);
      res.send(html);
    });
  } else {
    // Device not registered, show registration form
    fs.readFile(path.join(__dirname, '..', 'views', 'scan_unregistered.html'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).send('Error loading page');
      }
      const html = data.replace(/{{codeId}}/g, codeId);
      res.send(html);
    });
  }
});

module.exports = router;