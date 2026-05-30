<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		class: cls = '',
		children,
		actions
	}: {
		open?: boolean;
		title?: string;
		class?: string;
		children?: Snippet;
		actions?: Snippet;
	} = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (!dialog) return;
		if (open) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});
</script>

<dialog bind:this={dialog} class="modal" onclose={() => (open = false)}>
	<div class="modal-box {cls}">
		{#if title}
			<h3 class="font-bold text-lg mb-4">{title}</h3>
		{/if}
		{@render children?.()}
		{#if actions}
			<div class="modal-action">
				{@render actions()}
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
