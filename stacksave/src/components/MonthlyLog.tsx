'use client';

import { useApp } from '@/lib/AppContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths, 
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import DailyDetails from './DailyDetails';

export default function MonthlyLog() {
  const { data, currency } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleNavigateDate = (newDateStr: string) => {
    setSelectedDate(newDateStr);
    const newDate = parseISO(newDateStr);
    // Sync currentMonth if we move across month boundaries
    if (newDate.getMonth() !== currentMonth.getMonth() || newDate.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(newDate);
    }
  };

  // Calendar dates logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayPurchases = data.purchases.filter(p => p.date === dateStr);
    const dayDeposits = data.deposits.filter(d => d.date === dateStr);
    const dayBills = data.bills.filter(b => b.paid && b.paidAt === dateStr);

    const totalExpense = dayPurchases.reduce((s, p) => s + p.amount, 0) + dayBills.reduce((s, b) => s + b.amount, 0);
    const totalSaved = dayDeposits.reduce((s, d) => s + d.amount, 0);

    // Use manual status if exists, otherwise derive it
    const record = data.dailyRecords?.find(r => r.date === dateStr);
    let status: 'saved' | 'spent' | 'rest' = record?.status || 'rest';
    
    if (!record?.status) {
      if (totalSaved > 0) status = 'saved';
      else if (totalExpense > 0) status = 'spent';
    }

    return { totalExpense, totalSaved, status, purchases: dayPurchases, deposits: dayDeposits, bills: dayBills };
  };

  // Month stats
  const monthInfo = data.purchases
    .filter(p => p.date.startsWith(format(currentMonth, 'yyyy-MM')))
    .reduce((acc, p) => acc + p.amount, 0) +
    data.bills
    .filter(b => b.paid && b.paidAt?.startsWith(format(currentMonth, 'yyyy-MM')))
    .reduce((acc, b) => acc + b.amount, 0);
  
  const monthSavings = data.deposits
    .filter(d => d.date.startsWith(format(currentMonth, 'yyyy-MM')))
    .reduce((acc, d) => acc + d.amount, 0);

  const statusConfig = {
    saved: { label: 'ÉPARGNÉ', color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3' },
    spent: { label: 'DÉPENSÉ', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    rest: { label: 'REPOS', color: '#94a3b8', bg: '#f8fafc', border: '#f1f5f9' },
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 0 32px', position: 'relative' }}>
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="btn-secondary"
            style={{ position: 'absolute', left: 0, padding: '10px 20px', borderRadius: 99, background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#64748b' }}
          >
            <ArrowLeft size={16} /> Retour au Calendrier
          </button>
        )}

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 10px', borderRadius: 99, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <button 
            onClick={() => {
              if (selectedDate) {
                const prev = subDays(parseISO(selectedDate), 1);
                handleNavigateDate(format(prev, 'yyyy-MM-dd'));
              } else {
                setCurrentMonth(subMonths(currentMonth, 1));
              }
            }}
            className="btn-ghost" 
            style={{ padding: '8px', borderRadius: 99, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title={selectedDate ? "Jour précédent" : "Mois précédent"}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', minWidth: selectedDate ? 220 : 160, textAlign: 'center', textTransform: 'capitalize', letterSpacing: '-0.01em' }}>
            {selectedDate 
              ? format(parseISO(selectedDate), 'EEEE d MMMM yyyy', { locale: fr })
              : format(currentMonth, 'MMMM yyyy', { locale: fr })
            }
          </div>
          
          <button 
            onClick={() => {
              if (selectedDate) {
                const next = addDays(parseISO(selectedDate), 1);
                handleNavigateDate(format(next, 'yyyy-MM-dd'));
              } else {
                setCurrentMonth(addMonths(currentMonth, 1));
              }
            }}
            className="btn-ghost" 
            style={{ padding: '8px', borderRadius: 99, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title={selectedDate ? "Jour suivant" : "Mois suivant"}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {!selectedDate ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
            <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff1f2', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fecdd3' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Épargne du mois</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f43f5e', fontVariantNumeric: 'tabular-nums' }}>-{formatCurrency(monthSavings, currency)}</div>
              </div>
            </div>
            <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fde68a' }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dépenses du mois</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(monthInfo, currency)}</div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="card" style={{ padding: '32px', borderRadius: 24, background: '#fff' }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, marginBottom: 20 }}>
              {weekDays.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
              {calendarDays.map((day, idx) => {
                const dayInfo = getDayData(day);
                const cfg = statusConfig[dayInfo.status];
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

                return (
                  <div
                    key={idx}
                    className="animate-fade-in"
                    style={{
                      height: '90px',
                      minHeight: '90px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 14,
                      border: isToday
                        ? '2px solid #6366f1'
                        : `1px solid ${isCurrentMonth ? cfg.border : 'transparent'}`,
                      background: isCurrentMonth
                        ? (isToday ? '#eef2ff' : cfg.bg)
                        : 'transparent',
                      animationDelay: `${idx * 8}ms`,
                      position: 'relative',
                      cursor: isCurrentMonth ? 'pointer' : 'default',
                      transition: 'all var(--transition-ui)',
                      boxShadow: isCurrentMonth ? 'var(--shadow-xs)' : 'none',
                    }}
                    onClick={() => {
                      if (isCurrentMonth) {
                        setSelectedDate(format(day, 'yyyy-MM-dd'));
                      }
                    }}
                    onMouseEnter={e => {
                      if (isCurrentMonth && !isToday) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow)';
                        e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (isCurrentMonth && !isToday) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                        e.currentTarget.style.borderColor = cfg.border;
                      }
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start' 
                    }}>
                      <div style={{ 
                        fontSize: 16, 
                        fontWeight: 800, 
                        color: isToday ? '#4338ca' : (isCurrentMonth ? '#0f172a' : '#cbd5e1') 
                      }}>
                        {format(day, 'd')}
                      </div>
                      {/* Removed label as per user request */}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {dayInfo.totalSaved > 0 && isCurrentMonth && (
                        <div style={{ 
                          fontSize: 10, 
                          fontWeight: 700, 
                          color: '#f43f5e',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f43f5e' }} />
                          -{formatCurrency(dayInfo.totalSaved, currency)}
                        </div>
                      )}
                      {dayInfo.totalExpense > 0 && isCurrentMonth && (
                        <div style={{ 
                          fontSize: 10, 
                          fontWeight: 700, 
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                          -{formatCurrency(dayInfo.totalExpense, currency)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ 
            marginTop: 32, 
            padding: '24px 32px', 
            background: 'var(--accent-indigo-pastel)', 
            borderRadius: 20, 
            border: '1px solid #c7d2fe',
            display: 'flex',
            gap: 24,
            alignItems: 'center'
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(99,102,241,0.25)' }}>
              <CalendarIcon size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-indigo-text)', marginBottom: 4 }}>Vue Calendrier Smart</h3>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#6366f1', lineHeight: 1.6 }}>
                Suivez la régularité de vos finances. Les pastilles colorées indiquent le statut de chaque journée, tandis que les indicateurs chiffrés montrent vos flux de trésorerie en un coup d&apos;œil.
              </p>
            </div>
          </div>
        </>
      ) : (
        <DailyDetails 
          date={selectedDate} 
          onClose={() => setSelectedDate(null)} 
        />
      )}
    </div>
  );
}
