import { createContext, useContext, useState, useEffect } from 'react';
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

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'teacher' | 'student' | null

  useEffect(() => {
    // Set persistence to local
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        setUser(firebaseUser);

        // Check if this is a teacher
        const teacherData = await getTeacherByEmail(firebaseUser.email);
        if (teacherData) {
          setTeacher(teacherData);
          setUserType('teacher');
        } else {
          setTeacher(null);
        }
      } else {
        setUser(null);
        setTeacher(null);
        setUserType(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Teacher login
  const signInAsTeacher = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const teacherData = await getTeacherByEmail(email);

      if (!teacherData) {
        await firebaseSignOut(auth);
        throw new Error('Teacher account not found');
      }

      if (!teacherData.isActive) {
        await firebaseSignOut(auth);
        throw new Error('Teacher account is inactive');
      }

      setTeacher(teacherData);
      setUserType('teacher');
      return { success: true, teacher: teacherData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Student login (by class code + student ID)
  const signInAsStudent = async (classCode, studentId) => {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const studentRef = doc(db, 'students', studentId);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        throw new Error('Student ID not found');
      }

      const studentData = { id: studentSnap.id, ...studentSnap.data() };

      if (!studentData.isActive) {
        throw new Error('Student account is inactive');
      }

      if (studentData.classId !== classCode) {
        throw new Error('Invalid class code');
      }

      setStudent(studentData);
      setUserType('student');
      setUser({ uid: studentId, email: studentData.email }); // For auth context compatibility

      return { success: true, student: studentData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setTeacher(null);
      setStudent(null);
      setUserType(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    teacher,
    student,
    userType,
    loading,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
