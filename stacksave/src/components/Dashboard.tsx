'use client';

import { useApp } from '@/lib/AppContext';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  TrendingUp, Calendar, Tag, Target, Clock, Plus, ArrowUpRight, 
  ArrowDownRight, Receipt, Activity, ShoppingBag, Coffee
} from 'lucide-react';
import Link from 'next/link';
import { Goal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label, prefix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{prefix}{formatCurrency(payload[0].value, 'MAD')}</p>
      </div>
    );
  }
  return null;
};

// Activity Row
function ActivityRow({ activity, currency }: { activity: any; currency: string }) {
  const isPositive = activity.amount > 0;
  
  // Choose icon based on type
  let Icon = Receipt;
  let iconBg = '#fee2e2';
  let iconColor = '#ef4444';
  
  if (activity.type === 'saving' || activity.type === 'deposit') {
    Icon = TrendingUp;
    iconBg = '#e0e7ff';
    iconColor = '#6366f1';
  } else if (activity.type === 'purchase') {
    Icon = ShoppingBag;
    iconBg = '#fee2e2';
    iconColor = '#ef4444';
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid #f1f5f9',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginRight: 16
      }}>
        <Icon size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{activity.title}</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>
          {activity.category || 'Dépense'} • {format(parseISO(activity.date), "d MMM yyyy", { locale: fr })}
        </div>
      </div>
      <div style={{ 
        fontSize: 15, 
        fontWeight: 700, 
        color: isPositive ? '#10b981' : '#ef4444', 
        fontVariantNumeric: 'tabular-nums'
      }}>
        {isPositive ? '+' : ''}{formatCurrency(activity.amount, currency as any)}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, totalSpentToday, currency, savingBalance } = useApp();
  const { user } = useAuth();
  const userName = data.settings?.name || user?.user_metadata?.full_name || user?.email || 'Gentl Gym';
  
  const [showAllHistory, setShowAllHistory] = useState(false);

  const activeGoals = data.goals.filter(g => (g.current_amount < g.target_amount));
  const unpaidBills = data.bills.filter(b => b.status === 'unpaid');
  
  const recentActiveGoals = [...activeGoals].sort((a, b) => new Date((b as any).created_at).getTime() - new Date((a as any).created_at).getTime());
  const recentUnpaidBills = [...unpaidBills].sort((a, b) => new Date((b as any).created_at).getTime() - new Date((a as any).created_at).getTime());

  // Generate chart data for last 7 days
  const { chartDataResult, hasAnyChartData } = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 6);
    const days = eachDayOfInterval({ start, end });
    let hasAnyData = false;

    const result = days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLabel = format(date, 'EEE', { locale: fr });

      // Daily Expenses
      const dayExpenses = data.purchases
        .filter(p => p.date === dateStr)
        .reduce((sum, p) => sum + p.amount, 0);

      // Cumulative Savings
      const daySavings = data.savingTransactions
        .filter(t => t.date <= dateStr)
        .reduce((sum, t) => t.type === 'add' ? sum + t.amount : sum - t.amount, 0);

      if (dayExpenses > 0 || daySavings > 0) hasAnyData = true;

      return {
        day: dayLabel.replace(/^\w/, c => c.toUpperCase()),
        savings: daySavings,
        expenses: dayExpenses,
        fullDate: dateStr
      };
    });
    return { chartDataResult: result, hasAnyChartData: hasAnyData };
  }, [data.purchases, data.savingTransactions]);

  const savingsTrend = useMemo(() => {
    if (!hasAnyChartData) return "0%";
    const last = chartDataResult[chartDataResult.length - 1].savings;
    const first = chartDataResult[0].savings;
    if (first === 0) return last > 0 ? "+100%" : "0%";
    const pct = ((last - first) / first) * 100;
    return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
  }, [chartDataResult, hasAnyChartData]);

  const unifiedActivities = useMemo(() => {
    const activities: any[] = [];
    data.purchases.forEach(p => {
      activities.push({
        id: `p-${p.id}`, type: 'purchase', title: p.note || 'Achat', category: p.category, amount: -p.amount, date: p.date, rawDate: parseISO((p as any).created_at || p.date),
      });
    });
    data.deposits.forEach(d => {
      const goal = data.goals.find(g => g.id === d.goal_id);
      activities.push({
        id: `d-${d.id}`, type: 'deposit', title: goal ? `Objectif: ${goal.title}` : 'Objectif', category: 'Objectif', amount: -d.amount, date: d.created_at.split('T')[0], rawDate: parseISO(d.created_at),
      });
    });
    data.savingTransactions.forEach(s => {
      const isAdd = s.type === 'add';
      activities.push({
        id: `s-${s.id}`, type: 'saving', title: s.note || (isAdd ? 'Dépôt Cagnotte' : 'Retrait Cagnotte'), category: 'Épargne Globale', amount: isAdd ? s.amount : -s.amount, date: s.date, rawDate: parseISO((s as any).created_at || s.date),
      });
    });
    return activities.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [data.purchases, data.deposits, data.savingTransactions, data.goals]);

  return (
    <div style={{ padding: '32px 40px', width: '100%', minHeight: '100vh', paddingBottom: 100 }}>
      
      {/* Hero Greeting Card */}
      <div style={{
        background: 'linear-gradient(to right, #eef2ff, #f8fafc)',
        borderRadius: 20,
        padding: '24px 32px',
        marginBottom: 32,
        border: '1px solid rgba(99, 102, 241, 0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#312e81', marginBottom: 4 }}>
          Salut {userName}, C'est une excellente journée pour gérer vos finances.
        </h2>
        <p style={{ fontSize: 13, color: '#6366f1', fontWeight: 500 }}>
          {format(new Date(), "EEEE d MMMM, yyyy", { locale: fr }).replace(/^\w/, c => c.toUpperCase())}
        </p>
      </div>

      {/* Main KPIs Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 24 }}>
        
        {/* Épargne Globale Card */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0e7ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} />
              </div>
               <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Épargne Globale</span>
            </div>
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
              {savingsTrend}
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>{formatCurrency(savingBalance || 0, currency)}</div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 4 }}>Évolution des 7 derniers jours</div>
          </div>
          <div style={{ height: 160, width: '100%', marginTop: 'auto', marginLeft: -20, marginBottom: -10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDataResult} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={{ stroke: '#f1f5f9' }} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dépenses d'Aujourd'hui Card */}
        <div style={{ background: '#fff', borderRadius: 24, padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} />
              </div>
               <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Dépenses d'Aujourd'hui</span>
            </div>
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
              0.0%
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>{formatCurrency(totalSpentToday, currency)}</div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 4 }}>Dépenses quotidiennes (7j)</div>
          </div>
          <div style={{ height: 160, width: '100%', marginTop: 'auto', marginLeft: -20, marginBottom: -10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataResult} margin={{ top: 10, right: 0, left: 0, bottom: 0 }} barSize={16}>
                <XAxis dataKey="day" axisLine={{ stroke: '#f1f5f9' }} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 4, 4]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 32 }}>
        {/* Factures en attente */}
        <Link href="/factures" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: 20, 
            padding: '24px 32px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)', 
            border: '1px solid #f1f5f9',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            height: '100%'
          }} 
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#f1f5f9';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Receipt size={20} />
              </div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Factures en attente</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{unpaidBills.length}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706' }}>
              {unpaidBills.length === 0 ? "C'est propre !" : "À payer prochainement"}
            </div>

            {recentUnpaidBills.length > 0 && (
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                {recentUnpaidBills.slice(0, 3).map(bill => (
                  <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{bill.title}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#d97706' }}>{formatCurrency(bill.amount, currency)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Objectifs Actifs */}
        <Link href="/objectifs" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: 20, 
            padding: '24px 32px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)', 
            border: '1px solid #f1f5f9',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            height: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#f1f5f9';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Target size={20} />
              </div>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Objectifs Actifs</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{activeGoals.length}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#db2777' }}>
              {activeGoals.length === 0 ? "Prêt pour un nouveau défi ?" : "En cours de réalisation"}
            </div>

            {recentActiveGoals.length > 0 && (
              <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                {recentActiveGoals.slice(0, 3).map(goal => {
                  const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                  return (
                    <div key={goal.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{goal.title}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>{progress}%</span>
                      </div>
                      <div style={{ height: 6, width: '100%', background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #db2777, #f472b6)', borderRadius: 99 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Historique des Activités */}
      <div>
        <div style={{ background: '#fff', borderRadius: 24, padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Historique des Activités</h3>
              <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Vos 5 dernières opérations financières</p>
            </div>
            <div style={{ color: '#94a3b8' }}>
              <Clock size={20} />
            </div>
          </div>
          
          <div>
            {unifiedActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>
                Aucune activité récente.
              </div>
            ) : (
              <>
                {(showAllHistory ? unifiedActivities : unifiedActivities.slice(0, 5)).map(activity => (
                  <ActivityRow key={activity.id} activity={activity} currency={currency} />
                ))}
                
                {unifiedActivities.length > 5 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                    <button
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '10px 24px',
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#6366f1',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      {showAllHistory ? 'Réduire' : `Voir plus (${unifiedActivities.length - 5})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
