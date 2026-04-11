'use client';

import { useState, useMemo } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Minus, 
  TrendingUp, 
  History, 
  Info 
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { formatCurrency } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format, parseISO, startOfWeek, startOfMonth, isWithinInterval, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SavingSlotPage() {
  const { data, addSavingTransaction, currency, savingBalance } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'add' | 'use'>('all');
  const [filterTime, setFilterTime] = useState<'all' | 'week' | 'month'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  const transactions = useMemo(() => {
    const txs = [...(data.savingTransactions || [])].sort((a, b) => a.date.localeCompare(b.date));
    let balance = 0;
    return txs.map(t => {
      const amt = t.type === 'add' ? t.amount : -t.amount;
      balance += amt;
      return { ...t, balanceAfter: balance };
    }).reverse(); // Most recent first for table
  }, [data.savingTransactions]);

  const totalAdded = data.savingTransactions
    .filter(t => t.type === 'add')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalUsed = data.savingTransactions
    .filter(t => t.type === 'use')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filtering logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filterType === 'all' || t.type === filterType;
      
      const tDate = parseISO(t.date);
      const now = new Date();
      let matchesTime = true;
      
      if (filterTime === 'week') {
        matchesTime = isWithinInterval(tDate, { 
          start: startOfWeek(now, { weekStartsOn: 1 }), 
          end: now 
        });
      } else if (filterTime === 'month') {
        matchesTime = isWithinInterval(tDate, { 
          start: startOfMonth(now), 
          end: now 
        });
      }
      
      return matchesType && matchesTime;
    });
  }, [transactions, filterType, filterTime]);

  // Chart data aggregation
  const cumulativeData = useMemo(() => {
    const rawTxs = [...(data.savingTransactions || [])].sort((a, b) => a.date.localeCompare(b.date));
    const days = 30;
    const result = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const d = subDays(now, i);
      const dStr = format(d, 'yyyy-MM-dd');
      
      const addsUntil = rawTxs.filter(t => t.type === 'add' && t.date <= dStr).reduce((s, t) => s + t.amount, 0);
      const usesUntil = rawTxs.filter(t => t.type === 'use' && t.date <= dStr).reduce((s, t) => s + t.amount, 0);

      result.push({
        date: format(d, 'dd MMM', { locale: fr }),
        addedAccum: addsUntil,
        usedAccum: usesUntil,
        displayDate: format(d, 'd MMMM yyyy', { locale: fr })
      });
    }
    return result;
  }, [data.savingTransactions]);

  const handleAdd = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    addSavingTransaction({
      type: 'add',
      amount: parseFloat(amount),
      date,
      category: category || 'Dépôt Manuel',
      note
    });
    setAmount('');
    setCategory('');
    setNote('');
    setShowAddModal(false);
  };

  const handleUse = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || amt > savingBalance) return;
    addSavingTransaction({
      type: 'use',
      amount: amt,
      date,
      category: category || 'Dépense Cagnotte',
      note
    });
    setAmount('');
    setCategory('');
    setNote('');
    setShowUseModal(false);
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1240, margin: '0 auto' }}>
      
      {/* Header & Main Cards */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn-primary" 
            onClick={() => setShowAddModal(true)}
            style={{ background: '#10b981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
          >
            <Plus size={18} /> Ajouter
          </button>
          <button 
            className="btn-primary" 
            onClick={() => {
              if (savingBalance > 0) setShowUseModal(true);
            }}
            disabled={savingBalance <= 0}
            style={{ background: '#f59e0b', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)', opacity: savingBalance <= 0 ? 0.5 : 1 }}
          >
            <Minus size={18} /> Utiliser
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Solde Actuel', value: savingBalance, icon: Wallet, color: '#6366f1' },
          { label: 'Total Ajouté', value: totalAdded, icon: ArrowUpRight, color: '#10b981' },
          { label: 'Total Utilisé', value: totalUsed, icon: ArrowDownRight, color: '#f59e0b' },
          { label: 'Disponible', value: savingBalance, icon: TrendingUp, color: '#06b6d4' }
        ].map((stat, i) => (
          <div key={i} className="card animate-fade-in-up" style={{ padding: 24, animationDelay: `${i * 100}ms` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${stat.color}12`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={22} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(stat.value, currency)}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div className="card animate-fade-in-up" style={{ padding: '24px', animationDelay: '400ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Évolution de l’épargne</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Montant cumulé ajouté</p>
            </div>
            <div style={{ padding: '4px 12px', background: '#ecfdf5', borderRadius: 20, color: '#10b981', fontSize: 11, fontWeight: 700 }}>+30 jours</div>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}
                  formatter={(val: any) => [formatCurrency(Number(val), currency), 'Cumulé']}
                />
                <Area 
                  type="monotone" 
                  dataKey="addedAccum" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAdded)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card animate-fade-in-up" style={{ padding: '24px', animationDelay: '500ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Utilisation de l’épargne</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Montant cumulé utilisé</p>
            </div>
            <div style={{ padding: '4px 12px', background: '#fff7ed', borderRadius: 20, color: '#f59e0b', fontSize: 11, fontWeight: 700 }}>Activité</div>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}
                  formatter={(val: any) => [formatCurrency(Number(val), currency), 'Utilisé']}
                />
                <Area 
                  type="monotone" 
                  dataKey="usedAccum" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsed)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="card animate-fade-in-up" style={{ padding: 0, animationDelay: '600ms' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Historique des transactions</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Suivi détaillé de vos flux</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <select 
              className="input" 
              value={filterType} 
              onChange={(e: any) => setFilterType(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 13, background: '#f8fafc', width: 'auto' }}
            >
              <option value="all">Tout types</option>
              <option value="add">Ajouts</option>
              <option value="use">Retraits</option>
            </select>
            <select 
              className="input" 
              value={filterTime} 
              onChange={(e: any) => setFilterTime(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 13, background: '#f8fafc', width: 'auto' }}
            >
              <option value="all">Tout temps</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Détails</th>
                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Catégorie</th>
                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>Montant</th>
                <th style={{ padding: '12px 24px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>Solde</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8' }}>
                    <Info size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune transaction trouvée</div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 8,
                        color: t.type === 'add' ? '#10b981' : '#f59e0b',
                        fontWeight: 700, fontSize: 13
                      }}>
                        {t.type === 'add' ? <Plus size={14} /> : <Minus size={14} />}
                        {t.type === 'add' ? 'Ajout' : 'Retrait'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{t.note || (t.type === 'add' ? 'Dépôt Cagnotte' : 'Usage Cagnotte')}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: 8 }}>
                        {t.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                      {format(parseISO(t.date), 'd MMM yyyy', { locale: fr })}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 800, fontSize: 14, color: t.type === 'add' ? '#10b981' : '#ef4444' }}>
                      {t.type === 'add' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                      {formatCurrency(t.balanceAfter || 0, currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {(showAddModal || showUseModal) && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-card animate-scale-in" style={{ width: '100%', maxWidth: 450 }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                {showAddModal ? 'Ajouter à la cagnotte' : 'Utiliser la cagnotte'}
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                {showAddModal ? 'Alimentez votre réserve manuelle.' : 'Prélevez des fonds pour vos dépenses.'}
              </p>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Montant ({currency})</label>
                <input 
                  className="input" 
                  type="number" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ fontSize: 20, fontWeight: 800, padding: '14px' }}
                />
                {!showAddModal && (
                  <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 6, fontWeight: 600 }}>
                    Maximum disponible: {formatCurrency(savingBalance, currency)}
                  </div>
                )}
              </div>
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="label">{showAddModal ? 'Source (Optionnel)' : 'Catégorie / Motif'}</label>
                <input 
                  className="input" 
                  placeholder={showAddModal ? "ex. Économies, Cadeau" : "ex. Nourriture, Shopping"}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Note (Optionnel)</label>
                <textarea 
                  className="input" 
                  placeholder="Ajouter un détail..." 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ height: 80, resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => { setShowAddModal(false); setShowUseModal(false); setAmount(''); }} style={{ flex: 1 }}>Annuler</button>
              <button 
                className="btn-primary" 
                onClick={showAddModal ? handleAdd : handleUse}
                disabled={!amount || parseFloat(amount) <= 0 || (showUseModal && parseFloat(amount) > savingBalance)}
                style={{ flex: 1, background: showAddModal ? '#10b981' : '#f59e0b' }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
