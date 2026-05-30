<script lang="ts">
	let {
		categoryId,
		categoryName
	}: {
		categoryId: number;
		categoryName: string;
	} = $props();

	const colorMap: Record<number, { bg: string; text: string; border: string }> = {
		1: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
		2: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
		3: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
		4: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
		5: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' }
	};

	const defaultColor = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100' };

	let colors = $derived(colorMap[categoryId] ?? defaultColor);
</script>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {colors.bg} {colors.text} {colors.border}">
	{categoryName}
</span>
