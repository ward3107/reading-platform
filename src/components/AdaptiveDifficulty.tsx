import { useState, useEffect } from 'react';
import type { AdaptiveState } from '../utils/adaptiveDifficulty';
import { getDifficultyColor } from '../utils/adaptiveDifficulty';

interface DifficultyIndicatorProps {
  currentDifficulty: number;
  recommendedDifficulty: number;
  showRecommendation?: boolean;
}

export function DifficultyIndicator({
  currentDifficulty,
  recommendedDifficulty,
  showRecommendation = true
}: DifficultyIndicatorProps) {
  const isRecommended = recommendedDifficulty !== currentDifficulty;

  return (
    <div className="flex items-center gap-2">
      <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getDifficultyColor(currentDifficulty)}`}>
        Level {currentDifficulty}
      </span>

      {showRecommendation && isRecommended && (
        <span className="text-sm text-gray-500">
          → Try Level {recommendedDifficulty}
        </span>
      )}
    </div>
  );
}

interface PerformanceIndicatorProps {
  state: AdaptiveState;
}

export function PerformanceIndicator({ state }: PerformanceIndicatorProps) {
  const { consecutiveCorrect, recentPerformance } = state;

  const successRate = recentPerformance.length > 0
    ? Math.round((recentPerformance.filter(p => p.correct).length / recentPerformance.length) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Streak indicator */}
          {consecutiveCorrect >= 2 && (
            <div className="flex items-center gap-1 text-orange-500">
              <span className="text-xl">🔥</span>
              <span className="font-bold">{consecutiveCorrect}</span>
            </div>
          )}

          {/* Success rate */}
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  successRate >= 70 ? 'bg-green-500' :
                  successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${successRate}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{successRate}%</span>
          </div>
        </div>

        {/* Encouragement */}
        {state.encouragement && (
          <span className="text-sm text-gray-700 animate-pulse">
            {state.encouragement}
          </span>
        )}
      </div>
    </div>
  );
}

interface LevelUpNotificationProps {
  show: boolean;
  onDismiss: () => void;
  newLevel: number;
}

export function LevelUpNotification({ show, onDismiss, newLevel }: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  if (!show && !isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible && show ? 'bg-black/50' : 'bg-transparent pointer-events-none'
    }`}>
      <div className={`bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all duration-300 ${
        isVisible && show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Level Up!
        </h2>
        <p className="text-gray-600 mb-4">
          Congratulations! You're doing amazing!
        </p>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 mb-6">
          <p className="text-white text-lg font-bold">
            You reached Level {newLevel}!
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-bold hover:from-yellow-500 hover:to-orange-500 transition-all"
          >
            Awesome! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

interface LevelDownNotificationProps {
  show: boolean;
  onDismiss: () => void;
  newLevel: number;
}

export function LevelDownNotification({ show, onDismiss, newLevel }: LevelDownNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  if (!show && !isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible && show ? 'bg-black/50' : 'bg-transparent pointer-events-none'
    }`}>
      <div className={`bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all duration-300 ${
        isVisible && show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="text-6xl mb-4">💪</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Let's Practice More!
        </h2>
        <p className="text-gray-600 mb-4">
          Building a strong foundation is important. Let's practice at a comfortable level.
        </p>
        <div className="bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl p-4 mb-6">
          <p className="text-white text-lg font-bold">
            Moving to Level {newLevel}
          </p>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          This will help you learn better! You'll level up again soon. 💪
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-xl font-bold hover:from-blue-500 hover:to-cyan-500 transition-all"
          >
            Let's Go! 📚
          </button>
        </div>
      </div>
    </div>
  );
}

interface HintButtonProps {
  onShowHint: () => void;
  hintsUsed: number;
  maxHints?: number;
}

export function HintButton({ onShowHint, hintsUsed, maxHints = 3 }: HintButtonProps) {
  const hintsRemaining = maxHints - hintsUsed;

  if (hintsRemaining <= 0) return null;

  return (
    <button
      onClick={onShowHint}
      className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
    >
      <span>💡</span>
      <span>Hint ({hintsRemaining} left)</span>
    </button>
  );
}

interface HintDisplayProps {
  hint: string;
  onClose: () => void;
}

export function HintDisplay({ hint, onClose }: HintDisplayProps) {
  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <p className="text-amber-800">{hint}</p>
        </div>
        <button
          onClick={onClose}
          className="text-amber-500 hover:text-amber-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
