import React from 'react';
import {
  FolderPlus,
  SlidersHorizontal,
  Wallet,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { PocketCard } from './PocketCard';
import { Pocket, MonthlyBudget, EXPENSE_CATEGORIES } from '../types';

interface PocketsTabProps {
  pockets: Pocket[];
  budget: MonthlyBudget;
  categoryTotals: Record<string, number>;
  currency: string;
  onOpenPocketModal: () => void;
  onOpenBudgetModal: () => void;
  onSelectPocketForExpense: (pocketId: string) => void;
  onDeletePocket: (pocketId: string) => Promise<void>;
}

export const PocketsTab: React.FC<PocketsTabProps> = ({
  pockets,
  budget,
  categoryTotals,
  currency,
  onOpenPocketModal,
  onOpenBudgetModal,
  onSelectPocketForExpense,
  onDeletePocket,
}) => {
  const totalAllocatedPockets = pockets.reduce((acc, p) => acc + p.allocatedAmount, 0);
  const totalSpentPockets = pockets.reduce((acc, p) => acc + p.spentAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Overview of Smart Envelopes */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Smart Budget Pockets
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Divide your income into dedicated digital envelopes. Each pocket has its own spending limit,
            real-time meter, and AI overspending detection.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenPocketModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Pocket</span>
          </button>
          <button
            onClick={onOpenBudgetModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>Configure Caps</span>
          </button>
        </div>
      </div>

      {/* Pockets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Active Digital Envelopes
            <span className="text-xs font-mono font-normal text-slate-400">
              ({pockets.length} pockets active)
            </span>
          </h3>

          <div className="text-xs text-slate-400 font-mono">
            Total Allocated: <span className="text-white font-bold">{currency}{totalAllocatedPockets.toLocaleString()}</span> &bull; Spent: <span className="text-emerald-400 font-bold">{currency}{totalSpentPockets.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pockets.map(pocket => (
            <PocketCard
              key={pocket.id}
              pocket={pocket}
              currency={currency}
              onSelectPocketForExpense={onSelectPocketForExpense}
              onDeletePocket={onDeletePocket}
            />
          ))}

          {/* Create new pocket dash card */}
          <button
            onClick={onOpenPocketModal}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/50 transition group text-center min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-emerald-500/10 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center transition mb-3">
              <FolderPlus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
              Add New Pocket
            </span>
            <span className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Set up envelopes for travel, tech gadgets, or specific savings targets
            </span>
          </button>
        </div>
      </div>

      {/* Category Budget Limits breakdown table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Category Budget Limits & Progress
              </h3>
              <p className="text-xs text-slate-400">Real-time expenditure vs predefined targets</p>
            </div>
          </div>

          <button
            onClick={onOpenBudgetModal}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition underline"
          >
            Edit Limits
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPENSE_CATEGORIES.map(cat => {
            const spent = categoryTotals[cat] || 0;
            const cap = budget.categoryBudgets[cat] || 0;
            const pct = cap > 0 ? (spent / cap) * 100 : 0;
            const isOver = cap > 0 && spent > cap;
            const isWarning = cap > 0 && pct >= 80 && pct <= 100;

            return (
              <div
                key={cat}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{cat}</span>
                    {isOver ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Exceeded
                      </span>
                    ) : isWarning ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Warning
                      </span>
                    ) : null}
                  </div>

                  <span className="font-mono text-slate-400">
                    <span className="text-white font-bold">{currency}{spent.toFixed(2)}</span> / {currency}{cap}
                  </span>
                </div>

                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-rose-500 animate-pulse'
                        : isWarning
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5 font-mono">
                  <span>{pct.toFixed(0)}% used</span>
                  <span>
                    {cap > spent
                      ? `${currency}${(cap - spent).toFixed(2)} left`
                      : `${currency}${(spent - cap).toFixed(2)} over budget`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
