import { api } from '../api';

// ─── Types ───────────────────────────────────────────────
export interface Category {
	id: number;
	name: string;
	monthlyLimit?: number | null;
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

// Seed defaults
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

// ─── Date helpers ────────────────────────────────────────
function getLocalISODate(d: Date = new Date()): string {
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function today(): string {
	return getLocalISODate(new Date());
}

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

	// Cache flag — categories are loaded once after login and only
	// refreshed explicitly after add/update category operations.
	categoriesLoaded = $state(false);

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
	totalFilteredExpenses = $state(0);
	totalPages = $state(1);
	filteredTotalAmount = $state(0);

	// Summary statistics (API sourced or computed)
	todayTotal = $state(0);
	yesterdayTotal = $state(0);
	todayChangePercent = $state(0);
	weekTotal = $state(0);
	monthTotal = $state(0);
	yearTotal = $state(0);

	weeklyTrend = $state<{ label: string; amount: number }[]>([]);
	monthlyCategoryBreakdown = $state<{ category_id: number; name: string; amount: number; color: string }[]>([]);

	// UI state
	editingExpense = $state<Expense | null>(null);
	loading = $state(false);

	constructor() {
		// Fetch initial metadata (categories, prefixes, stats) if authenticated (Client side).
		// NOTE: fetchExpenses() is NOT called here — page components set filters first then call it.
		if (typeof window !== 'undefined') {
			this.loadMetadata();
		}
	}

	// Load metadata only (categories, prefixes, stats) — does NOT fetch expenses.
	// Pages should call fetchExpenses() themselves after setting any filters.
	async loadMetadata() {
		this.loading = true;
		try {
			await Promise.all([
				this.fetchCategories(),
				this.fetchPrefixes(),
				this.fetchStats()
			]);
		} catch (err) {
			console.error('Failed to load store data:', err);
		} finally {
			this.loading = false;
		}
	}

	// Fetch expenses based on filters/pagination/sorting
	async fetchExpenses() {
		try {
			const params = new URLSearchParams();
			params.set('page', String(this.currentPage));
			params.set('pageSize', String(this.pageSize));
			if (this.searchQuery) params.set('search', this.searchQuery);
			if (this.filterCategoryId !== null) params.set('category_id', String(this.filterCategoryId));
			if (this.filterStartDate) params.set('startDate', this.filterStartDate);
			if (this.filterEndDate) params.set('endDate', this.filterEndDate);

			// Map sort field names
			let dbSortField = this.sortField;
			if (this.sortField === 'transaction_date') dbSortField = 'transaction_date';
			params.set('sortField', dbSortField);
			params.set('sortDirection', this.sortDirection);

			const res = await api.get<{
				data: Expense[];
				pagination: { totalItems: number; totalPages: number; currentPage: number; pageSize: number };
				totalAmount: number;
			}>(`/api/expenses?${params.toString()}`);

			this.expenses = res.data;
			this.totalFilteredExpenses = res.pagination.totalItems;
			this.totalPages = res.pagination.totalPages;
			this.filteredTotalAmount = res.totalAmount;
		} catch (err) {
			console.error('Failed to fetch expenses:', err);
		}
	}

	// Fetch categories
	// Pass force=true to bypass the cache (e.g. after add/update category).
	async fetchCategories(force = false) {
		if (!force && this.categoriesLoaded) {
			// Already loaded — skip network request
			return;
		}
		try {
			this.categories = await api.get<Category[]>('/api/categories');
			this.categoriesLoaded = true;
		} catch (err) {
			console.error('Failed to fetch categories:', err);
		}
	}

	// Fetch item prefixes
	async fetchPrefixes() {
		try {
			this.prefixes = await api.get<ItemPrefix[]>('/api/prefixes');
		} catch (err) {
			console.error('Failed to fetch prefixes:', err);
		}
	}

	// Fetch dashboard and trend stats
	async fetchStats() {
		try {
			const now = new Date();
			const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
			const res = await api.get<{
				totalSpent: number;
				categoryDistribution: { category_id: number; name: string; amount: number; percentage: number }[];
				dailyTrend: { date: string; amount: number }[];
			}>(`/api/dashboard/stats?month=${monthStr}`);

			// Map monthlyCategoryBreakdown colors
			const colors = ['#2A5A43', '#4D8B6C', '#83BA9B', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6'];
			this.monthlyCategoryBreakdown = res.categoryDistribution.map((item, i) => ({
				category_id: item.category_id,
				name: item.name,
				amount: item.amount,
				color: colors[i % colors.length]
			}));

			// Set weekly trend (last 7 days)
			const dayLabels = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
			const trend: { label: string; amount: number }[] = [];
			for (let i = 6; i >= 0; i--) {
				const d = new Date(now);
				d.setDate(d.getDate() - i);
				const dateStr = getLocalISODate(d);
				const match = res.dailyTrend.find(t => t.date === dateStr);
				trend.push({
					label: dayLabels[d.getDay()],
					amount: match ? match.amount : 0
				});
			}
			this.weeklyTrend = trend;

			// Compute totals
			this.monthTotal = res.totalSpent;

			// Fetch today total
			const t = today();
			const todayMatch = res.dailyTrend.find(item => item.date === t);
			this.todayTotal = todayMatch ? todayMatch.amount : 0;

			// Fetch yesterday total
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const yStr = getLocalISODate(yesterday);
			const yesterdayMatch = res.dailyTrend.find(item => item.date === yStr);
			this.yesterdayTotal = yesterdayMatch ? yesterdayMatch.amount : 0;

			if (this.yesterdayTotal === 0) {
				this.todayChangePercent = 0;
			} else {
				this.todayChangePercent = ((this.todayTotal - this.yesterdayTotal) / this.yesterdayTotal) * 100;
			}
		} catch (err) {
			console.error('Failed to fetch stats:', err);
		}
	}

	// ─── Expense CRUD ───────
	async addExpense(data: Omit<Expense, 'id' | 'created_at'>) {
		try {
			const newExpense = await api.post<Expense>('/api/expenses', {
				description: data.description,
				category_id: data.category_id,
				amount: data.amount,
				transaction_date: data.transaction_date
			});
			await this.fetchExpenses();
			await this.fetchStats();
			await this.fetchPrefixes(); // Count increments
			return newExpense;
		} catch (err) {
			console.error('Failed to add expense:', err);
			throw err;
		}
	}

	async updateExpense(id: number, data: Partial<Omit<Expense, 'id' | 'created_at'>>) {
		try {
			await api.put<Expense>(`/api/expenses/${id}`, data);
			await this.fetchExpenses();
			await this.fetchStats();
		} catch (err) {
			console.error('Failed to update expense:', err);
			throw err;
		}
	}

	async deleteExpense(id: number) {
		try {
			await api.delete(`/api/expenses/${id}`);
			await this.fetchExpenses();
			await this.fetchStats();
		} catch (err) {
			console.error('Failed to delete expense:', err);
			throw err;
		}
	}

	// ─── Prefix operations ──
	async addPrefix(text: string) {
		try {
			await api.post('/api/prefixes', { prefix_text: text });
			await this.fetchPrefixes();
		} catch (err) {
			console.error('Failed to add prefix:', err);
		}
	}

	async deletePrefix(id: number) {
		try {
			await api.delete(`/api/prefixes/${id}`);
			await this.fetchPrefixes();
		} catch (err) {
			console.error('Failed to delete prefix:', err);
		}
	}

	// ─── Category operations ───
	async addCategory(name: string, monthlyLimit?: number | null) {
		try {
			const newCategory = await api.post<Category>('/api/categories', { name, monthlyLimit });
			// Force-refresh categories after adding a new one
			await this.fetchCategories(true);
			return newCategory;
		} catch (err) {
			console.error('Failed to add category:', err);
			throw err;
		}
	}

	async updateCategory(id: number, name: string, monthlyLimit?: number | null) {
		try {
			const updated = await api.put<Category>(`/api/categories/${id}`, { name, monthlyLimit });
			// Force-refresh categories after editing
			await this.fetchCategories(true);
			await this.fetchStats();
			return updated;
		} catch (err) {
			console.error('Failed to update category:', err);
			throw err;
		}
	}

	getCategoryName(id: number): string {
		return this.categories.find((c) => c.id === id)?.name ?? 'ไม่ระบุ';
	}

	// Compatibility method - backend increments it automatically on POST /api/expenses if prefix matches,
	// but UI calls it immediately to show immediate feedback.
	incrementPrefixUsage(id: number) {
		this.prefixes = this.prefixes.map((p) =>
			p.id === id ? { ...p, usage_count: p.usage_count + 1 } : p
		);
	}

	// ─── Sorted prefixes (by usage desc) ─────
	get sortedPrefixes(): ItemPrefix[] {
		return [...this.prefixes].sort((a, b) => b.usage_count - a.usage_count);
	}

	// compatibility getters with old code
	get filteredExpenses(): Expense[] {
		return this.expenses;
	}

	get paginatedExpenses(): Expense[] {
		return this.expenses;
	}

	get pageTotal(): number {
		return this.expenses.reduce((sum, e) => sum + e.amount, 0);
	}

	get filteredTotal(): number {
		return this.expenses.reduce((sum, e) => sum + e.amount, 0);
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
		this.fetchExpenses();
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
