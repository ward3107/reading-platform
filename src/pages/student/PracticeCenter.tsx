import { useState, useCallback } from 'react';
import type { Student } from '../../types';
import {
  FillBlankQuestion,
  WordOrderQuestion,
  WordMatchingQuestion,
  AudioPracticeQuestion
} from '../../components/InteractiveQuestions';

interface PracticeCenterProps {
  student: Student;
  onBack: () => void;
}

type PracticeType = 'menu' | 'fillBlank' | 'wordOrder' | 'matching' | 'audio';

interface PracticeResult {
  correct: number;
  total: number;
}

function PracticeCenter({ onBack }: PracticeCenterProps) {
  const [practiceType, setPracticeType] = useState<PracticeType>('menu');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [results, setResults] = useState<PracticeResult>({ correct: 0, total: 0 });

  const handleAnswer = useCallback((correct: boolean) => {
    setResults(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
  }, []);

  const nextQuestion = () => {
    setQuestionIndex(prev => prev + 1);
  };

  const goToMenu = () => {
    setPracticeType('menu');
    setQuestionIndex(0);
    setResults({ correct: 0, total: 0 });
  };

  // Demo data for each practice type
  const fillBlankQuestions = [
    {
      sentence: 'I _____ to school every day.',
      blankWord: 'go',
      blankWordHe: 'הולך/ה',
      options: ['go', 'goes', 'going', 'went'],
      correctIndex: 0
    },
    {
      sentence: 'She _____ a book.',
      blankWord: 'reads',
      blankWordHe: 'קוראת',
      options: ['read', 'reads', 'reading', 'readed'],
      correctIndex: 1
    },
    {
      sentence: 'The cat is _____ the table.',
      blankWord: 'under',
      blankWordHe: 'מתחת',
      options: ['on', 'in', 'under', 'at'],
      correctIndex: 2
    }
  ];

  const wordOrderQuestions = [
    { words: ['I', 'love', 'reading', 'books'], translation: 'אני אוהב לקרוא ספרים' },
    { words: ['She', 'is', 'happy', 'today'], translation: 'היא שמחה היום' },
    { words: ['We', 'play', 'together', 'every', 'day'], translation: 'אנחנו משחקים יחד כל יום' }
  ];

  const matchingPairs = [
    { english: 'happy', hebrew: 'שמח' },
    { english: 'sad', hebrew: 'עצוב' },
    { english: 'big', hebrew: 'גדול' },
    { english: 'small', hebrew: 'קטן' },
    { english: 'fast', hebrew: 'מהיר' }
  ];

  const audioQuestions = [
    { word: 'beautiful', meaning: 'יפה' },
    { word: 'important', meaning: 'חשוב' },
    { word: 'wonderful', meaning: 'נפלא' }
  ];

  // Menu Screen
  if (practiceType === 'menu') {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span>→</span>
          <span>חזור / Back</span>
        </button>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 lg:p-8 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
              🎮
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Practice Zone</h1>
              <p className="text-purple-100 text-lg">אזור התרגול</p>
            </div>
          </div>
          <p className="text-purple-100">
            Choose a practice type to improve your skills!
          </p>
        </div>

        {/* Practice Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setPracticeType('fillBlank')}
            className="bg-white rounded-2xl shadow-lg p-6 text-right hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">
                ✏️
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">Fill in the Blank</h3>
                <p className="text-gray-500">מלא את החסר</p>
                <p className="text-sm text-blue-600 mt-1">Complete sentences</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPracticeType('wordOrder')}
            className="bg-white rounded-2xl shadow-lg p-6 text-right hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl">
                🔀
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">Word Order</h3>
                <p className="text-gray-500">סדר את המילים</p>
                <p className="text-sm text-purple-600 mt-1">Arrange words correctly</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPracticeType('matching')}
            className="bg-white rounded-2xl shadow-lg p-6 text-right hover:shadow-xl transition-all border-2 border-transparent hover:border-green-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl">
                🔗
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">Word Matching</h3>
                <p className="text-gray-500">התאם מילים</p>
                <p className="text-sm text-green-600 mt-1">Match English to Hebrew</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setPracticeType('audio')}
            className="bg-white rounded-2xl shadow-lg p-6 text-right hover:shadow-xl transition-all border-2 border-transparent hover:border-amber-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-3xl">
                🎧
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">Listen & Type</h3>
                <p className="text-gray-500">הקשב והקלד</p>
                <p className="text-sm text-amber-600 mt-1">Audio practice</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Practice Screens
  const renderPractice = () => {
    switch (practiceType) {
      case 'fillBlank': {
        const q = fillBlankQuestions[questionIndex % fillBlankQuestions.length];
        return (
          <FillBlankQuestion
            {...q}
            onAnswer={handleAnswer}
          />
        );
      }
      case 'wordOrder': {
        const q = wordOrderQuestions[questionIndex % wordOrderQuestions.length];
        return (
          <WordOrderQuestion
            words={q.words}
            translation={q.translation}
            onAnswer={handleAnswer}
          />
        );
      }
      case 'matching':
        return (
          <WordMatchingQuestion
            pairs={matchingPairs}
            onAnswer={handleAnswer}
          />
        );
      case 'audio': {
        const q = audioQuestions[questionIndex % audioQuestions.length];
        return (
          <AudioPracticeQuestion
            word={q.word}
            meaning={q.meaning}
            onAnswer={handleAnswer}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToMenu}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <span>→</span>
            <span>Back</span>
          </button>

          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              ✅ {results.correct}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
              Total: {results.total}
            </span>
          </div>

          <button
            onClick={nextQuestion}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Practice Content */}
      {renderPractice()}
    </div>
  );
}

export default PracticeCenter;
