# Implementation Plan: SvelteKit Mock API Endpoints

We will create a structured and fully compliant set of API endpoints for the SvelteKit application using a mock memory store (`mockDb.ts`) that persists data in memory during local development.

## Steps

1. **Mock Database (`src/lib/server/mockDb.ts`)**: Define user, category, expense, and prefix data stores in memory.
2. **Auth Utilities (`src/lib/server/auth.ts`)**: JWT signing and verification, password hashing mock helpers, and custom middleware checking.
3. **Authentication Endpoints**:
   - `POST /api/auth/register` -> `src/routes/api/auth/register/+server.ts`
   - `POST /api/auth/login` -> `src/routes/api/auth/login/+server.ts`
4. **Categories Endpoints**:
   - `GET`/`POST` `/api/categories` -> `src/routes/api/categories/+server.ts`
   - `PUT`/`DELETE` `/api/categories/[id]` -> `src/routes/api/categories/[id]/+server.ts`
5. **Expenses Endpoints**:
   - `GET`/`POST` `/api/expenses` -> `src/routes/api/expenses/+server.ts`
   - `PUT`/`DELETE` `/api/expenses/[id]` -> `src/routes/api/expenses/[id]/+server.ts`
6. **Prefixes Endpoints**:
   - `GET`/`POST` `/api/prefixes` -> `src/routes/api/prefixes/+server.ts`
   - `DELETE` `/api/prefixes/[id]` -> `src/routes/api/prefixes/[id]/+server.ts`
7. **Analytics Endpoints**:
   - `GET` `/api/dashboard/stats` -> `src/routes/api/dashboard/stats/+server.ts`
