import { useState, useEffect } from 'react';
import type { Achievement } from '../data/achievements';
import {
  achievements,
  getRarityColor,
  getRarityBgColor,
  getNewlyUnlockedAchievements
} from '../data/achievements';

interface AchievementsGalleryProps {
  unlockedIds: string[];
  stats: {
    storiesRead: number;
    vocabularyLearned: number;
    streakDays: number;
    missionsCompleted: number;
    perfectQuizzes: number;
    totalPoints: number;
  };
  onUnlock?: (achievement: Achievement) => void;
}

export function AchievementsGallery({ unlockedIds, stats, onUnlock }: AchievementsGalleryProps) {
  const [filter, setFilter] = useState<string>('all');
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null);

  // Check for newly unlocked achievements
  useEffect(() => {
    const newlyUnlocked = getNewlyUnlockedAchievements(unlockedIds, stats);
    if (newlyUnlocked.length > 0) {
      setNewUnlock(newlyUnlocked[0]);
      if (onUnlock) {
        onUnlock(newlyUnlocked[0]);
      }
    }
  }, [unlockedIds, stats, onUnlock]);

  const filteredAchievements = filter === 'all'
    ? achievements
    : achievements.filter(a => a.category === filter);

  const unlockedCount = unlockedIds.length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            🏆
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Achievements</h1>
            <p className="text-orange-100 text-lg">הישגים</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="font-bold">{unlockedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'reading', label: '📖 Reading' },
          { id: 'vocabulary', label: '📝 Vocabulary' },
          { id: 'streak', label: '🔥 Streak' },
          { id: 'mission', label: '🎯 Mission' },
          { id: 'special', label: '⭐ Special' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === f.id
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          const progress = isUnlocked
            ? 100
            : getProgressPercentage(achievement, stats);

          return (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isUnlocked={isUnlocked}
              progress={progress}
            />
          );
        })}
      </div>

      {/* New Achievement Modal */}
      {newUnlock && (
        <AchievementUnlockModal
          achievement={newUnlock}
          onClose={() => setNewUnlock(null)}
        />
      )}
    </div>
  );
}

// ============================================
// ACHIEVEMENT CARD
// ============================================

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
}

function AchievementCard({ achievement, isUnlocked, progress }: AchievementCardProps) {
  return (
    <div
      className={`relative rounded-xl border-2 p-4 text-center transition-all ${
        isUnlocked
          ? getRarityBgColor(achievement.rarity)
          : 'bg-gray-100 border-gray-200 opacity-60'
      }`}
    >
      {/* Icon */}
      <div
        className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-3xl ${
          isUnlocked
            ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white shadow-lg`
            : 'bg-gray-200 text-gray-400'
        }`}
      >
        {isUnlocked ? achievement.icon : '🔒'}
      </div>

      {/* Name */}
      <h3 className={`font-bold text-sm mb-1 ${
        isUnlocked ? 'text-gray-800' : 'text-gray-500'
      }`}>
        {achievement.name}
      </h3>
      <p className="text-xs text-gray-500 mb-2">{achievement.nameHe}</p>

      {/* Progress bar for locked achievements */}
      {!isUnlocked && progress > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-orange-400 h-1.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round(progress)}%</p>
        </div>
      )}

      {/* Points badge */}
      {isUnlocked && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-white rounded-full text-xs font-bold text-orange-600">
          +{achievement.points}
        </div>
      )}

      {/* Rarity indicator */}
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        isUnlocked
          ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`
          : 'bg-gray-200 text-gray-500'
      }`}>
        {achievement.rarity}
      </span>
    </div>
  );
}

// ============================================
// ACHIEVEMENT UNLOCK MODAL
// ============================================

interface AchievementUnlockModalProps {
  achievement: Achievement;
  onClose: () => void;
}

function AchievementUnlockModal({ achievement, onClose }: AchievementUnlockModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-scaleIn">
        {/* Celebration */}
        <div className="text-6xl mb-4 animate-bounce">🎉</div>

        {/* Achievement */}
        <div
          className={`w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center text-5xl bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white shadow-xl`}
        >
          {achievement.icon}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Achievement Unlocked!
        </h2>
        <p className="text-gray-500 mb-2">הישג נפתח!</p>

        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {achievement.name}
        </h3>
        <p className="text-gray-500 mb-4">{achievement.nameHe}</p>

        <p className="text-gray-600 mb-4">{achievement.description}</p>

        {/* Points */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">⭐</span>
            <span className="text-2xl font-bold text-orange-600">
              +{achievement.points} Points!
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-3 bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity`}
        >
          Awesome! 🚀
        </button>
      </div>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getProgressPercentage(
  achievement: Achievement,
  stats: {
    storiesRead: number;
    vocabularyLearned: number;
    streakDays: number;
    missionsCompleted: number;
    perfectQuizzes: number;
    totalPoints: number;
  }
): number {
  const { requirement } = achievement;
  let current = 0;

  switch (requirement.type) {
    case 'stories_read':
      current = stats.storiesRead;
      break;
    case 'vocabulary_learned':
      current = stats.vocabularyLearned;
      break;
    case 'streak_days':
      current = stats.streakDays;
      break;
    case 'missions_completed':
      current = stats.missionsCompleted;
      break;
    case 'perfect_quiz':
      current = stats.perfectQuizzes;
      break;
    case 'points_earned':
      current = stats.totalPoints;
      break;
  }

  return Math.min(100, (current / requirement.value) * 100);
}

// ============================================
// ACHIEVEMENT BADGE (for display in profile)
// ============================================

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ achievement, size = 'md' }: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  };

  return (
    <div
      className={`rounded-xl flex items-center justify-center bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white shadow-lg ${sizeClasses[size]}`}
      title={`${achievement.name}: ${achievement.description}`}
    >
      {achievement.icon}
    </div>
  );
}

// ============================================
// RECENT ACHIEVEMENTS (for home page)
// ============================================

interface RecentAchievementsProps {
  unlockedIds: string[];
  limit?: number;
}

export function RecentAchievements({ unlockedIds, limit = 3 }: RecentAchievementsProps) {
  const recentAchievements = unlockedIds
    .map(id => achievements.find(a => a.id === id))
    .filter(Boolean)
    .slice(0, limit) as Achievement[];

  if (recentAchievements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>🏆</span>
        <span>Recent Achievements / הישגים אחרונים</span>
      </h3>
      <div className="flex flex-wrap gap-3">
        {recentAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
          >
            <AchievementBadge achievement={achievement} size="md" />
            <div>
              <p className="font-medium text-gray-800">{achievement.name}</p>
              <p className="text-sm text-gray-500">{achievement.nameHe}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
