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
