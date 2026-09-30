import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { DashboardData } from '../types';

interface MetricCardsProps {
  summary: DashboardData['summary'];
  currency: string;
  onOpenBudgetModal: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  summary,
  currency,
  onOpenBudgetModal,
}) => {
  const isBudgetOver = summary.monthlySpendingUsed > summary.monthlyBudget;
  const isBudgetWarning =
    summary.budgetUsedPercentage >= 80 && summary.budgetUsedPercentage <= 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-lg shadow-black/20 hover:border-slate-700/80 transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Income
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {currency}
            {summary.totalIncome.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active revenue inflows</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
      </div>

      {/* 2. Total Expenses */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-lg shadow-black/20 hover:border-slate-700/80 transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Expenses
          </span>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {currency}
            {summary.totalExpenses.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Monthly pocket outflows</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-orange-400" />
      </div>

      {/* 3. Current Balance */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-lg shadow-black/20 hover:border-slate-700/80 transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Balance
          </span>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition">
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              summary.balance >= 0 ? 'text-white' : 'text-rose-400'
            }`}
          >
            {currency}
            {summary.balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-medium">
              Net Buffer
            </span>
            <span>Liquid funds available</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
      </div>

      {/* 4. Savings & Rate */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-lg shadow-black/20 hover:border-slate-700/80 transition group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Savings Retained
          </span>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {currency}
            {summary.savings.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              {summary.savingsRate}% Savings Rate
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
      </div>

      {/* Full-width / 4-column banner: Monthly Budget Planner Progress & Alert Bar */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800/90 p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl ${
                isBudgetOver
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                  : isBudgetWarning
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-indigo-500/20 text-indigo-400'
              }`}
            >
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Monthly Budget Status
                </h3>
                {isBudgetOver ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" /> Over Budget Warning!
                  </span>
                ) : isBudgetWarning ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" /> Approaching Limit
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Monthly Cap: {currency}
                {summary.monthlyBudget.toLocaleString()} &bull; Spent: {currency}
                {summary.monthlySpendingUsed.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{' '}
                &bull; Remaining Allowance:{' '}
                <strong
                  className={
                    summary.remainingBudget > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }
                >
                  {currency}
                  {summary.remainingBudget.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBudgetModal}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition whitespace-nowrap"
            >
              Adjust Budget Cap
            </button>
          </div>
        </div>

        {/* Progress Bar with dynamic fill and markers */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs font-medium mb-1.5">
            <span className="text-slate-400">
              Budget Usage: <span className="text-white font-bold">{summary.budgetUsedPercentage}%</span>
            </span>
            <span className="text-slate-400">
              {summary.remainingBudget > 0
                ? `${currency}${summary.remainingBudget.toFixed(2)} left to spend`
                : `${currency}${Math.abs(summary.monthlyBudget - summary.monthlySpendingUsed).toFixed(2)} exceeded!`}
            </span>
          </div>

          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isBudgetOver
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                  : isBudgetWarning
                  ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
              }`}
              style={{ width: `${Math.min(100, summary.budgetUsedPercentage)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
