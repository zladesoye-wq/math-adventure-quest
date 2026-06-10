import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import { useAllChildrenProgress } from '../hooks/useParentData';
import { LoadingSpinner, ErrorDisplay } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import type { ChildProgress } from '../types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ParentDashboard() {
  const { children: childrenProgress, loading, error, refetch } = useAllChildrenProgress();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const { switchToStudent } = useAuth();
  const navigate = useNavigate();

  // Auto-select first child when data loads
  useEffect(() => {
    if (childrenProgress && childrenProgress.length > 0 && !selectedChildId) {
      setSelectedChildId(childrenProgress[0].student.id);
    }
  }, [childrenProgress, selectedChildId]);

  const handleSwitchToStudent = async (studentId: string) => {
    const result = await switchToStudent(studentId);
    if (result.success) {
      navigate('/dashboard');
    } else {
      alert(result.error || 'Failed to switch to student profile');
    }
  };

  const child = childrenProgress?.find((c: ChildProgress) => c.student.id === selectedChildId) || null;

  if (loading && !childrenProgress) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  if (error && !childrenProgress) {
    return <ErrorDisplay message={error} onRetry={refetch} />;
  }

  if (!childrenProgress || childrenProgress.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Welcome to Your Dashboard!</h2>
          <p className="text-gray-500 mb-6">Add a child to start tracking their math adventure!</p>
          <Button variant="primary" icon="👶" size="lg">Add Your First Child</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-800">📊 Parent Dashboard</h1>
          <p className="text-gray-500">Track your child's math adventure progress</p>
        </div>
        <Button variant="primary" icon="👶" size="sm">Add Child</Button>
      </div>

      {/* Child selector */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {childrenProgress.map((cp: ChildProgress) => {
          const childData = cp.student;
          const isSelected = selectedChildId === childData.id;
          return (
            <button
              key={childData.id}
              onClick={() => setSelectedChildId(childData.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                isSelected
                  ? 'bg-primary-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-primary-50 shadow-md'
              }`}
            >
              <span className="text-2xl">{childData.avatar?.gender === 'girl' ? '👧' : '🧒'}</span>
              <div className="text-left">
                <div className="font-display font-semibold">{childData.name}</div>
                <div className="text-xs opacity-80">Age {childData.age} • Grade {childData.grade}</div>
              </div>
            </button>
          );
        })}
      </div>

      {child ? <ChildProgressView child={child} /> : null}
    </div>
  );
}

// ── Child Progress View ──────────────────────────────────────

function ChildProgressView({ child }: { child: ChildProgress }) {
  const s = child.student.stats;
  const stats = {
    problemsSolved: s?.problemsSolved || 0,
    accuracy: Math.round(s?.accuracy || 0),
    streak: s?.streak || 0,
    timeToday: 0,
    coins: s?.coins || 0,
    xp: s?.xp || 0,
    level: s?.level || 1,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main stats */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '🧮', label: 'Problems Solved', value: stats.problemsSolved },
            { icon: '🎯', label: 'Accuracy', value: `${stats.accuracy}%` },
            { icon: '🔥', label: 'Day Streak', value: stats.streak },
            { icon: '🎮', label: 'Mode', value: <button onClick={() => handleSwitchToStudent(child.student.id)} className="text-primary-600 hover:underline">Play</button> },
          ].map((stat) => (
            <Card key={stat.label} className="text-center !p-4">
              <div className="text-2xl">{stat.icon}</div>
              <div className="font-display font-bold text-xl text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Weekly Accuracy Chart */}
        <Card>
          <h3 className="font-display font-bold text-gray-800 mb-4">📈 Weekly Accuracy</h3>
          <div className="flex items-end gap-2 h-32">
            {child.weeklyAccuracy.length > 0 ? (
              child.weeklyAccuracy.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-gray-500">{val}%</span>
                  <div
                    className="w-full bg-gradient-to-t from-primary-400 to-primary-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${val}%`, minHeight: '8px' }}
                  />
                  <span className="text-xs text-gray-400">{DAYS[i] || ''}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm w-full text-center py-8">No data yet — start solving problems!</p>
            )}
          </div>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-display font-bold text-green-600 mb-3">💪 Strengths</h3>
            {child.strengths.length > 0 ? (
              <div className="space-y-2">
                {child.strengths.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                    <span>✅</span> {s}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not enough data yet</p>
            )}
          </Card>
          <Card>
            <h3 className="font-display font-bold text-energy-600 mb-3">🎯 Areas to Practice</h3>
            {child.weaknesses.length > 0 ? (
              <div className="space-y-2">
                {child.weaknesses.map((w) => (
                  <div key={w} className="flex items-center gap-2 text-sm text-gray-700">
                    <span>📝</span> {w}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not enough data yet</p>
            )}
          </Card>
        </div>

        {/* XP & Level */}
        <Card className="bg-gradient-to-r from-primary-500 to-accent-500 text-white">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-display font-bold">Level {stats.level}</span>
                <span>{stats.xp} / {Math.max(stats.level * 500, 500)} XP</span>
              </div>
              <ProgressBar value={stats.xp} max={Math.max(stats.level * 500, 500)} color="energy" />
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Recent Activity */}
        <Card>
          <h3 className="font-display font-bold text-gray-800 mb-3">🕐 Recent Activity</h3>
          {child.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {child.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{activity.detail}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </div>
                  {activity.xpEarned > 0 && (
                    <span className="text-energy-500 font-bold text-xs whitespace-nowrap">+{activity.xpEarned} XP</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
          )}
        </Card>

        {/* Rewards Summary */}
        <Card>
          <h3 className="font-display font-bold text-gray-800 mb-3">💰 Rewards</h3>
          <div className="flex items-center gap-4 justify-center py-3">
            <div className="text-center">
              <div className="text-3xl">🪙</div>
              <div className="font-display font-bold text-amber-500">{stats.coins}</div>
              <div className="text-xs text-gray-500">Coins</div>
            </div>
            <div className="text-2xl text-gray-300">+</div>
            <div className="text-center">
              <div className="text-3xl">⭐</div>
              <div className="font-display font-bold text-yellow-500">{s?.stars || 0}</div>
              <div className="text-xs text-gray-500">Stars</div>
            </div>
          </div>
        </Card>

        {/* Printable Reports */}
        <Card>
          <h3 className="font-display font-bold text-gray-800 mb-3">📄 Reports</h3>
          <div className="space-y-2">
            <Button variant="ghost" icon="📊" fullWidth>Weekly Progress Report</Button>
            <Button variant="ghost" icon="🎯" fullWidth>Skill Assessment</Button>
            <Button variant="ghost" icon="🏆" fullWidth>Achievement Summary</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}