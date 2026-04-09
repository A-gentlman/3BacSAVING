export interface Goal {
  id: string;
  user_id: string;
  title: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  color: string;
  created_at: string;
}

export interface Bill {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  status: 'paid' | 'unpaid';
  due_date: string;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  amount: number;
  note?: string;
  date: string;
  created_at: string;
}

export interface SavingsDeposit {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface SavingTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'add' | 'use';
  category?: string;
  note?: string;
  date: string;
  created_at: string;
}

export interface DailyRecord {
  id: string;
  user_id: string;
  saved_amount: number;
  spent_amount: number;
  notes?: string;
  date: string;
  created_at: string;
}

export interface AppSettings {
  name: string;
  currency: 'MAD' | 'Riyal';
  notifications: boolean;
  reminder_days: number;
}

export interface AppData {
  goals: Goal[];
  bills: Bill[];
  purchases: Purchase[];
  deposits: SavingsDeposit[];
  dailyRecords: DailyRecord[];
  savingTransactions: SavingTransaction[];
  settings?: AppSettings;
}
