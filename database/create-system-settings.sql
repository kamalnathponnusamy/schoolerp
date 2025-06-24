-- Create enhanced system settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  school_name VARCHAR(100) DEFAULT 'Bright Future School',
  logo_url TEXT DEFAULT '/placeholder.svg?height=40&width=40&text=School',
  academic_year VARCHAR(20) DEFAULT '2024-25',
  contact_email VARCHAR(100) DEFAULT 'admin@brightfuture.edu',
  contact_phone VARCHAR(20) DEFAULT '+91-9876543210',
  address TEXT DEFAULT 'Chennai, Tamil Nadu, India',
  transport_base_fee INTEGER DEFAULT 1500,
  enable_homework_tracking BOOLEAN DEFAULT true,
  enable_sms_alerts BOOLEAN DEFAULT false,
  enable_parent_portal BOOLEAN DEFAULT true,
  primary_color VARCHAR(10) DEFAULT '#3b82f6',
  secondary_color VARCHAR(10) DEFAULT '#1e40af',
  dark_mode_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings if none exist
INSERT INTO system_settings (
  school_name, logo_url, academic_year, contact_email, contact_phone, address,
  transport_base_fee, enable_homework_tracking, enable_sms_alerts, enable_parent_portal,
  primary_color, secondary_color, dark_mode_enabled
) 
SELECT 
  'Tamil Nadu School ERP', 
  '/placeholder.svg?height=40&width=40&text=School',
  '2024-25',
  'admin@tnschoolerp.edu',
  '+91-9876543210',
  'Chennai, Tamil Nadu, India',
  1500,
  true,
  false,
  true,
  '#3b82f6',
  '#1e40af',
  false
WHERE NOT EXISTS (SELECT 1 FROM system_settings);

-- Show created settings
SELECT 'System settings table created and populated successfully' as status;
