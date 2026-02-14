import {
  doc,
  runTransaction,
  serverTimestamp,
  increment,
  type Transaction
} from 'firebase/firestore';
import { COLLECTION_NAMES } from './collection-names';
import { getDatabase, handleDatabaseError } from './base.service';

const DAILY_MISSIONS_COLLECTION = COLLECTION_NAMES.DAILY_MISSIONS;
const STUDENTS_COLLECTION = COLLECTION_NAMES.STUDENTS;
const STUDENT_SKILLS_COLLECTION = COLLECTION_NAMES.STUDENT_SKILLS;

const SKILL_LEVEL_INCREMENT = 0.1;
const MAX_SKILL_HISTORY_ENTRIES = 20;

export async function completeMission(
  missionId: string,
  studentId: string,
  pointsEarned: number
): Promise<void> {
  try {
    const database = getDatabase();

    const missionReference = doc(
      database,
      DAILY_MISSIONS_COLLECTION,
      missionId
    );

    await runTransaction(database, async (transaction) => {
      await markMissionAsCompleted(transaction, missionReference);

      const studentReference = doc(database, STUDENTS_COLLECTION, studentId);
      await awardStudentPoints(transaction, studentReference, pointsEarned);

      const skillsReference = doc(
        database,
        STUDENT_SKILLS_COLLECTION,
        studentId
      );
      await incrementStudentReadingLevel(transaction, skillsReference);
    });
  } catch (error) {
    handleDatabaseError('complete mission', error, { missionId, studentId });
  }
}

async function markMissionAsCompleted(
  transaction: Transaction,
  missionReference: ReturnType<typeof doc>
): Promise<void> {
  transaction.update(missionReference, {
    status: 'completed',
    progress: 100,
    completedAt: serverTimestamp()
  });
}

async function awardStudentPoints(
  transaction: Transaction,
  studentReference: ReturnType<typeof doc>,
  pointsEarned: number
): Promise<void> {
  transaction.update(studentReference, {
    totalPoints: increment(pointsEarned),
    missionsCompleted: increment(1)
  });
}

async function incrementStudentReadingLevel(
  transaction: Transaction,
  skillsReference: ReturnType<typeof doc>
): Promise<void> {
  const skillsSnapshot = await transaction.get(skillsReference);

  if (!skillsSnapshot.exists()) {
    return;
  }

  const currentSkills = skillsSnapshot.data();
  const currentReadingLevel = currentSkills.readingLevel as number;
  const newReadingLevel = Math.floor(currentReadingLevel + SKILL_LEVEL_INCREMENT);
  const updatedSkillHistory = buildUpdatedSkillHistory(
    currentSkills.skillHistory as SkillHistoryRecord[],
    newReadingLevel
  );

  transaction.update(skillsReference, {
    readingLevel: newReadingLevel,
    skillHistory: updatedSkillHistory,
    lastUpdated: serverTimestamp()
  });
}

interface SkillHistoryRecord {
  level: number;
  timestamp: Date;
}

function buildUpdatedSkillHistory(
  currentHistory: SkillHistoryRecord[],
  newLevel: number
): SkillHistoryRecord[] {
  const recentHistory = currentHistory.slice(-MAX_SKILL_HISTORY_ENTRIES + 1);

  return [
    ...recentHistory,
    {
      level: newLevel,
      timestamp: new Date()
    }
  ];
}
