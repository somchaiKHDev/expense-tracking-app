import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Dropdown from './Dropdown.svelte';

const triggerSnippet = createRawSnippet(() => ({
	render: () => '<button tabindex="0">Open</button>'
}));

describe('Dropdown', () => {
	it('renders dropdown wrapper', () => {
		const { container } = render(Dropdown, { trigger: triggerSnippet });
		expect(container.querySelector('.dropdown')).toBeInTheDocument();
	});

	it('renders trigger content', () => {
		const { getByText } = render(Dropdown, { trigger: triggerSnippet });
		expect(getByText('Open')).toBeInTheDocument();
	});

	it('renders dropdown-content list', () => {
		const { container } = render(Dropdown, { trigger: triggerSnippet });
		expect(container.querySelector('.dropdown-content')).toBeInTheDocument();
	});

	it('applies extra class', () => {
		const { container } = render(Dropdown, { trigger: triggerSnippet, class: 'dropdown-end' });
		expect(container.querySelector('.dropdown')).toHaveClass('dropdown-end');
	});
});
