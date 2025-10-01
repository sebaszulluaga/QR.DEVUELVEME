#!/bin/bash

# Test device registration
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "codeId=ABC123&owner_name=Sebastian&owner_email=you@example.com&owner_phone=+12025550123&reward=20"