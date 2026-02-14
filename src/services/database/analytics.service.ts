import { findStudentsByClass } from './student.service';
import { findStudentSkills } from './skills.service';
import { handleDatabaseError, isDemoMode } from './base.service';
import { DEMO_CLASS_ANALYTICS } from './demo-data';
import type { Student } from '../../types';

export interface ClassAnalytics {
  totalStudents: number;  
  avgReadingLevel: number;
  totalPoints: number;
  activeStudents: number;
}

const DAYS_TO_CONSIDER_ACTIVE = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export async function calculateClassAnalytics(
  classId: string
): Promise<ClassAnalytics> {
  if (isDemoMode) {
    return DEMO_CLASS_ANALYTICS;
  }

  try {
    const students = await findStudentsByClass(classId);
    const studentSkills = await fetchAllStudentSkills(students.map(s => s.id));

    const totalStudents = students.length;
    const avgReadingLevel = calculateAverageReadingLevel(
      studentSkills,
      totalStudents
    );
    const totalPoints = calculateTotalPoints(students);
    const activeStudents = countActiveStudents(students);

    return {
      totalStudents,
      avgReadingLevel: roundToOneDecimal(avgReadingLevel),
      totalPoints,
      activeStudents
    };
  } catch (error) {
    handleDatabaseError('calculate class analytics', error, { classId });
  }
}

async function fetchAllStudentSkills(
  studentIds: string[]
): Promise<(Awaited<ReturnType<typeof findStudentSkills>>)[]> {
  const skillsPromises = studentIds.map((studentId) =>
    findStudentSkills(studentId)
  );

  try {
    return await Promise.all(skillsPromises);
  } catch (error) {
    console.error("Failed to fetch skills for students:", error);
    throw error;
  }
}

function calculateAverageReadingLevel(
  studentSkills: (Awaited<ReturnType<typeof findStudentSkills>>)[], // Ensure type is correctly inferred
  totalStudents: number
): number {
  if (totalStudents === 0) {
    return 0;
  }

  const totalReadingLevel = studentSkills.reduce((sum, skills) => {
    const level = skills?.readingLevel ?? 0;
    return sum + level;
  }, 0);

  return totalReadingLevel / totalStudents;
}

function calculateTotalPoints(
  students: Student[]
): number { // Ensure type is correctly inferred
  try {
    return students.reduce((sum, student) => {
    const points = student.totalPoints ?? 0;
    return sum + points;
  }, 0);
  } catch (error) {
    console.error("Failed to calculate total points:", error);
    throw error;
  }
}

function countActiveStudents(
  students: Student[] // Ensure type is correctly inferred
): number {
  const activeThreshold = Date.now() - DAYS_TO_CONSIDER_ACTIVE * MILLISECONDS_PER_DAY;
  try {
    return students.filter((student) => {
      const lastActiveTimestamp = extractLastActiveTimestamp(student);
      return lastActiveTimestamp > activeThreshold;
    }).length;
  } catch (error) {
    console.error("Failed to count active students:", error);
    throw error;
  }
}

function extractLastActiveTimestamp(
  student: Student
): number {
  const studentRecord = student as unknown as Record<string, unknown>;
  const lastActiveAt = studentRecord.lastActiveAt as { toMillis?: () => number } | undefined;

  if (lastActiveAt?.toMillis) {
    return lastActiveAt.toMillis();
  }

  return 0;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
