export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  source?: string;
  date: string;
  description: string;
  paymentMethod?: string;
  pocketId?: string;
  createdAt: string;
}

export interface Pocket {
  id: string;
  name: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  color: string;
  icon: string;
  period: 'monthly' | 'goal';
  targetDate?: string;
}

export interface MonthlyBudget {
  month: string;
  totalBudget: number;
  categoryBudgets: Record<string, number>;
}

export interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    savings: number;
    savingsRate: number;
    monthlyBudget: number;
    monthlySpendingUsed: number;
    remainingBudget: number;
    budgetUsedPercentage: number;
  };
  categoryTotals: Record<string, number>;
  pockets: Pocket[];
  recentTransactions: Transaction[];
  budget: MonthlyBudget;
  settings: {
    currency: string;
    userName: string;
    monthlyIncomeGoal: number;
  };
}

export interface AIRecommendation {
  summaryHeadline: string;
  financialHealthScore: number;
  spendingAnalysis: string;
  savingSuggestions: Array<{
    title: string;
    description: string;
    potentialMonthlySavings: number;
    impact: 'high' | 'medium' | 'low';
    actionText: string;
  }>;
  unnecessaryExpenseAlerts: Array<{
    title: string;
    category: string;
    amount: number;
    flagReason: string;
    severity: 'warning' | 'danger' | 'info';
  }>;
  budgetSuggestions: Array<{
    category: string;
    currentSpending: number;
    suggestedBudget: number;
    reasoning: string;
  }>;
  pocketAllocations: Array<{
    pocketName: string;
    status: 'healthy' | 'near-limit' | 'exceeded';
    recommendation: string;
  }>;
  personalizedTips: string[];
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Education',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
] as const;

export const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Investment',
  'Gift',
  'Business',
  'Dividends',
  'Other',
] as const;

export const PAYMENT_METHODS = [
  'Debit Card',
  'Credit Card',
  'Digital Wallet / UPI',
  'Bank Transfer',
  'Cash',
] as const;
