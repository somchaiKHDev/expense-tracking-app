import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Data is loaded client-side via fetch to the API endpoints
	return {};
};
