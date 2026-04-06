'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, Goal, Bill, Purchase, SavingsDeposit, AppSettings, DailyRecord, SavingTransaction } from './types';
import { mockData } from './mockData';
import { format } from 'date-fns';

interface AppContextType {
  data: AppData;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addMoneyToGoal: (goalId: string, amount: number, note?: string) => void;
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  toggleBillPaid: (id: string) => void;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'date'> & { date?: string }) => void;
  deletePurchase: (id: string) => void;
  totalSpentToday: number;
  totalSpentThisWeek: number;
  currentUser: string;
  resetData: () => void;
  importData: (newData: AppData) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  upsertDailyRecord: (date: string, updates: Partial<DailyRecord>) => void;
  addSavingTransaction: (transaction: Omit<SavingTransaction, 'id' | 'balanceAfter'>) => void;
  currency: 'MAD' | 'Riyal';
}

const AppContext = createContext<AppContextType | null>(null);

export function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

const EMPTY_DATA: AppData = {
  totalSavings: 0,
  goals: [],
  bills: [],
  purchases: [],
  deposits: [],
  dailyRecords: [],
  savingBalance: 0,
  savingTransactions: [],
  settings: {
    name: 'Utilisateur',
    currency: 'MAD',
    notifications: true,
    reminderDays: 3,
  },
};

export function AppProvider({ children, currentUser }: { children: ReactNode; currentUser: string }) {
  const STORAGE_KEY = `elatrachcabinet_data_${currentUser}`;

  const [data, setData] = useState<AppData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return EMPTY_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, STORAGE_KEY]);

  const today = format(new Date(), 'yyyy-MM-dd');

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      createdAt: today,
      completed: false,
      currentAmount: 0,
    };
    setData(d => ({ ...d, goals: [newGoal, ...d.goals] }));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setData(d => ({
      ...d,
      goals: d.goals.map(g => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setData(d => ({
      ...d,
      goals: d.goals.filter(g => g.id !== id),
      deposits: d.deposits.filter(dep => dep.goalId !== id),
    }));
  };

  const addMoneyToGoal = (goalId: string, amount: number, note?: string) => {
    const deposit: SavingsDeposit = {
      id: generateId(),
      goalId,
      amount,
      date: today,
      note,
    };
    setData(d => {
      const goals = d.goals.map(g => {
        if (g.id !== goalId) return g;
        const newAmount = g.currentAmount + amount;
        const completed = newAmount >= g.targetAmount;
        return {
          ...g,
          currentAmount: Math.min(newAmount, g.targetAmount),
          completed,
          completedAt: completed && !g.completed ? today : g.completedAt,
        };
      });
      return {
        ...d,
        goals,
        deposits: [deposit, ...d.deposits],
      };
    });
  };

  const addBill = (bill: Omit<Bill, 'id'>) => {
    const newBill: Bill = { ...bill, id: generateId() };
    setData(d => ({ ...d, bills: [newBill, ...d.bills] }));
  };

  const updateBill = (id: string, updates: Partial<Bill>) => {
    setData(d => ({
      ...d,
      bills: d.bills.map(b => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const deleteBill = (id: string) => {
    setData(d => ({ ...d, bills: d.bills.filter(b => b.id !== id) }));
  };

  const toggleBillPaid = (id: string) => {
    setData(d => ({
      ...d,
      bills: d.bills.map(b =>
        b.id === id
          ? { ...b, paid: !b.paid, paidAt: !b.paid ? today : undefined }
          : b
      ),
    }));
  };

  const addPurchase = (purchase: Omit<Purchase, 'id' | 'date'> & { date?: string }) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: generateId(),
      date: purchase.date || today,
      category: purchase.category || 'other',
    };
    setData(d => ({ ...d, purchases: [newPurchase, ...d.purchases] }));
  };

  const deletePurchase = (id: string) => {
    setData(d => ({ ...d, purchases: d.purchases.filter(p => p.id !== id) }));
  };
  
  const addSavingTransaction = (transaction: Omit<SavingTransaction, 'id' | 'balanceAfter'>) => {
    setData(d => {
      const newBalance = transaction.type === 'add' 
        ? d.savingBalance + transaction.amount 
        : d.savingBalance - transaction.amount;
      
      if (newBalance < 0 && transaction.type === 'use') return d; // Prevent negative balance
      
      const newTransaction: SavingTransaction = {
        ...transaction,
        id: generateId(),
        balanceAfter: newBalance,
      };
      
      return {
        ...d,
        savingBalance: newBalance,
        savingTransactions: [newTransaction, ...(d.savingTransactions || [])],
      };
    });
  };

  const totalSpentToday = data.purchases
    .filter(p => p.date === today)
    .reduce((s, p) => s + p.amount, 0);

  // eslint-disable-next-line react-hooks/purity
  const sevenDaysAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  const totalSpentThisWeek = data.purchases
    .filter(p => p.date >= sevenDaysAgo)
    .reduce((s, p) => s + p.amount, 0);

  const resetData = () => {
    setData(EMPTY_DATA);
  };

  const importData = (newData: AppData) => {
    setData(newData);
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setData(d => ({
      ...d,
      settings: {
        ...((d.settings || EMPTY_DATA.settings) as AppSettings),
        ...updates
      }
    }));
  };

  const upsertDailyRecord = (date: string, updates: Partial<DailyRecord>) => {
    setData(d => {
      const dailyRecords = d.dailyRecords || [];
      const existingIdx = dailyRecords.findIndex(r => r.date === date);
      
      let newRecords = [...dailyRecords];
      if (existingIdx >= 0) {
        newRecords[existingIdx] = { ...newRecords[existingIdx], ...updates };
      } else {
        newRecords.push({ date, ...updates } as DailyRecord);
      }
      
      return { ...d, dailyRecords: newRecords };
    });
  };

  const currency = (data.settings?.currency || 'MAD') as 'MAD' | 'Riyal';

  return (
    <AppContext.Provider
      value={{
        data,
        addGoal,
        updateGoal,
        deleteGoal,
        addMoneyToGoal,
        addBill,
        updateBill,
        deleteBill,
        toggleBillPaid,
        addPurchase,
        deletePurchase,
        totalSpentToday,
        totalSpentThisWeek,
        currentUser,
        resetData,
        importData,
        updateSettings,
        upsertDailyRecord,
        addSavingTransaction,
        currency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
