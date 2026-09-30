import React, { useState } from 'react';
import { X, FolderPlus, Palette, Tag, DollarSign } from 'lucide-react';
import { EXPENSE_CATEGORIES, Pocket } from '../types';

interface PocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  onSave: (data: Omit<Pocket, 'id' | 'spentAmount'>) => Promise<void>;
}

const AVAILABLE_ICONS = [
  { name: 'Wallet', label: 'Wallet' },
  { name: 'Utensils', label: 'Dining' },
  { name: 'Receipt', label: 'Bills' },
  { name: 'Car', label: 'Transit' },
  { name: 'ShoppingBag', label: 'Shopping' },
  { name: 'Sparkles', label: 'Leisure' },
  { name: 'HeartPulse', label: 'Health' },
  { name: 'PiggyBank', label: 'Savings' },
  { name: 'GraduationCap', label: 'Education' },
];

const AVAILABLE_COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#14b8a6', // teal
];

export const PocketModal: React.FC<PocketModalProps> = ({
  isOpen,
  onClose,
  currency,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Food');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const [icon, setIcon] = useState('Wallet');
  const [color, setColor] = useState('#10b981');
  const [period, setPeriod] = useState<'monthly' | 'goal'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(allocatedAmount);
    if (!name.trim()) {
      setError('Please provide a name for this pocket');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid target budget');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        name: name.trim(),
        category,
        allocatedAmount: amountNum,
        color,
        icon,
        period,
      });
      setName('');
      setAllocatedAmount('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save pocket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Create Smart Pocket</h3>
              <p className="text-xs text-slate-400">Design a custom budget envelope</p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Pocket Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Groceries & Coffee, Tokyo Flight"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Type
              </label>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value as 'monthly' | 'goal')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="monthly">Monthly Pocket</option>
                <option value="goal">Savings Goal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Allocated Budget ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {currency}
              </span>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={allocatedAmount}
                onChange={e => setAllocatedAmount(e.target.value)}
                placeholder="300"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Pocket Color Theme
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {AVAILABLE_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition ${
                    color === c ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Icon
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_ICONS.map(i => (
                <button
                  type="button"
                  key={i.name}
                  onClick={() => setIcon(i.name)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition ${
                    icon === i.name
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {i.label}
                </button>
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
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Pocket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
