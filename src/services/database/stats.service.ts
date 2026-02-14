import { doc, getDoc } from 'firebase/firestore';
import { COLLECTION_NAMES } from './collection-names';
import { getDatabase, handleDatabaseError, isDemoMode } from './base.service';
import { DEMO_TEACHER_STATS } from './demo-data';

const TEACHER_STATS_COLLECTION = COLLECTION_NAMES.TEACHER_STATS;

export interface TeacherStats {
  totalStudents: number;
  totalClasses: number;
  totalMissionsCompleted: number;
  averageReadingLevel: number;
}

const EMPTY_STATS: TeacherStats = {
  totalStudents: 0,
  totalClasses: 0,
  totalMissionsCompleted: 0,
  averageReadingLevel: 0
};

export async function findTeacherStats(
  teacherId: string
): Promise<TeacherStats> {
  if (isDemoMode) {
    return DEMO_TEACHER_STATS;
  }

  try {
    const database = getDatabase();

    const statsReference = doc(
      database,
      TEACHER_STATS_COLLECTION,
      teacherId
    );
    const statsSnapshot = await getDoc(statsReference);

    if (!statsSnapshot.exists()) {
      return EMPTY_STATS;
    }

    return statsSnapshot.data() as TeacherStats;
  } catch (error) {
    handleDatabaseError('find teacher stats', error, { teacherId });
  }
}
