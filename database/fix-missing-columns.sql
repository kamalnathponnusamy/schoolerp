-- Check and fix inventory table structure
DO $$ 
BEGIN
    -- Add available_quantity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'inventory' AND column_name = 'available_quantity') THEN
        ALTER TABLE inventory ADD COLUMN available_quantity INTEGER DEFAULT 0;
    END IF;
    
    -- Add issued_quantity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'inventory' AND column_name = 'issued_quantity') THEN
        ALTER TABLE inventory ADD COLUMN issued_quantity INTEGER DEFAULT 0;
    END IF;
    
    -- Update available_quantity based on existing data
    UPDATE inventory SET available_quantity = COALESCE(total_quantity, 0) WHERE available_quantity = 0;
END $$;

-- Check and fix exams table structure
DO $$ 
BEGIN
    -- Add start_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'exams' AND column_name = 'start_time') THEN
        ALTER TABLE exams ADD COLUMN start_time TIME;
    END IF;
    
    -- Add end_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'exams' AND column_name = 'end_time') THEN
        ALTER TABLE exams ADD COLUMN end_time TIME;
    END IF;

    -- Add passing_marks column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'exams' AND column_name = 'passing_marks') THEN
        ALTER TABLE exams ADD COLUMN passing_marks INTEGER;
    END IF;

    -- Add syllabus column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'exams' AND column_name = 'syllabus') THEN
        ALTER TABLE exams ADD COLUMN syllabus TEXT;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'exams' AND column_name = 'status') THEN
        ALTER TABLE exams ADD COLUMN status VARCHAR(20) DEFAULT 'scheduled';
    END IF;
END $$;

-- Create timetable table if it doesn't exist
CREATE TABLE IF NOT EXISTS timetable (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id),
    subject_id INTEGER REFERENCES subjects(id),
    teacher_id INTEGER REFERENCES teachers(id),
    day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample timetable data
INSERT INTO timetable (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number)
VALUES 
    (1, 1, 1, 1, '08:00', '08:45', 'Room 101'),
    (1, 2, 2, 1, '08:45', '09:30', 'Room 101'),
    (1, 3, 3, 1, '09:30', '10:15', 'Room 101'),
    (2, 1, 1, 1, '10:15', '11:00', 'Room 102'),
    (2, 2, 2, 1, '11:00', '11:45', 'Room 102')
ON CONFLICT DO NOTHING;

-- Show the updated structure
SELECT 'Inventory columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'inventory' ORDER BY ordinal_position;

SELECT 'Exams columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'exams' ORDER BY ordinal_position;

SELECT 'Timetable created successfully' as info;
SELECT COUNT(*) as timetable_entries FROM timetable;
