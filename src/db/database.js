import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export function getDatabase() {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('rodaku.db');
    initDatabase(dbInstance);
  }
  return dbInstance;
}

export function initDatabase(db) {
  db.execSync('PRAGMA foreign_keys = ON;');
  db.execSync('PRAGMA journal_mode = WAL;');

  // 1) Vehicles table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      type             TEXT    NOT NULL CHECK (type IN ('motor', 'mobil')),
      name             TEXT    NOT NULL,
      plate            TEXT,
      odometer_km      INTEGER NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
      tax_due_date     TEXT,
      stnk_expiry_date TEXT,
      created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 2) Records table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS records (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id   INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      service_type TEXT    NOT NULL CHECK (service_type IN
                     ('oli', 'servis_berkala', 'ban', 'rem', 'aki', 'bbm', 'pajak', 'stnk', 'lainnya')),
      date         TEXT    NOT NULL,
      odometer_km  INTEGER NOT NULL CHECK (odometer_km >= 0),
      cost         INTEGER NOT NULL DEFAULT 0 CHECK (cost >= 0),
      liters       REAL,
      notes        TEXT,
      receipt_uri  TEXT,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_records_vehicle_date ON records (vehicle_id, date DESC);
    CREATE INDEX IF NOT EXISTS idx_records_vehicle_odo ON records (vehicle_id, odometer_km);
  `);

  // 3) Reminder rules
  db.execSync(`
    CREATE TABLE IF NOT EXISTS reminder_rules (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id        INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      service_type      TEXT    NOT NULL CHECK (service_type IN
                          ('oli', 'servis_berkala', 'ban', 'rem', 'aki')),
      interval_km       INTEGER CHECK (interval_km IS NULL OR interval_km > 0),
      interval_days     INTEGER CHECK (interval_days IS NULL OR interval_days > 0),
      last_done_km      INTEGER CHECK (last_done_km IS NULL OR last_done_km >= 0),
      last_done_date    TEXT,
      notify_before_km  INTEGER NOT NULL DEFAULT 500 CHECK (notify_before_km >= 0),
      notify_before_days INTEGER NOT NULL DEFAULT 7 CHECK (notify_before_days >= 0),
      is_active         INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
      created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE (vehicle_id, service_type)
    );
  `);

  // 4) Scheduled notifications
  db.execSync(`
    CREATE TABLE IF NOT EXISTS scheduled_notifications (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id      INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      source          TEXT    NOT NULL CHECK (source IN ('rule', 'pajak', 'stnk')),
      rule_id         INTEGER REFERENCES reminder_rules(id) ON DELETE CASCADE,
      notification_id TEXT    NOT NULL,
      fire_at         TEXT    NOT NULL,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_notif_vehicle ON scheduled_notifications (vehicle_id);
  `);

  // 5) Settings
  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Reset database once to clean slate so user can test from 0
  const resetCheck = db.getFirstSync("SELECT value FROM settings WHERE key = 'has_reset_to_zero';");
  if (!resetCheck) {
    db.execSync(`
      DELETE FROM scheduled_notifications;
      DELETE FROM reminder_rules;
      DELETE FROM records;
      DELETE FROM settings;
      DELETE FROM vehicles;
      INSERT INTO settings (key, value) VALUES ('has_reset_to_zero', '1');
    `);
  }
}

export function clearAllData() {
  const db = getDatabase();
  db.execSync(`
    DELETE FROM scheduled_notifications;
    DELETE FROM reminder_rules;
    DELETE FROM records;
    DELETE FROM settings;
    DELETE FROM vehicles;
    INSERT INTO settings (key, value) VALUES ('has_reset_to_zero', '1');
  `);
}

function seedInitialData(db) {
  const countRow = db.getFirstSync('SELECT COUNT(*) as count FROM vehicles;');
  if (countRow && countRow.count > 0) {
    return; // Already initialized
  }

  // Insert default demo vehicle
  const insertVeh = db.runSync(
    `INSERT INTO vehicles (type, name, plate, odometer_km, tax_due_date, stnk_expiry_date)
     VALUES (?, ?, ?, ?, ?, ?);`,
    ['motor', 'Honda Vario 160', 'B 4521 SXZ', 16420, '2025-08-20', '2028-08-20']
  );
  const vehicleId = insertVeh.lastInsertRowId;

  // Insert active vehicle setting
  db.runSync(
    `INSERT OR REPLACE INTO settings (key, value) VALUES ('active_vehicle_id', ?);`,
    [vehicleId.toString()]
  );

  // Insert reminder rules
  db.runSync(
    `INSERT INTO reminder_rules (vehicle_id, service_type, interval_km, interval_days, last_done_km, last_done_date, notify_before_km, notify_before_days)
     VALUES (?, 'oli', 2000, 60, 16000, '2025-04-28', 300, 7);`,
    [vehicleId]
  );
  db.runSync(
    `INSERT INTO reminder_rules (vehicle_id, service_type, interval_km, interval_days, last_done_km, last_done_date, notify_before_km, notify_before_days)
     VALUES (?, 'servis_berkala', 4000, 120, 15500, '2025-04-05', 500, 14);`,
    [vehicleId]
  );
  db.runSync(
    `INSERT INTO reminder_rules (vehicle_id, service_type, interval_km, interval_days, last_done_km, last_done_date, notify_before_km, notify_before_days)
     VALUES (?, 'rem', 8000, 240, 15500, '2025-04-05', 500, 14);`,
    [vehicleId]
  );

  // Insert sample records (matching Veloce Log design screens)
  db.runSync(
    `INSERT INTO records (vehicle_id, service_type, date, odometer_km, cost, liters, notes)
     VALUES (?, 'bbm', '2025-05-10', 16420, 65000, 5.2, 'Pertamax 92 - SPBU Shell Daan Mogot');`,
    [vehicleId]
  );
  db.runSync(
    `INSERT INTO records (vehicle_id, service_type, date, odometer_km, cost, liters, notes)
     VALUES (?, 'oli', '2025-04-28', 16000, 120000, NULL, 'Ganti oli mesin SPX2 & oli gardan');`,
    [vehicleId]
  );
  db.runSync(
    `INSERT INTO records (vehicle_id, service_type, date, odometer_km, cost, liters, notes)
     VALUES (?, 'servis_berkala', '2025-04-05', 15500, 260000, NULL, 'Servis CVT, bersihkan injector & filter udara');`,
    [vehicleId]
  );
  db.runSync(
    `INSERT INTO records (vehicle_id, service_type, date, odometer_km, cost, liters, notes)
     VALUES (?, 'bbm', '2025-04-01', 15450, 60000, 4.8, 'Pertamax 92 - SPBU Pertamina');`,
    [vehicleId]
  );
  db.runSync(
    `INSERT INTO records (vehicle_id, service_type, date, odometer_km, cost, liters, notes)
     VALUES (?, 'pajak', '2025-03-01', 15000, 160000, NULL, 'Alokasi tabungan pajak tahunan');`,
    [vehicleId]
  );
}

// -------------------------------------------------------------
// Database Query Helpers
// -------------------------------------------------------------

export function getActiveVehicle() {
  const db = getDatabase();
  const setting = db.getFirstSync("SELECT value FROM settings WHERE key = 'active_vehicle_id';");
  let vehicle = null;
  if (setting && setting.value) {
    vehicle = db.getFirstSync('SELECT * FROM vehicles WHERE id = ?;', [parseInt(setting.value, 10)]);
  }
  if (!vehicle) {
    vehicle = db.getFirstSync('SELECT * FROM vehicles ORDER BY id ASC LIMIT 1;');
  }
  return vehicle;
}

export function getAllVehicles() {
  const db = getDatabase();
  return db.getAllSync('SELECT * FROM vehicles ORDER BY id ASC;');
}

export function setActiveVehicle(vehicleId) {
  const db = getDatabase();
  db.runSync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('active_vehicle_id', ?);",
    [vehicleId.toString()]
  );
}

export function getVehicleRecords(vehicleId) {
  const db = getDatabase();
  return db.getAllSync(
    'SELECT * FROM records WHERE vehicle_id = ? ORDER BY date DESC, id DESC;',
    [vehicleId]
  );
}

export function getVehicleReminders(vehicleId) {
  const db = getDatabase();
  return db.getAllSync(
    'SELECT * FROM reminder_rules WHERE vehicle_id = ? AND is_active = 1 ORDER BY id ASC;',
    [vehicleId]
  );
}

export function insertRecord({ vehicleId, serviceType, date, odometerKm, cost, liters, notes }) {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO records (vehicle_id, service_type, date, odometer_km, cost, liters, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [vehicleId, serviceType, date, odometerKm, cost, liters || null, notes || null]
  );

  // Update vehicle current odometer if higher
  db.runSync(
    `UPDATE vehicles 
     SET odometer_km = MAX(odometer_km, ?), updated_at = datetime('now')
     WHERE id = ?;`,
    [odometerKm, vehicleId]
  );

  // If this record matches a reminder rule, update last_done
  db.runSync(
    `UPDATE reminder_rules
     SET last_done_km = ?, last_done_date = ?
     WHERE vehicle_id = ? AND service_type = ?;`,
    [odometerKm, date, vehicleId, serviceType]
  );

  return result.lastInsertRowId;
}

export function insertVehicle({ type, name, plate, odometerKm, taxDueDate, stnkExpiryDate }) {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO vehicles (type, name, plate, odometer_km, tax_due_date, stnk_expiry_date)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [type, name, plate || null, odometerKm || 0, taxDueDate || null, stnkExpiryDate || null]
  );
  const vehicleId = result.lastInsertRowId;

  // Setup default service reminder rules for the new vehicle
  const isMotor = type === 'motor';
  const today = new Date().toISOString().split('T')[0];
  const defaultRules = [
    { type: 'oli', km: isMotor ? 2000 : 5000, days: 60, beforeKm: 300, beforeDays: 7 },
    { type: 'servis_berkala', km: isMotor ? 4000 : 10000, days: 120, beforeKm: 500, beforeDays: 14 },
    { type: 'rem', km: isMotor ? 8000 : 20000, days: 240, beforeKm: 500, beforeDays: 14 },
  ];

  for (const r of defaultRules) {
    db.runSync(
      `INSERT OR IGNORE INTO reminder_rules 
       (vehicle_id, service_type, interval_km, interval_days, last_done_km, last_done_date, notify_before_km, notify_before_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [vehicleId, r.type, r.km, r.days, odometerKm || 0, today, r.beforeKm, r.beforeDays]
    );
  }

  return vehicleId;
}

export function updateVehicle({ id, type, name, plate, odometerKm, taxDueDate, stnkExpiryDate }) {
  const db = getDatabase();
  db.runSync(
    `UPDATE vehicles 
     SET type = ?, name = ?, plate = ?, odometer_km = MAX(odometer_km, ?),
         tax_due_date = ?, stnk_expiry_date = ?, updated_at = datetime('now')
     WHERE id = ?;`,
    [type, name, plate || null, odometerKm || 0, taxDueDate || null, stnkExpiryDate || null, id]
  );
}

export function deleteVehicle(vehicleId) {
  const db = getDatabase();
  db.runSync('DELETE FROM vehicles WHERE id = ?;', [vehicleId]);

  // Adjust active vehicle setting if needed
  const activeSetting = db.getFirstSync("SELECT value FROM settings WHERE key = 'active_vehicle_id';");
  if (activeSetting && parseInt(activeSetting.value, 10) === vehicleId) {
    const nextVeh = db.getFirstSync('SELECT id FROM vehicles ORDER BY id ASC LIMIT 1;');
    if (nextVeh) {
      db.runSync("UPDATE settings SET value = ? WHERE key = 'active_vehicle_id';", [nextVeh.id.toString()]);
    } else {
      db.runSync("DELETE FROM settings WHERE key = 'active_vehicle_id';");
    }
  }
}

export function updateRecord({ id, vehicleId, serviceType, date, odometerKm, cost, liters, notes }) {
  const db = getDatabase();
  db.runSync(
    `UPDATE records 
     SET service_type = ?, date = ?, odometer_km = ?, cost = ?, liters = ?, notes = ?
     WHERE id = ?;`,
    [serviceType, date, odometerKm, cost, liters || null, notes || null, id]
  );

  // Update vehicle current odometer if higher
  db.runSync(
    `UPDATE vehicles 
     SET odometer_km = MAX(odometer_km, ?), updated_at = datetime('now')
     WHERE id = ?;`,
    [odometerKm, vehicleId]
  );

  // If this record matches a reminder rule, update last_done
  db.runSync(
    `UPDATE reminder_rules
     SET last_done_km = ?, last_done_date = ?
     WHERE vehicle_id = ? AND service_type = ?;`,
    [odometerKm, date, vehicleId, serviceType]
  );
}

export function deleteRecord(recordId, vehicleId) {
  const db = getDatabase();
  db.runSync('DELETE FROM records WHERE id = ?;', [recordId]);

  // Recalculate max odometer for vehicle from remaining records
  const maxOdoRow = db.getFirstSync(
    'SELECT MAX(odometer_km) as max_odo FROM records WHERE vehicle_id = ?;',
    [vehicleId]
  );
  if (maxOdoRow && maxOdoRow.max_odo !== null) {
    db.runSync(
      'UPDATE vehicles SET odometer_km = ?, updated_at = datetime("now") WHERE id = ?;',
      [maxOdoRow.max_odo, vehicleId]
    );
  }

  // Recalculate last_done for reminder rules
  const rules = db.getAllSync(
    'SELECT id, service_type FROM reminder_rules WHERE vehicle_id = ?;',
    [vehicleId]
  );
  for (const r of rules) {
    const lastRec = db.getFirstSync(
      'SELECT odometer_km, date FROM records WHERE vehicle_id = ? AND service_type = ? ORDER BY date DESC, id DESC LIMIT 1;',
      [vehicleId, r.service_type]
    );
    if (lastRec) {
      db.runSync(
        'UPDATE reminder_rules SET last_done_km = ?, last_done_date = ? WHERE id = ?;',
        [lastRec.odometer_km, lastRec.date, r.id]
      );
    }
  }
}

export function updateReminderRule({ id, intervalKm, intervalDays, notifyBeforeKm, notifyBeforeDays, isActive }) {
  const db = getDatabase();
  db.runSync(
    `UPDATE reminder_rules 
     SET interval_km = ?, interval_days = ?, notify_before_km = ?, notify_before_days = ?, is_active = ?
     WHERE id = ?;`,
    [intervalKm, intervalDays, notifyBeforeKm || 500, notifyBeforeDays || 7, isActive ? 1 : 0, id]
  );
}

export function getRecordById(id) {
  const db = getDatabase();
  return db.getFirstSync('SELECT * FROM records WHERE id = ?;', [id]);
}

export function getVehicleById(id) {
  const db = getDatabase();
  return db.getFirstSync('SELECT * FROM vehicles WHERE id = ?;', [id]);
}
