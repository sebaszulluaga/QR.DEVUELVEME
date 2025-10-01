#!/bin/bash

# Test report submission (replace /path/to/photo.jpg with actual path)
curl -X POST http://localhost:3000/report \
  -F "codeId=ABC123" \
  -F "finder_name=Maria" \
  -F "finder_contact=+12025550123" \
  -F "photo=@uploads/photo.jpg" \
  -F "latitude=4.6" \
  -F "longitude=-74.07"