import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// 1. Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  loginMethod: varchar("login_method", { length: 50 }),
  lastSignedIn: timestamp("last_signed_in"),
  role: varchar("role", { length: 50 }).default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Books Table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  isbn: varchar("isbn", { length: 50 }).notNull().unique(),
  genre: varchar("genre", { length: 100 }),
  category: varchar("category", { length: 100 }),
  availableCopies: integer("available_copies").default(1).notNull(),
  coverUrl: text("cover_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Members Table
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Loans Table
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id")
    .references(() => members.id, { onDelete: "cascade" })
    .notNull(),
  bookId: integer("book_id")
    .references(() => books.id, { onDelete: "cascade" })
    .notNull(),
  borrowDate: timestamp("borrow_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  returnDate: timestamp("return_date"),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  isOverdue: boolean("is_overdue").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Transactions Table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  bookId: integer("book_id").references(() => books.id, { onDelete: "set null" }),
  memberId: integer("member_id").references(() => members.id, { onDelete: "set null" }),
  loanId: integer("loan_id").references(() => loans.id, { onDelete: "set null" }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Borrow Records Table (compatibility)
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
  status: varchar("status", { length: 50 }).default("BORROWED").notNull(),
});

export type InsertUser = InferInsertModel<typeof users>;
export type InsertBook = InferInsertModel<typeof books>;
export type InsertMember = InferInsertModel<typeof members>;
export type InsertLoan = InferInsertModel<typeof loans>;
export type InsertTransaction = InferInsertModel<typeof transactions>;

export type SelectUser = InferSelectModel<typeof users>;
export type SelectBook = InferSelectModel<typeof books>;
export type SelectMember = InferSelectModel<typeof members>;
export type SelectLoan = InferSelectModel<typeof loans>;
export type SelectTransaction = InferSelectModel<typeof transactions>;