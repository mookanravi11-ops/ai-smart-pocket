import React from 'react';
import {
  Wallet,
  Sparkles,
  PlusCircle,
  MinusCircle,
  FolderPlus,
  RefreshCw,
  SlidersHorizontal,
  BotMessageSquare,
  Receipt,
  LayoutDashboard,
  Coins,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'pockets' | 'transactions' | 'ai';
  setActiveTab: (tab: 'dashboard' | 'pockets' | 'transactions' | 'ai') => void;
  balance: number;
  currency: string;
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenPocketModal: () => void;
  onOpenBudgetModal: () => void;
  onResetData: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  balance,
  currency,
  onOpenIncomeModal,
  onOpenExpenseModal,
  onOpenPocketModal,
  onOpenBudgetModal,
  onResetData,
  isResetting,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-2 h-2 text-slate-950" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  AI Smart<span className="text-emerald-400">Pocket</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal hidden sm:block">
                Budget envelope manager & smart financial assistant
              </p>
            </div>
          </div>

          {/* Quick Balance Ticker */}
          <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-800/90 rounded-2xl px-4 py-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 font-medium leading-none">Net Balance</span>
              <span className={`text-base font-bold font-mono ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currency}{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenIncomeModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Add Income Entry"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Add Income</span>
              <span className="sm:hidden">Income</span>
            </button>

            <button
              onClick={onOpenExpenseModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Add Expense Entry"
            >
              <MinusCircle className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Expense</span>
            </button>

            <div className="hidden md:flex items-center gap-1 border-l border-slate-800 pl-2">
              <button
                onClick={onOpenPocketModal}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                title="Create New Smart Pocket"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenBudgetModal}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition"
                title="Configure Budget Limits"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={onResetData}
                disabled={isResetting}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition disabled:opacity-50"
                title="Reset to Demo Data"
              >
                <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-900 pt-2 pb-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white shadow-sm shadow-slate-900/50 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('pockets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'pockets'
                ? 'bg-slate-800 text-white shadow-sm shadow-slate-900/50 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-400" />
            Budget Pockets
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-slate-800 text-white shadow-sm shadow-slate-900/50 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Transactions Ledger
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap relative ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-500/10'
            }`}
          >
            <BotMessageSquare className="w-4 h-4 text-emerald-400" />
            <span>AI Recommendations & Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
};
