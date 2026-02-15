import type { Student, StudentSkills } from '../../types';
import { ProgressVisualization } from '../../components/ProgressCharts';

interface ProgressPageProps {
  student: Student;
  skills: StudentSkills | null;
  streakDays: number;
  onBack: () => void;
}

function ProgressPage({ student, skills, streakDays, onBack }: ProgressPageProps) {
  // Default skills if not available
  const defaultSkills: StudentSkills = {
    fluencyLevel: 10,
    comprehensionLevel: 10,
    vocabularyLevel: 10,
    readingLevel: 10,
    strengths: [],
    areasForImprovement: []
  };

  const studentData = {
    storiesRead: student.storiesRead || 0,
    totalPoints: student.totalPoints || 0,
    currentLevel: student.currentLevel || 1,
    missionsCompleted: student.missionsCompleted || 0
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span>→</span>
        <span>חזור / Back</span>
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            📊
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">My Progress</h1>
            <p className="text-teal-100 text-lg">ההתקדמות שלי</p>
          </div>
        </div>
        <p className="mt-4 text-teal-100">
          Track your learning journey and see how far you've come!
        </p>
      </div>

      {/* Progress Visualization */}
      <ProgressVisualization
        student={studentData}
        skills={skills || defaultSkills}
        streakDays={streakDays}
      />

      {/* Additional Stats Section */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-bold text-gray-800 mb-4">Learning Insights / תובנות למידה</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reading Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📖</span>
              <h4 className="font-bold text-gray-800">Reading Habits</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Average stories per week: <span className="font-bold text-blue-600">2-3</span></p>
              <p>• Best reading time: <span className="font-bold text-blue-600">Afternoon</span></p>
              <p>• Favorite genre: <span className="font-bold text-blue-600">Adventure</span></p>
            </div>
          </div>

          {/* Skill Development */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎯</span>
              <h4 className="font-bold text-gray-800">Skill Focus</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Strongest area: <span className="font-bold text-purple-600">Vocabulary</span></p>
              <p>• Area to improve: <span className="font-bold text-purple-600">Grammar</span></p>
              <p>• Recent improvement: <span className="font-bold text-purple-600">Fluency +5%</span></p>
            </div>
          </div>

          {/* Goals Progress */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🏆</span>
              <h4 className="font-bold text-gray-800">Goals Progress</h4>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Weekly stories goal</span>
                  <span className="font-bold text-green-600">3/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Monthly points goal</span>
                  <span className="font-bold text-green-600">{student.totalPoints || 0}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, ((student.totalPoints || 0) / 100) * 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Study Tips */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">💡</span>
              <h4 className="font-bold text-gray-800">Tips for You</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Try reading at the same time each day</p>
              <p>• Review vocabulary before bed for better retention</p>
              <p>• Practice speaking words out loud</p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-5 border-2 border-orange-200">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🌟</div>
          <div>
            <h4 className="font-bold text-orange-800 mb-2">Keep Going!</h4>
            <p className="text-orange-700">
              {streakDays > 7
                ? `Amazing! You've maintained a ${streakDays}-day streak! Consistency is the key to success.`
                : streakDays > 3
                  ? `Great job on your ${streakDays}-day streak! Keep up the momentum!`
                  : "Every story you read brings you closer to your goals. Start a learning streak today!"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;
