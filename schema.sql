-- Tables for Gestão de Ensaios

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    day TEXT NOT NULL,
    full_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT NOT NULL,
    time TEXT NOT NULL,
    conductor TEXT NOT NULL,
    type TEXT NOT NULL,
    canceled BOOLEAN DEFAULT FALSE
);

-- Conductors table
CREATE TABLE IF NOT EXISTS conductors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    instrument TEXT,
    congregation TEXT,
    photo_url TEXT,
    type TEXT NOT NULL
);

-- Congregations table
CREATE TABLE IF NOT EXISTS congregations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    address TEXT,
    cep TEXT,
    city TEXT,
    state TEXT
);

-- Service Days (linked to congregations)
CREATE TABLE IF NOT EXISTS service_days (
    id SERIAL PRIMARY KEY,
    congregation_id TEXT REFERENCES congregations(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    time TEXT NOT NULL
);

-- Ministry (linked to congregations)
CREATE TABLE IF NOT EXISTS ministry (
    id SERIAL PRIMARY KEY,
    congregation_id TEXT REFERENCES congregations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    name TEXT NOT NULL
);

-- Presences table
CREATE TABLE IF NOT EXISTS presences (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    instrument TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS and add public policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Events" ON events FOR SELECT USING (true);
CREATE POLICY "Public Insert Events" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Events" ON events FOR UPDATE USING (true);
CREATE POLICY "Public Delete Events" ON events FOR DELETE USING (true);

ALTER TABLE conductors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Conductors" ON conductors FOR SELECT USING (true);
CREATE POLICY "Public Insert Conductors" ON conductors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Conductors" ON conductors FOR UPDATE USING (true);
CREATE POLICY "Public Delete Conductors" ON conductors FOR DELETE USING (true);

ALTER TABLE congregations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Congregations" ON congregations FOR SELECT USING (true);
CREATE POLICY "Public Insert Congregations" ON congregations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Congregations" ON congregations FOR UPDATE USING (true);
CREATE POLICY "Public Delete Congregations" ON congregations FOR DELETE USING (true);

ALTER TABLE service_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Service Days" ON service_days FOR SELECT USING (true);
CREATE POLICY "Public Insert Service Days" ON service_days FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Service Days" ON service_days FOR UPDATE USING (true);
CREATE POLICY "Public Delete Service Days" ON service_days FOR DELETE USING (true);

ALTER TABLE ministry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Ministry" ON ministry FOR SELECT USING (true);
CREATE POLICY "Public Insert Ministry" ON ministry FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Ministry" ON ministry FOR UPDATE USING (true);
CREATE POLICY "Public Delete Ministry" ON ministry FOR DELETE USING (true);

ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Presences" ON presences FOR SELECT USING (true);
CREATE POLICY "Public Insert Presences" ON presences FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Presences" ON presences FOR UPDATE USING (true);
CREATE POLICY "Public Delete Presences" ON presences FOR DELETE USING (true);

-- Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    name TEXT,
    phone TEXT,
    instrument TEXT,
    congregation TEXT,
    photo_url TEXT,
    role TEXT DEFAULT 'USER'
);

-- Trigger to create profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, instrument, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'name', 
        NEW.raw_user_meta_data->>'instrument',
        COALESCE(NEW.raw_user_meta_data->>'role', 'USER')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
