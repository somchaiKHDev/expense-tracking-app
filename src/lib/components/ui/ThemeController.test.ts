import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ThemeController from './ThemeController.svelte';
import { brandThemes, defaultTheme } from '$lib/themes/brands.config';

describe('ThemeController', () => {
	it('renders a select element', () => {
		const { container } = render(ThemeController);
		expect(container.querySelector('select')).toBeInTheDocument();
	});

	it('shows brand themes as options', () => {
		const { container } = render(ThemeController);
		const options = container.querySelectorAll('option');
		expect(options.length).toBeGreaterThan(0);
		expect(options[0]).toHaveValue(brandThemes[0].id);
		expect(options[0]).toHaveTextContent(brandThemes[0].label);
	});

	it('selects defaultTheme (cupcake) on mount', () => {
		const { container } = render(ThemeController);
		expect(container.querySelector('select')).toHaveValue(defaultTheme);
	});

	it('sets data-theme attribute when a brand theme is selected', async () => {
		const spy = vi.spyOn(document.documentElement, 'setAttribute');
		const { container } = render(ThemeController);
		const select = container.querySelector('select')!;
		await fireEvent.change(select, { target: { value: brandThemes[0].id } });
		expect(spy).toHaveBeenCalledWith('data-theme', brandThemes[0].id);
		spy.mockRestore();
	});

});
