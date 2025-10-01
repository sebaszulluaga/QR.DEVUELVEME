function handleScanSubmit() {
  const code = document.getElementById('codeId').value.trim();
  const statusDiv = document.getElementById('scan-status');
  if (!code) {
    statusDiv.textContent = 'Please enter a device code.';
    statusDiv.className = 'status-message status-error';
    statusDiv.style.display = 'block';
    return false;
  }
  statusDiv.textContent = 'Scanning...';
  statusDiv.className = 'status-message status-loading';
  statusDiv.style.display = 'block';
  window.location.href = '/scan/' + encodeURIComponent(code);
  return false;
}

function validateRegisterForm() {
  const ownerName = document.querySelector('input[name="owner_name"]').value.trim();
  const ownerEmail = document.querySelector('input[name="owner_email"]').value.trim();
  const statusDiv = document.getElementById('register-status');
  if (!ownerName) {
    statusDiv.textContent = 'Owner name is required.';
    statusDiv.className = 'status-message status-error';
    statusDiv.style.display = 'block';
    return false;
  }
  if (!ownerEmail || !/\S+@\S+\.\S+/.test(ownerEmail)) {
    statusDiv.textContent = 'A valid email is required.';
    statusDiv.className = 'status-message status-error';
    statusDiv.style.display = 'block';
    return false;
  }
  statusDiv.textContent = 'Registering...';
  statusDiv.className = 'status-message status-loading';
  statusDiv.style.display = 'block';
  return true;
}

function validateReportForm() {
  const finderName = document.querySelector('input[name="finder_name"]').value.trim();
  const finderContact = document.querySelector('input[name="finder_contact"]').value.trim();
  const photo = document.querySelector('input[name="photo"]').files[0];
  const statusDiv = document.getElementById('report-status');
  if (!finderName) {
    statusDiv.textContent = 'Finder name is required.';
    statusDiv.className = 'status-message status-error';
    statusDiv.style.display = 'block';
    return false;
  }
  if (!finderContact) {
    statusDiv.textContent = 'Contact information is required.';
    statusDiv.className = 'status-message status-error';
    statusDiv.style.display = 'block';
    return false;
  }
  if (!photo) {
    statusDiv.textContent = 'Please upload a photo.';
    statusDiv.className = 'status-message status-error';
    statusDiv.style.display = 'block';
    return false;
  }
  statusDiv.textContent = 'Reporting...';
  statusDiv.className = 'status-message status-loading';
  statusDiv.style.display = 'block';
  return true;
}