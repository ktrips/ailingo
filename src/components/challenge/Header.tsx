import { Settings, LogOut } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { signOutUser } from '../../services/firebase';

export function Header() {
  const { user, totalScore, streak, setView, setUser } = useGameStore();

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-apple-border"
            style={{ background: 'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* ロゴ */}
        <button
          onClick={() => setView('map')}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <span className="text-2xl animate-heart-beat">🍎</span>
          <span className="text-xl font-black text-white tracking-tight drop-shadow">
            アイ<span className="text-apple-gold">リンゴ</span>
          </span>
        </button>

        {/* ステータス */}
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white font-black text-sm rounded-full px-3 py-1 border border-white/30">
              🔥 <span>{streak}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-apple-gold/90 text-apple-text font-black text-sm rounded-full px-3 py-1 border-b-2 border-apple-gold-dark shadow">
            ⭐ <span>{totalScore.toLocaleString()}</span>
          </div>

          {user && (
            <div className="flex items-center gap-1.5">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? ''}
                  className="w-8 h-8 rounded-full border-2 border-white shadow"
                />
              )}
              <button
                onClick={() => setView('settings')}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                title="設定"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
