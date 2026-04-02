import pg from "pg";
const globalForPg = global as unknown as { pool: pg.Pool };

export const pool =
  globalForPg.pool ||
  new pg.Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

if (process.env.NODE_ENV !== "production") globalForPg.pool = pool;
pool.connect((err, client, release) => {
  if (err) {
    return console.error("❌ Error acquiring client", err.stack);
  }
  console.log("✅ Database connected successfully to e-Hotels");
  release();
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
