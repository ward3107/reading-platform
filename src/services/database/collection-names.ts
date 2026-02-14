/**
 * Firestore collection name constants.
 * Centralized to ensure consistency across all services.
 */
export const COLLECTION_NAMES = {
  TEACHERS: 'teachers',
  CLASSES: 'classes',
  STUDENTS: 'students',
  MISSION_TEMPLATES: 'mission_templates',
  MISSION_LOGS: 'mission_logs',
  STUDENT_SKILLS: 'student_skills',
  DAILY_MISSIONS: 'daily_missions',
  TEACHER_STATS: 'teacher_stats',
  CONTENT_CACHE: 'content_cache',
  PENDING_SYNC: 'pending_sync'
} as const;

export type CollectionName = typeof COLLECTION_NAMES[keyof typeof COLLECTION_NAMES];
