-- Update for Dynamic Congregations and Ministry

-- Congregation Categories
CREATE TABLE IF NOT EXISTS congregation_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

INSERT INTO congregation_categories (name) VALUES ('CENTRAL'), ('LOCAL'), ('DISTRITO') ON CONFLICT DO NOTHING;

-- Ministry Roles
CREATE TABLE IF NOT EXISTS ministry_roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

INSERT INTO ministry_roles (name) VALUES ('Ancião'), ('Diácono'), ('Cooperador'), ('Encarregado Regional'), ('Encarregado Local'), ('Examinadora') ON CONFLICT DO NOTHING;

-- Modify Ministry Table
ALTER TABLE ministry ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- RLS for new tables
ALTER TABLE congregation_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Categories" ON congregation_categories FOR SELECT USING (true);
CREATE POLICY "Admin Insert Categories" ON congregation_categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Update Categories" ON congregation_categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Delete Categories" ON congregation_categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);

ALTER TABLE ministry_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Roles" ON ministry_roles FOR SELECT USING (true);
CREATE POLICY "Admin Insert Roles" ON ministry_roles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Update Roles" ON ministry_roles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
CREATE POLICY "Admin Delete Roles" ON ministry_roles FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN')
);
