import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMissionsForStudent, getStudentSkills } from '../services/firestore';
import type { StudentSkillsData } from '../services/firestore';
import { useStreak } from '../hooks/useStreak';

// Student Pages
import StudentHome from './student/StudentHome';
import StudentMissions from './student/StudentMissions';
import StudentStories from './student/StudentStories';
import StudentProfile from './student/StudentProfile';
import VocabularyReview from './student/VocabularyReview';
import PracticeCenter from './student/PracticeCenter';
import MicroLessonsPage from './student/MicroLessonsPage';
import AchievementsPage from './student/AchievementsPage';
import ProgressPage from './student/ProgressPage';
import { StreakWarning, StreakRewardNotification, StreakBadge } from '../components/StreakDisplay';

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

function StudentPortal() {
  const { student, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [missions, setMissions] = useState<DemoMission[]>([]);
  const [skills, setSkills] = useState<StudentSkillsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showStreakWarning, setShowStreakWarning] = useState<boolean>(false);
  const [showRewardNotification, setShowRewardNotification] = useState<boolean>(false);

  // Streak management
  const {
    streakData,
    recordDailyActivity,
    claimStreakReward,
    unclaimedRewards,
    isActiveToday,
    isAtRisk
  } = useStreak(student?.id || 'demo');

  useEffect(() => {
    if (student) {
      loadStudentData();
    }
  }, [student]);

  // Record activity and check for streak warnings
  useEffect(() => {
    if (student && !isActiveToday) {
      recordDailyActivity();
    }
    if (isAtRisk && !showStreakWarning) {
      setShowStreakWarning(true);
    }
    if (unclaimedRewards.length > 0 && !showRewardNotification) {
      setShowRewardNotification(true);
    }
  }, [student, isActiveToday, isAtRisk, unclaimedRewards.length]);

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
    { name: 'שיעורים', nameEn: 'Lessons', id: 'lessons', icon: '📚' },
    { name: 'אוצר מילים', nameEn: 'Vocabulary', id: 'vocabulary', icon: '📝' },
    { name: 'תרגול', nameEn: 'Practice', id: 'practice', icon: '🎮' },
    { name: 'הישגים', nameEn: 'Achievements', id: 'achievements', icon: '🏆' },
    { name: 'התקדמות', nameEn: 'Progress', id: 'progress', icon: '📊' },
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
      {/* Streak Warning */}
      {showStreakWarning && (
        <StreakWarning
          streak={streakData.currentStreak}
          onPractice={() => {
            setShowStreakWarning(false);
            setCurrentPage('stories');
          }}
          onDismiss={() => setShowStreakWarning(false)}
        />
      )}

      {/* Streak Reward Notification */}
      {showRewardNotification && unclaimedRewards.length > 0 && (
        <StreakRewardNotification
          rewards={unclaimedRewards}
          onClaim={claimStreakReward}
          onClose={() => setShowRewardNotification(false)}
        />
      )}

      {/* Mobile/tablet: slim top bar only – no sidebar, nav at bottom */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-3 py-2 flex items-center justify-between min-h-[44px]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-amber-600">⭐ {student?.totalPoints ?? 0}</span>
          {streakData.currentStreak > 0 && (
            <StreakBadge streak={streakData.currentStreak} size="sm" showLabel={false} />
          )}
        </div>
        <span className="text-xs text-gray-500">Level {student?.currentLevel ?? 1}</span>
        <button
          type="button"
          onClick={handleSignOut}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
          aria-label="התנתק / Logout"
        >
          <span className="text-lg" aria-hidden>🚪</span>
        </button>
      </header>

      {/* Sidebar - Large screens only; no sidebar on mobile/tablet */}
      <aside
        className="hidden lg:flex flex-col h-screen sticky top-0 z-30 bg-white shadow-xl transition-all duration-300"
        style={{
          width: sidebarCollapsed ? '0px' : '288px',
          transform: sidebarCollapsed ? 'translateX(100%)' : 'translateX(0)',
          overflow: sidebarCollapsed ? 'hidden' : 'visible'
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {student?.name?.charAt(0) || 'ת'}
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800">{student?.name || 'תלמיד'}</h1>
              <p className="text-sm text-gray-500">☀️ Level {student?.currentLevel || 1}</p>
            </div>
          </div>
        </div>

        {/* Stats Display */}
        <div className="p-4 space-y-3 shrink-0">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 text-white">
            <p className="text-3xl font-bold mb-1">⭐ {student?.totalPoints || 0}</p>
            <p className="text-sm text-yellow-100">נקודות / Points</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-3 text-white text-center">
              <p className="text-2xl font-bold">🎖️ {student?.currentLevel || 1}</p>
              <p className="text-xs text-violet-100">שלב / Level</p>
            </div>
            <div className="bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl p-3 text-white text-center">
              <p className="text-2xl font-bold">📖 {student?.storiesRead || 0}</p>
              <p className="text-xs text-sky-100">סיפורים / Stories</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl p-3 text-white text-center">
            <p className="text-2xl font-bold">✅ {missions.filter(m => m.status === 'completed').length}</p>
            <p className="text-xs text-teal-100">משימות / Missions</p>
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
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-teal-100 hover:text-teal-700'
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
        <div className="p-4 border-t border-gray-200 shrink-0">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-5 py-4 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <span className="text-2xl">🚪</span>
            <span className="font-medium">התנתק / Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Toggle - Large screens only (hidden on mobile) */}
      <button
        type="button"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`hidden lg:flex fixed top-4 z-50 items-center justify-center w-12 h-12 rounded-full transition-all ${
          sidebarCollapsed ? 'right-4' : 'right-[280px]'
        } bg-teal-500 text-white shadow-lg shadow-teal-500/30 hover:bg-teal-600 hover:shadow-xl hover:shadow-teal-500/40 ring-2 ring-white border-2 border-teal-600`}
        title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
      >
        {sidebarCollapsed ? (
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Main Content - on mobile/tablet: no sidebar; on lg: sidebar can collapse */}
      <main className={`flex-1 lg:pt-0 pt-12 pb-20 lg:pb-0 px-4 lg:px-8 transition-all duration-300 ${sidebarCollapsed ? 'lg:pr-4' : ''}`}>
        <div className="w-full py-6 lg:py-8">
          {currentPage === 'home' && (
            <StudentHome
              student={student!}
              missions={missions}
              skills={skills}
              streakData={streakData}
              onRefresh={loadStudentData}
              onStartMission={(_missionId) => {
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
              onRefresh={loadStudentData}
            />
          )}

          {currentPage === 'lessons' && (
            <MicroLessonsPage
              student={student!}
              onBack={() => setCurrentPage('home')}
            />
          )}

          {currentPage === 'vocabulary' && (
            <VocabularyReview
              student={student!}
              onBack={() => setCurrentPage('home')}
            />
          )}

          {currentPage === 'practice' && (
            <PracticeCenter
              student={student!}
              onBack={() => setCurrentPage('home')}
            />
          )}

          {currentPage === 'achievements' && (
            <AchievementsPage
              student={student!}
              streakDays={streakData.currentStreak}
              onBack={() => setCurrentPage('home')}
            />
          )}

          {currentPage === 'progress' && (
            <ProgressPage
              student={student!}
              skills={skills}
              streakDays={streakData.currentStreak}
              onBack={() => setCurrentPage('home')}
            />
          )}

          {currentPage === 'profile' && (
            <StudentProfile
              student={student!}
              skills={skills}
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
