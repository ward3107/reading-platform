import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import type { Teacher } from '../../types';
import { COLLECTION_NAMES } from './collection-names';
import { getDatabase, handleDatabaseError, isDemoMode } from './base.service';

const TEACHERS_COLLECTION = COLLECTION_NAMES.TEACHERS;
const TEACHER_STATS_COLLECTION = COLLECTION_NAMES.TEACHER_STATS;

interface TeacherStatsUpdates {
  totalClasses?: ReturnType<typeof import('firebase/firestore').increment>;
  totalStudents?: ReturnType<typeof import('firebase/firestore').increment>;
}

export async function createTeacher(
  teacherData: Omit<Teacher, 'id'>
): Promise<string> {
  try {
    const database = getDatabase();

    const teacherDocument = await addDoc(
      collection(database, TEACHERS_COLLECTION),
      {
        ...teacherData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      }
    );

    await initializeTeacherStats(teacherDocument.id);

    return teacherDocument.id;
  } catch (error) {
    handleDatabaseError('create teacher', error, { email: teacherData.email });
  }
}

export async function findTeacherByEmail(
  email: string
): Promise<Teacher | null> {
  try {
    const database = getDatabase();

    const teacherQuery = query(
      collection(database, TEACHERS_COLLECTION),
      where('email', '==', email)
    );

    const querySnapshot = await getDocs(teacherQuery);

    if (querySnapshot.empty) {
      return null;
    }

    const teacherDocument = querySnapshot.docs[0];
    return {
      id: teacherDocument.id,
      ...teacherDocument.data()
    } as Teacher;
  } catch (error) {
    handleDatabaseError('find teacher by email', error, { email });
  }
}

export async function updateTeacher(
  teacherId: string,
  updates: Partial<Teacher>
): Promise<void> {
  try {
    const database = getDatabase();

    const teacherReference = doc(database, TEACHERS_COLLECTION, teacherId);

    await updateDoc(teacherReference, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleDatabaseError('update teacher', error, { teacherId });
  }
}

async function initializeTeacherStats(teacherId: string): Promise<void> {
  const database = getDatabase();

  const statsReference = doc(database, TEACHER_STATS_COLLECTION, teacherId);

  await setDoc(statsReference, {
    totalStudents: 0,
    totalClasses: 0,
    totalMissionsCompleted: 0,
    averageReadingLevel: 0,
    lastUpdated: serverTimestamp()
  });
}

export async function updateTeacherStats(
  teacherId: string,
  statsUpdates: TeacherStatsUpdates
): Promise<void> {
  try {
    const database = getDatabase();

    const statsReference = doc(database, TEACHER_STATS_COLLECTION, teacherId);

    await updateDoc(statsReference, {
      ...statsUpdates,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    handleDatabaseError('update teacher stats', error, { teacherId });
  }
}

export { isDemoMode };
