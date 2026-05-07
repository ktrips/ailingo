import { useState } from 'react';
import { signInWithGoogle } from '../../services/firebase';
import { useGameStore } from '../../store/gameStore';

function HeartApple() {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* 背景の輝きリング */}
      <div className="absolute w-40 h-40 rounded-full bg-apple-red/10 animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute w-32 h-32 rounded-full bg-apple-red/15 animate-pulse" />

      {/* メインのりんごマスコット */}
      <div className="relative z-10 w-28 h-28 rounded-full bg-apple-gradient flex items-center justify-center
                      shadow-2xl shadow-apple-red/50 border-4 border-white animate-float">
        <span className="text-5xl select-none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
          🍎
        </span>
      </div>

      {/* ハートデコレーション */}
      <div className="absolute -top-2 -right-1 text-2xl animate-heart-beat z-20">❤️</div>
      <div className="absolute -bottom-1 -left-2 text-lg animate-pulse opacity-70">💕</div>
    </div>
  );
}

export function LoginView() {
  const { setUser } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (e) {
      setError('ログインに失敗しました。もう一度お試しください。');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative flex flex-col items-center justify-center px-4 py-8"
         style={{ background: 'linear-gradient(160deg, #FF2D55 0%, #FF3B30 40%, #FF6B6B 80%, #FFB347 100%)' }}>

      {/* 背景の浮遊ハートデコ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {[
          { t: '8%',  l: '5%',  s: '1.8rem', op: '0.12', d: '0s' },
          { t: '15%', l: '88%', s: '2.5rem', op: '0.10', d: '1s' },
          { t: '35%', l: '3%',  s: '1.4rem', op: '0.08', d: '0.5s' },
          { t: '55%', l: '93%', s: '2rem',   op: '0.12', d: '1.5s' },
          { t: '75%', l: '8%',  s: '2.2rem', op: '0.09', d: '0.8s' },
          { t: '85%', l: '82%', s: '1.6rem', op: '0.11', d: '0.3s' },
          { t: '25%', l: '50%', s: '3rem',   op: '0.06', d: '2s' },
          { t: '65%', l: '40%', s: '1.2rem', op: '0.08', d: '1.2s' },
        ].map(({ t, l, s, op, d }, i) => (
          <div key={i} className="absolute animate-float text-white"
               style={{ top: t, left: l, fontSize: s, opacity: op, animationDelay: d }}>
            {i % 2 === 0 ? '❤️' : '🍎'}
          </div>
        ))}
      </div>

      <div className="max-w-sm w-full flex flex-col items-center gap-7 relative z-10">

        {/* マスコット */}
        <HeartApple />

        {/* タイトル */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
            アイ<span className="text-apple-gold">リンゴ</span>
          </h1>
          <p className="text-white/80 font-bold text-sm mt-1 tracking-wider">AI × LOVE × APPLE 🍎❤️</p>
          <p className="text-white/70 text-sm mt-3 leading-relaxed font-semibold">
            Claudeを使いこなす技術を<br />ゲーム感覚で楽しく習得しよう！
          </p>
        </div>

        {/* 特徴バッジ */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {[
            { emoji: '🏆', label: 'スコア競争', bg: 'bg-white/20 border-white/30 text-white' },
            { emoji: '⚡', label: '5時間制限', bg: 'bg-white/20 border-white/30 text-white' },
            { emoji: '🎯', label: '難易度別',  bg: 'bg-white/20 border-white/30 text-white' },
          ].map(({ emoji, label, bg }) => (
            <div key={label} className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 font-black text-xs backdrop-blur-sm ${bg}`}>
              <span className="text-2xl">{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* ステージプレビュー */}
        <div className="w-full bg-white/15 backdrop-blur-sm rounded-3xl border-2 border-white/30 p-4 space-y-2.5">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">学習ステージ</p>
          {[
            { emoji: '🏯', name: 'DOJO',    desc: 'プロンプトの7型を7日で習得', badge: 'STAGE 1', badgeColor: 'bg-white/20 text-white' },
            { emoji: '🏗️', name: 'BUILDER', desc: '難易度別アプリをセッション内で完成', badge: 'STAGE 2', badgeColor: 'bg-white/20 text-white' },
            { emoji: '🌟', name: 'CREATOR', desc: '自由設計で本格アプリを創る', badge: 'STAGE 3', badgeColor: 'bg-white/20 text-white' },
          ].map(({ emoji, name, desc, badge, badgeColor }) => (
            <div key={name} className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/20">
              <span className="text-2xl">{emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-black text-white text-sm">{name}</p>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                </div>
                <p className="text-white/60 text-xs font-semibold truncate">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* エラー */}
        {error && (
          <div className="w-full bg-white/20 border-2 border-white/40 rounded-2xl px-4 py-3 text-white text-sm font-bold text-center backdrop-blur-sm animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* ログインボタン */}
        <div className="w-full space-y-3">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full btn-gold text-base py-4 flex items-center justify-center gap-2 text-apple-text"
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-apple-text/30 border-t-apple-text rounded-full animate-spin" />
            ) : (
              <span className="text-xl">🍎</span>
            )}
            {loading ? 'ログイン中...' : 'ゲームスタート！'}
          </button>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white/90 backdrop-blur-sm border-2 border-b-4 border-white/60 rounded-2xl py-3.5 font-black text-apple-text hover:bg-white transition-all active:border-b-2 active:translate-y-0.5 disabled:opacity-50 shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-apple-red border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Googleでログイン
          </button>
        </div>

        <p className="text-center text-xs text-white/50 font-semibold">
          ログインで利用規約に同意したものとみなします
        </p>
      </div>
    </div>
  );
}
