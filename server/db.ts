import fs from 'node:fs';
import path from 'node:path';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string; // Food, Transport, Education, Shopping, Bills, Entertainment, Health, Other (or Income Source)
  source?: string; // Salary, Freelance, Investment, Gift, Business, Other
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod?: string; // Cash, Credit Card, Debit Card, UPI / Digital Wallet, Bank Transfer
  pocketId?: string; // Associated pocket/envelope
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
  month: string; // YYYY-MM
  totalBudget: number;
  categoryBudgets: Record<string, number>;
}

export interface DatabaseSchema {
  transactions: Transaction[];
  pockets: Pocket[];
  budgets: Record<string, MonthlyBudget>; // key: YYYY-MM
  settings: {
    currency: string;
    userName: string;
    monthlyIncomeGoal: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'smartpocket.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getInitialData = (): DatabaseSchema => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  const sampleTransactions: Transaction[] = [
    {
      id: 'tx-1',
      type: 'income',
      amount: 4200,
      category: 'Salary',
      source: 'Salary',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-01`,
      description: 'Tech Corp Monthly Paycheck',
      paymentMethod: 'Bank Transfer',
      pocketId: 'pocket-savings',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'tx-2',
      type: 'income',
      amount: 650,
      category: 'Freelance',
      source: 'Freelance',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-05`,
      description: 'UI/UX Design Sprint Freelance Project',
      paymentMethod: 'Digital Wallet',
      pocketId: 'pocket-emergency',
      createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 1100,
      category: 'Bills',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-02`,
      description: 'Apartment Rent & Utility Share',
      paymentMethod: 'Bank Transfer',
      pocketId: 'pocket-bills',
      createdAt: new Date(Date.now() - 24 * 86400000).toISOString(),
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 145.50,
      category: 'Food',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-04`,
      description: 'Weekly Organic Grocery Restock',
      paymentMethod: 'Debit Card',
      pocketId: 'pocket-food',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 68.20,
      category: 'Food',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-08`,
      description: 'Weekend Artisan Bakery & Coffee meetup',
      paymentMethod: 'Credit Card',
      pocketId: 'pocket-food',
      createdAt: new Date(Date.now() - 17 * 86400000).toISOString(),
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 85.00,
      category: 'Transport',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-09`,
      description: 'Metro Monthly Transit Pass',
      paymentMethod: 'Debit Card',
      pocketId: 'pocket-transport',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 120.00,
      category: 'Education',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-12`,
      description: 'Frontend Masterclass & Cloud Certification Course',
      paymentMethod: 'Credit Card',
      pocketId: 'pocket-education',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 169.99,
      category: 'Shopping',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-14`,
      description: 'Noise Cancelling Headset on Flash Sale',
      paymentMethod: 'Credit Card',
      pocketId: 'pocket-shopping',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'tx-9',
      type: 'expense',
      amount: 45.00,
      category: 'Entertainment',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-16`,
      description: 'Cinema IMAX Tickets & Popcorn Combo',
      paymentMethod: 'Digital Wallet',
      pocketId: 'pocket-fun',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: 'tx-10',
      type: 'expense',
      amount: 75.00,
      category: 'Health',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-18`,
      description: 'Bouldering Gym Pass & Supplements',
      paymentMethod: 'Debit Card',
      pocketId: 'pocket-health',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: 'tx-11',
      type: 'expense',
      amount: 32.50,
      category: 'Food',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-20`,
      description: 'Late Night Ramen Delivery',
      paymentMethod: 'Credit Card',
      pocketId: 'pocket-food',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'tx-12',
      type: 'expense',
      amount: 54.00,
      category: 'Bills',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-22`,
      description: 'Fiber Internet & Streaming subscriptions',
      paymentMethod: 'Credit Card',
      pocketId: 'pocket-bills',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'tx-13',
      type: 'expense',
      amount: 40.00,
      category: 'Transport',
      date: `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-24`,
      description: 'Airport Ride Share surge fare',
      paymentMethod: 'Digital Wallet',
      pocketId: 'pocket-transport',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];

  const samplePockets: Pocket[] = [
    {
      id: 'pocket-food',
      name: 'Food & Dining',
      category: 'Food',
      allocatedAmount: 450,
      spentAmount: 246.20,
      color: '#10b981', // emerald
      icon: 'Utensils',
      period: 'monthly',
    },
    {
      id: 'pocket-bills',
      name: 'Fixed Bills & Housing',
      category: 'Bills',
      allocatedAmount: 1250,
      spentAmount: 1154.00,
      color: '#6366f1', // indigo
      icon: 'Receipt',
      period: 'monthly',
    },
    {
      id: 'pocket-transport',
      name: 'Daily Commute',
      category: 'Transport',
      allocatedAmount: 180,
      spentAmount: 125.00,
      color: '#06b6d4', // cyan
      icon: 'Car',
      period: 'monthly',
    },
    {
      id: 'pocket-shopping',
      name: 'Shopping & Gear',
      category: 'Shopping',
      allocatedAmount: 250,
      spentAmount: 169.99,
      color: '#f59e0b', // amber
      icon: 'ShoppingBag',
      period: 'monthly',
    },
    {
      id: 'pocket-fun',
      name: 'Fun & Entertainment',
      category: 'Entertainment',
      allocatedAmount: 150,
      spentAmount: 45.00,
      color: '#ec4899', // pink
      icon: 'Sparkles',
      period: 'monthly',
    },
    {
      id: 'pocket-health',
      name: 'Wellness & Health',
      category: 'Health',
      allocatedAmount: 120,
      spentAmount: 75.00,
      color: '#8b5cf6', // purple
      icon: 'HeartPulse',
      period: 'monthly',
    },
    {
      id: 'pocket-savings',
      name: 'Emergency Nest Pocket',
      category: 'Other',
      allocatedAmount: 1000,
      spentAmount: 0,
      color: '#14b8a6', // teal
      icon: 'PiggyBank',
      period: 'goal',
    }
  ];

  return {
    transactions: sampleTransactions,
    pockets: samplePockets,
    budgets: {
      [currentMonthStr]: {
        month: currentMonthStr,
        totalBudget: 2600,
        categoryBudgets: {
          Food: 450,
          Bills: 1250,
          Transport: 180,
          Shopping: 250,
          Entertainment: 150,
          Health: 120,
          Education: 150,
          Other: 50,
        }
      }
    },
    settings: {
      currency: '$',
      userName: 'Alex Morgan',
      monthlyIncomeGoal: 5000,
    }
  };
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    this.recalculatePocketSpending();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading smartpocket.json, creating new database:', err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving smartpocket.json:', err);
    }
  }

  private persist() {
    this.recalculatePocketSpending();
    this.saveData(this.data);
  }

  private recalculatePocketSpending() {
    // Reset spent amount for pockets
    const pocketSpentMap: Record<string, number> = {};
    for (const tx of this.data.transactions) {
      if (tx.type === 'expense') {
        if (tx.pocketId) {
          pocketSpentMap[tx.pocketId] = (pocketSpentMap[tx.pocketId] || 0) + tx.amount;
        } else {
          // match by category
          const matchingPocket = this.data.pockets.find(p => p.category.toLowerCase() === tx.category.toLowerCase());
          if (matchingPocket) {
            pocketSpentMap[matchingPocket.id] = (pocketSpentMap[matchingPocket.id] || 0) + tx.amount;
          }
        }
      }
    }

    for (const pocket of this.data.pockets) {
      pocket.spentAmount = pocketSpentMap[pocket.id] || 0;
    }
  }

  // --- Transactions ---
  getTransactions(): Transaction[] {
    return [...this.data.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.transactions.unshift(newTx);
    this.persist();
    return newTx;
  }

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.data.transactions[index] = { ...this.data.transactions[index], ...updates };
    this.persist();
    return this.data.transactions[index];
  }

  deleteTransaction(id: string): boolean {
    const prevLength = this.data.transactions.length;
    this.data.transactions = this.data.transactions.filter(t => t.id !== id);
    const deleted = this.data.transactions.length < prevLength;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Pockets ---
  getPockets(): Pocket[] {
    return this.data.pockets;
  }

  addPocket(pocket: Omit<Pocket, 'id' | 'spentAmount'>): Pocket {
    const newPocket: Pocket = {
      ...pocket,
      id: `pocket-${Date.now()}`,
      spentAmount: 0,
    };
    this.data.pockets.push(newPocket);
    this.persist();
    return newPocket;
  }

  updatePocket(id: string, updates: Partial<Pocket>): Pocket | null {
    const index = this.data.pockets.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.pockets[index] = { ...this.data.pockets[index], ...updates };
    this.persist();
    return this.data.pockets[index];
  }

  deletePocket(id: string): boolean {
    const prevLength = this.data.pockets.length;
    this.data.pockets = this.data.pockets.filter(p => p.id !== id);
    const deleted = this.data.pockets.length < prevLength;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Budgets ---
  getBudget(monthStr: string): MonthlyBudget {
    if (this.data.budgets[monthStr]) {
      return this.data.budgets[monthStr];
    }
    // Default fallback based on pockets or initial
    const fallback: MonthlyBudget = {
      month: monthStr,
      totalBudget: 2500,
      categoryBudgets: {
        Food: 450,
        Bills: 1200,
        Transport: 180,
        Shopping: 250,
        Entertainment: 150,
        Health: 120,
        Education: 100,
        Other: 50,
      }
    };
    this.data.budgets[monthStr] = fallback;
    this.persist();
    return fallback;
  }

  setBudget(monthStr: string, budgetData: Partial<MonthlyBudget>): MonthlyBudget {
    const current = this.getBudget(monthStr);
    this.data.budgets[monthStr] = {
      ...current,
      ...budgetData,
      categoryBudgets: {
        ...current.categoryBudgets,
        ...(budgetData.categoryBudgets || {}),
      },
      month: monthStr,
    };
    this.persist();
    return this.data.budgets[monthStr];
  }

  // --- Settings ---
  getSettings() {
    return this.data.settings;
  }

  updateSettings(settings: Partial<DatabaseSchema['settings']>) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.persist();
    return this.data.settings;
  }

  resetToDefault() {
    this.data = getInitialData();
    this.persist();
    return true;
  }
}

export const db = new Database();
