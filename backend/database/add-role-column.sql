-- Add role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' AFTER bio;

-- Update existing admin user to have admin role
UPDATE users SET role = 'admin' WHERE username = 'admin';

-- Verify the changes
SELECT id, username, email, role FROM users;
