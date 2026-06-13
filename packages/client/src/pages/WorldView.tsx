import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorld } from '../hooks/useStudentData';
import { LoadingSpinner, ErrorDisplay } from '../hooks/useApi';
import ProgressBar from '../components/common/ProgressBar';
import LevelPath from '../components/game/LevelPath';
import type { Level } from '../types';

const WORLD_META: Record<string, { name: string; emoji: string; color: string; desc: string }> = {
  'addition-forest':        { name: 'Addition Forest',        emoji: '🌳', color: 'from-green-400 to-emerald-600',  desc: 'Master addition from simple sums to triple-digit challenges!' },
  'subtraction-mountain':   { name: 'Subtraction Mountain',   emoji: '⛰️', color: 'from-purple-400 to-violet-600',  desc: 'Climb higher with subtraction skills!' },
  'multiplication-kingdom': { name: 'Multiplication Kingdom', emoji: '👑', color: 'from-amber-400 to-yellow-600',   desc: 'Times tables become your superpower!' },
  'division-desert':        { name: 'Division Desert',        emoji: '🏜️', color: 'from-orange-400 to-orange-600',  desc: 'Divide and conquer!' },
  'fraction-castle':        { name: 'Fraction Castle',        emoji: '🥧', color: 'from-pink-400 to-rose-600',      desc: 'Pies, pizzas, and perfect fractions!' },
};

/** Convert a DB world name like "Addition Forest" → "addition-forest" */
function nameToSlug(name: string = ''): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default function WorldView() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.role === 'student' ? user.id : undefined;

  const { world, loading, error, refetch } = useWorld(studentId, worldId);

  // Derive display metadata from the world name returned by the API.
  // Previously this used the UUID worldId as a key, which never matched.
  const meta =
    (world?.name ? WORLD_META[nameToSlug(world.name)] : null) ||
    WORLD_META['addition-forest'];

  const levels = world?.levels || [];
  const completedCount = levels.filter((l: Level) => l.status === 'completed').length;
  // Guard against undefined stars (new students have no progress yet)
  const totalStars = levels.reduce((sum: number, l: Level) => sum + (l.stars || 0), 0);
  const maxStars = levels.length * 3;

  const handleLevelSelect = (levelId: string) => {
    navigate(`/world/${worldId}/level/${levelId}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className={`bg-gradient-to-br ${meta.color} rounded-3xl p-8 text-white mb-8 shadow-xl`}>
        <button onClick={() => navigate('/dashboard')} className="text-white/80 hover:text-white mb-4 flex items-center gap-1">
          ← Back to Worlds
        </button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-6xl">{meta.emoji}</div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold">
              {world?.name || meta.name}
            </h1>
            <p className="text-white/80 text-lg mt-1">{meta.desc}</p>
            <div className="flex items-center gap-4 mt-3 text-white/90 text-sm">
              <span>⭐ {totalStars} / {maxStars} stars</span>
              <span>•</span>
              <span>{completedCount} / {levels.length} levels</span>
            </div>
            <div className="mt-3 max-w-md">
              <ProgressBar value={completedCount} max={Math.max(levels.length, 1)} size="sm" color="energy" />
            </div>
          </div>
        </div>
      </div>

      {/* Level selection */}
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">🗺️ Level Path</h2>
        {loading && !world ? (
          <LoadingSpinner message="Loading levels..." />
        ) : error && !world ? (
          <ErrorDisplay message={error} onRetry={refetch} />
        ) : levels.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🗺️</div>
            <p>No levels available in this world yet!</p>
          </div>
        ) : (
          <LevelPath levels={levels} worldColor={meta.color} onSelectLevel={handleLevelSelect} />
        )}
      </div>
    </div>
  );
}
