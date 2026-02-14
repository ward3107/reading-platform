import { useState, useEffect, useCallback } from 'react';
import type { Student, VocabularyWord, VocabularyProgress } from '../../types';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import {
  calculateNextReview,
  getWordsForReview,
  getStudyStats,
  createNewProgress,
  getIntervalLabel
} from '../../utils/spacedRepetition';

interface VocabularyReviewProps {
  student: Student;
  onBack: () => void;
}

// Demo vocabulary words (in production, these would come from Firestore)
const DEMO_VOCABULARY: VocabularyWord[] = [
  { id: 'w1', word: 'happy', meaning: 'feeling pleasure', meaningHe: 'שמח', example: 'I am happy today.', difficulty: 1, category: 'emotions' },
  { id: 'w2', word: 'run', meaning: 'move quickly on feet', meaningHe: 'לרוץ', example: 'I run every morning.', difficulty: 1, category: 'actions' },
  { id: 'w3', word: 'beautiful', meaning: 'very pretty', meaningHe: 'יפה', example: 'The flower is beautiful.', difficulty: 2, category: 'descriptions' },
  { id: 'w4', word: 'friend', meaning: 'a person you like', meaningHe: 'חבר', example: 'She is my best friend.', difficulty: 1, category: 'people' },
  { id: 'w5', word: 'learn', meaning: 'gain knowledge', meaningHe: 'ללמוד', example: 'I learn English at school.', difficulty: 1, category: 'actions' },
  { id: 'w6', word: 'important', meaning: 'of great value', meaningHe: 'חשוב', example: 'Reading is important.', difficulty: 2, category: 'descriptions' },
  { id: 'w7', word: 'together', meaning: 'with each other', meaningHe: 'יחד', example: 'We play together.', difficulty: 2, category: 'descriptions' },
  { id: 'w8', word: 'wonderful', meaning: 'extremely good', meaningHe: 'נפלא', example: 'What a wonderful day!', difficulty: 3, category: 'descriptions' },
  { id: 'w9', word: 'adventure', meaning: 'exciting experience', meaningHe: 'הרפתקה', example: 'We went on an adventure.', difficulty: 3, category: 'descriptions' },
  { id: 'w10', word: 'believe', meaning: 'accept as true', meaningHe: 'להאמין', example: 'I believe in you!', difficulty: 3, category: 'actions' },
];

// Generate demo progress
function generateDemoProgress(studentId: string): VocabularyProgress[] {
  return DEMO_VOCABULARY.map((word, index) => {
    const progress = createNewProgress(word.id, studentId);
    // Vary the initial state for demo
    if (index < 3) {
      progress.status = 'learning';
      progress.timesReviewed = index + 1;
      progress.timesCorrect = index;
    } else if (index < 5) {
      progress.status = 'review';
      progress.timesReviewed = 3;
      progress.timesCorrect = 2;
      progress.interval = 7;
      progress.easeFactor = 2.3;
    }
    return progress;
  });
}

type ReviewStep = 'intro' | 'review' | 'result' | 'complete';

function VocabularyReview({ student, onBack }: VocabularyReviewProps) {
  const [progress, setProgress] = useState<VocabularyProgress[]>([]);
  const [reviewWords, setReviewWords] = useState<VocabularyProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<ReviewStep>('intro');
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  const { speak, stop, isSpeaking } = useSpeechSynthesis({ lang: 'en-US', rate: 0.8 });

  // Load vocabulary progress
  useEffect(() => {
    // In production, this would load from Firestore
    const demoProgress = generateDemoProgress(student.id);
    setProgress(demoProgress);
  }, [student.id]);

  // Get current word data
  const currentProgress = reviewWords[currentIndex];
  const currentWord = DEMO_VOCABULARY.find(w => w.id === currentProgress?.wordId);

  const stats = getStudyStats(progress);
  const dueToday = getWordsForReview(progress, 10);

  const startReview = useCallback(() => {
    setReviewWords(dueToday);
    setCurrentIndex(0);
    setStep('review');
    setShowAnswer(false);
    setSelectedQuality(null);
    setSessionStats({ correct: 0, incorrect: 0 });
  }, [dueToday]);

  const handleAnswer = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    setSelectedQuality(quality);

    // Update progress using spaced repetition algorithm
    const updatedProgress = calculateNextReview(currentProgress, quality);
    const newProgress = [...progress];
    const idx = newProgress.findIndex(p => p.wordId === currentProgress.wordId);
    if (idx !== -1) {
      newProgress[idx] = updatedProgress;
    }
    setProgress(newProgress);

    // Update session stats
    if (quality >= 3) {
      setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setSessionStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    setStep('result');
  };

  const nextWord = () => {
    if (currentIndex < reviewWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setSelectedQuality(null);
      setStep('review');
    } else {
      setStep('complete');
    }
  };

  // Quality buttons for SM-2 algorithm
  const qualityButtons = [
    { quality: 1, label: 'Again', emoji: '😰', color: 'bg-red-500 hover:bg-red-600', desc: 'Complete failure' },
    { quality: 2, label: 'Hard', emoji: '😐', color: 'bg-orange-500 hover:bg-orange-600', desc: 'Incorrect, but remembered' },
    { quality: 3, label: 'Good', emoji: '🙂', color: 'bg-yellow-500 hover:bg-yellow-600', desc: 'Correct with effort' },
    { quality: 4, label: 'Easy', emoji: '😊', color: 'bg-green-500 hover:bg-green-600', desc: 'Correct after hesitation' },
    { quality: 5, label: 'Perfect', emoji: '🎉', color: 'bg-teal-500 hover:bg-teal-600', desc: 'Perfect response' },
  ];

  // Intro Screen
  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span>→</span>
          <span>חזור / Back</span>
        </button>

        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl p-6 lg:p-8 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl lg:text-4xl">
              📚
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">סקירת אוצר מילים</h1>
              <p className="text-purple-100 text-lg">Vocabulary Review</p>
            </div>
          </div>
          <p className="text-purple-100 text-lg">
            תרגל מילים באמצעות שיטת החזרה המרווחת לזיכרון טוב יותר!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalWords}</div>
            <div className="text-sm text-gray-500">Total Words</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-2xl font-bold text-violet-600">{stats.dueToday}</div>
            <div className="text-sm text-gray-500">Due Today</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-green-600">{stats.masteredWords}</div>
            <div className="text-sm text-gray-500">Mastered</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-blue-600">{stats.accuracyToday}%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
        </div>

        {/* Progress by Status */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-gray-800 mb-4">Learning Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">🆕 New</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${(stats.newWords / stats.totalWords) * 100}%` }} />
                </div>
                <span className="font-medium text-gray-700">{stats.newWords}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">📖 Learning</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(stats.learningWords / stats.totalWords) * 100}%` }} />
                </div>
                <span className="font-medium text-gray-700">{stats.learningWords}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">🔄 Review</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${(stats.reviewWords / stats.totalWords) * 100}%` }} />
                </div>
                <span className="font-medium text-gray-700">{stats.reviewWords}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">⭐ Mastered</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: `${(stats.masteredWords / stats.totalWords) * 100}%` }} />
                </div>
                <span className="font-medium text-gray-700">{stats.masteredWords}</span>
              </div>
            </div>
          </div>
        </div>

        {stats.dueToday > 0 ? (
          <button
            onClick={startReview}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg"
          >
            🚀 התחל סקירה ({stats.dueToday} מילים)
          </button>
        ) : (
          <div className="bg-green-100 border-2 border-green-300 rounded-xl p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-green-700">All caught up!</p>
            <p className="text-green-600">No words due for review today.</p>
          </div>
        )}
      </div>
    );
  }

  // Review Screen
  if (step === 'review' && currentWord) {
    return (
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
              ✕ Close
            </button>
            <div className="text-center">
              <p className="font-bold text-gray-800">{currentIndex + 1} / {reviewWords.length}</p>
            </div>
            <div className="w-8" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / reviewWords.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Word Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white text-center">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold mb-3 inline-block">
              {currentProgress.status === 'new' ? '🆕 New' : currentProgress.status === 'learning' ? '📖 Learning' : '🔄 Review'}
            </span>
            <h2 className="text-4xl font-bold mb-2">{currentWord.word}</h2>
            <button
              onClick={() => (isSpeaking ? stop() : speak(currentWord.word))}
              className={`mt-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isSpeaking ? '⏹ Stop' : '🔊 Listen'}
            </button>
          </div>

          <div className="p-6">
            {!showAnswer ? (
              <div className="text-center">
                <p className="text-gray-500 mb-6">Think about the meaning...</p>
                <button
                  onClick={() => setShowAnswer(true)}
                  className="px-8 py-4 bg-violet-100 text-violet-700 rounded-xl font-bold text-lg hover:bg-violet-200 transition-all"
                >
                  👁 Show Answer
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Meaning */}
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800 mb-2">{currentWord.meaning}</p>
                  <p className="text-xl text-gray-600" dir="rtl">{currentWord.meaningHe}</p>
                </div>

                {/* Example */}
                {currentWord.example && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Example:</p>
                    <p className="text-gray-700 italic">"{currentWord.example}"</p>
                  </div>
                )}

                {/* How well did you know it? */}
                <div>
                  <p className="text-center text-gray-700 font-medium mb-3">How well did you know this?</p>
                  <div className="grid grid-cols-5 gap-2">
                    {qualityButtons.map(btn => (
                      <button
                        key={btn.quality}
                        onClick={() => handleAnswer(btn.quality as 0|1|2|3|4|5)}
                        className="flex flex-col items-center p-3 rounded-xl text-white transition-all hover:scale-105"
                        title={btn.desc}
                      >
                        <span className="text-2xl mb-1">{btn.emoji}</span>
                        <span className="text-xs font-medium">{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Result Screen (after answering)
  if (step === 'result' && currentWord && selectedQuality !== null) {
    const qualityBtn = qualityButtons.find(b => b.quality === selectedQuality)!;
    const updatedProgress = progress.find(p => p.wordId === currentWord.id)!;

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{qualityBtn.emoji}</div>
            <h3 className="text-xl font-bold text-gray-800">{qualityBtn.label}!</h3>
            <p className="text-gray-500">{qualityBtn.desc}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Word:</span>
              <span className="font-bold text-gray-800">{currentWord.word}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Meaning:</span>
              <span className="font-medium text-gray-700">{currentWord.meaningHe}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Next review:</span>
              <span className="font-medium text-violet-600">In {getIntervalLabel(updatedProgress.interval)}</span>
            </div>
          </div>

          <button
            onClick={nextWord}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-700 transition-all"
          >
            {currentIndex < reviewWords.length - 1 ? 'Next Word →' : 'Complete Review 🎉'}
          </button>
        </div>
      </div>
    );
  }

  // Complete Screen
  if (step === 'complete') {
    const accuracy = Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100) || 0;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl p-6 lg:p-8 text-white shadow-xl text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Review Complete!</h1>
          <p className="text-green-100 text-lg">Great job practicing today!</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-800 mb-4 text-center">Session Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-800">{reviewWords.length}</div>
              <div className="text-sm text-gray-500">Reviewed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{sessionStats.correct}</div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-violet-600">{accuracy}%</div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all"
          >
            חזור / Back
          </button>
          <button
            onClick={startReview}
            className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-700 transition-all"
          >
            Review More
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default VocabularyReview;
