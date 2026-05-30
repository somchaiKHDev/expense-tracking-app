/**
 * Expense Tracking Store — Svelte 5 runes + localStorage
 * Manages expenses, categories, and item prefixes.
 */

// ─── Types ───────────────────────────────────────────────
export interface Category {
	id: number;
	name: string;
}

export interface Expense {
	id: number;
	description: string;
	category_id: number;
	amount: number;
	transaction_date: string; // YYYY-MM-DD
	created_at: string; // ISO string
}

export interface ItemPrefix {
	id: number;
	prefix_text: string;
	usage_count: number;
}

export type SortField = 'transaction_date' | 'description' | 'category' | 'amount';
export type SortDirection = 'asc' | 'desc';

// ─── Default data ────────────────────────────────────────
const DEFAULT_CATEGORIES: Category[] = [
	{ id: 1, name: 'วัตถุดิบอาหาร' },
	{ id: 2, name: 'ครอบครัว' },
	{ id: 3, name: 'ของใช้' },
	{ id: 4, name: 'อาหารสัตว์' },
	{ id: 5, name: 'เครื่องสำอาง' }
];

const DEFAULT_PREFIXES: ItemPrefix[] = [
	{ id: 1, prefix_text: '[วัตถุดิบ]', usage_count: 12 },
	{ id: 2, prefix_text: '[ของใช้บ้าน]', usage_count: 8 },
	{ id: 3, prefix_text: '[เดลิเวอรี่]', usage_count: 5 },
	{ id: 4, prefix_text: '[ช้อปปิ้ง]', usage_count: 3 }
];

function today(): string {
	return new Date().toISOString().split('T')[0];
}

// Seed sample data
function seedExpenses(): Expense[] {
	const now = new Date();
	const d = (daysAgo: number) => {
		const dt = new Date(now);
		dt.setDate(dt.getDate() - daysAgo);
		return dt.toISOString().split('T')[0];
	};
	return [
		{ id: 1, description: '[วัตถุดิบ] หมูสับ, เส้นใหญ่', category_id: 1, amount: 120, transaction_date: d(0), created_at: new Date().toISOString() },
		{ id: 2, description: '[ของใช้บ้าน] ผงซักฟอก, น้ำยารีดผ้า', category_id: 3, amount: 350, transaction_date: d(1), created_at: new Date().toISOString() },
		{ id: 3, description: '[เดลิเวอรี่] ข้าวผัดปู มื้อเย็น', category_id: 1, amount: 185, transaction_date: d(2), created_at: new Date().toISOString() },
		{ id: 4, description: '[วัตถุดิบ] ผัก, ไข่ไก่', category_id: 1, amount: 95, transaction_date: d(3), created_at: new Date().toISOString() },
		{ id: 5, description: 'อาหารแมว Royal Canin', category_id: 4, amount: 890, transaction_date: d(3), created_at: new Date().toISOString() },
		{ id: 6, description: '[ช้อปปิ้ง] สกินแคร์, ครีมกันแดด', category_id: 5, amount: 650, transaction_date: d(4), created_at: new Date().toISOString() },
		{ id: 7, description: '[วัตถุดิบ] กุ้งสด, ปลาหมึก', category_id: 1, amount: 280, transaction_date: d(5), created_at: new Date().toISOString() },
		{ id: 8, description: 'ค่าเรียนลูก', category_id: 2, amount: 1500, transaction_date: d(5), created_at: new Date().toISOString() },
		{ id: 9, description: '[ของใช้บ้าน] น้ำยาล้างจาน, ถุงขยะ', category_id: 3, amount: 175, transaction_date: d(6), created_at: new Date().toISOString() },
		{ id: 10, description: '[เดลิเวอรี่] ส้มตำ, ลาบหมู', category_id: 1, amount: 210, transaction_date: d(6), created_at: new Date().toISOString() },
		{ id: 11, description: '[วัตถุดิบ] ข้าวสาร 5 กก.', category_id: 1, amount: 199, transaction_date: d(8), created_at: new Date().toISOString() },
		{ id: 12, description: 'ค่ายาสามัญประจำบ้าน', category_id: 2, amount: 320, transaction_date: d(10), created_at: new Date().toISOString() },
		{ id: 13, description: '[ของใช้บ้าน] กระดาษทิชชู่, สบู่ล้างมือ', category_id: 3, amount: 215, transaction_date: d(12), created_at: new Date().toISOString() },
		{ id: 14, description: 'อาหารสุนัข Pedigree', category_id: 4, amount: 450, transaction_date: d(15), created_at: new Date().toISOString() },
		{ id: 15, description: '[วัตถุดิบ] เนื้อวัว, มะเขือเทศ', category_id: 1, amount: 380, transaction_date: d(20), created_at: new Date().toISOString() },
	];
}

// ─── LocalStorage helpers ────────────────────────────────
function loadFromStorage<T>(key: string, fallback: T): T {
	if (typeof window === 'undefined') return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

function saveToStorage<T>(key: string, value: T): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// storage full — ignore
	}
}

// ─── Date helpers ────────────────────────────────────────
function getMonday(d: Date): Date {
	const day = d.getDay();
	const diff = d.getDate() - day + (day === 0 ? -6 : 1);
	const monday = new Date(d);
	monday.setDate(diff);
	monday.setHours(0, 0, 0, 0);
	return monday;
}

function getSunday(d: Date): Date {
	const monday = getMonday(d);
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	sunday.setHours(23, 59, 59, 999);
	return sunday;
}

// ─── Store class ─────────────────────────────────────────
class ExpenseStore {
	// Core state
	expenses = $state<Expense[]>([]);
	categories = $state<Category[]>([]);
	prefixes = $state<ItemPrefix[]>([]);

	// Filters
	searchQuery = $state('');
	filterCategoryId = $state<number | null>(null);
	filterStartDate = $state('');
	filterEndDate = $state('');

	// Sort
	sortField = $state<SortField>('transaction_date');
	sortDirection = $state<SortDirection>('desc');

	// Pagination
	currentPage = $state(1);
	pageSize = $state(10);

	// UI state
	editingExpense = $state<Expense | null>(null);

	private _nextExpenseId = $state(100);
	private _nextPrefixId = $state(100);

	constructor() {
		// Load from localStorage on client
		if (typeof window !== 'undefined') {
			this.categories = loadFromStorage('exp_categories', DEFAULT_CATEGORIES);
			this.prefixes = loadFromStorage('exp_prefixes', DEFAULT_PREFIXES);
			const storedExpenses = loadFromStorage<Expense[] | null>('exp_expenses', null);
			if (storedExpenses && storedExpenses.length > 0) {
				this.expenses = storedExpenses;
			} else {
				this.expenses = seedExpenses();
				saveToStorage('exp_expenses', this.expenses);
			}
			this._nextExpenseId = Math.max(0, ...this.expenses.map((e) => e.id)) + 1;
			this._nextPrefixId = Math.max(0, ...this.prefixes.map((p) => p.id)) + 1;
		}
	}

	// ─── Persist helpers ────
	private _saveExpenses() {
		saveToStorage('exp_expenses', this.expenses);
	}
	private _saveCategories() {
		saveToStorage('exp_categories', this.categories);
	}
	private _savePrefixes() {
		saveToStorage('exp_prefixes', this.prefixes);
	}

	// ─── Expense CRUD ───────
	addExpense(data: Omit<Expense, 'id' | 'created_at'>) {
		const expense: Expense = {
			...data,
			id: this._nextExpenseId++,
			created_at: new Date().toISOString()
		};
		this.expenses = [expense, ...this.expenses];
		this._saveExpenses();
		return expense;
	}

	updateExpense(id: number, data: Partial<Omit<Expense, 'id' | 'created_at'>>) {
		this.expenses = this.expenses.map((e) => (e.id === id ? { ...e, ...data } : e));
		this._saveExpenses();
	}

	deleteExpense(id: number) {
		this.expenses = this.expenses.filter((e) => e.id !== id);
		this._saveExpenses();
	}

	// ─── Prefix operations ──
	addPrefix(text: string) {
		if (this.prefixes.some((p) => p.prefix_text === text)) return;
		this.prefixes = [
			...this.prefixes,
			{ id: this._nextPrefixId++, prefix_text: text, usage_count: 0 }
		];
		this._savePrefixes();
	}

	incrementPrefixUsage(id: number) {
		this.prefixes = this.prefixes.map((p) =>
			p.id === id ? { ...p, usage_count: p.usage_count + 1 } : p
		);
		this._savePrefixes();
	}

	deletePrefix(id: number) {
		this.prefixes = this.prefixes.filter((p) => p.id !== id);
		this._savePrefixes();
	}

	// ─── Category helpers ───
	getCategoryName(id: number): string {
		return this.categories.find((c) => c.id === id)?.name ?? 'ไม่ระบุ';
	}

	// ─── Sorted prefixes (by usage desc) ─────
	get sortedPrefixes(): ItemPrefix[] {
		return [...this.prefixes].sort((a, b) => b.usage_count - a.usage_count);
	}

	// ─── Filtered + sorted + paginated expenses ─────
	get filteredExpenses(): Expense[] {
		let result = [...this.expenses];

		// Search
		if (this.searchQuery.trim()) {
			const q = this.searchQuery.trim().toLowerCase();
			result = result.filter((e) => e.description.toLowerCase().includes(q));
		}

		// Category filter
		if (this.filterCategoryId !== null) {
			result = result.filter((e) => e.category_id === this.filterCategoryId);
		}

		// Date range filter
		if (this.filterStartDate) {
			result = result.filter((e) => e.transaction_date >= this.filterStartDate);
		}
		if (this.filterEndDate) {
			result = result.filter((e) => e.transaction_date <= this.filterEndDate);
		}

		// Sort
		result.sort((a, b) => {
			let cmp = 0;
			switch (this.sortField) {
				case 'transaction_date':
					cmp = a.transaction_date.localeCompare(b.transaction_date);
					break;
				case 'description':
					cmp = a.description.localeCompare(b.description, 'th');
					break;
				case 'category':
					cmp = this.getCategoryName(a.category_id).localeCompare(
						this.getCategoryName(b.category_id),
						'th'
					);
					break;
				case 'amount':
					cmp = a.amount - b.amount;
					break;
			}
			return this.sortDirection === 'asc' ? cmp : -cmp;
		});

		return result;
	}

	get totalFilteredExpenses(): number {
		return this.filteredExpenses.length;
	}

	get totalPages(): number {
		return Math.max(1, Math.ceil(this.filteredExpenses.length / this.pageSize));
	}

	get paginatedExpenses(): Expense[] {
		const start = (this.currentPage - 1) * this.pageSize;
		return this.filteredExpenses.slice(start, start + this.pageSize);
	}

	get pageTotal(): number {
		return this.paginatedExpenses.reduce((sum, e) => sum + e.amount, 0);
	}

	get filteredTotal(): number {
		return this.filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
	}

	// Toggle sort
	toggleSort(field: SortField) {
		if (this.sortField === field) {
			this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			this.sortField = field;
			this.sortDirection = field === 'transaction_date' ? 'desc' : 'asc';
		}
		this.currentPage = 1;
	}

	// ─── Summary computations ─────
	get todayTotal(): number {
		const t = today();
		return this.expenses
			.filter((e) => e.transaction_date === t)
			.reduce((sum, e) => sum + e.amount, 0);
	}

	get yesterdayTotal(): number {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		const y = d.toISOString().split('T')[0];
		return this.expenses
			.filter((e) => e.transaction_date === y)
			.reduce((sum, e) => sum + e.amount, 0);
	}

	get todayChangePercent(): number {
		if (this.yesterdayTotal === 0) return 0;
		return ((this.todayTotal - this.yesterdayTotal) / this.yesterdayTotal) * 100;
	}

	get weekTotal(): number {
		const now = new Date();
		const monday = getMonday(now).toISOString().split('T')[0];
		const sunday = getSunday(now).toISOString().split('T')[0];
		return this.expenses
			.filter((e) => e.transaction_date >= monday && e.transaction_date <= sunday)
			.reduce((sum, e) => sum + e.amount, 0);
	}

	get monthTotal(): number {
		const now = new Date();
		const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
		return this.expenses
			.filter((e) => e.transaction_date.startsWith(monthStr))
			.reduce((sum, e) => sum + e.amount, 0);
	}

	get yearTotal(): number {
		const yearStr = String(new Date().getFullYear());
		return this.expenses
			.filter((e) => e.transaction_date.startsWith(yearStr))
			.reduce((sum, e) => sum + e.amount, 0);
	}

	// Weekly trend — last 7 days
	get weeklyTrend(): { label: string; amount: number }[] {
		const dayLabels = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
		const now = new Date();
		const result: { label: string; amount: number }[] = [];

		for (let i = 6; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			const dateStr = d.toISOString().split('T')[0];
			const dayAmount = this.expenses
				.filter((e) => e.transaction_date === dateStr)
				.reduce((sum, e) => sum + e.amount, 0);
			result.push({ label: dayLabels[d.getDay()], amount: dayAmount });
		}
		return result;
	}

	// Category breakdown for current month
	get monthlyCategoryBreakdown(): { name: string; amount: number; color: string }[] {
		const now = new Date();
		const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
		const monthExpenses = this.expenses.filter((e) => e.transaction_date.startsWith(monthStr));

		const colors = ['#2A5A43', '#4D8B6C', '#83BA9B', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6'];
		const categoryTotals = new Map<number, number>();

		for (const e of monthExpenses) {
			categoryTotals.set(e.category_id, (categoryTotals.get(e.category_id) ?? 0) + e.amount);
		}

		return Array.from(categoryTotals.entries())
			.map(([catId, amount], i) => ({
				name: this.getCategoryName(catId),
				amount,
				color: colors[i % colors.length]
			}))
			.sort((a, b) => b.amount - a.amount);
	}

	// ─── Reset all data ─────
	resetData() {
		this.expenses = seedExpenses();
		this.categories = DEFAULT_CATEGORIES;
		this.prefixes = DEFAULT_PREFIXES;
		this._saveExpenses();
		this._saveCategories();
		this._savePrefixes();
	}
}

// Singleton
let _instance: ExpenseStore | null = null;

export function useExpenseStore(): ExpenseStore {
	if (!_instance) {
		_instance = new ExpenseStore();
	}
	return _instance;
}

// ─── Formatters ──────────────────────────────────────────
export function formatCurrency(amount: number): string {
	return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(dateStr: string): string {
	const d = new Date(dateStr + 'T00:00:00');
	return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}
