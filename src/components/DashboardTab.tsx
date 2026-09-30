import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Receipt,
  Wallet,
  Clock,
  PieChart,
  PlusCircle,
  MinusCircle,
  ExternalLink,
} from 'lucide-react';
import { MetricCards } from './MetricCards';
import { ExpenseDoughnutChart, IncomeVsExpenseChart } from './Charts';
import { PocketCard } from './PocketCard';
import { DashboardData, Pocket, Transaction } from '../types';

interface DashboardTabProps {
  data: DashboardData;
  currency: string;
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenPocketModal: () => void;
  onOpenBudgetModal: () => void;
  onSelectPocketForExpense: (pocketId: string) => void;
  onNavigateToTab: (tab: 'dashboard' | 'pockets' | 'transactions' | 'ai') => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  data,
  currency,
  onOpenIncomeModal,
  onOpenExpenseModal,
  onOpenPocketModal,
  onOpenBudgetModal,
  onSelectPocketForExpense,
  onNavigateToTab,
}) => {
  const { summary, categoryTotals, pockets, recentTransactions, budget } = data;

  return (
    <div className="space-y-6">
      {/* 1. KPI Metric Cards */}
      <MetricCards
        summary={summary}
        currency={currency}
        onOpenBudgetModal={onOpenBudgetModal}
      />

      {/* 2. Charts Section: Category Doughnut + Comparison Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Doughnut Chart: Expense Breakdown */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Expenses by Category
                  </h3>
                  <span className="text-xs text-slate-400">Monthly allocation</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <ExpenseDoughnutChart categoryTotals={categoryTotals} currency={currency} />
            </div>
          </div>

          {/* Category Chips below chart */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(categoryTotals)
              .filter(([_, amt]) => amt > 0)
              .slice(0, 6)
              .map(([cat, amt]) => (
                <div key={cat} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60">
                  <span className="text-slate-400 font-medium truncate max-w-[90px]">{cat}</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {currency}{amt.toFixed(0)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Bar Chart: Cashflow & Budget Velocity */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Budget Velocity & Inflow vs Outflow
                </h3>
                <span className="text-xs text-slate-400">
                  Planned cap vs actual spending vs retained buffer
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  {summary.savingsRate}% Saved
                </span>
              </div>
            </div>

            <IncomeVsExpenseChart
              income={summary.totalIncome}
              expenses={summary.totalExpenses}
              budget={summary.monthlyBudget}
              currency={currency}
            />
          </div>

          {/* AI Advisor Teaser Strip */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Gemini 3.8 AI Assistant Ready
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Ask budget questions, detect leakages, and get pocket advice.
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('ai')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md whitespace-nowrap"
            >
              <span>Explore AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Budget Pockets Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Smart Pocket Envelopes</h3>
          </div>

          <button
            onClick={() => onNavigateToTab('pockets')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>View All Pockets ({pockets.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pockets.slice(0, 3).map(pocket => (
            <PocketCard
              key={pocket.id}
              pocket={pocket}
              currency={currency}
              onSelectPocketForExpense={onSelectPocketForExpense}
            />
          ))}
        </div>
      </div>

      {/* 4. Recent Transactions */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Activity</h3>
          </div>

          <button
            onClick={() => onNavigateToTab('transactions')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
          >
            <span>Full Ledger</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No transactions logged yet. Use the buttons above to log your first income or expense!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentTransactions.slice(0, 5).map(tx => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs sm:text-sm truncate">
                          {tx.description}
                        </span>
                        <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {tx.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        {tx.date} &bull; {tx.paymentMethod || tx.source || 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-mono font-bold ${
                        isIncome ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{currency}{tx.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
