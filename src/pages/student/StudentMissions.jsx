import { useState } from 'react';
import { getStoriesForMission } from '../../services/stories';

function StudentMissions({ student, missions, onRefresh }) {
  const [selectedMission, setSelectedMission] = useState(null);
  const [currentStory, setCurrentStory] = useState(0);
  const [showMissionDetail, setShowMissionDetail] = useState(false);

  // Mock stories for the mission
  const missionStories = selectedMission
    ? getStoriesForMission(student?.currentLevel || 1, 'reading', 3)
    : [];

  const activeMissions = missions.filter(m => m.status === 'assigned' || m.status === 'in_progress');
  const completedMissions = missions.filter(m => m.status === 'completed');

  const handleStartMission = (mission) => {
    setSelectedMission(mission);
    setShowMissionDetail(true);
  };

  const handleCompleteStory = async (storyId) => {
    // Would update mission progress in Firestore
    if (currentStory < missionStories.length - 1) {
      setCurrentStory(currentStory + 1);
    } else {
      // Mission complete!
      setShowMissionDetail(false);
      setSelectedMission(null);
      setCurrentStory(0);
      onRefresh();
    }
  };

  if (showMissionDetail && selectedMission) {
    return (
      <MissionView
        mission={selectedMission}
        stories={missionStories}
        currentStory={currentStory}
        onCompleteStory={handleCompleteStory}
        onClose={() => {
          setShowMissionDetail(false);
          setSelectedMission(null);
          setCurrentStory(0);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">המשימות שלי</h1>
        <p className="text-gray-600">My Missions</p>
      </div>

      {/* Active Missions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span>🎯</span>
          משימות פעילות / Active Missions
        </h2>

        {activeMissions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-gray-500 mb-4">אין משימות פעילות כרגע</p>
            <p className="text-gray-400">No active missions at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeMissions.map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onStart={() => handleStartMission(mission)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Completed Missions */}
      {completedMissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>✅</span>
            משימות שהושלמו / Completed Missions
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedMissions.map(mission => (
              <div
                key={mission.id}
                className="bg-white rounded-xl shadow p-5 opacity-75"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">✅</span>
                  <div>
                    <h3 className="font-bold text-gray-800">משימה הושלמה!</h3>
                    <p className="text-sm text-gray-500">Mission Completed</p>
                  </div>
                </div>
                <p className="text-gray-600">+100 נקודות</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mission Card Component
function MissionCard({ mission, onStart }) {
  const progress = mission.progress || 0;
  const totalStories = 3;
  const completedStories = Math.floor((progress / 100) * totalStories);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-l from-purple-500 to-purple-600 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h3 className="font-bold text-xl">משימת קריאה יומית</h3>
              <p className="text-purple-100">Daily Reading Mission</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-white/20 rounded-full font-bold">
            {completedStories}/{totalStories}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">התקדמות / Progress</span>
            <span className="font-bold text-purple-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-l from-purple-500 to-purple-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span>📖</span>
            <span className="text-gray-600">{totalStories} סיפורים</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⭐</span>
            <span className="text-gray-600">+100 נקודות</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
        >
          {progress > 0 ? '📖 המשך משימה / Continue' : '🚀 התחל משימה / Start'}
        </button>
      </div>
    </div>
  );
}

// Mission View Component (when reading stories for a mission)
function MissionView({ mission, stories, currentStory, onCompleteStory, onClose }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const story = stories[currentStory];
  const progress = ((currentStory + 1) / stories.length) * 100;

  if (!story) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p>טוען סיפור... / Loading story...</p>
      </div>
    );
  }

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setShowAnswer(true);
  };

  const handleNext = () => {
    onCompleteStory(story.id);
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center">
            <p className="font-bold text-gray-800">סיפור {currentStory + 1} מתוך {stories.length}</p>
            <p className="text-sm text-gray-500">Story {currentStory + 1} of {stories.length}</p>
          </div>
          <div className="w-10" />
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white text-center">
          <h2 className="text-2xl font-bold">{story.titleEn}</h2>
          <p className="text-blue-100">{story.title}</p>
        </div>

        <div className="p-6">
          <div className="text-lg leading-relaxed text-gray-800 text-center mb-6" dir="ltr">
            {story.text}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6" dir="rtl">
            <p className="text-sm text-gray-500 mb-1">תרגום:</p>
            <p className="text-gray-700">{story.hebrewTranslation}</p>
          </div>

          {/* Comprehension Question */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-gray-800 mb-3">שאלת הבנה:</h3>
            <p className="text-gray-700 mb-4" dir="rtl">{story.comprehensionQuestion}</p>
            <p className="text-gray-500 text-sm mb-4" dir="ltr">{story.comprehensionQuestionEn}</p>

            {!showAnswer ? (
              <div className="space-y-3">
                {['Answer A', 'Answer B', 'Answer C', 'Answer D'].map((answer, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(answer)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-right hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    {answer}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${selectedAnswer === 'Answer A' ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-100'}`}>
                  <p className="font-semibold text-green-700 mb-1">✅ תשובה נכונה!</p>
                  <p className="text-gray-600">Correct Answer!</p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all"
                >
                  {currentStory < stories.length - 1 ? 'הסיפור הבא / Next Story →' : 'סיים משימה / Complete Mission 🎉'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentMissions;
