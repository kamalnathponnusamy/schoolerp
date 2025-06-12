import mysql from "mysql2/promise";

// Validate required environment variables
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "DB_PORT"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

// Create MySQL connection pool with better error handling and connection management
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Database connection established successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  });

// Handle pool errors
pool.on('connection', (connection) => {
  connection.on('error', (err) => {
    console.error('Unexpected error on idle connection', err);
    process.exit(-1);
  });
});

export default pool;

// Helper function to execute SQL queries with proper typing and connection handling
export async function sql<T = any>(query: string | { sql: string; values?: any[] }, params?: any[] | Record<string, any>): Promise<T[]> {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Handle different query formats
    let sqlQuery: string;
    let queryParams: any[] | undefined;

    if (typeof query === 'string') {
      sqlQuery = query;
      queryParams = Array.isArray(params) ? params : undefined;
    } else {
      sqlQuery = query.sql;
      queryParams = query.values;
    }

    // Validate query and parameters
    if (!sqlQuery) {
      throw new Error("SQL query cannot be empty");
    }

    // Convert undefined values to null in parameters
    if (queryParams) {
      queryParams = queryParams.map(param => param === undefined ? null : param);
    }

    // Execute query with proper parameter handling
    const rawResult = await connection.execute(sqlQuery, queryParams || []);
    console.log('Raw result from connection.execute:', rawResult);
    const [rows] = rawResult;
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Type definitions for the database schema
export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  role: "admin" | "teacher" | "student"
  full_name: string
  phone?: string
  date_of_birth?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: number
  student_id: string
  user_id: number
  class_id: number
  admission_number: string
  admission_date: string
  father_name?: string
  mother_name?: string
  guardian_phone?: string
  blood_group?: string
  transport_opted: boolean
  transport_route_id?: number
  fee_structure?: any
  status: "active" | "inactive" | "graduated"
  created_at: string
}

export interface Teacher {
  id: number
  teacher_id: string
  user_id: number
  name: string
  subject: string
  phone: string
  email: string
  qualification: string
  experience_years: number
  salary: number
  status: string
}

export interface Class {
  id: number
  class_name: string
  section: string
  class_teacher_id?: number
  academic_year: string
  created_at: string
}

export interface Subject {
  id: number
  subject_name: string
  subject_code: string
  description?: string
  created_at: string
  updated_at: string
}

export interface TransportRoute {
  id: number
  route_name: string
  route_code: string
  pickup_points: string[]
  driver_name: string
  driver_phone: string
  vehicle_number: string
  capacity: number
  monthly_fee: number
  status: string
}

export interface Fee {
  id: number
  student_id: number
  academic_year: string
  term: string
  tuition_fee: number
  transport_fee: number
  lab_fee: number
  library_fee: number
  sports_fee: number
  other_fees: number
  total_amount: number
  paid_amount: number
  due_date: string
  status: string
}

export interface Attendance {
  id: number
  student_id: number
  date: string
  status: "present" | "absent" | "late" | "half_day"
  marked_by: number
  remarks?: string
  created_at: string
}

export interface Exam {
  id: number
  exam_name: string
  exam_type: string
  class_id: number
  subject_id: number
  exam_date: string
  start_time: string
  end_time: string
  total_marks: number
  passing_marks: number
  syllabus?: string
  status: string
}

export interface Homework {
  id: number
  title: string
  description: string
  subject_id: number
  class_id: number
  teacher_id: number
  due_date: string
  created_at: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: string
  target_audience: string
  is_urgent: boolean
  scheduled_date: string
  created_by: number
  created_at: string
}