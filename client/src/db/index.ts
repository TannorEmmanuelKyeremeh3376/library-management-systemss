import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../../drizzle/schema";

// Read connection string from env with a sensible fallback for local dev
const connectionString = process.env.DATABASE_URL ||
  "postgresql://postgres:YOUR_ACTUAL_PASSWORD_HERE@localhost:5433/library_db";

const client = new Client({ connectionString });

// Connect cleanly and keep process alive for queries
client.connect()
  .then(() => console.log("🔌 Successfully connected to the database!"))
  .catch((err) => console.error("❌ Database connection failed:", err));

export const db = drizzle(client, { schema });