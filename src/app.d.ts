// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { DefaultSession } from '@auth/sveltekit';

declare module '@auth/sveltekit' {
	interface Session {
		user: {
			id: string;
			isAdmin?: boolean;
		} & DefaultSession['user'];
	}
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: import('@auth/sveltekit').SvelteKitAuthConfig['callbacks'] extends undefined
				? never
				: () => Promise<import('@auth/sveltekit').Session | null>;
		}
		interface PageData {
			session?: import('@auth/sveltekit').Session | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
