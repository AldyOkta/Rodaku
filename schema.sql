-- Skema SQLite: Aplikasi Catatan Servis Kendaraan (Rodaku) v1
-- Aturan umum:
--   * Uang disimpan sebagai INTEGER rupiah (tanpa desimal).
--   * Tanggal disimpan sebagai TEXT ISO 'YYYY-MM-DD'.
--   * Jalankan PRAGMA foreign_keys = ON; setiap kali membuka koneksi.
--   * Versi skema dilacak dengan PRAGMA user_version (mulai dari 1) untuk migrasi.

PRAGMA foreign_keys = ON;

-- 1) Kendaraan -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  type             TEXT    NOT NULL CHECK (type IN ('motor', 'mobil')),
  name             TEXT    NOT NULL,
  plate            TEXT,                         -- plat nomor, opsional
  odometer_km      INTEGER NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
  tax_due_date     TEXT,                         -- jatuh tempo pajak tahunan
  stnk_expiry_date TEXT,                         -- masa berlaku STNK (5 tahunan)
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 2) Catatan servis / BBM / lainnya -----------------------------------------
-- service_type juga dipakai sebagai kunci pencocokan ke reminder_rules.
CREATE TABLE IF NOT EXISTS records (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id   INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type TEXT    NOT NULL CHECK (service_type IN
                 ('oli', 'servis_berkala', 'ban', 'rem', 'aki', 'bbm', 'pajak', 'stnk', 'lainnya')),
  date         TEXT    NOT NULL,
  odometer_km  INTEGER NOT NULL CHECK (odometer_km >= 0),
  cost         INTEGER NOT NULL DEFAULT 0 CHECK (cost >= 0),
  liters       REAL,                              -- opsional, hanya untuk BBM (untuk grafik km/L nanti)
  notes        TEXT,
  receipt_uri  TEXT,                              -- path foto struk di penyimpanan app, opsional
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_records_vehicle_date
  ON records (vehicle_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_records_vehicle_odo
  ON records (vehicle_id, odometer_km);

-- 3) Aturan pengingat servis -------------------------------------------------
-- Satu aturan per jenis servis per kendaraan. Jatuh tempo dihitung saat dibaca:
--   due_km   = last_done_km   + interval_km
--   due_date = last_done_date + interval_days
-- Pengingat aktif bila salah satu tercapai lebih dulu (lihat PRD bagian 7).
CREATE TABLE IF NOT EXISTS reminder_rules (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id        INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type      TEXT    NOT NULL CHECK (service_type IN
                      ('oli', 'servis_berkala', 'ban', 'rem', 'aki')),
  interval_km       INTEGER CHECK (interval_km  IS NULL OR interval_km  > 0),
  interval_days     INTEGER CHECK (interval_days IS NULL OR interval_days > 0),
  last_done_km      INTEGER CHECK (last_done_km IS NULL OR last_done_km >= 0),
  last_done_date    TEXT,
  notify_before_km  INTEGER NOT NULL DEFAULT 500 CHECK (notify_before_km  >= 0),
  notify_before_days INTEGER NOT NULL DEFAULT 7  CHECK (notify_before_days >= 0),
  is_active         INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (vehicle_id, service_type),
  CHECK (interval_km IS NOT NULL OR interval_days IS NOT NULL)
);

-- 4) Notifikasi terjadwal ----------------------------------------------------
-- Menyimpan id notifikasi dari expo-notifications supaya bisa dibatalkan dan
-- dijadwalkan ulang saat catatan berubah. source: aturan servis, pajak, atau STNK.
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id      INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  source          TEXT    NOT NULL CHECK (source IN ('rule', 'pajak', 'stnk')),
  rule_id         INTEGER REFERENCES reminder_rules(id) ON DELETE CASCADE,
  notification_id TEXT    NOT NULL,              -- id dari expo-notifications
  fire_at         TEXT    NOT NULL,              -- waktu dijadwalkan (ISO datetime)
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notif_vehicle
  ON scheduled_notifications (vehicle_id);

-- 5) Pengaturan app (key-value) ----------------------------------------------
-- Contoh kunci: 'notify_hour' (jam pengingat), 'active_vehicle_id', 'theme'.
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- Query contoh
-- ---------------------------------------------------------------------------

-- Riwayat satu kendaraan, terbaru dulu:
--   SELECT * FROM records WHERE vehicle_id = ? ORDER BY date DESC, id DESC;

-- Total biaya per bulan untuk satu kendaraan:
--   SELECT substr(date, 1, 7) AS bulan, SUM(cost) AS total
--   FROM records WHERE vehicle_id = ?
--   GROUP BY bulan ORDER BY bulan DESC;

-- Odometer tertinggi yang pernah dicatat (untuk validasi PRD bagian 7):
--   SELECT MAX(odometer_km) FROM records WHERE vehicle_id = ?;

-- Setelah mencatat servis 'oli', perbarui aturannya:
--   UPDATE reminder_rules
--   SET last_done_km = ?, last_done_date = ?
--   WHERE vehicle_id = ? AND service_type = 'oli';
