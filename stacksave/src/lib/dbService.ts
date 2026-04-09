import { supabase } from './supabase';

export const dbService = {
  // Profiles
  async fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    return { data, error };
  },

  // Goals
  async fetchGoals(userId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addGoal(goal: any) {
    const { data, error } = await supabase
      .from('goals')
      .insert([goal])
      .select()
      .single();
    return { data, error };
  },

  async updateGoal(id: string, updates: any) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);
    return { data, error };
  },

  async deleteGoal(id: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Bills
  async fetchBills(userId: string) {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    return { data, error };
  },

  async addBill(bill: any) {
    const { data, error } = await supabase
      .from('bills')
      .insert([bill])
      .select()
      .single();
    return { data, error };
  },

  async updateBill(id: string, updates: any) {
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id);
    return { data, error };
  },

  async deleteBill(id: string) {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Purchases
  async fetchPurchases(userId: string) {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },

  async addPurchase(purchase: any) {
    const { data, error } = await supabase
      .from('purchases')
      .insert([purchase])
      .select()
      .single();
    return { data, error };
  },

  async deletePurchase(id: string) {
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Saving Transactions
  async fetchSavingTransactions(userId: string) {
    const { data, error } = await supabase
      .from('saving_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },

  async addSavingTransaction(transaction: any) {
    const { data, error } = await supabase
      .from('saving_transactions')
      .insert([transaction])
      .select()
      .single();
    return { data, error };
  },

  // Daily Records (Journal)
  async fetchDailyRecords(userId: string) {
    const { data, error } = await supabase
      .from('daily_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data, error };
  },

  async upsertDailyRecord(record: any) {
    const { data, error } = await supabase
      .from('daily_records')
      .upsert(record, { onConflict: 'user_id,date' })
      .select()
      .single();
    return { data, error };
  },

  // Goal Deposits
  async fetchGoalDeposits(userId: string) {
    const { data, error } = await supabase
      .from('goal_deposits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addGoalDeposit(deposit: any) {
    const { data, error } = await supabase
      .from('goal_deposits')
      .insert([deposit])
      .select()
      .single();
    return { data, error };
  },

  async resetUserData(userId: string) {
    const tables = [
      'goals',
      'bills',
      'purchases',
      'saving_transactions',
      'daily_records',
      'goal_deposits'
    ];
    
    // We execute these in parallel for speed
    const results = await Promise.all(
      tables.map(table => 
        supabase.from(table).delete().eq('user_id', userId)
      )
    );
    
    const firstError = results.find(r => r.error)?.error;
    return { error: firstError };
  }
};
