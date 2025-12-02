import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema/*",
  dbCredentials: {
    url: process.env.APP_DB_URL!,
  },
});
