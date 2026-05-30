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
