-- Migration 009: Add _tocaram columns for each ministry field
-- These track how many members of each role played an instrument,
-- so they are not double-counted in the grand total.

ALTER TABLE event_statistics
  ADD COLUMN IF NOT EXISTS anciaes_tocaram           INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS diaconos_tocaram           INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coop_oficio_tocaram        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coop_jovens_tocaram        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS enc_regionais_tocaram      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS examinadoras_tocaram       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS secretarios_gem_tocaram    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS secretaria_gem_tocaram     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instrutores_tocaram        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS instrutoras_tocaram        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS candidatas_tocaram         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS candidatos_tocaram         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS secretarios_musica_tocaram INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS secretaria_musica_tocaram  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auxiliar_porta_tocaram     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS colaborador_tocaram        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS colaboradora_tocaram       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS irmas_tocaram              INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS irmaos_tocaram             INTEGER NOT NULL DEFAULT 0;
