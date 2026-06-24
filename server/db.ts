import { eq, and, like, desc, asc, sql, lte, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, books, InsertBook, members, InsertMember, loans, InsertLoan, transactions, InsertTransaction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(books).values(book);
  return result;
}

export async function getBooks(search?: string, genre?: string, category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

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
  if (!db) throw new Error("Database not available");

  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(books);
  return result[0]?.count || 0;
}

// ============ MEMBER QUERIES ============

export async function addMember(member: InsertMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(members).values(member);
  return result;
}

export async function getMembers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

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
  if (!db) throw new Error("Database not available");

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
  if (!db) throw new Error("Database not available");

  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(loans).where(eq(loans.status, "active"));
  return result[0]?.count || 0;
}

export async function getOverdueLoans() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toISOString().split('T')[0];
  const result = await db
    .select()
    .from(loans)
    .where(and(eq(loans.status, "active"), lte(loans.dueDate, sql`${today}`)));
  
  return result;
}

export async function getOverdueCount() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toISOString().split('T')[0];
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(loans)
    .where(and(eq(loans.status, "active"), lte(loans.dueDate, sql`${today}`)));
  
  return result[0]?.count || 0;
}

export async function markOverdueLoans() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

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
  if (!db) throw new Error("Database not available");

  return db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(limit);
}

// ============ ANALYTICS QUERIES ============

export async function getMostBorrowedBooks(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

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
  if (!db) throw new Error("Database not available");

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
  if (!db) throw new Error("Database not available");

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
  if (!db) throw new Error("Database not available");

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
  if (!db) throw new Error("Database not available");

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
