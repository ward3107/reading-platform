import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import type { Class } from '../../types';
import { COLLECTION_NAMES } from './collection-names';
import { getDatabase, handleDatabaseError, isDemoMode } from './base.service';
import { updateTeacherStats } from './teacher.service';
import { DEMO_CLASSES } from './demo-data';

const CLASSES_COLLECTION = COLLECTION_NAMES.CLASSES;

type ClassCreationData = Omit<Class, 'id' | 'teacherId'>;

export async function createClass(
  teacherId: string,
  classData: ClassCreationData
): Promise<string> {
  try {
    const database = getDatabase();

    const classDocument = await addDoc(
      collection(database, CLASSES_COLLECTION),
      {
        ...classData,
        teacherId,
        studentCount: 0,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );

    await updateTeacherStats(teacherId, { totalClasses: increment(1) });

    return classDocument.id;
  } catch (error) {
    handleDatabaseError('create class', error, { teacherId });
  }
}

export async function findClassesByTeacher(
  teacherId: string
): Promise<Class[]> {
  if (isDemoMode) {
    return DEMO_CLASSES;
  }

  try {
    const database = getDatabase();

    const classesQuery = query(
      collection(database, CLASSES_COLLECTION),
      where('teacherId', '==', teacherId),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(classesQuery);

    return querySnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    })) as Class[];
  } catch (error) {
    handleDatabaseError('find classes by teacher', error, { teacherId });
  }
}

export async function updateClass(
  classId: string,
  updates: Partial<Class>
): Promise<void> {
  try {
    const database = getDatabase();

    const classReference = doc(database, CLASSES_COLLECTION, classId);

    await updateDoc(classReference, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleDatabaseError('update class', error, { classId });
  }
}

export async function softDeleteClass(classId: string): Promise<void> {
  try {
    const database = getDatabase();

    const classReference = doc(database, CLASSES_COLLECTION, classId);

    await updateDoc(classReference, {
      isActive: false,
      deletedAt: serverTimestamp()
    });
  } catch (error) {
    handleDatabaseError('soft delete class', error, { classId });
  }
}
