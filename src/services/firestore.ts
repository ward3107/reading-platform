import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  serverTimestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Teacher,
  Student,
  Class,
  StudentSkills
} from '../types';

// ============= DEMO MODE CHECK =============
let isDemoMode = false;

// Check if Firebase is properly configured
try {
  if (!db || !db.app) {
    isDemoMode = true;
  }
} catch (e) {
  isDemoMode = true;
}

// Demo data
const demoClasses: Class[] = [
  {
    id: 'demo_class_1',
    name: 'כיתה א׳',
    nameEn: 'Class A',
    grade: '7',
    teacherId: 'demo_teacher',
    studentCount: 3,
    isActive: true,
    analytics: {
      totalStudents: 3,
      avgReadingLevel: 2.3,
      totalPoints: 450,
      activeStudents: 3
    }
  }
];

const demoStudents: Student[] = [
  {
    id: 'demo_student_1',
    name: 'דניאל כהן',
    studentId: '12345',
    classId: 'demo_class_1',
    totalPoints: 150,
    currentLevel: 2,
    storiesRead: 12,
    missionsCompleted: 3,
    isActive: true
  },
  {
    id: 'demo_student_2',
    name: 'מאיה לוי',
    studentId: '12346',
    classId: 'demo_class_1',
    totalPoints: 200,
    currentLevel: 3,
    storiesRead: 18,
    missionsCompleted: 5,
    isActive: true
  },
  {
    id: 'demo_student_3',
    name: 'יוסי אברהם',
    studentId: '12347',
    classId: 'demo_class_1',
    totalPoints: 100,
    currentLevel: 1,
    storiesRead: 8,
    missionsCompleted: 2,
    isActive: true
  }
];

interface DemoMission {
  id: string;
  title: string;
  titleEn: string;
  type: string;
  targetStories: number;
  points: number;
  status: string;
  progress: number;
  assignedTo: number;
  completedBy: number;
}

const demoMissions: DemoMission[] = [
  {
    id: 'demo_mission_1',
    title: 'משימת קריאה יומית',
    titleEn: 'Daily Reading Mission',
    type: 'reading',
    targetStories: 3,
    points: 100,
    status: 'in_progress',
    progress: 33,
    assignedTo: 3,
    completedBy: 1
  }
];

// ============= COLLECTION NAMES =============
const COLLECTIONS = {
  TEACHERS: 'teachers',
  CLASSES: 'classes',
  STUDENTS: 'students',
  MISSION_TEMPLATES: 'mission_templates',
  MISSION_LOGS: 'mission_logs',
  STUDENT_SKILLS: 'student_skills',
  DAILY_MISSIONS: 'daily_missions',
  TEACHER_STATS: 'teacher_stats',
  CONTENT_CACHE: 'content_cache',
  PENDING_SYNC: 'pending_sync'
} as const;

// ============= TEACHER OPERATIONS =============

export async function createTeacher(teacherData: Omit<Teacher, 'id'>): Promise<string> {
  const teacherRef = await addDoc(collection(db, COLLECTIONS.TEACHERS), {
    ...teacherData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true
  });

  // Initialize teacher stats
  await setDoc(doc(db, COLLECTIONS.TEACHER_STATS, teacherRef.id), {
    totalStudents: 0,
    totalClasses: 0,
    totalMissionsCompleted: 0,
    averageReadingLevel: 0,
    lastUpdated: serverTimestamp()
  });

  return teacherRef.id;
}

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  const q = query(
    collection(db, COLLECTIONS.TEACHERS),
    where('email', '==', email)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnapshot = snapshot.docs[0];
  return { id: docSnapshot.id, ...docSnapshot.data() } as Teacher;
}

export async function updateTeacher(teacherId: string, updates: Partial<Teacher>): Promise<void> {
  const teacherRef = doc(db, COLLECTIONS.TEACHERS, teacherId);
  await updateDoc(teacherRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

// ============= CLASS OPERATIONS =============

export async function createClass(teacherId: string, classData: Omit<Class, 'id' | 'teacherId'>): Promise<string> {
  const classRef = await addDoc(collection(db, COLLECTIONS.CLASSES), {
    ...classData,
    teacherId,
    studentCount: 0,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Update teacher stats
  await updateTeacherStats(teacherId, { totalClasses: increment(1) });

  return classRef.id;
}

export async function getClassesByTeacher(teacherId: string): Promise<Class[]> {
  if (isDemoMode) {
    return demoClasses;
  }
  const q = query(
    collection(db, COLLECTIONS.CLASSES),
    where('teacherId', '==', teacherId),
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Class[];
}

export async function updateClass(classId: string, updates: Partial<Class>): Promise<void> {
  const classRef = doc(db, COLLECTIONS.CLASSES, classId);
  await updateDoc(classRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function deleteClass(classId: string): Promise<void> {
  const classRef = doc(db, COLLECTIONS.CLASSES, classId);
  await updateDoc(classRef, {
    isActive: false,
    deletedAt: serverTimestamp()
  });
}

// ============= STUDENT OPERATIONS =============

export async function createStudent(studentData: Omit<Student, 'id' | 'totalPoints' | 'currentLevel' | 'storiesRead' | 'missionsCompleted'>): Promise<string> {
  const studentRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
    ...studentData,
    totalPoints: 0,
    currentLevel: 1,
    storiesRead: 0,
    missionsCompleted: 0,
    isActive: true,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp()
  });

  // Initialize student skills
  await setDoc(doc(db, COLLECTIONS.STUDENT_SKILLS, studentRef.id), {
    studentId: studentRef.id,
    readingLevel: 1,
    skills: {
      fluency: 0,
      comprehension: 0,
      vocabulary: 0,
      grammar: 0
    },
    skillHistory: [],
    lastUpdated: serverTimestamp()
  });

  return studentRef.id;
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  const docRef = doc(db, COLLECTIONS.STUDENTS, studentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Student;
}

export async function getStudentsByClass(classId: string): Promise<Student[]> {
  if (isDemoMode) {
    return demoStudents;
  }
  const q = query(
    collection(db, COLLECTIONS.STUDENTS),
    where('classId', '==', classId),
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
}

export async function updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
  const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
  await updateDoc(studentRef, {
    ...updates,
    lastActiveAt: serverTimestamp()
  });
}

// ============= MISSION OPERATIONS =============

export interface MissionTemplateData {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  type: string;
  targetStories: number;
  points: number;
}

export async function createMissionTemplate(missionData: MissionTemplateData): Promise<string> {
  const missionRef = await addDoc(collection(db, COLLECTIONS.MISSION_TEMPLATES), {
    ...missionData,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return missionRef.id;
}

export async function assignMissionToStudent(studentId: string, missionTemplateId: string): Promise<string> {
  const missionRef = await addDoc(collection(db, COLLECTIONS.DAILY_MISSIONS), {
    studentId,
    missionTemplateId,
    status: 'assigned',
    progress: 0,
    assignedAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
  return missionRef.id;
}

export async function getMissionsForStudent(studentId: string): Promise<DemoMission[]> {
  if (isDemoMode) {
    return demoMissions;
  }
  const q = query(
    collection(db, COLLECTIONS.DAILY_MISSIONS),
    where('studentId', '==', studentId),
    where('status', 'in', ['assigned', 'in_progress']),
    orderBy('assignedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DemoMission[];
}

export async function updateMissionProgress(missionId: string, progress: number, storyId: string): Promise<void> {
  const missionRef = doc(db, COLLECTIONS.DAILY_MISSIONS, missionId);

  await runTransaction(db, async (transaction) => {
    const missionDoc = await transaction.get(missionRef);
    if (!missionDoc.exists()) throw new Error('Mission does not exist');

    const mission = missionDoc.data();
    const updates: any = {
      progress,
      updatedAt: serverTimestamp()
    };

    if (progress >= 100) {
      updates.status = 'completed';
      updates.completedAt = serverTimestamp();
    } else if (progress > 0) {
      updates.status = 'in_progress';
    }

    transaction.update(missionRef, updates);

    // Log to mission_logs
    const logRef = doc(collection(db, COLLECTIONS.MISSION_LOGS));
    transaction.set(logRef, {
      missionId,
      studentId: mission.studentId,
      missionTemplateId: mission.missionTemplateId,
      action: 'progress_update',
      progress,
      storyId,
      timestamp: serverTimestamp()
    });
  });
}

export async function completeMission(missionId: string, studentId: string, pointsEarned: number): Promise<void> {
  const missionRef = doc(db, COLLECTIONS.DAILY_MISSIONS, missionId);

  await runTransaction(db, async (transaction) => {
    // Update mission status
    transaction.update(missionRef, {
      status: 'completed',
      progress: 100,
      completedAt: serverTimestamp()
    });

    // Update student points
    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
    transaction.update(studentRef, {
      totalPoints: increment(pointsEarned),
      missionsCompleted: increment(1)
    });

    // Update student skills
    const skillsRef = doc(db, COLLECTIONS.STUDENT_SKILLS, studentId);
    const skillsDoc = await transaction.get(skillsRef);
    if (skillsDoc.exists()) {
      const skills = skillsDoc.data();
      const newLevel = Math.floor((skills.readingLevel as number) + 0.1);
      transaction.update(skillsRef, {
        readingLevel: newLevel,
        skillHistory: [
          ...(skills.skillHistory as any[]).slice(-19),
          {
            level: newLevel,
            timestamp: serverTimestamp()
          }
        ],
        lastUpdated: serverTimestamp()
      });
    }
  });
}

// ============= STUDENT SKILLS OPERATIONS =============

interface StudentSkillsData {
  id: string;
  studentId: string;
  readingLevel: number;
  skills: {
    fluency: number;
    comprehension: number;
    vocabulary: number;
    grammar: number;
  };
  skillHistory: any[];
  lastUpdated: any;
}

export async function getStudentSkills(studentId: string): Promise<StudentSkillsData | null> {
  if (isDemoMode) {
    return {
      id: 'demo_skills',
      studentId,
      readingLevel: 2,
      skills: {
        fluency: 65,
        comprehension: 70,
        vocabulary: 60,
        grammar: 55
      },
      skillHistory: [],
      lastUpdated: new Date()
    };
  }
  const docRef = doc(db, COLLECTIONS.STUDENT_SKILLS, studentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as StudentSkillsData;
}

export async function updateStudentSkills(studentId: string, skillUpdates: Partial<StudentSkillsData['skills']>): Promise<void> {
  const skillsRef = doc(db, COLLECTIONS.STUDENT_SKILLS, studentId);
  await updateDoc(skillsRef, {
    skills: skillUpdates,
    lastUpdated: serverTimestamp()
  });
}

// ============= TEACHER STATS OPERATIONS =============

export interface TeacherStats {
  totalStudents: number;
  totalClasses: number;
  totalMissionsCompleted: number;
  averageReadingLevel: number;
}

export async function getTeacherStats(teacherId: string): Promise<TeacherStats> {
  if (isDemoMode) {
    return {
      totalStudents: 3,
      totalClasses: 1,
      totalMissionsCompleted: 10,
      averageReadingLevel: 2.3
    };
  }
  const docRef = doc(db, COLLECTIONS.TEACHER_STATS, teacherId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return {
      totalStudents: 0,
      totalClasses: 0,
      totalMissionsCompleted: 0,
      averageReadingLevel: 0
    };
  }
  return { id: docRef.id, ...docSnap.data() } as TeacherStats;
}

async function updateTeacherStats(teacherId: string, updates: any): Promise<void> {
  const statsRef = doc(db, COLLECTIONS.TEACHER_STATS, teacherId);
  await updateDoc(statsRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  });
}

export async function getClassAnalytics(classId: string): Promise<{
  totalStudents: number;
  avgReadingLevel: number;
  totalPoints: number;
  activeStudents: number;
}> {
  if (isDemoMode) {
    return {
      totalStudents: 3,
      avgReadingLevel: 2.3,
      totalPoints: 450,
      activeStudents: 3
    };
  }
  // Get all students in class
  const students = await getStudentsByClass(classId);

  // Get skills for all students
  const skillsPromises = students.map(s => getStudentSkills(s.id));
  const skillsResults = await Promise.all(skillsPromises);

  // Calculate analytics
  const totalStudents = students.length;
  const avgReadingLevel = skillsResults.reduce((sum, s) =>
    sum + (s?.readingLevel || 0), 0) / totalStudents || 0;

  const totalPoints = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);

  return {
    totalStudents,
    avgReadingLevel: Math.round(avgReadingLevel * 10) / 10,
    totalPoints,
    activeStudents: students.filter(s => {
      const lastActive = (s as any).lastActiveAt?.toMillis() || 0;
      return Date.now() - lastActive < 7 * 24 * 60 * 60 * 1000;
    }).length
  };
}

// ============= CONTENT CACHE OPERATIONS =============

export async function cacheStories(stories: any[]): Promise<void> {
  const cacheRef = doc(db, COLLECTIONS.CONTENT_CACHE, 'stories');
  await setDoc(cacheRef, {
    content: stories,
    cachedAt: serverTimestamp(),
    version: '1.0'
  });
}

export async function getCachedStories(): Promise<any | null> {
  const docRef = doc(db, COLLECTIONS.CONTENT_CACHE, 'stories');
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data();
}

// ============= EXPORT =============

export const COLLECTION_NAMES = COLLECTIONS;
export { isDemoMode };
