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
