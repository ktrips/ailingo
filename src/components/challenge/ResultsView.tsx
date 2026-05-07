import type { ReactNode } from 'react';
import { RotateCcw, ChevronRight, Map, Zap, TrendingUp, Hash } from 'lucide-react';
import type { ChallengeAttempt, Medal } from '../../types/challenge';
import { useGameStore } from '../../store/gameStore';
import { DOJO_CHALLENGES } from '../../data/dojoData';

interface ResultsViewProps {
  attempt: ChallengeAttempt;
  day: number;
  onRetry: () => void;
  onNext: () => void;
  onMap: () => void;
}

interface MedalConfig {
  emoji: string;
  label: string;
  labelColor: string;
  scoreColor: string;
  bgGradient: string;
  ringColor: string;
  barColor: string;
  celebrationEmoji: string;
}

const MEDAL_CONFIG: Record<Medal, MedalConfig> = {
  gold: {
    emoji: '🥇',
    label: 'GOLD',
    labelColor: 'text-amber-600 bg-duo-yellow/20 border-duo-yellow',
    scoreColor: 'text-amber-500',
    bgGradient: 'from-amber-50 via-white to-duo-yellow/5',
    ringColor: 'ring-4 ring-duo-yellow ring-offset-4',
    barColor: 'bg-duo-yellow',
    celebrationEmoji: '🎉',
  },
  silver: {
    emoji: '🥈',
    label: 'SILVER',
    labelColor: 'text-gray-500 bg-gray-100 border-gray-300',
    scoreColor: 'text-gray-500',
    bgGradient: 'from-gray-50 via-white to-gray-50',
    ringColor: 'ring-4 ring-gray-300 ring-offset-4',
    barColor: 'bg-gray-400',
    celebrationEmoji: '✨',
  },
  bronze: {
    emoji: '🥉',
    label: 'BRONZE',
    labelColor: 'text-orange-700 bg-orange-50 border-orange-300',
    scoreColor: 'text-orange-500',
    bgGradient: 'from-orange-50 via-white to-orange-50',
    ringColor: 'ring-4 ring-orange-400 ring-offset-4',
    barColor: 'bg-duo-orange',
    celebrationEmoji: '👏',
  },
  none: {
    emoji: '😔',
    label: 'NO MEDAL',
    labelColor: 'text-gray-400 bg-gray-50 border-gray-200',
    scoreColor: 'text-gray-400',
    bgGradient: 'from-gray-50 via-white to-gray-50',
    ringColor: 'ring-2 ring-gray-200 ring-offset-4',
    barColor: 'bg-gray-300',
    celebrationEmoji: '💪',
  },
};

function ScoreStat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card-duo flex flex-col items-center gap-1.5 p-4">
      <div className="flex items-center gap-1 text-[10px] font-black text-duo-light uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-xl font-black text-duo-text tabular-nums">{value}</div>
      {sub && <div className="text-[10px] font-bold text-duo-light">{sub}</div>}
    </div>
  );
}

export function ResultsView({ attempt, day, onRetry, onNext, onMap }: ResultsViewProps) {
  const { medal, score, qualityScore, inputTokens, outputTokens, totalTokens, response } = attempt;
  const dojoProgress = useGameStore((s) => s.dojoProgress);
  const dayProgress = dojoProgress.find((d) => d.day === day);
  const attemptCount = dayProgress?.attempts ?? 1;
  const cfg = MEDAL_CONFIG[medal];

  const preview = response.length > 200 ? response.slice(0, 200) + '…' : response;

  const dojoChallenge = DOJO_CHALLENGES.find((c) => c.day === day);
  const goldTokenLimit = dojoChallenge?.tokenLimits.gold ?? totalTokens;
  const tokenEffPct = Math.min(100, Math.max(5, (goldTokenLimit / Math.max(totalTokens, 1)) * 100));
  const qualityPct = qualityScore;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.bgGradient} flex flex-col`}>
      <div className="max-w-lg mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* Label */}
        <div className="text-center">
          <p className="text-[10px] font-black text-duo-light uppercase tracking-widest">
            Day {day} · Results {cfg.celebrationEmoji}
          </p>
        </div>

        {/* Medal display */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`
              w-36 h-36 rounded-full bg-white flex items-center justify-center text-7xl
              ${cfg.ringColor} shadow-xl
              animate-bounce-in
            `}
          >
            {cfg.emoji}
          </div>

          <span className={`text-xs font-black tracking-widest px-4 py-1.5 rounded-full border-2 ${cfg.labelColor}`}>
            {cfg.label}
          </span>

          <div className={`text-6xl font-black tabular-nums ${cfg.scoreColor}`}>
            {score.toLocaleString()}
          </div>
          <p className="text-xs font-black text-duo-light uppercase tracking-widest">POINTS</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <ScoreStat label="Quality"  value={qualityScore} sub="/ 100"                           icon={<TrendingUp size={10} />} />
          <ScoreStat label="Attempts" value={attemptCount} sub={attemptCount === 1 ? 'One-shot! 🎯' : undefined} icon={<Hash size={10} />} />
          <ScoreStat label="Input"    value={inputTokens.toLocaleString()}  sub="tokens" icon={<Zap size={10} />} />
          <ScoreStat label="Output"   value={outputTokens.toLocaleString()} sub="tokens" icon={<Zap size={10} />} />
        </div>

        {/* Performance bars */}
        <div className="card-duo p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <div className="flex items-center gap-1.5 text-duo-muted">
                <TrendingUp size={12} />
                品質スコア
              </div>
              <span className="text-duo-text">{qualityPct}/100</span>
            </div>
            <div className="xp-bar h-3">
              <div
                className={`xp-fill ${qualityPct >= 80 ? 'bg-duo-green' : qualityPct >= 50 ? 'bg-duo-yellow' : 'bg-duo-red'}`}
                style={{ width: `${qualityPct}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <div className="flex items-center gap-1.5 text-duo-muted">
                <Zap size={12} />
                トークン効率
              </div>
              <span className={`${totalTokens <= goldTokenLimit ? 'text-duo-green' : 'text-duo-red'}`}>
                {totalTokens <= goldTokenLimit ? '✅ 制限内' : '❌ 超過'}
              </span>
            </div>
            <div className="xp-bar h-3">
              <div
                className={`xp-fill ${cfg.barColor}`}
                style={{ width: `${Math.max(5, Math.min(100, tokenEffPct))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-duo-light">
              <span>Gold上限: {goldTokenLimit.toLocaleString()} tokens</span>
              <span>使用: {totalTokens.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Response preview */}
        {response && (
          <div className="space-y-2">
            <p className="text-[10px] font-black text-duo-light uppercase tracking-widest">レスポンスプレビュー</p>
            <div className="card-duo p-4 text-xs text-duo-muted leading-relaxed font-mono whitespace-pre-wrap break-words">
              {preview}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onRetry}
            className="btn-duo-outline flex flex-col items-center gap-2 py-4 text-xs"
          >
            <RotateCcw size={18} />
            再挑戦
          </button>
          <button
            onClick={onNext}
            className={`btn-duo flex flex-col items-center gap-2 py-4 text-xs ${
              medal === 'gold'
                ? 'bg-duo-yellow border-duo-yellow-dark text-amber-700'
                : 'bg-duo-green border-duo-green-dark text-white'
            }`}
          >
            <ChevronRight size={18} />
            次へ進む
          </button>
          <button
            onClick={onMap}
            className="btn-duo-outline flex flex-col items-center gap-2 py-4 text-xs"
          >
            <Map size={18} />
            マップへ
          </button>
        </div>

      </div>
    </div>
  );
}
