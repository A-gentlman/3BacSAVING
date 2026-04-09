'use client';

import { useApp } from '@/lib/AppContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText,
  TrendingUp,
  ShoppingBag,
  Save,
  Check
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface DailyDetailsProps {
  date: string; // yyyy-MM-dd
  onClose: () => void;
}

export default function DailyDetails({ date, onClose }: DailyDetailsProps) {
  const { data, currency, upsertDailyRecord } = useApp();

  // Find existing record
  const existingRecord = data.dailyRecords?.find(r => r.date === date);
  
  const [notes, setNotes] = useState(existingRecord?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset state when date changes
  useEffect(() => {
    const record = data.dailyRecords?.find(r => r.date === date);
    setNotes(record?.notes || '');
  }, [date, data.dailyRecords]);

  // Derived financial data
  const dayPurchases = data.purchases.filter(p => p.date === date);
  const dayDeposits = data.deposits.filter(d => d.created_at?.startsWith(date));
  const dayBills = data.bills.filter(b => b.status === 'paid' && b.due_date === date);

  const totalSpent = dayPurchases.reduce((s, p) => s + p.amount, 0);
  const totalBills = dayBills.reduce((s, b) => s + b.amount, 0);
  const totalExpense = totalSpent + totalBills;
  const totalSaved = dayDeposits.reduce((s, d) => s + d.amount, 0);

  // Derive if there are unsaved changes
  const isDirty = notes !== (existingRecord?.notes || '');

  const handleSave = () => {
    if (!isDirty) return;
    setIsSaving(true);
    // Determine status automatically if needed, or just default to 'rest' for now as custom status was removed in simplification
    upsertDailyRecord(date, { notes });
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };

  const allTransactions = [
    ...dayPurchases.map(p => ({ ...p, type: 'purchase', label: p.note || 'Dépense' })),
    ...dayDeposits.map(d => ({ ...d, type: 'deposit', label: 'Épargne Objectif' })),
    ...dayBills.map(b => ({ ...b, type: 'bill', label: b.title }))
  ].sort((a, b) => (b as any).created_at?.localeCompare((a as any).created_at) || 0);

  return (
    <div className="animate-fade-in" style={{ padding: '0 32px 32px' }}>
      {/* Action Header (Save only) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 0 24px' }}>
        <button
          onClick={handleSave}
          className="btn-primary"
          disabled={isSaving || !isDirty}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            borderRadius: 12,
            background: isSaving ? '#94a3b8' : (isDirty ? 'var(--accent-indigo)' : '#10b981'),
            color: 'white',
            border: 'none',
            fontWeight: 700,
            cursor: isDirty ? 'pointer' : 'default',
            boxShadow: isDirty ? '0 4px 12px rgba(99,102,241,0.2)' : '0 4px 12px rgba(16,185,129,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {isSaving ? 'Enregistrement...' : (
            showSuccess ? (
              <>
                <Check size={18} />
                Enregistré !
              </>
            ) : (
              <>
                <Save size={18} />
                {isDirty ? 'Enregistrer les notes' : 'Notes à jour'}
              </>
            )
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* Left Column: Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Résumé financier
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <div className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Épargné</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f43f5e' }}>{formatCurrency(totalSaved, currency)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
                  {dayDeposits.length} transaction{dayDeposits.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Achats</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>{formatCurrency(totalSpent, currency)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
                   {dayPurchases.length} achat{dayPurchases.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Factures réglées</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#6366f1' }}>{formatCurrency(totalBills, currency)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>
                  {dayBills.length} facture{dayBills.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
              Notes de la journée
            </h3>
            <div className="card" style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8' }}>
                <FileText size={18} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Journal personnel</span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Racontez votre journée financière, vos victoires ou vos imprévus..."
                style={{
                  width: '100%',
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#0f172a',
                  lineHeight: 1.6,
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Detail Lists */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          Détail des transactions
        </h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {allTransactions.length > 0 ? (
            allTransactions.map((item, idx, arr) => (
              <div key={idx} style={{ 
                padding: '16px 24px', 
                borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: item.type === 'deposit' ? '#10b981' : (item.type === 'bill' ? '#6366f1' : '#f59e0b') 
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{item.label}</span>
                </div>
                <span style={{ 
                  fontSize: 15, 
                  fontWeight: 800, 
                  color: item.type === 'deposit' ? '#f43f5e' : (item.type === 'bill' ? '#6366f1' : '#0f172a')
                }}>
                  {item.type === 'deposit' ? '+' : '-'}{formatCurrency(item.amount, currency)}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
              Aucune transaction pour cette journée.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
