-- ============================================================
-- Migration 001: Fix cascade deletes
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Problem: Deleting a congregation, event, or conductor leaves
-- orphaned rows in related tables (presences, service_days,
-- ministry), causing data integrity issues.
-- ============================================================

-- ── presences: cascade when event is deleted ────────────────
ALTER TABLE presences
  DROP CONSTRAINT IF EXISTS presences_event_id_fkey;

ALTER TABLE presences
  ADD CONSTRAINT presences_event_id_fkey
  FOREIGN KEY (event_id) REFERENCES events(id)
  ON DELETE CASCADE;

-- ── service_days: cascade when congregation is deleted ───────
ALTER TABLE service_days
  DROP CONSTRAINT IF EXISTS service_days_congregation_id_fkey;

ALTER TABLE service_days
  ADD CONSTRAINT service_days_congregation_id_fkey
  FOREIGN KEY (congregation_id) REFERENCES congregations(id)
  ON DELETE CASCADE;

-- ── ministry: cascade when congregation is deleted ───────────
ALTER TABLE ministry
  DROP CONSTRAINT IF EXISTS ministry_congregation_id_fkey;

ALTER TABLE ministry
  ADD CONSTRAINT ministry_congregation_id_fkey
  FOREIGN KEY (congregation_id) REFERENCES congregations(id)
  ON DELETE CASCADE;

-- ── profiles: set NULL when congregation is deleted ──────────
-- (don't delete the user, just clear their congregation link)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_congregation_id_fkey;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_congregation_id_fkey
  FOREIGN KEY (congregation_id) REFERENCES congregations(id)
  ON DELETE SET NULL;

-- ── event_statistics: cascade when event is deleted ─────────
-- Uncomment if the event_statistics table has an event_id FK:
-- ALTER TABLE event_statistics
--   DROP CONSTRAINT IF EXISTS event_statistics_event_id_fkey;
-- ALTER TABLE event_statistics
--   ADD CONSTRAINT event_statistics_event_id_fkey
--   FOREIGN KEY (event_id) REFERENCES events(id)
--   ON DELETE CASCADE;
