// Business logic models
const { getDevice, createDevice, saveReport, listReports } = require('../db/db');

// Additional logic can be added here if needed

module.exports = {
  getDevice,
  createDevice,
  saveReport,
  listReports,
};