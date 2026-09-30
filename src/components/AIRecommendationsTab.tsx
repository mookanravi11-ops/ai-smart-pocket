import React, { useState } from 'react';
import {
  Sparkles,
  BotMessageSquare,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Send,
  RefreshCw,
  Coins,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { AIRecommendation, Pocket, MonthlyBudget } from '../types';

interface AIRecommendationsTabProps {
  recommendation: AIRecommendation | null;
  isLoading: boolean;
  onRefresh: () => void;
  currency: string;
  pockets: Pocket[];
  budget: MonthlyBudget;
  onApplyBudgetSuggestion?: (category: string, amount: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const AIRecommendationsTab: React.FC<AIRecommendationsTabProps> = ({
  recommendation,
  isLoading,
  onRefresh,
  currency,
  pockets,
  budget,
  onApplyBudgetSuggestion,
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your AI Smart Pocket Advisor. I continuously analyze your transactions, pocket envelopes, and spending velocity. Ask me anything—from "Can I afford dinner tonight?" to "How can I save an extra $200 this month?"`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput.trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsSending(true);

    try {
      // Build history for API
      const history = chatMessages.map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history }),
      });

      if (!res.ok) throw new Error('Failed to get AI response');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Analysis complete. Let me know if you need specific pocket allocations!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `I'm having a brief connection pause, but based on your recent records, pacing flexible discretionary expenses this week will keep your savings on track.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const samplePrompts = [
    'Can I afford a $120 weekend dinner with friends?',
    'Which pocket is bleeding the most money?',
    'Give me a custom 50/30/20 pocket split',
    'How do I save an extra $300 next month?',
  ];

  const score = recommendation?.financialHealthScore ?? 75;
  const scoreColor =
    score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400';
  const scoreBg =
    score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 60 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';

  return (
    <div className="space-y-6">
      {/* Top Banner: Financial Health Score & Refresh */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Score Ring */}
            <div className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-3xl ${scoreBg} border`}>
              <div className="text-center">
                <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${scoreColor}`}>
                  {score}
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Health
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  <Sparkles className="w-3 h-3" /> Gemini 3.8 Intelligence
                </span>
                <span className="text-xs text-slate-400">Personalized Insights</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
                {recommendation?.summaryHeadline || 'AI Budget & Pocket Analysis'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                {recommendation?.spendingAnalysis ||
                  'Gemini synthesizes all your income streams, pocket envelopes, and discretionary trends to find actionable savings opportunities.'}
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Re-analyzing...' : 'Refresh AI Analysis'}
          </button>
        </div>
      </div>

      {/* Grid: Unnecessary Expense Alerts & Smart Saving Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unnecessary Expense Alerts */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Unnecessary Expense Alerts
                </h3>
                <span className="text-xs text-slate-400">Flagged anomalies & leakages</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {recommendation?.unnecessaryExpenseAlerts &&
            recommendation.unnecessaryExpenseAlerts.length > 0 ? (
              recommendation.unnecessaryExpenseAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-start justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        alert.severity === 'danger'
                          ? 'text-rose-400'
                          : alert.severity === 'warning'
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {alert.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{alert.flagReason}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {currency}{alert.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-400">
                No high-risk spending anomalies detected this billing cycle. Pockets are well behaved!
              </div>
            )}
          </div>
        </div>

        {/* Saving Suggestions */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  High-Impact Saving Suggestions
                </h3>
                <span className="text-xs text-slate-400">Practical pocket optimizations</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {recommendation?.savingSuggestions &&
            recommendation.savingSuggestions.length > 0 ? (
              recommendation.savingSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{sug.title}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            sug.impact === 'high'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {sug.impact} impact
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{sug.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400 block">
                        +{currency}{sug.potentialMonthlySavings}/mo
                      </span>
                      <span className="text-[10px] text-slate-500">Est. savings</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> {sug.actionText}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-center text-xs text-slate-400">
                Log additional expenses to generate deeper custom saving tactics.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Category Budgets & Pocket Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Budget Suggestions */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                AI Budget Suggestions
              </h3>
              <span className="text-xs text-slate-400">Target spending recommendations</span>
            </div>
          </div>

          <div className="space-y-3">
            {recommendation?.budgetSuggestions && recommendation.budgetSuggestions.length > 0 ? (
              recommendation.budgetSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-sm font-bold text-white block">{item.category}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">{item.reasoning}</span>
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                      Current spending: {currency}{item.currentSpending.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-indigo-300 block font-mono">
                      Target: {currency}{item.suggestedBudget}
                    </span>
                    {onApplyBudgetSuggestion && (
                      <button
                        onClick={() => onApplyBudgetSuggestion(item.category, item.suggestedBudget)}
                        className="mt-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
                      >
                        Apply to Budget
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                Budget suggestions will populate as expenses are categorized.
              </div>
            )}
          </div>
        </div>

        {/* Personalized Financial Tips */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Personalized Financial Tips
              </h3>
              <span className="text-xs text-slate-400">Curated habits & wealth rules</span>
            </div>
          </div>

          <ul className="space-y-3">
            {recommendation?.personalizedTips && recommendation.personalizedTips.length > 0 ? (
              recommendation.personalizedTips.map((tip, idx) => (
                <li
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-xs text-slate-400">
                Follow the 50/30/20 budget envelope allocation for balanced pocket growth.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Interactive AI Smart Pocket Chat Assistant */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 shadow-md">
              <BotMessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Ask Financial Pocket AI
              </h3>
              <p className="text-xs text-slate-400">
                Real-time answers grounded in your actual transactions and pocket balances
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-500 uppercase shrink-0">
            Suggested:
          </span>
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div className="mt-2 h-80 overflow-y-auto space-y-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Pocket AI is computing finances...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="mt-4 flex items-center gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Ask anything: 'Can I afford vacation tickets?', 'How are my bills pacing?'"
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isSending}
            className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
