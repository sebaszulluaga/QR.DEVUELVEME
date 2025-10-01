const express = require('express');
const fs = require('fs');
const path = require('path');
const { getDevice, listReports } = require('../db/db');

const router = express.Router();

// GET /scan/:codeId
router.get('/scan/:codeId', (req, res) => {
  const { codeId } = req.params;
  const device = getDevice(codeId);

  if (device) {
    // Device exists, show registered form
    fs.readFile(path.join(__dirname, '..', 'views', 'scan_registered.html'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).send('<html><body><h1>Error</h1><p>Error loading page</p></body></html>');
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
        return res.status(500).send('<html><body><h1>Error</h1><p>Error loading page</p></body></html>');
      }
      const html = data.replace(/{{codeId}}/g, codeId);
      res.send(html);
    });
  }
});

// GET /dashboard/:codeId?token=TOKEN
router.get('/dashboard/:codeId', (req, res) => {
  const { codeId } = req.params;
  const { token } = req.query;

  const device = getDevice(codeId);

  if (!device || device.dashboard_token !== token) {
    return res.status(403).json({ error: 'Invalid token or device not found' });
  }

  const reports = listReports(codeId);
  res.json({ reports });
});

module.exports = router;