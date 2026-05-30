<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';

	let isLoading = $state(false);

	async function handleGoogleLogin() {
		isLoading = true;
		await signIn('google', { callbackUrl: '/' });
	}
</script>

<svelte:head>
	<title>เข้าสู่ระบบ — Expense Tracker</title>
	<meta name="description" content="เข้าสู่ระบบเพื่อจัดการค่าใช้จ่ายส่วนตัวของคุณ" />
</svelte:head>

<div class="login-page">
	<!-- Background decorations -->
	<div class="bg-orb bg-orb-1"></div>
	<div class="bg-orb bg-orb-2"></div>
	<div class="bg-orb bg-orb-3"></div>

	<div class="login-card">
		<!-- Logo & Header -->
		<div class="card-header">
			<div class="logo-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="2" y="5" width="20" height="14" rx="3" />
					<path d="M2 10h20" />
					<path d="M7 15h2" />
					<path d="M11 15h4" />
				</svg>
			</div>
			<h1 class="app-title">Expense Tracker</h1>
			<p class="app-subtitle">ติดตามค่าใช้จ่ายส่วนตัวได้ง่ายๆ</p>
		</div>

		<!-- Divider -->
		<div class="divider">
			<span>เข้าสู่ระบบด้วย</span>
		</div>

		<!-- Google Login Button -->
		<button
			class="google-btn"
			onclick={handleGoogleLogin}
			disabled={isLoading}
			id="google-login-btn"
		>
			{#if isLoading}
				<div class="spinner"></div>
				<span>กำลังเข้าสู่ระบบ...</span>
			{:else}
				<svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						fill="#4285F4"
					/>
					<path
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						fill="#34A853"
					/>
					<path
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						fill="#FBBC05"
					/>
					<path
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						fill="#EA4335"
					/>
				</svg>
				<span>เข้าสู่ระบบด้วย Google</span>
			{/if}
		</button>

		<!-- Footer note -->
		<p class="privacy-note">
			การเข้าสู่ระบบแสดงว่าคุณยอมรับ<br />การเก็บข้อมูลเพื่อใช้งานแอปพลิเคชัน
		</p>
	</div>
</div>

<style>
	.login-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
		padding: 1.5rem;
		position: relative;
		overflow: hidden;
	}

	/* Background Orbs */
	.bg-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.3;
		animation: float 8s ease-in-out infinite;
		pointer-events: none;
	}

	.bg-orb-1 {
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, #6366f1, transparent);
		top: -10%;
		left: -10%;
		animation-delay: 0s;
	}

	.bg-orb-2 {
		width: 350px;
		height: 350px;
		background: radial-gradient(circle, #8b5cf6, transparent);
		bottom: -10%;
		right: -5%;
		animation-delay: -3s;
	}

	.bg-orb-3 {
		width: 250px;
		height: 250px;
		background: radial-gradient(circle, #06b6d4, transparent);
		top: 50%;
		right: 20%;
		animation-delay: -6s;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0px) scale(1); }
		50% { transform: translateY(-30px) scale(1.05); }
	}

	/* Login Card */
	.login-card {
		position: relative;
		z-index: 10;
		width: 100%;
		max-width: 420px;
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 24px;
		padding: 2.5rem 2rem;
		box-shadow:
			0 32px 64px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.05) inset;
		animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(32px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Header */
	.card-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.logo-icon {
		width: 72px;
		height: 72px;
		margin: 0 auto 1.25rem;
		background: linear-gradient(135deg, #6366f1, #8b5cf6);
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
	}

	.logo-icon svg {
		width: 36px;
		height: 36px;
	}

	.app-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #ffffff;
		margin: 0 0 0.5rem;
		letter-spacing: -0.02em;
	}

	.app-subtitle {
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.55);
		margin: 0;
	}

	/* Divider */
	.divider {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: rgba(255, 255, 255, 0.12);
	}

	.divider span {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.4);
		white-space: nowrap;
	}

	/* Google Button */
	.google-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 0.875rem 1.5rem;
		background: rgba(255, 255, 255, 0.95);
		color: #1a1a2e;
		border: none;
		border-radius: 14px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
		letter-spacing: 0.01em;
	}

	.google-btn:hover:not(:disabled) {
		background: #ffffff;
		transform: translateY(-2px);
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
	}

	.google-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.google-btn:disabled {
		opacity: 0.75;
		cursor: not-allowed;
	}

	.google-icon {
		width: 22px;
		height: 22px;
		flex-shrink: 0;
	}

	/* Spinner */
	.spinner {
		width: 20px;
		height: 20px;
		border: 2.5px solid rgba(99, 102, 241, 0.25);
		border-top-color: #6366f1;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Privacy note */
	.privacy-note {
		text-align: center;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.3);
		margin: 1.25rem 0 0;
		line-height: 1.6;
	}
</style>
