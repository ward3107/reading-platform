/**
 * Database Services - Barrel Export
 *
 * This module provides a unified API for all database operations.
 * Services are split by domain (Single Responsibility Principle) but
 * re-exported here for backward compatibility.
 */

// Base utilities
export { isDemoMode } from './base.service';

// Collection names
export { COLLECTION_NAMES, type CollectionName } from './collection-names';

// Error types
export {
  DatabaseError,
  EntityNotFoundError,
  DatabaseUnavailableError
} from './errors';

// Teacher operations
export {
  createTeacher,
  findTeacherByEmail,
  updateTeacher,
  updateTeacherStats
} from './teacher.service';

// Class operations
export {
  createClass,
  findClassesByTeacher,
  updateClass,
  softDeleteClass as deleteClass
} from './class.service';

// Student operations
export {
  createStudent,
  findStudentById,
  findStudentsByClass,
  updateStudent
} from './student.service';

// Mission operations
export {
  createMissionTemplate,
  assignMissionToStudent,
  findMissionsForStudent,
  updateMissionProgress,
  type MissionTemplateData
} from './mission.service';

export { completeMission } from './mission-completion.service';

// Re-export DemoMission type for backward compatibility
export type { DemoMission } from './demo-data';

// Skills operations
export {
  findStudentSkills,
  updateStudentSkills,
  type StudentSkillsData,
  type SkillHistoryEntry
} from './skills.service';

// Stats operations
export { findTeacherStats, type TeacherStats } from './stats.service';

// Analytics operations
export { calculateClassAnalytics, type ClassAnalytics } from './analytics.service';

// Cache operations
export { cacheStories, retrieveCachedStories } from './cache.service';
