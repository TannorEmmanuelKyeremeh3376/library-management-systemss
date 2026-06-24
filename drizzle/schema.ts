import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// 1. Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Books Table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  isbn: varchar("isbn", { length: 50 }).notNull().unique(),
  availableCopies: integer("available_copies").default(1).notNull(),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Borrow Records Table (Links Users to Books)
export const borrowRecords = pgTable("borrow_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  bookId: integer("book_id")
    .references(() => books.id, { onDelete: "cascade" })
    .notNull(),
  borrowDate: timestamp("borrow_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status", { length: 50 }).default("BORROWED").notNull(), // BORROWED, RETURNED, OVERDUE
});