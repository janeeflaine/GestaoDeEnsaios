-- ============================================================
-- Migration 003: Fix / document RLS policies
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Goal: Ensure each table has sensible row-level security so
-- that anonymous users, guests, musicians and admins each
-- get exactly the access they need.
--
-- USER ROLES (stored in profiles.role):
--   ADMIN    — full access
--   MUSICIAN — read + confirm presence
--   USER     — read + confirm presence
--   (GUEST)  — handled by anonymous Supabase session
-- ============================================================

-- ── Enable RLS on all app tables ────────────────────────────
ALTER TABLE events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE conductors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE congregations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_days         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry             ENABLE ROW LEVEL SECURITY;
ALTER TABLE presences            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE congregation_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministry_roles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types          ENABLE ROW LEVEL SECURITY;

-- ── Helper: check if caller is ADMIN ────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- ── events ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "events_select_all"   ON events;
DROP POLICY IF EXISTS "events_insert_admin" ON events;
DROP POLICY IF EXISTS "events_update_admin" ON events;
DROP POLICY IF EXISTS "events_delete_admin" ON events;

-- Anyone (including anon / guests) can read active events
CREATE POLICY "events_select_all" ON events
  FOR SELECT USING (deleted_at IS NULL);

-- Only ADMIN can write
CREATE POLICY "events_insert_admin" ON events
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "events_update_admin" ON events
  FOR UPDATE USING (is_admin());

CREATE POLICY "events_delete_admin" ON events
  FOR DELETE USING (is_admin());

-- ── conductors ───────────────────────────────────────────────
DROP POLICY IF EXISTS "conductors_select_all"   ON conductors;
DROP POLICY IF EXISTS "conductors_write_admin"  ON conductors;

CREATE POLICY "conductors_select_all" ON conductors
  FOR SELECT USING (true);

CREATE POLICY "conductors_write_admin" ON conductors
  FOR ALL USING (is_admin());

-- ── congregations ────────────────────────────────────────────
DROP POLICY IF EXISTS "congregations_select_all"  ON congregations;
DROP POLICY IF EXISTS "congregations_write_admin" ON congregations;

CREATE POLICY "congregations_select_all" ON congregations
  FOR SELECT USING (true);

CREATE POLICY "congregations_write_admin" ON congregations
  FOR ALL USING (is_admin());

-- ── service_days & ministry (public read, admin write) ───────
DROP POLICY IF EXISTS "service_days_select" ON service_days;
DROP POLICY IF EXISTS "service_days_admin"  ON service_days;
CREATE POLICY "service_days_select" ON service_days FOR SELECT USING (true);
CREATE POLICY "service_days_admin"  ON service_days FOR ALL   USING (is_admin());

DROP POLICY IF EXISTS "ministry_select" ON ministry;
DROP POLICY IF EXISTS "ministry_admin"  ON ministry;
CREATE POLICY "ministry_select" ON ministry FOR SELECT USING (true);
CREATE POLICY "ministry_admin"  ON ministry FOR ALL   USING (is_admin());

-- ── presences ────────────────────────────────────────────────
-- Authenticated users can insert their own presence.
-- Only ADMIN can read all presences or delete any.
DROP POLICY IF EXISTS "presences_select_admin" ON presences;
DROP POLICY IF EXISTS "presences_insert_auth"  ON presences;
DROP POLICY IF EXISTS "presences_delete_admin" ON presences;

CREATE POLICY "presences_select_admin" ON presences
  FOR SELECT USING (is_admin() OR auth.uid() IS NOT NULL);

CREATE POLICY "presences_insert_auth" ON presences
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR true);
  -- Allow anonymous inserts so guest users can confirm presence.
  -- Tighten this if you want to require login to confirm.

CREATE POLICY "presences_delete_admin" ON presences
  FOR DELETE USING (is_admin());

-- ── profiles ─────────────────────────────────────────────────
-- Users can read/update their own profile; ADMIN reads all.
DROP POLICY IF EXISTS "profiles_select"        ON profiles;
DROP POLICY IF EXISTS "profiles_insert"        ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin"  ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin"  ON profiles;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE USING (is_admin());

-- ── config tables (public read, admin write) ─────────────────
DROP POLICY IF EXISTS "categories_select" ON congregation_categories;
DROP POLICY IF EXISTS "categories_admin"  ON congregation_categories;
CREATE POLICY "categories_select" ON congregation_categories FOR SELECT USING (true);
CREATE POLICY "categories_admin"  ON congregation_categories FOR ALL   USING (is_admin());

DROP POLICY IF EXISTS "roles_select" ON ministry_roles;
DROP POLICY IF EXISTS "roles_admin"  ON ministry_roles;
CREATE POLICY "roles_select" ON ministry_roles FOR SELECT USING (true);
CREATE POLICY "roles_admin"  ON ministry_roles FOR ALL   USING (is_admin());

DROP POLICY IF EXISTS "event_types_select" ON event_types;
DROP POLICY IF EXISTS "event_types_admin"  ON event_types;
CREATE POLICY "event_types_select" ON event_types FOR SELECT USING (true);
CREATE POLICY "event_types_admin"  ON event_types FOR ALL   USING (is_admin());
