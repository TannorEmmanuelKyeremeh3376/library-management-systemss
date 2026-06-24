# Use a Node LTS base image
FROM node:26-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build the client assets
RUN pnpm exec vite build --config vite.config.ts

# Production image
FROM node:26-alpine AS prod
WORKDIR /app
COPY --from=base /app .

EXPOSE 3000
ENV NODE_ENV=production

CMD ["pnpm", "start"]
