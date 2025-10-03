/**
 * Report Submission Routes
 * Handles found device reports, photo uploads, and notifications.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { saveReport, getDevice, updateEmailSent } = require('../db/db');
const { sendReportEmail } = require('../src/email');

const router = express.Router();

// In-memory rate limiter: 5 requests per 15 minutes per IP
const rateLimitStore = new Map();
function rateLimit(maxRequests, windowMs) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    if (!rateLimitStore.has(ip)) {
      rateLimitStore.set(ip, []);
    }
    const timestamps = rateLimitStore.get(ip);
    // Remove timestamps outside the time window
    while (timestamps.length > 0 && now - timestamps[0] > windowMs) {
      timestamps.shift();
    }
    if (timestamps.length >= maxRequests) {
      return res
        .status(429)
        .send(
          '<html><body><h1>Too Many Requests</h1><p>Please try again later.</p></body></html>',
        );
    }
    timestamps.push(now);
    next();
  };
}

// POST /report - Handle found device report submission
router.post('/report', rateLimit(5, 15 * 60 * 1000), async (req, res) => {
  const { codeId, finder_name, finder_contact, latitude, longitude } = req.body;
  const photo = req.file;

  // Validate required fields
  if (!photo || !finder_contact) {
    return res
      .status(400)
      .send(
        '<html><body><h1>Error</h1><p>Missing required fields: photo and finder_contact</p></body></html>',
      );
  }

  // Enforce length limits
  if (finder_contact && finder_contact.length > 200) {
    return res
      .status(400)
      .send(
        '<html><body><h1>Error</h1><p>finder_contact exceeds 200 characters</p></body></html>',
      );
  }

  // Validate contact format (email)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(finder_contact)) {
    return res
      .status(400)
      .send(
        '<html><body><h1>Error</h1><p>Invalid contact format (must be email)</p></body></html>',
      );
  }

  // Basic sanitization
  const sanitized = {
    device_id: codeId.trim(),
    finder_name: finder_name ? finder_name.trim().replace(/[<>\"']/g, '') : '',
    finder_contact: finder_contact.trim(),
    finder_photo_path: photo.path,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    ip: req.ip,
  };

  try {
    const result = saveReport(sanitized);
    const reportId = result.lastInsertRowid;

    const device = getDevice(codeId);
    if (device) {
      const photoFilename = path.basename(photo.path);
      const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${photoFilename}`;
      const timestamp = new Date().toISOString();
      const location =
        latitude && longitude ? `${latitude}, ${longitude}` : 'not provided';

      try {
        await sendReportEmail(device.owner_email, {
          device,
          finder_name: sanitized.finder_name,
          finder_contact: sanitized.finder_contact,
          photoUrl,
          location,
          ip: sanitized.ip,
          timestamp,
        });
        updateEmailSent(reportId, 1);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Email not sent, but report saved
      }
    }

    // Respond with thank you page
    fs.readFile(
      path.join(__dirname, '..', 'views', 'report_thankyou.html'),
      'utf8',
      (err, data) => {
        if (err) {
          return res
            .status(500)
            .send(
              '<html><body><h1>Error</h1><p>Error loading thank you page</p></body></html>',
            );
        }
        res.send(data);
      },
    );
  } catch (error) {
    console.error('Error submitting report:', error);
    res
      .status(500)
      .send(
        '<html><body><h1>Error</h1><p>Error submitting report.</p></body></html>',
      );
  }
});

module.exports = router;
