import { Lock, Trophy, ChevronRight, CheckCircle2, Star } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { DOJO_CHALLENGES } from '../../data/dojoData';
import { BUILDER_CHALLENGES, DIFFICULTY_LABELS } from '../../data/builderData';
import { UsageMeter } from './UsageMeter';
import type { Medal, DojoDayProgress, BuilderChallengeProgress } from '../../types/challenge';

const DAY_EMOJIS = ['🗡️', '📝', '🔒', '📚', '🧠', '💬', '🏆'];

function MedalBadge({ medal }: { medal: Medal }) {
  if (medal === 'gold')   return <span className="text-base">🥇</span>;
  if (medal === 'silver') return <span className="text-base">🥈</span>;
  if (medal === 'bronze') return <span className="text-base">🥉</span>;
  return null;
}

function DojoNode({
  day,
  skill,
  progress,
  isNext,
  onClick,
}: {
  day: number;
  skill: string;
  progress: DojoDayProgress | undefined;
  isNext: boolean;
  onClick: () => void;
}) {
  const completed = progress?.completed ?? false;
  const medal = progress?.medal ?? 'none';

  let nodeClass = 'skill-node-locked';
  if (completed)    nodeClass = 'skill-node-done';
  else if (isNext)  nodeClass = 'skill-node-active';

  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={onClick} className={`skill-node ${nodeClass}`}>
        <span className="text-xl">{DAY_EMOJIS[(day - 1) % DAY_EMOJIS.length]}</span>
        <span className="text-[9px] font-black">Day{day}</span>
      </button>
      <div className="text-center">
        {completed && <MedalBadge medal={medal} />}
        <p className="text-[10px] font-bold text-duo-muted max-w-[64px] leading-tight line-clamp-2 text-center">
          {skill}
        </p>
      </div>
    </div>
  );
}

function StarsDisplay({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={11}
          className={i < count ? 'text-duo-yellow fill-duo-yellow' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

const DIFF_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  easy:   { bg: 'bg-duo-green/10',  text: 'text-green-700',  border: 'border-duo-green/40' },
  normal: { bg: 'bg-duo-blue/10',   text: 'text-blue-700',   border: 'border-duo-blue/40' },
  hard:   { bg: 'bg-duo-orange/10', text: 'text-orange-700', border: 'border-duo-orange/40' },
  expert: { bg: 'bg-duo-red/10',    text: 'text-red-700',    border: 'border-duo-red/40' },
  master: { bg: 'bg-duo-purple/10', text: 'text-purple-700', border: 'border-duo-purple/40' },
};

function BuilderCard({
  challenge,
  progress,
  locked,
  onClick,
}: {
  challenge: (typeof BUILDER_CHALLENGES)[number];
  progress: BuilderChallengeProgress | undefined;
  locked: boolean;
  onClick: () => void;
}) {
  const sessionPct = progress
    ? Math.min(100, (progress.currentSession / challenge.estimatedSessions) * 100)
    : 0;
  const style = DIFF_STYLES[challenge.difficulty] ?? DIFF_STYLES.easy;

  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`
        relative text-left p-4 rounded-2xl border-2 border-b-4 transition-all duration-150 w-full
        active:border-b-2 active:translate-y-0.5
        ${locked
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
          : progress?.completed
          ? 'border-duo-green/40 bg-duo-green/5 hover:bg-duo-green/10'
          : 'border-duo-border bg-white hover:bg-gray-50'
        }
      `}
    >
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 z-10">
          <Lock size={18} className="text-gray-400" />
        </div>
      )}
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className="text-sm font-black text-duo-text leading-tight">{challenge.title}</span>
        {progress?.completed && <CheckCircle2 size={16} className="text-duo-green shrink-0" />}
      </div>
      <div className="flex items-center justify-between mb-2">
        <StarsDisplay count={challenge.difficultyStars} />
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
          {DIFFICULTY_LABELS[challenge.difficulty]}
        </span>
      </div>
      {progress?.started && !progress.completed && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-duo-muted font-bold">
            <span>Session {progress.currentSession}/{challenge.estimatedSessions}</span>
            <span>{Math.round(sessionPct)}%</span>
          </div>
          <div className="xp-bar h-2">
            <div className="xp-fill bg-duo-blue" style={{ width: `${sessionPct}%` }} />
          </div>
        </div>
      )}
      {!progress?.started && (
        <div className="text-[10px] text-duo-light font-bold">
          ~{challenge.estimatedSessions} sessions
        </div>
      )}
    </button>
  );
}

export function WorldMap() {
  const {
    stage,
    dojoProgress,
    builderProgress,
    totalScore,
    streak,
    sprint,
    weekly,
    goToDojo,
    goToBuilder,
    setView,
  } = useGameStore();

  const dojoComplete = dojoProgress.every((d) => d.completed);
  const dojoCompletedCount = dojoProgress.filter((d) => d.completed).length;
  const dojoCompletionPct = Math.round((dojoCompletedCount / 7) * 100);

  const hardChallenges = BUILDER_CHALLENGES.filter((c) => c.difficulty === 'hard');
  const hardAllDone = hardChallenges.length > 0 && hardChallenges.every((c) =>
    builderProgress.find((p) => p.challengeId === c.id)?.completed
  );

  const builderLocked = stage === 'dojo';
  const creatorLocked = !hardAllDone;

  const groupedBuilder: Record<string, typeof BUILDER_CHALLENGES> = {};
  for (const ch of BUILDER_CHALLENGES) {
    if (!groupedBuilder[ch.difficulty]) groupedBuilder[ch.difficulty] = [];
    groupedBuilder[ch.difficulty].push(ch);
  }
  const difficultyOrder = ['easy', 'normal', 'hard', 'expert', 'master'] as const;

  const nextDojoDay = dojoProgress.find((d) => !d.completed)?.day
    ?? (dojoComplete ? null : 1);

  return (
    <div className="min-h-screen bg-duo-bg">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Top stats */}
        <div className="card-duo p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-duo-light uppercase tracking-widest mb-0.5">プロンプト道場</p>
            <p className="text-xl font-black text-duo-text">AI CHALLENGE</p>
          </div>
          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="text-center">
                <div className="text-2xl font-black text-duo-orange leading-none">{streak}</div>
                <div className="text-[10px] font-bold text-duo-light">🔥 連続</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-2xl font-black text-amber-500 leading-none">{totalScore.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-duo-light">⭐ 総得点</div>
            </div>
          </div>
        </div>

        <UsageMeter sprint={sprint} weekly={weekly} />

        {/* ── DOJO Stage ── */}
        <div className="card-duo overflow-hidden">
          <div className="bg-gradient-to-r from-duo-green to-emerald-400 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                  🏯
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Stage 1</p>
                  <p className="text-white font-black text-xl leading-tight">DOJO</p>
                </div>
              </div>
              <div className="text-right">
                {dojoComplete ? (
                  <span className="bg-white text-duo-green font-black text-xs px-3 py-1.5 rounded-full shadow">
                    ✅ 完了！
                  </span>
                ) : (
                  <span className="text-white font-black text-2xl">{dojoCompletionPct}%</span>
                )}
              </div>
            </div>
            <div className="mt-3 xp-bar h-3 bg-white/30">
              <div className="xp-fill bg-white" style={{ width: `${dojoCompletionPct}%` }} />
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap justify-center gap-4">
              {DOJO_CHALLENGES.map((ch) => {
                const prog = dojoProgress.find((d) => d.day === ch.day);
                const isNext = ch.day === nextDojoDay;
                return (
                  <DojoNode
                    key={ch.day}
                    day={ch.day}
                    skill={ch.skill}
                    progress={prog}
                    isNext={isNext}
                    onClick={() => goToDojo(ch.day)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ── BUILDER Stage ── */}
        <div className={`card-duo overflow-hidden ${builderLocked ? 'opacity-70' : ''}`}>
          <div className={`bg-gradient-to-r px-5 py-4 ${builderLocked ? 'from-gray-300 to-gray-400' : 'from-duo-blue to-sky-400'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                  {builderLocked ? '🔒' : '🏗️'}
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Stage 2</p>
                  <p className="text-white font-black text-xl leading-tight">BUILDER</p>
                </div>
              </div>
              {builderLocked && (
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  DOJOクリアで解放
                </span>
              )}
            </div>
          </div>

          {!builderLocked && (
            <div className="p-5 space-y-5">
              {difficultyOrder.map((diff) => {
                const challenges = groupedBuilder[diff];
                if (!challenges?.length) return null;
                const style = DIFF_STYLES[diff];
                return (
                  <div key={diff}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-black px-3 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                        {DIFFICULTY_LABELS[diff]}
                      </span>
                      <div className="h-0.5 flex-1 bg-duo-border rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {challenges.map((ch) => {
                        const prog = builderProgress.find((p) => p.challengeId === ch.id);
                        const cardLocked = ch.difficulty === 'master' && !hardAllDone;
                        return (
                          <BuilderCard
                            key={ch.id}
                            challenge={ch}
                            progress={prog}
                            locked={cardLocked}
                            onClick={() => goToBuilder(ch.id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CREATOR Stage ── */}
        <div className={`card-duo overflow-hidden ${creatorLocked ? 'opacity-60' : ''}`}>
          <div className={`bg-gradient-to-r px-5 py-4 ${creatorLocked ? 'from-gray-300 to-gray-400' : 'from-duo-purple to-violet-400'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                  {creatorLocked ? '🔒' : '🌟'}
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Stage 3</p>
                  <p className="text-white font-black text-xl leading-tight">CREATOR</p>
                </div>
              </div>
              {creatorLocked ? (
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  HARDクリアで解放
                </span>
              ) : (
                <span className="bg-white text-duo-purple font-black text-xs px-3 py-1.5 rounded-full shadow">
                  COMING SOON
                </span>
              )}
            </div>
          </div>
          {!creatorLocked && (
            <div className="p-6 text-center">
              <p className="text-4xl mb-3 animate-float">🚀</p>
              <p className="text-duo-muted font-bold text-sm">クリエイターステージは近日公開予定！</p>
              <p className="text-duo-light text-xs mt-1">オリジナルAIプロダクトを世界へ</p>
            </div>
          )}
        </div>

        {/* Leaderboard button */}
        <button
          onClick={() => setView('leaderboard')}
          className="w-full flex items-center justify-center gap-2 card-duo py-4 font-black text-duo-text hover:bg-gray-50 transition-all group"
        >
          <span className="text-xl">🏆</span>
          <span>週間ランキングを見る</span>
          <ChevronRight size={18} className="text-duo-light group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
}
