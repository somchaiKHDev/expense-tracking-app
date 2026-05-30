import type { Category, Expense, ItemPrefix } from '../stores/expenseStore.svelte';

export interface User {
	id: number;
	email: string;
	passwordHash: string;
	displayName: string;
	createdAt: string;
}

// In-memory mock database state
export let users: User[] = [
	{
		id: 1,
		email: 'user@example.com',
		passwordHash: '$2a$10$X8XfUXlUoW.kS/T1jH7p1.jSsk.b8k3x1s.Ssk1m/Z1FzW2.vW5b.', // mock hash for "SecurePassword123"
		displayName: 'Somchai',
		createdAt: new Date().toISOString()
	}
];

export let categories: (Category & { user_id: number; created_at: string })[] = [
	{ id: 1, name: 'วัตถุดิบอาหาร', user_id: 1, created_at: new Date().toISOString() },
	{ id: 2, name: 'ครอบครัว', user_id: 1, created_at: new Date().toISOString() },
	{ id: 3, name: 'ของใช้', user_id: 1, created_at: new Date().toISOString() },
	{ id: 4, name: 'อาหารสัตว์', user_id: 1, created_at: new Date().toISOString() },
	{ id: 5, name: 'เครื่องสำอาง', user_id: 1, created_at: new Date().toISOString() }
];

export let prefixes: (ItemPrefix & { user_id: number; created_at: string })[] = [
	{ id: 1, prefix_text: '[วัตถุดิบ]', usage_count: 12, user_id: 1, created_at: new Date().toISOString() },
	{ id: 2, prefix_text: '[ของใช้บ้าน]', usage_count: 8, user_id: 1, created_at: new Date().toISOString() },
	{ id: 3, prefix_text: '[เดลิเวอรี่]', usage_count: 5, user_id: 1, created_at: new Date().toISOString() },
	{ id: 4, prefix_text: '[ช้อปปิ้ง]', usage_count: 3, user_id: 1, created_at: new Date().toISOString() }
];

const now = new Date();
const d = (daysAgo: number) => {
	const dt = new Date(now);
	dt.setDate(dt.getDate() - daysAgo);
	return dt.toISOString().split('T')[0];
};

export let expenses: (Expense & { user_id: number })[] = [
	{ id: 1, description: '[วัตถุดิบ] หมูสับ, เส้นใหญ่', category_id: 1, amount: 120, transaction_date: d(0), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 2, description: '[ของใช้บ้าน] ผงซักฟอก, น้ำยารีดผ้า', category_id: 3, amount: 350, transaction_date: d(1), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 3, description: '[เดลิเวอรี่] ข้าวผัดปู มื้อเย็น', category_id: 1, amount: 185, transaction_date: d(2), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 4, description: '[วัตถุดิบ] ผัก, ไข่ไก่', category_id: 1, amount: 95, transaction_date: d(3), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 5, description: 'อาหารแมว Royal Canin', category_id: 4, amount: 890, transaction_date: d(3), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 6, description: '[ช้อปปิ้ง] สกินแคร์, ครีมกันแดด', category_id: 5, amount: 650, transaction_date: d(4), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 7, description: '[วัตถุดิบ] กุ้งสด, ปลาหมึก', category_id: 1, amount: 280, transaction_date: d(5), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 8, description: 'ค่าเรียนลูก', category_id: 2, amount: 1500, transaction_date: d(5), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 9, description: '[ของใช้บ้าน] น้ำยาล้างจาน, ถุงขยะ', category_id: 3, amount: 175, transaction_date: d(6), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 10, description: '[เดลิเวอรี่] ส้มตำ, ลาบหมู', category_id: 1, amount: 210, transaction_date: d(6), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 11, description: '[วัตถุดิบ] ข้าวสาร 5 กก.', category_id: 1, amount: 199, transaction_date: d(8), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 12, description: 'ค่ายาสามัญประจำบ้าน', category_id: 2, amount: 320, transaction_date: d(10), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 13, description: '[ของใช้บ้าน] กระดาษทิชชู่, สบู่ล้างมือ', category_id: 3, amount: 215, transaction_date: d(12), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 14, description: 'อาหารสุนัข Pedigree', category_id: 4, amount: 450, transaction_date: d(15), created_at: new Date().toISOString(), user_id: 1 },
	{ id: 15, description: '[วัตถุดิบ] เนื้อวัว, มะเขือเทศ', category_id: 1, amount: 380, transaction_date: d(20), created_at: new Date().toISOString(), user_id: 1 }
];
