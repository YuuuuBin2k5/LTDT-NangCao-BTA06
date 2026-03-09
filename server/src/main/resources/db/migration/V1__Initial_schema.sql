-- Initial schema creation for MAPIC application

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password VARCHAR(255) NOT NULL,
    nick_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified TIMESTAMP,
    last_active TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create current_locations table
CREATE TABLE IF NOT EXISTS current_locations (
    user_id UUID PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    heading DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    battery_level INTEGER,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_current_locations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create otp_token table
CREATE TABLE IF NOT EXISTS otp_token (
    id UUID PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- Create index on email and type for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_token_email_type ON otp_token(email, type);
