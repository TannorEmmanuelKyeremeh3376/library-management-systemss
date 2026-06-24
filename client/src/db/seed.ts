import { db } from "./index";
import { books, users } from "../../../drizzle/schema";

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Insert Dummy Users
    console.log("Inserting users...");
    await db.insert(users).values([
      { fullName: "Noble Dev", email: "noble@library.com", phoneNumber: "+123456789" },
      { fullName: "Jane Doe", email: "jane@library.com", phoneNumber: "+987654321" }
    ]);

    // 2. Insert Dummy Books
    console.log("Inserting books...");
    await db.insert(books).values([
      { title: "The Masterpiece of Code", author: "Noble", isbn: "978-1234567890", availableCopies: 5 },
      { title: "Learning TypeScript Fast", author: "Jane Dev", isbn: "978-0987654321", availableCopies: 2 },
      { title: "Database Systems Guide", author: "Postgres Guru", isbn: "978-5555555555", availableCopies: 3 }
    ]);

    console.log("✅ Database seeded successfully with mock books and users!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    process.exit(0);
  }
}

seed();