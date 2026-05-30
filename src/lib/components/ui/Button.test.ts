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
