export type BrandTheme = {
	id: string;
	label: string;
};

export const brandThemes: BrandTheme[] = [
	{ id: 'brand-clicknic-admin', label: 'Clicknic Admin' },
	{ id: 'brand-other', label: 'Other' }
];

export const defaultTheme = 'brand-clicknic-admin';
