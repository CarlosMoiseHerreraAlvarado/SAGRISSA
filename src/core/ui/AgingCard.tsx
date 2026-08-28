import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Card } from './Card';
import { Skeleton } from './Skeleton';

interface AgingItem {
  range: string;
  amount: number;
}

interface AgingCardProps {
  items: AgingItem[];
  loading?: boolean;
  title?: string;
  showTotal?: boolean;
  className?: string;
}

export function AgingCard({
  items,
  loading = false,
  title = 'Antigüedad de Saldo',
  showTotal = true,
  className = '',
}: AgingCardProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const maxAmount = Math.max(...items.map(i => i.amount), 1);

  const getBarColor = (index: number) => {
    const colors = [
      'bg-emerald-500',
      'bg-emerald-400',
      'bg-amber-400',
      'bg-orange-400',
      'bg-red-400',
    ];
    return colors[index] || colors[colors.length - 1];
  };

  if (loading) {
    return (
      <Card padding="lg" className={className}>
        <div className="flex items-center gap-2 mb-5">
          <Clock size={16} className="text-brand-blue" />
          <h4 className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-widest">
            {title}
          </h4>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton width={80} height={12} />
                <Skeleton width={60} height={12} />
              </div>
              <Skeleton height={8} className="rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className={className}>
      <div className="flex items-center gap-2 mb-5">
        <Clock size={16} className="text-brand-blue" />
        <h4 className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-widest">
          {title}
        </h4>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const percentage = (item.amount / maxAmount) * 100;
          const ratio = item.amount / total;

          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-slate-500 dark:text-slate-400 font-bold">
                  {item.range}
                </span>
                <span className="text-[12px] font-black text-slate-800 dark:text-white">
                  ${item.amount.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
                <div
                  className={`h-full ${getBarColor(index)} rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: animated ? `${percentage}%` : '0%',
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-400">
                  {(ratio * 100).toFixed(0)}% del total
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showTotal && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Total
            </span>
            <span className="text-[15px] font-black text-brand-blue">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
