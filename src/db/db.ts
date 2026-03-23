import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const readInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const pool = new Pool({
  connectionString: process.env.APP_DB_URL,
  keepAlive: true,
  ssl: process.env.APP_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: readInt(process.env.APP_DB_POOL_MAX, 20),
  min: readInt(process.env.APP_DB_POOL_MIN, 2),
  idleTimeoutMillis: readInt(process.env.APP_DB_IDLE_TIMEOUT_MS, 30000),
  connectionTimeoutMillis: readInt(process.env.APP_DB_CONNECTION_TIMEOUT_MS, 5000),
  maxUses: readInt(process.env.APP_DB_POOL_MAX_USES, 7500),
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export const db = drizzle({ client: pool });
