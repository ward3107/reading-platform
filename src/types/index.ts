// Story Types
export interface Story {
  id: string;
  title: string;
  titleEn: string;
  text: string;
  hebrewTranslation: string;
  difficulty: number;
  wordCount: number;
  sentences: number;
  vocabularyIds: string[];
  emotionWords: string[];
  themes: string[];
  comprehensionQuestion: string;
  comprehensionQuestionEn: string;
  answerOptions?: string[];           // Hebrew answer options
  answerOptionsEn?: string[];         // English answer options
  correctAnswerIndex?: number;        // Index of correct answer (0-3)
}

// Student Types
export interface Student {
  id: string;
  name: string;
  nameEn?: string;
  studentId: string;
  classId: string;
  email?: string;
  totalPoints: number;
  currentLevel: number;
  storiesRead: number;
  missionsCompleted: number;
  isActive: boolean;
  skills?: StudentSkills;
  recentStories?: string[];
}

export interface StudentSkills {
  readingLevel: number;
  comprehensionLevel: number;
  vocabularyLevel: number;
  fluencyLevel: number;
  strengths: string[];
  areasForImprovement: string[];
}

// Teacher Types
export interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  isActive: boolean;
  createdAt?: string;
}

// Class Types
export interface Class {
  id: string;
  name: string;
  nameEn: string;
  grade: string;
  teacherId: string;
  studentCount: number;
  isActive: boolean;
  analytics?: ClassAnalytics;
}

export interface ClassAnalytics {
  totalStudents: number;
  avgReadingLevel: number;
  totalPoints: number;
  activeStudents: number;
}

// Mission Types
export interface Mission {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  classId: string;
  targetLevel: number;
  storyIds: string[];
  assignedStories: Story[];
  assignedCount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
}

export interface MissionProgress {
  missionId: string;
  studentId: string;
  storiesCompleted: number;
  totalStories: number;
  status: 'not-started' | 'in-progress' | 'completed';
  completedAt?: string;
}

// Auth Types
export type UserType = 'teacher' | 'student' | null;

export interface AuthContextValue {
  user: FirebaseUser | null;
  teacher: Teacher | null;
  student: Student | null;
  userType: UserType;
  loading: boolean;
  isDemoMode: boolean;
  signInAsTeacher: (email: string, password: string) => Promise<AuthResult<Teacher>>;
  signInAsStudent: (classCode: string, studentId: string) => Promise<AuthResult<Student>>;
  signOut: () => Promise<AuthResult<void>>;
  isAuthenticated: boolean;
}

export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Firebase User (minimal type for what we use)
export interface FirebaseUser {
  uid: string;
  email: string;
}

// Filter Types
export type FilterType = 'all' | 'difficulty' | 'theme';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// Component Props Types
export interface StudentStoriesProps {
  student: Student;
  skills?: StudentSkills;
  onRefresh: () => void;
}

export interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

export interface StoryReaderProps {
  story: Story;
  onComplete: () => void;
  onClose: () => void;
  showAnswer: boolean;
  onAnswer: () => void;
}

// Page Props Types
export interface StudentPortalProps {
  onRefresh: () => void;
}

export interface StudentHomeProps {
  student: Student;
  skills?: StudentSkills;
  onRefresh: () => void;
}

export interface StudentMissionsProps {
  student: Student;
  onRefresh: () => void;
}

export interface StudentProfileProps {
  student: Student;
  skills?: StudentSkills;
  onRefresh: () => void;
}

export interface TeacherDashboardProps {
  teacher: Teacher;
}

// Stats Types
export interface TeacherStats {
  totalStudents: number;
  totalClasses: number;
  avgReadingLevel: number;
  activeMissions: number;
}

export interface StudentStats {
  totalPoints: number;
  storiesRead: number;
  currentLevel: number;
  missionsCompleted: number;
}

// Vocabulary & Spaced Repetition Types
export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  meaningHe: string;
  example?: string;
  difficulty: number;
  category?: string;
  imageUrl?: string;
}

export interface VocabularyProgress {
  wordId: string;
  studentId: string;
  timesReviewed: number;
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewedAt: string | null;
  nextReviewAt: string;
  easeFactor: number;          // SM-2 algorithm ease factor (default 2.5)
  interval: number;            // Days until next review
  status: 'new' | 'learning' | 'review' | 'mastered';
}

export interface VocabularyReviewSession {
  words: VocabularyProgress[];
  currentIndex: number;
  startTime: string;
  correctCount: number;
  incorrectCount: number;
}
