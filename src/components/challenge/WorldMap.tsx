import { Lock, Trophy, ChevronRight, CheckCircle2, Star } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { DOJO_CHALLENGES } from '../../data/dojoData';
import { BUILDER_CHALLENGES, DIFFICULTY_LABELS } from '../../data/builderData';
import { UsageMeter } from './UsageMeter';
import type { Medal, DojoDayProgress, BuilderChallengeProgress } from '../../types/challenge';

const DAY_EMOJIS = ['🗡️', '📝', '🔐', '📚', '🧠', '💬', '👑'];

function MedalBadge({ medal }: { medal: Medal }) {
  if (medal === 'gold')   return <span className="text-sm drop-shadow">🥇</span>;
  if (medal === 'silver') return <span className="text-sm">🥈</span>;
  if (medal === 'bronze') return <span className="text-sm">🥉</span>;
  return null;
}

function DojoNode({
  day, skill, progress, isNext, onClick,
}: {
  day: number; skill: string;
  progress: DojoDayProgress | undefined;
  isNext: boolean; onClick: () => void;
}) {
  const completed = progress?.completed ?? false;
  const medal = progress?.medal ?? 'none';

  let nodeClass = 'node-locked';
  if (completed) nodeClass = 'node-done';
  else if (isNext) nodeClass = 'node-next';

  return (
    <div className="flex flex-col items-center gap-2">
      <button onClick={onClick} className={`node ${nodeClass}`}>
        <span className="text-2xl">{DAY_EMOJIS[(day - 1) % DAY_EMOJIS.length]}</span>
        <span className="text-[10px] font-black mt-0.5">Day{day}</span>
      </button>
      <div className="text-center">
        {completed && <div className="flex justify-center mb-0.5"><MedalBadge medal={medal} /></div>}
        <p className="text-[10px] font-bold text-apple-muted max-w-[72px] leading-tight line-clamp-2 text-center">
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
        <Star key={i} size={12}
          className={i < count ? 'text-apple-gold fill-apple-gold' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

const DIFF_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  easy:   { label: '🌱 EASY',   bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  normal: { label: '⚡ NORMAL', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'  },
  hard:   { label: '🔥 HARD',   bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200'},
  expert: { label: '💀 EXPERT', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'   },
  master: { label: '👑 MASTER', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200'},
};

function BuilderCard({
  challenge, progress, locked, onClick,
}: {
  challenge: (typeof BUILDER_CHALLENGES)[number];
  progress: BuilderChallengeProgress | undefined;
  locked: boolean; onClick: () => void;
}) {
  const pct = progress
    ? Math.min(100, (progress.currentSession / challenge.estimatedSessions) * 100) : 0;
  const style = DIFF_STYLES[challenge.difficulty] ?? DIFF_STYLES.easy;

  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`
        relative text-left p-4 rounded-2xl border-2 border-b-4 transition-all duration-150 w-full
        active:border-b-2 active:translate-y-0.5 select-none
        ${locked
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
          : progress?.completed
          ? 'border-apple-red/30 bg-apple-pink-light hover:brightness-98 shadow-card'
          : 'border-apple-border bg-white hover:shadow-card-hover shadow-sm'
        }
      `}
    >
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 z-10">
          <Lock size={20} className="text-gray-300" />
        </div>
      )}
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className="text-sm font-black text-apple-text leading-tight">{challenge.title}</span>
        {progress?.completed && (
          <span className="text-base shrink-0">✅</span>
        )}
      </div>
      <div className="flex items-center justify-between mb-2">
        <StarsDisplay count={challenge.difficultyStars} />
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
          {DIFFICULTY_LABELS[challenge.difficulty]}
        </span>
      </div>
      {progress?.started && !progress.completed && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-apple-muted">
            <span>Session {progress.currentSession}/{challenge.estimatedSessions}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="h-2 bg-apple-border rounded-full overflow-hidden">
            <div className="h-full bg-apple-red rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {!progress?.started && (
        <p className="text-[10px] font-bold text-apple-light">~{challenge.estimatedSessions} sessions</p>
      )}
    </button>
  );
}

export function WorldMap() {
  const {
    stage, dojoProgress, builderProgress, totalScore, streak,
    sprint, weekly, goToDojo, goToBuilder, setView,
  } = useGameStore();

  const dojoComplete = dojoProgress.every((d) => d.completed);
  const dojoCount = dojoProgress.filter((d) => d.completed).length;
  const dojoPct = Math.round((dojoCount / 7) * 100);

  const hardChallenges = BUILDER_CHALLENGES.filter((c) => c.difficulty === 'hard');
  const hardAllDone = hardChallenges.length > 0 &&
    hardChallenges.every((c) => builderProgress.find((p) => p.challengeId === c.id)?.completed);

  const builderLocked = stage === 'dojo';
  const creatorLocked = !hardAllDone;

  const groupedBuilder: Record<string, typeof BUILDER_CHALLENGES> = {};
  for (const ch of BUILDER_CHALLENGES) {
    if (!groupedBuilder[ch.difficulty]) groupedBuilder[ch.difficulty] = [];
    groupedBuilder[ch.difficulty].push(ch);
  }
  const diffOrder = ['easy', 'normal', 'hard', 'expert', 'master'] as const;

  const nextDay = dojoProgress.find((d) => !d.completed)?.day ?? (dojoComplete ? null : 1);

  return (
    <div className="min-h-screen bg-apple-bg">
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* スコアカード */}
        <div className="card overflow-hidden">
          <div className="bg-apple-gradient px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">プロンプト道場</p>
              <p className="text-white font-black text-xl leading-none mt-0.5">AI CHALLENGE 🍎</p>
            </div>
            <div className="flex items-center gap-4">
              {streak > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-black text-white leading-none">{streak}</div>
                  <div className="text-[10px] font-bold text-white/70">🔥 連続</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-black text-apple-gold leading-none drop-shadow">
                  {totalScore.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-white/70">⭐ 総得点</div>
              </div>
            </div>
          </div>
          <div className="px-5 py-3">
            <UsageMeter sprint={sprint} weekly={weekly} />
          </div>
        </div>

        {/* ── DOJO ── */}
        <div className="card overflow-hidden shadow-card">
          {/* ヘッダー */}
          <div style={{ background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)' }} className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-b-4 border-white/30 flex items-center justify-center text-2xl">
                  🏯
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Stage 1</p>
                  <p className="text-white font-black text-2xl leading-none">DOJO</p>
                </div>
              </div>
              {dojoComplete ? (
                <span className="bg-apple-gold text-apple-text font-black text-sm px-4 py-1.5 rounded-full border-b-2 border-apple-gold-dark shadow">
                  🎉 クリア！
                </span>
              ) : (
                <div className="text-right">
                  <span className="text-white font-black text-3xl">{dojoPct}%</span>
                  <p className="text-white/60 text-[10px] font-bold">完了</p>
                </div>
              )}
            </div>
            <div className="mt-3 h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700 shadow-sm"
                   style={{ width: `${dojoPct}%` }} />
            </div>
          </div>

          {/* ノードグリッド */}
          <div className="p-5 bg-apple-bg/50">
            {/* パスライン */}
            <div className="flex flex-wrap justify-center gap-5">
              {DOJO_CHALLENGES.map((ch, i) => {
                const prog = dojoProgress.find((d) => d.day === ch.day);
                const isNext = ch.day === nextDay;
                return (
                  <div key={ch.day} className="flex items-center gap-2">
                    <DojoNode day={ch.day} skill={ch.skill} progress={prog} isNext={isNext} onClick={() => goToDojo(ch.day)} />
                    {i < DOJO_CHALLENGES.length - 1 && (
                      <div className="w-6 h-0.5 bg-apple-border rounded-full mb-8" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── BUILDER ── */}
        <div className={`card overflow-hidden shadow-card ${builderLocked ? 'opacity-65' : ''}`}>
          <div style={{ background: builderLocked
            ? 'linear-gradient(135deg, #9CA3AF, #D1D5DB)'
            : 'linear-gradient(135deg, #007AFF, #34AADC)' }}
            className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-b-4 border-white/30 flex items-center justify-center text-2xl">
                  {builderLocked ? '🔒' : '🏗️'}
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Stage 2</p>
                  <p className="text-white font-black text-2xl leading-none">BUILDER</p>
                </div>
              </div>
              {builderLocked && (
                <span className="bg-white/20 text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/30">
                  DOJOクリアで解放
                </span>
              )}
            </div>
          </div>

          {!builderLocked && (
            <div className="p-5 space-y-5">
              {diffOrder.map((diff) => {
                const challenges = groupedBuilder[diff];
                if (!challenges?.length) return null;
                const style = DIFF_STYLES[diff];
                return (
                  <div key={diff}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-black px-3 py-1 rounded-full border-2 ${style.bg} ${style.text} ${style.border}`}>
                        {style.label}
                      </span>
                      <div className="h-0.5 flex-1 bg-apple-border rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {challenges.map((ch) => {
                        const prog = builderProgress.find((p) => p.challengeId === ch.id);
                        const cardLocked = ch.difficulty === 'master' && !hardAllDone;
                        return (
                          <BuilderCard key={ch.id} challenge={ch} progress={prog}
                            locked={cardLocked} onClick={() => goToBuilder(ch.id)} />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CREATOR ── */}
        <div className={`card overflow-hidden shadow-card ${creatorLocked ? 'opacity-60' : ''}`}>
          <div style={{ background: creatorLocked
            ? 'linear-gradient(135deg, #9CA3AF, #D1D5DB)'
            : 'linear-gradient(135deg, #BF5AF2, #9B59D3)' }}
            className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-b-4 border-white/30 flex items-center justify-center text-2xl">
                  {creatorLocked ? '🔒' : '🌟'}
                </div>
                <div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Stage 3</p>
                  <p className="text-white font-black text-2xl leading-none">CREATOR</p>
                </div>
              </div>
              {creatorLocked ? (
                <span className="bg-white/20 text-white text-xs font-black px-3 py-1.5 rounded-full border border-white/30">
                  HARDクリアで解放
                </span>
              ) : (
                <span className="bg-apple-gold text-apple-text font-black text-sm px-3 py-1.5 rounded-full border-b-2 border-apple-gold-dark">
                  COMING SOON
                </span>
              )}
            </div>
          </div>
          {!creatorLocked && (
            <div className="p-6 text-center bg-apple-bg/30">
              <p className="text-4xl mb-3 animate-float">🚀</p>
              <p className="text-apple-muted font-bold text-sm">クリエイターステージは近日公開予定！</p>
              <p className="text-apple-light text-xs mt-1">オリジナルAIプロダクトを世界へ</p>
            </div>
          )}
        </div>

        {/* ランキングボタン */}
        <button
          onClick={() => setView('leaderboard')}
          className="w-full card py-4 flex items-center justify-center gap-2 font-black text-apple-text hover:shadow-card-hover transition-all group"
        >
          <span className="text-2xl">🏆</span>
          <span>週間ランキングを見る</span>
          <ChevronRight size={18} className="text-apple-light group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
}
