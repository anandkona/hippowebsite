-- Create reviews / client success stories table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    content TEXT NOT NULL,
    stars INTEGER DEFAULT 5,
    avatar_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
