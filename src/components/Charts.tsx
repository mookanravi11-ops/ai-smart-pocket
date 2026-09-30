import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
  DoughnutController,
  BarController,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
  DoughnutController,
  BarController
);

interface DoughnutChartProps {
  categoryTotals: Record<string, number>;
  currency?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#10b981', // emerald
  Bills: '#6366f1', // indigo
  Transport: '#06b6d4', // cyan
  Shopping: '#f59e0b', // amber
  Entertainment: '#ec4899', // pink
  Health: '#8b5cf6', // purple
  Education: '#3b82f6', // blue
  Other: '#64748b', // slate
};

export const ExpenseDoughnutChart: React.FC<DoughnutChartProps> = ({
  categoryTotals,
  currency = '$',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const categories = Object.keys(categoryTotals).filter(cat => (categoryTotals[cat] || 0) > 0);
  const dataValues = categories.map(cat => categoryTotals[cat] || 0);
  const backgroundColors = categories.map(cat => CATEGORY_COLORS[cat] || '#94a3b8');
  const total = dataValues.reduce((sum, val) => sum + val, 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (dataValues.length === 0) {
      // Draw empty placeholder
      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: ['No Expenses Yet'],
          datasets: [
            {
              data: [1],
              backgroundColor: ['#334155'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '76%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
        },
      });
      return;
    }

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [
          {
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: '#090d16',
            borderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '74%',
        animation: {
          animateRotate: true,
          duration: 900,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            callbacks: {
              label: context => {
                const val = Number(context.raw);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                return ` ${context.label}: ${currency}${val.toFixed(2)} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [categoryTotals, currency]);

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <canvas ref={canvasRef} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs uppercase font-medium tracking-wider text-slate-400">Total Spent</span>
        <span className="text-2xl font-bold text-white tracking-tight">
          {currency}{total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
        </span>
        <span className="text-[11px] text-emerald-400 font-medium">{categories.length} Categories</span>
      </div>
    </div>
  );
};

interface BarChartProps {
  income: number;
  expenses: number;
  budget: number;
  currency?: string;
}

export const IncomeVsExpenseChart: React.FC<BarChartProps> = ({
  income,
  expenses,
  budget,
  currency = '$',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: ['Total Income', 'Monthly Budget', 'Actual Spending', 'Net Savings'],
        datasets: [
          {
            label: 'Amount',
            data: [income, budget, expenses, Math.max(0, income - expenses)],
            backgroundColor: [
              '#10b981', // emerald for income
              '#6366f1', // indigo for budget
              expenses > budget ? '#ef4444' : '#38bdf8', // red if over budget, cyan if under
              '#f59e0b', // amber for savings
            ],
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: context => ` ${currency}${Number(context.raw).toFixed(2)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 11, family: 'Plus Jakarta Sans' } },
          },
          y: {
            grid: { color: '#1e293b' },
            ticks: {
              color: '#64748b',
              font: { size: 10 },
              callback: value => `${currency}${value}`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [income, expenses, budget, currency]);

  return (
    <div className="w-full h-56">
      <canvas ref={canvasRef} />
    </div>
  );
};
