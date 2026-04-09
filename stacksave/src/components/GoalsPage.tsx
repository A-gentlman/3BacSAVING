'use client';

import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Goal } from '@/lib/types';
import { TrendingUp, CheckCircle, Trophy, Target, Plus, Trash2, Edit2 } from 'lucide-react';
import QuickAddModal from './QuickAddModal';
import { formatCurrency } from '@/lib/utils';
import GoalIcon from './GoalIcon';

function GoalCard({ goal, currency, delay = 0, onAddMoney, onDelete, onEdit }: {
  goal: Goal;
  currency: 'MAD' | 'Riyal';
  delay?: number;
  onAddMoney?: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const pct = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
  const remaining = goal.target_amount - goal.current_amount;
  const isCompleted = goal.current_amount >= goal.target_amount;

  return (
    <div
      className="card fintech-card animate-fade-in-up"
      style={{
        ['--accent-color' as string]: goal.color,
        padding: 0,
        overflow: 'hidden',
        animationDelay: `${delay}ms`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        opacity: isCompleted ? 0.7 : 1,
        boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, fontSize: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${goal.color}15`, border: `1px solid ${goal.color}25`,
            }}>
              <GoalIcon name={goal.icon} size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{goal.title}</h4>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>Cible: {formatCurrency(goal.target_amount, currency)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, position: 'relative', zIndex: 10 }}>
            <button
              onClick={() => onEdit(goal.id)}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: '#f1f5f9', color: '#64748b',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none',
                background: '#fef2f2', color: '#ef4444',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{pct}% complété</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: goal.color }}>
              {formatCurrency(goal.current_amount, currency)}
            </span>
          </div>
          <div className="progress-bar" style={{ height: 8, background: '#f1f5f9' }}>
            <div
              className="progress-fill"
              style={{
                width: `${pct}%`,
                background: goal.color,
                boxShadow: `0 0 12px ${goal.color}40`,
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, padding: '12px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Restant</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{formatCurrency(remaining > 0 ? remaining : 0, currency)}</div>
          </div>
        </div>

        {onAddMoney && !isCompleted && (
          <button
            onClick={onAddMoney}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', justifyContent: 'center', background: goal.color, boxShadow: `0 8px 18px ${goal.color}28` }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span style={{ fontWeight: 700 }}>Ajouter des fonds</span>
          </button>
        )}
      </div>

      {isCompleted && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'grayscale(1)', pointerEvents: 'none',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          paddingBottom: '80px', zIndex: 5
        }}>
          <div style={{ background: '#10b981', color: 'white', padding: '8px 20px', borderRadius: 99, fontWeight: 800, fontSize: 14, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
            OBJECTIF ATTEINT 🏆
          </div>
        </div>
      )}
    </div>
  );
}

export default function GoalsPage() {
  const { data, currency, deleteGoal, savingBalance } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editGoalId, setEditGoalId] = useState<string | null>(null);
  const [depositModal, setDepositModal] = useState<string | null>(null);

  const activeGoals = data.goals.filter(g => g.current_amount < g.target_amount);
  const completedGoals = data.goals.filter(g => g.current_amount >= g.target_amount);
  
  const totalTarget = activeGoals.reduce((s, g) => s + g.target_amount, 0);
  const totalSavedOnActive = activeGoals.reduce((s, g) => s + g.current_amount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSavedOnActive / totalTarget) * 100) : 0;

  const handleEditGoal = (id: string) => {
    setEditGoalId(id);
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1240, margin: '0 auto' }}>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="card animate-fade-in-up" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-indigo-pastel)', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Épargne Globale</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{formatCurrency(savingBalance, currency)}</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginTop: 4 }}>Sur tous les comptes</div>
        </div>

        <div className="card animate-fade-in-up" style={{ padding: 24, animationDelay: '100ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Progression Moyenne</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{overallPct}%</div>
          <div className="progress-bar" style={{ marginTop: 12, height: 8, background: '#f1f5f9' }}>
            <div className="progress-fill" style={{ width: `${overallPct}%`, background: '#10b981' }} />
          </div>
        </div>

        <div className="card animate-fade-in-up" style={{ padding: 24, animationDelay: '200ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={20} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Objectifs Atteints</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{completedGoals.length}</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', marginTop: 4 }}>Félicitations !</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Objectifs Actifs</h3>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: '10px 20px' }}>
          <Plus size={18} strokeWidth={2.5} />
          <span style={{ fontWeight: 700 }}>Nouvel Objectif</span>
        </button>
      </div>

      {activeGoals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 20px', background: '#fff' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Target size={32} color="#cbd5e1" />
          </div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Aucun objectif actif</p>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#64748b', marginBottom: 24 }}>Prêt à commencer à épargner pour vos rêves ?</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Créer mon premier objectif</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24, marginBottom: 48 }}>
          {activeGoals.map((g, i) => (
            <GoalCard
              key={g.id}
              goal={g}
              currency={currency}
              delay={i * 50}
              onAddMoney={() => setDepositModal(g.id)}
              onDelete={deleteGoal}
              onEdit={handleEditGoal}
            />
          ))}
        </div>
      )}

      {completedGoals.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Objectifs Terminés</h3>
            <div style={{ padding: '2px 10px', borderRadius: 99, background: '#f1f5f9', fontSize: 12, fontWeight: 700, color: '#64748b' }}>
              {completedGoals.length}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {completedGoals.map((g, i) => (
              <GoalCard
                key={g.id}
                goal={g}
                currency={currency}
                delay={i * 50}
                onDelete={deleteGoal}
                onEdit={handleEditGoal}
              />
            ))}
          </div>
        </>
      )}

      {showModal && <QuickAddModal onClose={() => setShowModal(false)} defaultTab="goal" />}
      {editGoalId && <QuickAddModal onClose={() => setEditGoalId(null)} defaultTab="goal" editingGoalId={editGoalId} />}
      {depositModal && (
        <QuickAddModal 
          onClose={() => setDepositModal(null)} 
          defaultTab="money" 
          initialGoalId={depositModal}
        />
      )}
    </div>
  );
}
