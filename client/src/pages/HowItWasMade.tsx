import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HowItWasMade() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-foreground">How It Was Made</h1>
        <p className="text-lg text-muted">
          A comprehensive overview of the Library Management System's architecture, technology stack, and design decisions.
        </p>
      </div>

      {/* Tech Stack */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Frontend</h3>
            <ul className="space-y-2 text-muted">
              <li><strong>React 19</strong> - Modern UI library with hooks and concurrent features</li>
              <li><strong>TypeScript</strong> - Type-safe JavaScript for robust code</li>
              <li><strong>Tailwind CSS 4</strong> - Utility-first CSS framework for elegant styling</li>
              <li><strong>shadcn/ui</strong> - High-quality, accessible component library</li>
              <li><strong>Recharts</strong> - Composable charting library for analytics</li>
              <li><strong>Wouter</strong> - Lightweight client-side routing</li>
              <li><strong>React Hook Form</strong> - Performant form handling</li>
              <li><strong>Zod</strong> - TypeScript-first schema validation</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Backend</h3>
            <ul className="space-y-2 text-muted">
              <li><strong>Express.js 4</strong> - Lightweight web framework</li>
              <li><strong>tRPC 11</strong> - End-to-end typesafe APIs</li>
              <li><strong>Drizzle ORM</strong> - TypeScript-first SQL ORM</li>
              <li><strong>MySQL</strong> - Relational database</li>
              <li><strong>Node.js</strong> - JavaScript runtime</li>
              <li><strong>Manus OAuth</strong> - Built-in authentication</li>
              <li><strong>Zod</strong> - Input validation and type inference</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Database Schema */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Database Schema</h2>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <p className="text-muted">
              The Library Management System uses a normalized relational database design with five core tables:
              <strong> users</strong>, <strong>books</strong>, <strong>members</strong>, <strong>loans</strong>, and <strong>transactions</strong>.
            </p>
            <p className="text-muted">
              This schema supports complete library operations including book management, member registration, borrowing tracking, and audit logging.
            </p>
          </TabsContent>

          <TabsContent value="tables" className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Users Table</h3>
              <p className="text-sm text-muted mb-3">Stores admin users with OAuth integration</p>
              <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm space-y-1">
                <div>id (INT, PRIMARY KEY)</div>
                <div>openId (VARCHAR, UNIQUE) - OAuth identifier</div>
                <div>name (TEXT)</div>
                <div>email (VARCHAR)</div>
                <div>role (ENUM: user, admin)</div>
                <div>createdAt, updatedAt, lastSignedIn (TIMESTAMP)</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-foreground">Books Table</h3>
              <p className="text-sm text-muted mb-3">Manages library book catalog</p>
              <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm space-y-1">
                <div>id (INT, PRIMARY KEY)</div>
                <div>title, author (VARCHAR) - Book metadata</div>
                <div>isbn (VARCHAR, UNIQUE) - International Standard Book Number</div>
                <div>genre, category (VARCHAR) - Classification</div>
                <div>publisher (VARCHAR), publishedYear (INT)</div>
                <div>totalCopies, availableCopies (INT) - Inventory tracking</div>
                <div>description (TEXT)</div>
                <div>createdAt, updatedAt (TIMESTAMP)</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-foreground">Members Table</h3>
              <p className="text-sm text-muted mb-3">Tracks library member information</p>
              <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm space-y-1">
                <div>id (INT, PRIMARY KEY)</div>
                <div>memberId (VARCHAR, UNIQUE) - Member identifier</div>
                <div>firstName, lastName (VARCHAR)</div>
                <div>email (VARCHAR), phone (VARCHAR)</div>
                <div>address (TEXT)</div>
                <div>joinDate (TIMESTAMP)</div>
                <div>status (ENUM: active, inactive, suspended)</div>
                <div>createdAt, updatedAt (TIMESTAMP)</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-foreground">Loans Table</h3>
              <p className="text-sm text-muted mb-3">Records book borrowing transactions</p>
              <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm space-y-1">
                <div>id (INT, PRIMARY KEY)</div>
                <div>bookId (INT) - Foreign key to books</div>
                <div>memberId (INT) - Foreign key to members</div>
                <div>borrowDate (TIMESTAMP) - When book was borrowed</div>
                <div>dueDate (DATE) - When book is due</div>
                <div>returnDate (DATE) - When book was returned</div>
                <div>status (ENUM: active, returned, overdue)</div>
                <div>isOverdue (BOOLEAN) - Overdue flag</div>
                <div>createdAt, updatedAt (TIMESTAMP)</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-foreground">Transactions Table</h3>
              <p className="text-sm text-muted mb-3">Audit trail of all library operations</p>
              <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm space-y-1">
                <div>id (INT, PRIMARY KEY)</div>
                <div>type (ENUM: borrow, return, fine, book_added, book_deleted, member_registered)</div>
                <div>bookId, memberId, loanId (INT) - Related entity IDs</div>
                <div>amount (DECIMAL) - For fine transactions</div>
                <div>description (TEXT) - Transaction details</div>
                <div>createdAt (TIMESTAMP)</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-4">
            <p className="text-muted">
              The database uses foreign key relationships to maintain referential integrity:
            </p>
            <ul className="space-y-3 text-muted">
              <li><strong>Loans → Books:</strong> Each loan references a book through bookId</li>
              <li><strong>Loans → Members:</strong> Each loan references a member through memberId</li>
              <li><strong>Transactions → Books:</strong> Transaction records reference books for audit trail</li>
              <li><strong>Transactions → Members:</strong> Transaction records reference members for audit trail</li>
              <li><strong>Transactions → Loans:</strong> Borrow/return transactions reference specific loans</li>
            </ul>
            <p className="text-muted mt-4">
              This design ensures data consistency and enables comprehensive reporting and analytics across all library operations.
            </p>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Architecture */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Architecture Decisions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-foreground">tRPC for Type Safety</h3>
            <p className="text-muted">
              We chose tRPC to ensure end-to-end type safety between frontend and backend. This eliminates entire categories of bugs related to API contracts and provides excellent developer experience with auto-completion and type checking.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-foreground">Drizzle ORM for Database</h3>
            <p className="text-muted">
              Drizzle ORM provides a TypeScript-first approach to database queries with excellent type inference from the schema. This ensures database operations are type-safe and prevents SQL injection vulnerabilities.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-foreground">Component-Based UI</h3>
            <p className="text-muted">
              The frontend uses shadcn/ui components combined with Tailwind CSS for a consistent, elegant design system. This approach allows rapid development while maintaining visual polish and accessibility standards.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-foreground">Normalized Database Schema</h3>
            <p className="text-muted">
              The database follows normalization principles to eliminate data redundancy and ensure data integrity. Separate tables for books, members, and loans enable flexible querying and reporting.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-foreground">Audit Trail with Transactions</h3>
            <p className="text-muted">
              Every significant operation (book added, borrowed, returned) is recorded in the transactions table. This provides a complete audit trail for compliance and troubleshooting.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-foreground">Real-Time Overdue Tracking</h3>
            <p className="text-muted">
              The system automatically detects overdue loans by comparing due dates with the current date. The dashboard displays overdue alerts prominently to ensure timely action.
            </p>
          </div>
        </div>
      </Card>

      {/* Key Features */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Key Features Implementation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Dashboard</h3>
            <p className="text-sm text-muted">Real-time statistics showing total books, active borrows, overdue items, and registered members with visual alerts for overdue loans.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Book Management</h3>
            <p className="text-sm text-muted">Full CRUD operations with search by title/author/ISBN and filtering by genre/category. Tracks available copies automatically.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Member Management</h3>
            <p className="text-sm text-muted">Register and manage library members with complete borrowing history tracking. View member details and borrowing patterns.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Borrowing System</h3>
            <p className="text-sm text-muted">Checkout and return books with automatic inventory management. Due date configuration and overdue detection.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Analytics</h3>
            <p className="text-sm text-muted">Charts showing most borrowed books, most active members, and monthly borrowing trends for data-driven insights.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Audit Trail</h3>
            <p className="text-sm text-muted">Complete transaction history for compliance and troubleshooting. Track all operations with timestamps and descriptions.</p>
          </div>
        </div>
      </Card>

      {/* Development Workflow */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Development Workflow</h2>
        <ol className="space-y-4 text-muted list-decimal list-inside">
          <li><strong>Schema Design:</strong> Define database tables in Drizzle schema with proper types and constraints</li>
          <li><strong>Migration:</strong> Generate and apply SQL migrations to create tables</li>
          <li><strong>Database Helpers:</strong> Implement query functions in server/db.ts for reusable database operations</li>
          <li><strong>tRPC Procedures:</strong> Create procedures in server/routers.ts that use database helpers and validate inputs with Zod</li>
          <li><strong>Frontend Pages:</strong> Build React components that call tRPC procedures and display results</li>
          <li><strong>Styling:</strong> Use Tailwind CSS and shadcn/ui components for consistent, elegant design</li>
          <li><strong>Testing:</strong> Write Vitest tests for critical business logic and API contracts</li>
        </ol>
      </Card>
    </div>
  );
}
