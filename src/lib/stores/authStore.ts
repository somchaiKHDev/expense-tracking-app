import { writable } from 'svelte/store';

export interface UserSession {
	id: number;
	email: string;
	displayName: string;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<{
		user: UserSession | null;
		isAuthenticated: boolean;
		loading: boolean;
	}>({
		user: null,
		isAuthenticated: false,
		loading: true
	});

	return {
		subscribe,
		setSession: (user: UserSession) => {
			set({ user, isAuthenticated: true, loading: false });
		},
		clearSession: () => {
			set({ user: null, isAuthenticated: false, loading: false });
		},
		setLoading: (isLoading: boolean) => {
			update(state => ({ ...state, loading: isLoading }));
		}
	};
}

export const authStore = createAuthStore();
