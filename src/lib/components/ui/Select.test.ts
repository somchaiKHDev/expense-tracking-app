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
