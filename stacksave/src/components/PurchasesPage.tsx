'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ShoppingBag, Search, Plus, Trash2, RotateCcw } from 'lucide-react';
import QuickAddModal from './QuickAddModal';
import { formatCurrency } from '@/lib/utils';

export default function PurchasesPage() {
  const { data, deletePurchase, currency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = data.purchases
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalSpent = data.purchases.reduce((s, p) => s + p.amount, 0) +
    data.bills.filter(b => b.paid).reduce((s, b) => s + b.amount, 0);

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="card animate-fade-in-up" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff1f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fecaca' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Total Dépenses</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalSpent, currency)}</div>
          </div>
        </div>
        <div className="card animate-fade-in-up" style={{ padding: 24, animationDelay: '100ms', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd6fe' }}>
            <RotateCcw size={24} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Transactions</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{data.purchases.length + data.bills.filter(b => b.paid).length}</div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: 42 }}
            />
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '10px 20px' }}>
            <Plus size={18} strokeWidth={2.5} />
            <span style={{ fontWeight: 700 }}>Nouvel Achat</span>
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '80px 20px', background: '#fff' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShoppingBag size={32} color="#cbd5e1" />
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Aucun achat trouvé</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>Logguez vos dépenses pour les voir ici.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((p, i) => (
              <div key={p.id} className="card animate-fade-in-up" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 20, animationDelay: `${i * 30}ms`, boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid var(--border)', color: '#64748b' }}>
                  <ShoppingBag size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>
                    {(() => {
                      try {
                        return format(parseISO(p.date), 'EEEE d MMMM yyyy', { locale: fr });
                      } catch (e) {
                        return 'Date inconnue';
                      }
                    })()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(p.amount, currency)}
                  </div>
                </div>
                <button onClick={() => deletePurchase(p.id)} className="btn-ghost" style={{ padding: '8px', color: '#94a3b8' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <QuickAddModal onClose={() => setShowModal(false)} defaultTab="purchase" />}
    </div>
  );
}
