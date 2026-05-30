import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Avatar from './Avatar.svelte';

describe('Avatar', () => {
	it('renders avatar wrapper', () => {
		const { container } = render(Avatar);
		expect(container.querySelector('.avatar')).toBeInTheDocument();
	});

	it('renders img when src is provided', () => {
		const { container } = render(Avatar, { src: '/test.jpg', alt: 'Test' });
		const img = container.querySelector('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', '/test.jpg');
		expect(img).toHaveAttribute('alt', 'Test');
	});

	it('renders placeholder text when no src', () => {
		const { getByText } = render(Avatar, { placeholder: 'SK' });
		expect(getByText('SK')).toBeInTheDocument();
	});

	it('adds placeholder class when placeholder provided and no src', () => {
		const { container } = render(Avatar, { placeholder: 'SK' });
		expect(container.querySelector('.avatar')).toHaveClass('placeholder');
	});

	it('applies size class to inner div', () => {
		const { container } = render(Avatar, { size: 'w-16' });
		expect(container.querySelector('.avatar > div')).toHaveClass('w-16');
	});
});
