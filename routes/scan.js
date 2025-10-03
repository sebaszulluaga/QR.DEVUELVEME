/**
 * QR Scan Routes
 * Handles QR code scanning, device lookup, and dashboard access.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { getDevice, listReports } = require('../db/db');

const router = express.Router();

// GET /scan/new - Demo route for pre-filled device registration
router.get('/new', (req, res) => {
  fs.readFile(
    path.join(__dirname, '..', 'views', 'scan_unregistered.html'),
    'utf8',
    (err, data) => {
      if (err) return res.status(500).send('<h1>Error loading page</h1>');
      const html = data.replace(/{{codeId}}/g, 'TEST123'); // QR de prueba
      res.send(html);
    },
  );
});

// GET /scan/:codeId - Main scan route to check device status
router.get('/:codeId', (req, res) => {
  const { codeId } = req.params;
  const device = getDevice(codeId);

  if (device) {
    // Device registered, show scan_registered page
    fs.readFile(
      path.join(__dirname, '..', 'views', 'scan_registered.html'),
      'utf8',
      (err, data) => {
        if (err) return res.status(500).send('<h1>Error loading page</h1>');
        const html = data
          .replace(/{{codeId}}/g, codeId)
          .replace(/{{owner_name}}/g, device.owner_name)
          .replace(/{{reward}}/g, device.reward || 0);
        res.send(html);
      },
    );
  } else {
    // Device not registered, show scan_unregistered form
    fs.readFile(
      path.join(__dirname, '..', 'views', 'scan_unregistered.html'),
      'utf8',
      (err, data) => {
        if (err) return res.status(500).send('<h1>Error loading page</h1>');
        const html = data.replace(/{{codeId}}/g, codeId);
        res.send(html);
      },
    );
  }
});

// GET /scan/dashboard/:codeId - Dashboard for viewing device reports
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
