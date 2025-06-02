-- Create timetable table
CREATE TABLE IF NOT EXISTS timetable (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id),
  subject_id INTEGER REFERENCES subjects(id),
  teacher_id INTEGER REFERENCES teachers(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(teacher_id, day_of_week, start_time),
  UNIQUE(class_id, day_of_week, start_time)
);

-- Insert sample timetable data
INSERT INTO timetable (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room_number) VALUES
-- LKG (Class ID 1) - Monday
(1, 1, 1, 1, '08:00', '08:45', 'Room 101'),
(1, 2, 2, 1, '08:45', '09:30', 'Room 101'),
(1, 3, 3, 1, '09:30', '10:15', 'Room 101'),

-- UKG (Class ID 2) - Monday  
(2, 1, 1, 1, '10:15', '11:00', 'Room 102'),
(2, 2, 2, 1, '11:00', '11:45', 'Room 102'),

-- Class 10 (Class ID 12) - Monday
(12, 4, 4, 1, '08:00', '08:45', 'Room 201'),
(12, 5, 5, 1, '08:45', '09:30', 'Room 201'),
(12, 6, 6, 1, '09:30', '10:15', 'Room 201'),

-- Class 12 (Class ID 14) - Monday
(14, 7, 7, 1, '10:15', '11:00', 'Room 301'),
(14, 8, 8, 1, '11:00', '11:45', 'Room 301'),

-- Tuesday schedule
(1, 2, 2, 2, '08:00', '08:45', 'Room 101'),
(1, 3, 3, 2, '08:45', '09:30', 'Room 101'),
(2, 1, 1, 2, '09:30', '10:15', 'Room 102'),
(12, 4, 4, 2, '10:15', '11:00', 'Room 201'),
(14, 7, 7, 2, '11:00', '11:45', 'Room 301'),

-- Wednesday schedule
(1, 1, 1, 3, '08:00', '08:45', 'Room 101'),
(2, 2, 2, 3, '08:45', '09:30', 'Room 102'),
(12, 5, 5, 3, '09:30', '10:15', 'Room 201'),
(14, 8, 8, 3, '10:15', '11:00', 'Room 301'),

-- Thursday schedule
(1, 3, 3, 4, '08:00', '08:45', 'Room 101'),
(2, 1, 1, 4, '08:45', '09:30', 'Room 102'),
(12, 6, 6, 4, '09:30', '10:15', 'Room 201'),
(14, 7, 7, 4, '10:15', '11:00', 'Room 301'),

-- Friday schedule
(1, 2, 2, 5, '08:00', '08:45', 'Room 101'),
(2, 3, 3, 5, '08:45', '09:30', 'Room 102'),
(12, 4, 4, 5, '09:30', '10:15', 'Room 201'),
(14, 8, 8, 5, '10:15', '11:00', 'Room 301');

-- Show completion status
SELECT 
  'Timetable table created and populated successfully!' as status,
  (SELECT COUNT(*) FROM timetable) as total_entries,
  (SELECT COUNT(DISTINCT teacher_id) FROM timetable) as teachers_assigned,
  (SELECT COUNT(DISTINCT class_id) FROM timetable) as classes_scheduled;
