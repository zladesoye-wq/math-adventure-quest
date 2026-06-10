import type { WorldId } from '../../types';

interface WorldMapProps {
  worlds: {
    id: WorldId;
    name: string;
    emoji: string;
    gradientFrom: string;
    gradientTo: string;
    levels: { status: string; stars: number }[];
    unlocked: boolean;
  }[];
  selectedWorld?: WorldId;
  onSelectWorld: (worldId: WorldId) => void;
}

const worldColors: Record<string, { from: string; to: string; shadow: string }> = {
  'addition-forest': { from: 'from-green-400', to: 'to-emerald-600', shadow: 'shadow-green-400/30' },
  'subtraction-mountain': { from: 'from-purple-400', to: 'to-violet-600', shadow: 'shadow-purple-400/30' },
  'multiplication-kingdom': { from: 'from-amber-400', to: 'to-yellow-600', shadow: 'shadow-amber-400/30' },
  'division-desert': { from: 'from-orange-400', to: 'to-orange-600', shadow: 'shadow-orange-400/30' },
  'fraction-castle': { from: 'from-pink-400', to: 'to-rose-600', shadow: 'shadow-pink-400/30' },
};

export default function WorldMap({ worlds, selectedWorld, onSelectWorld }: WorldMapProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {worlds.map((world) => {
        const colors = worldColors[world.id] || worldColors['addition-forest'];
        const completedLevels = world.levels.filter(l => l.status === 'completed').length;
        const totalStars = world.levels.reduce((sum, l) => sum + l.stars, 0);
        const isSelected = selectedWorld === world.id;

        return (
          <button
            key={world.id}
            onClick={() => onSelectWorld(world.id)}
            className={`
              relative group overflow-hidden rounded-3xl p-5 text-left transition-all duration-300
              bg-gradient-to-br ${colors.from} ${colors.to}
              ${isSelected ? 'ring-4 ring-white scale-[1.03]' : 'hover:scale-[1.02]'}
              ${!world.unlocked ? 'opacity-60 grayscale' : 'shadow-xl hover:shadow-2xl'}
              ${colors.shadow}
            `}
          >
            {/* Unlock overlay */}
            {!world.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-3xl z-10">
                <span className="text-4xl">🔒</span>
              </div>
            )}

            {/* World icon */}
            <div className="text-5xl mb-3 animate-float">{world.emoji}</div>

            {/* World name */}
            <h3 className="font-display font-bold text-white text-lg mb-1 drop-shadow-sm">
              {world.name}
            </h3>

            {/* Progress info */}
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <span>⭐ {totalStars}</span>
              <span>•</span>
              <span>{completedLevels}/{world.levels.length} levels</span>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-white/30 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white/80 h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedLevels / world.levels.length) * 100}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}