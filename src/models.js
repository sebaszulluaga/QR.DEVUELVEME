const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data.db');
const db = new Database(dbPath);

// Run init.sql to ensure tables exist if not already
const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='devices'").get();
if (!tableExists) {
  const initPath = path.join(__dirname, '..', 'db', 'init.sql');
  const initSQL = fs.readFileSync(initPath, 'utf8');
  db.exec(initSQL);
}

// Prepare statements
const getDeviceStmt = db.prepare('SELECT * FROM devices WHERE id = ?');
const createDeviceStmt = db.prepare('INSERT INTO devices (id, owner_name, owner_email, owner_phone, reward, registered_at) VALUES (?, ?, ?, ?, ?, datetime(\'now\'))');
const saveReportStmt = db.prepare('INSERT INTO reports (device_id, finder_name, finder_contact, finder_photo_path, latitude, longitude, ip, email_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const updateEmailSentStmt = db.prepare('UPDATE reports SET email_sent = ? WHERE id = ?');
const listReportsStmt = db.prepare('SELECT * FROM reports WHERE device_id = ? ORDER BY created_at DESC');

// Functions
function getDevice(id) {
  return getDeviceStmt.get(id);
}

function createDevice({ id, owner_name, owner_email, owner_phone, reward }) {
  return createDeviceStmt.run(id, owner_name, owner_email, owner_phone, reward);
}

function saveReport({ device_id, finder_name, finder_contact, finder_photo_path, latitude, longitude, ip, email_sent = 0 }) {
  return saveReportStmt.run(device_id, finder_name, finder_contact, finder_photo_path, latitude, longitude, ip, email_sent);
}

function updateEmailSent(reportId, sent) {
  return updateEmailSentStmt.run(sent, reportId);
}

function listReports(deviceId) {
  return listReportsStmt.all(deviceId);
}

module.exports = {
  getDevice,
  createDevice,
  saveReport,
  updateEmailSent,
  listReports,
};