import { useState, type ChangeEvent } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Send, AlertCircle, Lightbulb } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { DOJO_CHALLENGES } from '../../data/dojoData';
import { runDojoChallenge, evaluateResponse, estimateTokens } from '../../services/claudeService';
import { calcDojoScore } from '../../types/challenge';
import type { ChallengeAttempt, Medal, DojoDayProgress } from '../../types/challenge';

const MEDAL_STYLES: Record<Medal, {
  bg: string; border: string; text: string; label: string; emoji: string; glow: string;
}> = {
  gold:   { bg: 'bg-yellow-50',      border: 'border-yellow-300',      text: 'text-amber-600',   label: 'ゴールド！🥇', emoji: '🥇', glow: 'shadow-glow-gold' },
  silver: { bg: 'bg-gray-50',        border: 'border-gray-200',        text: 'text-gray-600',    label: 'シルバー🥈',  emoji: '🥈', glow: '' },
  bronze: { bg: 'bg-orange-50',      border: 'border-orange-200',      text: 'text-orange-700',  label: 'ブロンズ🥉',  emoji: '🥉', glow: '' },
  none:   { bg: 'bg-apple-pink-light', border: 'border-apple-red/20',  text: 'text-apple-red',   label: 'もう一回！💪', emoji: '😔', glow: '' },
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

  const dayProgress: DojoDayProgress | undefined = dojoProgress.find(
    (d: DojoDayProgress) => d.day === selectedDojoDay
  );
  const previouslyCompleted = dayProgress?.completed ?? false;
  const attempts = dayProgress?.attempts ?? 0;
  const estimatedTokens = estimateTokens(prompt);

  async function handleSubmit() {
    if (selectedDojoDay === null || !apiKey || !prompt.trim()) return;
    setError(null); setResponse(null); setAttempt(null); setLoading(true);

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
      evalResult = await evaluateResponse(apiKey, challenge.task, claudeResponse.content, challenge.evaluationCriteria);
    } catch {
      evalResult = { qualityScore: 50, feedback: '評価に失敗しました' };
    }
    setEvaluating(false);

    const { score, medal } = calcDojoScore(
      evalResult.qualityScore, claudeResponse.totalTokens, challenge.tokenLimits.gold, attempts + 1,
    );

    const newAttempt: ChallengeAttempt = {
      prompt,
      response: claudeResponse.content,
      inputTokens: claudeResponse.inputTokens,
      outputTokens: claudeResponse.outputTokens,
      totalTokens: claudeResponse.totalTokens,
      qualityScore: evalResult.qualityScore,
      score, medal,
      timestamp: new Date().toISOString(),
    };

    setAttempt(newAttempt);
    recordDojoAttempt(selectedDojoDay, newAttempt);
    setLastAttempt(newAttempt);
  }

  const canSubmit = !!apiKey && prompt.trim().length > 0 && !loading && !evaluating;

  return (
    <div className="min-h-screen bg-apple-bg">
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* ページヘッダー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-apple-gradient flex items-center justify-center text-2xl
                            border-b-4 border-apple-red-dark shadow-lg shadow-apple-red/30">
              🏯
            </div>
            <div>
              <p className="badge badge-red text-[10px] mb-1">DAY {challenge.day}</p>
              <h1 className="text-lg font-black text-apple-text leading-none">{challenge.skill}</h1>
            </div>
          </div>
          <button
            onClick={() => setView('map')}
            className="flex items-center gap-1.5 text-sm font-bold text-apple-muted hover:text-apple-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            マップへ
          </button>
        </div>

        {/* チャレンジカード */}
        <div className="card p-5 space-y-4">
          <div>
            <span className="badge badge-blue mb-2">{challenge.theme}</span>
            <p className="text-sm text-apple-muted leading-relaxed font-semibold">{challenge.description}</p>
          </div>
          <div className="bg-apple-bg rounded-2xl p-4 border-2 border-apple-border">
            <p className="text-[10px] font-black text-apple-light uppercase tracking-widest mb-2">📋 課題</p>
            <pre className="text-sm text-apple-text font-mono whitespace-pre-wrap leading-relaxed">
              {challenge.task}
            </pre>
          </div>
          <div>
            <p className="text-[10px] font-black text-apple-light uppercase tracking-widest mb-1">🎯 理想の出力</p>
            <p className="text-sm text-apple-muted font-semibold">{challenge.targetOutput}</p>
          </div>
        </div>

        {/* トークン制限 */}
        <div className="card p-4">
          <p className="text-[10px] font-black text-apple-light uppercase tracking-widest mb-3">⚡ トークン制限</p>
          <div className="flex gap-2">
            {[
              { emoji: '🥇', limit: challenge.tokenLimits.gold,   style: 'bg-yellow-50 border-yellow-200 text-amber-700' },
              { emoji: '🥈', limit: challenge.tokenLimits.silver, style: 'bg-gray-50 border-gray-200 text-gray-600' },
              { emoji: '🥉', limit: challenge.tokenLimits.bronze, style: 'bg-orange-50 border-orange-200 text-orange-700' },
            ].map(({ emoji, limit, style }) => (
              <div key={emoji} className={`flex-1 flex items-center justify-center gap-1.5 rounded-2xl border-2 py-3 text-sm font-black ${style}`}>
                <span>{emoji}</span><span>≤{limit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ヒント */}
        <div className="card overflow-hidden">
          <button
            onClick={() => setHintsOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 font-bold text-apple-text hover:bg-apple-bg/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-apple-gold" />
              <span className="font-black text-sm">ヒント</span>
              <span className="badge badge-gold text-[10px]">{challenge.hints.length}件</span>
            </div>
            {hintsOpen
              ? <ChevronUp className="w-4 h-4 text-apple-light" />
              : <ChevronDown className="w-4 h-4 text-apple-light" />
            }
          </button>
          {hintsOpen && (
            <div className="px-5 pb-4 space-y-2 border-t-2 border-apple-border">
              {challenge.hints.slice(0, revealedHints).map((hint, i) => (
                <div key={i} className="flex gap-2 text-sm bg-apple-bg rounded-xl p-3 border border-apple-border">
                  <span className="text-apple-red font-black shrink-0">{i + 1}.</span>
                  <span className="text-apple-muted font-semibold">{hint}</span>
                </div>
              ))}
              {revealedHints < challenge.hints.length ? (
                <button
                  onClick={() => setRevealedHints((n) => n + 1)}
                  className="mt-1 text-xs font-black text-apple-red hover:text-apple-red-dark underline"
                >
                  {revealedHints === 0 ? '最初のヒントを見る 👀' : '次のヒントを見る 💡'}
                </button>
              ) : revealedHints > 0 ? (
                <p className="text-xs text-apple-light font-bold mt-1">ヒントをすべて表示しました ✅</p>
              ) : null}
            </div>
          )}
        </div>

        {/* プロンプト入力 */}
        <div className="card p-5 space-y-3">
          <label className="block text-sm font-black text-apple-text">
            ✏️ プロンプトを入力してください
          </label>
          <textarea
            value={prompt}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            placeholder="ここにプロンプトを書いてね..."
            className="w-full min-h-48 resize-y rounded-2xl border-2 border-apple-border p-4
                       font-mono text-sm text-apple-text placeholder-apple-light
                       focus:outline-none focus:border-apple-red bg-apple-bg/50
                       transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-apple-light">
              推定: <span className="text-apple-muted font-black">{estimatedTokens}</span> トークン
            </span>
            <button onClick={handleSubmit} disabled={!canSubmit} className="btn-red flex items-center gap-2 px-6 py-2.5 text-sm">
              <Send className="w-4 h-4" />
              送信！
            </button>
          </div>
          {!apiKey && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 rounded-xl px-3 py-2 border border-orange-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              設定画面からAPIキーを登録してください
            </div>
          )}
        </div>

        {/* ローディング */}
        {loading && (
          <div className="card p-10 flex flex-col items-center gap-4">
            <div className="text-5xl animate-float">🤖</div>
            <p className="text-sm font-black text-apple-muted">Claudeが考えています...</p>
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-apple-red animate-bounce"
                     style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* レスポンス */}
        {response !== null && !loading && (
          <div className="card p-5 space-y-4">
            <p className="text-[10px] font-black text-apple-light uppercase tracking-widest">
              💬 Claudeの回答
            </p>
            <div className="rounded-2xl border-2 border-apple-border bg-apple-bg p-4 text-sm text-apple-muted leading-relaxed whitespace-pre-wrap font-semibold">
              {response}
            </div>

            {evaluating && (
              <div className="flex items-center gap-3 text-sm font-black text-apple-muted">
                <Loader2 className="w-4 h-4 animate-spin text-apple-red" />
                採点中... 🎯
              </div>
            )}

            {attempt && !evaluating && (() => {
              const ms = MEDAL_STYLES[attempt.medal as Medal];
              return (
                <div className={`rounded-2xl border-2 p-4 space-y-3 ${ms.bg} ${ms.border} ${ms.glow}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-bounce-in">{ms.emoji}</span>
                    <div>
                      <p className={`font-black text-lg leading-none ${ms.text}`}>{ms.label}</p>
                      <p className={`text-xs font-bold mt-0.5 ${ms.text} opacity-70`}>
                        品質: {attempt.qualityScore}/100 · トークン: {attempt.totalTokens}
                      </p>
                    </div>
                    <span className={`ml-auto font-black text-2xl ${ms.text}`}>{attempt.score}<span className="text-sm ml-0.5">pt</span></span>
                  </div>
                  <button onClick={() => setView('results')} className="btn-red w-full">
                    結果を見る 🎉
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="card border-apple-red/30 bg-apple-pink-light p-4 flex gap-2 text-sm text-apple-red font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 前回の記録 */}
        {previouslyCompleted && !attempt && dayProgress && (() => {
          const ms = MEDAL_STYLES[dayProgress.medal];
          return (
            <div className="card p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-black text-apple-text">
                <span className="text-xl">{ms.emoji}</span>
                <span>前回の記録</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border-2 ${ms.bg} ${ms.border} ${ms.text}`}>
                  {ms.label}
                </span>
              </div>
              <p className="text-xs font-bold text-apple-muted">
                スコア: {dayProgress.score} · 挑戦回数: {dayProgress.attempts}回
              </p>
              <p className="text-xs font-black text-apple-red">再挑戦して記録を更新しよう！💪</p>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
