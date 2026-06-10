import type { Level } from '../../types';

interface LevelPathProps {
  levels: Level[];
  worldColor: string;
  onSelectLevel: (levelId: string) => void;
}

const difficultyLabels: Record<string, string> = {
  easy: '🌟',
  medium: '🌟🌟',
  hard: '🌟🌟🌟',
  expert: '🌟🌟🌟🌟',
};

export default function LevelPath({ levels, worldColor, onSelectLevel }: LevelPathProps) {
  return (
    <div className="relative">
      {/* Connecting path line - vertical */}
      <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-primary-300 to-primary-400 -translate-x-1/2 rounded-full hidden md:block" />

      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 gap-4">
        {levels.map((level, index) => {
          const isLocked = level.status === 'locked';
          const isCompleted = level.status === 'completed';

          return (
            <button
              key={level.id}
              onClick={() => !isLocked && onSelectLevel(level.id)}
              disabled={isLocked}
              className={`
                relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300
                ${isLocked
                  ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                  : isCompleted
                    ? 'bg-white shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 border-green-300'
                    : 'bg-white shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer animate-pulse-glow'
                }
                ${index % 2 === 0 ? 'md:pr-12 md:mr-8' : 'md:pl-12 md:ml-8'}
              `}
            >
              {/* Level number badge */}
              <div
                className={`
                  flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                  text-white font-display font-bold text-lg
                  ${isCompleted
                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                    : isLocked
                      ? 'bg-gray-300'
                      : `bg-gradient-to-br ${worldColor}`
                  }
                `}
              >
                {isCompleted ? '✓' : isLocked ? '🔒' : level.number}
              </div>

              {/* Level info */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-semibold text-gray-800">
                    {level.title}
                  </h4>
                  <span className="text-xs">{difficultyLabels[level.difficulty]}</span>
                </div>
                <p className="text-sm text-gray-500">{level.description}</p>

                {/* Stars earned */}
                {isCompleted && (
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${star <= level.stars ? '' : 'opacity-20'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrow indicator */}
              {!isLocked && (
                <span className="hidden md:block text-2xl text-gray-400">
                  →
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}