// Achievements & Badges System

export interface Achievement {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  icon: string;
  category: 'reading' | 'vocabulary' | 'streak' | 'mission' | 'special';
  requirement: AchievementRequirement;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementRequirement {
  type: 'stories_read' | 'vocabulary_learned' | 'streak_days' | 'missions_completed' | 'perfect_quiz' | 'points_earned';
  value: number;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  notified: boolean;
}

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================

export const achievements: Achievement[] = [
  // READING ACHIEVEMENTS
  {
    id: 'first_story',
    name: 'First Steps',
    nameHe: 'צעדים ראשונים',
    description: 'Read your first story',
    descriptionHe: 'קראת את הסיפור הראשון שלך',
    icon: '📖',
    category: 'reading',
    requirement: { type: 'stories_read', value: 1 },
    points: 10,
    rarity: 'common'
  },
  {
    id: 'bookworm_5',
    name: 'Bookworm',
    nameHe: 'תולעת ספרים',
    description: 'Read 5 stories',
    descriptionHe: 'קראת 5 סיפורים',
    icon: '📚',
    category: 'reading',
    requirement: { type: 'stories_read', value: 5 },
    points: 25,
    rarity: 'common'
  },
  {
    id: 'reader_10',
    name: 'Avid Reader',
    nameHe: 'קורא נלהב',
    description: 'Read 10 stories',
    descriptionHe: 'קראת 10 סיפורים',
    icon: '👓',
    category: 'reading',
    requirement: { type: 'stories_read', value: 10 },
    points: 50,
    rarity: 'uncommon'
  },
  {
    id: 'reader_25',
    name: 'Story Master',
    nameHe: 'אדון הסיפורים',
    description: 'Read 25 stories',
    descriptionHe: 'קראת 25 סיפורים',
    icon: '🏆',
    category: 'reading',
    requirement: { type: 'stories_read', value: 25 },
    points: 100,
    rarity: 'rare'
  },
  {
    id: 'reader_50',
    name: 'Library Legend',
    nameHe: 'אגדת הספרייה',
    description: 'Read 50 stories',
    descriptionHe: 'קראת 50 סיפורים',
    icon: '👑',
    category: 'reading',
    requirement: { type: 'stories_read', value: 50 },
    points: 200,
    rarity: 'epic'
  },

  // VOCABULARY ACHIEVEMENTS
  {
    id: 'word_collector_10',
    name: 'Word Collector',
    nameHe: 'אספן מילים',
    description: 'Learn 10 new words',
    descriptionHe: 'למדת 10 מילים חדשות',
    icon: '📝',
    category: 'vocabulary',
    requirement: { type: 'vocabulary_learned', value: 10 },
    points: 15,
    rarity: 'common'
  },
  {
    id: 'vocabulary_50',
    name: 'Vocabulary Builder',
    nameHe: 'בונה אוצר מילים',
    description: 'Learn 50 new words',
    descriptionHe: 'למדת 50 מילים חדשות',
    icon: '📚',
    category: 'vocabulary',
    requirement: { type: 'vocabulary_learned', value: 50 },
    points: 50,
    rarity: 'uncommon'
  },
  {
    id: 'vocabulary_100',
    name: 'Word Master',
    nameHe: 'אדון המילים',
    description: 'Learn 100 new words',
    descriptionHe: 'למדת 100 מילים חדשות',
    icon: '🎓',
    category: 'vocabulary',
    requirement: { type: 'vocabulary_learned', value: 100 },
    points: 100,
    rarity: 'rare'
  },

  // STREAK ACHIEVEMENTS
  {
    id: 'streak_3',
    name: 'Getting Started',
    nameHe: 'מתחילים',
    description: '3 day learning streak',
    descriptionHe: 'רצף של 3 ימים',
    icon: '✨',
    category: 'streak',
    requirement: { type: 'streak_days', value: 3 },
    points: 15,
    rarity: 'common'
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    nameHe: 'לוחם השבוע',
    description: '7 day learning streak',
    descriptionHe: 'רצף של 7 ימים',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak_days', value: 7 },
    points: 50,
    rarity: 'uncommon'
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    nameHe: 'לוחם שבועיים',
    description: '14 day learning streak',
    descriptionHe: 'רצף של 14 יום',
    icon: '💪',
    category: 'streak',
    requirement: { type: 'streak_days', value: 14 },
    points: 75,
    rarity: 'rare'
  },
  {
    id: 'streak_30',
    name: 'Month Master',
    nameHe: 'אדון החודש',
    description: '30 day learning streak',
    descriptionHe: 'רצף של 30 יום',
    icon: '🌟',
    category: 'streak',
    requirement: { type: 'streak_days', value: 30 },
    points: 150,
    rarity: 'epic'
  },
  {
    id: 'streak_100',
    name: 'Legendary Dedication',
    nameHe: 'מסירות אגדית',
    description: '100 day learning streak',
    descriptionHe: 'רצף של 100 יום',
    icon: '👑',
    category: 'streak',
    requirement: { type: 'streak_days', value: 100 },
    points: 500,
    rarity: 'legendary'
  },

  // MISSION ACHIEVEMENTS
  {
    id: 'mission_first',
    name: 'Mission Accepted',
    nameHe: 'משימה התקבלה',
    description: 'Complete your first mission',
    descriptionHe: 'השלמת את המשימה הראשונה',
    icon: '🎯',
    category: 'mission',
    requirement: { type: 'missions_completed', value: 1 },
    points: 20,
    rarity: 'common'
  },
  {
    id: 'mission_5',
    name: 'Mission Accomplished',
    nameHe: 'משימה הושלמה',
    description: 'Complete 5 missions',
    descriptionHe: 'השלמת 5 משימות',
    icon: '🎖️',
    category: 'mission',
    requirement: { type: 'missions_completed', value: 5 },
    points: 50,
    rarity: 'uncommon'
  },
  {
    id: 'mission_10',
    name: 'Super Agent',
    nameHe: 'סוכן על',
    description: 'Complete 10 missions',
    descriptionHe: 'השלמת 10 משימות',
    icon: '🦸',
    category: 'mission',
    requirement: { type: 'missions_completed', value: 10 },
    points: 100,
    rarity: 'rare'
  },

  // SPECIAL ACHIEVEMENTS
  {
    id: 'perfect_quiz',
    name: 'Perfect Score',
    nameHe: 'ציון מושלם',
    description: 'Get 100% on a quiz',
    descriptionHe: 'השגת 100% בחידון',
    icon: '💯',
    category: 'special',
    requirement: { type: 'perfect_quiz', value: 1 },
    points: 25,
    rarity: 'uncommon'
  },
  {
    id: 'points_100',
    name: 'Point Collector',
    nameHe: 'אספן נקודות',
    description: 'Earn 100 points',
    descriptionHe: 'צברת 100 נקודות',
    icon: '⭐',
    category: 'special',
    requirement: { type: 'points_earned', value: 100 },
    points: 10,
    rarity: 'common'
  },
  {
    id: 'points_500',
    name: 'Point Champion',
    nameHe: 'אלוף הנקודות',
    description: 'Earn 500 points',
    descriptionHe: 'צברת 500 נקודות',
    icon: '🌟',
    category: 'special',
    requirement: { type: 'points_earned', value: 500 },
    points: 50,
    rarity: 'rare'
  },
  {
    id: 'points_1000',
    name: 'Point Legend',
    nameHe: 'אגדת הנקודות',
    description: 'Earn 1000 points',
    descriptionHe: 'צברת 1000 נקודות',
    icon: '💫',
    category: 'special',
    requirement: { type: 'points_earned', value: 1000 },
    points: 100,
    rarity: 'epic'
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find(a => a.id === id);
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return achievements.filter(a => a.category === category);
}

export function checkAchievementUnlocked(
  achievement: Achievement,
  stats: {
    storiesRead: number;
    vocabularyLearned: number;
    streakDays: number;
    missionsCompleted: number;
    perfectQuizzes: number;
    totalPoints: number;
  }
): boolean {
  const { requirement } = achievement;
  switch (requirement.type) {
    case 'stories_read':
      return stats.storiesRead >= requirement.value;
    case 'vocabulary_learned':
      return stats.vocabularyLearned >= requirement.value;
    case 'streak_days':
      return stats.streakDays >= requirement.value;
    case 'missions_completed':
      return stats.missionsCompleted >= requirement.value;
    case 'perfect_quiz':
      return stats.perfectQuizzes >= requirement.value;
    case 'points_earned':
      return stats.totalPoints >= requirement.value;
    default:
      return false;
  }
}

export function getNewlyUnlockedAchievements(
  unlockedIds: string[],
  stats: {
    storiesRead: number;
    vocabularyLearned: number;
    streakDays: number;
    missionsCompleted: number;
    perfectQuizzes: number;
    totalPoints: number;
  }
): Achievement[] {
  return achievements.filter(
    achievement =>
      !unlockedIds.includes(achievement.id) &&
      checkAchievementUnlocked(achievement, stats)
  );
}

export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'from-gray-400 to-gray-500';
    case 'uncommon':
      return 'from-green-400 to-green-600';
    case 'rare':
      return 'from-blue-400 to-blue-600';
    case 'epic':
      return 'from-purple-400 to-purple-600';
    case 'legendary':
      return 'from-yellow-400 to-orange-500';
    default:
      return 'from-gray-400 to-gray-500';
  }
}

export function getRarityBgColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 border-gray-300';
    case 'uncommon':
      return 'bg-green-50 border-green-300';
    case 'rare':
      return 'bg-blue-50 border-blue-300';
    case 'epic':
      return 'bg-purple-50 border-purple-300';
    case 'legendary':
      return 'bg-yellow-50 border-orange-300';
    default:
      return 'bg-gray-100 border-gray-300';
  }
}

export function getProgressToNextAchievement(
  category: Achievement['category'],
  currentValue: number,
  unlockedIds: string[]
): { achievement: Achievement; progress: number } | null {
  const categoryAchievements = getAchievementsByCategory(category)
    .filter(a => !unlockedIds.includes(a.id))
    .sort((a, b) => a.requirement.value - b.requirement.value);

  if (categoryAchievements.length === 0) return null;

  const nextAchievement = categoryAchievements[0];
  const progress = Math.min(100, (currentValue / nextAchievement.requirement.value) * 100);

  return { achievement: nextAchievement, progress };
}
