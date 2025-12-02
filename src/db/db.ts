import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.APP_DB_URL,
  keepAlive: true,
  ssl: false,
});

export const db = drizzle({ client: pool });
