import { GoogleGenAI, Type } from '@google/genai';
import { Transaction, Pocket, MonthlyBudget } from './db';

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export interface SmartRecommendationsResponse {
  summaryHeadline: string;
  financialHealthScore: number; // 0 - 100
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

export async function generateSmartRecommendations(
  transactions: Transaction[],
  budget: MonthlyBudget,
  pockets: Pocket[],
  currency: string = '$'
): Promise<SmartRecommendationsResponse> {
  const ai = getGeminiClient();

  // Compute stats for prompt context
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  const recentTransactions = transactions.slice(0, 15).map(t => ({
    date: t.date,
    type: t.type,
    category: t.category,
    amount: `${currency}${t.amount.toFixed(2)}`,
    desc: t.description,
    pocket: t.pocketId || 'General',
  }));

  const pocketsSummary = pockets.map(p => ({
    name: p.name,
    category: p.category,
    allocated: `${currency}${p.allocatedAmount}`,
    spent: `${currency}${p.spentAmount}`,
    usagePct: p.allocatedAmount > 0 ? `${((p.spentAmount / p.allocatedAmount) * 100).toFixed(0)}%` : '0%',
  }));

  if (!ai) {
    // Generate intelligent algorithmic baseline when API key is missing
    return createAlgorithmicFallback(totalIncome, totalExpense, expensesByCategory, pockets, currency);
  }

  const prompt = `
Analyze the following personal finance data for "AI Smart Pocket" app and generate actionable, smart budgeting and saving recommendations.

FINANCIAL SUMMARY:
- Total Income: ${currency}${totalIncome.toFixed(2)}
- Total Expenses: ${currency}${totalExpense.toFixed(2)}
- Net Balance / Savings: ${currency}${netSavings.toFixed(2)} (Savings Rate: ${savingsRate}%)
- Monthly Planned Budget: ${currency}${budget.totalBudget}

CATEGORY SPENDING:
${JSON.stringify(expensesByCategory, null, 2)}

ACTIVE BUDGET POCKETS:
${JSON.stringify(pocketsSummary, null, 2)}

RECENT TRANSACTIONS:
${JSON.stringify(recentTransactions, null, 2)}

Return your response strictly in the JSON format conforming to the schema.
Provide realistic, highly practical, empathetic, and actionable advice to optimize pockets, eliminate unnecessary expenses, and boost savings.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are AI Smart Pocket Advisor, an elite, friendly, and practical financial intelligence assistant. 
Analyze transactions deeply. Detect high frequency small purchases, recurring subscriptions, dining out surges, and pocket limit breaches.
Provide numerical suggestions with realistic dollar amounts. Keep advice empowering, clear, and actionable.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryHeadline: {
              type: Type.STRING,
              description: 'Catchy 1-sentence insight summarizing current financial health and primary opportunity',
            },
            financialHealthScore: {
              type: Type.NUMBER,
              description: 'Integer from 0 to 100 representing overall pocket budget health and savings resilience',
            },
            spendingAnalysis: {
              type: Type.STRING,
              description: 'Clear paragraph analyzing current spending patterns, top categories, and savings velocity',
            },
            savingSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  potentialMonthlySavings: { type: Type.NUMBER },
                  impact: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                  actionText: { type: Type.STRING },
                },
                required: ['title', 'description', 'potentialMonthlySavings', 'impact', 'actionText'],
              },
            },
            unnecessaryExpenseAlerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  flagReason: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['warning', 'danger', 'info'] },
                },
                required: ['title', 'category', 'amount', 'flagReason', 'severity'],
              },
            },
            budgetSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  currentSpending: { type: Type.NUMBER },
                  suggestedBudget: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING },
                },
                required: ['category', 'currentSpending', 'suggestedBudget', 'reasoning'],
              },
            },
            pocketAllocations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pocketName: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['healthy', 'near-limit', 'exceeded'] },
                  recommendation: { type: Type.STRING },
                },
                required: ['pocketName', 'status', 'recommendation'],
              },
            },
            personalizedTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'summaryHeadline',
            'financialHealthScore',
            'spendingAnalysis',
            'savingSuggestions',
            'unnecessaryExpenseAlerts',
            'budgetSuggestions',
            'pocketAllocations',
            'personalizedTips',
          ],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error('Empty response from Gemini');
    const parsed = JSON.parse(text) as SmartRecommendationsResponse;
    return parsed;
  } catch (error) {
    console.error('Gemini generateSmartRecommendations error:', error);
    return createAlgorithmicFallback(totalIncome, totalExpense, expensesByCategory, pockets, currency);
  }
}

export async function chatWithAssistant(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  transactions: Transaction[],
  budget: MonthlyBudget,
  pockets: Pocket[],
  currency: string = '$'
): Promise<string> {
  const ai = getGeminiClient();

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const topExpenses = Object.entries(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `${cat}: ${currency}${amt.toFixed(2)}`)
    .join(', ');

  const pocketsStatus = pockets
    .map(p => `${p.name} (${currency}${p.spentAmount}/${currency}${p.allocatedAmount})`)
    .join('; ');

  if (!ai) {
    return `Hello! I'm your AI Smart Pocket Assistant. Right now your total income is ${currency}${totalIncome.toFixed(2)}, total expenses are ${currency}${totalExpense.toFixed(2)}, and current remaining balance is ${currency}${balance.toFixed(2)}. Your highest spending areas are: ${topExpenses}. Let me know if you would like advice on adjusting your pocket limits, planning for an upcoming purchase, or finding extra savings!`;
  }

  const systemInstruction = `You are "AI Smart Pocket Advisor", a smart, friendly, and practical personal finance assistant inside the user's budget application.
You have real-time access to the user's current finances:
- Total Income: ${currency}${totalIncome.toFixed(2)}
- Total Expenses: ${currency}${totalExpense.toFixed(2)}
- Current Net Balance: ${currency}${balance.toFixed(2)}
- Monthly Budget Limit: ${currency}${budget.totalBudget.toFixed(2)}
- Top Spending Categories: ${topExpenses || 'None logged yet'}
- Pockets: ${pocketsStatus || 'None'}

RULES:
1. Provide concise, direct, helpful, and empowering financial answers.
2. If asked "Can I afford X?", calculate against their remaining pocket balance and overall budget. Recommend which pocket should fund it.
3. Suggest smart pocket envelopes and micro-saving tactics.
4. Format using clean markdown (bullet points, bold highlights).
5. Never judge or lecture; be an encouraging and practical ally.`;

  try {
    const formattedContents = [
      ...history.map(h => ({
        role: h.role,
        parts: h.parts,
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || 'I analyzed your pockets and finances. How else can I assist your budget today?';
  } catch (error) {
    console.error('Chat error:', error);
    return `I evaluated your data: Your current balance is ${currency}${balance.toFixed(2)} with ${currency}${totalExpense.toFixed(2)} in total expenses. You have healthy capacity in your savings, but consider pacing discretionary shopping this week.`;
  }
}

function createAlgorithmicFallback(
  totalIncome: number,
  totalExpense: number,
  expensesByCategory: Record<string, number>,
  pockets: Pocket[],
  currency: string
): SmartRecommendationsResponse {
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;
  const foodSpending = expensesByCategory['Food'] || 0;
  const shoppingSpending = expensesByCategory['Shopping'] || 0;
  const entertainmentSpending = expensesByCategory['Entertainment'] || 0;

  const score = Math.min(
    95,
    Math.max(
      35,
      Math.round(
        (savingsRate > 20 ? 50 : savingsRate * 2.5) +
          (balance > 500 ? 30 : 15) +
          (totalExpense < totalIncome * 0.8 ? 15 : 5)
      )
    )
  );

  return {
    summaryHeadline:
      savingsRate >= 20
        ? `Strong financial momentum with a healthy ${savingsRate}% savings rate and positive pocket buffers!`
        : `Your spending is pacing near income threshold; reallocating 2 flexible pockets can unlock ${currency}220+ in monthly savings.`,
    financialHealthScore: score,
    spendingAnalysis: `You have recorded ${currency}${totalIncome.toFixed(2)} in income against ${currency}${totalExpense.toFixed(2)} in total expenditures, retaining a net balance of ${currency}${balance.toFixed(2)}. Essential bills represent your primary fixed outflow, while Food (${currency}${foodSpending.toFixed(2)}) and Shopping (${currency}${shoppingSpending.toFixed(2)}) present immediate opportunities for micro-optimizations.`,
    savingSuggestions: [
      {
        title: 'Optimize Dining & Food Delivery',
        description:
          'Batch grocery restocking and limiting takeout delivery orders to twice weekly can curb high delivery surcharges and convenience fees.',
        potentialMonthlySavings: 95,
        impact: 'high',
        actionText: 'Cap Food Pocket to weekly $100 allowance',
      },
      {
        title: 'The 48-Hour Discretionary Buffer',
        description:
          'Apply a 48-hour cooling-off rule on non-essential online shopping and tech gear purchases over $50.',
        potentialMonthlySavings: 80,
        impact: 'medium',
        actionText: 'Lock Shopping Pocket until weekend review',
      },
      {
        title: 'Automate Emergency Nest Pocket',
        description:
          'Divert 10% of every incoming paycheck immediately into your Emergency Pocket on the day of deposit.',
        potentialMonthlySavings: 150,
        impact: 'high',
        actionText: 'Enable 10% auto-pocket transfer',
      },
    ],
    unnecessaryExpenseAlerts: [
      ...(foodSpending > 200
        ? [
            {
              title: 'Frequent Food & Dining Outflow',
              category: 'Food',
              amount: foodSpending,
              flagReason: 'Dining & takeout accounts for a notable portion of variable expenses this cycle.',
              severity: 'warning' as const,
            },
          ]
        : []),
      ...(entertainmentSpending > 100
        ? [
            {
              title: 'Entertainment & Leisure Peaks',
              category: 'Entertainment',
              amount: entertainmentSpending,
              flagReason: 'Tickets and impulse leisure activities exceeded baseline projection.',
              severity: 'info' as const,
            },
          ]
        : []),
    ],
    budgetSuggestions: [
      {
        category: 'Food',
        currentSpending: foodSpending,
        suggestedBudget: Math.max(300, Math.round(foodSpending * 0.85)),
        reasoning: 'Aligns with typical 15% household food ratio while leaving ample room for quality groceries.',
      },
      {
        category: 'Shopping',
        currentSpending: shoppingSpending,
        suggestedBudget: Math.max(150, Math.round(shoppingSpending * 0.8)),
        reasoning: 'Provides a realistic discretionary ceiling without feeling overly restrictive.',
      },
    ],
    pocketAllocations: pockets.map(p => {
      const pct = p.allocatedAmount > 0 ? (p.spentAmount / p.allocatedAmount) * 100 : 0;
      let status: 'healthy' | 'near-limit' | 'exceeded' = 'healthy';
      if (pct >= 100) status = 'exceeded';
      else if (pct >= 80) status = 'near-limit';

      return {
        pocketName: p.name,
        status,
        recommendation:
          status === 'exceeded'
            ? `Spent ${currency}${p.spentAmount.toFixed(0)} out of ${currency}${p.allocatedAmount}. Shift funds from a surplus pocket or pause new charges.`
            : status === 'near-limit'
            ? `At ${pct.toFixed(0)}% capacity. Has ${currency}${(p.allocatedAmount - p.spentAmount).toFixed(0)} remaining.`
            : `Healthy buffer. ${currency}${(p.allocatedAmount - p.spentAmount).toFixed(0)} available for the rest of this cycle.`,
      };
    }),
    personalizedTips: [
      'Follow the 50/30/20 Smart Pocket model: 50% for Fixed Bills & Needs, 30% for Flexible Lifestyle, 20% for Goal Pockets.',
      'Log cash and digital wallet purchases immediately so your pocket gauges stay 100% synchronized.',
      'Review your recurring bill pocket subscriptions quarterly to cancel unused streaming or app memberships.',
    ],
  };
}
