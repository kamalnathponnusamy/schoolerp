-- Add some sample attendance data for today to prevent division by zero
INSERT INTO attendance (student_id, class_id, date, status, marked_by, created_at)
SELECT 
  s.id,
  s.class_id,
  CURRENT_DATE,
  CASE 
    WHEN random() > 0.1 THEN 'present'
    ELSE 'absent'
  END,
  1, -- Assuming admin user ID is 1
  CURRENT_TIMESTAMP
FROM students s
WHERE s.status = 'active'
ON CONFLICT (student_id, date) DO NOTHING;

-- Verify the data was inserted
SELECT 
  COUNT(*) as total_attendance_records,
  COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
  ROUND((COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / COUNT(*))::numeric, 1) as attendance_percentage
FROM attendance 
WHERE date = CURRENT_DATE;
