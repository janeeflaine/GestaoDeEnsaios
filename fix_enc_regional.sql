-- Drop the newly created redundant tables and junction table
DROP TABLE IF EXISTS stat_enc_regionais CASCADE;
DROP TABLE IF EXISTS enc_regionais CASCADE;

-- Create a new junction table linking event_statistics to the existing conductors table
CREATE TABLE IF NOT EXISTS stat_conductors (
    stat_id UUID REFERENCES event_statistics(id) ON DELETE CASCADE,
    conductor_id TEXT REFERENCES conductors(id) ON DELETE CASCADE,
    PRIMARY KEY (stat_id, conductor_id)
);

-- Set up RLS for the new junction table
ALTER TABLE stat_conductors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON stat_conductors
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON stat_conductors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON stat_conductors
    FOR DELETE USING (auth.role() = 'authenticated');
