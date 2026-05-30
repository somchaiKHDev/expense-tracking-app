import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import ThemeTokens from './ThemeTokens.svelte';

describe('ThemeTokens', () => {
	let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
			getPropertyValue: (prop: string) => {
				const map: Record<string, string> = {
					'--color-primary': '#f8c430',
					'--color-secondary': '#222e59',
					'--radius-box': '0.5rem',
					'--size-field': '0.25rem',
					'--border': '1px',
					'--depth': '1',
					'--noise': '0'
				};
				return map[prop] ?? '';
			}
		} as CSSStyleDeclaration);
	});

	afterEach(() => {
		getComputedStyleSpy.mockRestore();
	});

	it('renders a heading', () => {
		const { getByText } = render(ThemeTokens);
		expect(getByText('Theme Token System')).toBeInTheDocument();
	});

	it('renders color token names', () => {
		const { getAllByText, getByText } = render(ThemeTokens);
		expect(getByText('primary')).toBeInTheDocument();
		expect(getByText('secondary')).toBeInTheDocument();
		expect(getByText('error')).toBeInTheDocument();
		// base tokens
		expect(getAllByText(/^base-/).length).toBeGreaterThanOrEqual(5);
	});

	it('renders resolved color values from getComputedStyle', () => {
		const { getByText } = render(ThemeTokens);
		expect(getByText('#f8c430')).toBeInTheDocument();
		expect(getByText('#222e59')).toBeInTheDocument();
	});

	it('renders radius token names', () => {
		const { getAllByText } = render(ThemeTokens);
		// 'selector' and 'field' appear in both radius and size groups
		expect(getAllByText('selector').length).toBeGreaterThanOrEqual(1);
		expect(getAllByText('field').length).toBeGreaterThanOrEqual(1);
		expect(getAllByText('box').length).toBeGreaterThanOrEqual(1);
	});

	it('renders other token labels', () => {
		const { getByText } = render(ThemeTokens);
		expect(getByText('border')).toBeInTheDocument();
		expect(getByText('depth')).toBeInTheDocument();
		expect(getByText('noise')).toBeInTheDocument();
	});

	it('shows — fallback for tokens not in the mock', () => {
		const { getAllByText } = render(ThemeTokens);
		// All tokens not in the mock map return '' → display '—'
		const dashes = getAllByText('—');
		expect(dashes.length).toBeGreaterThan(0);
	});

	it('does not crash when getComputedStyle returns empty string for all tokens', () => {
		getComputedStyleSpy.mockReturnValue({
			getPropertyValue: () => ''
		} as CSSStyleDeclaration);
		expect(() => render(ThemeTokens)).not.toThrow();
	});

	it('re-reads tokens when data-theme attribute changes', async () => {
		const { getByText } = render(ThemeTokens);
		getComputedStyleSpy.mockReturnValue({
			getPropertyValue: (prop: string) =>
				prop === '--color-primary' ? '#abc123' : ''
		} as CSSStyleDeclaration);
		document.documentElement.setAttribute('data-theme', 'dark');
		await tick();
		expect(getByText('#abc123')).toBeInTheDocument();
	});
});
