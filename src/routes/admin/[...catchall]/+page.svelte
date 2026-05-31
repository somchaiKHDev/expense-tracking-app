<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>404 Not Found | Admin Panel</title>
</svelte:head>

<div class="admin-not-found">
	<div class="error-code">404</div>
	<h1 class="error-title">Page Not Found</h1>
	<p class="error-message">
		The admin page <span class="path">{$page.url.pathname}</span> doesn't exist or has been moved.
	</p>
	<a href={resolve('/admin/dashboard')} class="back-button">
		← Back to Dashboard
	</a>
</div>

<style>
	.admin-not-found {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 100px);
		padding: 40px;
		text-align: center;
	}

	.error-code {
		font-size: 120px;
		font-weight: 800;
		line-height: 1;
		background: linear-gradient(135deg, #818cf8, #c084fc);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 24px;
		opacity: 0.9;
		text-shadow: 0 10px 30px rgba(129, 140, 248, 0.2);
	}

	.error-title {
		font-size: 28px;
		font-weight: 600;
		color: #f8fafc;
		margin: 0 0 16px 0;
	}

	.error-message {
		color: #94a3b8;
		font-size: 16px;
		max-width: 460px;
		line-height: 1.6;
		margin: 0 0 32px 0;
	}

	.path {
		background: rgba(255, 255, 255, 0.05);
		padding: 2px 6px;
		border-radius: 4px;
		font-family: monospace;
		color: #e2e8f0;
	}

	.back-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: rgba(129, 140, 248, 0.15);
		color: #818cf8;
		text-decoration: none;
        padding: 12px 24px;
		border-radius: 12px;
		font-weight: 500;
		transition: all 0.2s ease;
		border: 1px solid rgba(129, 140, 248, 0.3);
	}

	.back-button:hover {
		background: rgba(129, 140, 248, 0.25);
		transform: translateY(-2px);
	}
</style>
