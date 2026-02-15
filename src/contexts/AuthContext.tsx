import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { getTeacherByEmail } from '../services/firestore';
import type { Teacher, Student, FirebaseUser, AuthContextValue, AuthResult, UserType } from '../types';

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

// Check if Firebase is configured (demo mode if no valid auth)
const shouldUseDemoMode = !auth;

interface AuthProviderProps {
  children: ReactNode;
}

const isDev = import.meta.env.DEV;
const skipLogin = isDev && import.meta.env.VITE_SKIP_LOGIN !== 'false';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(shouldUseDemoMode ? false : true);
  const [userType, setUserType] = useState<UserType>(null); // 'teacher' | 'student' | null
  const devAutoLoginDone = useRef(false);

  // In development: skip login and auto-enter as a demo student so you don't type every time
  useEffect(() => {
    if (!skipLogin || devAutoLoginDone.current || loading) return;
    devAutoLoginDone.current = true;
    const mockStudent: Student = {
      id: 'dev_student',
      name: 'דניאל כהן',
      studentId: 'dev_student',
      classId: 'DEMO',
      totalPoints: 0,
      currentLevel: 1,
      storiesRead: 0,
      missionsCompleted: 0,
      isActive: true
    };
    setStudent(mockStudent);
    setUserType('student');
    setUser({ uid: 'dev_student', email: 'dev@student.local' });
  }, [loading]);

  useEffect(() => {
    if (shouldUseDemoMode) {
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};
    let isMounted = true;

    // Set up auth with error handling
    const initializeAuth = async () => {
      try {
        // Set persistence to local
        await setPersistence(auth!, browserLocalPersistence);

        unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
          if (!isMounted) return;

          setLoading(true);

          if (firebaseUser) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email || '' });

            // Check if this is a teacher
            try {
              const teacherData = await getTeacherByEmail(firebaseUser.email || '');
              if (teacherData) {
                setTeacher(teacherData);
                setUserType('teacher');
              } else {
                setTeacher(null);
              }
            } catch (error) {
              console.error('Error fetching teacher data:', error);
            }
          } else {
            setUser(null);
            setTeacher(null);
            setUserType(null);
          }

          setLoading(false);
        });
      } catch (error) {
        console.error('Firebase initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Teacher login
  const signInAsTeacher = async (email: string, password: string): Promise<AuthResult<Teacher>> => {
    // Demo mode for testing without Firebase
    if (shouldUseDemoMode) {
      // Mock login for demo
      const mockTeacher: Teacher = {
        id: 'demo_teacher',
        name: 'Demo Teacher',
        email: email,
        school: 'Demo School',
        isActive: true
      };
      setTeacher(mockTeacher);
      setUserType('teacher');
      setUser({ uid: 'demo', email });
      return { success: true, data: mockTeacher };
    }

    try {
      await signInWithEmailAndPassword(auth!, email, password);
      const teacherData = await getTeacherByEmail(email);

      if (!teacherData) {
        await firebaseSignOut(auth!);
        return { success: false, error: 'Teacher account not found' };
      }

      if (!teacherData.isActive) {
        await firebaseSignOut(auth!);
        return { success: false, error: 'Teacher account is inactive' };
      }

      setTeacher(teacherData);
      setUserType('teacher');
      return { success: true, data: teacherData };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return { success: false, error: message };
    }
  };

  // Student login (by class code + student ID)
  const signInAsStudent = async (classCode: string, studentId: string): Promise<AuthResult<Student>> => {
    // Demo mode for testing without Firebase
    if (shouldUseDemoMode) {
      // Mock login for demo - fresh start for testing
      const mockStudent: Student = {
        id: 'demo_student',
        name: 'דניאל כהן',
        studentId: studentId,
        classId: classCode,
        totalPoints: 0,
        currentLevel: 1,
        storiesRead: 0,
        missionsCompleted: 0,
        isActive: true
      };
      setStudent(mockStudent);
      setUserType('student');
      setUser({ uid: studentId, email: 'demo@student.com' });
      return { success: true, data: mockStudent };
    }

    try {
      const studentRef = doc(db!, 'students', studentId);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        return { success: false, error: 'Student ID not found' };
      }

      const studentData: Student = { id: studentSnap.id, ...studentSnap.data() } as Student;

      if (!studentData.isActive) {
        return { success: false, error: 'Student account is inactive' };
      }

      if (studentData.classId !== classCode) {
        return { success: false, error: 'Invalid class code' };
      }

      setStudent(studentData);
      setUserType('student');
      setUser({ uid: studentId, email: studentData.email || '' });

      return { success: true, data: studentData };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return { success: false, error: message };
    }
  };

  // Sign out
  const signOut = async (): Promise<AuthResult<void>> => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setTeacher(null);
      setStudent(null);
      setUserType(null);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return { success: false, error: message };
    }
  };

  const value: AuthContextValue = {
    user,
    teacher,
    student,
    userType,
    loading,
    isDemoMode: shouldUseDemoMode,
    signInAsTeacher,
    signInAsStudent,
    signOut,
    isAuthenticated: !!user || !!student
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
