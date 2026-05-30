# Custom Brand Theme System — Design Spec

**Date:** 2026-05-18  
**Stack:** SvelteKit 5 + Tailwind CSS v4 + DaisyUI v5  
**Status:** Approved

---

## Overview

เพิ่ม custom brand theme บนระบบ DaisyUI v5 ที่มีอยู่ โดยไม่แทนที่ built-in themes เดิม ผู้ใช้สามารถเลือก theme ได้จาก ThemeController ซึ่งแสดง brand themes และ built-in themes รวมกันในที่เดียว

**Use case:** White-label สำหรับหลาย brand/ลูกค้า แต่ละ brand มี color palette เฉพาะของตัวเอง

---

## Scope

**In scope:**

- Brand theme registry ใน TypeScript config file
- CSS theme definition ผ่าน `@plugin "daisyui/theme"` ตาม DaisyUI v5 pattern
- Grouped dropdown ใน ThemeController (Brand / Built-in)
- Update unit test ของ ThemeController

**Out of scope:**

- Theme persistence (ไม่มี localStorage หรือ server-side saving)
- Admin UI สำหรับสร้าง theme
- Dynamic theme loading จาก API

---

## Architecture

### ไฟล์ที่เกี่ยวข้อง

```
src/
├── lib/
│   └── themes/
│       └── brands.config.ts      ← NEW
├── app.css                        ← MODIFIED
└── lib/components/ui/
    └── ThemeController.svelte     ← MODIFIED
    └── ThemeController.test.ts    ← MODIFIED
```

### brands.config.ts (NEW)

Source of truth สำหรับ brand themes ทั้งหมด ThemeController อ่านจากที่นี่เพื่อสร้าง dropdown

```ts
export type BrandTheme = {
	id: string; // ต้องขึ้นต้นด้วย "brand-"
	label: string; // ชื่อที่แสดงใน UI
};

export const brandThemes: BrandTheme[] = [
	{ id: 'brand-acme', label: 'Acme Corp' },
	{ id: 'brand-nexus', label: 'Nexus' }
];

export const defaultTheme = 'cupcake';
```

### app.css (MODIFIED)

เพิ่ม `@plugin "daisyui/theme"` block สำหรับแต่ละ brand ต่อจาก built-in themes ที่มีอยู่แล้ว

```css
@plugin "daisyui/theme" {
	name: 'brand-acme';
	color-scheme: light;
	--color-primary: oklch(55% 0.2 240);
	--color-primary-content: oklch(98% 0.01 240);
	--color-secondary: oklch(65% 0.15 200);
	--color-secondary-content: oklch(98% 0.01 200);
	--color-accent: oklch(70% 0.18 160);
	--color-accent-content: oklch(98% 0.01 160);
	--color-neutral: oklch(30% 0.02 240);
	--color-neutral-content: oklch(98% 0.01 0);
	--color-base-100: oklch(98% 0 0);
	--color-base-200: oklch(94% 0 0);
	--color-base-300: oklch(89% 0 0);
	--color-base-content: oklch(20% 0.02 240);
	--color-info: oklch(70% 0.15 220);
	--color-success: oklch(65% 0.18 150);
	--color-warning: oklch(75% 0.18 80);
	--color-error: oklch(60% 0.22 25);
}
```

### ThemeController.svelte (MODIFIED)

อ่าน `brandThemes` และ `defaultTheme` จาก config แสดงเป็น `<optgroup>` แบ่ง Brand / Built-in

`builtinThemes` array คงเป็น hardcoded list ภายใน ThemeController เหมือนเดิม (mirror จาก `app.css`) ไม่ได้ย้ายไปที่ config เพราะ built-in themes ไม่เปลี่ยนบ่อยและไม่ใช่ scope ของ feature นี้

```html
<select>
	<optgroup label="Brand">
		{#each brandThemes as theme}
		<option value="{theme.id}">{theme.label}</option>
		{/each}
	</optgroup>
	<optgroup label="Built-in">
		{#each builtinThemes as theme}
		<option value="{theme}">{theme}</option>
		{/each}
	</optgroup>
</select>
```

---

## Data Flow

### App Load

```
browser เปิด app
  └─ ไม่มี data-theme บน <html> → DaisyUI ใช้ default (cupcake)
  └─ ThemeController mount → state = defaultTheme จาก config
```

### User เลือก Theme

```
user เลือกใน dropdown
  └─ onChange() → document.documentElement.setAttribute('data-theme', id)
  └─ CSS variables ของ theme activate ทันที
  └─ ไม่มี persistence — reload = reset to defaultTheme
```

---

## Naming Convention

Brand theme `id` ต้องขึ้นต้นด้วย `brand-` เสมอ:

- ✅ `brand-acme`, `brand-nexus`, `brand-omega`
- ❌ `acme`, `my-brand`, `custom-acme`

กฎนี้ทำให้สามารถแยก brand vs built-in ได้โดยไม่ต้องมี separate list สำหรับ built-in

---

## การเพิ่ม Brand ใหม่

ทำ 2 ขั้นตอนเสมอ:

**ขั้นที่ 1 — `brands.config.ts`:**

```ts
export const brandThemes: BrandTheme[] = [
	...{ id: 'brand-omega', label: 'Omega' } // เพิ่มตรงนี้
];
```

**ขั้นที่ 2 — `app.css`:**

```css
@plugin "daisyui/theme" {
	name: 'brand-omega';
	/* color variables */
}
```

---

## Error Cases

| กรณี                         | ผลลัพธ์                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| มี config แต่ไม่มี CSS block | Theme แสดงใน dropdown แต่ไม่มี color (ใช้ DaisyUI default) |
| มี CSS block แต่ไม่มี config | Theme ไม่แสดงใน dropdown แต่ CSS ยังโหลดอยู่               |
| ไม่มีทั้งคู่                 | ไม่มีผลกระทบกับ built-in themes                            |

ไม่มี runtime crash ในทุกกรณี

---

## Testing

`ThemeController.test.ts` ต้อง update ให้ครอบคลุม:

- Grouped dropdown แสดง brand optgroup และ built-in optgroup
- Default theme ถูก select เมื่อ mount
- การเลือก brand theme เรียก `setAttribute('data-theme', ...)` ถูก id

---

## Built-in Themes (คงไว้ทั้งหมด)

cupcake (default), light, dark, synthwave, corporate, retro, cyberpunk, valentine, halloween, garden, forest, aqua, lofi, pastel, fantasy, wireframe, black, luxury, dracula, cmyk, autumn, business, acid, lemonade, night, coffee, winter, dim, nord, sunset
