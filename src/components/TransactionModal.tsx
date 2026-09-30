import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  MinusCircle,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  FileText,
  Wallet,
} from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  PAYMENT_METHODS,
  Pocket,
  Transaction,
} from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  pockets: Pocket[];
  currency: string;
  defaultPocketId?: string;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  type,
  pockets,
  currency,
  defaultPocketId,
  onSave,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(
    type === 'income' ? 'Salary' : 'Food'
  );
  const [source, setSource] = useState<string>('Salary');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Debit Card');
  const [pocketId, setPocketId] = useState<string>(defaultPocketId || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError(null);
      if (type === 'income') {
        setCategory('Salary');
        setSource('Salary');
      } else {
        setCategory('Food');
      }
      setPocketId(defaultPocketId || '');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, type, defaultPocketId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!description.trim()) {
      setError('Please add a short description');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onSave({
        type,
        amount: numAmount,
        category: type === 'income' ? source : category,
        source: type === 'income' ? source : undefined,
        date,
        description: description.trim(),
        paymentMethod: type === 'expense' ? paymentMethod : undefined,
        pocketId: pocketId || undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = type === 'income' ? [500, 1000, 2500, 5000] : [15, 30, 50, 100, 250];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            type === 'income'
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
              : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500'
          }`}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                type === 'income'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {type === 'income' ? (
                <PlusCircle className="w-6 h-6" />
              ) : (
                <MinusCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {type === 'income' ? 'Add Income Entry' : 'Add Expense Entry'}
              </h3>
              <p className="text-xs text-slate-400">
                {type === 'income'
                  ? 'Record salary, freelance earnings, or revenue'
                  : 'Log daily spending and allocate to a smart pocket'}
              </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Amount ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-xl font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                autoFocus
              />
            </div>

            {/* Quick amount chips */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">Quick:</span>
              {quickAmounts.map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium transition"
                >
                  +{currency}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category or Source */}
          {type === 'expense' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Expense Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EXPENSE_CATEGORIES.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      // Auto-select corresponding pocket if available
                      const matchingPocket = pockets.find(
                        p => p.category.toLowerCase() === cat.toLowerCase()
                      );
                      if (matchingPocket) setPocketId(matchingPocket.id);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                      category === cat
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Income Source
              </label>
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              >
                {INCOME_SOURCES.map(src => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Smart Pocket Allocation (Envelope) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Smart Pocket Allocation
            </label>
            <select
              value={pocketId}
              onChange={e => setPocketId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="">General / Unassigned</option>
              {pockets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({currency}{p.spentAmount.toFixed(0)}/{currency}{p.allocatedAmount.toFixed(0)})
                </option>
              ))}
            </select>
          </div>

          {/* Description & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Description
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={type === 'income' ? 'e.g. Monthly salary' : 'e.g. Organic grocery store'}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method (for expenses) */}
          {type === 'expense' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              >
                {PAYMENT_METHODS.map(pm => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition flex items-center gap-2 ${
                type === 'income'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
              } disabled:opacity-50`}
            >
              {loading
                ? 'Saving...'
                : type === 'income'
                ? 'Save Income'
                : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
