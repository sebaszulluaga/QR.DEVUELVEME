#!/bin/bash

# Smoke test script for the application
# Assumes server is running on localhost:3000

BASE_URL="http://localhost:3000"
TEST_CODE_ID="test123"

echo "Running smoke tests..."

echo "1. Testing device registration..."
curl -X POST "$BASE_URL/register" \
  -d "codeId=$TEST_CODE_ID" \
  -d "owner_name=Test Owner" \
  -d "owner_email=test@example.com" \
  -d "reward=100" \
  --silent --output /dev/null --write-out "Status: %{http_code}\n"

echo "2. Testing QR scan check..."
curl "$BASE_URL/scan/$TEST_CODE_ID" \
  --silent --output /dev/null --write-out "Status: %{http_code}\n"

echo "3. Testing report submission..."
curl -X POST "$BASE_URL/report" \
  -F "codeId=$TEST_CODE_ID" \
  -F "finder_name=Test Finder" \
  -F "finder_contact=test@contact.com" \
  -F "photo=@scripts/fixtures/test.jpg" \
  --silent --output /dev/null --write-out "Status: %{http_code}\n"

echo "Smoke tests completed."