-- ============================================================
-- Migration 007: Add hinos_ensaiados_lista column to event_statistics
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE event_statistics
  ADD COLUMN IF NOT EXISTS hinos_ensaiados_lista INTEGER[] DEFAULT NULL;
