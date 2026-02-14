/**
 * Firestore Services - Legacy Re-export
 *
 * This file re-exports all database services from the modular service files.
 * Maintained for backward compatibility with existing imports.
 *
 * For new code, import directly from './database' instead.
 */

import {
  isDemoMode as checkIsDemoMode,
  COLLECTION_NAMES,
  createTeacher,
  findTeacherByEmail,
  updateTeacher,
  updateTeacherStats,
  createClass,
  findClassesByTeacher,
  updateClass,
  deleteClass,
  createStudent,
  findStudentById,
  findStudentsByClass,
  updateStudent,
  createMissionTemplate,
  assignMissionToStudent,
  findMissionsForStudent,
  updateMissionProgress,
  completeMission,
  findStudentSkills,
  updateStudentSkills,
  findTeacherStats,
  calculateClassAnalytics,
  cacheStories,
  retrieveCachedStories,
  type MissionTemplateData,
  type DemoMission,
  type StudentSkillsData,
  type TeacherStats,
  type ClassAnalytics
} from './database';

// Re-export all items
export {
  COLLECTION_NAMES,
  createTeacher,
  updateTeacher,
  updateTeacherStats,
  createClass,
  updateClass,
  deleteClass,
  createStudent,
  updateStudent,
  createMissionTemplate,
  assignMissionToStudent,
  updateMissionProgress,
  completeMission,
  updateStudentSkills,
  cacheStories,
  type MissionTemplateData,
  type DemoMission,
  type TeacherStats
};

// Backward-compatible aliases for renamed functions
export const isDemoMode = checkIsDemoMode;
export const getTeacherByEmail = findTeacherByEmail;
export const getClassesByTeacher = findClassesByTeacher;
export const getStudentById = findStudentById;
export const getStudentsByClass = findStudentsByClass;
export const getMissionsForStudent = findMissionsForStudent;
export const getStudentSkills = findStudentSkills;
export const getTeacherStats = findTeacherStats;
export const getClassAnalytics = calculateClassAnalytics;
export const getCachedStories = retrieveCachedStories;

// Re-export types that may be needed
export type { StudentSkillsData, ClassAnalytics };
