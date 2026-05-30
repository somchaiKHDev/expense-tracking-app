import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Card from './Card.svelte';

describe('Card', () => {
	it('renders card wrapper', () => {
		const { container } = render(Card);
		expect(container.querySelector('.card')).toBeInTheDocument();
	});

	it('applies extra class', () => {
		const { container } = render(Card, { class: 'w-96' });
		expect(container.querySelector('.card')).toHaveClass('w-96');
	});

	it('renders title snippet when provided', () => {
		const titleSnippet = createRawSnippet(() => ({
			render: () => '<span>Test Title</span>'
		}));
		const { container } = render(Card, { title: titleSnippet });
		expect(container.querySelector('.card-title')).toBeInTheDocument();
		expect(container.querySelector('.card-title')).toContainHTML('Test Title');
	});

	it('does not render title element when title not provided', () => {
		const { container } = render(Card);
		expect(container.querySelector('.card-title')).not.toBeInTheDocument();
	});

	it('renders actions when provided', () => {
		const actionsSnippet = createRawSnippet(() => ({
			render: () => '<button>OK</button>'
		}));
		const { container } = render(Card, { actions: actionsSnippet });
		expect(container.querySelector('.card-actions')).toBeInTheDocument();
	});
});
