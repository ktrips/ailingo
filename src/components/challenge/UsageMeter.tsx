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

  const sprintBarColor = sprintPct > 85 ? 'bg-duo-red' : sprintPct > 60 ? 'bg-duo-yellow' : 'bg-duo-green';
  const sprintTextColor = sprintPct > 85 ? 'text-duo-red' : sprintPct > 60 ? 'text-amber-500' : 'text-duo-green';

  return (
    <div className="card-duo p-4 space-y-3">
      {/* Sprint */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-duo-yellow" />
            <span className="text-xs font-black text-duo-muted uppercase tracking-wide">Sprint</span>
            {sprintExpired ? (
              <span className="text-[10px] font-black text-duo-red bg-duo-red/10 rounded-full px-2 py-0.5">ENDED</span>
            ) : (
              <span className={`text-xs font-black font-mono ${sprintTextColor}`}>
                ⏱ {formatCountdown(sprint.windowEnd)}
              </span>
            )}
          </div>
          <span className="text-xs font-black font-mono text-duo-muted">
            <span className={sprintTextColor}>{formatTokens(sprint.tokensUsed)}</span>
            <span className="text-duo-light"> / </span>
            {formatTokens(sprint.tokensLimit)}
          </span>
        </div>
        <div className="xp-bar h-3">
          <div
            className={`xp-fill ${sprintBarColor}`}
            style={{ width: `${sprintPct}%` }}
          />
        </div>
      </div>

      {/* Weekly */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-duo-blue" />
            <span className="text-xs font-black text-duo-muted uppercase tracking-wide">Weekly</span>
          </div>
          <span className="text-xs font-black font-mono text-duo-muted">
            <span className="text-duo-blue">{formatTokens(weekly.tokensUsed)}</span>
            <span className="text-duo-light"> / </span>
            {formatTokens(weekly.tokensLimit)}
          </span>
        </div>
        <div className="xp-bar h-3">
          <div
            className="xp-fill bg-duo-blue"
            style={{ width: `${weeklyPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
