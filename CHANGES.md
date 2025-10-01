# Audit Findings for QR-Return Repository

## Bugs
- `src/routes.js`: Contains outdated route handlers with inline HTML that are not used; current routes are implemented in separate files (`routes/register.js`, `routes/report.js`, `routes/scan.js`).
- `db/db.js`: Database initialization occurs on module require, potentially leading to race conditions in multi-process environments.
- `views/scan_registered.html`: Mixed language usage (Spanish text in an English HTML document).
- `views/scan_unregistered.html`: Mixed language usage (Spanish text in an English HTML document).

## Security Vulnerabilities
- Input sanitization inadequate across files: Email fields lack regex validation (e.g., `routes/register.js`, `routes/report.js`); phone numbers not validated; no server-side email format checks.
- Path traversal vulnerability in file uploads: `server.js` and `routes/report.js` use Multer with `file.originalname` in filename generation, allowing potential directory traversal attacks.
- No rate limiting implemented on API endpoints (`server.js`, route files).
- IP addresses logged in reports (`routes/report.js`, `db/init.sql`) without clear privacy considerations.
- No HTTPS enforcement or security headers (e.g., missing Helmet middleware in `server.js`).
- No CSRF protection on forms.
- File uploads lack server-side type validation; relies only on client-side `accept` attribute (`routes/report.js`, HTML forms).

## Missing Features
- `public/register_confirmation.html`: File does not exist, though `routes/register.js` serves `views/register_confirmation.html`.
- `public/report_thankyou.html`: File does not exist, though `routes/report.js` serves `views/report_thankyou.html`.
- No admin interface to view or manage reports.
- No user authentication or authorization.
- No email confirmation/verification for device registrations.
- No photo compression, resizing, or additional server-side validation.
- No validation for latitude/longitude value ranges.
- No custom error pages (e.g., 404, 500).
- No application logging.
- No automated tests.
- `.env.example`: Missing environment variables (e.g., `EMAIL_HOST`, `EMAIL_PORT` for non-Gmail SMTP configurations).

## UX/Style Issues
- Non-responsive design: `public/css/styles.css` sets max-width but lacks media queries for mobile devices.
- Poor error messages: Generic error responses (e.g., "Error registering device" in `routes/register.js`, `routes/report.js`) without user-friendly details.
- Inconsistent language across views (`views/scan_registered.html`, `views/scan_unregistered.html`).
- No loading indicators or feedback during form submissions.
- Inconsistent form styling; some views use inline styles (`views/scan_registered.html`, `views/scan_unregistered.html`), others external CSS.
- Lack of accessibility features (e.g., no alt text for images, poor keyboard navigation).
- Basic geolocation permission handling in `views/scan_registered.html`; no progressive enhancement if geolocation fails.