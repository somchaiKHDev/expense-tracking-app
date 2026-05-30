# DaisyUI Component Library — Design Spec

**Date:** 2026-05-18  
**Status:** Approved

---

## Overview

สร้าง UI component library ที่ครบครัน สำหรับโปรเจกต์นี้และพร้อม copy ไปใช้ในโปรเจกต์ SvelteKit อื่นได้ทันที โดยใช้ DaisyUI + Tailwind CSS v4 บน Svelte 5

---

## Goals

1. มี component พร้อมใช้ทุก UI pattern ที่ใช้บ่อยใน DaisyUI
2. Copy folder เดียว (`src/lib/components/ui/`) ไปโปรเจกต์อื่นได้ทันที ไม่มี dependency นอกจาก DaisyUI + Tailwind
3. ใช้ Svelte 5 runes syntax (`$props()`, snippets) ตลอด
4. มี README.md section `## Components` อธิบายวิธีใช้และวิธี copy
5. สร้าง Storybook หรือ component playground
6. สามารถที่จะปรับแก้ theme ได้ โดยให้มีค่าเริ่มต้นเป็น theme ชื่อว่า cupcake ของ diasyui

---

## Non-Goals

- ไม่ handle state management ภายใน component (ยกเว้น Modal ที่ต้องมี open/close)
- ไม่ publish เป็น npm package

---

## Folder Structure

```
src/lib/components/
└── ui/
    ├── index.ts
    ├── Alert.svelte
    ├── Avatar.svelte
    ├── Badge.svelte
    ├── Button.svelte
    ├── Card.svelte
    ├── Dropdown.svelte
    ├── Input.svelte
    ├── Modal.svelte
    ├── Navbar.svelte
    ├── Select.svelte
    └── Toggle.svelte
```

`ui/` คือหน่วยที่ portable — copy folder นี้พร้อม `index.ts` ไปวางใน `src/lib/components/ui/` ของโปรเจกต์ปลายทาง

---

## Component Catalog

### Button

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'btn-primary'` | DaisyUI variant class เช่น `btn-secondary`, `btn-ghost`, `btn-error` |
| `size` | `string` | `''` | DaisyUI size class เช่น `btn-sm`, `btn-lg` |
| `class` | `string` | `''` | extra CSS classes |
| `...rest` | `HTMLButtonAttributes` | — | ส่งต่อให้ `<button>` |

**Snippet:** `children` (required)

```svelte
<Button variant="btn-primary" size="btn-sm">บันทึก</Button>
<Button variant="btn-ghost" onclick={handleCancel}>ยกเลิก</Button>
```

---

### Card

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `class` | `string` | `''` | extra CSS classes |

**Snippets:** `children` (body), `title?` (card-title), `actions?` (card-actions)

```svelte
<Card>
	{#snippet title()}ชื่อการ์ด{/snippet}
	เนื้อหา
	{#snippet actions()}<Button>ตกลง</Button>{/snippet}
</Card>
```

---

### Badge

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'badge-primary'` | DaisyUI variant class |
| `size` | `string` | `''` | DaisyUI size class เช่น `badge-sm` |
| `class` | `string` | `''` | extra CSS classes |

**Snippet:** `children`

```svelte
<Badge variant="badge-success">ใช้งาน</Badge>
<Badge variant="badge-error" size="badge-sm">ปิด</Badge>
```

---

### Alert

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'alert-info'` | `alert-info`, `alert-success`, `alert-warning`, `alert-error` |
| `class` | `string` | `''` | extra CSS classes |

**Snippet:** `children`

```svelte
<Alert variant="alert-warning">กรุณาตรวจสอบข้อมูลก่อนบันทึก</Alert>
```

---

### Input

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | label text แสดงเหนือ input |
| `placeholder` | `string` | `''` | placeholder text |
| `type` | `string` | `'text'` | HTML input type |
| `variant` | `string` | `''` | เช่น `input-bordered`, `input-primary` |
| `error` | `string` | `''` | error message (แสดง label สีแดงด้านล่าง) |
| `class` | `string` | `''` | extra CSS classes บน `<input>` |
| `...rest` | `HTMLInputAttributes` | — | ส่งต่อให้ `<input>` |

```svelte
<Input label="อีเมล" type="email" placeholder="example@email.com" bind:value={email} />
<Input label="รหัสผ่าน" type="password" error={errors.password} />
```

---

### Select

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | label text |
| `variant` | `string` | `''` | เช่น `select-bordered`, `select-primary` |
| `class` | `string` | `''` | extra CSS classes |
| `...rest` | `HTMLSelectAttributes` | — | ส่งต่อให้ `<select>` |

**Snippet:** `children` (ใส่ `<option>` elements)

```svelte
<Select label="สถานะ" bind:value={status}>
	<option value="active">ใช้งาน</option>
	<option value="inactive">ปิด</option>
</Select>
```

---

### Toggle

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `''` | label text |
| `variant` | `string` | `''` | เช่น `toggle-primary` |
| `class` | `string` | `''` | extra CSS classes |
| `...rest` | `HTMLInputAttributes` | — | ส่งต่อให้ `<input type="checkbox">` |

```svelte
<Toggle label="เปิดการแจ้งเตือน" bind:checked={notifyEnabled} />
```

---

### Modal

**State:** controlled ผ่าน `bind:open`

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | toggle modal (bindable) |
| `title` | `string` | `''` | ชื่อ modal |
| `class` | `string` | `''` | extra CSS classes บน modal-box |

**Snippets:** `children` (body), `actions?` (ปุ่มด้านล่าง)

```svelte
<Modal bind:open={showModal} title="ยืนยันการลบ">
	คุณแน่ใจหรือไม่?
	{#snippet actions()}
		<Button variant="btn-error" onclick={handleDelete}>ลบ</Button>
		<Button variant="btn-ghost" onclick={() => (showModal = false)}>ยกเลิก</Button>
	{/snippet}
</Modal>
```

---

### Navbar

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `class` | `string` | `''` | extra CSS classes |

**Snippets:** `start?`, `center?`, `end?`

```svelte
<Navbar>
	{#snippet start()}<a class="btn btn-ghost text-xl">MyApp</a>{/snippet}
	{#snippet end()}<Button variant="btn-primary" size="btn-sm">เข้าสู่ระบบ</Button>{/snippet}
</Navbar>
```

---

### Avatar

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | `''` | URL รูปภาพ |
| `alt` | `string` | `''` | alt text |
| `size` | `string` | `'w-10'` | Tailwind width class |
| `shape` | `string` | `'rounded-full'` | เช่น `rounded`, `rounded-full` |
| `placeholder` | `string` | `''` | ตัวอักษรแสดงเมื่อไม่มีรูป |
| `class` | `string` | `''` | extra CSS classes |

```svelte
<Avatar src="/profile.jpg" alt="ผู้ใช้" size="w-12" />
<Avatar placeholder="SK" size="w-10" />
```

---

### Dropdown

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `class` | `string` | `''` | extra CSS classes |

**Snippets:** `trigger` (required — ปุ่มหรือ element ที่คลิก), `children` (เนื้อหา dropdown)

```svelte
<Dropdown>
	{#snippet trigger()}<Button>เมนู</Button>{/snippet}
	<li><a href="/profile">โปรไฟล์</a></li>
	<li><a href="/settings">ตั้งค่า</a></li>
</Dropdown>
```

---

## index.ts Exports

```ts
export { default as Alert } from './Alert.svelte';
export { default as Avatar } from './Avatar.svelte';
export { default as Badge } from './Badge.svelte';
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Dropdown } from './Dropdown.svelte';
export { default as Input } from './Input.svelte';
export { default as Modal } from './Modal.svelte';
export { default as Navbar } from './Navbar.svelte';
export { default as Select } from './Select.svelte';
export { default as Toggle } from './Toggle.svelte';
```

---

## Portability: วิธี Copy ไปโปรเจกต์อื่น

**Prerequisites ของโปรเจกต์ปลายทาง:**

- SvelteKit + Svelte 5
- Tailwind CSS v4 (`@tailwindcss/vite`)
- DaisyUI (`@plugin "daisyui"` ใน app.css)

**ขั้นตอน:**

1. Copy folder `src/lib/components/ui/` ไปวางในโปรเจกต์ปลายทาง
2. ติดตั้ง dependencies: `npm install -D tailwindcss @tailwindcss/vite daisyui`
3. ตั้งค่า `vite.config.ts` และ `app.css` ตาม setup ของโปรเจกต์นี้
4. Import และใช้งานได้เลย

---

## README.md Section

เพิ่ม section `## Components` ใน README.md ของโปรเจกต์นี้ พร้อม:

- รายการ component ทั้งหมด
- ตัวอย่าง import
- วิธี copy ไปโปรเจกต์อื่น (prerequisites + ขั้นตอน)

---

## Implementation Checklist

- [ ] สร้าง `src/lib/components/ui/Button.svelte`
- [ ] สร้าง `src/lib/components/ui/Card.svelte`
- [ ] สร้าง `src/lib/components/ui/Badge.svelte`
- [ ] สร้าง `src/lib/components/ui/Alert.svelte`
- [ ] สร้าง `src/lib/components/ui/Input.svelte`
- [ ] สร้าง `src/lib/components/ui/Select.svelte`
- [ ] สร้าง `src/lib/components/ui/Toggle.svelte`
- [ ] สร้าง `src/lib/components/ui/Modal.svelte`
- [ ] สร้าง `src/lib/components/ui/Navbar.svelte`
- [ ] สร้าง `src/lib/components/ui/Avatar.svelte`
- [ ] สร้าง `src/lib/components/ui/Dropdown.svelte`
- [ ] สร้าง `src/lib/components/ui/index.ts`
- [ ] อัปเดต `README.md` เพิ่ม section `## Components`
