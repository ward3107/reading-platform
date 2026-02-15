import type { VocabularyProgress } from '../types';

/**
 * Spaced Repetition System (SRS) based on SM-2 Algorithm
 * Used to schedule vocabulary reviews at optimal intervals
 */

/**
 * Calculate the next review date based on performance
 */
export function calculateNextReview(
  progress: VocabularyProgress,
  quality: 0 | 1 | 2 | 3 | 4 | 5 // 0-5 scale: 0=complete failure, 5=perfect recall
): VocabularyProgress {
  let { easeFactor, interval, timesReviewed, timesCorrect, timesIncorrect } = progress;

  // Update review counts
  timesReviewed += 1;
  if (quality >= 3) {
    timesCorrect += 1;
  } else {
    timesIncorrect += 1;
  }

  // Calculate new ease factor (SM-2 formula)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = Math.max(
    1.3, // Minimum ease factor
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate new interval
  if (quality < 3) {
    // Failed - reset to learning mode
    interval = 1;
  } else if (timesReviewed === 1) {
    interval = 1;
  } else if (timesReviewed === 2) {
    interval = 3;
  } else {
    interval = Math.round(interval * easeFactor);
  }

  // Determine status
  let status: VocabularyProgress['status'] = 'learning';
  if (timesReviewed >= 5 && timesCorrect / timesReviewed >= 0.9) {
    status = 'mastered';
  } else if (timesReviewed >= 3) {
    status = 'review';
  } else if (interval >= 30) {
    status = 'mastered';
  }

  const now = new Date();
  const nextReviewAt = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    ...progress,
    timesReviewed,
    timesCorrect,
    timesIncorrect,
    easeFactor,
    interval,
    status,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReviewAt.toISOString()
  };
}

/**
 * Get words due for review today
 */
export function getWordsForReview(
  allProgress: VocabularyProgress[],
  maxWords: number = 20
): VocabularyProgress[] {
  const now = new Date();

  // Sort by priority: overdue first, then by ease factor (harder words first)
  const dueWords = allProgress
    .filter(p => new Date(p.nextReviewAt) <= now)
    .sort((a, b) => {
      // Overdue words come first
      const aOverdue = now.getTime() - new Date(a.nextReviewAt).getTime();
      const bOverdue = now.getTime() - new Date(b.nextReviewAt).getTime();

      if (aOverdue > bOverdue) return -1;
      if (aOverdue < bOverdue) return 1;

      // Then by ease factor (lower = harder = more priority)
      return a.easeFactor - b.easeFactor;
    });

  // Include some new words if we don't have enough due words
  if (dueWords.length < maxWords) {
    const newWords = allProgress
      .filter(p => p.status === 'new' && !dueWords.includes(p))
      .slice(0, maxWords - dueWords.length);
    dueWords.push(...newWords);
  }

  return dueWords.slice(0, maxWords);
}

/**
 * Get study statistics
 */
export function getStudyStats(progress: VocabularyProgress[]) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const studiedToday = progress.filter(
    p => p.lastReviewedAt && p.lastReviewedAt.split('T')[0] === today
  );

  return {
    totalWords: progress.length,
    newWords: progress.filter(p => p.status === 'new').length,
    learningWords: progress.filter(p => p.status === 'learning').length,
    reviewWords: progress.filter(p => p.status === 'review').length,
    masteredWords: progress.filter(p => p.status === 'mastered').length,
    dueToday: progress.filter(p => new Date(p.nextReviewAt) <= now).length,
    studiedToday: studiedToday.length,
    accuracyToday: studiedToday.length > 0
      ? Math.round(
          (studiedToday.reduce((sum, p) => sum + p.timesCorrect, 0) /
            studiedToday.reduce((sum, p) => sum + p.timesReviewed, 0)) *
            100
        )
      : 0
  };
}

/**
 * Create initial progress for a new word
 */
export function createNewProgress(
  wordId: string,
  studentId: string
): VocabularyProgress {
  const now = new Date();
  return {
    wordId,
    studentId,
    timesReviewed: 0,
    timesCorrect: 0,
    timesIncorrect: 0,
    lastReviewedAt: null,
    nextReviewAt: now.toISOString(),
    easeFactor: 2.5,
    interval: 0,
    status: 'new'
  };
}

/**
 * Get interval label for display
 */
export function getIntervalLabel(interval: number): string {
  if (interval === 0) return 'New';
  if (interval === 1) return '1 day';
  if (interval < 7) return `${interval} days`;
  if (interval < 30) {
    const weeks = Math.round(interval / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  const months = Math.round(interval / 30);
  return `${months} month${months > 1 ? 's' : ''}`;
}
