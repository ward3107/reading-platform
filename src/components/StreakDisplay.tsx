import type { StreakData, StreakReward } from '../utils/dailyStreaks';
import {
  getStreakEmoji,
  getStreakMessage,
  getWeekActivityDisplay,
  STREAK_REWARDS
} from '../utils/dailyStreaks';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StreakBadge({ streak, size = 'md', showLabel = true }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  const emojiSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  if (streak === 0) return null;

  return (
    <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold shadow-lg shadow-orange-500/30 ${sizeClasses[size]}`}>
      <span className={emojiSize[size]}>{getStreakEmoji(streak)}</span>
      {showLabel && <span>{streak} day{streak !== 1 ? 's' : ''}</span>}
    </div>
  );
}

interface StreakDisplayProps {
  streakData: StreakData;
  onRecordActivity?: () => void;
}

export function StreakDisplay({ streakData }: StreakDisplayProps) {
  const message = getStreakMessage(streakData);
  const weekActivity = getWeekActivityDisplay(streakData);

  const messageColors = {
    encouragement: 'from-emerald-500 to-teal-600',
    warning: 'from-orange-500 to-red-500',
    celebration: 'from-purple-500 to-pink-500',
    neutral: 'from-slate-500 to-slate-600'
  };

  return (
    <div className={`bg-gradient-to-r ${messageColors[message.type]} rounded-2xl p-5 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{getStreakEmoji(streakData.currentStreak)}</div>
          <div>
            <p className="font-bold text-xl">{message.message}</p>
            <p className="text-sm opacity-90">{message.subMessage}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{streakData.currentStreak}</p>
          <p className="text-xs opacity-80">Best: {streakData.longestStreak}</p>
        </div>
      </div>

      {/* Week Activity */}
      <div className="flex justify-between items-center bg-white rounded-xl p-3">
        {weekActivity.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="text-xs text-gray-700 font-bold mb-1">{day.day}</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                day.active
                  ? 'bg-emerald-500 text-white shadow-lg font-bold'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {day.active ? '✓' : '·'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StreakWarningProps {
  streak: number;
  onPractice: () => void;
  onDismiss: () => void;
}

export function StreakWarning({ streak, onPractice, onDismiss }: StreakWarningProps) {
  return (
    <div className="fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-96 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-5 text-white shadow-xl z-40 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="text-3xl">🔥</div>
        <div className="flex-1">
          <p className="font-bold text-lg">Don't break your streak!</p>
          <p className="text-sm opacity-90">
            You're at {streak} days! Practice now to keep it going.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onPractice}
          className="flex-1 py-2 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-100 transition-colors"
        >
          Practice Now!
        </button>
      </div>
    </div>
  );
}

interface StreakRewardNotificationProps {
  rewards: StreakReward[];
  onClaim: (streakRequired: number) => void;
  onClose: () => void;
}

export function StreakRewardNotification({
  rewards,
  onClaim,
  onClose
}: StreakRewardNotificationProps) {
  if (rewards.length === 0) return null;

  const reward = rewards[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎁</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Streak Reward!
        </h2>
        <p className="text-gray-600 mb-4">
          You've earned a reward for your {reward.streakRequired} day streak!
        </p>

        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 mb-6">
          {reward.rewardType === 'points' ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">⭐</span>
              <span className="text-2xl font-bold text-orange-600">
                +{reward.rewardValue} Points!
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">🏆</span>
              <span className="text-xl font-bold text-purple-600">
                New Badge: {String(reward.rewardValue).replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onClaim(reward.streakRequired);
              onClose();
            }}
            className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-bold hover:from-yellow-500 hover:to-orange-500 transition-all"
          >
            Claim Reward! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}

interface StreakMilestonesProps {
  streakData: StreakData;
  onClaim: (streakRequired: number) => void;
}

export function StreakMilestones({ streakData, onClaim }: StreakMilestonesProps) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>🏆</span>
        <span>Streak Milestones</span>
      </h3>

      <div className="space-y-3">
        {STREAK_REWARDS.map((milestone) => {
          const achieved = streakData.currentStreak >= milestone.streakRequired;
          const claimed = streakData.rewards.find(
            r => r.streakRequired === milestone.streakRequired
          )?.claimed;

          return (
            <div
              key={milestone.streakRequired}
              className={`flex items-center justify-between p-3 rounded-lg ${
                achieved
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  achieved ? 'bg-orange-100' : 'bg-gray-200'
                }`}>
                  {milestone.rewardType === 'points' ? '⭐' : '🏆'}
                </div>
                <div>
                  <p className={`font-medium ${achieved ? 'text-gray-800' : 'text-gray-500'}`}>
                    {milestone.streakRequired} Day Streak
                  </p>
                  <p className="text-sm text-gray-500">
                    {milestone.rewardType === 'points'
                      ? `+${milestone.rewardValue} points`
                      : `${String(milestone.rewardValue).replace(/_/g, ' ')} badge`}
                  </p>
                </div>
              </div>

              {achieved && !claimed && (
                <button
                  onClick={() => onClaim(milestone.streakRequired)}
                  className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Claim!
                </button>
              )}
              {claimed && (
                <span className="text-green-600 text-sm font-medium">✓ Claimed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
