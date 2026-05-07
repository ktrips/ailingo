import { useEffect, useState } from 'react';
import { Zap, Calendar } from 'lucide-react';
import type { SprintUsage, WeeklyUsage } from '../../types/challenge';

interface UsageMeterProps {
  sprint: SprintUsage;
  weekly: WeeklyUsage;
}

function formatCountdown(endIso: string): string {
  const diff = Math.max(0, new Date(endIso).getTime() - Date.now());
  const totalSecs = Math.floor(diff / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function UsageMeter({ sprint, weekly }: UsageMeterProps) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const sprintPct = Math.min(100, (sprint.tokensUsed / sprint.tokensLimit) * 100);
  const weeklyPct = Math.min(100, (weekly.tokensUsed / weekly.tokensLimit) * 100);
  const sprintExpired = Date.now() >= new Date(sprint.windowEnd).getTime();

  const sprintBar  = sprintPct > 85 ? 'bg-apple-red'   : sprintPct > 60 ? 'bg-apple-gold' : 'bg-apple-green';
  const sprintText = sprintPct > 85 ? 'text-apple-red' : sprintPct > 60 ? 'text-amber-500' : 'text-apple-green';

  return (
    <div className="space-y-3">
      {/* スプリント */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-apple-gold" />
            <span className="text-xs font-black text-apple-muted uppercase tracking-wide">Sprint</span>
            {sprintExpired ? (
              <span className="badge badge-red text-[10px]">ENDED</span>
            ) : (
              <span className={`text-xs font-black font-mono ${sprintText}`}>
                ⏱ {formatCountdown(sprint.windowEnd)}
              </span>
            )}
          </div>
          <span className="text-xs font-black font-mono text-apple-muted">
            <span className={sprintText}>{formatTokens(sprint.tokensUsed)}</span>
            <span className="text-apple-light"> / </span>
            {formatTokens(sprint.tokensLimit)}
          </span>
        </div>
        <div className="xp-bar h-3">
          <div className={`xp-fill ${sprintBar}`} style={{ width: `${sprintPct}%` }} />
        </div>
      </div>

      {/* ウィークリー */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-blue-500" />
            <span className="text-xs font-black text-apple-muted uppercase tracking-wide">Weekly</span>
          </div>
          <span className="text-xs font-black font-mono text-apple-muted">
            <span className="text-blue-500">{formatTokens(weekly.tokensUsed)}</span>
            <span className="text-apple-light"> / </span>
            {formatTokens(weekly.tokensLimit)}
          </span>
        </div>
        <div className="xp-bar h-3">
          <div className="xp-fill bg-blue-500" style={{ width: `${weeklyPct}%` }} />
        </div>
      </div>
    </div>
  );
}
