function appendCode() {
  const code = document.getElementById('codeId').value;
  window.location.href = '/scan/' + encodeURIComponent(code);
  return false; // Prevent form submission
}