const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const codeIds = process.argv.slice(2);

if (codeIds.length === 0) {
  console.log('Usage: node scripts/generate_qr.js <codeId1> <codeId2> ...');
  process.exit(1);
}

const host = process.env.HOST || 'localhost:3000';
const protocol = process.env.HOST ? 'https' : 'http';
const qrsDir = path.join(__dirname, '..', 'qrs');

// Ensure qrs directory exists
if (!fs.existsSync(qrsDir)) {
  fs.mkdirSync(qrsDir);
}

const promises = codeIds.map(async (codeId) => {
  const url = `${protocol}://${host}/scan/${codeId}`;
  const filename = path.join(qrsDir, `${codeId}.png`);

  try {
    await QRCode.toFile(filename, url);
    console.log(`QR code generated for ${codeId}: ${filename}`);
  } catch (error) {
    console.error(`Error generating QR for ${codeId}:`, error);
  }
});

Promise.all(promises).then(() => {
  console.log('All QR codes generated.');
}).catch((err) => {
  console.error('Error in generating QRs:', err);
});