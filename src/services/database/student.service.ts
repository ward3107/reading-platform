import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import type { Student } from '../../types';
import { COLLECTION_NAMES } from './collection-names';
import { getDatabase, handleDatabaseError, isDemoMode } from './base.service';
import { DEMO_STUDENTS } from './demo-data';

const STUDENTS_COLLECTION = COLLECTION_NAMES.STUDENTS;
const STUDENT_SKILLS_COLLECTION = COLLECTION_NAMES.STUDENT_SKILLS;

type StudentCreationData = Omit<
  Student,
  'id' | 'totalPoints' | 'currentLevel' | 'storiesRead' | 'missionsCompleted'
>;

interface InitialStudentSkills {
  fluency: number;
  comprehension: number;
  vocabulary: number;
  grammar: number;
}

const DEFAULT_SKILLS: InitialStudentSkills = {
  fluency: 0,
  comprehension: 0,
  vocabulary: 0,
  grammar: 0
};

export async function createStudent(
  studentData: StudentCreationData
): Promise<string> {
  try {
    const database = getDatabase();

    const studentDocument = await addDoc(
      collection(database, STUDENTS_COLLECTION),
      {
        ...studentData,
        totalPoints: 0,
        currentLevel: 1,
        storiesRead: 0,
        missionsCompleted: 0,
        isActive: true,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      }
    );

    await initializeStudentSkills(studentDocument.id);

    return studentDocument.id;
  } catch (error) {
    handleDatabaseError('create student', error, {
      classId: studentData.classId
    });
  }
}

export async function findStudentById(
  studentId: string
): Promise<Student | null> {
  try {
    const database = getDatabase();

    const studentReference = doc(database, STUDENTS_COLLECTION, studentId);
    const studentSnapshot = await getDoc(studentReference);

    if (!studentSnapshot.exists()) {
      return null;
    }

    return {
      id: studentSnapshot.id,
      ...studentSnapshot.data()
    } as Student;
  } catch (error) {
    handleDatabaseError('find student by ID', error, { studentId });
  }
}

export async function findStudentsByClass(
  classId: string
): Promise<Student[]> {
  if (isDemoMode) {
    return DEMO_STUDENTS;
  }

  try {
    const database = getDatabase();

    const studentsQuery = query(
      collection(database, STUDENTS_COLLECTION),
      where('classId', '==', classId),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(studentsQuery);

    return querySnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    })) as Student[];
  } catch (error) {
    handleDatabaseError('find students by class', error, { classId });
  }
}

export async function updateStudent(
  studentId: string,
  updates: Partial<Student>
): Promise<void> {
  try {
    const database = getDatabase();

    const studentReference = doc(database, STUDENTS_COLLECTION, studentId);

    await updateDoc(studentReference, {
      ...updates,
      lastActiveAt: serverTimestamp()
    });
  } catch (error) {
    handleDatabaseError('update student', error, { studentId });
  }
}

async function initializeStudentSkills(studentId: string): Promise<void> {
  const database = getDatabase();

  const skillsReference = doc(
    database,
    STUDENT_SKILLS_COLLECTION,
    studentId
  );

  await setDoc(skillsReference, {
    studentId,
    readingLevel: 1,
    skills: DEFAULT_SKILLS,
    skillHistory: [],
    lastUpdated: serverTimestamp()
  });
}
