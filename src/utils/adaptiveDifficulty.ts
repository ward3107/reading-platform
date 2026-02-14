import type { Student } from '../types';

/**
 * Adaptive Difficulty System
 * Adjusts story/mission difficulty based on student performance
 */

export interface PerformanceRecord {
  timestamp: string;
  storyId: string;
  difficulty: number;
  correct: boolean;
  responseTimeMs: number;
  hintsUsed: number;
}

export interface AdaptiveState {
  currentDifficulty: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  recentPerformance: PerformanceRecord[];
  recommendedDifficulty: number;
  showHint: boolean;
  encouragement: string | null;
}

const MAX_DIFFICULTY = 5;
const MIN_DIFFICULTY = 1;
const PERFORMANCE_WINDOW = 10; // Look at last 10 answers
const STREAK_THRESHOLD = 3; // 3 in a row triggers adjustment

/**
 * Update adaptive state based on answer
 */
export function updateAdaptiveState(
  state: AdaptiveState,
  record: PerformanceRecord
): AdaptiveState {
  const newPerformance = [...state.recentPerformance, record].slice(-PERFORMANCE_WINDOW);

  let consecutiveCorrect = state.consecutiveCorrect;
  let consecutiveIncorrect = state.consecutiveIncorrect;

  if (record.correct) {
    consecutiveCorrect++;
    consecutiveIncorrect = 0;
  } else {
    consecutiveIncorrect++;
    consecutiveCorrect = 0;
  }

  // Calculate recommended difficulty
  let recommendedDifficulty = state.currentDifficulty;

  // Increase difficulty after streak of correct answers
  if (consecutiveCorrect >= STREAK_THRESHOLD) {
    recommendedDifficulty = Math.min(MAX_DIFFICULTY, state.currentDifficulty + 1);
  }
  // Decrease difficulty after streak of incorrect answers
  else if (consecutiveIncorrect >= STREAK_THRESHOLD) {
    recommendedDifficulty = Math.max(MIN_DIFFICULTY, state.currentDifficulty - 1);
  }

  // Also consider recent performance rate
  const recentCorrect = newPerformance.filter(p => p.correct).length;
  const successRate = newPerformance.length > 0 ? recentCorrect / newPerformance.length : 0.5;

  if (successRate > 0.85 && newPerformance.length >= 5) {
    // Doing very well - suggest higher difficulty
    recommendedDifficulty = Math.min(MAX_DIFFICULTY, Math.max(recommendedDifficulty, state.currentDifficulty + 1));
  } else if (successRate < 0.5 && newPerformance.length >= 5) {
    // Struggling - suggest lower difficulty
    recommendedDifficulty = Math.max(MIN_DIFFICULTY, Math.min(recommendedDifficulty, state.currentDifficulty - 1));
  }

  // Determine if hint should be shown
  const showHint = consecutiveIncorrect >= 2 || (successRate < 0.4 && newPerformance.length >= 3);

  // Generate encouragement message
  const encouragement = generateEncouragement(consecutiveCorrect, consecutiveIncorrect, successRate);

  return {
    currentDifficulty: state.currentDifficulty,
    consecutiveCorrect,
    consecutiveIncorrect,
    recentPerformance: newPerformance,
    recommendedDifficulty,
    showHint,
    encouragement
  };
}

/**
 * Generate encouragement message based on performance
 */
function generateEncouragement(
  consecutiveCorrect: number,
  consecutiveIncorrect: number,
  successRate: number
): string | null {
  if (consecutiveCorrect >= 5) {
    return "🔥 Amazing streak! You're on fire!";
  }
  if (consecutiveCorrect >= 3) {
    return "⭐ Great job! Keep it up!";
  }
  if (consecutiveIncorrect >= 3) {
    return "💪 Don't give up! Try an easier story to build confidence.";
  }
  if (consecutiveIncorrect >= 2) {
    return "💡 Tip: Take your time to read the story carefully.";
  }
  if (successRate > 0.9) {
    return "🚀 You're ready for a challenge! Try a harder story.";
  }
  return null;
}

/**
 * Create initial adaptive state
 */
export function createInitialAdaptiveState(studentLevel: number): AdaptiveState {
  return {
    currentDifficulty: studentLevel,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    recentPerformance: [],
    recommendedDifficulty: studentLevel,
    showHint: false,
    encouragement: null
  };
}

/**
 * Get difficulty label
 */
export function getDifficultyLabel(difficulty: number): string {
  const labels = {
    1: 'Beginner',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Expert'
  };
  return labels[difficulty as keyof typeof labels] || 'Unknown';
}

/**
 * Get difficulty color class
 */
export function getDifficultyColor(difficulty: number): string {
  const colors = {
    1: 'bg-green-100 text-green-700 border-green-300',
    2: 'bg-lime-100 text-lime-700 border-lime-300',
    3: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    4: 'bg-orange-100 text-orange-700 border-orange-300',
    5: 'bg-red-100 text-red-700 border-red-300'
  };
  return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-300';
}

/**
 * Get recommended stories based on adaptive state
 */
export function getRecommendedStories(
  allStories: Array<{ id: string; difficulty: number }>,
  state: AdaptiveState
): Array<{ id: string; difficulty: number; recommended: boolean }> {
  const targetDifficulty = state.recommendedDifficulty;

  return allStories.map(story => ({
    ...story,
    recommended: story.difficulty === targetDifficulty
  })).sort((a, b) => {
    // Recommended stories first
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    // Then by difficulty proximity to target
    const aDiff = Math.abs(a.difficulty - targetDifficulty);
    const bDiff = Math.abs(b.difficulty - targetDifficulty);
    return aDiff - bDiff;
  });
}

/**
 * Calculate if student should level up
 */
export function shouldLevelUp(state: AdaptiveState): boolean {
  if (state.currentDifficulty >= MAX_DIFFICULTY) return false;

  const recentCorrect = state.recentPerformance.filter(p => p.correct).length;
  const total = state.recentPerformance.length;

  // Level up if 80% success rate over last 10 questions and on a streak
  return total >= PERFORMANCE_WINDOW &&
    (recentCorrect / total) >= 0.8 &&
    state.consecutiveCorrect >= 3;
}

/**
 * Calculate if student should level down
 */
export function shouldLevelDown(state: AdaptiveState): boolean {
  if (state.currentDifficulty <= MIN_DIFFICULTY) return false;

  const recentCorrect = state.recentPerformance.filter(p => p.correct).length;
  const total = state.recentPerformance.length;

  // Level down if less than 40% success rate
  return total >= 5 && (recentCorrect / total) < 0.4;
}

/**
 * Get hint for current question
 */
export function getHint(
  questionType: 'comprehension' | 'vocabulary' | 'translation',
  storyText?: string
): string {
  const hints = {
    comprehension: [
      "💡 Read the story again carefully. The answer is usually in the text!",
      "💡 Think about the main idea of the story.",
      "💡 What happened first, middle, and last in the story?"
    ],
    vocabulary: [
      "💡 Look at how the word is used in the sentence.",
      "💡 Think about similar words you know.",
      "💡 The word might be related to a word in Hebrew you know."
    ],
    translation: [
      "💡 Break the sentence into smaller parts.",
      "💡 Look for words you already know.",
      "💡 Try to understand the main idea first."
    ]
  };

  const typeHints = hints[questionType];
  return typeHints[Math.floor(Math.random() * typeHints.length)];
}
