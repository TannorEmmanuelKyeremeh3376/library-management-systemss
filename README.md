# Library Management Systems — Local Setup

Quick notes to run the database tasks locally.

Prerequisites
- Node.js, pnpm installed
- PostgreSQL running locally (note port in `postgresql.conf`)

Environment
- Create or update `.env` at the repository root with your DB URL:

  DATABASE_URL=postgresql://postgres:PASSWORD@HOST:PORT/library_db

  On Windows PowerShell you can set it for the current session:

  $env:DATABASE_URL="postgresql://postgres:PASSWORD@localhost:3376/library_db"

Drizzle / DB tasks
- Apply migrations:

  pnpm db:push

- Seed the database:

  pnpm db:seed

- Quick verification (counts):

  pnpm db:check

Notes
- The repository uses `drizzle-kit` and `drizzle-orm`. If `pnpm db:*` fails, try running with the env inline:

  $env:DATABASE_URL="postgresql://..."; pnpm db:push

- Passwords that contain `@` or other special characters must be URL-encoded (e.g. `@` -> `%40`).

If you want, I can add a `.env.example` or commit a PR with these changes.

CI
--
This repository includes a GitHub Actions workflow at `.github/workflows/db-migrations.yml` that runs `pnpm db:push` on pushes to `main` and via manual dispatch. Configure the repository secret `DATABASE_URL` in Settings → Secrets to allow the workflow to connect to your database.
