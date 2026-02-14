import {
  collection,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  runTransaction,
  type Transaction
} from 'firebase/firestore';
import { COLLECTION_NAMES } from './collection-names';
import { getDatabase, handleDatabaseError, isDemoMode } from './base.service';
import { DemoMission, DEMO_MISSIONS } from './demo-data';

const MISSION_TEMPLATES_COLLECTION = COLLECTION_NAMES.MISSION_TEMPLATES;
const DAILY_MISSIONS_COLLECTION = COLLECTION_NAMES.DAILY_MISSIONS;
const MISSION_LOGS_COLLECTION = COLLECTION_NAMES.MISSION_LOGS;

export interface MissionTemplateData {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  type: string;
  targetStories: number;
  points: number;
}

interface MissionLogEntry {
  missionId: string;
  studentId: string;
  missionTemplateId: string;
  action: string;
  progress: number;
  storyId: string;
}

const MISSION_EXPIRATION_DAYS = 7;

export async function createMissionTemplate(
  templateData: MissionTemplateData
): Promise<string> {
  try {
    const database = getDatabase();

    const missionDocument = await addDoc(
      collection(database, MISSION_TEMPLATES_COLLECTION),
      {
        ...templateData,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    );

    return missionDocument.id;
  } catch (error) {
    handleDatabaseError('create mission template', error);
  }
}

export async function assignMissionToStudent(
  studentId: string,
  missionTemplateId: string
): Promise<string> {
  try {
    const database = getDatabase();

    const assignedMission = await addDoc(
      collection(database, DAILY_MISSIONS_COLLECTION),
      {
        studentId,
        missionTemplateId,
        status: 'assigned',
        progress: 0,
        assignedAt: serverTimestamp(),
        expiresAt: calculateMissionExpirationDate()
      }
    );

    return assignedMission.id;
  } catch (error) {
    handleDatabaseError('assign mission to student', error, {
      studentId,
      missionTemplateId
    });
  }
}

export async function findMissionsForStudent(
  studentId: string
): Promise<DemoMission[]> {
  if (isDemoMode) {
    return DEMO_MISSIONS;
  }

  try {
    const database = getDatabase();

    const missionsQuery = query(
      collection(database, DAILY_MISSIONS_COLLECTION),
      where('studentId', '==', studentId),
      where('status', 'in', ['assigned', 'in_progress']),
      orderBy('assignedAt', 'desc')
    );

    const querySnapshot = await getDocs(missionsQuery);

    return querySnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data()
    })) as DemoMission[];
  } catch (error) {
    handleDatabaseError('find missions for student', error, { studentId });
  }
}

export async function updateMissionProgress(
  missionId: string,
  progressPercentage: number,
  completedStoryId: string
): Promise<void> {
  try {
    const database = getDatabase();

    const missionReference = doc(
      database,
      DAILY_MISSIONS_COLLECTION,
      missionId
    );

    await runTransaction(database, async (transaction) => {
      const missionSnapshot = await transaction.get(missionReference);

      if (!missionSnapshot.exists()) {
        throw new Error('Mission does not exist');
      }

      const missionData = missionSnapshot.data();
      const missionStatus = determineMissionStatus(progressPercentage);

      transaction.update(missionReference, {
        progress: progressPercentage,
        status: missionStatus,
        ...(missionStatus === 'completed' && { completedAt: serverTimestamp() }),
        updatedAt: serverTimestamp()
      });

      await logMissionProgress(transaction, {
        missionId,
        studentId: missionData.studentId,
        missionTemplateId: missionData.missionTemplateId,
        action: 'progress_update',
        progress: progressPercentage,
        storyId: completedStoryId
      });
    });
  } catch (error) {
    handleDatabaseError('update mission progress', error, { missionId });
  }
}

function calculateMissionExpirationDate(): Date {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return new Date(Date.now() + MISSION_EXPIRATION_DAYS * millisecondsPerDay);
}

function determineMissionStatus(
  progressPercentage: number
): 'assigned' | 'in_progress' | 'completed' {
  if (progressPercentage >= 100) {
    return 'completed';
  }
  if (progressPercentage > 0) {
    return 'in_progress';
  }
  return 'assigned';
}

async function logMissionProgress(
  transaction: Transaction,
  logEntry: MissionLogEntry
): Promise<void> {
  const database = getDatabase();
  const logReference = doc(collection(database, MISSION_LOGS_COLLECTION));

  transaction.set(logReference, {
    ...logEntry,
    timestamp: serverTimestamp()
  });
}
