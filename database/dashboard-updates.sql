-- Add homework_attachments table for file uploads
CREATE TABLE homework_attachments (
    id SERIAL PRIMARY KEY,
    homework_id INTEGER REFERENCES homework(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add homework_submissions table
CREATE TABLE homework_submissions (
    id SERIAL PRIMARY KEY,
    homework_id INTEGER REFERENCES homework(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
    grade VARCHAR(5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (homework_id, student_id)
);

-- Add homework_submission_attachments table
CREATE TABLE homework_submission_attachments (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES homework_submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add notification_reads table to track read status
CREATE TABLE notification_reads (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (notification_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX idx_homework_class_id ON homework(class_id);
CREATE INDEX idx_homework_teacher_id ON homework(teacher_id);
CREATE INDEX idx_homework_due_date ON homework(due_date);
CREATE INDEX idx_notifications_target_audience ON notifications(target_audience);
CREATE INDEX idx_notification_reads_user_id ON notification_reads(user_id);

-- Add trigger for automatic notification on homework assignment
DELIMITER //
CREATE TRIGGER after_homework_insert
AFTER INSERT ON homework
FOR EACH ROW
BEGIN
    INSERT INTO notifications (
        title,
        message,
        type,
        target_audience,
        class_ids,
        created_by,
        status
    )
    SELECT 
        CONCAT('New Homework: ', NEW.title),
        NEW.description,
        'homework',
        'students',
        NEW.class_id,
        NEW.teacher_id,
        'active'
    FROM dual;
END//
DELIMITER ;

-- Add trigger for automatic notification on attendance marking
DELIMITER //
CREATE TRIGGER after_attendance_insert
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
    INSERT INTO notifications (
        title,
        message,
        type,
        target_audience,
        created_by,
        status
    )
    SELECT 
        'Attendance Marked',
        CONCAT('Your attendance has been marked as ', NEW.status, ' for ', NEW.date),
        'attendance',
        'students',
        NEW.marked_by,
        'active'
    FROM dual
    WHERE NEW.student_id = (SELECT id FROM students WHERE id = NEW.student_id);
END//
DELIMITER ; 