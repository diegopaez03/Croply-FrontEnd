# ──────────────────────────────────────────────────────────────────
#  Croply Frontend — Dockerfile (Development)
#  Runs Vite dev server with HMR (Hot Module Replacement).
# ──────────────────────────────────────────────────────────────────

# ── Base image ────────────────────────────────────────────────────
FROM node:24.15.0-alpine AS base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ── Dependencies layer (cached) ───────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ── Development stage (HMR) ───────────────────────────────────────
FROM base AS development

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Expose Vite default dev server port
EXPOSE 5173

# Start Vite dev server, binding to all interfaces so Docker can
# forward the port correctly
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
