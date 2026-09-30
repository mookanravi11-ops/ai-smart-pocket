import { Router } from 'express';
import { db } from './db';
import { generateSmartRecommendations, chatWithAssistant } from './gemini';

export const apiRouter = Router();

// GET /api/dashboard - Aggregated metrics for fast rendering
apiRouter.get('/dashboard', (req, res) => {
  try {
    const transactions = db.getTransactions();
    const pockets = db.getPockets();
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const budget = db.getBudget(currentMonthStr);
    const settings = db.getSettings();

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;
    const savings = Math.max(0, balance);
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    // Monthly category breakdown
    const categoryTotals: Record<string, number> = {
      Food: 0,
      Transport: 0,
      Education: 0,
      Shopping: 0,
      Bills: 0,
      Entertainment: 0,
      Health: 0,
      Other: 0,
    };

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category in categoryTotals ? t.category : 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
      });

    // Monthly spending summary
    const monthlySpendingUsed = totalExpense;
    const monthlyBudgetLimit = budget.totalBudget;
    const remainingBudget = Math.max(0, monthlyBudgetLimit - monthlySpendingUsed);
    const budgetUsedPercentage = monthlyBudgetLimit > 0 ? (monthlySpendingUsed / monthlyBudgetLimit) * 100 : 0;

    res.json({
      summary: {
        totalIncome,
        totalExpenses: totalExpense,
        balance,
        savings,
        savingsRate: Number(savingsRate.toFixed(1)),
        monthlyBudget: monthlyBudgetLimit,
        monthlySpendingUsed,
        remainingBudget,
        budgetUsedPercentage: Number(budgetUsedPercentage.toFixed(1)),
      },
      categoryTotals,
      pockets,
      recentTransactions: transactions.slice(0, 10),
      budget,
      settings,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Transactions CRUD
apiRouter.get('/transactions', (req, res) => {
  try {
    const transactions = db.getTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

apiRouter.post('/transactions', (req, res) => {
  try {
    const { type, amount, category, source, date, description, paymentMethod, pocketId } = req.body;
    if (!type || !amount || !category || !date) {
      return res.status(400).json({ error: 'Missing required fields (type, amount, category, date)' });
    }

    const created = db.addTransaction({
      type,
      amount: Number(amount),
      category,
      source: source || (type === 'income' ? category : undefined),
      date,
      description: description || `${type === 'income' ? 'Income' : 'Expense'} entry`,
      paymentMethod: paymentMethod || 'Digital Wallet',
      pocketId: pocketId || undefined,
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

apiRouter.put('/transactions/:id', (req, res) => {
  try {
    const updated = db.updateTransaction(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Transaction not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

apiRouter.delete('/transactions/:id', (req, res) => {
  try {
    const success = db.deleteTransaction(req.params.id);
    if (!success) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ success: true, id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Pockets CRUD
apiRouter.get('/pockets', (req, res) => {
  try {
    const pockets = db.getPockets();
    res.json(pockets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pockets' });
  }
});

apiRouter.post('/pockets', (req, res) => {
  try {
    const { name, category, allocatedAmount, color, icon, period, targetDate } = req.body;
    if (!name || !category || allocatedAmount === undefined) {
      return res.status(400).json({ error: 'Name, category, and allocatedAmount are required' });
    }

    const newPocket = db.addPocket({
      name,
      category,
      allocatedAmount: Number(allocatedAmount),
      color: color || '#10b981',
      icon: icon || 'Wallet',
      period: period || 'monthly',
      targetDate,
    });

    res.status(201).json(newPocket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pocket' });
  }
});

apiRouter.put('/pockets/:id', (req, res) => {
  try {
    const updated = db.updatePocket(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Pocket not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pocket' });
  }
});

apiRouter.delete('/pockets/:id', (req, res) => {
  try {
    const deleted = db.deletePocket(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Pocket not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pocket' });
  }
});

// Budget Planner
apiRouter.get('/budget/:month', (req, res) => {
  try {
    const month = req.params.month;
    const budget = db.getBudget(month);
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

apiRouter.post('/budget/:month', (req, res) => {
  try {
    const month = req.params.month;
    const { totalBudget, categoryBudgets } = req.body;
    const updated = db.setBudget(month, {
      totalBudget: totalBudget !== undefined ? Number(totalBudget) : undefined,
      categoryBudgets,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

// AI Smart Recommendations (Gemini 3.8 Flash)
apiRouter.get('/ai/recommendations', async (req, res) => {
  try {
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const transactions = db.getTransactions();
    const budget = db.getBudget(currentMonthStr);
    const pockets = db.getPockets();
    const settings = db.getSettings();

    const recommendations = await generateSmartRecommendations(
      transactions,
      budget,
      pockets,
      settings.currency || '$'
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    res.status(500).json({ error: 'Could not generate recommendations' });
  }
});

// AI Chat Assistant
apiRouter.post('/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const transactions = db.getTransactions();
    const budget = db.getBudget(currentMonthStr);
    const pockets = db.getPockets();
    const settings = db.getSettings();

    const reply = await chatWithAssistant(
      message,
      history || [],
      transactions,
      budget,
      pockets,
      settings.currency || '$'
    );

    res.json({ reply });
  } catch (error) {
    console.error('Error in AI chat assistant:', error);
    res.status(500).json({ error: 'Failed to process AI chat query' });
  }
});

// Settings & Reset
apiRouter.get('/settings', (req, res) => {
  res.json(db.getSettings());
});

apiRouter.post('/settings', (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

apiRouter.post('/reset', (req, res) => {
  try {
    db.resetToDefault();
    res.json({ success: true, message: 'Database reset to initial sample data' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset database' });
  }
});
