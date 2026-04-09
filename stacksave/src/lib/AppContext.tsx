'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { AppData, Goal, Bill, Purchase, SavingsDeposit, AppSettings, DailyRecord, SavingTransaction } from './types';
import { dbService } from './dbService';
import { format } from 'date-fns';
import { useAuth } from './AuthContext';

interface AppContextType {
  data: AppData;
  loading: boolean;
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'current_amount'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addGoalDeposit: (goalId: string, amount: number) => Promise<void>;
  addBill: (bill: Omit<Bill, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  toggleBillPaid: (id: string) => Promise<void>;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  addSavingTransaction: (transaction: Omit<SavingTransaction, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  transferFromSavingsToGoal: (goalId: string, amount: number) => Promise<void>;
  upsertDailyRecord: (date: string, updates: Partial<DailyRecord>) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  exportData: () => void;
  importData: (jsonData: string) => Promise<{ success: boolean; error?: string }>;
  resetData: () => Promise<void>;
  totalSpentToday: number;
  totalSpentThisWeek: number;
  savingBalance: number;
  currency: 'MAD' | 'Riyal';
}

const AppContext = createContext<AppContextType | null>(null);

const EMPTY_DATA: AppData = {
  goals: [],
  bills: [],
  purchases: [],
  deposits: [],
  dailyRecords: [],
  savingTransactions: [],
  settings: {
    name: 'Utilisateur',
    currency: 'MAD',
    notifications: true,
    reminder_days: 3,
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Load initial data from Supabase
  useEffect(() => {
    if (!user) {
      setData(EMPTY_DATA);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [
          { data: profiles },
          { data: goals },
          { data: bills },
          { data: purchases },
          { data: deposits },
          { data: transactions },
          { data: records }
        ] = await Promise.all([
          dbService.fetchProfile(user.id),
          dbService.fetchGoals(user.id),
          dbService.fetchBills(user.id),
          dbService.fetchPurchases(user.id),
          dbService.fetchGoalDeposits(user.id),
          dbService.fetchSavingTransactions(user.id),
          dbService.fetchDailyRecords(user.id)
        ]);

        setData({
          goals: goals || [],
          bills: bills || [],
          purchases: purchases || [],
          deposits: deposits || [],
          savingTransactions: transactions || [],
          dailyRecords: records || [],
          settings: profiles ? {
            name: profiles.name || 'Utilisateur',
            currency: profiles.currency || 'MAD',
            notifications: profiles.notifications ?? true,
            reminder_days: profiles.reminder_days ?? 3
          } : EMPTY_DATA.settings
        });
      } catch (err) {
        console.error('Error hydrating state:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Actions
  const addGoal = async (goal: any) => {
    if (!user) return;
    const { data: newGoal, error } = await dbService.addGoal({ ...goal, user_id: user.id });
    if (newGoal) setData(d => ({ ...d, goals: [newGoal, ...d.goals] }));
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { error } = await dbService.updateGoal(id, updates);
    if (!error) setData(d => ({
      ...d,
      goals: d.goals.map(g => (g.id === id ? { ...g, ...updates } : g))
    }));
  };

  const deleteGoal = async (id: string) => {
    const { error } = await dbService.deleteGoal(id);
    if (!error) setData(d => ({
      ...d,
      goals: d.goals.filter(g => g.id !== id),
      deposits: d.deposits.filter(dep => dep.goal_id !== id)
    }));
  };

  const addGoalDeposit = async (goalId: string, amount: number) => {
    if (!user) return;
    const { data: deposit, error } = await dbService.addGoalDeposit({
      goal_id: goalId,
      user_id: user.id,
      amount,
      date: today
    });

    if (deposit) {
       // Also update the goal's current_amount
       const goal = data.goals.find(g => g.id === goalId);
       if (goal) {
         const newAmount = goal.current_amount + amount;
         await dbService.updateGoal(goalId, { current_amount: newAmount });
         setData(d => ({
           ...d,
           deposits: [deposit, ...d.deposits],
           goals: d.goals.map(g => (g.id === goalId ? { ...g, current_amount: newAmount } : g))
         }));
       }
    }
  };

  const addBill = async (bill: any) => {
    if (!user) return;
    const { data: newBill, error } = await dbService.addBill({ ...bill, user_id: user.id });
    if (newBill) setData(d => ({ ...d, bills: [newBill, ...d.bills] }));
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    const { error } = await dbService.updateBill(id, updates);
    if (!error) setData(d => ({
      ...d,
      bills: d.bills.map(b => (b.id === id ? { ...b, ...updates } : b))
    }));
  };

  const deleteBill = async (id: string) => {
    const { error } = await dbService.deleteBill(id);
    if (!error) setData(d => ({ ...d, bills: d.bills.filter(b => b.id !== id) }));
  };

  const toggleBillPaid = async (id: string) => {
    const bill = data.bills.find(b => b.id === id);
    if (!bill) return;
    const updates = { status: bill.status === 'paid' ? 'unpaid' : 'paid' };
    await updateBill(id, updates as any);
  };

  const addPurchase = async (purchase: any) => {
    if (!user) return;
    const { data: newPurchase, error } = await dbService.addPurchase({ ...purchase, user_id: user.id });
    if (newPurchase) setData(d => ({ ...d, purchases: [newPurchase, ...d.purchases] }));
  };

  const deletePurchase = async (id: string) => {
    const { error } = await dbService.deletePurchase(id);
    if (!error) setData(d => ({ ...d, purchases: d.purchases.filter(p => p.id !== id) }));
  };

  const addSavingTransaction = async (transaction: any) => {
    if (!user) return;
    const { data: newTx, error } = await dbService.addSavingTransaction({ 
      ...transaction, 
      user_id: user.id,
      date: transaction.date || today 
    });
    if (newTx) setData(d => ({ ...d, savingTransactions: [newTx, ...d.savingTransactions] }));
  };

  const transferFromSavingsToGoal = async (goalId: string, amount: number) => {
    if (!user) return;
    
    // 1. Add a withdrawal from savings
    const { data: withdrawTx, error: withdrawError } = await dbService.addSavingTransaction({
      user_id: user.id,
      amount,
      type: 'use',
      category: 'Objectif',
      note: `Transfert vers objectif ${data.goals.find(g => g.id === goalId)?.title || ''}`,
      date: today
    });

    if (withdrawTx && !withdrawError) {
      // 2. Add the deposit to the goal
      await addGoalDeposit(goalId, amount);
      
      // Update local state for the withdrawal
      setData(d => ({
        ...d,
        savingTransactions: [withdrawTx, ...d.savingTransactions]
      }));
    }
  };

  const upsertDailyRecord = async (date: string, updates: Partial<DailyRecord>) => {
    if (!user) return;
    const existing = data.dailyRecords.find(r => r.date === date);
    const payload = existing 
      ? { ...existing, ...updates } 
      : { user_id: user.id, date, saved_amount: 0, spent_amount: 0, ...updates };
    
    const { data: newRecord, error } = await dbService.upsertDailyRecord(payload);
    if (newRecord) {
      setData(d => {
        const others = d.dailyRecords.filter(r => r.date !== date);
        return { ...d, dailyRecords: [newRecord, ...others] };
      });
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    if (!user) return;
    const { error } = await dbService.updateProfile(user.id, updates);
    if (!error) setData(d => ({ ...d, settings: { ...d.settings!, ...updates } }));
  };

  const exportData = () => {
    const exportObj = {
      ...data,
      exportDate: new Date().toISOString(),
      version: '2.0-cloud-sync'
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stacksave-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = async (jsonData: string) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const imported = JSON.parse(jsonData) as AppData;
      setLoading(true);

      // In a real production app, we would use a more robust batch import/sync logic.
      // For this migration, we will upsert/insert the key collections.
      
      // 1. Settings/Profile
      if (imported.settings) {
        await updateSettings(imported.settings);
      }

      // 2. Goals
      if (imported.goals?.length) {
        for (const g of imported.goals) {
          const { id, created_at, user_id, ...cleanGoal } = g as any;
          await dbService.addGoal({ ...cleanGoal, user_id: user.id });
        }
      }

      // 3. Bills
      if (imported.bills?.length) {
        for (const b of imported.bills) {
          const { id, created_at, user_id, ...cleanBill } = b as any;
          await dbService.addBill({ ...cleanBill, user_id: user.id });
        }
      }

      // 4. Purchases
      if (imported.purchases?.length) {
        for (const p of imported.purchases) {
          const { id, created_at, user_id, ...cleanPurchase } = p as any;
          await dbService.addPurchase({ ...cleanPurchase, user_id: user.id });
        }
      }

      // Refresh state from Supabase after import
      window.location.reload(); 
      return { success: true };
    } catch (err) {
      console.error('Import error:', err);
      setLoading(false);
      return { success: false, error: 'Format de fichier invalide' };
    }
  };

  const resetData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await dbService.resetUserData(user.id);
      if (error) throw error;
      
      // Clear local state immediately for a smooth experience
      setData(EMPTY_DATA);
      
      // Force reload to ensure all contexts are back to initial state
      window.location.reload();
    } catch (err) {
      console.error('Reset error:', err);
      setLoading(false);
    }
  };

  // Computed Values
  const totalSpentToday = useMemo(() => 
    data.purchases.filter(p => p.date === today).reduce((s, p) => s + p.amount, 0),
  [data.purchases, today]);

  const totalSpentThisWeek = useMemo(() => {
    const sevenDaysAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    return data.purchases.filter(p => p.date >= sevenDaysAgo).reduce((s, p) => s + p.amount, 0);
  }, [data.purchases]);

  const savingBalance = useMemo(() => 
    data.savingTransactions.reduce((acc, curr) => 
      curr.type === 'add' ? acc + curr.amount : acc - curr.amount, 0),
  [data.savingTransactions]);

  const currency = data.settings?.currency || 'MAD';

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        addGoal,
        updateGoal,
        deleteGoal,
        addGoalDeposit,
        addBill,
        updateBill,
        deleteBill,
        toggleBillPaid,
        addPurchase,
        deletePurchase,
        addSavingTransaction,
        transferFromSavingsToGoal,
        upsertDailyRecord,
        updateSettings,
        exportData,
        importData,
        resetData,
        totalSpentToday,
        totalSpentThisWeek,
        savingBalance,
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
