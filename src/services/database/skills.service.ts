import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { COLLECTION_NAMES } from './collection-names';
import { getDatabase, handleDatabaseError, isDemoMode } from './base.service';
import { DEMO_STUDENT_SKILLS } from './demo-data';

const STUDENT_SKILLS_COLLECTION = COLLECTION_NAMES.STUDENT_SKILLS;

export interface StudentSkillsData {
  id: string;
  studentId: string;
  readingLevel: number;
  skills: {
    fluency: number;
    comprehension: number;
    vocabulary: number;
    grammar: number;
  };
  skillHistory: SkillHistoryEntry[];
  lastUpdated: Date;
}

export interface SkillHistoryEntry {
  level: number;
  timestamp: Date;
}

type SkillUpdates = Partial<StudentSkillsData['skills']>;

export async function findStudentSkills(
  studentId: string
): Promise<StudentSkillsData | null> {
  if (isDemoMode) {
    return createDemoSkillsData(studentId);
  }

  try {
    const database = getDatabase();

    const skillsReference = doc(
      database,
      STUDENT_SKILLS_COLLECTION,
      studentId
    );
    const skillsSnapshot = await getDoc(skillsReference);

    if (!skillsSnapshot.exists()) {
      return null;
    }

    return {
      id: skillsSnapshot.id,
      ...skillsSnapshot.data()
    } as StudentSkillsData;
  } catch (error) {
    handleDatabaseError('find student skills', error, { studentId });
  }
}

export async function updateStudentSkills(
  studentId: string,
  skillUpdates: SkillUpdates
): Promise<void> {
  try {
    const database = getDatabase();

    const skillsReference = doc(
      database,
      STUDENT_SKILLS_COLLECTION,
      studentId
    );

    await updateDoc(skillsReference, {
      skills: skillUpdates,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    handleDatabaseError('update student skills', error, { studentId });
  }
}

function createDemoSkillsData(studentId: string): StudentSkillsData {
  return {
    id: 'demo_skills',
    studentId,
    ...DEMO_STUDENT_SKILLS,
    lastUpdated: new Date()
  } as StudentSkillsData;
}
