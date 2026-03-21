-- ============================================
-- STATISTICS MODULE SCHEMA
-- Módulo de Estatísticas Musicais
-- ============================================

-- Anciães (Presidência do Evento)
CREATE TABLE IF NOT EXISTS anciaes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  congregation_id TEXT REFERENCES congregations(id) ON DELETE SET NULL
);

ALTER TABLE anciaes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Anciaes" ON anciaes FOR SELECT USING (true);
CREATE POLICY "Admin Insert Anciaes" ON anciaes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Update Anciaes" ON anciaes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Delete Anciaes" ON anciaes FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

-- Encarregados Regionais (com localidade)
CREATE TABLE IF NOT EXISTS enc_regionais (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  state TEXT
);

ALTER TABLE enc_regionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Enc Regionais" ON enc_regionais FOR SELECT USING (true);
CREATE POLICY "Admin Insert Enc Regionais" ON enc_regionais FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Update Enc Regionais" ON enc_regionais FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Delete Enc Regionais" ON enc_regionais FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

-- Estatísticas do Evento (tabela principal)
CREATE TABLE IF NOT EXISTS event_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  congregation_id TEXT REFERENCES congregations(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  anciao_id INTEGER REFERENCES anciaes(id) ON DELETE SET NULL,
  palavra TEXT,
  hino_abertura INTEGER,
  hinos_ensaiados INTEGER,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Cordas
  violino INT DEFAULT 0,
  viola INT DEFAULT 0,
  violoncelo INT DEFAULT 0,

  -- Madeiras
  flauta INT DEFAULT 0,
  oboe INT DEFAULT 0,
  oboe_damore INT DEFAULT 0,
  corne_ingles INT DEFAULT 0,
  fagote INT DEFAULT 0,
  clarinete INT DEFAULT 0,
  clarinete_alto INT DEFAULT 0,
  clarinete_baixo INT DEFAULT 0,
  sax_soprano INT DEFAULT 0,
  sax_alto INT DEFAULT 0,
  sax_tenor INT DEFAULT 0,
  sax_baritono INT DEFAULT 0,
  sax_baixo INT DEFAULT 0,

  -- Metais
  trompete INT DEFAULT 0,
  cornet INT DEFAULT 0,
  flugelhorn INT DEFAULT 0,
  trompa INT DEFAULT 0,
  trombone INT DEFAULT 0,
  trombonito INT DEFAULT 0,
  baritono INT DEFAULT 0,
  eufonio INT DEFAULT 0,
  tuba INT DEFAULT 0,

  -- Acordeon
  acordeon INT DEFAULT 0,

  -- Ministério e Administração
  musicos INT DEFAULT 0,
  organistas INT DEFAULT 0,
  anciaes_presentes INT DEFAULT 0,
  diaconos INT DEFAULT 0,
  coop_oficio INT DEFAULT 0,
  coop_jovens INT DEFAULT 0,
  enc_regionais_presentes INT DEFAULT 0,
  enc_locais INT DEFAULT 0,
  examinadoras INT DEFAULT 0,
  secretarios_musica INT DEFAULT 0,
  instrutores INT DEFAULT 0
);

ALTER TABLE event_statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Statistics" ON event_statistics FOR SELECT USING (true);
CREATE POLICY "Admin Insert Statistics" ON event_statistics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Update Statistics" ON event_statistics FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Delete Statistics" ON event_statistics FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

-- Vínculo M:N dos Encarregados Regionais presentes no evento
CREATE TABLE IF NOT EXISTS stat_enc_regionais (
  id SERIAL PRIMARY KEY,
  stat_id UUID REFERENCES event_statistics(id) ON DELETE CASCADE,
  enc_regional_id INTEGER REFERENCES enc_regionais(id) ON DELETE CASCADE
);

ALTER TABLE stat_enc_regionais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Stat Enc" ON stat_enc_regionais FOR SELECT USING (true);
CREATE POLICY "Admin Insert Stat Enc" ON stat_enc_regionais FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Delete Stat Enc" ON stat_enc_regionais FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
