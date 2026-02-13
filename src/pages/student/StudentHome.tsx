import { useNavigate } from 'react-router-dom';
import type { Student, StudentSkills } from '../../types';

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

interface StudentHomeProps {
  student: Student;
  missions: DemoMission[];
  skills: any;
  onRefresh: () => void;
  onStartMission: (missionId: string) => void;
}

type ColorType = 'amber' | 'violet' | 'sky' | 'teal';

interface StatCardProps {
  title: string;
  titleEn: string;
  value: number;
  icon: string;
  color: ColorType;
}

interface QuickActionCardProps {
  icon: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  color: 'violet' | 'sky' | 'teal';
  onClick: () => void;
}

function StudentHome({ student, missions, skills, onRefresh, onStartMission }: StudentHomeProps) {
  const navigate = useNavigate();

  // Calculate stats
  const activeMissions = missions.filter(m => m.status === 'assigned' || m.status === 'in_progress').length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const storiesRead = student?.storiesRead || 0;
  const currentLevel = student?.currentLevel || 1;
  const pointsToNextLevel = (currentLevel * 100) - (student?.totalPoints || 0);
  const progressPercent = ((student?.totalPoints || 0) % 100);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl p-6 lg:p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-2xl flex items-center justify-center text-3xl lg:text-4xl">
            👋
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 text-white">
              שלום, {student?.name || 'תלמיד'}!
            </h1>
            <p className="text-white text-lg">מוכן להמשיך ללמוד?</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white">התקדמות לשלב {currentLevel + 1}</span>
            <span className="font-bold text-white">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-white mt-2">
            עוד {pointsToNextLevel} נקודות לשלב הבא
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="נקודות"
          titleEn="Points"
          value={student?.totalPoints || 0}
          icon="⭐"
          color="amber"
        />
        <StatCard
          title="שלב"
          titleEn="Level"
          value={currentLevel}
          icon="🎖️"
          color="violet"
        />
        <StatCard
          title="סיפורים"
          titleEn="Stories"
          value={storiesRead}
          icon="📖"
          color="sky"
        />
        <StatCard
          title="משימות"
          titleEn="Missions"
          value={completedMissions}
          icon="✅"
          color="teal"
        />
      </div>

      {/* Active Mission */}
      {activeMissions > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-5 text-white">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h2 className="text-xl font-bold">המשימה הנוכחית</h2>
                <p className="text-purple-100">Current Mission</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800">משימת קריאה יומית</h3>
                <p className="text-gray-500">Daily Reading Mission</p>
              </div>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-bold">
                פעיל
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">התקדמות</span>
                <span className="font-bold">1/3 סיפורים</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full" style={{ width: '33%' }} />
              </div>
            </div>

            <button
              onClick={() => onStartMission('')}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
            >
              📖 המשך לקרוא / Continue Reading
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <QuickActionCard
          icon="🎯"
          title="משימות"
          titleEn="Missions"
          description="המשימות שלך"
          descriptionEn="Your missions"
          color="violet"
          onClick={() => navigate('/student/missions')}
        />
        <QuickActionCard
          icon="📚"
          title="ספריית סיפורים"
          titleEn="Story Library"
          description="קרא סיפורים חדשים"
          descriptionEn="Read new stories"
          color="sky"
          onClick={() => navigate('/student/stories')}
        />
      </div>

      {/* Recent Achievement */}
      {storiesRead > 0 && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-5 border-2 border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏆</div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">הישג אחרון!</h3>
              <p className="text-gray-600">קראת {storiesRead} סיפורים עד עכשיו</p>
              <p className="text-sm text-gray-500">Keep up the great work!</p>
            </div>
          </div>
        </div>
      )}

      {/* Skills Overview */}
      {skills && (
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="text-xl font-bold text-gray-800 mb-4">הכישורים שלי</h3>
          <div className="space-y-3">
            {Object.entries(skills.skills || {}).map(([skill, value]) => (
              <div key={skill}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 capitalize">{skill}</span>
                  <span className="font-semibold">{value}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-teal-500 h-2 rounded-full"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, titleEn, value, icon, color }: StatCardProps) {
  const colorClasses: Record<ColorType, string> = {
    amber: 'from-amber-400 to-amber-500',
    violet: 'from-violet-500 to-violet-600',
    sky: 'from-sky-400 to-sky-500',
    teal: 'from-teal-400 to-teal-500'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-4 lg:p-5 shadow-lg`}>
      <div className="text-3xl lg:text-4xl mb-2">{icon}</div>
      <div className="text-2xl lg:text-3xl font-bold mb-1 text-white">{value}</div>
      <div className="text-sm text-white">{title}</div>
      <div className="text-xs text-white/90">{titleEn}</div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon, title, titleEn, description, descriptionEn, color, onClick }: QuickActionCardProps) {
  const colorClasses: Record<string, string> = {
    violet: 'hover:border-violet-400 hover:bg-violet-50',
    sky: 'hover:border-sky-400 hover:bg-sky-50',
    teal: 'hover:border-teal-400 hover:bg-teal-50'
  };

  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-2xl shadow p-5 text-right border-2 border-transparent transition-all ${colorClasses[color]}`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800 mb-1">{title}</h3>
          <p className="text-xs text-gray-400 mb-2">{titleEn}</p>
          <p className="text-gray-600 text-sm">{description}</p>
          <p className="text-gray-400 text-xs">{descriptionEn}</p>
        </div>
        <span className="text-gray-400 text-xl">←</span>
      </div>
    </button>
  );
}

export default StudentHome;
