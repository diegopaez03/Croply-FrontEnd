# syntax=docker/dockerfile:1
# Croply frontend — React + Vite
#   docker compose  → target development (HMR)
#   deploy          → target production  (nginx)

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.4.1 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=croply-fe-pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ── Desarrollo (compose) ──────────────────────────────────────────
FROM base AS development
ENV NODE_ENV=development \
    CI=true \
    CHOKIDAR_USEPOLLING=true \
    CHOKIDAR_INTERVAL=300
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml .npmrc ./
EXPOSE 5173
CMD ["./node_modules/.bin/vite", "--host", "0.0.0.0"]

# ── Producción ────────────────────────────────────────────────────
FROM deps AS build
ARG VITE_API_BASE_URL=http://localhost:3000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_USE_MOCKS=false
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
