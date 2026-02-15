import type { Student } from '../../types';
import type { StudentSkillsData } from '../../services/firestore';

interface StudentProfileProps {
  student: Student;
  skills: StudentSkillsData | null;
  onRefresh?: () => void;
}

interface Achievement {
  icon: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  unlocked: boolean;
}

function StudentProfile({ student, skills }: StudentProfileProps) {
  const currentLevel = student?.currentLevel || 1;
  const totalPoints = student?.totalPoints || 0;
  const storiesRead = student?.storiesRead || 0;
  const missionsCompleted = student?.missionsCompleted || 0;

  // Calculate level progress
  const pointsInCurrentLevel = totalPoints % 100;
  const levelProgress = (pointsInCurrentLevel / 100) * 100;

  // Generate achievements based on stats
  const achievements: Achievement[] = [
    {
      icon: '🌟',
      title: 'התחלה חדשה',
      titleEn: 'New Beginning',
      description: 'קראת את הסיפור הראשון שלך',
      descriptionEn: 'Read your first story',
      unlocked: storiesRead >= 1
    },
    {
      icon: '📚',
      title: 'קורא נלהב',
      titleEn: 'Avid Reader',
      description: 'קראת 10 סיפורים',
      descriptionEn: 'Read 10 stories',
      unlocked: storiesRead >= 10
    },
    {
      icon: '🏆',
      title: 'אלוף משימות',
      titleEn: 'Mission Champion',
      description: 'השלמת 5 משימות',
      descriptionEn: 'Complete 5 missions',
      unlocked: missionsCompleted >= 5
    },
    {
      icon: '⭐',
      title: 'אסטרטג',
      titleEn: 'Rising Star',
      description: 'הגעת לשלב 3',
      descriptionEn: 'Reach level 3',
      unlocked: currentLevel >= 3
    },
    {
      icon: '💎',
      title: 'אוסף נקודות',
      titleEn: 'Point Collector',
      description: 'צברת 500 נקודות',
      descriptionEn: 'Collect 500 points',
      unlocked: totalPoints >= 500
    },
    {
      icon: '🎯',
      title: 'מומחה משימות',
      titleEn: 'Mission Expert',
      description: 'השלמת 20 משימות',
      descriptionEn: 'Complete 20 missions',
      unlocked: missionsCompleted >= 20
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">הפרופיל שלי</h1>
        <p className="text-gray-600">My Profile</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
          <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white rounded-full flex items-center justify-center text-4xl lg:text-5xl font-bold text-green-600 mx-auto mb-4">
            {student?.name?.charAt(0) || 'ת'}
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold mb-1">{student?.name || 'תלמיד'}</h2>
          <p className="text-green-100">Student</p>
        </div>

        <div className="p-6">
          {/* Level Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">שלב נוכחי / Current Level</p>
                <p className="text-3xl font-bold text-gray-800">☀️ Level {currentLevel}</p>
              </div>
              <div className="text-6xl">🎖️</div>
            </div>

            <div className="bg-gray-100 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">התקדמות לשלב {currentLevel + 1}</span>
                <span className="font-bold text-green-600">{Math.round(levelProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                {pointsInCurrentLevel} / 100 נקודות לשלב הבא
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-3xl font-bold text-yellow-600 mb-1">⭐ {totalPoints}</p>
              <p className="text-xs text-gray-600">נקודות / Points</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-600 mb-1">📖 {storiesRead}</p>
              <p className="text-xs text-gray-600">סיפורים / Stories</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-3xl font-bold text-purple-600 mb-1">✅ {missionsCompleted}</p>
              <p className="text-xs text-gray-600">משימות / Missions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>הכישורים / Skills</span>
          </h3>

          <div className="space-y-4">
            {Object.entries(skills.skills || {}).map(([skill, value]) => {
              const skillLabels: Record<string, { he: string; en: string; icon: string }> = {
                fluency: { he: 'שטף קריאה', en: 'Fluency', icon: '💨' },
                comprehension: { he: 'הבנת הנקרא', en: 'Comprehension', icon: '🧠' },
                vocabulary: { he: 'אוצר מילים', en: 'Vocabulary', icon: '📚' },
                grammar: { he: 'דקדוק', en: 'Grammar', icon: '✏️' }
              };

              const skillInfo = skillLabels[skill] || { he: skill, en: skill, icon: '📊' };

              return (
                <div key={skill}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{skillInfo.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{skillInfo.he}</p>
                        <p className="text-xs text-gray-500">{skillInfo.en}</p>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-green-600">{value as number}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${value as number}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>🏆</span>
            <span>הישגים / Achievements</span>
          </h3>
          <span className="text-sm text-gray-500">
            {unlockedAchievements} / {totalAchievements}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => (
            <div
              key={achievement.icon}
              className={`p-4 rounded-xl border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className={`text-4xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <h4 className={`font-bold text-gray-800 ${achievement.unlocked ? '' : 'text-gray-500'}`}>
                {achievement.title}
              </h4>
              <p className="text-xs text-gray-500 mb-2">{achievement.titleEn}</p>
              <p className={`text-sm ${achievement.unlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                {achievement.description}
              </p>
              <p className={`text-xs ${achievement.unlocked ? 'text-gray-500' : 'text-gray-400'}`}>
                {achievement.descriptionEn}
              </p>

              {achievement.unlocked && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium">
                  <span>✓</span>
                  <span>הושג!</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reading Streak */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-5xl">🔥</div>
          <div>
            <p className="text-orange-100 text-sm">רצף קריאה</p>
            <p className="text-3xl font-bold">3 ימים</p>
            <p className="text-orange-100 text-sm">Reading Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
