'use client';

import { useApp } from '@/lib/AppContext';
import { format, differenceInDays, parseISO } from 'date-fns';
import {
  TrendingUp, Target, Receipt, ShoppingBag,
  ArrowUpRight, Zap, CheckCircle
} from 'lucide-react';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import QuickAddModal from './QuickAddModal';
import { Goal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GoalIcon from './GoalIcon';

function StatCard({
  label, value, sub, icon, color, delay = 0, href,
}: {
  label: string; value: string; sub?: string; icon: React.ReactNode; color: string; delay?: number; href?: string;
}) {
  const content = (
    <div
      className="card animate-fade-in-up"
      style={{
        padding: '24px',
        animationDelay: `${delay}ms`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: href ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}12`,
        color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${color}20`,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginTop: 6 }}>{label}</div>
        {sub && (
          <div style={{ 
            fontSize: 11, 
            color: color, 
            marginTop: 8, 
            fontWeight: 700,
            display: 'inline-flex',
            padding: '2px 8px',
            background: `${color}10`,
            borderRadius: 99,
          }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );

  if (href) return <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
  return content;
}

function GoalMiniCard({ goal }: { goal: Goal }) {
  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, fontSize: 22,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${goal.color}10`, border: `1px solid ${goal.color}15`,
        flexShrink: 0,
      }}>
        <GoalIcon name={goal.icon} size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            {goal.name}
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: goal.color }}>
            {pct}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${pct}%`,
              background: goal.color,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BillUrgencyDot({ dueDate }: { dueDate: string }) {
  const days = differenceInDays(parseISO(dueDate), new Date());
  const color = days < 0 ? '#ef4444' : days <= 3 ? '#f59e0b' : '#10b981';
  return (
    <div style={{
      width: 10, height: 10, borderRadius: '50%', background: color,
      border: '2px solid #fff', boxShadow: `0 0 0 1px ${color}40`, flexShrink: 0,
    }} />
  );
}

export default function Dashboard() {
  const { data, totalSpentToday, totalSpentThisWeek, currency } = useApp();
  const userName = data.settings?.name?.trim() || 'Utilisateur';
  const [showModal, setShowModal] = useState<'money' | null>(null);
  const router = useRouter();

  const activeGoals = data.goals.filter(g => !g.completed);
  const completedGoals = data.goals.filter(g => g.completed).length;
  const unpaidBills = data.bills.filter(b => !b.paid);
  const recentPurchases = data.purchases.slice(0, 5);
  const recentDeposits = data.deposits.slice(0, 4);

  const upcomingBills = unpaidBills
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const topGoal = activeGoals.sort((a, b) => {
    const pa = b.currentAmount / b.targetAmount;
    const pb = a.currentAmount / a.targetAmount;
    return pa - pb;
  })[0];

  const topGoalPct = topGoal
    ? Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100)
    : 0;

  const motivationalHeader = () => {
    if (completedGoals > 0) return `🏆 Grandiose ! Vous avez atteint ${completedGoals} objectif${completedGoals > 1 ? 's' : ''} !`;
    if (topGoal && topGoalPct >= 75) return `🚀 Presque là ! ${topGoalPct}% de ${topGoal.name}`;
    if (topGoal && topGoalPct >= 50) return `💪 Super boulot ! Déjà à moitié pour ${topGoal.name}`;
    return `Salut ${userName}, C'est une excellente journée pour gérer vos finances.`;
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1240, margin: '0 auto' }}>
      {/* Motivational Banner */}
      <div
        className="animate-fade-in-up"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
          border: '1px solid #c7d2fe',
          borderRadius: 20,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 4px 20px rgba(99,102,241,0.05)',
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#4338ca' }}>{motivationalHeader()}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginTop: 6, textTransform: 'capitalize' }}>
            {format(new Date(), 'EEEE d MMMM, yyyy', { locale: fr })}
          </div>
        </div>
        {topGoal && (
          <button
            onClick={() => setShowModal('money')}
            className="btn-primary"
          style={{ padding: '12px 24px' }}
          >
            <Zap size={16} strokeWidth={2.5} /> 
            <span style={{ fontWeight: 700 }}>Booster {topGoal.name}</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard
          label="Épargne Globale"
          value={formatCurrency(data.savingBalance || 0, currency)}
          sub={data.goals.length > 0 ? `${data.goals.length} objectifs` : undefined}
          icon={<TrendingUp size={22} />}
          color="#6366f1"
          delay={0}
          href="/cagnotte"
        />
        <StatCard
          label="Factures en attente"
          value={unpaidBills.length.toString()}
          sub={upcomingBills[0] ? `Prochaine: ${upcomingBills[0].name}` : 'Tout réglé !'}
          icon={<Receipt size={22} />}
          color="#f59e0b"
          delay={100}
          href="/factures"
        />
        <StatCard
          label="Dépenses / Jour"
          value={formatCurrency(totalSpentToday, currency)}
          sub={`${formatCurrency(totalSpentThisWeek, currency)} cette semaine`}
          icon={<ShoppingBag size={22} />}
          color="#10b981"
          delay={200}
          href="/achats"
        />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>

        {/* Goals Progress */}
        <Link
          href="/objectifs"
          className="card animate-fade-in-up stagger-1" 
          style={{ 
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            textDecoration: 'none',
            display: 'block',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.borderColor = 'var(--accent-indigo)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 8 }}>Objectifs</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Objectifs Prioritaires</div>
            </div>
            <div className="stat-pill">Actifs</div>
          </div>
          {activeGoals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Target size={28} color="#94a3b8" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>Aucun objectif actif.</p>
              <div
                style={{ color: '#6366f1', fontSize: 13, fontWeight: 700, marginTop: 8 }}
              >
                Créer mon premier objectif
              </div>
            </div>
          ) : (
            activeGoals.slice(0, 3).map(g => (
              <GoalMiniCard key={g.id} goal={g} />
            ))
          )}
        </Link>

        {/* Upcoming Bills */}
        <Link
          href="/factures"
          className="card animate-fade-in-up stagger-2" 
          style={{ 
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            textDecoration: 'none',
            display: 'block',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.borderColor = 'var(--accent-indigo)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 8 }}>Factures</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Factures à venir</div>
            </div>
            <div className="stat-pill" style={{ background: '#fff7ed', color: '#c2410c' }}>Urgent</div>
          </div>
          {upcomingBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={28} color="#10b981" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>Tout est payé ! Bravo.</p>
            </div>
          ) : (
            upcomingBills.map(bill => {
              const days = differenceInDays(parseISO(bill.dueDate), new Date());
              return (
                <div key={bill.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '12px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 24 }}>🏠</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{bill.name}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>
                      {days < 0 ? 'En retard' : days === 0 ? 'Aujourd\'hui' : `Dans ${days} jours`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(bill.amount, currency)}
                    </span>
                    <BillUrgencyDot dueDate={bill.dueDate} />
                  </div>
                </div>
              );
            })
          )}
        </Link>

        {/* Recent Activity */}
        <Link
          href="/achats"
          className="card animate-fade-in-up stagger-3" 
          style={{ 
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            textDecoration: 'none',
            display: 'block',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.borderColor = 'var(--accent-indigo)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 8 }}>Activité</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Activité Récente</div>
            </div>
            <ArrowUpRight size={18} color="#94a3b8" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Deposits */}
            {recentDeposits.slice(0, 2).map(dep => {
              const goal = data.goals.find(g => g.id === dep.goalId);
              return (
                <div key={dep.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: '#ecfdf5', color: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>
                    <GoalIcon name={goal?.icon || 'DollarSign'} size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      Dépôt: {goal?.name || 'Épargne'}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>{dep.date}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                    +{formatCurrency(dep.amount, currency)}
                  </span>
                </div>
              );
            })}

            {/* Purchases */}
            {recentPurchases.slice(0, 3).map(purchase => (
              <div key={purchase.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#fff1f2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  <ShoppingBag size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{purchase.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', textTransform: 'capitalize' }}>{purchase.category}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>
                  -{formatCurrency(purchase.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </Link>
      </div>

      {showModal && (
        <QuickAddModal onClose={() => setShowModal(null)} defaultTab="money" />
      )}
    </div>
  );
}
