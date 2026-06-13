interface CoinDisplayProps {
  coins: number;
  gems?: number;
  stars?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CoinDisplay({ coins, gems, stars, size = 'md' }: CoinDisplayProps) {
  const sizeClasses = size === 'sm' ? 'text-lg gap-2' : 'text-xl gap-4';
  const iconSize = size === 'sm' ? 'text-xl' : 'text-2xl';

  return (
    <div className={`flex items-center ${sizeClasses}`}>
      <div className="flex items-center gap-1">
        <span className={iconSize}>🪙</span>
        <span className="font-display font-bold text-amber-500">{(coins ?? 0).toLocaleString()}</span>
      </div>
      {gems !== undefined && (
        <div className="flex items-center gap-1">
          <span className={iconSize}>💎</span>
          <span className="font-display font-bold text-gem-500">{gems}</span>
        </div>
      )}
      {stars !== undefined && (
        <div className="flex items-center gap-1">
          <span className={iconSize}>⭐</span>
          <span className="font-display font-bold text-yellow-500">{stars}</span>
        </div>
      )}
    </div>
  );
}

// ── Badge Card ───────────────────────────────────────────────

interface BadgeCardProps {
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export function BadgeCard({ title, description, emoji, unlocked, progress, maxProgress }: BadgeCardProps) {
  return (
    <div
      className={`
        kid-card text-center transition-all duration-300
        ${unlocked ? 'bg-gradient-to-br from-amber-50 to-yellow-50' : 'opacity-60 grayscale'}
      `}
    >
      <div className="text-4xl mb-2">{unlocked ? emoji : '🔒'}</div>
      <h4 className="font-display font-semibold text-gray-700 text-sm">{title}</h4>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      {progress !== undefined && maxProgress && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all"
            style={{ width: `${(progress / maxProgress) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Reward Chest ─────────────────────────────────────────────

interface RewardChestProps {
  type: 'bronze' | 'silver' | 'gold' | 'diamond';
  status: 'locked' | 'available' | 'claimed';
  progress: number;
  maxProgress: number;
  onOpen?: () => void;
}

const chestIcons: Record<string, string> = {
  bronze: '📦',
  silver: '🎁',
  gold: '🏆',
  diamond: '💎',
};

const chestColors: Record<string, string> = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-amber-400',
  diamond: 'from-cyan-400 to-blue-500',
};

export function RewardChestCard({ type, status, progress, maxProgress, onOpen }: RewardChestProps) {
  const isAvailable = status === 'available';
  const safeProgress = progress ?? 0;
  const safeMax = maxProgress || 1;

  return (
    <button
      onClick={() => isAvailable && onOpen?.()}
      disabled={!isAvailable}
      className={`
        kid-card text-center transition-all duration-300
        ${isAvailable ? 'animate-pulse-glow cursor-pointer hover:scale-105' : ''}
        ${status === 'claimed' ? 'opacity-50' : ''}
        bg-gradient-to-br ${chestColors[type]}
      `}
    >
      <div className={`text-5xl mb-2 ${isAvailable ? 'animate-float' : ''}`}>
        {status === 'claimed' ? '✅' : chestIcons[type]}
      </div>
      <h4 className="font-display font-bold text-white capitalize">{type} Chest</h4>
      <div className="mt-2 w-full bg-white/30 rounded-full h-2">
        <div
          className="bg-white/80 h-full rounded-full transition-all"
          style={{ width: `${(safeProgress / safeMax) * 100}%` }}
        />
      </div>
      <p className="text-white/80 text-xs mt-1">{safeProgress}/{safeMax}</p>
    </button>
  );
}
