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

  function rankDisplay(rank: number) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  }

  return (
    <div className="min-h-screen bg-duo-bg">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <button
          onClick={() => setView('map')}
          className="flex items-center gap-1.5 text-duo-muted hover:text-duo-text mb-6 text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          マップに戻る
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <h1 className="text-2xl font-black text-duo-text">週間ランキング</h1>
          </div>
          <span className="text-xs font-black text-duo-muted bg-white border-2 border-duo-border rounded-full px-3 py-1.5">
            残り{daysLeft}日
          </span>
        </div>

        {/* My stats */}
        <div className="card-duo bg-duo-green/5 border-duo-green/30 p-5 mb-6">
          <p className="text-xs font-black text-duo-green uppercase tracking-widest mb-3">今週のあなた</p>
          <div className="flex justify-between">
            <div>
              <p className="text-3xl font-black text-duo-green leading-none">
                {(weekly.totalScore ?? 0).toLocaleString()}
                <span className="text-base font-bold text-duo-green/70 ml-1">pt</span>
              </p>
              <p className="text-xs font-bold text-duo-green/70 mt-1">週間スコア</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-duo-blue leading-none">
                {(weekly.tokensUsed ?? 0).toLocaleString()}
                <span className="text-base font-bold text-duo-blue/70 ml-1">tok</span>
              </p>
              <p className="text-xs font-bold text-duo-blue/70 mt-1">使用トークン</p>
            </div>
          </div>
        </div>

        {/* Ranking */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-4xl animate-bounce-slow">🏆</div>
            <Loader2 className="w-5 h-5 animate-spin text-duo-green" />
            <p className="text-sm font-bold text-duo-muted">ランキング読み込み中...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="card-duo flex flex-col items-center py-16 gap-4 text-center">
            <span className="text-5xl">🌟</span>
            <p className="font-black text-duo-text">まだランキングデータがありません</p>
            <p className="text-sm text-duo-muted">チャレンジを完了してランキングに載ろう！</p>
            <button onClick={() => setView('map')} className="btn-duo-green mt-2">
              チャレンジする！
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Podium top 3 */}
            {entries.length >= 3 && (
              <div className="card-duo p-4 mb-2">
                <div className="flex items-end justify-center gap-2">
                  {[entries[1], entries[0], entries[2]].map((entry, idx) => {
                    const heights = ['h-20', 'h-28', 'h-16'];
                    const colors = ['bg-gray-200', 'bg-duo-yellow/30', 'bg-orange-200'];
                    const textColors = ['text-gray-600', 'text-amber-600', 'text-orange-700'];
                    const ranks = [2, 1, 3];
                    const rankEmoji = ['🥈', '🥇', '🥉'];
                    return (
                      <div key={entry.uid} className="flex flex-col items-center gap-1 flex-1">
                        <p className="text-xs font-black text-duo-muted truncate max-w-[80px] text-center">
                          {entry.username}
                        </p>
                        <p className="text-xs font-black text-duo-muted">{rankEmoji[idx]}</p>
                        <div className={`w-full ${heights[idx]} ${colors[idx]} rounded-t-xl flex flex-col items-center justify-end pb-2`}>
                          <span className={`text-xs font-black ${textColors[idx]}`}>
                            {entry.weeklyScore.toLocaleString()}
                          </span>
                          <span className={`text-[10px] font-bold ${textColors[idx]} opacity-70`}>pt</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {entries.map((entry) => {
              const isMe = entry.uid === user?.uid;
              return (
                <div
                  key={entry.uid}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                    isMe
                      ? 'bg-duo-green/5 border-duo-green/30'
                      : 'bg-white border-duo-border hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl font-black w-8 text-center shrink-0">
                    {rankDisplay(entry.rank)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm truncate ${isMe ? 'text-duo-green' : 'text-duo-text'}`}>
                      {entry.username}{isMe ? ' 👈 あなた' : ''}
                    </p>
                    {entry.dojoComplete && (
                      <span className="text-xs font-bold text-duo-green">🏯 DOJO修了</span>
                    )}
                  </div>
                  <p className={`font-black text-sm shrink-0 ${isMe ? 'text-duo-green' : 'text-duo-muted'}`}>
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
