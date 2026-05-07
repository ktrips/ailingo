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
  emoji: string; label: string; sublabel: string;
  gradient: string; ring: string; scoreColor: string;
  barColor: string; labelStyle: string; confetti: string[];
}

const MEDAL_CONFIG: Record<Medal, MedalConfig> = {
  gold: {
    emoji: '🥇', label: 'GOLD', sublabel: '完璧！素晴らしい！',
    gradient: 'from-yellow-50 via-apple-bg to-amber-50',
    ring: 'ring-4 ring-apple-gold ring-offset-4 shadow-glow-gold',
    scoreColor: 'text-amber-500',
    barColor: 'bg-apple-gold',
    labelStyle: 'bg-yellow-50 border-yellow-300 text-amber-600',
    confetti: ['🥇','⭐','✨','🎉','🍎','❤️','💛'],
  },
  silver: {
    emoji: '🥈', label: 'SILVER', sublabel: 'よくできました！',
    gradient: 'from-gray-50 via-apple-bg to-gray-50',
    ring: 'ring-4 ring-gray-300 ring-offset-4 shadow-lg',
    scoreColor: 'text-gray-500',
    barColor: 'bg-gray-400',
    labelStyle: 'bg-gray-100 border-gray-300 text-gray-600',
    confetti: ['🥈','✨','💫','🎊','🍎'],
  },
  bronze: {
    emoji: '🥉', label: 'BRONZE', sublabel: 'よく頑張った！',
    gradient: 'from-orange-50 via-apple-bg to-amber-50',
    ring: 'ring-4 ring-orange-400 ring-offset-4 shadow-lg',
    scoreColor: 'text-orange-500',
    barColor: 'bg-apple-coral',
    labelStyle: 'bg-orange-50 border-orange-300 text-orange-700',
    confetti: ['🥉','🎖️','👏','🍎','💪'],
  },
  none: {
    emoji: '😔', label: 'TRY AGAIN', sublabel: '次はきっといける！',
    gradient: 'from-apple-pink-light via-apple-bg to-apple-pink-light',
    ring: 'ring-2 ring-apple-red/30 ring-offset-4 shadow-md',
    scoreColor: 'text-apple-muted',
    barColor: 'bg-gray-300',
    labelStyle: 'bg-apple-pink-light border-apple-red/30 text-apple-red',
    confetti: ['😔','💪','🔥','🍎'],
  },
};

function Confetti({ emojis }: { emojis: string[] }) {
  return (
    <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 16 }, (_, i) => (
        <div
          key={i}
          className="absolute animate-float text-xl opacity-20"
          style={{
            left: `${5 + (i * 6) % 90}%`,
            top: `${3 + (i * 11) % 85}%`,
            animationDelay: `${(i * 0.3) % 3}s`,
            animationDuration: `${2.5 + (i % 3) * 0.5}s`,
          }}
        >
          {emojis[i % emojis.length]}
        </div>
      ))}
    </div>
  );
}

function ScoreStat({
  label, value, sub, icon,
}: {
  label: string; value: string | number; sub?: string; icon?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-1.5 p-4">
      <div className="flex items-center gap-1 text-[10px] font-black text-apple-light uppercase tracking-wider">
        {icon}{label}
      </div>
      <div className="text-xl font-black text-apple-text tabular-nums">{value}</div>
      {sub && <div className="text-[10px] font-bold text-apple-light">{sub}</div>}
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
  const goldLimit = dojoChallenge?.tokenLimits.gold ?? totalTokens;
  const tokenEffPct = Math.min(100, Math.max(5, (goldLimit / Math.max(totalTokens, 1)) * 100));

  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.gradient} relative overflow-hidden`}>
      <Confetti emojis={cfg.confetti} />

      <div className="max-w-lg mx-auto w-full px-4 py-8 flex flex-col gap-6 relative z-10">

        {/* ラベル */}
        <div className="text-center">
          <p className="text-[10px] font-black text-apple-light uppercase tracking-widest">
            Day {day} · Results
          </p>
        </div>

        {/* メダル */}
        <div className="flex flex-col items-center gap-4">
          <div className={`w-36 h-36 rounded-full bg-white flex items-center justify-center text-7xl ${cfg.ring} animate-bounce-in`}>
            {cfg.emoji}
          </div>

          <div>
            <div className={`text-center text-sm font-black tracking-widest px-5 py-2 rounded-full border-2 ${cfg.labelStyle}`}>
              {cfg.label}
            </div>
            <p className="text-center text-xs font-bold text-apple-muted mt-1">{cfg.sublabel}</p>
          </div>

          <div className={`text-6xl font-black tabular-nums ${cfg.scoreColor} animate-slide-up`}>
            {score.toLocaleString()}
          </div>
          <p className="text-xs font-black text-apple-light uppercase tracking-widest">POINTS ⭐</p>
        </div>

        {/* ステータスグリッド */}
        <div className="grid grid-cols-2 gap-3">
          <ScoreStat label="Quality"  value={qualityScore}               sub="/ 100"                                     icon={<TrendingUp size={10} />} />
          <ScoreStat label="Attempts" value={attemptCount}               sub={attemptCount === 1 ? 'One-shot! 🎯' : undefined} icon={<Hash size={10} />} />
          <ScoreStat label="Input"    value={inputTokens.toLocaleString()} sub="tokens"                                   icon={<Zap size={10} />} />
          <ScoreStat label="Output"   value={outputTokens.toLocaleString()} sub="tokens"                                 icon={<Zap size={10} />} />
        </div>

        {/* パフォーマンスバー */}
        <div className="card p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black">
              <span className="text-apple-muted flex items-center gap-1"><TrendingUp size={12} /> 品質スコア</span>
              <span className="text-apple-text">{qualityScore}/100</span>
            </div>
            <div className="xp-bar h-4">
              <div className={`xp-fill ${qualityScore >= 80 ? 'bg-apple-green' : qualityScore >= 50 ? 'bg-apple-gold' : 'bg-apple-red'}`}
                   style={{ width: `${qualityScore}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black">
              <span className="text-apple-muted flex items-center gap-1"><Zap size={12} /> トークン効率</span>
              <span className={totalTokens <= goldLimit ? 'text-apple-green' : 'text-apple-red'}>
                {totalTokens <= goldLimit ? '✅ 制限内' : '❌ 超過'}
              </span>
            </div>
            <div className="xp-bar h-4">
              <div className={`xp-fill ${cfg.barColor}`}
                   style={{ width: `${Math.max(5, Math.min(100, tokenEffPct))}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-apple-light">
              <span>Gold上限: {goldLimit.toLocaleString()} tokens</span>
              <span>使用: {totalTokens.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* レスポンスプレビュー */}
        {response && (
          <div className="space-y-2">
            <p className="text-[10px] font-black text-apple-light uppercase tracking-widest">レスポンス</p>
            <div className="card p-4 text-xs text-apple-muted leading-relaxed font-mono whitespace-pre-wrap break-words">
              {preview}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={onRetry} className="btn-white flex flex-col items-center gap-2 py-4 text-xs">
            <RotateCcw size={18} />
            再挑戦
          </button>
          <button
            onClick={onNext}
            className={`btn flex flex-col items-center gap-2 py-4 text-xs ${
              medal === 'gold'
                ? 'bg-apple-gold border-apple-gold-dark text-apple-text'
                : 'bg-apple-red border-apple-red-dark text-white'
            } shadow-lg`}
          >
            <ChevronRight size={18} />
            次へ！
          </button>
          <button onClick={onMap} className="btn-white flex flex-col items-center gap-2 py-4 text-xs">
            <Map size={18} />
            マップへ
          </button>
        </div>

      </div>
    </div>
  );
}
