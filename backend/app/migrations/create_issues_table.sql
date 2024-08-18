CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    media_url TEXT,
    created_at TIMESTAMP NOT NULL,
    location VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT TRUE
);
