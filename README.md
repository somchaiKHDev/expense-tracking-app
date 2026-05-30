# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.3 create --template minimal --types ts --add eslint prettier --no-install my-sveltekit-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Components

A portable DaisyUI component library built with Svelte 5. All components live in `src/lib/components/ui/`.

### Available Components

| Component         | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `Button`          | ปุ่ม — รองรับ variant, size, และ HTML button attributes ทั้งหมด |
| `Card`            | การ์ด — รองรับ title, body, และ actions snippets                |
| `Badge`           | ป้ายกำกับ — รองรับ variant และ size                             |
| `Alert`           | แจ้งเตือน — info, success, warning, error                       |
| `Input`           | ช่องกรอกข้อมูล — รองรับ label, placeholder, error message       |
| `Select`          | ตัวเลือก — รองรับ label และ option children                     |
| `Toggle`          | สวิตช์ — รองรับ label                                           |
| `Modal`           | หน้าต่าง popup — controlled ผ่าน `bind:open`                    |
| `Navbar`          | แถบนำทาง — รองรับ start, center, end snippets                   |
| `Avatar`          | รูปโปรไฟล์ — รองรับรูปภาพและตัวอักษรแทน                         |
| `Dropdown`        | เมนูย่อย — รองรับ trigger snippet                               |
| `ThemeController` | ตัวเลือก theme — เปลี่ยน DaisyUI theme ได้ทันที                 |

### Theme

Default theme คือ **cupcake** — กำหนดใน `src/app.html` และ `src/app.css`

เปลี่ยน default theme โดยแก้ `data-theme` ใน `src/app.html`:

```html
<html lang="en" data-theme="cupcake"></html>
```

ใช้ `ThemeController` component เพื่อให้ผู้ใช้เปลี่ยน theme ได้:

```svelte
<script>
	import { ThemeController } from '$lib/components/ui';
</script>

<ThemeController />
```

### Usage

```svelte
<script>
	import { Button, Card, Modal, Badge } from '$lib/components/ui';

	let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Open</Button>

<Modal bind:open title="Hello">
	<p>Modal content</p>
	{#snippet actions()}
		<Button variant="btn-ghost" onclick={() => (open = false)}>Close</Button>
	{/snippet}
</Modal>
```

### Component Playground

ดู component ทั้งหมดพร้อม theme switcher ได้ที่ [http://localhost:5173/playground](http://localhost:5173/playground) ขณะ run dev server

### Copy to Another Project

**Prerequisites:**

- SvelteKit + Svelte 5
- Tailwind CSS v4 + DaisyUI

**Steps:**

1. Copy `src/lib/components/ui/` to the target project
2. Install dependencies:
   ```bash
   npm install -D tailwindcss @tailwindcss/vite daisyui
   ```
3. Configure `vite.config.ts` — add `tailwindcss()` to plugins
4. Configure `src/app.css`:
   ```css
   @import 'tailwindcss';
   @plugin "daisyui" {
   	themes:
   		cupcake --default,
   		light,
   		dark;
   }
   ```
5. Set default theme in `src/app.html`: `<html data-theme="cupcake">`
6. Import CSS in root layout: `import '../app.css'`
7. Import and use:
   ```svelte
   import {(Button, Card)} from '$lib/components/ui';
   ```
