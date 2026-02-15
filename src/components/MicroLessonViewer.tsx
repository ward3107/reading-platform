import { useState } from 'react';
import type { MicroLesson, LessonSection } from '../data/microLessons';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface MicroLessonViewerProps {
  lesson: MicroLesson;
  onComplete: () => void;
  onClose: () => void;
}

export function MicroLessonViewer({ lesson, onComplete, onClose }: MicroLessonViewerProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<'correct' | 'incorrect' | null>(null);
  const [completed, setCompleted] = useState(false);

  const { speak, stop, isSpeaking } = useSpeechSynthesis({ lang: 'en-US', rate: 0.85 });

  const totalSections = lesson.content.sections.length;
  const isLastSection = currentSection === totalSections - 1;
  const isFirstSection = currentSection === 0;

  const handleNext = () => {
    if (isLastSection) {
      if (lesson.quiz) {
        setShowQuiz(true);
      } else {
        setCompleted(true);
      }
    } else {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstSection) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (quizResult) return;
    setQuizAnswer(index);
    const isCorrect = index === lesson.quiz![0].correctIndex;
    setQuizResult(isCorrect ? 'correct' : 'incorrect');
  };

  const handleComplete = () => {
    setCompleted(true);
    onComplete();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grammar': return '📝';
      case 'vocabulary': return '📚';
      case 'reading': return '📖';
      case 'pronunciation': return '🗣️';
      default: return '📚';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'from-blue-500 to-indigo-600';
      case 'vocabulary': return 'from-green-500 to-teal-600';
      case 'reading': return 'from-purple-500 to-pink-600';
      case 'pronunciation': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Completion Screen
  if (completed) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className={`bg-gradient-to-r ${getTypeColor(lesson.type)} p-8 text-white text-center`}>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Lesson Complete!</h2>
          <p className="opacity-90">השיעור הסתיים!</p>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-700 mb-4">{lesson.content.summary}</p>
          <p className="text-gray-500 text-sm mb-6" dir="rtl">{lesson.content.summaryHe}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              חזור / Back
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-teal-600 transition-colors"
            >
              Continue Learning 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (showQuiz && lesson.quiz) {
    const quiz = lesson.quiz[0];
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className={`bg-gradient-to-r ${getTypeColor(lesson.type)} p-5 text-white`}>
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              Quick Quiz 📝
            </span>
            <span className="text-sm opacity-80">בוחן מהיר</span>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-800 mb-2">{quiz.question}</p>
            <p className="text-gray-500" dir="rtl">{quiz.questionHe}</p>
          </div>

          <div className="space-y-3 mb-6">
            {quiz.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleQuizAnswer(idx)}
                disabled={quizResult !== null}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  quizResult === null
                    ? 'bg-gray-100 hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent'
                    : idx === quiz.correctIndex
                    ? 'bg-green-100 border-2 border-green-500 text-green-800'
                    : idx === quizAnswer
                    ? 'bg-red-100 border-2 border-red-500 text-red-800'
                    : 'bg-gray-50 border-2 border-gray-200 text-gray-500'
                }`}
              >
                <span className="font-medium">{option}</span>
                {quizResult !== null && idx === quiz.correctIndex && (
                  <span className="ml-2">✅</span>
                )}
              </button>
            ))}
          </div>

          {quizResult && (
            <div className={`p-4 rounded-xl mb-4 ${
              quizResult === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
            }`}>
              <p className={`font-bold ${
                quizResult === 'correct' ? 'text-green-700' : 'text-amber-700'
              }`}>
                {quizResult === 'correct' ? '✅ Correct! נכון!' : '👍 Good try! ניסיון טוב!'}
              </p>
              {quiz.explanation && (
                <p className="text-gray-600 text-sm mt-1">{quiz.explanation}</p>
              )}
            </div>
          )}

          <button
            onClick={handleComplete}
            disabled={quizResult === null}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
              quizResult !== null
                ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Complete Lesson / סיום השיעור
          </button>
        </div>
      </div>
    );
  }

  // Lesson Content
  const section = lesson.content.sections[currentSection];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getTypeColor(lesson.type)} p-5 text-white`}>
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
            {getTypeIcon(lesson.type)} {lesson.type}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
        <h2 className="text-xl font-bold">{lesson.title}</h2>
        <p className="text-white/80 text-sm">{lesson.titleHe}</p>
      </div>

      {/* Progress */}
      <div className="px-5 py-3 bg-gray-50 border-b">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Section {currentSection + 1} of {totalSections}
          </span>
          <span className="text-sm text-gray-500">⏱️ {lesson.duration} min</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
            style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Intro on first section */}
        {isFirstSection && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-blue-800">{lesson.content.intro}</p>
            <p className="text-blue-600 text-sm mt-1" dir="rtl">{lesson.content.introHe}</p>
          </div>
        )}

        {/* Section */}
        <SectionDisplay section={section} speak={speak} stop={stop} isSpeaking={isSpeaking} />

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePrev}
            disabled={isFirstSection}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              isFirstSection
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            {isLastSection ? (lesson.quiz ? 'Take Quiz 📝' : 'Complete ✓') : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Section Display Component
function SectionDisplay({
  section,
  speak,
  stop,
  isSpeaking
}: {
  section: LessonSection;
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">{section.title}</h3>
        {section.titleHe && (
          <p className="text-gray-500 text-sm" dir="rtl">{section.titleHe}</p>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-gray-700">{section.content}</p>
        {section.contentHe && (
          <p className="text-gray-500 text-sm mt-2" dir="rtl">{section.contentHe}</p>
        )}
      </div>

      {section.example && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">Example:</p>
              <p className="text-gray-800 font-medium">{section.example}</p>
              {section.exampleHe && (
                <p className="text-gray-500 text-sm mt-1" dir="rtl">{section.exampleHe}</p>
              )}
            </div>
            <button
              onClick={() => isSpeaking ? stop() : speak(section.example!)}
              className={`p-2 rounded-lg transition-colors ${
                isSpeaking ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {isSpeaking ? '⏹' : '🔊'}
            </button>
          </div>
        </div>
      )}

      {section.highlight && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 font-medium">
            💡 Key words: <span className="font-bold">{section.highlight}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// Lesson Card for Menu
interface LessonCardProps {
  lesson: MicroLesson;
  onClick: () => void;
  completed?: boolean;
}

export function LessonCard({ lesson, onClick, completed }: LessonCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'grammar': return '📝';
      case 'vocabulary': return '📚';
      case 'reading': return '📖';
      case 'pronunciation': return '🗣️';
      default: return '📚';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'bg-blue-100 text-blue-700';
      case 'vocabulary': return 'bg-green-100 text-green-700';
      case 'reading': return 'bg-purple-100 text-purple-700';
      case 'pronunciation': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-right p-5 rounded-xl border-2 transition-all ${
        completed
          ? 'bg-green-50 border-green-300'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
          {getTypeIcon(lesson.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(lesson.type)}`}>
              {lesson.type}
            </span>
            <span className="text-xs text-gray-400">Level {lesson.level}</span>
            {completed && <span className="text-green-600 text-sm">✓</span>}
          </div>
          <h3 className="font-bold text-gray-800">{lesson.title}</h3>
          <p className="text-sm text-gray-500">{lesson.titleHe}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <span>⏱️ {lesson.duration} min</span>
            {lesson.quiz && <span>📝 Quiz</span>}
          </div>
        </div>
      </div>
    </button>
  );
}
