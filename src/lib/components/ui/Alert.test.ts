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
