import { useState, useEffect } from 'react';
import { Outlet, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMissionsForStudent, getStudentSkills } from '../services/firestore';
import type { Student, StudentSkills } from '../types';

// Student Pages
import StudentHome from './student/StudentHome';
import StudentMissions from './student/StudentMissions';
import StudentStories from './student/StudentStories';
import StudentProfile from './student/StudentProfile';

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

interface StudentPortalProps {
  onRefresh?: () => void;
}

function StudentPortal({ onRefresh }: StudentPortalProps) {
  const { student, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [missions, setMissions] = useState<DemoMission[]>([]);
  const [skills, setSkills] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (student) {
      loadStudentData();
    }
  }, [student]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [missionsData, skillsData] = await Promise.all([
        getMissionsForStudent(student!.id),
        getStudentSkills(student!.id)
      ]);
      setMissions(missionsData as DemoMission[]);
      setSkills(skillsData);
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'בית', nameEn: 'Home', id: 'home', icon: '🏠' },
    { name: 'משימות', nameEn: 'Missions', id: 'missions', icon: '🎯' },
    { name: 'סיפורים', nameEn: 'Stories', id: 'stories', icon: '📖' },
    { name: 'הפרופיל שלי', nameEn: 'My Profile', id: 'profile', icon: '👤' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-teal-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-50 to-teal-100" dir="rtl">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
              {student?.name?.charAt(0) || 'ת'}
            </div>
            <div>
              <p className="font-bold text-gray-800">{student?.name || 'תלמיד'}</p>
              <p className="text-xs text-gray-500">שָׁׁמֶשׁ {student?.currentLevel || 1}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
              ⭐ {student?.totalPoints || 0}
            </span>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-72 bg-white flex-col shadow-xl h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {student?.name?.charAt(0) || 'ת'}
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800">{student?.name || 'תלמיד'}</h1>
              <p className="text-sm text-gray-500">שָׁׁמֶשׁ {student?.currentLevel || 1}</p>
            </div>
          </div>
        </div>

        {/* Points Display */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-5 text-white text-center">
            <p className="text-3xl font-bold mb-1">⭐ {student?.totalPoints || 0}</p>
            <p className="text-sm text-yellow-100">נקודות / Points</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all ${
                currentPage === item.id
                  ? 'bg-gradient-to-l from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-cyan-50 hover:text-teal-600'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="text-right flex-1">
                <div className="font-bold text-lg">{item.name}</div>
                <div className="text-xs opacity-75">{item.nameEn}</div>
              </div>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-5 py-4 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <span className="text-2xl">🚪</span>
            <span className="font-medium">התנתק / Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pt-0 pt-20 pb-24 lg:pb-0 px-4 lg:px-8">
        <div className="w-full py-6 lg:py-8">
          {currentPage === 'home' && (
            <StudentHome
              student={student!}
              missions={missions}
              skills={skills}
              onRefresh={loadStudentData}
              onStartMission={(missionId) => {
                setCurrentPage('missions');
              }}
            />
          )}

          {currentPage === 'missions' && (
            <StudentMissions
              student={student!}
              missions={missions}
              onRefresh={loadStudentData}
            />
          )}

          {currentPage === 'stories' && (
            <StudentStories
              student={student!}
              skills={skills}
              onRefresh={loadStudentData}
            />
          )}

          {currentPage === 'profile' && (
            <StudentProfile
              student={student!}
              skills={skills}
              onRefresh={loadStudentData}
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
        <div className="flex justify-around">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'text-teal-600 bg-cyan-50'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default StudentPortal;
