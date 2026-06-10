import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStudentStats, useStudentWorlds, useDailyChallenges } from '../hooks/useStudentData';
import { LoadingSpinner, ErrorDisplay } from '../hooks/useApi';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import CoinDisplay from '../components/rewards/RewardDisplay';
import WorldMap from '../components/game/WorldMap';
import type { WorldId, World, DailyChallenge } from '../types';

function worldToMapProps(world: World) {
  return {
    id: world.id,
    name: world.name,
    emoji: world.emoji,
    gradientFrom: world.gradientFrom,
    gradientTo: world.gradientTo,
    unlocked: world.levels.some(l => l.status !== 'locked') || world.levels.length === 0,
    levels: world.levels.map(l => ({ status: l.status, stars: l.stars })),
  };
}

const FALLBACK_WORLD_PROPS = {
  id: 'addition-forest' as WorldId, name: 'Addition Forest', emoji: '🌳',
  gradientFrom: 'from-green-400', gradientTo: 'to-emerald-600', unlocked: true,
  levels: [{ status: 'unlocked' as const, stars: 0 }],
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = user?.role === 'student' ? user.id : undefined;

  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useStudentStats(studentId);
  const { worlds, loading: worldsLoading, error: worldsError, refetch: refetchWorlds } = useStudentWorlds(studentId);
  const { challenges } = useDailyChallenges(studentId);

  const [selectedWorld, setSelectedWorld] = useState<WorldId | undefined>();

  const loading = statsLoading || worldsLoading;
  const error = statsError || worldsError;

  const handleWorldSelect = (worldId: WorldId) => {
    setSelectedWorld(worldId);
    navigate(`/world/${worldId}`);
  };

  if (loading && !stats && !worlds) {
    return <LoadingSpinner message="Loading your adventure..." />;
  }

  if (error && !stats && !worlds) {
    return <ErrorDisplay message={error} onRetry={() => { refetchStats(); refetchWorlds(); }} />;
  }

  const s = stats || { coins: 0, gems: 0, stars: 0, xp: 0, level: 1, streak: 0, problemsSolved: 0, accuracy: 0, longestStreak: 0, lastActiveDate: '' };
  const worldProps = worlds?.map(worldToMapProps) || [FALLBACK_WORLD_PROPS];
  const challengeList = challenges || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">🎮 My Adventure</h1>
          <p className="text-gray-500">Welcome back{user?.name ? `, ${user.name}` : ''}! Keep up the great work!</p>
        </div>
        <div className="flex items-center gap-6 bg-white rounded-2xl px-5 py-3 shadow-md">
          <CoinDisplay coins={s.coins} gems={s.gems} stars={s.stars} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Player Level Card */}
          <Card className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl">Level {s.level} Explorer</h2>
                  <span className="font-display font-bold">{s.xp} / {Math.max(s.level * 500, 500)} XP</span>
                </div>
                <ProgressBar value={s.xp} max={Math.max(s.level * 500, 500)} size="md" color="energy" className="mt-2" />
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: '🔥', label: 'Streak', value: `${s.streak} days` },
              { icon: '✅', label: 'Solved', value: `${s.problemsSolved}` },
              { icon: '🎯', label: 'Accuracy', value: `${s.accuracy}%` },
              { icon: '⭐', label: 'Total Stars', value: `${s.stars}` },
            ].map((stat) => (
              <Card key={stat.label} className="text-center !p-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="font-display font-bold text-lg text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* World Map */}
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-4">🌍 Choose Your World</h2>
            {worldsLoading && !worlds ? (
              <LoadingSpinner message="Loading worlds..." />
            ) : (
              <WorldMap
                worlds={worldProps}
                selectedWorld={selectedWorld}
                onSelectWorld={handleWorldSelect}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Daily Challenges */}
          <Card>
            <h3 className="font-display font-bold text-gray-800 mb-3">📋 Daily Challenges</h3>
            {challengeList.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No challenges available yet!</p>
            ) : (
              <div className="space-y-3">
                {challengeList.slice(0, 3).map((challenge: DailyChallenge) => (
                  <div key={challenge.id} className="p-3 bg-gradient-to-r from-energy-50 to-yellow-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-700">{challenge.title}</span>
                      <span className="text-energy-500 font-bold text-xs">+{challenge.xpReward} XP</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{challenge.description}</p>
                    <ProgressBar value={challenge.progress} max={challenge.requirement} size="sm" color="energy" />
                    <span className="text-xs text-gray-400">{challenge.progress}/{challenge.requirement}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Avatar Card */}
          <Card className="text-center">
            <h3 className="font-display font-bold text-gray-800 mb-2">My Character</h3>
            <div className="text-6xl mb-2">🧒</div>
            <p className="text-sm text-gray-500 mb-2">Customize your look!</p>
            <button className="kid-button bg-primary-50 text-primary-600 px-4 py-2 text-sm" onClick={() => navigate('/profile')}>
              ✨ Edit Avatar
            </button>
          </Card>

          {/* Streak */}
          <Card className="text-center bg-gradient-to-br from-energy-50 to-orange-50">
            <h3 className="font-display font-bold text-gray-800 mb-2">🔥 Daily Streak</h3>
            <div className="text-4xl font-display font-bold text-energy-500">{s.streak}</div>
            <p className="text-xs text-gray-500">days in a row!</p>
            <div className="flex justify-center gap-1 mt-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                <div key={day} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < s.streak ? 'bg-energy-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {day[0]}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}