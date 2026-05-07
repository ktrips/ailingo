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
    <header className="bg-white border-b-2 border-duo-border sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => setView('map')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">🍎</span>
          <span className="text-xl font-black text-duo-text tracking-tight">
            Ai<span className="text-duo-green">Lingo</span>
          </span>
        </button>

        {/* Stats */}
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="streak-badge">
              🔥 <span>{streak}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-duo-yellow/10 text-amber-600 font-black text-sm rounded-full px-3 py-1 border border-duo-yellow/30">
            <span>⭐</span>
            <span>{totalScore.toLocaleString()}</span>
          </div>

          {user && (
            <div className="flex items-center gap-1.5">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? ''}
                  className="w-8 h-8 rounded-full border-2 border-duo-green"
                />
              )}
              <button
                onClick={() => setView('settings')}
                className="p-2 rounded-xl text-duo-muted hover:text-duo-text hover:bg-duo-bg transition-colors"
                title="設定"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl text-duo-muted hover:text-duo-red hover:bg-duo-red/10 transition-colors"
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
