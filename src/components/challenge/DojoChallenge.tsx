import { useState, type ChangeEvent } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Send, AlertCircle, Lightbulb } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { DOJO_CHALLENGES } from '../../data/dojoData';
import { runDojoChallenge, evaluateResponse, estimateTokens } from '../../services/claudeService';
import { calcDojoScore } from '../../types/challenge';
import type { ChallengeAttempt, Medal, DojoDayProgress } from '../../types/challenge';

const MEDAL_STYLES: Record<Medal, { bg: string; border: string; text: string; label: string; emoji: string }> = {
  gold:   { bg: 'bg-duo-yellow/10',  border: 'border-duo-yellow',      text: 'text-amber-600',  label: 'ゴールド',  emoji: '🥇' },
  silver: { bg: 'bg-gray-100',       border: 'border-gray-300',        text: 'text-gray-600',   label: 'シルバー',  emoji: '🥈' },
  bronze: { bg: 'bg-orange-50',      border: 'border-orange-300',      text: 'text-orange-700', label: 'ブロンズ',  emoji: '🥉' },
  none:   { bg: 'bg-duo-red/5',      border: 'border-duo-red/30',      text: 'text-duo-red',    label: '未達成',    emoji: '😔' },
};

export function DojoChallenge() {
  const { selectedDojoDay, apiKey, dojoProgress, recordDojoAttempt, setLastAttempt, setView } =
    useGameStore();

  const [prompt, setPrompt] = useState('');
  const [hintsOpen, setHintsOpen] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<ChallengeAttempt | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (selectedDojoDay === null) return null;
  const challenge = DOJO_CHALLENGES[selectedDojoDay - 1];
  if (!challenge) return null;

  const dayProgress: DojoDayProgress | undefined = dojoProgress.find((d: DojoDayProgress) => d.day === selectedDojoDay);
  const previouslyCompleted = dayProgress?.completed ?? false;
  const attempts = dayProgress?.attempts ?? 0;
  const estimatedTokens = estimateTokens(prompt);

  async function handleSubmit() {
    if (selectedDojoDay === null || !apiKey || !prompt.trim()) return;
    setError(null);
    setResponse(null);
    setAttempt(null);
    setLoading(true);

    let claudeResponse;
    try {
      claudeResponse = await runDojoChallenge(apiKey, prompt, challenge.task);
    } catch (e) {
      setError(e instanceof Error ? e.message : '送信に失敗しました');
      setLoading(false);
      return;
    }

    setResponse(claudeResponse.content);
    setLoading(false);
    setEvaluating(true);

    let evalResult;
    try {
      evalResult = await evaluateResponse(
        apiKey,
        challenge.task,
        claudeResponse.content,
        challenge.evaluationCriteria,
      );
    } catch {
      evalResult = { qualityScore: 50, feedback: '評価に失敗しました' };
    }
    setEvaluating(false);

    const { score, medal } = calcDojoScore(
      evalResult.qualityScore,
      claudeResponse.totalTokens,
      challenge.tokenLimits.gold,
      attempts + 1,
    );

    const newAttempt: ChallengeAttempt = {
      prompt,
      response: claudeResponse.content,
      inputTokens: claudeResponse.inputTokens,
      outputTokens: claudeResponse.outputTokens,
      totalTokens: claudeResponse.totalTokens,
      qualityScore: evalResult.qualityScore,
      score,
      medal,
      timestamp: new Date().toISOString(),
    };

    setAttempt(newAttempt);
    recordDojoAttempt(selectedDojoDay, newAttempt);
    setLastAttempt(newAttempt);
  }

  function handleRevealHint() {
    if (revealedHints < challenge.hints.length) {
      setRevealedHints((n: number) => n + 1);
    }
  }

  const canSubmit = !!apiKey && prompt.trim().length > 0 && !loading && !evaluating;

  return (
    <div className="min-h-screen bg-duo-bg">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-duo-green/10 border-2 border-duo-green/30 flex items-center justify-center text-xl">
              🏯
            </div>
            <div>
              <p className="text-[10px] font-black text-duo-green uppercase tracking-widest">Day {challenge.day}</p>
              <h1 className="text-lg font-black text-duo-text leading-tight">{challenge.skill}</h1>
            </div>
          </div>
          <button
            onClick={() => setView('map')}
            className="flex items-center gap-1.5 text-sm font-bold text-duo-muted hover:text-duo-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            マップ
          </button>
        </div>

        {/* Challenge card */}
        <div className="card-duo p-5 space-y-4">
          <div>
            <span className="inline-block text-xs font-black text-duo-blue bg-duo-blue/10 border border-duo-blue/20 rounded-full px-3 py-1 mb-2">
              {challenge.theme}
            </span>
            <p className="text-sm text-duo-muted leading-relaxed">{challenge.description}</p>
          </div>

          <div className="bg-duo-bg rounded-2xl p-4 border-2 border-duo-border">
            <p className="text-[10px] font-black text-duo-light uppercase tracking-widest mb-2">課題</p>
            <pre className="text-sm text-duo-text font-mono whitespace-pre-wrap leading-relaxed">
              {challenge.task}
            </pre>
          </div>

          <div>
            <p className="text-[10px] font-black text-duo-light uppercase tracking-widest mb-1">理想の出力</p>
            <p className="text-sm text-duo-muted">{challenge.targetOutput}</p>
          </div>
        </div>

        {/* Token limits */}
        <div className="card-duo p-4">
          <p className="text-[10px] font-black text-duo-light uppercase tracking-widest mb-3">トークン制限</p>
          <div className="flex gap-3">
            {([
              { medal: 'gold',   limit: challenge.tokenLimits.gold,   emoji: '🥇', color: 'bg-duo-yellow/10 border-duo-yellow/30 text-amber-700' },
              { medal: 'silver', limit: challenge.tokenLimits.silver, emoji: '🥈', color: 'bg-gray-100 border-gray-200 text-gray-600' },
              { medal: 'bronze', limit: challenge.tokenLimits.bronze, emoji: '🥉', color: 'bg-orange-50 border-orange-200 text-orange-700' },
            ] as const).map(({ emoji, limit, color }) => (
              <div key={emoji} className={`flex-1 flex items-center justify-center gap-1.5 rounded-2xl border-2 py-2.5 text-sm font-bold ${color}`}>
                <span>{emoji}</span>
                <span>≤{limit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hints */}
        <div className="card-duo overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 font-bold text-duo-text hover:bg-duo-bg transition-colors"
            onClick={() => setHintsOpen((o: boolean) => !o)}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-duo-yellow" />
              <span className="text-sm">ヒント</span>
              <span className="text-xs bg-duo-yellow/20 text-amber-700 font-black px-2 py-0.5 rounded-full border border-duo-yellow/30">
                {challenge.hints.length}件
              </span>
            </div>
            {hintsOpen
              ? <ChevronUp className="w-4 h-4 text-duo-light" />
              : <ChevronDown className="w-4 h-4 text-duo-light" />
            }
          </button>
          {hintsOpen && (
            <div className="px-5 pb-4 space-y-2 border-t-2 border-duo-border">
              {challenge.hints.slice(0, revealedHints).map((hint, i) => (
                <div key={i} className="flex gap-2 text-sm bg-duo-bg rounded-xl p-3 border border-duo-border">
                  <span className="text-duo-blue font-black shrink-0">{i + 1}.</span>
                  <span className="text-duo-muted">{hint}</span>
                </div>
              ))}
              {revealedHints < challenge.hints.length ? (
                <button
                  onClick={handleRevealHint}
                  className="mt-1 text-xs font-black text-duo-blue hover:text-duo-blue-dark underline"
                >
                  {revealedHints === 0 ? '最初のヒントを見る 👀' : '次のヒントを見る 💡'}
                </button>
              ) : (
                revealedHints > 0 && (
                  <p className="text-xs text-duo-light font-bold mt-1">ヒントをすべて表示しました ✅</p>
                )
              )}
            </div>
          )}
        </div>

        {/* Prompt input */}
        <div className="card-duo p-5 space-y-3">
          <label className="block text-sm font-black text-duo-text">
            ✏️ プロンプトを書いてください
          </label>
          <textarea
            value={prompt}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            placeholder="ここにプロンプトを入力..."
            className="w-full min-h-48 resize-y rounded-2xl border-2 border-duo-border p-4 font-mono text-sm text-duo-text placeholder-duo-light focus:outline-none focus:border-duo-blue bg-duo-bg"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-duo-light">
              推定: <span className="text-duo-muted">{estimatedTokens} トークン</span>
            </span>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="btn-duo-green flex items-center gap-2 px-6 py-2.5 text-sm"
            >
              <Send className="w-4 h-4" />
              送信！
            </button>
          </div>
          {!apiKey && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-duo-orange bg-duo-orange/10 rounded-xl px-3 py-2 border border-duo-orange/20">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              設定画面からAPIキーを登録してください
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="card-duo p-8 flex flex-col items-center gap-3">
            <div className="text-4xl animate-bounce-slow">🤖</div>
            <p className="text-sm font-bold text-duo-muted">Claudeに送信中...</p>
            <Loader2 className="w-5 h-5 animate-spin text-duo-blue" />
          </div>
        )}

        {/* Response */}
        {response !== null && !loading && (
          <div className="card-duo p-5 space-y-4">
            <p className="text-[10px] font-black text-duo-light uppercase tracking-widest">
              💬 Claudeの回答
            </p>
            <div className="rounded-2xl border-2 border-duo-border bg-duo-bg p-4 text-sm text-duo-muted leading-relaxed whitespace-pre-wrap">
              {response}
            </div>

            {evaluating && (
              <div className="flex items-center gap-2 text-sm font-bold text-duo-muted">
                <Loader2 className="w-4 h-4 animate-spin text-duo-purple" />
                採点中... 🎯
              </div>
            )}

            {attempt && !evaluating && (() => {
              const ms = MEDAL_STYLES[attempt.medal as Medal];
              return (
                <div className={`rounded-2xl border-2 p-4 space-y-3 ${ms.bg} ${ms.border}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl animate-bounce-in">{ms.emoji}</span>
                    <span className={`font-black text-base ${ms.text}`}>{ms.label}</span>
                    <span className={`ml-auto font-black text-lg ${ms.text}`}>{attempt.score} pts</span>
                  </div>
                  <p className={`text-xs font-bold ${ms.text} opacity-80`}>
                    品質スコア: {attempt.qualityScore}/100 · トークン: {attempt.totalTokens}
                  </p>
                  <button
                    onClick={() => setView('results')}
                    className="btn-duo-green w-full"
                  >
                    結果を見る 🎉
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card-duo border-duo-red/30 p-4 flex gap-2 text-sm text-duo-red font-bold bg-duo-red/5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Previous record */}
        {previouslyCompleted && !attempt && dayProgress && (() => {
          const ms = MEDAL_STYLES[dayProgress.medal];
          return (
            <div className="card-duo p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-black text-duo-text">
                <span className="text-xl">{ms.emoji}</span>
                <span>前回の記録</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${ms.bg} ${ms.border} ${ms.text}`}>
                  {ms.label}
                </span>
              </div>
              <p className="text-xs font-bold text-duo-muted">
                スコア: {dayProgress.score} · 挑戦回数: {dayProgress.attempts}回
              </p>
              <p className="text-xs font-bold text-duo-blue">再挑戦して記録を更新しよう！ 💪</p>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
