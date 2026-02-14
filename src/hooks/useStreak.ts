import { useState, useCallback, useEffect } from 'react';
import type { StreakData, StreakReward } from '../utils/dailyStreaks';
import {
  createInitialStreakData,
  recordActivity,
  getUnclaimedRewards,
  claimReward,
  wasActiveToday,
  isStreakAtRisk,
  getStreakMessage,
  calculateDailyBonus
} from '../utils/dailyStreaks';

interface UseStreakReturn {
  streakData: StreakData;
  recordDailyActivity: () => void;
  claimStreakReward: (streakRequired: number) => void;
  unclaimedRewards: StreakReward[];
  isActiveToday: boolean;
  isAtRisk: boolean;
  streakMessage: ReturnType<typeof getStreakMessage>;
  dailyBonus: number;
}

const STREAK_STORAGE_KEY = 'kriakids_streak_data';

export function useStreak(studentId: string): UseStreakReturn {
  const [streakData, setStreakData] = useState<StreakData>(() => {
    // Load from localStorage (in production, this would be Firestore)
    try {
      const stored = localStorage.getItem(`${STREAK_STORAGE_KEY}_${studentId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load streak data:', e);
    }
    return createInitialStreakData();
  });

  // Save to localStorage whenever streakData changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STREAK_STORAGE_KEY}_${studentId}`, JSON.stringify(streakData));
    } catch (e) {
      console.error('Failed to save streak data:', e);
    }
  }, [streakData, studentId]);

  const recordDailyActivity = useCallback(() => {
    setStreakData(prev => recordActivity(prev));
  }, []);

  const claimStreakReward = useCallback((streakRequired: number) => {
    setStreakData(prev => claimReward(prev, streakRequired));
  }, []);

  const unclaimedRewards = getUnclaimedRewards(streakData);
  const isActiveToday = wasActiveToday(streakData);
  const isAtRisk = isStreakAtRisk(streakData);
  const streakMessage = getStreakMessage(streakData);
  const dailyBonus = calculateDailyBonus(streakData);

  return {
    streakData,
    recordDailyActivity,
    claimStreakReward,
    unclaimedRewards,
    isActiveToday,
    isAtRisk,
    streakMessage,
    dailyBonus
  };
}
