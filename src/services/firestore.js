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
};

// ============= TEACHER OPERATIONS =============

export async function createTeacher(teacherData) {
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

export async function getTeacherByEmail(email) {
  const q = query(
    collection(db, COLLECTIONS.TEACHERS),
    where('email', '==', email)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export async function updateTeacher(teacherId, updates) {
  const teacherRef = doc(db, COLLECTIONS.TEACHERS, teacherId);
  await updateDoc(teacherRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

// ============= CLASS OPERATIONS =============

export async function createClass(teacherId, classData) {
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

export async function getClassesByTeacher(teacherId) {
  const q = query(
    collection(db, COLLECTIONS.CLASSES),
    where('teacherId', '==', teacherId),
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateClass(classId, updates) {
  const classRef = doc(db, COLLECTIONS.CLASSES, classId);
  await updateDoc(classRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function deleteClass(classId) {
  const classRef = doc(db, COLLECTIONS.CLASSES, classId);
  await updateDoc(classRef, {
    isActive: false,
    deletedAt: serverTimestamp()
  });
}

// ============= STUDENT OPERATIONS =============

export async function createStudent(studentData) {
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

export async function getStudentById(studentId) {
  const docRef = doc(db, COLLECTIONS.STUDENTS, studentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function getStudentsByClass(classId) {
  const q = query(
    collection(db, COLLECTIONS.STUDENTS),
    where('classId', '==', classId),
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateStudent(studentId, updates) {
  const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
  await updateDoc(studentRef, {
    ...updates,
    lastActiveAt: serverTimestamp()
  });
}

// ============= MISSION OPERATIONS =============

export async function createMissionTemplate(missionData) {
  const missionRef = await addDoc(collection(db, COLLECTIONS.MISSION_TEMPLATES), {
    ...missionData,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return missionRef.id;
}

export async function assignMissionToStudent(studentId, missionTemplateId) {
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

export async function getMissionsForStudent(studentId) {
  const q = query(
    collection(db, COLLECTIONS.DAILY_MISSIONS),
    where('studentId', '==', studentId),
    where('status', 'in', ['assigned', 'in_progress']),
    orderBy('assignedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateMissionProgress(missionId, progress, storyId) {
  const missionRef = doc(db, COLLECTIONS.DAILY_MISSIONS, missionId);

  await runTransaction(db, async (transaction) => {
    const missionDoc = await transaction.get(missionRef);
    if (!missionDoc.exists()) throw new Error('Mission does not exist');

    const mission = missionDoc.data();
    const updates = {
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

export async function completeMission(missionId, studentId, pointsEarned) {
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
      const newLevel = Math.floor(skills.readingLevel + 0.1);
      transaction.update(skillsRef, {
        readingLevel: newLevel,
        skillHistory: [
          ...skills.skillHistory.slice(-19),
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

export async function getStudentSkills(studentId) {
  const docRef = doc(db, COLLECTIONS.STUDENT_SKILLS, studentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() };
}

export async function updateStudentSkills(studentId, skillUpdates) {
  const skillsRef = doc(db, COLLECTIONS.STUDENT_SKILLS, studentId);
  await updateDoc(skillsRef, {
    skills: skillUpdates,
    lastUpdated: serverTimestamp()
  });
}

// ============= TEACHER STATS OPERATIONS =============

export async function getTeacherStats(teacherId) {
  const docRef = doc(db, COLLECTIONS.TEACHER_STATS, teacherId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docRef.id, ...docSnap.data() };
}

async function updateTeacherStats(teacherId, updates) {
  const statsRef = doc(db, COLLECTIONS.TEACHER_STATS, teacherId);
  await updateDoc(statsRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  });
}

export async function getClassAnalytics(classId) {
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
      const lastActive = s.lastActiveAt?.toMillis() || 0;
      return Date.now() - lastActive < 7 * 24 * 60 * 60 * 1000;
    }).length
  };
}

// ============= CONTENT CACHE OPERATIONS =============

export async function cacheStories(stories) {
  const cacheRef = doc(db, COLLECTIONS.CONTENT_CACHE, 'stories');
  await setDoc(cacheRef, {
    content: stories,
    cachedAt: serverTimestamp(),
    version: '1.0'
  });
}

export async function getCachedStories() {
  const docRef = doc(db, COLLECTIONS.CONTENT_CACHE, 'stories');
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data();
}

// ============= EXPORT =============

export const COLLECTION_NAMES = COLLECTIONS;
