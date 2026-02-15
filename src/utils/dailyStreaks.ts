/**
 * Daily Streak System
 * Encourages consistent daily practice with streak tracking and rewards
 */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakStartDate: string | null;
  totalActiveDays: number;
  weekActivity: boolean[]; // Last 7 days activity
  rewards: StreakReward[];
}

export interface StreakReward {
  streakRequired: number;
  rewardType: 'points' | 'badge' | 'feature';
  rewardValue: number | string;
  claimed: boolean;
  claimedAt?: string;
}

// Streak milestones and their rewards
export const STREAK_REWARDS: Omit<StreakReward, 'claimed' | 'claimedAt'>[] = [
  { streakRequired: 3, rewardType: 'points', rewardValue: 10 },
  { streakRequired: 7, rewardType: 'points', rewardValue: 50 },
  { streakRequired: 7, rewardType: 'badge', rewardValue: 'week_warrior' },
  { streakRequired: 14, rewardType: 'points', rewardValue: 100 },
  { streakRequired: 30, rewardType: 'badge', rewardValue: 'month_master' },
  { streakRequired: 30, rewardType: 'points', rewardValue: 300 },
  { streakRequired: 60, rewardType: 'badge', rewardValue: 'dedication_king' },
  { streakRequired: 100, rewardType: 'badge', rewardValue: 'legend' },
  { streakRequired: 100, rewardType: 'points', rewardValue: 1000 },
];

/**
 * Create initial streak data for a new student
 */
export function createInitialStreakData(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    streakStartDate: null,
    totalActiveDays: 0,
    weekActivity: [false, false, false, false, false, false, false],
    rewards: STREAK_REWARDS.map(reward => ({ ...reward, claimed: false }))
  };
}

/**
 * Get today's date as ISO string (date only, no time)
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date as ISO string
 */
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Check if student was active today
 */
export function wasActiveToday(streakData: StreakData): boolean {
  return streakData.lastActivityDate === getTodayDate();
}

/**
 * Check if streak is at risk (was active yesterday but not today)
 */
export function isStreakAtRisk(streakData: StreakData): boolean {
  if (streakData.currentStreak === 0) return false;
  if (wasActiveToday(streakData)) return false;

  // Check if last activity was yesterday
  return streakData.lastActivityDate === getYesterdayDate();
}

/**
 * Record activity for today and update streak
 */
export function recordActivity(streakData: StreakData): StreakData {
  const today = getTodayDate();

  // Already recorded today
  if (streakData.lastActivityDate === today) {
    return streakData;
  }

  const yesterday = getYesterdayDate();
  let newCurrentStreak = streakData.currentStreak;
  let streakStartDate = streakData.streakStartDate;

  // Check if continuing streak from yesterday
  if (streakData.lastActivityDate === yesterday) {
    // Continuing streak
    newCurrentStreak += 1;
  } else if (streakData.lastActivityDate === null) {
    // First activity ever
    newCurrentStreak = 1;
    streakStartDate = today;
  } else {
    // Streak broken, start new streak
    newCurrentStreak = 1;
    streakStartDate = today;
  }

  // Update week activity
  const weekActivity = [...streakData.weekActivity];
  weekActivity.shift();
  weekActivity.push(true);

  // Update longest streak
  const longestStreak = Math.max(streakData.longestStreak, newCurrentStreak);

  return {
    currentStreak: newCurrentStreak,
    longestStreak,
    lastActivityDate: today,
    streakStartDate,
    totalActiveDays: streakData.totalActiveDays + 1,
    weekActivity,
    rewards: streakData.rewards
  };
}

/**
 * Get unclaimed rewards for current streak
 */
export function getUnclaimedRewards(streakData: StreakData): StreakReward[] {
  return streakData.rewards.filter(
    reward => !reward.claimed && streakData.currentStreak >= reward.streakRequired
  );
}

/**
 * Claim a reward
 */
export function claimReward(streakData: StreakData, streakRequired: number): StreakData {
  return {
    ...streakData,
    rewards: streakData.rewards.map(reward =>
      reward.streakRequired === streakRequired
        ? { ...reward, claimed: true, claimedAt: new Date().toISOString() }
        : reward
    )
  };
}

/**
 * Get streak emoji based on streak length
 */
export function getStreakEmoji(streak: number): string {
  if (streak >= 100) return '👑';
  if (streak >= 60) return '💎';
  if (streak >= 30) return '🏆';
  if (streak >= 14) return '🔥';
  if (streak >= 7) return '⭐';
  if (streak >= 3) return '✨';
  if (streak >= 1) return '🌟';
  return '💤';
}

/**
 * Get streak message for display
 */
export function getStreakMessage(streakData: StreakData): {
  message: string;
  subMessage: string;
  type: 'encouragement' | 'warning' | 'celebration' | 'neutral'
} {
  const { currentStreak } = streakData;

  if (isStreakAtRisk(streakData)) {
    return {
      message: "Don't break your streak!",
      subMessage: `You're at ${currentStreak} days. Practice today to keep it going!`,
      type: 'warning'
    };
  }

  if (wasActiveToday(streakData)) {
    if (currentStreak >= 30) {
      return {
        message: `${getStreakEmoji(currentStreak)} Incredible ${currentStreak} Day Streak!`,
        subMessage: "You're a reading champion!",
        type: 'celebration'
      };
    }
    if (currentStreak >= 7) {
      return {
        message: `${getStreakEmoji(currentStreak)} ${currentStreak} Day Streak!`,
        subMessage: "You're on fire! Keep it up!",
        type: 'celebration'
      };
    }
    if (currentStreak >= 3) {
      return {
        message: `${getStreakEmoji(currentStreak)} ${currentStreak} Day Streak!`,
        subMessage: "Great consistency!",
        type: 'encouragement'
      };
    }
    return {
      message: `${getStreakEmoji(currentStreak)} Streak Started!`,
      subMessage: "Come back tomorrow to continue!",
      type: 'encouragement'
    };
  }

  if (currentStreak === 0) {
    return {
      message: "Start Your Streak Today!",
      subMessage: "Practice every day to build your streak!",
      type: 'neutral'
    };
  }

  return {
    message: `${getStreakEmoji(currentStreak)} ${currentStreak} Day Streak`,
    subMessage: "Keep practicing!",
    type: 'encouragement'
  };
}

/**
 * Calculate bonus points for maintaining streak
 */
export function calculateDailyBonus(streakData: StreakData): number {
  if (!wasActiveToday(streakData)) return 0;

  const { currentStreak } = streakData;

  // Daily bonus based on streak length
  if (currentStreak >= 30) return 15;
  if (currentStreak >= 14) return 10;
  if (currentStreak >= 7) return 7;
  if (currentStreak >= 3) return 5;
  return 2;
}

/**
 * Get day name from date
 */
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Get week activity display data
 */
export function getWeekActivityDisplay(streakData: StreakData): Array<{
  day: string;
  active: boolean;
  date: string;
}> {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayIndex = date.getDay();

    result.push({
      day: days[dayIndex],
      active: streakData.weekActivity[6 - i] || false,
      date: dateStr
    });
  }

  return result;
}
