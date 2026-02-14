import type { Class, Student } from '../../types';

export interface DemoMission {
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

export const DEMO_CLASSES: Class[] = [
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
      avgReadingLevel: 1,
      totalPoints: 0,
      activeStudents: 3
    }
  }
];

export const DEMO_STUDENTS: Student[] = [
  {
    id: 'demo_student_1',
    name: 'דניאל כהן',
    studentId: '12345',
    classId: 'demo_class_1',
    totalPoints: 0,
    currentLevel: 1,
    storiesRead: 0,
    missionsCompleted: 0,
    isActive: true
  },
  {
    id: 'demo_student_2',
    name: 'מאיה לוי',
    studentId: '12346',
    classId: 'demo_class_1',
    totalPoints: 0,
    currentLevel: 1,
    storiesRead: 0,
    missionsCompleted: 0,
    isActive: true
  },
  {
    id: 'demo_student_3',
    name: 'יוסי אברהם',
    studentId: '12347',
    classId: 'demo_class_1',
    totalPoints: 0,
    currentLevel: 1,
    storiesRead: 0,
    missionsCompleted: 0,
    isActive: true
  }
];

export const DEMO_MISSIONS: DemoMission[] = [
  {
    id: 'demo_mission_1',
    title: 'משימת קריאה יומית',
    titleEn: 'Daily Reading Mission',
    type: 'reading',
    targetStories: 3,
    points: 100,
    status: 'assigned',
    progress: 0,
    assignedTo: 3,
    completedBy: 0
  }
];

export const DEMO_STUDENT_SKILLS = {
  readingLevel: 1,
  skills: {
    fluency: 10,
    comprehension: 10,
    vocabulary: 10,
    grammar: 10
  },
  skillHistory: []
};

export const DEMO_TEACHER_STATS = {
  totalStudents: 3,
  totalClasses: 1,
  totalMissionsCompleted: 0,
  averageReadingLevel: 1
};

export const DEMO_CLASS_ANALYTICS = {
  totalStudents: 3,
  avgReadingLevel: 1,
  totalPoints: 0,
  activeStudents: 3
};
