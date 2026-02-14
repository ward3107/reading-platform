import { useState, useCallback, useEffect } from 'react';
import type { Student } from '../types';
import {
  AdaptiveState,
  PerformanceRecord,
  createInitialAdaptiveState,
  updateAdaptiveState,
  shouldLevelUp,
  shouldLevelDown,
  getHint
} from '../utils/adaptiveDifficulty';

interface UseAdaptiveDifficultyReturn {
  state: AdaptiveState;
  recordAnswer: (storyId: string, correct: boolean, responseTimeMs?: number, hintsUsed?: number) => void;
  showLevelUp: boolean;
  showLevelDown: boolean;
  dismissLevelUp: () => void;
  dismissLevelDown: () => void;
  getHintForQuestion: (type: 'comprehension' | 'vocabulary' | 'translation') => string;
  currentDifficulty: number;
  recommendedDifficulty: number;
}

export function useAdaptiveDifficulty(student: Student): UseAdaptiveDifficultyReturn {
  const [state, setState] = useState<AdaptiveState>(() =>
    createInitialAdaptiveState(student.currentLevel || 1)
  );

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showLevelDown, setShowLevelDown] = useState(false);

  // Sync with student level changes
  useEffect(() => {
    if (student.currentLevel && student.currentLevel !== state.currentDifficulty) {
      setState(prev => ({
        ...prev,
        currentDifficulty: student.currentLevel,
        recommendedDifficulty: student.currentLevel
      }));
    }
  }, [student.currentLevel, state.currentDifficulty]);

  const recordAnswer = useCallback((
    storyId: string,
    correct: boolean,
    responseTimeMs: number = 5000,
    hintsUsed: number = 0
  ) => {
    const record: PerformanceRecord = {
      timestamp: new Date().toISOString(),
      storyId,
      difficulty: state.currentDifficulty,
      correct,
      responseTimeMs,
      hintsUsed
    };

    setState(prev => {
      const newState = updateAdaptiveState(prev, record);

      // Check for level up/down
      if (shouldLevelUp(newState) && newState.currentDifficulty < 5) {
        setShowLevelUp(true);
      } else if (shouldLevelDown(newState) && newState.currentDifficulty > 1) {
        setShowLevelDown(true);
      }

      return newState;
    });
  }, [state.currentDifficulty]);

  const dismissLevelUp = useCallback(() => {
    setShowLevelUp(false);
    // Actually level up
    setState(prev => ({
      ...prev,
      currentDifficulty: Math.min(5, prev.currentDifficulty + 1),
      recommendedDifficulty: Math.min(5, prev.currentDifficulty + 1),
      consecutiveCorrect: 0
    }));
  }, []);

  const dismissLevelDown = useCallback(() => {
    setShowLevelDown(false);
    // Actually level down
    setState(prev => ({
      ...prev,
      currentDifficulty: Math.max(1, prev.currentDifficulty - 1),
      recommendedDifficulty: Math.max(1, prev.currentDifficulty - 1),
      consecutiveIncorrect: 0
    }));
  }, []);

  const getHintForQuestion = useCallback((
    type: 'comprehension' | 'vocabulary' | 'translation'
  ) => {
    return getHint(type);
  }, []);

  return {
    state,
    recordAnswer,
    showLevelUp,
    showLevelDown,
    dismissLevelUp,
    dismissLevelDown,
    getHintForQuestion,
    currentDifficulty: state.currentDifficulty,
    recommendedDifficulty: state.recommendedDifficulty
  };
}
