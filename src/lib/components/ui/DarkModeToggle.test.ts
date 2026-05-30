import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import DarkModeToggle from './DarkModeToggle.svelte';

describe('DarkModeToggle', () => {
	afterEach(() => {
		document.documentElement.removeAttribute('data-theme');
	});

	it('renders a swap element', () => {
		const { container } = render(DarkModeToggle);
		expect(container.querySelector('.swap')).toBeInTheDocument();
	});

	it('renders a checkbox input', () => {
		const { container } = render(DarkModeToggle);
		expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
	});

	it('sets data-theme to light on mount', () => {
		const spy = vi.spyOn(document.documentElement, 'setAttribute');
		render(DarkModeToggle);
		expect(spy).toHaveBeenCalledWith('data-theme', 'light');
		spy.mockRestore();
	});

	it('sets data-theme to dark when checkbox is clicked', async () => {
		const spy = vi.spyOn(document.documentElement, 'setAttribute');
		const { container } = render(DarkModeToggle);
		const checkbox = container.querySelector('input[type="checkbox"]')!;
		await fireEvent.click(checkbox);
		expect(spy).toHaveBeenCalledWith('data-theme', 'dark');
		spy.mockRestore();
	});

	it('sets data-theme back to light when clicked again', async () => {
		const spy = vi.spyOn(document.documentElement, 'setAttribute');
		const { container } = render(DarkModeToggle);
		const checkbox = container.querySelector('input[type="checkbox"]')!;
		await fireEvent.click(checkbox); // → dark
		await fireEvent.click(checkbox); // → light
		expect(spy).toHaveBeenLastCalledWith('data-theme', 'light');
		spy.mockRestore();
	});
});
