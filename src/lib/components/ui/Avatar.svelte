<script lang="ts">
	let {
		src = '',
		alt = '',
		size = 'w-10',
		shape = 'rounded-full',
		placeholder = '',
		class: cls = ''
	}: {
		src?: string;
		alt?: string;
		size?: string;
		shape?: string;
		placeholder?: string;
		class?: string;
	} = $props();

	const isPlaceholder = $derived(!src && !!placeholder);
</script>

<div class="avatar {isPlaceholder ? 'placeholder' : ''} {cls}">
	<div class="{size} {shape} bg-neutral text-neutral-content">
		{#if src}
			<img {src} {alt} />
		{:else if placeholder}
			<span>{placeholder}</span>
		{/if}
	</div>
</div>
