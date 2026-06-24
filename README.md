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

Docker Deployment
--
This app is a custom Express + Vite service, so the easiest deployment path is via Docker.

1. Build locally:

   ```powershell
   pnpm install
   pnpm build
   ```

2. Run locally with a database URL:

   ```powershell
   $env:DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/library_db"
   pnpm start
   ```

3. Build and run with Docker:

   ```powershell
   docker build -t library-management-system .
   docker run -p 3000:3000 -e DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/library_db" library-management-system
   ```

Recommended deployment hosts:
- Render
- Railway
- Fly.io

On those hosts, choose a Docker-based service and set `DATABASE_URL` as a secret environment variable.

Render Deployment
--
For Render, use the Dockerfile and then configure:

- Service type: Web Service
- Environment: Docker
- Build command: `pnpm install && pnpm build`
- Start command: `pnpm start`
- Port: `3000`
- Set `DATABASE_URL` as an environment secret

Render Infrastructure as Code
--
This repo includes a `render.yaml` that describes the service and secret-backed `DATABASE_URL`.

To deploy with Render using this file:

1. Connect your GitHub repository in Render
2. Add `DATABASE_URL` to Render Secrets
3. Use the built-in Render YAML option to deploy from `render.yaml`

The included `render.yaml` is configured to deploy the `main` branch using Docker.
