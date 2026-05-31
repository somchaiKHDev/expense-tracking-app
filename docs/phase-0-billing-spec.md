# Phase 0 — ระบบ Billing & Feature Gating (สเปกเชิงเทคนิค)

> รากฐานที่ต้องมีก่อนเปิดขายแพ็กเกจ — อิงกับ stack จริงของโปรเจค: **SvelteKit + Auth.js (`@auth/sveltekit`) + Prisma + PostgreSQL**
> เอกสารคู่กับ [`monetization-plan.md`](./monetization-plan.md)
>
> ⚠️ **หมายเหตุ:** โมเดลแพ็กเกจ Free/Plus/Pro ในเอกสารนี้ถูกแทนที่ด้วย **Progressive Trial Funnel** — ดู [`phase-0-trial-funnel-spec.md`](./phase-0-trial-funnel-spec.md) ส่วนกลไก billing/webhook/security ด้านล่างยังใช้ได้เหมือนเดิม
> อัปเดต: 31 พ.ค. 2026

---

## 0. ภาพรวม

Phase 0 มี 4 ส่วนที่ต้องสร้าง เรียงตามลำดับการลงมือ:

1. **Data model** — เพิ่มแนวคิด plan/subscription เข้า schema
2. **Plan config & gating** — นิยามว่าแต่ละ tier ทำอะไรได้ และบังคับใช้ฝั่ง server
3. **Billing integration** — เชื่อม payment gateway + webhook
4. **UI** — หน้าแพ็กเกจ, จัดการ subscription, แจ้งเตือนเมื่อชนกำแพง

> หลักการสำคัญ: **บังคับสิทธิ์ที่ฝั่ง server เสมอ** (ใน API route / helper) ห้ามพึ่ง UI อย่างเดียว เพราะผู้ใช้แก้ฝั่ง client ได้

---

## 1. Data Model (Prisma)

### 1.1 เพิ่ม enum และ field ใน `User`

ปัจจุบัน `User` ยังไม่มีแนวคิดแพ็กเกจ แนวทางที่เรียบง่ายและพอสำหรับ B2C คือเก็บ plan ปัจจุบันไว้ที่ `User` ตรงๆ และแยกตาราง `Subscription` ไว้เก็บประวัติ/สถานะการจ่าย

```prisma
enum Plan {
  FREE
  PLUS
  PRO
}

enum SubscriptionStatus {
  ACTIVE        // จ่ายแล้ว ใช้งานได้
  TRIALING      // อยู่ในช่วงทดลอง
  PAST_DUE      // จ่ายไม่ผ่าน รอ retry
  CANCELED      // ยกเลิกแล้ว (ใช้ได้ถึงสิ้นรอบ)
  EXPIRED       // หมดอายุ ตกกลับ FREE
}

model User {
  // ...field เดิม...
  plan          Plan          @default(FREE)
  planRenewsAt  DateTime?     @map("plan_renews_at")
  subscriptions Subscription[]
}
```

### 1.2 ตาราง `Subscription`

```prisma
model Subscription {
  id                  String             @id @default(cuid())
  userId              String             @map("user_id")
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  plan                Plan
  status              SubscriptionStatus @default(TRIALING)
  billingCycle        String             @map("billing_cycle")        // "monthly" | "yearly"

  // อ้างอิงฝั่ง payment gateway
  provider            String                                          // "omise" | "stripe"
  providerCustomerId  String?            @map("provider_customer_id")
  providerSubId       String?            @map("provider_sub_id")

  currentPeriodEnd    DateTime?          @map("current_period_end")
  cancelAtPeriodEnd   Boolean            @default(false) @map("cancel_at_period_end")

  createdAt           DateTime           @default(now()) @map("created_at")
  updatedAt           DateTime           @updatedAt @map("updated_at")

  @@index([userId])
  @@index([providerSubId])
  @@map("subscriptions")
}
```

### 1.3 รองรับ multi-wallet (เตรียมไว้สำหรับ Plus)

ฟีเจอร์ "หลายบัญชี/กระเป๋า" เป็นจุดขายหลักของ Plus จึงควรเพิ่ม `Wallet` ตั้งแต่ Phase 0 เพื่อไม่ต้อง migrate ซ้ำ:

```prisma
model Wallet {
  id        Int       @id @default(autoincrement())
  name      String                                    // "เงินสด", "กสิกร", "บัตรเครดิต"
  type      String    @default("cash")
  userId    String    @map("user_id")
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expenses  Expense[]
  createdAt DateTime  @default(now()) @map("created_at")

  @@unique([userId, name], name: "uq_user_wallet_name")
  @@map("wallets")
}
```

แล้วเพิ่ม `walletId Int?` ใน `Expense` (nullable เพื่อ migrate ของเดิมได้ ค่อยตั้ง default wallet ให้ user เดิมทีหลัง)

### 1.4 Migration

```bash
npx prisma migrate dev --name add_billing_and_wallets
npx prisma generate
```

> ⚠️ user เดิมทุกคนจะได้ `plan = FREE` อัตโนมัติจาก default — ปลอดภัย ไม่กระทบข้อมูลเดิม

---

## 2. Plan Config & Feature Gating

### 2.1 ไฟล์นิยามขีดจำกัด — `src/lib/server/plans.ts`

รวมกฎทั้งหมดไว้ที่เดียว เปลี่ยนราคา/ขีดจำกัดได้จากจุดเดียว:

```ts
import type { Plan } from '@prisma/client';

export interface PlanLimits {
  maxCategories: number;        // -1 = ไม่จำกัด
  historyMonths: number;        // -1 = ไม่จำกัด
  maxWallets: number;
  recurring: boolean;
  advancedReports: boolean;
  export: boolean;
  receiptAttach: boolean;
  bankImport: boolean;
  ocr: boolean;
  aiCategorize: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    maxCategories: 5, historyMonths: 3, maxWallets: 1,
    recurring: false, advancedReports: false, export: false,
    receiptAttach: false, bankImport: false, ocr: false, aiCategorize: false
  },
  PLUS: {
    maxCategories: -1, historyMonths: -1, maxWallets: 10,
    recurring: true, advancedReports: true, export: true,
    receiptAttach: true, bankImport: false, ocr: false, aiCategorize: false
  },
  PRO: {
    maxCategories: -1, historyMonths: -1, maxWallets: -1,
    recurring: true, advancedReports: true, export: true,
    receiptAttach: true, bankImport: true, ocr: true, aiCategorize: true
  }
};

export function getLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}
```

### 2.2 Helper บังคับสิทธิ์ — `src/lib/server/gating.ts`

ต่อยอดจาก `authenticate()` ที่มีอยู่แล้ว โดยดึง `plan` ของ user มาด้วย:

```ts
import { error, type RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { authenticate } from '$lib/server/auth';
import { getLimits, type PlanLimits } from '$lib/server/plans';

// คืน user + plan + limits ในที่เดียว
export async function authWithPlan(event: RequestEvent) {
  const payload = await authenticate(event);
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, plan: true }
  });
  if (!user) throw error(401, 'User not found');
  return { userId: user.id, plan: user.plan, limits: getLimits(user.plan) };
}

// บังคับฟีเจอร์แบบ boolean (เช่น export, bankImport)
export function requireFeature(limits: PlanLimits, key: keyof PlanLimits) {
  if (!limits[key]) {
    throw error(402, { message: 'ฟีเจอร์นี้ต้องอัปเกรดแพ็กเกจ' } as any);
  }
}

// บังคับขีดจำกัดเชิงจำนวน (เช่น จำนวนหมวด)
export function assertWithinLimit(current: number, max: number) {
  if (max !== -1 && current >= max) {
    throw error(402, { message: 'ถึงขีดจำกัดของแพ็กเกจแล้ว อัปเกรดเพื่อเพิ่ม' } as any);
  }
}
```

> ใช้ **HTTP 402 Payment Required** เป็นสัญญาณมาตรฐานให้ frontend รู้ว่าควรเด้งหน้าอัปเกรด

### 2.3 ตัวอย่างการใช้ในจุดที่มีอยู่จริง

**จำกัดจำนวนหมวด** ใน `src/routes/api/categories/+server.ts` (POST):

```ts
export const POST: RequestHandler = async (event) => {
  const { userId, limits } = await authWithPlan(event);

  const count = await prisma.category.count({ where: { userId } });
  assertWithinLimit(count, limits.maxCategories);   // FREE = 5

  // ...สร้าง category ตามเดิม...
};
```

**จำกัดประวัติย้อนหลัง** ใน `src/routes/api/expenses/+server.ts` (GET) — ใส่ขอบล่างของวันที่:

```ts
const { userId, limits } = await authWithPlan(event);

if (limits.historyMonths !== -1) {
  const floor = new Date();
  floor.setMonth(floor.getMonth() - limits.historyMonths);
  whereClause.transactionDate = { ...(whereClause.transactionDate ?? {}), gte: floor };
}
```

**บังคับฟีเจอร์ export:**

```ts
const { limits } = await authWithPlan(event);
requireFeature(limits, 'export');   // โยน 402 ถ้าไม่ใช่ Plus/Pro
```

### 2.4 ส่ง plan ไปให้ฝั่ง client (สำหรับซ่อน/แสดงปุ่ม)

ใน `src/routes/+layout.server.ts` เพิ่ม plan เข้า data เพื่อให้ UI ปรับตาม (แต่ย้ำ — UI gating เป็นแค่ UX การบังคับจริงอยู่ที่ server):

```ts
export const load = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user) return { plan: 'FREE' };
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }, select: { plan: true }
  });
  return { plan: user?.plan ?? 'FREE' };
};
```

---

## 3. Billing Integration

### 3.1 เลือก Payment Gateway

| Gateway | เหมาะกับ | จุดเด่น | จุดสังเกต |
|---|---|---|---|
| **Omise (Opn)** | ตลาดไทย ✅ | รองรับ PromptPay, บัตร, internet banking ไทย, มี recurring | ต้องสมัคร merchant ไทย |
| **2C2P** | ตลาดไทย/SEA | ครอบคลุมช่องทางไทยเยอะ | งานเชื่อมต่อหนักกว่า |
| **Stripe** | สากล | DX ดีมาก, Stripe Billing จัดการ subscription ครบ | recurring billing ในไทยจำกัด, บัตรไทยบาง issuer มีปัญหา |

**คำแนะนำ:** เริ่มด้วย **Omise** เพราะรองรับ PromptPay และการตัดบัตรอัตโนมัติแบบ subscription ในไทยได้ดีที่สุด — ตรงกับกลุ่มเป้าหมาย B2C ไทย

### 3.2 Flow การสมัครสมาชิก

```
ผู้ใช้กดเลือกแพ็กเกจ
  → POST /api/billing/checkout {plan, cycle}
  → server สร้าง customer + charge/subscription ที่ Omise
  → redirect ไปหน้าจ่ายเงิน (หรือ inline form)
  → ผู้ใช้จ่ายเงิน
  → Omise ยิง webhook กลับ → /api/billing/webhook
  → server อัปเดต Subscription + User.plan = PLUS/PRO
```

### 3.3 Webhook คือแหล่งความจริง — `src/routes/api/billing/webhook/+server.ts`

อย่าอัปเดต plan ทันทีหลัง redirect ให้รอ webhook ยืนยันเสมอ:

```ts
export const POST: RequestHandler = async (event) => {
  const raw = await event.request.text();
  // 1. verify signature ของ Omise ก่อนเสมอ (กัน webhook ปลอม)
  // 2. parse event

  const evt = JSON.parse(raw);

  switch (evt.key) {
    case 'charge.complete':
    case 'schedule.charged': {
      const sub = await prisma.subscription.update({
        where: { providerSubId: evt.data.schedule },
        data: { status: 'ACTIVE', currentPeriodEnd: /* รอบถัดไป */ }
      });
      await prisma.user.update({
        where: { id: sub.userId },
        data: { plan: sub.plan, planRenewsAt: sub.currentPeriodEnd }
      });
      break;
    }
    case 'charge.failed':
      // ตั้ง PAST_DUE, ส่งอีเมลแจ้งเตือน
      break;
  }
  return json({ received: true });
};
```

### 3.4 จัดการต่ออายุ / ยกเลิก / หมดอายุ

- **ยกเลิก:** ตั้ง `cancelAtPeriodEnd = true` ผู้ใช้ใช้ต่อได้ถึง `currentPeriodEnd` แล้วค่อยตกกลับ FREE
- **จ่ายไม่ผ่าน:** สถานะ `PAST_DUE` + retry ตาม policy ของ gateway ก่อน expire
- **Cron/scheduled job** รายวัน: หา subscription ที่ `currentPeriodEnd < now` แล้ว downgrade `User.plan = FREE`
  > ทำเป็น scheduled task รายวันได้ หรือเช็ค lazy ตอน `authWithPlan` ก็ได้

### 3.5 ENV ที่ต้องเพิ่ม

```bash
OMISE_PUBLIC_KEY=pkey_...
OMISE_SECRET_KEY=skey_...
OMISE_WEBHOOK_SECRET=...
```
(อย่า commit — `.env` อยู่ใน `.gitignore` แล้ว)

---

## 4. UI ที่ต้องสร้าง

1. **หน้า Pricing / เลือกแพ็กเกจ** — `/pricing` แสดงตารางเทียบ 3 tier + ปุ่ม "อัปเกรด"
2. **หน้าจัดการสมาชิก** — `/settings/billing` ดูแพ็กเกจปัจจุบัน, วันต่ออายุ, ยกเลิก, ประวัติการจ่าย
3. **Upgrade modal / paywall** — เด้งเมื่อ frontend ได้ response **402** จาก API (เช่น เพิ่มหมวดเกิน 5)
   - ใช้ `Modal` + `Button` ที่มีใน component library อยู่แล้ว
4. **Badge แสดงแพ็กเกจ** ใน Navbar (ใช้ `Badge` component) — แสดง "Free / Plus / Pro"

---

## 5. ลำดับการลงมือ (Checklist)

- [ ] เพิ่ม `Plan`, `SubscriptionStatus` enum + field ใน `User` + ตาราง `Subscription`, `Wallet`
- [ ] `npx prisma migrate dev` + generate
- [ ] สร้าง `src/lib/server/plans.ts` (config ขีดจำกัด)
- [ ] สร้าง `src/lib/server/gating.ts` (`authWithPlan`, `requireFeature`, `assertWithinLimit`)
- [ ] ใส่ gating ใน API เดิม: categories (POST), expenses (GET history)
- [ ] ส่ง `plan` ผ่าน `+layout.server.ts`
- [ ] สมัคร Omise merchant + ใส่ ENV
- [ ] สร้าง `/api/billing/checkout` + `/api/billing/webhook` (verify signature!)
- [ ] สร้างหน้า `/pricing`, `/settings/billing`, upgrade modal (จับ 402)
- [ ] เพิ่ม scheduled job ตรวจ subscription หมดอายุ → downgrade
- [ ] เขียน test: gating helper (เกินขีดจำกัด → 402), webhook (verify + อัปเดต plan)

---

## 6. ข้อควรระวังด้านความปลอดภัย & compliance

- **บังคับสิทธิ์ที่ server เท่านั้น** — UI เป็นแค่ UX
- **Verify webhook signature ทุกครั้ง** ก่อนเชื่อ event — ไม่งั้นใครก็ปลอม event เพื่ออัปเกรดฟรีได้
- **อย่าเก็บเลขบัตรเอง** — ให้ gateway tokenize (PCI-DSS เป็นภาระของ gateway)
- **PDPA:** เก็บเฉพาะ provider customer/subscription id อย่าเก็บข้อมูลบัตร, มี consent + นโยบายความเป็นส่วนตัว
- ใช้ **idempotency** ใน webhook handler — webhook อาจถูกยิงซ้ำ ต้องกันการอัปเดต/ตัดเงินซ้ำ
