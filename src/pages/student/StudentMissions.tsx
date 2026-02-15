import { useState, useEffect } from 'react';
import type { Student, Story } from '../../types';
import type { DemoMission } from '../../services/database/demo-data';
import { getStoriesForMission } from '../../services/stories';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useAdaptiveDifficulty } from '../../hooks/useAdaptiveDifficulty';
import {
  LevelUpNotification,
  LevelDownNotification,
  PerformanceIndicator,
  HintButton,
  HintDisplay
} from '../../components/AdaptiveDifficulty';

interface StudentMissionsProps {
  student: Student;
  missions: DemoMission[];
  onRefresh: () => void;
}

interface MissionCardProps {
  mission: DemoMission;
  onStart: () => void;
}

interface MissionViewProps {
  stories: Story[];
  currentStory: number;
  student: Student;
  onCompleteStory: () => void;
  onClose: () => void;
}

function StudentMissions({ student, missions, onRefresh }: StudentMissionsProps) {
  const [selectedMission, setSelectedMission] = useState<DemoMission | null>(null);
  const [currentStory, setCurrentStory] = useState<number>(0);
  const [showMissionDetail, setShowMissionDetail] = useState<boolean>(false);
  const [missionStories, setMissionStories] = useState<Story[]>([]);

  // Fetch stories when mission is selected
  useEffect(() => {
    if (selectedMission) {
      getStoriesForMission(student?.currentLevel || 1, 'reading', 3).then(setMissionStories);
    } else {
      setMissionStories([]);
    }
  }, [selectedMission, student?.currentLevel]);

  const activeMissions = missions.filter(m => m.status === 'assigned' || m.status === 'in_progress');
  const completedMissions = missions.filter(m => m.status === 'completed');

  const handleStartMission = (mission: DemoMission) => {
    setSelectedMission(mission);
    setShowMissionDetail(true);
  };

  const handleCompleteStory = async () => {
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
        stories={missionStories}
        currentStory={currentStory}
        student={student}
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
function MissionCard({ mission, onStart }: MissionCardProps) {
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
              aria-label={`Progress ${progress}%`}
              title={`Progress ${progress}%`}
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
function MissionView({ stories, currentStory, student, onCompleteStory, onClose }: MissionViewProps) {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [currentTask, setCurrentTask] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState<number>(Date.now());

  const { speak, stop, isSpeaking } = useSpeechSynthesis({ lang: 'en-US', rate: 0.9 });
  const {
    state: adaptiveState,
    recordAnswer,
    showLevelUp,
    showLevelDown,
    dismissLevelUp,
    dismissLevelDown,
    getHintForQuestion,
    currentDifficulty
  } = useAdaptiveDifficulty(student);

  const story = stories[currentStory];
  const progress = ((currentStory + 1) / stories.length) * 100;

  // Generate multiple tasks for the story
  const tasks = generateTasksForStory(story);

  if (!story) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
        <p>טוען סיפור... / Loading story...</p>
      </div>
    );
  }

  const handleAnswer = (index: number) => {
    const responseTime = Date.now() - answerStartTime;
    const isCorrect = index === (currentTaskData?.correctIndex ?? story.correctAnswerIndex ?? 0);

    setSelectedAnswer(index);
    setShowAnswer(true);

    // Record answer for adaptive difficulty
    recordAnswer(story.id, isCorrect, responseTime, hintsUsed);
  };

  const handleShowHint = () => {
    const taskType = currentTaskData?.type || 'comprehension';
    const hint = getHintForQuestion(taskType as 'comprehension' | 'vocabulary' | 'translation');
    setCurrentHint(hint);
    setHintsUsed(prev => prev + 1);
  };

  const handleNextTask = () => {
    if (currentTask < tasks.length - 1) {
      // Move to next task
      setCurrentTask(currentTask + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setCurrentHint(null);
      setHintsUsed(0);
      setAnswerStartTime(Date.now());
    } else {
      // All tasks complete, move to next story
      onCompleteStory();
      setShowAnswer(false);
      setSelectedAnswer(null);
      setCurrentTask(0);
      setCurrentHint(null);
      setHintsUsed(0);
    }
  };

  const currentTaskData = tasks[currentTask];
  const answerOptions = currentTaskData?.options || story.answerOptions || ['תשובה א׳', 'תשובה ב׳', 'תשובה ג׳', 'תשובה ד׳'];
  const answerOptionsEn = currentTaskData?.optionsEn;
  const correctIndex = currentTaskData?.correctIndex ?? story.correctAnswerIndex ?? 0;

  return (
    <div className="space-y-4">
      {/* Level Up/Down Notifications */}
      <LevelUpNotification
        show={showLevelUp}
        onDismiss={dismissLevelUp}
        newLevel={currentDifficulty + 1}
      />
      <LevelDownNotification
        show={showLevelDown}
        onDismiss={dismissLevelDown}
        newLevel={currentDifficulty - 1}
      />

      {/* Performance Indicator */}
      <PerformanceIndicator state={adaptiveState} />

      {/* Progress Header */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
            title="Close"
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
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
            aria-label={`Progress ${progress}%`}
            title={`Progress ${progress}%`}
          />
        </div>
        {/* Task Progress */}
        <div className="flex items-center justify-center gap-2">
          {tasks.map((_, idx) => (
            <div
              key={idx} title={`Task ${idx + 1}`} aria-label={`Task ${idx + 1}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                idx < currentTask
                  ? 'bg-green-500 text-white'
                  : idx === currentTask
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
              >
              {idx < currentTask ? '✓' : idx + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white text-center">
          <h2 className="text-2xl font-bold">{story.titleEn}</h2>
          <p className="text-blue-100">{story.title}</p>
        </div>

        <div className="p-6">
          {/* Read aloud button */}
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={() => (isSpeaking ? stop() : speak(story.text))}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-white transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 ${isSpeaking ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
              aria-label={isSpeaking ? 'Stop reading' : 'Listen to story'}
              title={isSpeaking ? 'Stop reading' : 'Listen to story'}
            >
              {isSpeaking ? (
                <>
                  <span className="text-lg">⏹</span>
                  <span>Stop / עצור</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🔊</span>
                  <span>Listen to story / האזן לסיפור</span>
                </>
              )}
            </button>
          </div>
          <div className="text-lg leading-relaxed text-gray-800 text-center mb-6" dir="ltr">
            {story.text}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6" dir="rtl">
            <p className="text-sm text-gray-500 mb-1">תרגום:</p>
            <p className="text-gray-700">{story.hebrewTranslation}</p>
          </div>

          {/* Comprehension Question */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-800">שאלה {currentTask + 1}:</h3>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {currentTaskData?.type === 'comprehension' ? 'הבנה' : currentTaskData?.type === 'vocabulary' ? 'אוצר מילים' : 'שאלה'}
                </span>
              </div>
              {!showAnswer && !currentHint && (
                <HintButton onShowHint={handleShowHint} hintsUsed={hintsUsed} maxHints={2} />
              )}
            </div>
            <p className="text-gray-700 mb-2 text-lg" dir="rtl">{currentTaskData?.questionHe || story.comprehensionQuestion}</p>
            <p className="text-gray-500 mb-4" dir="ltr">{currentTaskData?.questionEn || story.comprehensionQuestionEn}</p>

            {/* Hint Display */}
            {currentHint && (
              <HintDisplay hint={currentHint} onClose={() => setCurrentHint(null)} />
            )}

            {!showAnswer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {answerOptions.map((answer, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="w-full p-5 border-2 border-gray-200 rounded-xl text-right hover:border-purple-300 hover:bg-purple-50 transition-colors bg-white flex flex-col items-stretch gap-3"
                    aria-label={`Answer ${idx + 1}`}
                    title={`Answer ${idx + 1}`}
                    >
                    <span className="ml-2 font-bold text-gray-400">{['א׳', 'ב׳', 'ג׳', 'ד׳'][idx]}</span>
                    <span className="text-gray-800" dir="rtl">{answer}</span>
                    <span className="block text-lg text-gray-600 border-t border-gray-100 pt-2" dir="ltr">
                      {answerOptionsEn?.[idx] ?? answer}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show all answers with correct/incorrect highlighting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {answerOptions.map((answer, idx) => (
                    <div
                      key={idx}
                      className={`p-5 border-2 rounded-xl text-right flex flex-col gap-3 ${
                        idx === correctIndex
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : idx === selectedAnswer && idx !== correctIndex
                          ? 'border-red-500 bg-red-50 text-red-800'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                      }`}
                      aria-label={`Answer ${idx + 1}`}
                      title={`Answer ${idx + 1}`}
                    >
                      <span className="ml-2 font-bold">{['א׳', 'ב׳', 'ג׳', 'ד׳'][idx]}</span>
                      <span dir="rtl">{answer}</span>
                      <span className="block text-lg border-t border-gray-200 pt-2" dir="ltr">
                        {answerOptionsEn?.[idx] ?? answer}
                      </span>
                      {idx === correctIndex && <span className="mr-2">✅</span>}
                    </div>
                  ))}
                </div>

                {selectedAnswer === correctIndex ? (
                  <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4">
                    <p className="font-bold text-green-700">✅ מצוין! תשובה נכונה!</p>
                    <p className="text-gray-600">Excellent! Correct answer!</p>
                  </div>
                ) : (
                  <div className="bg-orange-100 border-2 border-orange-300 rounded-xl p-4">
                    <p className="font-bold text-orange-700">👍 לא נורא! נסה שוב בפעם הבאה</p>
                    <p className="text-gray-600">That's okay! Keep learning!</p>
                  </div>
                )}

                <button
                  onClick={handleNextTask}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transition-all"
                  aria-label="Next task"
                  title={currentTask < tasks.length - 1 ? 'שאלה הבאה / Next Question →' : 'סיים משימה / Complete Mission 🎉'}
                >
                  {currentTask < tasks.length - 1 ? 'שאלה הבאה / Next Question →' : 'סיים משימה / Complete Mission 🎉'}
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

// Generate multiple tasks for a story
interface Task {
  type: 'comprehension' | 'vocabulary' | 'translation'; // type of task
  questionHe: string; // question in Hebrew
  questionEn: string; // question in English
  options: string[]; // options for the question
  optionsEn?: string[]; // options in English
  correctIndex: number; // index of the correct answer
}

function generateTasksForStory(story: Story | undefined): Task[] { // generate tasks for a story using the story data and return an array of tasks  
  if (!story) return []; // if the story is not defined, return an empty array  

  const tasks: Task[] = []; // initialize an empty array of tasks  

  // Task 1: Main comprehension question (from story data) – Hebrew + English options
  const mainOptions = story.answerOptions || ['תשובה א׳', 'תשובה ב׳', 'תשובה ג׳', 'תשובה ד׳']; // default options if the story data is not defined  
  tasks.push({
    type: 'comprehension', // type of task
    questionHe: story.comprehensionQuestion || 'מה המשמעות של הסיפור?', // question in Hebrew
    questionEn: story.comprehensionQuestionEn || 'What is the meaning of the story?', // question in English
    options: mainOptions, // options for the question
    optionsEn: story.answerOptionsEn, // options in English
    correctIndex: story.correctAnswerIndex ?? 0 // index of the correct answer
  });

  // Task 2: Vocabulary question (if vocabulary exists)
  if (story.vocabularyIds && story.vocabularyIds.length >= 4) {
    const vocabWord = story.vocabularyIds[0];
    const wrongWords = story.vocabularyIds.slice(1, 4);
    tasks.push({
      type: 'vocabulary',
      questionHe: `מה המשמעות של המילה "${vocabWord}"?`,
      questionEn: `What does "${vocabWord}" mean?`,
      options: [vocabWord, ...wrongWords].sort(() => Math.random() - 0.5),
      correctIndex: 0 // Will be adjusted after shuffle
    });
    // Fix correctIndex after shuffle
    const lastTask = tasks[tasks.length - 1];
    lastTask.correctIndex = lastTask.options.indexOf(vocabWord);
  }

  // Task 3: Another comprehension task
  if (story.wordCount && story.wordCount > 30) {
    const isLong = story.wordCount > 50;
    tasks.push({
      type: 'comprehension',
      questionHe: isLong ? 'האם הסיפור ארוך או קצר?' : 'כמה מילים יש בסיפור?',
      questionEn: isLong ? 'Is the story long or short?' : 'How many words are in the story?',
      options: isLong
        ? ['ארוך / Long', 'קצר / Short', 'בינוני / Medium', 'קשה לדעת / Hard to tell']
        : [`בערך ${story.wordCount}`, `בערך ${story.wordCount + 20}`, `בערך ${Math.max(10, story.wordCount - 15)}`, `בערך ${story.wordCount + 50}`],
      correctIndex: 0
    });
  }

  // Task 4: Difficulty/Level question
  tasks.push({
    type: 'comprehension',
    questionHe: 'מה רמת הקושי של הסיפור?',
    questionEn: 'What is the difficulty level of this story?',
    options: [
      `Level ${story.difficulty}`,
      `Level ${Math.max(1, story.difficulty - 1)}`,
      `Level ${Math.min(5, story.difficulty + 1)}`,
      `Level ${Math.min(5, story.difficulty + 2)}`
    ].sort(() => Math.random() - 0.5),
    correctIndex: 0
  });
  // Fix correctIndex after shuffle
  const lastTask = tasks[tasks.length - 1];
  lastTask.correctIndex = lastTask.options.indexOf(`Level ${story.difficulty}`);

  return tasks;
}
