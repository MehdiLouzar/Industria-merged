-- db/init/initDB.sql
-- Simplified demo data for Industria using Prisma schema

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clean tables in order
DO $$
DECLARE
  tables text[] := ARRAY[
    'zone_activities', 'parcel_amenities', 'appointments', 'parcels',
    'zones', 'zone_types', 'activities', 'amenities',
    'regions', 'countries', 'activity_logs', 'users'
  ];
  tbl text;
BEGIN
  RAISE NOTICE 'Starting data population...';
  FOREACH tbl IN ARRAY tables LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', tbl);
      RAISE NOTICE 'Cleaned table: %', tbl;
    END IF;
  END LOOP;
END $$;

-- Demo users
INSERT INTO users (id, email, password, name, company, phone, role) VALUES
  ('user-admin',   'admin@zonespro.ma',   '$2b$10$VQl88VBIZ6aR46F7Ju2sgO0LH8oTFbm0Mb8ayY1KeuU261EfwEnZS', 'Administrateur ZonesPro', 'ZonesPro Management', '+212 5 37 57 20 00', 'ADMIN'),
  ('user-manager', 'manager@zonespro.ma', '$2b$10$VQl88VBIZ6aR46F7Ju2sgO0LH8oTFbm0Mb8ayY1KeuU261EfwEnZS', 'Manager Commercial',       'ZonesPro Management', '+212 5 37 57 20 01', 'MANAGER'),
  ('user-demo',    'demo@entreprise.ma',  '$2b$10$VQl88VBIZ6aR46F7Ju2sgO0LH8oTFbm0Mb8ayY1KeuU261EfwEnZS', 'Utilisateur Démo',         'Entreprise Démo SA',   '+212 6 12 34 56 78', 'USER')
ON CONFLICT (id) DO NOTHING;

-- Country and regions
INSERT INTO countries (id, name, code, "createdAt", "updatedAt") VALUES
  ('country-ma', 'Maroc', 'MA', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO regions (id, name, code, "countryId", "createdAt", "updatedAt") VALUES
  ('region-cas', 'Casablanca-Settat', 'CAS', 'country-ma', NOW(), NOW()),
  ('region-rab', 'Rabat-Salé-Kénitra', 'RAB', 'country-ma', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Zone types
INSERT INTO zone_types (id, name) VALUES
  ('zt-private', 'privée'),
  ('zt-public',  'public')
ON CONFLICT (id) DO NOTHING;

-- Activities
INSERT INTO activities (id, name, description, icon, "createdAt", "updatedAt") VALUES
  ('act-auto', 'Automobile', 'Industrie automobile', '🚗', NOW(), NOW()),
  ('act-log',  'Logistique', 'Stockage et distribution', '📦', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Amenities
INSERT INTO amenities (id, name, description, icon, category, "createdAt", "updatedAt") VALUES
  ('amn-electricity', 'Électricité', 'Alimentation électrique', '⚡', 'Infrastructure', NOW(), NOW()),
  ('amn-water',       'Eau potable', 'Réseau d''eau',             '💧', 'Infrastructure', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Demo zone
INSERT INTO zones (
  id, name, description, address, totalArea, price, status,
  latitude, longitude, lambertX, lambertY,
  "zoneTypeId", "regionId", "createdAt", "updatedAt"
) VALUES (
  'zone-demo',
  'Zone Industrielle Demo',
  'Zone de démonstration',
  'Route Demo',
  150000,
  2500,
  'AVAILABLE',
  33.6169,
  -7.6149,
  423456.78,
  372890.12,
  'zt-private',
  'region-cas',
  NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Parcels for the demo zone
INSERT INTO parcels (
  id, reference, area, price, status,
  latitude, longitude, lambertX, lambertY,
  "zoneId", "createdAt", "updatedAt"
) VALUES
  ('parcel-1', 'CAS-001', 10000, 2500, 'AVAILABLE', 33.617, -7.615, 423457, 372891, 'zone-demo', NOW(), NOW()),
  ('parcel-2', 'CAS-002', 12000, 2500, 'RESERVED', 33.618, -7.616, 423458, 372892, 'zone-demo', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Link activities and amenities to the zone
INSERT INTO zone_activities (id, "zoneId", "activityId") VALUES
  ('za-1', 'zone-demo', 'act-auto'),
  ('za-2', 'zone-demo', 'act-log')
ON CONFLICT (id) DO NOTHING;

INSERT INTO zone_amenities (id, "zoneId", "amenityId") VALUES
  ('zam-1', 'zone-demo', 'amn-electricity'),
  ('zam-2', 'zone-demo', 'amn-water')
ON CONFLICT (id) DO NOTHING;

-- Simple appointment example
INSERT INTO appointments (
  id, "contactName", "contactEmail", "contactPhone", "companyName", message,
  "requestedDate", status, "parcelId", "userId", "createdAt", "updatedAt"
) VALUES (
  'appt-1',
  'Ahmed Benali', 'a.benali@entreprise.ma', '+212 6 12 34 56 78',
  'Industries Benali', 'Intéressé par une parcelle',
  '2024-02-15T10:00:00Z', 'PENDING', 'parcel-1', 'user-demo', NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE '✅ Database initialization completed successfully!';
END $$;
