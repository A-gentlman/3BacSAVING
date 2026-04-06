export interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  createdAt: string;
  deadline?: string;
  completed: boolean;
  completedAt?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  recurring: boolean;
  category: string;
  paidAt?: string;
}

export interface Purchase {
  id: string;
  name: string;
  amount: number;
  category?: string;
  date: string;
  note?: string;
}

export interface SavingsDeposit {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note?: string;
}

export type Category =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'utilities'
  | 'subscriptions'
  | 'other';

export type BillCategory =
  | 'rent'
  | 'utilities'
  | 'subscriptions'
  | 'insurance'
  | 'loan'
  | 'other';

export interface AppSettings {
  name: string;
  currency: 'MAD' | 'Riyal';
  notifications: boolean;
  reminderDays: number;
}

export interface DailyRecord {
  date: string; // yyyy-MM-dd
  status?: 'saved' | 'spent' | 'rest';
  notes?: string;
}

export interface SavingTransaction {
  id: string;
  type: 'add' | 'use';
  amount: number;
  date: string;
  category?: string;
  note?: string;
  balanceAfter: number;
}

export interface AppData {
  goals: Goal[];
  bills: Bill[];
  purchases: Purchase[];
  deposits: SavingsDeposit[];
  dailyRecords: DailyRecord[];
  totalSavings: number;
  savingBalance: number;
  savingTransactions: SavingTransaction[];
  settings?: AppSettings;
}
