/**
 * Device Registration Routes
 * Handles device registration, validation, and confirmation.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createDevice } = require('../db/db');
const { sendRegistrationEmail } = require('../src/email');

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

// POST /register - Handle device registration
router.post('/register', rateLimit(5, 15 * 60 * 1000), async (req, res) => {
  const { codeId, owner_name, owner_email, owner_phone, reward } = req.body;

  // Validate required fields
  if (!codeId || !owner_name || !owner_email) {
    return res
      .status(400)
      .send(
        '<html><body><h1>Error</h1><p>Missing required fields: codeId, owner_name, owner_email</p></body></html>',
      );
  }

  // Enforce length limits
  if (owner_name && owner_name.length > 100) {
    return res
      .status(400)
      .send(
        '<html><body><h1>Error</h1><p>owner_name exceeds 100 characters</p></body></html>',
      );
  }
  if (reward && reward.length > 500) {
    return res
      .status(400)
      .send(
        '<html><body><h1>Error</h1><p>reward exceeds 500 characters</p></body></html>',
      );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(owner_email)) {
    return res
      .status(400)
      .send(
        '<html><body><h1>Error</h1><p>Invalid email format</p></body></html>',
      );
  }

  // Basic sanitization (trim and escape)
  const dashboard_token = crypto.randomBytes(12).toString('hex');
  const sanitized = {
    id: codeId.trim(),
    owner_name: owner_name.trim().replace(/[<>\"']/g, ''),
    owner_email: owner_email.trim(),
    owner_phone: owner_phone ? owner_phone.trim() : null,
    reward: reward ? parseInt(reward) || 0 : 0,
    dashboard_token: dashboard_token,
  };

  try {
    createDevice(sanitized);
    try {
      await sendRegistrationEmail(sanitized.owner_email, {
        codeId: sanitized.id,
        owner_name: sanitized.owner_name,
      });
    } catch (emailError) {
      console.error('Error sending registration email:', emailError);
      // Continue anyway
    }

    // Respond with confirmation page
    fs.readFile(
      path.join(__dirname, '..', 'views', 'register_confirmation.html'),
      'utf8',
      (err, data) => {
        if (err) {
          return res
            .status(500)
            .send(
              '<html><body><h1>Error</h1><p>Error loading confirmation page</p></body></html>',
            );
        }
        const html = data
          .replace(/{{codeId}}/g, sanitized.id)
          .replace(/{{owner_name}}/g, sanitized.owner_name)
          .replace(/{{owner_email}}/g, sanitized.owner_email)
          .replace(/{{dashboard_token}}/g, sanitized.dashboard_token);
        res.send(html);
      },
    );
  } catch (error) {
    console.error('Error registering device:', error);
    res
      .status(500)
      .send(
        '<html><body><h1>Error</h1><p>Error registering device.</p></body></html>',
      );
  }
});

module.exports = router;
