# Thai Compliance Implementation Specification

**Project:** Expense Tracking App  
**Created:** 2026-06-01  
**Status:** Planning Phase  
**Priority:** 🔴 CRITICAL (Legal Requirement)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Compliance Requirements](#compliance-requirements)
3. [Architecture Overview](#architecture-overview)
4. [Phase 1: Logging System (90-Day Retention)](#phase-1-logging-system)
5. [Phase 2: Security Hardening](#phase-2-security-hardening)
6. [Database Schema](#database-schema)
7. [API Modifications](#api-modifications)
8. [Implementation Details](#implementation-details)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Plan](#deployment-plan)
11. [Risk Assessment](#risk-assessment)

---

## Executive Summary

This specification outlines the implementation of Thai legal compliance requirements for the expense-tracking application:

| Requirement | Source | Status | Deadline |
|-------------|--------|--------|----------|
| 90-day log retention | พ.ร.บ. คอมพิวเตอร์ (Section 26) | ⚠️ Not implemented | ASAP |
| Rate limiting | พ.ร.บ. ความมั่นคงปลอดภัยไซเบอร์ | ⚠️ Not implemented | ASAP |
| Security headers | Cybersecurity Act | ⚠️ Not implemented | ASAP |
| Server-side validation | Data protection best practice | ⚠️ Not implemented | ASAP |

**Total Implementation Effort:** 11-12 hours  
**New Dependencies:** 2 packages (zod, express-rate-limit)  
**Breaking Changes:** None (backward compatible)

---

## Compliance Requirements

### 🔴 Requirement 1: Thai Computer Crime Act (Section 26)

**Legal Mandate:** "All systems must retain transaction logs for 90 days minimum."

**What Must Be Logged:**
- ✅ User login events (successful and failed)
- ✅ Data creation (POST /api/expenses, POST /api/categories)
- ✅ Data modification (PUT /api/expenses/[id], PUT /api/categories/[id])
- ✅ Data deletion (DELETE /api/expenses/[id], DELETE /api/categories/[id])
- ✅ User logout events

**Minimum Log Fields:**
- IP Address (from X-Forwarded-For or X-Real-IP header)
- User ID (who performed the action)
- Timestamp (when action occurred, UTC)
- Action (LOGIN, CREATE_EXPENSE, UPDATE_EXPENSE, etc.)
- Request details (what was sent)
- Response status (success/failure code)

**Retention Policy:**
- Keep logs for minimum 90 days
- Logs older than 90 days are automatically deleted
- Deletion must not be manual (must be automated)
- Logs are immutable (no editing, only viewing)

**Penalty for Non-Compliance:**
- Criminal charges under Thai Computer Crime Act
- Administrative fines
- Business license suspension

---

### 🟠 Requirement 2: Thai Cybersecurity Protection Act

**Legal Mandate:** "Systems must implement reasonable security measures to prevent data breaches."

**Security Controls Required:**

#### A. Rate Limiting (Brute-Force Prevention)
- **Requirement:** Limit login attempts to prevent password guessing
- **Implementation:** 5 failed login attempts per 15 minutes = 15-minute lockout
- **Why:** Prevents automated attacks on user accounts

#### B. HTTP Security Headers
- **Requirement:** Prevent common web attacks (XSS, Clickjacking, etc.)
- **Headers needed:**
  - `Content-Security-Policy` (prevents XSS)
  - `Strict-Transport-Security` (forces HTTPS)
  - `X-Content-Type-Options` (prevents MIME-type sniffing)
  - `X-Frame-Options` (prevents clickjacking)
  - `Referrer-Policy` (controls referrer leakage)
  - `Permissions-Policy` (blocks unnecessary APIs)

#### C. Server-Side Validation
- **Requirement:** Validate all inputs on the server, not just client
- **Why:** Client-side validation can be bypassed; attackers can send malicious data directly to API
- **Implementation:** Zod schemas for all request bodies

#### D. Input Sanitization
- **Requirement:** Remove/escape dangerous HTML/SQL from user inputs
- **Why:** Prevents XSS (Cross-Site Scripting) and injection attacks
- **Implementation:** Escape special characters; remove HTML tags from user descriptions

---

## Architecture Overview

### Current Stack
- **Framework:** SvelteKit
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** @auth/sveltekit (good — using industry standard)
- **Existing Security:** SQL injection protection (Prisma), session management (@auth/sveltekit)

### What's Missing
❌ No audit logging system  
❌ No rate limiting  
❌ No HTTP security headers  
❌ No server-side input validation (only client-side)  
❌ No input sanitization

### Solution Architecture

```
User Request
    ↓
┌─────────────────────────────────────────┐
│ hooks.server.ts (Middleware Chain)      │
├─────────────────────────────────────────┤
│ 1. loggingHandle (capture IP, headers)  │ ← NEW
│ 2. httpsRedirectHandle (HTTP→HTTPS)     │ ← NEW (Phase 2)
│ 3. securityHeadersHandle (set headers)  │ ← NEW (Phase 2)
│ 4. authHandle (authenticate)            │ EXISTING
│ 5. authorizationHandle (authorize)      │ EXISTING
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ API Endpoint Handler                    │
├─────────────────────────────────────────┤
│ 1. checkRateLimit() [Phase 2]           │ ← NEW
│ 2. validateInput() [Phase 2]            │ ← NEW (Zod schema)
│ 3. sanitizeInput() [Phase 2]            │ ← NEW
│ 4. Prisma operation (CREATE/UPDATE/DELETE)
│ 5. logAuditEvent() [Phase 1]            │ ← NEW
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Database                                │
├─────────────────────────────────────────┤
│ expenses (existing)                     │
│ categories (existing)                   │
│ audit_logs (NEW)                        │ ← Phase 1
│ rate_limit_records (in-memory)          │ ← Phase 2
└─────────────────────────────────────────┘
```

---

## Phase 1: Logging System

### Objective
Implement a 90-day audit logging system that captures all significant events.

### 1.1 Database Schema Changes

#### New Table: `audit_logs`

```prisma
model AuditLog {
  id          String    @id @default(cuid())
  userId      String?   @map("user_id")
  ipAddress   String?   @map("ip_address")
  action      String    // "LOGIN", "LOGOUT", "CREATE_EXPENSE", etc.
  resource    String?   // "Expense", "Category", "User"
  resourceId  String?   @map("resource_id")
  requestBody String?   @map("request_body") @db.Text
  responseStatus Int?   @map("response_status")
  errorMessage String? @map("error_message")
  userAgent   String?   @map("user_agent")
  timestamp   DateTime  @default(now()) @db.Timestamp()

  // Indexes for query performance
  @@index([userId, timestamp(sort: Desc)], name: "idx_audit_user_date")
  @@index([action], name: "idx_audit_action")
  @@index([timestamp(sort: Desc)], name: "idx_audit_timestamp")
  @@map("audit_logs")
}
```

**Column Explanations:**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| `id` | String (CUID) | Unique log identifier | `clh9a8fk0...` |
| `userId` | String | Who performed the action | `auth_user_123` |
| `ipAddress` | String | Where request came from | `203.0.113.45` |
| `action` | String | What was done | `CREATE_EXPENSE` |
| `resource` | String | What was affected | `Expense` |
| `resourceId` | String | Which record was affected | `65f9c8a2b...` |
| `requestBody` | Text (JSON) | Full request data (for audit trail) | `{"amount": 500, "description": "..."}` |
| `responseStatus` | Int | HTTP response code | `201`, `400`, `500` |
| `errorMessage` | String | Error description if failed | `"Invalid amount"` |
| `userAgent` | String | Browser/client info | `"Mozilla/5.0..."` |
| `timestamp` | DateTime | When action occurred | `2026-06-01 14:30:00 UTC` |

**Indexes:**
- `idx_audit_user_date`: Fast lookup of user's action history
- `idx_audit_action`: Quick aggregation by action type (e.g., count logins)
- `idx_audit_timestamp`: Enables efficient 90-day cleanup queries

### 1.2 Logger Service

**File:** `src/lib/server/logger.ts`

```typescript
interface AuditEventPayload {
  userId?: string;
  ipAddress?: string;
  action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'CREATE_EXPENSE' | 
          'UPDATE_EXPENSE' | 'DELETE_EXPENSE' | 'CREATE_CATEGORY' | 
          'UPDATE_CATEGORY' | 'DELETE_CATEGORY';
  resource?: 'Expense' | 'Category' | 'User';
  resourceId?: string;
  requestBody?: Record<string, any>;
  responseStatus?: number;
  errorMessage?: string;
  userAgent?: string;
}

export async function logAuditEvent(payload: AuditEventPayload): Promise<void> {
  // Implementation details in Phase 1.3
}

export function extractClientIp(headers: Headers): string | undefined {
  // Check X-Forwarded-For first (for proxied requests)
  // Then X-Real-IP (Nginx)
  // Then socket IP
}

export function getResourceInfo(action: string): { resource?: string; action: string } {
  // Parse action string to extract resource type
  // e.g., "CREATE_EXPENSE" → { resource: "Expense", action: "CREATE_EXPENSE" }
}
```

**Key Functions:**
- `logAuditEvent()`: Insert log record into database
- `extractClientIp()`: Get client IP from request headers (handles proxies, load balancers)
- `getResourceInfo()`: Parse action to extract resource type

### 1.3 Middleware Integration

**File:** `src/hooks.server.ts`

```typescript
import { sequence, type Handle } from '@sveltejs/kit';
import { logAuditEvent, extractClientIp } from '$lib/server/logger';

const loggingHandle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Non-blocking async logging
  const clientIp = extractClientIp(event.request.headers);
  const userAgent = event.request.headers.get('user-agent') || undefined;
  
  // Log after response (don't block response on logging)
  logAuditEvent({
    ipAddress: clientIp,
    userAgent,
    // Additional fields set by endpoint handlers
  }).catch(err => {
    console.error('Audit log failed:', err);
    // Log failure but don't crash
  });
  
  return response;
};

export const handle = sequence(
  loggingHandle,
  authHandle,
  authorizationHandle
);
```

### 1.4 API Endpoint Instrumentation

**Pattern for All Endpoints:**

```typescript
// Example: POST /api/expenses (+server.ts)
export async function POST({ request, locals, getClientAddress }): Promise<Response> {
  const user = await authenticate(locals);
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  
  const { amount, description, transaction_date, category_id } = await request.json();
  
  try {
    // Create expense
    const expense = await prisma.expense.create({
      data: { userId: user.id, amount, description, transaction_date, category_id }
    });
    
    // Log success
    await logAuditEvent({
      userId: user.id,
      ipAddress: getClientAddress(),
      action: 'CREATE_EXPENSE',
      resource: 'Expense',
      resourceId: String(expense.id),
      requestBody: { amount, description, transaction_date, category_id },
      responseStatus: 201,
      userAgent: request.headers.get('user-agent') || undefined
    });
    
    return json(expense, { status: 201 });
  } catch (error) {
    // Log failure
    await logAuditEvent({
      userId: user.id,
      ipAddress: getClientAddress(),
      action: 'CREATE_EXPENSE',
      resource: 'Expense',
      responseStatus: 500,
      errorMessage: error.message,
      userAgent: request.headers.get('user-agent') || undefined
    });
    
    return json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
```

**Endpoints to Instrument (8 total):**

1. **POST /api/expenses** (create expense)
2. **PUT /api/expenses/[id]** (update expense)
3. **DELETE /api/expenses/[id]** (delete expense)
4. **POST /api/categories** (create category)
5. **PUT /api/categories/[id]** (update category)
6. **DELETE /api/categories/[id]** (delete category)
7. **POST /api/auth/login** (login)
8. **POST /api/auth/logout** (logout)

### 1.5 Authentication Logging

**File:** `src/routes/api/auth/login/+server.ts`

```typescript
// Log successful login
await logAuditEvent({
  userId: user.id,
  ipAddress: getClientAddress(),
  action: 'LOGIN',
  responseStatus: 200,
  userAgent: request.headers.get('user-agent') || undefined
});

// Log failed login attempt (no userId, just email for audit)
await logAuditEvent({
  ipAddress: getClientAddress(),
  action: 'LOGIN_FAILED',
  errorMessage: 'Invalid credentials',
  responseStatus: 401,
  userAgent: request.headers.get('user-agent') || undefined
});
```

### 1.6 Log Cleanup Service (90-Day Retention)

**File:** `src/lib/server/logCleanup.ts`

```typescript
import { prisma } from '$lib/server/prisma';

export async function cleanupOldLogs(): Promise<{ deletedCount: number }> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const result = await prisma.auditLog.deleteMany({
    where: {
      timestamp: { lt: ninetyDaysAgo }
    }
  });
  
  return { deletedCount: result.count };
}
```

**Production Deployment (Node Cron):**

**File:** `scripts/cleanup-logs.js`

```javascript
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Run daily at 2:00 AM UTC
cron.schedule('0 2 * * *', async () => {
  console.log('[Audit Log Cleanup] Starting cleanup task...');
  
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const result = await prisma.auditLog.deleteMany({
    where: { timestamp: { lt: ninetyDaysAgo } }
  });
  
  console.log(`[Audit Log Cleanup] Deleted ${result.count} logs older than 90 days`);
  
  await prisma.$disconnect();
});

console.log('[Audit Log Cleanup] Scheduled for daily 2:00 AM UTC');
```

**npm Scripts:**

```json
{
  "scripts": {
    "cleanup-logs": "node scripts/cleanup-logs.js",
    "cleanup-logs:dry-run": "LOG_DRY_RUN=true node scripts/cleanup-logs.js",
    "migrate": "prisma migrate deploy",
    "migrate:dev": "prisma migrate dev"
  }
}
```

### 1.7 Phase 1 Queries

**Query Examples for Compliance Audits:**

```sql
-- All login attempts by user in last 7 days
SELECT * FROM audit_logs 
WHERE userId = 'user_123' 
  AND action IN ('LOGIN', 'LOGIN_FAILED')
  AND timestamp >= NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

-- All data modifications in last 30 days
SELECT * FROM audit_logs 
WHERE action IN ('CREATE_EXPENSE', 'UPDATE_EXPENSE', 'DELETE_EXPENSE')
  AND timestamp >= NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC;

-- Suspicious login attempts (5+ failed in 15 min from same IP)
SELECT ipAddress, COUNT(*) as attempt_count, timestamp
FROM audit_logs 
WHERE action = 'LOGIN_FAILED'
  AND timestamp >= NOW() - INTERVAL '15 minutes'
GROUP BY ipAddress, timestamp
HAVING COUNT(*) >= 5;

-- Data deletion audit trail
SELECT userId, resourceId, requestBody, timestamp FROM audit_logs
WHERE action = 'DELETE_EXPENSE'
ORDER BY timestamp DESC;

-- Verify 90-day retention
SELECT COUNT(*) as total_logs, 
       MIN(timestamp) as oldest_log,
       MAX(timestamp) as newest_log
FROM audit_logs;
```

---

## Phase 2: Security Hardening

### Objective
Implement rate limiting, security headers, server-side validation, and input sanitization.

### 2.1 Rate Limiting

**File:** `src/lib/server/rateLimiter.ts`

**Design:**
- In-memory rate limiter for login attempts
- Per-IP tracking of failed attempts
- 5 failed attempts per 15 minutes = 15-minute lockout

**Implementation:**

```typescript
interface RateLimitRecord {
  ipAddress: string;
  action: 'login';
  attempts: number;
  lastAttempt: Date;
  blockedUntil?: Date;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkLoginRateLimit(ipAddress: string): { 
  allowed: boolean; 
  remainingAttempts?: number; 
  blockedUntilMs?: number 
} {
  const now = new Date();
  const key = `login:${ipAddress}`;
  
  let record = rateLimitStore.get(key);
  
  // Clean up old entries
  if (record && now.getTime() - record.lastAttempt.getTime() > 15 * 60 * 1000) {
    rateLimitStore.delete(key);
    record = undefined;
  }
  
  if (!record) {
    // First attempt in this window
    return { allowed: true, remainingAttempts: 5 };
  }
  
  // Check if currently blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    return {
      allowed: false,
      blockedUntilMs: record.blockedUntil.getTime() - now.getTime()
    };
  }
  
  // Increment attempt counter
  record.attempts += 1;
  record.lastAttempt = now;
  
  if (record.attempts > 5) {
    record.blockedUntil = new Date(now.getTime() + 15 * 60 * 1000);
    return { allowed: false, blockedUntilMs: 15 * 60 * 1000 };
  }
  
  return { allowed: true, remainingAttempts: 5 - record.attempts };
}

export function recordLoginSuccess(ipAddress: string): void {
  const key = `login:${ipAddress}`;
  rateLimitStore.delete(key); // Reset on success
}
```

**HTTP Response for Rate Limit:**

```typescript
// In login endpoint
const rateLimit = checkLoginRateLimit(ipAddress);
if (!rateLimit.allowed) {
  return json(
    { 
      error: 'Too many login attempts. Try again later.',
      retryAfter: Math.ceil(rateLimit.blockedUntilMs / 1000)
    },
    { 
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(rateLimit.blockedUntilMs / 1000)) }
    }
  );
}
```

### 2.2 HTTP Security Headers

**File:** `src/hooks.server.ts`

```typescript
const securityHeadersHandle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "font-src 'self';" +
    "connect-src 'self';" +
    "frame-ancestors 'none';"
  );
  
  // HTTPS enforcement (Strict-Transport-Security)
  response.headers.set('Strict-Transport-Security', 
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Prevent MIME-type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent referrer leakage
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restrict APIs
  response.headers.set('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), usb=()'
  );
  
  return response;
};
```

**Header Explanations:**

| Header | Purpose | Value |
|--------|---------|-------|
| CSP | Prevent XSS attacks | Only load scripts from same domain |
| HSTS | Force HTTPS | Require HTTPS for 1 year |
| X-Content-Type-Options | Prevent MIME sniffing | Strict MIME-type checking |
| X-Frame-Options | Prevent clickjacking | Block embedding in iframes |
| Referrer-Policy | Privacy | Don't leak referrer to cross-origin |
| Permissions-Policy | API control | Block camera, microphone, etc. |

### 2.3 Server-Side Input Validation (Zod)

**File:** `src/lib/server/validation.ts`

```typescript
import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long')
});

// Expense schemas
export const createExpenseSchema = z.object({
  description: z.string()
    .min(1, 'Description required')
    .max(500, 'Description too long'),
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999, 'Amount too large'),
  transaction_date: z.string()
    .refine(val => !isNaN(Date.parse(val)), 'Invalid date format'),
  category_id: z.number().int().optional()
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  id: z.number().int().positive()
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'Category name required')
    .max(100, 'Category name too long'),
  monthlyLimit: z.number()
    .positive('Monthly limit must be positive')
    .optional()
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.number().int().positive()
});
```

**Usage in Endpoints:**

```typescript
export async function POST({ request, locals }) {
  const user = await authenticate(locals);
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await request.json();
  
  // Validate with Zod
  const validation = createExpenseSchema.safeParse(body);
  if (!validation.success) {
    return json(
      { 
        error: 'Validation failed',
        details: validation.error.errors
      },
      { status: 400 }
    );
  }
  
  const { description, amount, transaction_date, category_id } = validation.data;
  
  // ... proceed with valid data
}
```

### 2.4 Input Sanitization

**File:** `src/lib/server/sanitize.ts`

```typescript
/**
 * Sanitize a string by removing HTML tags and escaping special characters
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;')  // Escape &
    .replace(/</g, '&lt;')   // Escape <
    .replace(/>/g, '&gt;')   // Escape >
    .replace(/"/g, '&quot;') // Escape "
    .replace(/'/g, '&#x27;'); // Escape '
}

/**
 * Sanitize all string fields in an object
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => typeof v === 'string' ? sanitizeString(v) : v);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
```

**Usage:**

```typescript
const validated = createExpenseSchema.safeParse(body);
if (validated.success) {
  const sanitized = sanitizeObject(validated.data);
  // Use sanitized data
}
```

### 2.5 HTTPS Enforcement

```typescript
const httpsRedirectHandle: Handle = async ({ event, resolve }) => {
  if (process.env.NODE_ENV === 'production') {
    if (event.url.protocol === 'http:') {
      const httpsUrl = event.url.toString().replace('http:', 'https:');
      redirect(301, httpsUrl);
    }
  }
  return resolve(event);
};

export const handle = sequence(
  httpsRedirectHandle,
  loggingHandle,
  securityHeadersHandle,
  authHandle,
  authorizationHandle
);
```

---

## Database Schema

### Full Updated Schema (excerpt)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    String  @id @default(cuid())
  email String  @unique
  name  String?
  // ... existing fields
}

model Expense {
  id              Int     @id @default(autoincrement())
  userId          String
  description     String
  amount          Decimal @db.Decimal(10, 2)
  transaction_date DateTime
  category_id     Int?
  created_at      DateTime @default(now())
  updated_at      DateTime @updatedAt

  user     User?       @relation(fields: [userId], references: [id])
  category Category?   @relation(fields: [category_id], references: [id])

  @@index([userId, transaction_date])
  @@map("expenses")
}

model Category {
  id           Int      @id @default(autoincrement())
  userId       String
  name         String
  monthlyLimit Decimal? @db.Decimal(10, 2)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id])
  expenses Expense[]

  @@unique([userId, name])
  @@map("categories")
}

// NEW: Audit logging
model AuditLog {
  id          String    @id @default(cuid())
  userId      String?   @map("user_id")
  ipAddress   String?   @map("ip_address")
  action      String
  resource    String?
  resourceId  String?   @map("resource_id")
  requestBody String?   @map("request_body") @db.Text
  responseStatus Int?   @map("response_status")
  errorMessage String? @map("error_message")
  userAgent   String?   @map("user_agent")
  timestamp   DateTime  @default(now()) @db.Timestamp()

  @@index([userId, timestamp(sort: Desc)], name: "idx_audit_user_date")
  @@index([action], name: "idx_audit_action")
  @@index([timestamp(sort: Desc)], name: "idx_audit_timestamp")
  @@map("audit_logs")
}
```

---

## API Modifications

### Endpoints Requiring Instrumentation

#### Authentication Endpoints

**POST /api/auth/login**
- Validate with `loginSchema` (Phase 2)
- Check rate limit (Phase 2)
- Log LOGIN or LOGIN_FAILED (Phase 1)

**POST /api/auth/logout**
- Log LOGOUT (Phase 1)

#### Expense Endpoints

**POST /api/expenses** (Create)
- Validate with `createExpenseSchema` (Phase 2)
- Sanitize inputs (Phase 2)
- Create expense (existing)
- Log CREATE_EXPENSE (Phase 1)

**PUT /api/expenses/[id]** (Update)
- Validate with `updateExpenseSchema` (Phase 2)
- Sanitize inputs (Phase 2)
- Update expense (existing)
- Log UPDATE_EXPENSE (Phase 1)

**DELETE /api/expenses/[id]** (Delete)
- Delete expense (existing)
- Log DELETE_EXPENSE (Phase 1)

#### Category Endpoints

**POST /api/categories** (Create)
- Validate with `createCategorySchema` (Phase 2)
- Sanitize inputs (Phase 2)
- Create category (existing)
- Log CREATE_CATEGORY (Phase 1)

**PUT /api/categories/[id]** (Update)
- Validate with `updateCategorySchema` (Phase 2)
- Sanitize inputs (Phase 2)
- Update category (existing)
- Log UPDATE_CATEGORY (Phase 1)

**DELETE /api/categories/[id]** (Delete)
- Delete category (existing)
- Log DELETE_CATEGORY (Phase 1)

### Error Responses

**Rate Limit (429):**

```json
{
  "error": "Too many login attempts. Try again later.",
  "retryAfter": 900
}
```

**Validation Error (400):**

```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "path": ["description"],
      "message": "Description required"
    }
  ]
}
```

---

## Implementation Details

### File Structure

```
src/
├── lib/
│   └── server/
│       ├── logger.ts              [NEW - Phase 1]
│       ├── logCleanup.ts          [NEW - Phase 1]
│       ├── rateLimiter.ts         [NEW - Phase 2]
│       ├── validation.ts          [NEW - Phase 2]
│       └── sanitize.ts            [NEW - Phase 2]
├── routes/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/+server.ts   [MODIFY - Phase 1 & 2]
│   │   │   └── logout/+server.ts  [MODIFY - Phase 1]
│   │   ├── expenses/
│   │   │   ├── +server.ts         [MODIFY - Phase 1 & 2]
│   │   │   └── [id]/+server.ts    [MODIFY - Phase 1 & 2]
│   │   └── categories/
│   │       ├── +server.ts         [MODIFY - Phase 1 & 2]
│   │       └── [id]/+server.ts    [MODIFY - Phase 1 & 2]
│   └── hooks.server.ts            [MODIFY - Phase 1 & 2]
├── prisma/
│   ├── schema.prisma              [MODIFY - Phase 1]
│   └── migrations/
│       └── [timestamp]_add_audit_logs/
│           └── migration.sql       [NEW - Phase 1]
├── scripts/
│   └── cleanup-logs.js            [NEW - Phase 1 (production)]
├── docs/
│   └── SECURITY.md                [NEW - Phase 2]
└── package.json                   [MODIFY - Phase 1 & 2]
```

### Dependencies to Install

**Phase 1:** None (use Prisma directly)

**Phase 2:**

```bash
npm install --save zod
npm install --save express-rate-limit
npm install --save-dev node-cron  # For production cronjob
```

### Migration Strategy

**Development:**

```bash
npx prisma migrate dev --name add_audit_logs
```

**Production (Vercel):**

```bash
npx prisma migrate deploy
```

Add to Vercel build script if needed:
```json
{
  "scripts": {
    "build": "vite build && prisma migrate deploy"
  }
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

#### Logger Tests
```typescript
// src/lib/server/logger.test.ts
describe('Logger Service', () => {
  test('extractClientIp should handle X-Forwarded-For header');
  test('logAuditEvent should create log record in database');
  test('logAuditEvent should handle concurrent calls');
});
```

#### Rate Limiter Tests
```typescript
// src/lib/server/rateLimiter.test.ts
describe('Rate Limiter', () => {
  test('should allow first 5 login attempts');
  test('should block 6th attempt within 15 minutes');
  test('should reset after 15 minutes');
  test('should reset on successful login');
});
```

#### Validation Tests
```typescript
// src/lib/server/validation.test.ts
describe('Zod Schemas', () => {
  test('loginSchema should reject invalid email');
  test('loginSchema should reject short password');
  test('createExpenseSchema should reject negative amount');
  test('createExpenseSchema should require description');
});
```

#### Sanitization Tests
```typescript
// src/lib/server/sanitize.test.ts
describe('Sanitization', () => {
  test('should remove HTML tags');
  test('should escape special characters');
  test('should handle nested objects');
});
```

### Integration Tests

#### Authentication
```typescript
// src/routes/api/auth/login/+server.test.ts
describe('Login Endpoint', () => {
  test('should log successful login');
  test('should log failed login (5 attempts)');
  test('should block on 6th attempt (rate limit)');
  test('should validate email format');
  test('should return 429 when rate limited');
});
```

#### Expense CRUD
```typescript
// src/routes/api/expenses/+server.test.ts
describe('Expense Endpoints', () => {
  test('POST should create log entry');
  test('PUT should create log entry');
  test('DELETE should create log entry');
  test('should validate amount is positive');
  test('should reject XSS in description');
});
```

### Manual Testing Checklist

**Phase 1 - Logging:**
- [ ] Login creates audit log entry
- [ ] Failed login attempts create audit log entries
- [ ] Create expense creates audit log entry
- [ ] Update expense creates audit log entry
- [ ] Delete expense creates audit log entry
- [ ] Create category creates audit log entry
- [ ] Update category creates audit log entry
- [ ] Delete category creates audit log entry
- [ ] Audit log contains userId, ipAddress, action, timestamp
- [ ] Logs older than 90 days are automatically deleted

**Phase 2 - Security:**
- [ ] 6th login attempt blocked with 429 status
- [ ] Response includes Retry-After header
- [ ] Security headers present in all responses
- [ ] CSP header prevents inline script execution
- [ ] HSTS header forces HTTPS
- [ ] Invalid email format rejected (400)
- [ ] Missing required fields rejected (400)
- [ ] Negative amount rejected (400)
- [ ] HTML tags removed from description
- [ ] XSS payload in description is sanitized

### Performance Testing

**Audit Log Queries (should be fast):**
```sql
-- Get user's recent actions (should be <100ms)
SELECT * FROM audit_logs WHERE userId = ? ORDER BY timestamp DESC LIMIT 100;

-- Cleanup query (should be <1s for typical volume)
DELETE FROM audit_logs WHERE timestamp < ?;
```

**Database Growth:**
- Estimate: ~10-50 KB per log entry (with request body)
- Expected volume: 100-500 logs per day
- 90-day storage: ~3-20 GB (manageable for Neon)

---

## Deployment Plan

### Development Deployment

1. Create Prisma migration locally
2. Run `npx prisma migrate dev`
3. Test logging locally with manual requests
4. Verify rate limiting with curl/Postman
5. Check security headers with DevTools

### Production Deployment (Vercel)

**Prerequisites:**
- Environment variables configured in Vercel dashboard
- DATABASE_URL set correctly

**Steps:**
1. Merge PR to main
2. Vercel auto-runs build
3. During build, Prisma runs migrations (`npx prisma migrate deploy`)
4. New code deployed with logging active
5. Monitor audit logs for any issues

**Cronjob Setup (90-day cleanup):**

**Option A: External Cron Service (EasyCron)**
- Create serverless function: `/api/cron/cleanup-logs`
- Call from EasyCron daily at 2 AM UTC

**Option B: Vercel Cron (Beta)**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup-logs",
    "schedule": "0 2 * * *"
  }]
}
```

**Option C: Separate Node.js Worker**
```bash
# Deploy scripts/cleanup-logs.js to separate Node.js server
node scripts/cleanup-logs.js
```

### Rollback Plan

If issues occur:
1. Revert commit in Git
2. Vercel auto-rebuilds
3. Old code deployed (logging disabled if critical)
4. Manual cleanup of bad audit logs if needed

---

## Risk Assessment

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Logs grow too large | Medium | Database space issues | Implement 90-day cleanup, monitor growth |
| Rate limiter prevents legitimate users | Low | UX degradation | Monitor failed logins, adjust threshold |
| Security headers break features | Low | Functionality issues | Test thoroughly before deploy |
| Zod validation too strict | Low | API rejections | Add detailed error messages |
| Cleanup cronjob fails silently | Low | Log accumulation | Monitor logs, set up alerts |

### Monitoring & Alerts

**What to Monitor:**
- Audit log table size
- Cleanup job success/failure
- Rate limit false positives (legitimate users blocked)
- API error rates (validation failures)
- Security header test failures

**Alerts to Set Up:**
- Audit log table > 10 GB
- Cleanup job failed for >24 hours
- Rate limit blocks > 10 unique IPs in 1 hour

---

## Compliance Verification

### Audit Trail

After implementation, verify:

1. **90-Day Retention:**
   ```sql
   SELECT COUNT(*) as logs_present FROM audit_logs WHERE timestamp > NOW() - INTERVAL '90 days';
   ```
   Should return log count without errors.

2. **All Actions Logged:**
   ```sql
   SELECT DISTINCT action FROM audit_logs ORDER BY action;
   ```
   Should include: LOGIN, LOGOUT, LOGIN_FAILED, CREATE_EXPENSE, UPDATE_EXPENSE, DELETE_EXPENSE, CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY

3. **IP Address Capture:**
   ```sql
   SELECT COUNT(*) FROM audit_logs WHERE ipAddress IS NOT NULL;
   ```
   Should show high coverage (>95% of logs have IP)

4. **Cleanup Automation:**
   ```sql
   SELECT COUNT(*) FROM audit_logs WHERE timestamp < NOW() - INTERVAL '90 days';
   ```
   Should return 0 (no logs older than 90 days)

### Security Testing

1. **Rate Limiting:**
   - Attempt 6 logins from one IP in 1 minute
   - Should receive 429 on 6th attempt

2. **Security Headers:**
   - Open browser DevTools Network tab
   - Check response headers contain all required headers

3. **Server-Side Validation:**
   - Send invalid amount (negative) via Postman/curl
   - Should receive 400 error
   - Client-side can't be bypassed

4. **Input Sanitization:**
   - Create expense with description: `<script>alert('xss')</script>`
   - Script tags should be removed
   - Sanitized value stored in database

---

## Timeline & Effort

| Phase | Task | Hours | Dependencies |
|-------|------|-------|--------------|
| 1 | Schema + Migration | 0.5 | None |
| 1 | Logger Service | 0.5 | Schema migration |
| 1 | Hooks Integration | 0.5 | Logger service |
| 1 | API Instrumentation | 1 | Hooks integration |
| 1 | Auth Logging | 0.5 | API instrumentation |
| 1 | Cleanup Service | 0.5 | Prisma |
| 1 | npm Scripts | 0.25 | Cleanup service |
| 1 | **Phase 1 Testing** | **1.5** | All Phase 1 tasks |
| 2 | Package Installation | 0.25 | None |
| 2 | Rate Limiter | 0.5 | Dependencies |
| 2 | Login Rate Limiting | 0.25 | Rate limiter |
| 2 | Security Headers | 0.25 | None |
| 2 | Zod Schemas | 0.5 | Dependencies |
| 2 | Endpoint Validation | 1 | Zod schemas |
| 2 | HTTPS Enforcement | 0.25 | None |
| 2 | Sanitization | 0.5 | None |
| 2 | Security Docs | 0.33 | All Phase 2 tasks |
| 2 | **Phase 2 Testing** | **2** | All Phase 2 tasks |
| **TOTAL** | | **~11.5 hours** | |

---

## Document History

| Date | Author | Version | Change |
|------|--------|---------|--------|
| 2026-06-01 | Claude | 1.0 | Initial specification |

---

## Appendix A: Code Templates

### Logger Service Template

```typescript
// src/lib/server/logger.ts
import { prisma } from '$lib/server/prisma';

type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'LOGIN_FAILED' 
  | 'CREATE_EXPENSE' 
  | 'UPDATE_EXPENSE' 
  | 'DELETE_EXPENSE'
  | 'CREATE_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'DELETE_CATEGORY';

type AuditResource = 'Expense' | 'Category' | 'User';

interface AuditEventPayload {
  userId?: string;
  ipAddress?: string;
  action: AuditAction;
  resource?: AuditResource;
  resourceId?: string;
  requestBody?: Record<string, any>;
  responseStatus?: number;
  errorMessage?: string;
  userAgent?: string;
}

export async function logAuditEvent(payload: AuditEventPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: payload.userId,
        ipAddress: payload.ipAddress,
        action: payload.action,
        resource: payload.resource,
        resourceId: payload.resourceId,
        requestBody: payload.requestBody ? JSON.stringify(payload.requestBody) : null,
        responseStatus: payload.responseStatus,
        errorMessage: payload.errorMessage,
        userAgent: payload.userAgent
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - logging failure should not crash the app
  }
}

export function extractClientIp(headers: Headers): string | undefined {
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp;
  }
  
  return undefined;
}
```

---

## Appendix B: Compliance Checklist

- [ ] Prisma schema updated with AuditLog model
- [ ] Prisma migration created and tested
- [ ] Logger service implemented
- [ ] Logging middleware added to hooks.server.ts
- [ ] All 8 endpoints instrumented for logging
- [ ] Cleanup cronjob configured for 90-day retention
- [ ] Rate limiting service implemented
- [ ] Rate limiting integrated into login endpoint
- [ ] Security headers added to hooks.server.ts
- [ ] Zod schemas created for all endpoints
- [ ] Server-side validation implemented
- [ ] Input sanitization implemented
- [ ] HTTPS enforcement added
- [ ] Security documentation created
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Manual testing completed
- [ ] Production deployment prepared
- [ ] Monitoring/alerts configured
- [ ] Compliance verification completed

