import { authStore } from './stores/authStore';
import { useLoading } from './stores/loading.svelte';

// Simple Fetch Wrapper
async function request<T>(url: string, options?: RequestInit): Promise<T> {
	const loading = useLoading();
	return loading.wrap(async () => {
		const res = await fetch(url, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers
			}
		});

		if (!res.ok) {
			// Auto clear session if 401 Unauthorized
			if (res.status === 401) {
				authStore.clearSession();
			}
			const errBody = await res.json().catch(() => ({}));
			throw new Error(errBody.error || errBody.message || 'API request failed');
		}

		// For DELETE or empty responses
		if (res.status === 204) {
			return {} as T;
		}

		return res.json() as Promise<T>;
	});
}

export const api = {
	get: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'GET' }),
	post: <T>(url: string, body?: any, options?: RequestInit) => request<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
	put: <T>(url: string, body?: any, options?: RequestInit) => request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
	delete: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'DELETE' })
};

