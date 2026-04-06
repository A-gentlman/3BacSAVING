'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Bill } from '@/lib/types';
import { differenceInDays, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Check, Trash2, Receipt, AlertTriangle, Clock3, Wallet, BadgeCheck, Edit2 } from 'lucide-react';
import QuickAddModal from './QuickAddModal';
import { formatCurrency } from '@/lib/utils';

const categoryEmoji: Record<string, string> = {
  rent: '🏠', utilities: '⚡', subscriptions: '📱',
  insurance: '🛡️', loan: '🏦', other: '📦',
};

function urgencyInfo(dueDate: string, paid: boolean) {
  if (paid) return { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', label: 'Payé' };
  const days = differenceInDays(parseISO(dueDate), new Date());
  if (days < 0) return { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'En retard' };
  if (days <= 3) return { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: `Sous ${days}j` };
  return { color: '#94a3b8', bg: '#f8fafc', border: '#f1f5f9', label: `Dans ${days}j` };
}

function BillCard({ bill, currency, onToggle, onDelete, onEdit }: {
  bill: Bill;
  currency: 'MAD' | 'Riyal';
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const info = urgencyInfo(bill.dueDate, bill.paid);
  const days = differenceInDays(parseISO(bill.dueDate), new Date());
  const isOverdue = !bill.paid && days < 0;

  return (
    <div
      className="card animate-fade-in-up"
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        background: bill.paid ? '#f0fdf4' : '#fff',
        border: isOverdue ? '2px solid #fca5a5' : `1px solid ${bill.paid ? '#bbf7d0' : 'var(--border)'}`,
        opacity: bill.paid ? 0.6 : 1,
        boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14, fontSize: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: info.bg, border: `1px solid ${info.border}`,
        flexShrink: 0,
      }}>
        {categoryEmoji[bill.category] || '📦'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{
            fontSize: 16, fontWeight: 700, color: bill.paid ? '#64748b' : '#0f172a',
            textDecoration: bill.paid ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {bill.name}
          </span>
          {bill.recurring && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: '#eef2ff', color: '#6366f1',
              border: '1px solid #c7d2fe', flexShrink: 0,
            }}>
              MENSUEL
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>
          Échéance: {format(parseISO(bill.dueDate), 'd MMMM yyyy', { locale: fr })}
          {bill.paid && bill.paidAt && ` • Payé le ${format(parseISO(bill.paidAt), 'd MMM', { locale: fr })}`}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: bill.paid ? '#64748b' : '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(bill.amount, currency)}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 800, color: info.color,
            padding: '2px 10px', borderRadius: 99,
            background: info.bg, border: `1px solid ${info.border}`,
            marginTop: 4, display: 'inline-block',
            textTransform: 'uppercase', letterSpacing: '0.02em'
          }}>
            {info.label}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onToggle(bill.id)}
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: '1px solid var(--border)',
              background: bill.paid ? '#10b981' : '#f8fafc',
              cursor: 'pointer', color: bill.paid ? '#fff' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: bill.paid ? '0 4px 10px rgba(16,185,129,0.2)' : 'none',
            }}
            title={bill.paid ? "Marquer comme non payé" : "Marquer comme payé"}
          >
            <Check size={18} strokeWidth={3} />
          </button>
          <button
            onClick={() => onEdit(bill.id)}
            className="btn-ghost"
            style={{ width: 38, height: 38, borderRadius: 10, padding: 0 }}
            title="Modifier la facture"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(bill.id)}
            className="btn-ghost"
            style={{ width: 38, height: 38, borderRadius: 10, padding: 0 }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BillsPage() {
  const { data, toggleBillPaid, deleteBill, currency } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const filtered = data.bills.filter(b => {
    if (filter === 'unpaid') return !b.paid;
    if (filter === 'paid') return b.paid;
    return true;
  }).sort((a, b) => {
    if (a.paid !== b.paid) return a.paid ? 1 : -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  const unpaid = data.bills.filter(b => !b.paid);
  const paid = data.bills.filter(b => b.paid);
  const overdueCount = unpaid.filter(b => differenceInDays(parseISO(b.dueDate), new Date()) < 0).length;
  const dueSoon = unpaid.filter(b => {
    const d = differenceInDays(parseISO(b.dueDate), new Date());
    return d >= 0 && d <= 3;
  }).length;
  const totalUnpaid = unpaid.reduce((s, b) => s + b.amount, 0);
  const totalPaid = paid.reduce((s, b) => s + b.amount, 0);

  return (
    <div style={{ padding: '32px', maxWidth: 1240, margin: '0 auto' }}>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Non payé', value: formatCurrency(totalUnpaid, currency), color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: <Wallet size={20} /> },
          { label: 'En retard', value: `${overdueCount} factures`, color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: <AlertTriangle size={20} /> },
          { label: 'Cette semaine', value: `${dueSoon} factures`, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: <Clock3 size={20} /> },
          { label: 'Payé ce mois', value: formatCurrency(totalPaid, currency), color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: <BadgeCheck size={20} /> },
        ].map((s, i) => (
          <div
            key={s.label}
            className="card animate-fade-in-up"
            style={{ padding: '24px', animationDelay: `${i * 50}ms`, boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' }}
          >
            <div style={{ 
              width: 40, height: 40, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: s.color
            }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + Add */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ background: '#f8fafc', padding: '4px', borderRadius: 99, border: '1px solid #e2e8f0', display: 'flex', gap: 4 }}>
          {(['all', 'unpaid', 'paid'] as const).map(f => {
            const labels = { all: 'Toutes', unpaid: 'Non payées', paid: 'Payées' };
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '8px 20px', borderRadius: 99, border: 'none',
                  cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'var(--accent-indigo-pastel)' : 'transparent',
                  color: isActive ? 'var(--accent-indigo-text)' : '#64748b',
                  transition: 'all var(--transition-ui)',
                }}
              >
                {labels[f]}
              </button>
            )
          })}
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '10px 20px' }}>
          <Plus size={18} strokeWidth={2.5} /> 
          <span style={{ fontWeight: 700 }}>Ajouter une facture</span>
        </button>
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap', 
        padding: '12px 20px', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0' 
      }}>
        {[
          { color: '#10b981', label: 'Payée' },
          { color: '#ef4444', label: 'En retard' },
          { color: '#f59e0b', label: 'Échéance proche' },
          { color: '#94a3b8', label: 'À venir' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, boxShadow: `0 0 0 2px ${l.color}20` }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Bills List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 20px', background: '#fff' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Receipt size={32} color="#cbd5e1" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Aucune facture</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>Commencez par enregistrer vos dépenses récurrentes.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(b => (
            <BillCard
              key={b.id}
              bill={b}
              currency={currency}
              onToggle={toggleBillPaid}
              onDelete={deleteBill}
              onEdit={(id) => {
                setEditingBillId(id);
                setShowModal(true);
              }}
            />
          ))}
        </div>
      )}

      {showModal && (
        <QuickAddModal 
          onClose={() => {
            setShowModal(false);
            setEditingBillId(undefined);
          }} 
          defaultTab="bill" 
          editingBillId={editingBillId}
        />
      )}
    </div>
  );
}
