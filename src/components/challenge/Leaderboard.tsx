import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { fetchLeaderboard } from '../../services/firebase';
import type { LeaderboardEntry } from '../../types/challenge';

export function Leaderboard() {
  const { setView, user, weekly } = useGameStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const daysLeft = getDaysUntilSunday();

  return (
    <div className="min-h-screen bg-apple-bg">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* 戻るボタン */}
        <button
          onClick={() => setView('map')}
          className="flex items-center gap-1.5 text-apple-muted hover:text-apple-text mb-6 text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          マップに戻る
        </button>

        {/* タイトル */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-apple-gradient flex items-center justify-center text-2xl border-b-4 border-apple-red-dark shadow-lg shadow-apple-red/30">
              🏆
            </div>
            <h1 className="text-2xl font-black text-apple-text">週間ランキング</h1>
          </div>
          <span className="badge badge-red">残り{daysLeft}日</span>
        </div>

        {/* 自分のスコア */}
        <div className="card overflow-hidden mb-5 shadow-card">
          <div style={{ background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)' }} className="px-5 py-4">
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-3">
              🍎 今週のあなた
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-4xl font-black text-white leading-none">
                  {(weekly.totalScore ?? 0).toLocaleString()}
                </p>
                <p className="text-xs font-black text-white/70 mt-1">週間スコア ⭐</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-white/90 leading-none">
                  {(weekly.tokensUsed ?? 0).toLocaleString()}
                </p>
                <p className="text-xs font-black text-white/70 mt-1">使用トークン ⚡</p>
              </div>
            </div>
          </div>
        </div>

        {/* ランキング */}
        {loading ? (
          <div className="card flex flex-col items-center py-16 gap-4">
            <div className="text-5xl animate-bounce-slow">🏆</div>
            <Loader2 className="w-5 h-5 animate-spin text-apple-red" />
            <p className="text-sm font-bold text-apple-muted">ランキング読み込み中...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="card flex flex-col items-center py-16 gap-4 text-center">
            <span className="text-6xl animate-float">🌟</span>
            <p className="font-black text-apple-text text-lg">ランキングデータなし</p>
            <p className="text-sm text-apple-muted">チャレンジを完了して<br />ランキングに載ろう！</p>
            <button onClick={() => setView('map')} className="btn-red mt-2">
              チャレンジする！🍎
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* トップ3表彰台 */}
            {entries.length >= 3 && (
              <div className="card p-5 mb-2">
                <p className="text-center text-[10px] font-black text-apple-light uppercase tracking-widest mb-4">
                  🏆 TOP 3
                </p>
                <div className="flex items-end justify-center gap-2">
                  {([1, 0, 2] as const).map((origIdx, podiumIdx) => {
                    const entry = entries[origIdx];
                    const configs = [
                      { h: 'h-24', bg: 'bg-gray-100',      text: 'text-gray-600',  emoji: '🥈', size: 'text-2xl' },
                      { h: 'h-32', bg: 'bg-apple-gradient', text: 'text-white',     emoji: '🥇', size: 'text-3xl' },
                      { h: 'h-20', bg: 'bg-orange-100',    text: 'text-orange-700', emoji: '🥉', size: 'text-xl'  },
                    ];
                    const c = configs[podiumIdx];
                    return (
                      <div key={entry.uid} className="flex flex-col items-center gap-1 flex-1">
                        <p className="text-xs font-black text-apple-muted truncate max-w-[80px] text-center">
                          {entry.username}
                        </p>
                        <span className={c.size}>{c.emoji}</span>
                        <div className={`w-full ${c.h} rounded-t-2xl ${c.bg} flex flex-col items-center justify-end pb-2 shadow-sm`}>
                          <span className={`text-xs font-black ${c.text}`}>{entry.weeklyScore.toLocaleString()}</span>
                          <span className={`text-[10px] font-bold ${c.text} opacity-70`}>pt</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {entries.map((entry) => {
              const isMe = entry.uid === user?.uid;
              const rankEmoji = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;
              return (
                <div
                  key={entry.uid}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                    isMe
                      ? 'bg-apple-pink-light border-apple-red/30 shadow-card'
                      : 'bg-white border-apple-border hover:border-apple-border-dark'
                  }`}
                >
                  <div className="w-8 text-center shrink-0">
                    {rankEmoji ? (
                      <span className="text-xl">{rankEmoji}</span>
                    ) : (
                      <span className="font-black text-sm text-apple-muted">{entry.rank}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm truncate ${isMe ? 'text-apple-red' : 'text-apple-text'}`}>
                      {entry.username}{isMe ? ' 👈 あなた' : ''}
                    </p>
                    {entry.dojoComplete && (
                      <span className="text-xs font-bold text-apple-green">🏯 DOJO修了</span>
                    )}
                  </div>
                  <p className={`font-black text-sm shrink-0 ${isMe ? 'text-apple-red' : 'text-apple-muted'}`}>
                    {entry.weeklyScore.toLocaleString()}<span className="text-[10px] ml-0.5">pt</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getDaysUntilSunday(): number {
  const day = new Date().getDay();
  return day === 0 ? 0 : 7 - day;
}
