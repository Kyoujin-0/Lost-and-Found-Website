-- Create Database
CREATE DATABASE lost_and_found;

-- Connect to the database
--\c lost_and_found;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items Table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    date_lost_found DATE NOT NULL,
    item_type VARCHAR(10) NOT NULL CHECK (item_type IN ('lost', 'found')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'archived')),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    image_url TEXT,
    emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Better Performance
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_type_status ON items(item_type, status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_date ON items(date_lost_found);
CREATE INDEX idx_comments_item_id ON comments(item_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Insert Demo Users (passwords are hashed for 'password123')
INSERT INTO users (student_id, username, email, password, full_name, phone) VALUES
('2021-12345', 'john_doe', 'john@university.edu', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'John Doe', '555-123-4567'),
('2021-67890', 'jane_smith', 'jane@university.edu', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Jane Smith', '555-987-6543'),
('2022-11111', 'mike_wilson', 'mike@university.edu', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Mike Wilson', '555-456-7890');

-- Insert Demo Items
INSERT INTO items (user_id, title, description, category, location, date_lost_found, item_type, status, contact_email, contact_phone, emoji) VALUES
(1, 'Black Leather Wallet', 'Black leather wallet with university ID inside', 'Personal Items', 'Library 3rd Floor', '2024-12-18', 'lost', 'active', 'john@university.edu', '555-123-4567', '🎒'),
(2, 'Silver iPhone 15', 'Silver iPhone 15 with blue case', 'Electronics', 'Student Center', '2024-12-17', 'lost', 'active', 'jane@university.edu', NULL, '📱'),
(3, 'Grey Hoodie', 'Grey university hoodie, size M', 'Clothing', 'Lecture Hall A', '2024-12-18', 'found', 'active', 'security@university.edu', NULL, '👕');

-- Insert Demo Comments
INSERT INTO comments (item_id, user_id, text) VALUES
(1, 2, 'I think I saw this at the library yesterday!'),
(1, 3, 'Did it have a student ID with the initials J.D.?'),
(3, 1, 'Is there a name tag inside?');