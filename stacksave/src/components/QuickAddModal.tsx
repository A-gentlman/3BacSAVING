'use client';

import { useState, useEffect } from 'react';
import { X, Target, DollarSign, Receipt, ShoppingBag, Plus, Save, Wallet, TrendingUp } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { formatCurrency } from '@/lib/utils';
import GoalIcon from './GoalIcon';

interface QuickAddModalProps {
  onClose: () => void;
  defaultTab?: 'goal' | 'money' | 'bill' | 'purchase' | 'saving';
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

const motivationalMessages = [
  "Super travail ! Continuez 💪",
  "Vous êtes en feu ! 🔥",
  "Chaque dollar compte ! 🌟",
  "Construisez votre richesse pas à pas 🚀",
  "Votre futur vous remerciera ! ✨",
];

export default function QuickAddModal({ onClose, defaultTab = 'purchase', initialGoalId, editingGoalId, editingBillId }: QuickAddModalProps) {
  const { 
    data, 
    addGoal, 
    updateGoal, 
    addBill, 
    updateBill, 
    addPurchase, 
    addGoalDeposit, 
    addSavingTransaction,
    transferFromSavingsToGoal,
    savingBalance,
    currency 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'goal' | 'saving' | 'money' | 'bill' | 'purchase'>(defaultTab);
  const [showSuccess, setShowSuccess] = useState('');

  // Goal form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalIcon, setGoalIcon] = useState('Target');
  const [goalColor, setGoalColor] = useState('#6366f1');

  // Money form
  const [selectedGoalId, setSelectedGoalId] = useState(initialGoalId || data.goals[0]?.id || '');
  const [moneyAmount, setMoneyAmount] = useState('');
  const [moneySource, setMoneySource] = useState<'direct' | 'savings'>('direct');

  // Bill form
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDue, setBillDue] = useState('');

  // Purchase form
  const [purchaseNote, setPurchaseNote] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  // Saving form
  const [savingNote, setSavingNote] = useState('');
  const [savingAmount, setSavingAmount] = useState('');
  const [savingCategory, setSavingCategory] = useState<'Revenu' | 'Économies' | 'Cadeau' | 'Autre'>('Économies');
  const [savingDate, setSavingDate] = useState(new Date().toISOString().split('T')[0]);

  // Editing logic (Bills/Goals)
  useEffect(() => {
    if (editingBillId) {
      const bill = data.bills.find(b => b.id === editingBillId);
      if (bill) {
        setBillTitle(bill.title);
        setBillAmount(bill.amount.toString());
        setBillDue(bill.due_date);
        setActiveTab('bill');
      }
    }
  }, [editingBillId, data.bills]);

  useEffect(() => {
    if (editingGoalId) {
      const goal = data.goals.find(g => g.id === editingGoalId);
      if (goal) {
        setGoalTitle(goal.title);
        setGoalTarget(goal.target_amount.toString());
        setGoalIcon(goal.icon);
        setGoalColor(goal.color);
        setActiveTab('goal');
      }
    }
  }, [editingGoalId, data.goals]);

  const activeGoals = data.goals.filter(g => g.current_amount < g.target_amount);

  const handleSuccess = (msg: string) => {
    setShowSuccess(msg);
    setTimeout(() => { setShowSuccess(''); onClose(); }, 2000);
  };

  const handleAddGoal = () => {
    if (!goalTitle || !goalTarget) return;
    
    if (editingGoalId) {
      updateGoal(editingGoalId, {
        title: goalTitle,
        icon: goalIcon,
        target_amount: parseFloat(goalTarget),
        color: goalColor,
      });
      handleSuccess('Objectif mis à jour ! 🚀');
    } else {
      addGoal({
        title: goalTitle,
        icon: goalIcon,
        target_amount: parseFloat(goalTarget),
        color: goalColor,
      });
      handleSuccess('Objectif créé ! Il est temps d\'économiser 🎯');
    }
  };

  const handleAddMoney = async () => {
    const amt = parseFloat(moneyAmount);
    if (!selectedGoalId || !amt || amt <= 0) return;
    
    if (moneySource === 'savings') {
      if (amt > savingBalance) return;
      await transferFromSavingsToGoal(selectedGoalId, amt);
    } else {
      await addGoalDeposit(selectedGoalId, amt);
    }
    
    const randMsg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    handleSuccess(randMsg);
  };

  const handleAddBill = () => {
    if (!billTitle || !billAmount || !billDue) return;
    
    if (editingBillId) {
      updateBill(editingBillId, {
        title: billTitle,
        amount: parseFloat(billAmount),
        due_date: billDue,
      });
      handleSuccess('Facture mise à jour ! 📑');
    } else {
      addBill({
        title: billTitle,
        amount: parseFloat(billAmount),
        due_date: billDue,
        status: 'unpaid',
      });
      handleSuccess('Facture ajoutée ! Nous vous rappellerons son échéance 📅');
    }
  };

  const handleAddPurchase = () => {
    if (!purchaseAmount || !purchaseDate) return;
    addPurchase({ 
      note: purchaseNote || 'Dépense', 
      amount: parseFloat(purchaseAmount), 
      date: purchaseDate 
    });
    handleSuccess('Dépense enregistrée ! Restez attentif 💡');
  };

  const handleAddSaving = async () => {
    const amt = parseFloat(savingAmount);
    if (!amt || amt <= 0) return;
    
    await addSavingTransaction({
      amount: amt,
      type: 'add',
      category: savingCategory,
      note: savingNote || 'Dépôt rapide',
      date: savingDate,
    });
    
    handleSuccess('L\'épargne a bien été créditée ! Bravo 💰');
  };

  const tabs = [
    { id: 'goal' as const, label: 'Objectif', icon: Target },
    { id: 'saving' as const, label: 'Épargne', icon: Wallet },
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
            margin: '16px 24px',
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
          <div style={{ padding: '0 24px 24px' }}>

            {/* GOAL FORM */}
            {activeTab === 'goal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Nom de l&apos;objectif</label>
                  <input
                    className="input"
                    placeholder="ex. Vacances de rêve"
                    value={goalTitle}
                    onChange={e => setGoalTitle(e.target.value)}
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
                        {activeGoals.map(goal => (
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
                            }}
                          >
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: goal.color + '20', color: goal.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <GoalIcon name={goal.icon} size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{goal.title}</div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>{formatCurrency(goal.current_amount, currency)} / {formatCurrency(goal.target_amount, currency)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="label">Source des fonds</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                        <button
                          onClick={() => setMoneySource('direct')}
                          style={{
                            padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                            background: moneySource === 'direct' ? '#eef2ff' : '#f8fafc',
                            color: moneySource === 'direct' ? '#6366f1' : '#64748b',
                            boxShadow: moneySource === 'direct' ? 'inset 0 0 0 1px #6366f1' : 'none',
                            fontSize: 12, fontWeight: 700,
                          }}
                        >
                          Dépôt Direct
                        </button>
                        <button
                          onClick={() => setMoneySource('savings')}
                          style={{
                            padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                            background: moneySource === 'savings' ? '#eef2ff' : '#f8fafc',
                            color: moneySource === 'savings' ? '#6366f1' : '#64748b',
                            boxShadow: moneySource === 'savings' ? 'inset 0 0 0 1px #6366f1' : 'none',
                            fontSize: 12, fontWeight: 700,
                          }}
                        >
                          Épargne
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Montant ({currency})</label>
                      <input
                        className="input"
                        type="number"
                        placeholder="50"
                        value={moneyAmount}
                        onChange={e => setMoneyAmount(e.target.value)}
                      />
                    </div>
                    <button className="btn-primary" onClick={handleAddMoney} style={{ marginTop: 4 }}>
                      <DollarSign size={15} /> Confirmer le dépôt
                    </button>
                  </>
                )}
              </div>
            )}

            {/* SAVINGS FORM */}
            {activeTab === 'saving' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Source ou note</label>
                  <input className="input" placeholder="ex. Salaire, Bonus" value={savingNote} onChange={e => setSavingNote(e.target.value)} />
                </div>
                <div>
                  <label className="label">Catégorie</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {(['Revenu', 'Économies', 'Cadeau', 'Autre'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSavingCategory(cat)}
                        style={{
                          padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          background: savingCategory === cat ? '#eef2ff' : '#f8fafc',
                          boxShadow: savingCategory === cat ? 'inset 0 0 0 1px #6366f1' : 'none',
                          color: savingCategory === cat ? '#6366f1' : '#64748b',
                          fontSize: 12, fontWeight: 700,
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Montant ({currency})</label>
                    <input
                      className="input"
                      type="number"
                      placeholder="100"
                      value={savingAmount}
                      onChange={e => setSavingAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input
                      className="input"
                      type="date"
                      value={savingDate}
                      onChange={e => setSavingDate(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={handleAddSaving} style={{ marginTop: 4 }}>
                  <TrendingUp size={15} /> Ajouter à l&apos;épargne
                </button>
              </div>
            )}

            {/* BILL FORM */}
            {activeTab === 'bill' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Nom de la facture</label>
                  <input className="input" placeholder="ex. Loyer, Internet" value={billTitle} onChange={e => setBillTitle(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Montant ({currency})</label>
                    <input className="input" type="number" placeholder="500" value={billAmount} onChange={e => setBillAmount(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Date d&apos;échéance</label>
                    <input className="input" type="date" value={billDue} onChange={e => setBillDue(e.target.value)} />
                  </div>
                </div>
                <button className="btn-primary" onClick={handleAddBill} style={{ marginTop: 4 }}>
                  <Plus size={15} /> {editingBillId ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            )}

            {/* PURCHASE FORM */}
            {activeTab === 'purchase' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Détail de l&apos;achat</label>
                  <input className="input" placeholder="ex. Supermarché" value={purchaseNote} onChange={e => setPurchaseNote(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label">Montant ({currency})</label>
                    <input className="input" type="number" placeholder="20" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input className="input" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                  </div>
                </div>
                <button className="btn-primary" onClick={handleAddPurchase} style={{ marginTop: 4 }}>
                  <ShoppingBag size={15} /> Enregistrer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
