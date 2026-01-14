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

-- Enable RLS (Optional, can be configured later)
-- ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE conductors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE congregations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE service_days ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ministry ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE presences ENABLE ROW LEVEL SECURITY;
