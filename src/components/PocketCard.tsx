import React from 'react';
import {
  Utensils,
  Receipt,
  Car,
  ShoppingBag,
  Sparkles,
  HeartPulse,
  PiggyBank,
  GraduationCap,
  Wallet,
  AlertCircle,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { Pocket } from '../types';

interface PocketCardProps {
  pocket: Pocket;
  currency: string;
  onSelectPocketForExpense?: (pocketId: string) => void;
  onEditPocket?: (pocket: Pocket) => void;
  onDeletePocket?: (pocketId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Receipt,
  Car,
  ShoppingBag,
  Sparkles,
  HeartPulse,
  PiggyBank,
  GraduationCap,
  Wallet,
};

export const PocketCard: React.FC<PocketCardProps> = ({
  pocket,
  currency,
  onSelectPocketForExpense,
  onEditPocket,
  onDeletePocket,
}) => {
  const IconComponent = ICON_MAP[pocket.icon] || Wallet;
  const percentage = pocket.allocatedAmount > 0
    ? (pocket.spentAmount / pocket.allocatedAmount) * 100
    : 0;
  const remaining = pocket.allocatedAmount - pocket.spentAmount;

  const isOver = percentage >= 100;
  const isNearLimit = percentage >= 80 && percentage < 100;

  return (
    <div
      className="relative flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg shadow-black/20 hover:border-slate-700 transition group"
      style={{
        boxShadow: `0 4px 20px -5px ${pocket.color}15`,
      }}
    >
      <div>
        {/* Header: Icon, Name, Category */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: pocket.color }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white tracking-tight group-hover:text-emerald-300 transition">
                {pocket.name}
              </h4>
              <span className="text-xs text-slate-400 font-medium">
                {pocket.category} &bull; {pocket.period === 'goal' ? 'Savings Goal' : 'Monthly Pocket'}
              </span>
            </div>
          </div>

          {/* Action options */}
          <div className="flex items-center gap-1">
            {onSelectPocketForExpense && (
              <button
                onClick={() => onSelectPocketForExpense(pocket.id)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Quick Add Expense to this Pocket"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            {onDeletePocket && (
              <button
                onClick={() => onDeletePocket(pocket.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Delete Pocket"
              >
                <span className="sr-only">Delete</span>
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Numbers */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Spent
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {currency}{pocket.spentAmount.toFixed(2)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Pocket Limit
            </span>
            <span className="text-lg font-bold text-slate-300 font-mono">
              {currency}{pocket.allocatedAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-slate-300">
              {percentage.toFixed(0)}% used
            </span>
            <span
              className={`font-semibold ${
                isOver ? 'text-rose-400' : isNearLimit ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {remaining >= 0
                ? `${currency}${remaining.toFixed(2)} left`
                : `${currency}${Math.abs(remaining).toFixed(2)} over!`}
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOver
                  ? 'bg-rose-500 animate-pulse'
                  : isNearLimit
                  ? 'bg-amber-400'
                  : ''
              }`}
              style={{
                width: `${Math.min(100, percentage)}%`,
                backgroundColor: isOver ? undefined : isNearLimit ? undefined : pocket.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Warning Alert if over or near limit */}
      {(isOver || isNearLimit) && (
        <div
          className={`mt-4 px-3 py-2 rounded-xl text-xs flex items-center gap-2 border ${
            isOver
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isOver
              ? 'Pocket limit exceeded. Pause spending or reallocate funds!'
              : 'Nearing 80%+ limit. Pace flexible expenses carefully.'}
          </span>
        </div>
      )}
    </div>
  );
};
