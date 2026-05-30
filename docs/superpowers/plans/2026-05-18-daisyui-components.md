# DaisyUI Component Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 11 DaisyUI components in `src/lib/components/ui/`, a component playground page at `/playground`, and README documentation — all ready to copy to any SvelteKit + Svelte 5 project.

**Architecture:** Components are Svelte 5 rune-based wrappers over DaisyUI CSS classes in a self-contained `src/lib/components/ui/` folder. Each accepts a `class` prop for extension and passes unknown attributes to the underlying HTML element. A playground route showcases all components on one page.

**Tech Stack:** Svelte 5, SvelteKit 2, DaisyUI v5, Tailwind CSS v4, Vitest, @testing-library/svelte

---

## File Map

**Create:**

- `src/lib/components/ui/Alert.svelte` + `Alert.test.ts`
- `src/lib/components/ui/Avatar.svelte` + `Avatar.test.ts`
- `src/lib/components/ui/Badge.svelte` + `Badge.test.ts`
- `src/lib/components/ui/Button.svelte` + `Button.test.ts`
- `src/lib/components/ui/Card.svelte` + `Card.test.ts`
- `src/lib/components/ui/Dropdown.svelte` + `Dropdown.test.ts`
- `src/lib/components/ui/Input.svelte` + `Input.test.ts`
- `src/lib/components/ui/Modal.svelte` + `Modal.test.ts`
- `src/lib/components/ui/Navbar.svelte` + `Navbar.test.ts`
- `src/lib/components/ui/Select.svelte` + `Select.test.ts`
- `src/lib/components/ui/Toggle.svelte` + `Toggle.test.ts`
- `src/lib/components/ui/index.ts`
- `src/test-setup.ts`
- `src/routes/playground/+page.svelte`

**Modify:**

- `vite.config.ts` — add `test` block for vitest
- `package.json` — add `test` and `test:watch` scripts
- `README.md` — add `## Components` section

---

## Task 1: Setup Vitest + @testing-library/svelte

**Files:**

- Modify: `vite.config.ts`
- Modify: `package.json`
- Create: `src/test-setup.ts`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/svelte @testing-library/jest-dom jsdom
```

Expected: packages added, no errors.

- [ ] **Step 2: Add vitest config to vite.config.ts**

Replace full content of `vite.config.ts`:

```typescript
/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		include: ['src/**/*.test.ts'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['src/test-setup.ts']
	}
});
```

- [ ] **Step 3: Create test setup file**

Create `src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add test scripts to package.json**

In `package.json` `"scripts"` block, add after `"format"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify vitest works**

```bash
npx vitest run --reporter=verbose 2>&1 | tail -5
```

Expected: exits cleanly — "No test files found" or 0 tests, no crash.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts src/test-setup.ts package.json
git commit -m "chore: setup vitest with @testing-library/svelte"
```

---

## Task 2: Button Component

**Files:**

- Create: `src/lib/components/ui/Button.svelte`
- Create: `src/lib/components/ui/Button.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/components/ui/Button.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button', () => {
	it('renders a button element', () => {
		const { getByRole } = render(Button);
		expect(getByRole('button')).toBeInTheDocument();
	});

	it('applies btn and default variant classes', () => {
		const { getByRole } = render(Button);
		expect(getByRole('button')).toHaveClass('btn', 'btn-primary');
	});

	it('applies custom variant', () => {
		const { getByRole } = render(Button, { variant: 'btn-ghost' });
		expect(getByRole('button')).toHaveClass('btn-ghost');
		expect(getByRole('button')).not.toHaveClass('btn-primary');
	});

	it('applies size class', () => {
		const { getByRole } = render(Button, { size: 'btn-sm' });
		expect(getByRole('button')).toHaveClass('btn-sm');
	});

	it('applies extra class', () => {
		const { getByRole } = render(Button, { class: 'w-full' });
		expect(getByRole('button')).toHaveClass('w-full');
	});

	it('passes through HTML attributes', () => {
		const { getByRole } = render(Button, { disabled: true });
		expect(getByRole('button')).toBeDisabled();
	});
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/lib/components/ui/Button.test.ts 2>&1 | tail -10
```

Expected: FAIL — "Cannot find module './Button.svelte'"

- [ ] **Step 3: Implement Button**

Create `src/lib/components/ui/Button.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		variant = 'btn-primary',
		size = '',
		class: cls = '',
		children,
		...rest
	}: {
		variant?: string;
		size?: string;
		class?: string;
		children?: Snippet;
	} & Omit<HTMLButtonAttributes, 'class'> = $props();
</script>

<button class="btn {variant} {size} {cls}" {...rest}>
	{@render children?.()}
</button>
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx vitest run src/lib/components/ui/Button.test.ts
```

Expected: 6/6 PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ui/Button.svelte src/lib/components/ui/Button.test.ts
git commit -m "feat: add Button component"
```

---

## Task 3: Badge + Alert Components

**Files:**

- Create: `src/lib/components/ui/Badge.svelte` + `Badge.test.ts`
- Create: `src/lib/components/ui/Alert.svelte` + `Alert.test.ts`

- [ ] **Step 1: Write Badge failing test**

Create `src/lib/components/ui/Badge.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Badge from './Badge.svelte';

describe('Badge', () => {
	it('renders a span element', () => {
		const { container } = render(Badge);
		expect(container.querySelector('span')).toBeInTheDocument();
	});

	it('applies badge and default variant classes', () => {
		const { container } = render(Badge);
		expect(container.querySelector('span')).toHaveClass('badge', 'badge-primary');
	});

	it('applies custom variant', () => {
		const { container } = render(Badge, { variant: 'badge-success' });
		expect(container.querySelector('span')).toHaveClass('badge-success');
		expect(container.querySelector('span')).not.toHaveClass('badge-primary');
	});

	it('applies size class', () => {
		const { container } = render(Badge, { size: 'badge-sm' });
		expect(container.querySelector('span')).toHaveClass('badge-sm');
	});
});
```

- [ ] **Step 2: Write Alert failing test**

Create `src/lib/components/ui/Alert.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Alert from './Alert.svelte';

describe('Alert', () => {
	it('renders an alert element', () => {
		const { getByRole } = render(Alert);
		expect(getByRole('alert')).toBeInTheDocument();
	});

	it('applies alert and default variant classes', () => {
		const { getByRole } = render(Alert);
		expect(getByRole('alert')).toHaveClass('alert', 'alert-info');
	});

	it('applies custom variant', () => {
		const { getByRole } = render(Alert, { variant: 'alert-error' });
		expect(getByRole('alert')).toHaveClass('alert-error');
		expect(getByRole('alert')).not.toHaveClass('alert-info');
	});
});
```

- [ ] **Step 3: Run both tests — verify they fail**

```bash
npx vitest run src/lib/components/ui/Badge.test.ts src/lib/components/ui/Alert.test.ts 2>&1 | tail -5
```

Expected: FAIL for both — "Cannot find module"

- [ ] **Step 4: Implement Badge**

Create `src/lib/components/ui/Badge.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'badge-primary',
		size = '',
		class: cls = '',
		children
	}: {
		variant?: string;
		size?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<span class="badge {variant} {size} {cls}">
	{@render children?.()}
</span>
```

- [ ] **Step 5: Implement Alert**

Create `src/lib/components/ui/Alert.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'alert-info',
		class: cls = '',
		children
	}: {
		variant?: string;
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div role="alert" class="alert {variant} {cls}">
	{@render children?.()}
</div>
```

- [ ] **Step 6: Run both tests — verify they pass**

```bash
npx vitest run src/lib/components/ui/Badge.test.ts src/lib/components/ui/Alert.test.ts
```

Expected: 4 + 3 = 7 PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/components/ui/Badge.svelte src/lib/components/ui/Badge.test.ts \
        src/lib/components/ui/Alert.svelte src/lib/components/ui/Alert.test.ts
git commit -m "feat: add Badge and Alert components"
```

---

## Task 4: Card Component

**Files:**

- Create: `src/lib/components/ui/Card.svelte`
- Create: `src/lib/components/ui/Card.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/components/ui/Card.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Card from './Card.svelte';

describe('Card', () => {
	it('renders card wrapper', () => {
		const { container } = render(Card);
		expect(container.querySelector('.card')).toBeInTheDocument();
	});

	it('applies extra class', () => {
		const { container } = render(Card, { class: 'w-96' });
		expect(container.querySelector('.card')).toHaveClass('w-96');
	});

	it('renders title snippet when provided', () => {
		const titleSnippet = createRawSnippet(() => ({
			render: () => '<span>Test Title</span>'
		}));
		const { container } = render(Card, { title: titleSnippet });
		expect(container.querySelector('.card-title')).toBeInTheDocument();
		expect(container.querySelector('.card-title')).toContainHTML('Test Title');
	});

	it('does not render title element when title not provided', () => {
		const { container } = render(Card);
		expect(container.querySelector('.card-title')).not.toBeInTheDocument();
	});

	it('renders actions when provided', () => {
		const actionsSnippet = createRawSnippet(() => ({
			render: () => '<button>OK</button>'
		}));
		const { container } = render(Card, { actions: actionsSnippet });
		expect(container.querySelector('.card-actions')).toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/lib/components/ui/Card.test.ts 2>&1 | tail -5
```

Expected: FAIL — "Cannot find module './Card.svelte'"

- [ ] **Step 3: Implement Card**

Create `src/lib/components/ui/Card.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: cls = '',
		children,
		title,
		actions
	}: {
		class?: string;
		children?: Snippet;
		title?: Snippet;
		actions?: Snippet;
	} = $props();
</script>

<div class="card bg-base-100 shadow-xl {cls}">
	<div class="card-body">
		{#if title}
			<h2 class="card-title">{@render title()}</h2>
		{/if}
		{@render children?.()}
		{#if actions}
			<div class="card-actions justify-end">
				{@render actions()}
			</div>
		{/if}
	</div>
</div>
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx vitest run src/lib/components/ui/Card.test.ts
```

Expected: 5/5 PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ui/Card.svelte src/lib/components/ui/Card.test.ts
git commit -m "feat: add Card component"
```

---

## Task 5: Input Component

**Files:**

- Create: `src/lib/components/ui/Input.svelte`
- Create: `src/lib/components/ui/Input.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/components/ui/Input.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Input from './Input.svelte';

describe('Input', () => {
	it('renders an input element', () => {
		const { container } = render(Input);
		expect(container.querySelector('input')).toBeInTheDocument();
	});

	it('applies input class and variant', () => {
		const { container } = render(Input, { variant: 'input-bordered' });
		expect(container.querySelector('input')).toHaveClass('input', 'input-bordered');
	});

	it('renders label when provided', () => {
		const { getByText } = render(Input, { label: 'อีเมล' });
		expect(getByText('อีเมล')).toBeInTheDocument();
	});

	it('does not render label when not provided', () => {
		const { container } = render(Input);
		expect(container.querySelector('.label')).not.toBeInTheDocument();
	});

	it('sets placeholder', () => {
		const { container } = render(Input, { placeholder: 'กรุณากรอก' });
		expect(container.querySelector('input')).toHaveAttribute('placeholder', 'กรุณากรอก');
	});

	it('renders error message with text-error class', () => {
		const { getByText } = render(Input, { error: 'ข้อมูลไม่ถูกต้อง' });
		expect(getByText('ข้อมูลไม่ถูกต้อง')).toHaveClass('text-error');
	});

	it('sets input type', () => {
		const { container } = render(Input, { type: 'email' });
		expect(container.querySelector('input')).toHaveAttribute('type', 'email');
	});
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/lib/components/ui/Input.test.ts 2>&1 | tail -5
```

Expected: FAIL — "Cannot find module './Input.svelte'"

- [ ] **Step 3: Implement Input**

Create `src/lib/components/ui/Input.svelte`:

```svelte
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		label = '',
		placeholder = '',
		type = 'text',
		variant = '',
		error = '',
		class: cls = '',
		...rest
	}: {
		label?: string;
		placeholder?: string;
		type?: string;
		variant?: string;
		error?: string;
		class?: string;
	} & Omit<HTMLInputAttributes, 'class' | 'type' | 'placeholder'> = $props();
</script>

<label class="form-control w-full">
	{#if label}
		<div class="label">
			<span class="label-text">{label}</span>
		</div>
	{/if}
	<input {type} {placeholder} class="input {variant} {cls}" {...rest} />
	{#if error}
		<div class="label">
			<span class="label-text-alt text-error">{error}</span>
		</div>
	{/if}
</label>
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx vitest run src/lib/components/ui/Input.test.ts
```

Expected: 7/7 PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ui/Input.svelte src/lib/components/ui/Input.test.ts
git commit -m "feat: add Input component"
```

---

## Task 6: Select + Toggle Components

**Files:**

- Create: `src/lib/components/ui/Select.svelte` + `Select.test.ts`
- Create: `src/lib/components/ui/Toggle.svelte` + `Toggle.test.ts`

- [ ] **Step 1: Write Select failing test**

Create `src/lib/components/ui/Select.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Select from './Select.svelte';

describe('Select', () => {
	it('renders a select element', () => {
		const { container } = render(Select);
		expect(container.querySelector('select')).toBeInTheDocument();
	});

	it('applies select class and variant', () => {
		const { container } = render(Select, { variant: 'select-bordered' });
		expect(container.querySelector('select')).toHaveClass('select', 'select-bordered');
	});

	it('renders label when provided', () => {
		const { getByText } = render(Select, { label: 'สถานะ' });
		expect(getByText('สถานะ')).toBeInTheDocument();
	});

	it('does not render label when not provided', () => {
		const { container } = render(Select);
		expect(container.querySelector('.label')).not.toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Write Toggle failing test**

Create `src/lib/components/ui/Toggle.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Toggle from './Toggle.svelte';

describe('Toggle', () => {
	it('renders a checkbox input', () => {
		const { container } = render(Toggle);
		const input = container.querySelector('input');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('type', 'checkbox');
	});

	it('applies toggle class and variant', () => {
		const { container } = render(Toggle, { variant: 'toggle-primary' });
		expect(container.querySelector('input')).toHaveClass('toggle', 'toggle-primary');
	});

	it('renders label text when provided', () => {
		const { getByText } = render(Toggle, { label: 'เปิดการแจ้งเตือน' });
		expect(getByText('เปิดการแจ้งเตือน')).toBeInTheDocument();
	});
});
```

- [ ] **Step 3: Run both tests — verify they fail**

```bash
npx vitest run src/lib/components/ui/Select.test.ts src/lib/components/ui/Toggle.test.ts 2>&1 | tail -5
```

Expected: FAIL both — "Cannot find module"

- [ ] **Step 4: Implement Select**

Create `src/lib/components/ui/Select.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	let {
		label = '',
		variant = '',
		class: cls = '',
		children,
		...rest
	}: {
		label?: string;
		variant?: string;
		class?: string;
		children?: Snippet;
	} & Omit<HTMLSelectAttributes, 'class'> = $props();
</script>

<label class="form-control w-full">
	{#if label}
		<div class="label">
			<span class="label-text">{label}</span>
		</div>
	{/if}
	<select class="select {variant} {cls}" {...rest}>
		{@render children?.()}
	</select>
</label>
```

- [ ] **Step 5: Implement Toggle**

Create `src/lib/components/ui/Toggle.svelte`:

```svelte
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		label = '',
		variant = '',
		class: cls = '',
		...rest
	}: {
		label?: string;
		variant?: string;
		class?: string;
	} & Omit<HTMLInputAttributes, 'class' | 'type'> = $props();
</script>

<label class="label cursor-pointer gap-4">
	{#if label}
		<span class="label-text">{label}</span>
	{/if}
	<input type="checkbox" class="toggle {variant} {cls}" {...rest} />
</label>
```

- [ ] **Step 6: Run both tests — verify they pass**

```bash
npx vitest run src/lib/components/ui/Select.test.ts src/lib/components/ui/Toggle.test.ts
```

Expected: 4 + 3 = 7 PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/components/ui/Select.svelte src/lib/components/ui/Select.test.ts \
        src/lib/components/ui/Toggle.svelte src/lib/components/ui/Toggle.test.ts
git commit -m "feat: add Select and Toggle components"
```

---

## Task 7: Avatar Component

**Files:**

- Create: `src/lib/components/ui/Avatar.svelte`
- Create: `src/lib/components/ui/Avatar.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/components/ui/Avatar.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Avatar from './Avatar.svelte';

describe('Avatar', () => {
	it('renders avatar wrapper', () => {
		const { container } = render(Avatar);
		expect(container.querySelector('.avatar')).toBeInTheDocument();
	});

	it('renders img when src is provided', () => {
		const { container } = render(Avatar, { src: '/test.jpg', alt: 'Test' });
		const img = container.querySelector('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', '/test.jpg');
		expect(img).toHaveAttribute('alt', 'Test');
	});

	it('renders placeholder text when no src', () => {
		const { getByText } = render(Avatar, { placeholder: 'SK' });
		expect(getByText('SK')).toBeInTheDocument();
	});

	it('adds placeholder class when placeholder provided and no src', () => {
		const { container } = render(Avatar, { placeholder: 'SK' });
		expect(container.querySelector('.avatar')).toHaveClass('placeholder');
	});

	it('applies size class to inner div', () => {
		const { container } = render(Avatar, { size: 'w-16' });
		expect(container.querySelector('.avatar > div')).toHaveClass('w-16');
	});
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/lib/components/ui/Avatar.test.ts 2>&1 | tail -5
```

Expected: FAIL — "Cannot find module './Avatar.svelte'"

- [ ] **Step 3: Implement Avatar**

Create `src/lib/components/ui/Avatar.svelte`:

```svelte
<script lang="ts">
	let {
		src = '',
		alt = '',
		size = 'w-10',
		shape = 'rounded-full',
		placeholder = '',
		class: cls = ''
	}: {
		src?: string;
		alt?: string;
		size?: string;
		shape?: string;
		placeholder?: string;
		class?: string;
	} = $props();

	const isPlaceholder = $derived(!src && !!placeholder);
</script>

<div class="avatar {isPlaceholder ? 'placeholder' : ''} {cls}">
	<div class="{size} {shape} bg-neutral text-neutral-content">
		{#if src}
			<img {src} {alt} />
		{:else if placeholder}
			<span>{placeholder}</span>
		{/if}
	</div>
</div>
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx vitest run src/lib/components/ui/Avatar.test.ts
```

Expected: 5/5 PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ui/Avatar.svelte src/lib/components/ui/Avatar.test.ts
git commit -m "feat: add Avatar component"
```

---

## Task 8: Navbar Component

**Files:**

- Create: `src/lib/components/ui/Navbar.svelte`
- Create: `src/lib/components/ui/Navbar.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/components/ui/Navbar.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Navbar from './Navbar.svelte';

describe('Navbar', () => {
	it('renders navbar wrapper', () => {
		const { container } = render(Navbar);
		expect(container.querySelector('.navbar')).toBeInTheDocument();
	});

	it('applies extra class', () => {
		const { container } = render(Navbar, { class: 'bg-primary' });
		expect(container.querySelector('.navbar')).toHaveClass('bg-primary');
	});

	it('renders start slot when provided', () => {
		const startSnippet = createRawSnippet(() => ({
			render: () => '<span>Logo</span>'
		}));
		const { container } = render(Navbar, { start: startSnippet });
		expect(container.querySelector('.navbar-start')).toBeInTheDocument();
		expect(container.querySelector('.navbar-start')).toContainHTML('Logo');
	});

	it('renders end slot when provided', () => {
		const endSnippet = createRawSnippet(() => ({
			render: () => '<button>Login</button>'
		}));
		const { container } = render(Navbar, { end: endSnippet });
		expect(container.querySelector('.navbar-end')).toBeInTheDocument();
	});

	it('does not render empty slot wrappers', () => {
		const { container } = render(Navbar);
		expect(container.querySelector('.navbar-start')).not.toBeInTheDocument();
		expect(container.querySelector('.navbar-center')).not.toBeInTheDocument();
		expect(container.querySelector('.navbar-end')).not.toBeInTheDocument();
	});
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/lib/components/ui/Navbar.test.ts 2>&1 | tail -5
```

Expected: FAIL — "Cannot find module './Navbar.svelte'"

- [ ] **Step 3: Implement Navbar**

Create `src/lib/components/ui/Navbar.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: cls = '',
		start,
		center,
		end
	}: {
		class?: string;
		start?: Snippet;
		center?: Snippet;
		end?: Snippet;
	} = $props();
</script>

<div class="navbar bg-base-100 {cls}">
	{#if start}
		<div class="navbar-start">{@render start()}</div>
	{/if}
	{#if center}
		<div class="navbar-center">{@render center()}</div>
	{/if}
	{#if end}
		<div class="navbar-end">{@render end()}</div>
	{/if}
</div>
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx vitest run src/lib/components/ui/Navbar.test.ts
```

Expected: 5/5 PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ui/Navbar.svelte src/lib/components/ui/Navbar.test.ts
git commit -m "feat: add Navbar component"
```

---

## Task 9: Dropdown Component

**Files:**

- Create: `src/lib/components/ui/Dropdown.svelte`
- Create: `src/lib/components/ui/Dropdown.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/components/ui/Dropdown.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Dropdown from './Dropdown.svelte';

const triggerSnippet = createRawSnippet(() => ({
	render: () => '<button tabindex="0">Open</button>'
}));

describe('Dropdown', () => {
	it('renders dropdown wrapper', () => {
		const { container } = render(Dropdown, { trigger: triggerSnippet });
		expect(container.querySelector('.dropdown')).toBeInTheDocument();
	});

	it('renders trigger content', () => {
		const { getByText } = render(Dropdown, { trigger: triggerSnippet });
		expect(getByText('Open')).toBeInTheDocument();
	});

	it('renders dropdown-content list', () => {
		const { container } = render(Dropdown, { trigger: triggerSnippet });
		expect(container.querySelector('.dropdown-content')).toBeInTheDocument();
	});

	it('applies extra class', () => {
		const { container } = render(Dropdown, { trigger: triggerSnippet, class: 'dropdown-end' });
		expect(container.querySelector('.dropdown')).toHaveClass('dropdown-end');
	});
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/lib/components/ui/Dropdown.test.ts 2>&1 | tail -5
```

Expected: FAIL — "Cannot find module './Dropdown.svelte'"

- [ ] **Step 3: Implement Dropdown**

Create `src/lib/components/ui/Dropdown.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: cls = '',
		trigger,
		children
	}: {
		class?: string;
		trigger: Snippet;
		children?: Snippet;
	} = $props();
</script>

<div class="dropdown {cls}">
	{@render trigger()}
	<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
		{@render children?.()}
	</ul>
</div>
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx vitest run src/lib/components/ui/Dropdown.test.ts
```

Expected: 4/4 PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ui/Dropdown.svelte src/lib/components/ui/Dropdown.test.ts
git commit -m "feat: add Dropdown component"
```

---

## Task 10: Modal Component

**Files:**

- Create: `src/lib/components/ui/Modal.svelte`
- Create: `src/lib/components/ui/Modal.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/components/ui/Modal.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Modal from './Modal.svelte';

beforeEach(() => {
	HTMLDialogElement.prototype.showModal = vi.fn();
	HTMLDialogElement.prototype.close = vi.fn();
});

describe('Modal', () => {
	it('renders a dialog element', () => {
		const { container } = render(Modal);
		expect(container.querySelector('dialog')).toBeInTheDocument();
	});

	it('renders modal-box inside dialog', () => {
		const { container } = render(Modal);
		expect(container.querySelector('.modal-box')).toBeInTheDocument();
	});

	it('renders title when provided', () => {
		const { getByText } = render(Modal, { title: 'ยืนยันการลบ' });
		expect(getByText('ยืนยันการลบ')).toBeInTheDocument();
	});

	it('does not render h3 when title not provided', () => {
		const { container } = render(Modal);
		expect(container.querySelector('h3')).not.toBeInTheDocument();
	});

	it('renders actions when provided', () => {
		const actionsSnippet = createRawSnippet(() => ({
			render: () => '<button>ตกลง</button>'
		}));
		const { container } = render(Modal, { actions: actionsSnippet });
		expect(container.querySelector('.modal-action')).toBeInTheDocument();
	});

	it('calls showModal when open is true', async () => {
		render(Modal, { open: true });
		expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
	});
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npx vitest run src/lib/components/ui/Modal.test.ts 2>&1 | tail -5
```

Expected: FAIL — "Cannot find module './Modal.svelte'"

- [ ] **Step 3: Implement Modal**

Create `src/lib/components/ui/Modal.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		class: cls = '',
		children,
		actions
	}: {
		open?: boolean;
		title?: string;
		class?: string;
		children?: Snippet;
		actions?: Snippet;
	} = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (!dialog) return;
		if (open) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});
</script>

<dialog bind:this={dialog} class="modal" onclose={() => (open = false)}>
	<div class="modal-box {cls}">
		{#if title}
			<h3 class="font-bold text-lg mb-4">{title}</h3>
		{/if}
		{@render children?.()}
		{#if actions}
			<div class="modal-action">
				{@render actions()}
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npx vitest run src/lib/components/ui/Modal.test.ts
```

Expected: 6/6 PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ui/Modal.svelte src/lib/components/ui/Modal.test.ts
git commit -m "feat: add Modal component"
```

---

## Task 11: index.ts — Export All Components

**Files:**

- Create: `src/lib/components/ui/index.ts`

- [ ] **Step 1: Create index.ts**

Create `src/lib/components/ui/index.ts`:

```typescript
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

- [ ] **Step 2: Run all component tests**

```bash
npx vitest run src/lib/components/ui/
```

Expected: All tests PASS — no failures.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/ui/index.ts
git commit -m "feat: add component library index exports"
```

---

## Task 12: Component Playground Page

**Files:**

- Create: `src/routes/playground/+page.svelte`

- [ ] **Step 1: Create playground page**

Create `src/routes/playground/+page.svelte`:

```svelte
<script lang="ts">
	import {
		Alert,
		Avatar,
		Badge,
		Button,
		Card,
		Dropdown,
		Input,
		Modal,
		Navbar,
		Select,
		Toggle
	} from '$lib/components/ui';

	let modalOpen = $state(false);
	let toggleChecked = $state(false);
</script>

<Navbar>
	{#snippet start()}
		<a class="btn btn-ghost text-xl">UI Playground</a>
	{/snippet}
	{#snippet end()}
		<Badge variant="badge-success">DaisyUI v5</Badge>
	{/snippet}
</Navbar>

<main class="container mx-auto p-8 space-y-12">
	<section>
		<h2 class="text-2xl font-bold mb-4">Button</h2>
		<div class="flex flex-wrap gap-3">
			<Button>Primary</Button>
			<Button variant="btn-secondary">Secondary</Button>
			<Button variant="btn-accent">Accent</Button>
			<Button variant="btn-ghost">Ghost</Button>
			<Button variant="btn-error">Error</Button>
			<Button variant="btn-primary" size="btn-sm">Small</Button>
			<Button variant="btn-primary" size="btn-lg">Large</Button>
			<Button variant="btn-primary" disabled>Disabled</Button>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Badge</h2>
		<div class="flex flex-wrap gap-3 items-center">
			<Badge>Primary</Badge>
			<Badge variant="badge-secondary">Secondary</Badge>
			<Badge variant="badge-success">Success</Badge>
			<Badge variant="badge-warning">Warning</Badge>
			<Badge variant="badge-error">Error</Badge>
			<Badge variant="badge-neutral" size="badge-sm">Small</Badge>
			<Badge variant="badge-neutral" size="badge-lg">Large</Badge>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Alert</h2>
		<div class="space-y-3">
			<Alert variant="alert-info">ข้อมูล: นี่คือ alert-info</Alert>
			<Alert variant="alert-success">สำเร็จ: บันทึกข้อมูลเรียบร้อยแล้ว</Alert>
			<Alert variant="alert-warning">คำเตือน: กรุณาตรวจสอบข้อมูลก่อนบันทึก</Alert>
			<Alert variant="alert-error">ข้อผิดพลาด: ไม่สามารถเชื่อมต่อได้</Alert>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Card</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<Card class="w-full">
				{#snippet title()}การ์ดพื้นฐาน{/snippet}
				เนื้อหาของการ์ดสามารถใส่ข้อความหรือ component อื่นๆ ได้
				{#snippet actions()}
					<Button size="btn-sm">ดูเพิ่มเติม</Button>
				{/snippet}
			</Card>
			<Card class="w-full">
				{#snippet title()}การ์ดที่มีหลายปุ่ม{/snippet}
				การ์ดนี้มีปุ่มหลายปุ่มใน actions
				{#snippet actions()}
					<Button variant="btn-ghost" size="btn-sm">ยกเลิก</Button>
					<Button size="btn-sm">ยืนยัน</Button>
				{/snippet}
			</Card>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Input / Select / Toggle</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
			<Input label="ชื่อ" placeholder="กรอกชื่อของคุณ" variant="input-bordered" />
			<Input label="อีเมล" type="email" placeholder="example@email.com" variant="input-bordered" />
			<Input label="รหัสผ่าน" type="password" variant="input-bordered" error="รหัสผ่านไม่ถูกต้อง" />
			<Select label="สถานะ" variant="select-bordered">
				<option value="">-- เลือกสถานะ --</option>
				<option value="active">ใช้งาน</option>
				<option value="inactive">ปิดใช้งาน</option>
			</Select>
			<div class="col-span-full">
				<Toggle label="เปิดการแจ้งเตือน" variant="toggle-primary" bind:checked={toggleChecked} />
				<p class="text-sm text-base-content/60 mt-1">สถานะ: {toggleChecked ? 'เปิด' : 'ปิด'}</p>
			</div>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Avatar</h2>
		<div class="flex flex-wrap gap-4 items-center">
			<Avatar placeholder="SK" size="w-16" />
			<Avatar placeholder="AB" size="w-12" />
			<Avatar placeholder="CD" size="w-10" />
			<Avatar placeholder="EF" size="w-8" />
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Dropdown</h2>
		<div class="flex gap-4">
			<Dropdown>
				{#snippet trigger()}
					<Button tabindex={0}>เมนู ▾</Button>
				{/snippet}
				<li><a href="/playground">หน้าแรก</a></li>
				<li><a href="/playground">โปรไฟล์</a></li>
				<li><a href="/playground">ตั้งค่า</a></li>
			</Dropdown>
			<Dropdown class="dropdown-end">
				{#snippet trigger()}
					<Button variant="btn-ghost" tabindex={0}>ตัวเลือก ▾</Button>
				{/snippet}
				<li><a href="/playground">แก้ไข</a></li>
				<li><a href="/playground" class="text-error">ลบ</a></li>
			</Dropdown>
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold mb-4">Modal</h2>
		<Button onclick={() => (modalOpen = true)}>เปิด Modal</Button>
		<Modal bind:open={modalOpen} title="ยืนยันการลบข้อมูล">
			<p>คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
			{#snippet actions()}
				<Button variant="btn-ghost" onclick={() => (modalOpen = false)}>ยกเลิก</Button>
				<Button variant="btn-error" onclick={() => (modalOpen = false)}>ลบ</Button>
			{/snippet}
		</Modal>
	</section>
</main>
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -5
```

Expected: `✓ built in X.Xs` — no errors.

- [ ] **Step 3: Commit**

```bash
git add src/routes/playground/+page.svelte
git commit -m "feat: add component playground at /playground"
```

---

## Task 13: Update README.md

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Add Components section**

Append to the end of `README.md`:

````markdown
## Components

A portable DaisyUI component library built with Svelte 5. All components live in `src/lib/components/ui/`.

### Available Components

| Component  | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `Button`   | ปุ่ม — รองรับ variant, size, และ HTML button attributes ทั้งหมด |
| `Card`     | การ์ด — รองรับ title, body, และ actions snippets                |
| `Badge`    | ป้ายกำกับ — รองรับ variant และ size                             |
| `Alert`    | แจ้งเตือน — info, success, warning, error                       |
| `Input`    | ช่องกรอกข้อมูล — รองรับ label, placeholder, error message       |
| `Select`   | ตัวเลือก — รองรับ label และ option children                     |
| `Toggle`   | สวิตช์ — รองรับ label                                           |
| `Modal`    | หน้าต่าง popup — controlled ผ่าน `bind:open`                    |
| `Navbar`   | แถบนำทาง — รองรับ start, center, end snippets                   |
| `Avatar`   | รูปโปรไฟล์ — รองรับรูปภาพและตัวอักษรแทน                         |
| `Dropdown` | เมนูย่อย — รองรับ trigger snippet                               |

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
````

### Component Playground

ดู component ทั้งหมดได้ที่ [http://localhost:5173/playground](http://localhost:5173/playground) ขณะ run dev server

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
   @plugin "daisyui";
   ```
5. Import CSS in root layout: `import '../app.css'`
6. Import and use:
   ```svelte
   import {(Button, Card)} from '$lib/components/ui';
   ```

````

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -5
````

Expected: `✓ built in X.Xs`

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add Components section to README"
```

---

## Self-Review

**Spec coverage:**

- Goal 1 (11 DaisyUI components) — Tasks 2–10 ✅
- Goal 2 (portable `ui/` folder) — All components in `src/lib/components/ui/`, `index.ts` Task 11, copy instructions Task 13 ✅
- Goal 3 (Svelte 5 runes) — All components use `$props()`, `$effect()`, `$derived()`, `{@render snippet?.()}` ✅
- Goal 4 (README section) — Task 13 ✅
- Goal 5 (component playground) — Task 12 at `/playground` ✅

**Placeholder scan:** No TBDs, TODOs, or vague steps.

**Type consistency:**

- `Snippet` from `'svelte'` used consistently ✅
- `HTMLButtonAttributes`, `HTMLInputAttributes`, `HTMLSelectAttributes` from `'svelte/elements'` ✅
- `createRawSnippet` from `'svelte'` used consistently in Card, Navbar, Dropdown, Modal tests ✅
- `$bindable()` used only on Modal's `open` prop ✅
