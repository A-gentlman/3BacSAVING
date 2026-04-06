'use client';

import { useState, useEffect } from 'react';
import { X, Target, DollarSign, Receipt, ShoppingBag, Plus, Save } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { formatCurrency } from '@/lib/utils';
import GoalIcon from './GoalIcon';

interface QuickAddModalProps {
  onClose: () => void;
  defaultTab?: 'goal' | 'money' | 'bill' | 'purchase';
  initialGoalId?: string;
  editingGoalId?: string;
  editingBillId?: string;
}

const GOAL_ICONS = [
  'Target', 'Laptop', 'Plane', 'Home', 'Car', 
  'Smartphone', 'Gamepad2', 'ShoppingBag', 'Gem', 
  'GraduationCap', 'Palmtree', 'Book', 'Dumbbell', 
  'Activity', 'Pill', 'User', 'Users', 'Camera', 
  'Heart', 'Music', 'Utensils', 'Coffee'
];
const GOAL_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];
const CATEGORIES = ['food', 'transport', 'entertainment', 'shopping', 'health', 'utilities', 'subscriptions', 'other'];
const BILL_CATEGORIES = ['rent', 'utilities', 'subscriptions', 'insurance', 'loan', 'other'];

const motivationalMessages = [
  "Super travail ! Continuez 💪",
  "Vous êtes en feu ! 🔥",
  "Chaque dollar compte ! 🌟",
  "Construisez votre richesse pas à pas 🚀",
  "Votre futur vous remerciera ! ✨",
];

const translateCategory = (c: string) => {
  const map: Record<string, string> = { food: 'Nourriture', transport: 'Transport', entertainment: 'Divertissement', shopping: 'Shopping', health: 'Santé', utilities: 'Factures', subscriptions: 'Abonnements', other: 'Autre', rent: 'Loyer', insurance: 'Assurance', loan: 'Prêt' };
  return map[c] || c;
};

export default function QuickAddModal({ onClose, defaultTab = 'purchase', initialGoalId, editingGoalId, editingBillId }: QuickAddModalProps) {
  const { data, addGoal, updateGoal, addBill, updateBill, addPurchase, addMoneyToGoal, currency } = useApp();
  const [activeTab, setActiveTab] = useState<'goal' | 'money' | 'bill' | 'purchase'>(defaultTab);
  const [showSuccess, setShowSuccess] = useState('');

  // Goal form
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalIcon, setGoalIcon] = useState('Target');
  const [goalColor, setGoalColor] = useState('#6366f1');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Editing logic (Bills)
  useEffect(() => {
    if (editingBillId) {
      const bill = data.bills.find(b => b.id === editingBillId);
      if (bill) {
        setBillName(bill.name);
        setBillAmount(bill.amount.toString());
        setBillDue(bill.dueDate);
        setBillRecurring(bill.recurring || false);
        setBillCategory(bill.category || 'utilities');
        setActiveTab('bill');
      }
    }
  }, [editingBillId, data.bills]);

  useEffect(() => {
    if (editingGoalId) {
      const goal = data.goals.find(g => g.id === editingGoalId);
      if (goal) {
        setGoalName(goal.name);
        setGoalTarget(goal.targetAmount.toString());
        setGoalIcon(goal.icon);
        setGoalColor(goal.color);
        setGoalDeadline(goal.deadline || '');
        setActiveTab('goal');
      }
    }
  }, [editingGoalId, data.goals]);

  // Money form
  const [selectedGoalId, setSelectedGoalId] = useState(initialGoalId || data.goals[0]?.id || '');
  const [moneyAmount, setMoneyAmount] = useState('');
  const [moneyNote, setMoneyNote] = useState('');

  // Bill form
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDue, setBillDue] = useState('');
  const [billRecurring, setBillRecurring] = useState(false);
  const [billCategory, setBillCategory] = useState('utilities');

  // Purchase form
  const [purchaseName, setPurchaseName] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  const activeGoals = data.goals.filter(g => !g.completed);

  const handleSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => { setShowSuccess(''); onClose(); }, 2000);
  };

  const handleAddGoal = () => {
    if (!goalName || !goalTarget) return;
    
    if (editingGoalId) {
      updateGoal(editingGoalId, {
        name: goalName,
        icon: goalIcon,
        targetAmount: parseFloat(goalTarget),
        color: goalColor,
        deadline: goalDeadline || undefined,
      });
      handleSuccess('Objectif mis à jour ! 🚀');
    } else {
      addGoal({
        name: goalName,
        icon: goalIcon,
        targetAmount: parseFloat(goalTarget),
        currentAmount: 0,
        color: goalColor,
        deadline: goalDeadline || undefined,
      });
      handleSuccess('Objectif créé ! Il est temps d\'économiser 🎯');
    }
  };

  const handleAddMoney = () => {
    const amt = parseFloat(moneyAmount);
    if (!selectedGoalId || !amt || amt <= 0) return;
    addMoneyToGoal(selectedGoalId, amt, moneyNote);
    const randMsg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    handleSuccess(randMsg);
  };

  const handleAddBill = () => {
    if (!billName || !billAmount || !billDue) return;
    
    if (editingBillId) {
      updateBill(editingBillId, {
        name: billName,
        amount: parseFloat(billAmount),
        dueDate: billDue,
        recurring: billRecurring,
        category: billCategory,
      });
      handleSuccess('Facture mise à jour ! 📑');
    } else {
      addBill({
        name: billName,
        amount: parseFloat(billAmount),
        dueDate: billDue,
        paid: false,
        recurring: billRecurring,
        category: billCategory,
      });
      handleSuccess('Facture ajoutée ! Nous vous rappellerons son échéance 📅');
    }
  };

  const handleAddPurchase = () => {
    if (!purchaseName || !purchaseAmount || !purchaseDate) return;
    addPurchase({ name: purchaseName, amount: parseFloat(purchaseAmount), date: purchaseDate });
    handleSuccess('Dépense enregistrée ! Restez attentif 💡');
  };

  const tabs = [
    { id: 'goal' as const, label: 'Objectif', icon: Target },
    { id: 'money' as const, label: 'Dépôt', icon: DollarSign },
    { id: 'bill' as const, label: 'Facture', icon: Receipt },
    { id: 'purchase' as const, label: 'Achat', icon: ShoppingBag },
  ];

  return (
    <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="modal-card" style={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              {editingGoalId ? 'Modifier l\'Objectif' : (editingBillId ? 'Modifier la Facture' : 'Ajout Rapide')}
            </div>
            <div style={{ fontSize: 12, color: '#475569' }}>
              {editingGoalId ? 'Ajustez votre cible' : (editingBillId ? 'Ajustez les détails' : 'Accélérez vos finances')}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(15,23,42,0.05)',
              border: '1px solid rgba(15,23,42,0.08)',
              borderRadius: 8, padding: 8, cursor: 'pointer', color: '#475569',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '16px 24px', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 4px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: isActive ? '#4338ca' : '#475569',
                  boxShadow: isActive ? 'inset 0 0 0 1px rgba(99,102,241,0.25)' : 'none',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Success message */}
        {showSuccess && (
          <div style={{
            margin: '16px 24px 0',
            padding: '12px 16px',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 10,
            color: '#34d399',
            fontSize: 14,
            fontWeight: 500,
            textAlign: 'center',
            animation: 'fadeInUp 0.3s ease',
          }}>
            {showSuccess}
          </div>
        )}

        {/* Form */}
        {!showSuccess && (
          <div style={{ padding: '20px 24px 24px' }}>

            {/* GOAL FORM */}
            {activeTab === 'goal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Nom de l&apos;objectif</label>
                  <input
                    className="input"
                    placeholder="ex. Vacances de rêve"
                    value={goalName}
                    onChange={e => setGoalName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Montant cible ({currency})</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="15000"
                    value={goalTarget}
                    onChange={e => setGoalTarget(e.target.value)}
                  />
                  {goalTarget && (
                    <div style={{ fontSize: 11, color: '#6366f1', marginTop: 4, fontWeight: 500 }}>
                      Total cible: {formatCurrency(Number(goalTarget), currency)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Choisir une icône</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {GOAL_ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setGoalIcon(icon)}
                        style={{
                          width: 44, height: 44,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: 10, border: goalIcon === icon
                            ? '2px solid #6366f1' : '1px solid rgba(15,23,42,0.08)',
                          background: goalIcon === icon ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.04)',
                          color: goalIcon === icon ? '#6366f1' : '#64748b',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        <GoalIcon name={icon} size={20} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Couleur</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {GOAL_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setGoalColor(color)}
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: color, border: goalColor === color
                            ? '3px solid #0f172a' : '2px solid transparent',
                          cursor: 'pointer', transition: 'all 0.15s',
                          boxShadow: goalColor === color ? `0 0 0 2px ${color}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Date limite (Optionnel)</label>
                  <input
                    className="input"
                    type="date"
                    value={goalDeadline}
                    onChange={e => setGoalDeadline(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <button className="btn-primary" onClick={handleAddGoal} style={{ marginTop: 4 }}>
                  {editingGoalId ? <Save size={15} /> : <Plus size={15} />}
                  {editingGoalId ? 'Enregistrer les modifications' : 'Créer l\'objectif'}
                </button>
              </div>
            )}

            {/* ADD MONEY FORM */}
            {activeTab === 'money' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activeGoals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#475569' }}>
                    <Target size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
                    <p>Aucun objectif actif. Créez-en un d&apos;abord !</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="label">Choisir l&apos;objectif</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {activeGoals.map(goal => {
                          const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                          return (
                            <button
                              key={goal.id}
                              onClick={() => setSelectedGoalId(goal.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 12px', borderRadius: 10,
                                border: selectedGoalId === goal.id
                                  ? `1px solid ${goal.color}50` : '1px solid rgba(15,23,42,0.06)',
                                background: selectedGoalId === goal.id
                                  ? `${goal.color}15` : 'rgba(15,23,42,0.03)',
                                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                                transition: 'all 0.15s',
                              }}
                            >
                              <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: selectedGoalId === goal.id ? `${goal.color}25` : 'rgba(15,23,42,0.08)',
                                color: selectedGoalId === goal.id ? goal.color : '#64748b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <GoalIcon name={goal.icon} size={20} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{goal.name}</div>
                                <div style={{ fontSize: 11, color: '#475569' }}>
                                  {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)} • {pct}%
                                </div>
                              </div>
                              {selectedGoalId === goal.id && (
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: goal.color }} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="label">Montant à ajouter ({currency})</label>
                      <input
                        className="input"
                        type="number"
                        placeholder="50"
                        value={moneyAmount}
                        onChange={e => setMoneyAmount(e.target.value)}
                        style={{ fontSize: 18, fontWeight: 600, padding: '12px 14px' }}
                      />
                      {moneyAmount && (
                        <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, fontWeight: 500 }}>
                          Montant: {formatCurrency(Number(moneyAmount), currency)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="label">Note (Optionnel)</label>
                      <input
                        className="input"
                        placeholder="Épargne mensuelle, bonus..."
                        value={moneyNote}
                        onChange={e => setMoneyNote(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleAddMoney} style={{ marginTop: 4 }}>
                      <DollarSign size={15} /> Ajouter Dépôt
                    </button>
                  </>
                )}
              </div>
            )}

            {/* BILL FORM */}
            {activeTab === 'bill' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Nom de la facture</label>
                  <input className="input" placeholder="ex. Netflix" value={billName} onChange={e => setBillName(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Montant ({currency})</label>
                    <input className="input" type="number" placeholder="15.99" value={billAmount} onChange={e => setBillAmount(e.target.value)} />
                    {billAmount && (
                      <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4, fontWeight: 500 }}>
                        Total: {formatCurrency(Number(billAmount), currency)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="label">Date d&apos;échéance</label>
                    <input className="input" type="date" value={billDue} onChange={e => setBillDue(e.target.value)} style={{ colorScheme: 'dark' }} />
                  </div>
                </div>
                <div>
                  <label className="label">Catégorie</label>
                  <select
                    className="input"
                    value={billCategory}
                    onChange={e => setBillCategory(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                  >
                    {BILL_CATEGORIES.map(c => (
                      <option key={c} value={c} style={{ background: '#ffffff' }}>
                        {translateCategory(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={billRecurring}
                    onChange={e => setBillRecurring(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#6366f1' }}
                  />
                  <span style={{ fontSize: 13, color: '#475569' }}>Facture mensuelle récurrente</span>
                </label>
                <button className="btn-primary" onClick={handleAddBill} style={{ marginTop: 4 }}>
                  {editingBillId ? <Save size={15} /> : <Receipt size={15} />}
                  {editingBillId ? 'Enregistrer les modifications' : 'Ajouter Facture'}
                </button>
              </div>
            )}

            {/* PURCHASE FORM */}
            {activeTab === 'purchase' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Qu&apos;avez-vous acheté ?</label>
                  <input className="input" placeholder="ex. Café Starbucks" value={purchaseName} onChange={e => setPurchaseName(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Montant ({currency})</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="2.50"
                      value={purchaseAmount}
                      onChange={e => setPurchaseAmount(e.target.value)}
                      style={{ fontSize: 18, fontWeight: 600, padding: '12px 14px' }}
                    />
                  </div>
                  <div>
                    <label className="label">Date de l&apos;achat</label>
                    <input 
                      className="input" 
                      type="date" 
                      value={purchaseDate} 
                      onChange={e => setPurchaseDate(e.target.value)} 
                      style={{ colorScheme: 'dark' }} 
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={handleAddPurchase} style={{ marginTop: 4 }}>
                  <ShoppingBag size={15} /> Enregistrer l&apos;achat
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
