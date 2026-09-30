import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Header,
} from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { PocketsTab } from './components/PocketsTab';
import { TransactionsTab } from './components/TransactionsTab';
import { AIRecommendationsTab } from './components/AIRecommendationsTab';
import { TransactionModal } from './components/TransactionModal';
import { PocketModal } from './components/PocketModal';
import { BudgetModal } from './components/BudgetModal';
import {
  DashboardData,
  AIRecommendation,
  Transaction,
  Pocket,
} from './types';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pockets' | 'transactions' | 'ai'>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Modals
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [defaultPocketForExpense, setDefaultPocketForExpense] = useState<string | undefined>(undefined);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data: DashboardData = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
      showToast('Could not load dashboard data from server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAiRecommendations = useCallback(async () => {
    try {
      setIsAiLoading(true);
      const res = await fetch('/api/ai/recommendations');
      if (!res.ok) throw new Error('Failed to load AI recommendations');
      const data: AIRecommendation = await res.json();
      setAiRecommendation(data);
    } catch (err) {
      console.error(err);
      showToast('AI analysis error; using smart local rule baseline', 'info');
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Lazy fetch recommendations when switching to AI tab or on initial load
  useEffect(() => {
    if (activeTab === 'ai' && !aiRecommendation && !isAiLoading) {
      fetchAiRecommendations();
    }
  }, [activeTab, aiRecommendation, isAiLoading, fetchAiRecommendations]);

  const handleSaveTransaction = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save transaction');
    }

    if (txData.type === 'income') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      showToast(`Logged income of $${txData.amount.toFixed(2)}!`, 'success');
    } else {
      showToast(`Logged expense of $${txData.amount.toFixed(2)} in ${txData.category}`, 'info');
    }

    await fetchDashboard();
    // Invalidate AI recommendation cache so next view recalculates
    setAiRecommendation(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete transaction');
    showToast('Transaction removed', 'info');
    await fetchDashboard();
    setAiRecommendation(null);
  };

  const handleSavePocket = async (pocketData: Omit<Pocket, 'id' | 'spentAmount'>) => {
    const res = await fetch('/api/pockets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pocketData),
    });

    if (!res.ok) throw new Error('Failed to create pocket');
    showToast(`Created "${pocketData.name}" smart pocket!`, 'success');
    await fetchDashboard();
  };

  const handleDeletePocket = async (id: string) => {
    const res = await fetch(`/api/pockets/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete pocket');
    showToast('Pocket envelope deleted', 'info');
    await fetchDashboard();
  };

  const handleSaveBudget = async (totalBudget: number, categoryBudgets: Record<string, number>) => {
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const res = await fetch(`/api/budget/${currentMonthStr}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalBudget, categoryBudgets }),
    });

    if (!res.ok) throw new Error('Failed to save budget settings');
    showToast('Monthly budget limits updated!', 'success');
    await fetchDashboard();
    setAiRecommendation(null);
  };

  const handleApplyBudgetSuggestion = async (category: string, amount: number) => {
    if (!dashboardData) return;
    const updatedCats = {
      ...dashboardData.budget.categoryBudgets,
      [category]: amount,
    };
    await handleSaveBudget(dashboardData.budget.totalBudget, updatedCats);
    showToast(`Applied suggested ${category} budget of $${amount}!`, 'success');
  };

  const handleResetData = async () => {
    if (isResetting) return;
    try {
      setIsResetting(true);
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      await fetchDashboard();
      setAiRecommendation(null);
      showToast('App reset to clean demo dataset', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to reset dataset', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSelectPocketForExpense = (pocketId: string) => {
    setDefaultPocketForExpense(pocketId);
    setIsExpenseModalOpen(true);
  };

  const currency = dashboardData?.settings?.currency || '$';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-semibold backdrop-blur-xl ${
              toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-800'
                : toast.type === 'info'
                ? 'bg-slate-900/90 text-slate-200 border-slate-700'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        balance={dashboardData?.summary?.balance ?? 0}
        currency={currency}
        onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
        onOpenExpenseModal={() => {
          setDefaultPocketForExpense(undefined);
          setIsExpenseModalOpen(true);
        }}
        onOpenPocketModal={() => setIsPocketModalOpen(true)}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onResetData={handleResetData}
        isResetting={isResetting}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-medium">
              Synchronizing AI Smart Pocket...
            </span>
          </div>
        ) : !dashboardData ? (
          <div className="p-8 text-center text-slate-400">
            Failed to connect to database. Try clicking Reset Demo Data in the top bar.
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab
                data={dashboardData}
                currency={currency}
                onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
                onOpenExpenseModal={() => {
                  setDefaultPocketForExpense(undefined);
                  setIsExpenseModalOpen(true);
                }}
                onOpenPocketModal={() => setIsPocketModalOpen(true)}
                onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                onSelectPocketForExpense={handleSelectPocketForExpense}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === 'pockets' && (
              <PocketsTab
                pockets={dashboardData.pockets}
                budget={dashboardData.budget}
                categoryTotals={dashboardData.categoryTotals}
                currency={currency}
                onOpenPocketModal={() => setIsPocketModalOpen(true)}
                onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                onSelectPocketForExpense={handleSelectPocketForExpense}
                onDeletePocket={handleDeletePocket}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsTab
                transactions={dashboardData.recentTransactions}
                pockets={dashboardData.pockets}
                currency={currency}
                onDeleteTransaction={handleDeleteTransaction}
                onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
                onOpenExpenseModal={() => {
                  setDefaultPocketForExpense(undefined);
                  setIsExpenseModalOpen(true);
                }}
              />
            )}

            {activeTab === 'ai' && (
              <AIRecommendationsTab
                recommendation={aiRecommendation}
                isLoading={isAiLoading}
                onRefresh={fetchAiRecommendations}
                currency={currency}
                pockets={dashboardData.pockets}
                budget={dashboardData.budget}
                onApplyBudgetSuggestion={handleApplyBudgetSuggestion}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {dashboardData && (
        <>
          {/* Add Income Modal */}
          <TransactionModal
            isOpen={isIncomeModalOpen}
            onClose={() => setIsIncomeModalOpen(false)}
            type="income"
            pockets={dashboardData.pockets}
            currency={currency}
            onSave={handleSaveTransaction}
          />

          {/* Add Expense Modal */}
          <TransactionModal
            isOpen={isExpenseModalOpen}
            onClose={() => {
              setIsExpenseModalOpen(false);
              setDefaultPocketForExpense(undefined);
            }}
            type="expense"
            pockets={dashboardData.pockets}
            currency={currency}
            defaultPocketId={defaultPocketForExpense}
            onSave={handleSaveTransaction}
          />

          {/* Create Pocket Modal */}
          <PocketModal
            isOpen={isPocketModalOpen}
            onClose={() => setIsPocketModalOpen(false)}
            currency={currency}
            onSave={handleSavePocket}
          />

          {/* Set Budget Modal */}
          <BudgetModal
            isOpen={isBudgetModalOpen}
            onClose={() => setIsBudgetModalOpen(false)}
            currentBudget={dashboardData.budget}
            currency={currency}
            onSave={handleSaveBudget}
          />
        </>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>
          AI Smart Pocket &bull; Built with Gemini 3.8 Flash, Chart.js & Smart Digital Envelopes
        </p>
      </footer>
    </div>
  );
}
