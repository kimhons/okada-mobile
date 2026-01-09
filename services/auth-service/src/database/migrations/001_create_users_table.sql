-- Create users table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'customer', 'rider', 'merchant', 'support');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification', 'locked');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE locale_type AS ENUM ('en', 'fr');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(254) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    status account_status NOT NULL DEFAULT 'pending_verification',

    -- Profile information
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    avatar VARCHAR(500),
    date_of_birth DATE,
    gender gender_type,
    language locale_type NOT NULL DEFAULT 'fr',
    timezone VARCHAR(100) DEFAULT 'Africa/Douala',

    -- Security information
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(100),
    backup_codes TEXT[], -- Array of backup codes
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    marketing_notifications BOOLEAN DEFAULT FALSE,
    profile_visibility VARCHAR(20) DEFAULT 'private',
    location_sharing BOOLEAN DEFAULT FALSE,
    data_processing BOOLEAN DEFAULT TRUE,

    -- Verification status
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_email_verified ON users(email_verified_at);
CREATE INDEX idx_users_phone_verified ON users(phone_verified_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create refresh_tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_family VARCHAR(255) NOT NULL,
    jti VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for refresh_tokens
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_jti ON refresh_tokens(jti);
CREATE INDEX idx_refresh_tokens_token_family ON refresh_tokens(token_family);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_is_active ON refresh_tokens(is_active);

-- Create verification_codes table
CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    identifier VARCHAR(254) NOT NULL, -- email or phone
    code VARCHAR(10) NOT NULL,
    hashed_code VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- Create indexes for verification_codes
CREATE INDEX idx_verification_codes_identifier ON verification_codes(identifier);
CREATE INDEX idx_verification_codes_type ON verification_codes(type);
CREATE INDEX idx_verification_codes_expires_at ON verification_codes(expires_at);
CREATE INDEX idx_verification_codes_verified ON verification_codes(verified);

-- Create security_questions table
CREATE TABLE security_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question VARCHAR(500) NOT NULL,
    answer_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for security_questions
CREATE INDEX idx_security_questions_user_id ON security_questions(user_id);

-- Create auth_events table for audit logging
CREATE TABLE auth_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_code VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for auth_events
CREATE INDEX idx_auth_events_user_id ON auth_events(user_id);
CREATE INDEX idx_auth_events_type ON auth_events(type);
CREATE INDEX idx_auth_events_created_at ON auth_events(created_at);
CREATE INDEX idx_auth_events_success ON auth_events(success);

-- Add constraints
ALTER TABLE users ADD CONSTRAINT users_email_check
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users ADD CONSTRAINT users_phone_check
    CHECK (phone ~* '^\+237[26][0-9]{8}$');

ALTER TABLE users ADD CONSTRAINT users_first_name_check
    CHECK (char_length(first_name) >= 2 AND char_length(first_name) <= 50);

ALTER TABLE users ADD CONSTRAINT users_last_name_check
    CHECK (char_length(last_name) >= 2 AND char_length(last_name) <= 50);

-- Add comments
COMMENT ON TABLE users IS 'Main users table storing user account information';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for session management';
COMMENT ON TABLE verification_codes IS 'OTP codes for email/phone/password reset verification';
COMMENT ON TABLE security_questions IS 'User security questions for account recovery';
COMMENT ON TABLE auth_events IS 'Authentication events for security auditing';

-- Insert default admin user (password: AdminPass123!)
INSERT INTO users (
    email,
    phone,
    password_hash,
    role,
    status,
    first_name,
    last_name,
    email_verified_at,
    phone_verified_at
) VALUES (
    'admin@okada.cm',
    '+237654321000',
    '$2b$12$LQv3c1yqBwEHXkzV8m3Bou.j9z0hQXgCqZ8sTM5H0K8IFJ6qQ7yWu', -- AdminPass123!
    'admin',
    'active',
    'System',
    'Administrator',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);