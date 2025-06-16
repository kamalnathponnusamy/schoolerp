-- Add status column to homework table if it doesn't exist
ALTER TABLE homework
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'; 