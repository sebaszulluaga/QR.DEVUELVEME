# QR-Return Demo Instructions

This is a 1-minute demo script to showcase the QR-Return application functionality.

## Demo Steps

1. **Open register page**: Navigate to http://localhost:3000 in your browser to access the device registration page.

2. **Register device**: Fill out the registration form with device details (e.g., codeId: ABC123, owner name, email, phone, reward) and submit to register a device.

3. **Generate QR**: Use the command `npm run gen:qr ABC123` to generate a QR code for the registered device.

4. **Scan QR**: Open http://localhost:3000/scan/ABC123 in your browser to simulate scanning the QR code and access the report form.

5. **Submit report**: Fill out the finder report form with details (name, contact, photo, location) and submit to report the found device.

6. **Check dashboard**: (Note: No admin dashboard implemented; in a real scenario, check the database or email notifications for the submitted report.)