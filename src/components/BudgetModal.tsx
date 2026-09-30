import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, DollarSign } from 'lucide-react';
import { MonthlyBudget, EXPENSE_CATEGORIES } from '../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: MonthlyBudget;
  currency: string;
  onSave: (totalBudget: number, categoryBudgets: Record<string, number>) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  currency,
  onSave,
}) => {
  const [total, setTotal] = useState<string>('');
  const [catLimits, setCatLimits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentBudget) {
      setTotal(currentBudget.totalBudget.toString());
      const map: Record<string, string> = {};
      EXPENSE_CATEGORIES.forEach(cat => {
        map[cat] = (currentBudget.categoryBudgets[cat] || 0).toString();
      });
      setCatLimits(map);
      setError(null);
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalNum = parseFloat(total);
    if (isNaN(totalNum) || totalNum <= 0) {
      setError('Please provide a valid total monthly budget');
      return;
    }

    const parsedCats: Record<string, number> = {};
    for (const [k, v] of Object.entries(catLimits)) {
      parsedCats[k] = parseFloat(v) || 0;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave(totalNum, parsedCats);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save budget settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Monthly Budget Planner</h3>
              <p className="text-xs text-slate-400">Configure global and category spending caps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Global Monthly Target */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/20">
            <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5">
              Total Monthly Spending Cap ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                {currency}
              </span>
              <input
                type="number"
                step="1"
                min="10"
                required
                value={total}
                onChange={e => setTotal(e.target.value)}
                placeholder="2500"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-lg font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Smart alerts will trigger when your monthly expenditures approach 80% or exceed this limit.
            </p>
          </div>

          {/* Category Budget Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Category Budget Caps
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EXPENSE_CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-medium text-slate-300">{cat}</span>
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                      {currency}
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={catLimits[cat] ?? ''}
                      onChange={e =>
                        setCatLimits(prev => ({ ...prev, [cat]: e.target.value }))
                      }
                      className="w-full pl-6 pr-2 py-1 text-right rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Apply Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
