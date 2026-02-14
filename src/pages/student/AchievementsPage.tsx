import { useState, useEffect } from 'react';
import type { Student } from '../../types';
import type { Achievement } from '../../data/achievements';
import { AchievementsGallery, RecentAchievements } from '../../components/AchievementsDisplay';

interface AchievementsPageProps {
  student: Student;
  streakDays: number;
  onBack: () => void;
}

const ACHIEVEMENTS_STORAGE_KEY = 'kriakids_achievements';

function AchievementsPage({ student, streakDays, onBack }: AchievementsPageProps) {
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  // Load unlocked achievements from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${ACHIEVEMENTS_STORAGE_KEY}_${student.id}`);
      if (stored) {
        setUnlockedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load achievements:', e);
    }
  }, [student.id]);

  // Save to storage
  useEffect(() => {
    try {
      localStorage.setItem(`${ACHIEVEMENTS_STORAGE_KEY}_${student.id}`, JSON.stringify(unlockedIds));
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  }, [unlockedIds, student.id]);

  const stats = {
    storiesRead: student.storiesRead || 0,
    vocabularyLearned: 10, // Demo value
    streakDays: streakDays,
    missionsCompleted: student.missionsCompleted || 0,
    perfectQuizzes: 0, // Demo value
    totalPoints: student.totalPoints || 0
  };

  const handleUnlock = (achievement: Achievement) => {
    if (!unlockedIds.includes(achievement.id)) {
      setUnlockedIds(prev => [...prev, achievement.id]);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span>→</span>
        <span>חזור / Back</span>
      </button>

      <AchievementsGallery
        unlockedIds={unlockedIds}
        stats={stats}
        onUnlock={handleUnlock}
      />
    </div>
  );
}

export default AchievementsPage;
