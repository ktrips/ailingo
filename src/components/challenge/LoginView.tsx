import { useState } from 'react';
import { signInWithGoogle } from '../../services/firebase';
import { useGameStore } from '../../store/gameStore';

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
    <div className="min-h-screen bg-duo-bg flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-sm w-full flex flex-col items-center gap-8">

        {/* Mascot & Logo */}
        <div className="text-center">
          <div className="relative inline-block animate-float">
            <div className="w-28 h-28 rounded-full bg-duo-green-light flex items-center justify-center text-7xl shadow-lg border-4 border-duo-green/30">
              🍎
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-duo-yellow rounded-full flex items-center justify-center text-base border-2 border-white shadow">
              ✨
            </div>
          </div>
          <h1 className="text-4xl font-black text-duo-text mt-4 tracking-tight">
            Ai<span className="text-duo-green">Lingo</span>
          </h1>
          <p className="text-duo-muted font-bold text-sm mt-1">アイリンゴ</p>
          <p className="text-duo-muted text-sm mt-2 leading-relaxed">
            Claudeを使いこなす技術を<br />ゲーム感覚で習得しよう！
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {[
            { emoji: '🏆', label: 'スコア競争', bg: 'bg-duo-yellow/10 border-duo-yellow/30 text-amber-700' },
            { emoji: '⚡', label: '5時間制限', bg: 'bg-duo-blue/10 border-duo-blue/30 text-blue-700' },
            { emoji: '🎯', label: '難易度別',  bg: 'bg-duo-green/10 border-duo-green/30 text-green-700' },
          ].map(({ emoji, label, bg }) => (
            <div key={label} className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 font-bold text-xs ${bg}`}>
              <span className="text-2xl">{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Stage preview */}
        <div className="card-duo w-full p-5 space-y-3">
          <p className="text-xs font-black text-duo-light uppercase tracking-widest">学習ステージ</p>
          {[
            { emoji: '🏯', name: 'DOJO',    desc: 'プロンプトの7つの型を7日で習得', color: 'border-duo-green bg-duo-green/5' },
            { emoji: '🏗️', name: 'BUILDER', desc: '難易度別アプリをセッション制限内で完成', color: 'border-duo-blue bg-duo-blue/5' },
            { emoji: '🌟', name: 'CREATOR', desc: '自由設計で本格アプリを創る', color: 'border-duo-purple bg-duo-purple/5' },
          ].map(({ emoji, name, desc, color }) => (
            <div key={name} className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${color}`}>
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="font-black text-duo-text text-sm">{name}</p>
                <p className="text-duo-muted text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Login */}
        {error && (
          <div className="w-full bg-duo-red/10 border-2 border-duo-red/30 rounded-2xl px-4 py-3 text-duo-red text-sm font-bold text-center">
            {error}
          </div>
        )}
        <div className="w-full space-y-3">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-b-4 border-duo-border rounded-2xl py-4 font-black text-duo-text hover:bg-gray-50 transition-all active:border-b-2 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-duo-green border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? 'ログイン中...' : 'Googleでログイン'}
          </button>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-duo-green w-full text-base py-4"
          >
            {loading ? '...' : '今すぐ始める！'}
          </button>
        </div>

        <p className="text-center text-xs text-duo-light">
          ログインすることで利用規約に同意したものとみなします
        </p>
      </div>
    </div>
  );
}
