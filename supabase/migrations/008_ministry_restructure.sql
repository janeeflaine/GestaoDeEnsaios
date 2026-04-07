-- ============================================================
-- Migration 008: Restructure ministry fields
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE event_statistics
  ADD COLUMN IF NOT EXISTS secretarios_gem     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS secretaria_gem      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instrutoras         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS candidatas          INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS candidatos          INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS secretaria_musica   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auxiliar_porta      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS colaborador         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS colaboradora        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS irmas               INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS irmaos              INTEGER NOT NULL DEFAULT 0;
