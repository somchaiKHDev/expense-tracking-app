import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Modal from './Modal.svelte';

beforeEach(() => {
	HTMLDialogElement.prototype.showModal = vi.fn();
	HTMLDialogElement.prototype.close = vi.fn();
});

describe('Modal', () => {
	it('renders a dialog element', () => {
		const { container } = render(Modal);
		expect(container.querySelector('dialog')).toBeInTheDocument();
	});

	it('renders modal-box inside dialog', () => {
		const { container } = render(Modal);
		expect(container.querySelector('.modal-box')).toBeInTheDocument();
	});

	it('renders title when provided', () => {
		const { getByText } = render(Modal, { title: 'ยืนยันการลบ' });
		expect(getByText('ยืนยันการลบ')).toBeInTheDocument();
	});

	it('does not render h3 when title not provided', () => {
		const { container } = render(Modal);
		expect(container.querySelector('h3')).not.toBeInTheDocument();
	});

	it('renders actions when provided', () => {
		const actionsSnippet = createRawSnippet(() => ({
			render: () => '<button>ตกลง</button>'
		}));
		const { container } = render(Modal, { actions: actionsSnippet });
		expect(container.querySelector('.modal-action')).toBeInTheDocument();
	});

	it('calls showModal when open is true', () => {
		render(Modal, { open: true });
		expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
	});
});
