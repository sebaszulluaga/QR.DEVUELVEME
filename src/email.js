const nodemailer = require('nodemailer');

let transporterConfig;
if (process.env.SMTP_SERVICE) {
  transporterConfig = {
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
} else {
   transporterConfig = {
     host: process.env.EMAIL_HOST,
     port: process.env.EMAIL_PORT,
     secure: process.env.EMAIL_PORT === 465,
     auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };
}

const transporter = nodemailer.createTransport(transporterConfig);

function sendRegistrationEmail(to, data) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: 'Device Registration Confirmation',
      text: `Your device with ID ${data.codeId} has been registered successfully. Owner: ${data.owner_name}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}

function sendReportEmail(to, data) {
  return new Promise((resolve, reject) => {
    const { device, finder_name, finder_contact, photoUrl, location, ip, timestamp } = data;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: 'Your Device Has Been Found!',
      text: `
Your device (ID: ${device.id}) has been reported as found.

Finder Details:
Name: ${finder_name}
Contact: ${finder_contact}
IP: ${ip}
Timestamp: ${timestamp}
Location: ${location}

Photo: ${photoUrl}

Please contact the finder to retrieve your device.
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}

module.exports = { sendRegistrationEmail, sendReportEmail };