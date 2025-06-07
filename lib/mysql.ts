import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Optional helper function (if you want to keep the `sql()` style)
export async function sql(query: string, params: any[] = []) {
  const [rows] = await pool.execute(query, params);
  return rows;
}

export default pool;
