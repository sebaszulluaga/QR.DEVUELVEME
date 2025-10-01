# QR-Return MVP

A simple web application for returning lost devices using QR codes on cases. Owners can register their devices, and finders can report them with photos and location.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.

## Setup

1. Copy `.env.example` to `.env` and configure the environment variables:
   - `EMAIL_HOST`: SMTP host for nodemailer
   - `EMAIL_PORT`: SMTP port
   - `EMAIL_USER`: Email username
   - `EMAIL_PASS`: Email password
   - `EMAIL_FROM`: From email address

2. The SQLite database `data.db` will be created automatically on first run.

## Email Configuration for Testing

For email functionality, configure the following environment variables:

- **Mailtrap** (recommended for testing):
  - `SMTP_SERVICE`: Mailtrap
  - `EMAIL_HOST`: smtp.mailtrap.io
  - `EMAIL_PORT`: 2525
  - `EMAIL_USER`: Your Mailtrap username
  - `EMAIL_PASS`: Your Mailtrap password
  - `EMAIL_FROM`: Your from email (optional)

- **Gmail**:
  - `SMTP_SERVICE`: gmail
  - `EMAIL_USER`: yourgmail@gmail.com
  - `EMAIL_PASS`: Your Gmail app password (not regular password)
  - `EMAIL_FROM`: Your from email (optional)

- **Console Fallback** (for development without email setup):
  - Leave `EMAIL_USER` and `EMAIL_PASS` unset.
  - Emails will be logged to the console instead of being sent, preventing request blocking.

## Running the Application

- Development: `npm run dev`
- Production: `npm start`

The server runs on port 3000 by default.

## API Endpoints

- `GET /scan/:codeId`: Returns HTML form for registration (if device not registered) or reporting (if registered).
- `POST /register`: Registers a device with owner details.
- `POST /report`: Reports a found device with finder details, photo, and optional location.

## Testing

### Using curl scripts

Run the test scripts in `scripts/` directory:

- `./scripts/test_register.sh` - Registers a device
- `./scripts/test_report.sh` - Reports a found device (update photo path)

Or manually with curl:

### 1. Register device (simulate owner)
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "codeId=ABC123&owner_name=Sebastian&owner_email=you@example.com&owner_phone=+12025550123&reward=20"
```
Expected: HTML confirmation page, email sent to owner.

### 2. Scan device (simulate finder)
Open in browser: http://localhost:3000/scan/ABC123
Expected: HTML form for finder to report (since registered).

### 3. Report found device (with photo and location)
```bash
curl -X POST http://localhost:3000/report \
  -F "codeId=ABC123" \
  -F "finder_name=Maria" \
  -F "finder_contact=+12025550123" \
  -F "photo=@/path/to/photo.jpg" \
  -F "latitude=4.6" \
  -F "longitude=-74.07"
```
Expected: HTML thank you page, email sent to owner with details, photo uploaded to /uploads, record in SQLite.

### 4. Generate QR codes
```bash
npm run gen:qr ABC123 DEF456
```
Expected: PNG files in /qrs/ directory.

### 6. List reports for device (internal, for testing)
Not exposed via API, but can check database.

## File Structure

- `server.js`: Main Express server
- `db/init.sql`: Database schema
- `db/db.js`: Database helper functions
- `routes/`: Route handlers
- `src/email.js`: Email service
- `scripts/`: Utility scripts (QR generation, tests)
- `views/`: HTML templates
- `public/`: Static files (HTML, JS, CSS)
- `uploads/`: Uploaded photos
- `qrs/`: Generated QR code images