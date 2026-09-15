/**
 * Services barrel export.
 *
 * Each service wraps Axios calls for a specific API resource.
 * Services are consumed by TanStack Query hooks.
 *
 *   api.ts           — Axios instance configuration (base URL, interceptors)
 *   auth.service.ts  — /api/auth endpoints
 *   farms.service.ts — /api/farms endpoints
 *   crops.service.ts — /api/crops endpoints
 *   plots.service.ts — /api/plots endpoints
 *
 * Example exports:
 *   export { apiClient } from './api'
 *   export { authService } from './auth.service'
 */