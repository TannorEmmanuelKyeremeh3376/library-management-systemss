import { describe, expect, it } from "vitest";
import { markOverdueLoans } from "./db";

describe("database fallback behavior", () => {
  it("does not throw when the database is unavailable", async () => {
    const originalDatabaseUrl = process.env.DATABASE_URL;

    try {
      delete process.env.DATABASE_URL;
      await expect(markOverdueLoans()).resolves.toBeDefined();
    } finally {
      if (originalDatabaseUrl !== undefined) {
        process.env.DATABASE_URL = originalDatabaseUrl;
      }
    }
  });
});
