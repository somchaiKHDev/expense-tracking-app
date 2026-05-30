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
