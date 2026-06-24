import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getTotalBooks,
  addMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getTotalMembers,
  createLoan,
  returnLoan,
  getLoans,
  getLoanById,
  getActiveBorrows,
  getOverdueLoans,
  getOverdueCount,
  markOverdueLoans,
  recordTransaction,
  getTransactions,
  getMostBorrowedBooks,
  getMostActiveMembers,
  getMonthlyBorrowingTrends,
  getMemberBorrowingHistory,
  getBookBorrowingHistory,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ DASHBOARD ============
  dashboard: router({
    getStats: protectedProcedure.query(async () => {
      const totalBooks = await getTotalBooks();
      const activeBorrows = await getActiveBorrows();
      const overdueItems = await getOverdueCount();
      const registeredMembers = await getTotalMembers();

      return {
        totalBooks,
        activeBorrows,
        overdueItems,
        registeredMembers,
      };
    }),

    getOverdueAlerts: protectedProcedure.query(async () => {
      await markOverdueLoans();
      const overdueLoans = await getOverdueLoans();
      
      return overdueLoans.map(loan => ({
        id: loan.id,
        bookId: loan.bookId,
        memberId: loan.memberId,
        dueDate: loan.dueDate,
        borrowDate: loan.borrowDate,
      }));
    }),

    getRecentActivity: protectedProcedure.query(async () => {
      const transactions = await getTransactions(20);
      return transactions;
    }),
  }),

  // ============ BOOKS ============
  books: router({
    list: protectedProcedure
      .input(
        z.object({
          search: z.string().optional(),
          genre: z.string().optional(),
          category: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return getBooks(input.search, input.genre, input.category);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getBookById(input.id);
      }),

    add: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          author: z.string().min(1),
          isbn: z.string().min(1),
          genre: z.string().min(1),
          category: z.string().min(1),
          publisher: z.string().optional(),
          publishedYear: z.number().optional(),
          totalCopies: z.number().int().positive().default(1),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await addBook({
          ...input,
          availableCopies: input.totalCopies,
        });

        await recordTransaction({
          type: "book_added",
          description: `Book added: ${input.title}`,
        });

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          author: z.string().optional(),
          isbn: z.string().optional(),
          genre: z.string().optional(),
          category: z.string().optional(),
          publisher: z.string().optional(),
          publishedYear: z.number().optional(),
          totalCopies: z.number().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return updateBook(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const book = await getBookById(input.id);
        if (book) {
          await recordTransaction({
            type: "book_deleted",
            bookId: input.id,
            description: `Book deleted: ${book.title}`,
          });
        }
        return deleteBook(input.id);
      }),

    getHistory: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ input }) => {
        return getBookBorrowingHistory(input.bookId);
      }),
  }),

  // ============ MEMBERS ============
  members: router({
    list: protectedProcedure.query(async () => {
      return getMembers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getMemberById(input.id);
      }),

    add: protectedProcedure
      .input(
        z.object({
          memberId: z.string().min(1),
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          address: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await addMember(input);

        await recordTransaction({
          type: "member_registered",
          description: `Member registered: ${input.firstName} ${input.lastName}`,
        });

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          status: z.enum(["active", "inactive", "suspended"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return updateMember(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteMember(input.id);
      }),

    getHistory: protectedProcedure
      .input(z.object({ memberId: z.number() }))
      .query(async ({ input }) => {
        return getMemberBorrowingHistory(input.memberId);
      }),
  }),

  // ============ LOANS ============
  loans: router({
    list: protectedProcedure
      .input(
        z.object({
          memberId: z.number().optional(),
          status: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return getLoans(input.memberId, input.status);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getLoanById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          bookId: z.number(),
          memberId: z.number(),
          dueDate: z.string(), // ISO date string
        })
      )
      .mutation(async ({ input }) => {
        return createLoan({
          bookId: input.bookId,
          memberId: input.memberId,
          dueDate: new Date(input.dueDate),
        });
      }),

    return: protectedProcedure
      .input(z.object({ loanId: z.number() }))
      .mutation(async ({ input }) => {
        return returnLoan(input.loanId, new Date());
      }),

    getOverdue: protectedProcedure.query(async () => {
      return getOverdueLoans();
    }),
  }),

  // ============ ANALYTICS ============
  analytics: router({
    getMostBorrowedBooks: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return getMostBorrowedBooks(input.limit);
      }),

    getMostActiveMembers: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return getMostActiveMembers(input.limit);
      }),

    getMonthlyTrends: protectedProcedure.query(async () => {
      return getMonthlyBorrowingTrends();
    }),
  }),
});

export type AppRouter = typeof appRouter;
