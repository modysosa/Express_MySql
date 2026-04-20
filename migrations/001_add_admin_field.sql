-- Add admin field to users table
ALTER TABLE users ADD COLUMN admin BOOLEAN DEFAULT 0;
