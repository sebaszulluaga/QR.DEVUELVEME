-- devices
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  reward INTEGER,
  registered_at DATETIME
);

-- reports
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT,
  finder_name TEXT,
  finder_contact TEXT,
  finder_photo_path TEXT,
  latitude REAL,
  longitude REAL,
  ip TEXT,
  email_sent INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(device_id) REFERENCES devices(id)
);