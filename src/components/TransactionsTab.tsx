import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Wallet,
  ArrowUpDown,
} from 'lucide-react';
import { Transaction, Pocket } from '../types';

interface TransactionsTabProps {
  transactions: Transaction[];
  pockets: Pocket[];
  currency: string;
  onDeleteTransaction: (id: string) => Promise<void>;
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  pockets,
  currency,
  onDeleteTransaction,
  onOpenIncomeModal,
  onOpenExpenseModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  const pocketMap = useMemo(() => {
    const map: Record<string, Pocket> = {};
    pockets.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [pockets]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          const matchSource = t.source?.toLowerCase().includes(q);
          return matchDesc || matchCat || matchSource;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, typeFilter, categoryFilter, searchTerm, sortBy]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteTransaction(id);
    } finally {
      setDeletingId(null);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Type', 'Amount', 'Category', 'Source', 'Description', 'Date', 'PaymentMethod', 'Pocket'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.type,
      t.amount,
      t.category,
      t.source || '',
      `"${t.description.replace(/"/g, '""')}"`,
      t.date,
      t.paymentMethod || '',
      pocketMap[t.pocketId || '']?.name || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartpocket_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by description, vendor, category..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                typeFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                typeFilter === 'income' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                typeFilter === 'expense' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Transactions Log</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {filteredTransactions.length} entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenIncomeModal}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition"
            >
              + Income
            </button>
            <button
              onClick={onOpenExpenseModal}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition"
            >
              + Expense
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No transactions match your current query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Type & Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pocket / Account</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                {filteredTransactions.map(tx => {
                  const pocket = pocketMap[tx.pocketId || ''];
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Type & Date */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {isIncome ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-white block capitalize">
                              {tx.type}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {tx.date}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs truncate">
                        {tx.description}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                          {tx.category}
                        </span>
                      </td>

                      {/* Pocket */}
                      <td className="py-3.5 px-4">
                        {pocket ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{
                              backgroundColor: `${pocket.color}15`,
                              color: pocket.color,
                              borderColor: `${pocket.color}30`,
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: pocket.color }}
                            />
                            {pocket.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">General</span>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {tx.paymentMethod ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <CreditCard className="w-3 h-3 text-slate-500" />
                            {tx.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-5 text-right font-mono font-bold">
                        <span className={isIncome ? 'text-emerald-400' : 'text-slate-100'}>
                          {isIncome ? '+' : '-'}{currency}{tx.amount.toFixed(2)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition disabled:opacity-50"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
