import { eq, and, desc, sql, lte, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../drizzle/schema";
import { InsertUser, users, books, InsertBook, members, InsertMember, loans, InsertLoan, transactions, InsertTransaction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: Client | null = null;

const fallbackBooks = [
  { id: 1, title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "9780261103344", genre: "Fantasy", category: "Fiction", availableCopies: 2, coverUrl: null, createdAt: new Date() },
  { id: 2, title: "1984", author: "George Orwell", isbn: "9780451524935", genre: "Dystopian", category: "Classic", availableCopies: 1, coverUrl: null, createdAt: new Date() },
  { id: 3, title: "Atomic Habits", author: "James Clear", isbn: "9780735211292", genre: "Self-Help", category: "Non-Fiction", availableCopies: 3, coverUrl: null, createdAt: new Date() },
];

const fallbackMembers = [
  { id: 1, firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", phone: "555-0101", createdAt: new Date() },
  { id: 2, firstName: "Grace", lastName: "Hopper", email: "grace@example.com", phone: "555-0102", createdAt: new Date() },
];

const fallbackLoans = [
  { id: 1, memberId: 1, bookId: 1, borrowDate: new Date(), dueDate: new Date(Date.now() + 7 * 86400000), returnDate: null, status: "active", isOverdue: false, createdAt: new Date() },
];

const fallbackTransactions = [
  { id: 1, type: "book_added", bookId: 1, memberId: null, loanId: null, description: "Demo book added", createdAt: new Date() },
  { id: 2, type: "member_registered", bookId: null, memberId: 1, loanId: null, description: "Demo member registered", createdAt: new Date() },
];

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      if (!_client) {
        _client = new Client({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
        });
        await _client.connect();
      }

      _db = drizzle(_client, { schema });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ BOOK QUERIES ============

export async function addBook(book: InsertBook) {
  const db = await getDb();
  if (!db) {
    return { insertedId: fallbackBooks.length + 1 };
  }
  
  const result = await db.insert(books).values(book);
  return result;
}

export async function getBooks(search?: string, genre?: string, category?: string) {
  const db = await getDb();
  if (!db) {
    return fallbackBooks.filter((book) => {
      const query = search?.toLowerCase() ?? "";
      const matchesSearch = !query || [book.title, book.author, book.isbn].some((value) => value.toLowerCase().includes(query));
      const matchesGenre = !genre || book.genre === genre;
      const matchesCategory = !category || book.category === category;
      return matchesSearch && matchesGenre && matchesCategory;
    });
  }

  const conditions = [];

  if (search) {
    conditions.push(
      sql`(${books.title} LIKE ${`%${search}%`} OR ${books.author} LIKE ${`%${search}%`} OR ${books.isbn} LIKE ${`%${search}%`})`
    );
  }

  if (genre) {
    conditions.push(eq(books.genre, genre));
  }

  if (category) {
    conditions.push(eq(books.category, category));
  }

  if (conditions.length > 0) {
    return db.select().from(books).where(and(...conditions)).orderBy(desc(books.createdAt));
  }

  return db.select().from(books).orderBy(desc(books.createdAt));
}

export async function getBookById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateBook(id: number, updates: Partial<InsertBook>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(books).set(updates).where(eq(books.id, id));
}

export async function deleteBook(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const book = await getBookById(id);
  if (book) {
    await recordTransaction({
      type: "book_deleted",
      bookId: id,
      description: `Book deleted: ${book.title}`,
    });
  }

  return db.delete(books).where(eq(books.id, id));
}

export async function getTotalBooks() {
  const db = await getDb();
  if (!db) return fallbackBooks.length;

  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(books);
  return result[0]?.count || 0;
}

// ============ MEMBER QUERIES ============

export async function addMember(member: InsertMember) {
  const db = await getDb();
  if (!db) {
    return { insertedId: fallbackMembers.length + 1 };
  }

  const result = await db.insert(members).values(member);
  return result;
}

export async function getMembers() {
  const db = await getDb();
  if (!db) return fallbackMembers;

  return db.select().from(members).orderBy(desc(members.createdAt));
}

export async function getMemberById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateMember(id: number, updates: Partial<InsertMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(members).set(updates).where(eq(members.id, id));
}

export async function deleteMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(members).where(eq(members.id, id));
}

export async function getTotalMembers() {
  const db = await getDb();
  if (!db) return fallbackMembers.length;

  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(members);
  return result[0]?.count || 0;
}

// ============ LOAN QUERIES ============

export async function createLoan(loan: InsertLoan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(loans).values(loan);
  
  // Update book availability
  const book = await getBookById(loan.bookId);
  if (book && book.availableCopies > 0) {
    await updateBook(loan.bookId, { availableCopies: book.availableCopies - 1 });
  }

  return result;
}

export async function returnLoan(loanId: number, returnDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const loan = await db.select().from(loans).where(eq(loans.id, loanId)).limit(1);
  if (!loan.length) throw new Error("Loan not found");

  const loanRecord = loan[0];
  
  // Update book availability
  const book = await getBookById(loanRecord.bookId);
  if (book) {
    await updateBook(loanRecord.bookId, { availableCopies: book.availableCopies + 1 });
  }

  await recordTransaction({
    type: "return",
    bookId: loanRecord.bookId,
    memberId: loanRecord.memberId,
    loanId: loanId,
    description: `Book returned`,
  });

  return db.update(loans).set({
    status: "returned",
    returnDate: returnDate,
    isOverdue: false,
  }).where(eq(loans.id, loanId));
}

export async function getLoans(memberId?: number, status?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];

  if (memberId) {
    conditions.push(eq(loans.memberId, memberId));
  }

  if (status) {
    conditions.push(eq(loans.status, status as any));
  }

  if (conditions.length > 0) {
    return db.select().from(loans).where(and(...conditions)).orderBy(desc(loans.borrowDate));
  }

  return db.select().from(loans).orderBy(desc(loans.borrowDate));
}

export async function getLoanById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(loans).where(eq(loans.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getActiveBorrows() {
  const db = await getDb();
  if (!db) return fallbackLoans.filter((loan) => loan.status === "active").length;

  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(loans).where(eq(loans.status, "active"));
  return result[0]?.count || 0;
}

export async function getOverdueLoans() {
  const db = await getDb();
  if (!db) return fallbackLoans.filter((loan) => loan.isOverdue || new Date(loan.dueDate) < new Date());

  const today = new Date().toISOString().split('T')[0];
  const result = await db
    .select()
    .from(loans)
    .where(and(eq(loans.status, "active"), lte(loans.dueDate, sql`${today}`)));
  
  return result;
}

export async function getOverdueCount() {
  const db = await getDb();
  if (!db) return fallbackLoans.filter((loan) => loan.isOverdue || new Date(loan.dueDate) < new Date()).length;

  const today = new Date().toISOString().split('T')[0];
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(loans)
    .where(and(eq(loans.status, "active"), lte(loans.dueDate, sql`${today}`)));
  
  return result[0]?.count || 0;
}

export async function markOverdueLoans() {
  const db = await getDb();
  if (!db) {
    return fallbackLoans.map((loan) => ({
      ...loan,
      isOverdue: loan.isOverdue || new Date(loan.dueDate) < new Date(),
    }));
  }

  const today = new Date().toISOString().split('T')[0];
  return db.update(loans).set({ isOverdue: true }).where(
    and(eq(loans.status, "active"), lte(loans.dueDate, sql`${today}`))
  );
}

// ============ TRANSACTION QUERIES ============

export async function recordTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(transactions).values(transaction);
}

export async function getTransactions(limit: number = 50) {
  const db = await getDb();
  if (!db) return fallbackTransactions.slice(0, limit);

  return db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(limit);
}

// ============ ANALYTICS QUERIES ============

export async function getMostBorrowedBooks(limit: number = 10) {
  const db = await getDb();
  if (!db) {
    return fallbackBooks.slice(0, limit).map((book, index) => ({
      bookId: book.id,
      title: book.title,
      author: book.author,
      borrowCount: Math.max(1, 3 - index),
    }));
  }

  return db
    .select({
      bookId: loans.bookId,
      title: books.title,
      author: books.author,
      borrowCount: sql<number>`COUNT(${loans.id})`,
    })
    .from(loans)
    .innerJoin(books, eq(loans.bookId, books.id))
    .groupBy(loans.bookId)
    .orderBy(desc(sql`COUNT(${loans.id})`))
    .limit(limit);
}

export async function getMostActiveMembers(limit: number = 10) {
  const db = await getDb();
  if (!db) {
    return fallbackMembers.slice(0, limit).map((member, index) => ({
      memberId: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      borrowCount: Math.max(1, 2 - index),
    }));
  }

  return db
    .select({
      memberId: loans.memberId,
      firstName: members.firstName,
      lastName: members.lastName,
      borrowCount: sql<number>`COUNT(${loans.id})`,
    })
    .from(loans)
    .innerJoin(members, eq(loans.memberId, members.id))
    .groupBy(loans.memberId)
    .orderBy(desc(sql`COUNT(${loans.id})`))
    .limit(limit);
}

export async function getMonthlyBorrowingTrends() {
  const db = await getDb();
  if (!db) {
    return [
      { month: "2025-01", borrowCount: 2 },
      { month: "2025-02", borrowCount: 3 },
      { month: "2025-03", borrowCount: 4 },
    ];
  }

  return db
    .select({
      month: sql<string>`DATE_FORMAT(${loans.borrowDate}, '%Y-%m')`,
      borrowCount: sql<number>`COUNT(${loans.id})`,
    })
    .from(loans)
    .groupBy(sql`DATE_FORMAT(${loans.borrowDate}, '%Y-%m')`)
    .orderBy(asc(sql`DATE_FORMAT(${loans.borrowDate}, '%Y-%m')`));
}

export async function getMemberBorrowingHistory(memberId: number) {
  const db = await getDb();
  if (!db) {
    return fallbackLoans
      .filter((loan) => loan.memberId === memberId)
      .map((loan) => ({
        id: loan.id,
        bookTitle: fallbackBooks.find((book) => book.id === loan.bookId)?.title ?? "Demo Book",
        bookAuthor: fallbackBooks.find((book) => book.id === loan.bookId)?.author ?? "Demo Author",
        borrowDate: loan.borrowDate,
        dueDate: loan.dueDate,
        returnDate: loan.returnDate,
        status: loan.status,
        isOverdue: loan.isOverdue,
      }));
  }

  return db
    .select({
      id: loans.id,
      bookTitle: books.title,
      bookAuthor: books.author,
      borrowDate: loans.borrowDate,
      dueDate: loans.dueDate,
      returnDate: loans.returnDate,
      status: loans.status,
      isOverdue: loans.isOverdue,
    })
    .from(loans)
    .innerJoin(books, eq(loans.bookId, books.id))
    .where(eq(loans.memberId, memberId))
    .orderBy(desc(loans.borrowDate));
}

export async function getBookBorrowingHistory(bookId: number) {
  const db = await getDb();
  if (!db) {
    return fallbackLoans
      .filter((loan) => loan.bookId === bookId)
      .map((loan) => ({
        id: loan.id,
        memberName: fallbackMembers.find((member) => member.id === loan.memberId)?.firstName + " " + fallbackMembers.find((member) => member.id === loan.memberId)?.lastName,
        borrowDate: loan.borrowDate,
        dueDate: loan.dueDate,
        returnDate: loan.returnDate,
        status: loan.status,
        isOverdue: loan.isOverdue,
      }));
  }

  return db
    .select({
      id: loans.id,
      memberName: sql<string>`CONCAT(${members.firstName}, ' ', ${members.lastName})`,
      borrowDate: loans.borrowDate,
      dueDate: loans.dueDate,
      returnDate: loans.returnDate,
      status: loans.status,
      isOverdue: loans.isOverdue,
    })
    .from(loans)
    .innerJoin(members, eq(loans.memberId, members.id))
    .where(eq(loans.bookId, bookId))
    .orderBy(desc(loans.borrowDate));
}
