import { defaultTheme } from './brands.config';

let brandTheme = $state(defaultTheme);
let isDark = $state(false);

function setIsDark(value: boolean) {
	isDark = value;
}

function setBrandTheme(value: string) {
	brandTheme = value;
}

function activeTheme(): string {
	return isDark ? 'dark' : brandTheme;
}

export const themeState = {
	get brandTheme() {
		return brandTheme;
	},
	get isDark() {
		return isDark;
	},
	get active() {
		return activeTheme();
	},
	setIsDark,
	setBrandTheme
};
