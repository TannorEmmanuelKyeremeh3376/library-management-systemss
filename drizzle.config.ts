import dotenv from 'dotenv';
import { defineConfig } from "drizzle-kit";

dotenv.config();

const url = process.env.DATABASE_URL ??
  "postgresql://postgres:YOUR_ACTUAL_PASSWORD_HERE@localhost:5433/library_db";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
});