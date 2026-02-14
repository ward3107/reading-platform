import { useState, useCallback } from 'react';

// ============================================
// FILL IN THE BLANK QUESTION
// ============================================

interface FillBlankProps {
  sentence: string;
  blankWord: string;
  blankWordHe: string;
  options: string[];
  correctIndex: number;
  onAnswer: (correct: boolean) => void;
}

export function FillBlankQuestion({
  sentence,
  blankWord,
  blankWordHe,
  options,
  correctIndex,
  onAnswer
}: FillBlankProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
  };

  const handleCheck = () => {
    if (selected === null) return;
    setShowResult(true);
    onAnswer(selected === correctIndex);
  };

  // Create sentence with blank
  const parts = sentence.split(blankWord);
  const blankDisplay = selected !== null ? options[selected] : '_____';

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Fill in the Blank
          </span>
          <span className="text-sm text-gray-500">מלא את החסר</span>
        </div>

        {/* Sentence with blank */}
        <div className="text-xl text-gray-800 mb-4 text-center p-4 bg-gray-50 rounded-lg">
          {parts[0]}
          <span className={`px-3 py-1 mx-1 rounded-lg font-bold ${
            showResult
              ? selected === correctIndex
                ? 'bg-green-200 text-green-800'
                : 'bg-red-200 text-red-800'
              : 'bg-blue-200 text-blue-800'
          }`}>
            {blankDisplay}
          </span>
          {parts[1]}
        </div>

        {/* Translation hint */}
        <div className="text-center text-gray-500 text-sm mb-4" dir="rtl">
          תרגום: {blankWordHe}
        </div>

        {/* Options */}
        {!showResult ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`p-4 rounded-xl border-2 text-center font-medium transition-all ${
                    selected === idx
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={handleCheck}
              disabled={selected === null}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                selected !== null
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Check Answer / בדוק תשובה
            </button>
          </>
        ) : (
          <div className={`p-4 rounded-xl ${
            selected === correctIndex
              ? 'bg-green-100 border-2 border-green-300'
              : 'bg-red-100 border-2 border-red-300'
          }`}>
            <p className={`font-bold ${
              selected === correctIndex ? 'text-green-700' : 'text-red-700'
            }`}>
              {selected === correctIndex ? '✅ Correct! נכון!' : '❌ Not quite. לא בדיוק.'}
            </p>
            {selected !== correctIndex && (
              <p className="text-gray-600 mt-1">
                The correct answer is: <strong>{options[correctIndex]}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// WORD ORDERING (DRAG AND DROP)
// ============================================

interface WordOrderProps {
  words: string[];
  translation: string;
  onAnswer: (correct: boolean) => void;
}

export function WordOrderQuestion({
  words,
  translation,
  onAnswer
}: WordOrderProps) {
  const [available, setAvailable] = useState<string[]>(() =>
    [...words].sort(() => Math.random() - 0.5)
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const correctOrder = words.join(' ');

  const handleSelectWord = (word: string, fromAvailable: boolean) => {
    if (showResult) return;

    if (fromAvailable) {
      setAvailable(prev => prev.filter(w => w !== word));
      setSelected(prev => [...prev, word]);
    } else {
      setSelected(prev => prev.filter(w => w !== word));
      setAvailable(prev => [...prev, word]);
    }
  };

  const handleCheck = () => {
    if (selected.length === 0) return;
    setShowResult(true);
    const isCorrect = selected.join(' ') === correctOrder;
    onAnswer(isCorrect);
  };

  const handleReset = () => {
    setAvailable([...words].sort(() => Math.random() - 0.5));
    setSelected([]);
    setShowResult(false);
  };

  const isCorrect = selected.join(' ') === correctOrder;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            Word Order
          </span>
          <span className="text-sm text-gray-500">סדר את המילים</span>
        </div>

        {/* Translation hint */}
        <div className="text-center p-4 bg-gray-50 rounded-lg mb-4" dir="rtl">
          <p className="text-gray-500 text-sm mb-1">Translate this:</p>
          <p className="text-lg font-medium text-gray-800">{translation}</p>
        </div>

        {/* Selected words (answer area) */}
        <div className={`min-h-16 p-3 rounded-xl border-2 border-dashed mb-4 flex flex-wrap gap-2 ${
          showResult
            ? isCorrect
              ? 'border-green-400 bg-green-50'
              : 'border-red-400 bg-red-50'
            : 'border-blue-300 bg-blue-50'
        }`}>
          {selected.length === 0 ? (
            <p className="text-gray-400 w-full text-center">Tap words below to build the sentence...</p>
          ) : (
            selected.map((word, idx) => (
              <button
                key={`selected-${idx}`}
                onClick={() => handleSelectWord(word, false)}
                disabled={showResult}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showResult
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {word}
              </button>
            ))
          )}
        </div>

        {/* Available words */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-12 p-2 bg-gray-100 rounded-lg">
          {available.map((word, idx) => (
            <button
              key={`available-${idx}`}
              onClick={() => handleSelectWord(word, true)}
              disabled={showResult}
              className="px-4 py-2 bg-white rounded-lg font-medium border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Actions */}
        {!showResult ? (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
            >
              Reset
            </button>
            <button
              onClick={handleCheck}
              disabled={selected.length === 0}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
                selected.length > 0
                  ? 'bg-purple-500 hover:bg-purple-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Check / בדוק
            </button>
          </div>
        ) : (
          <div className={`p-4 rounded-xl ${
            isCorrect
              ? 'bg-green-100 border-2 border-green-300'
              : 'bg-red-100 border-2 border-red-300'
          }`}>
            <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? '✅ Perfect! מעולה!' : '❌ Try again! נסה שוב!'}
            </p>
            {!isCorrect && (
              <p className="text-gray-600 mt-2">
                Correct order: <strong>{correctOrder}</strong>
              </p>
            )}
            <button
              onClick={handleReset}
              className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// WORD MATCHING
// ============================================

interface MatchingPair {
  english: string;
  hebrew: string;
}

interface WordMatchingProps {
  pairs: MatchingPair[];
  onAnswer: (correct: boolean) => void;
}

export function WordMatchingQuestion({
  pairs,
  onAnswer
}: WordMatchingProps) {
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [matched, setMatched] = useState<MatchingPair[]>([]);
  const [wrongMatch, setWrongMatch] = useState<string | null>(null);

  const englishWords = pairs.map(p => p.english);
  const hebrewWords = [...pairs.map(p => p.hebrew)].sort(() => Math.random() - 0.5);

  const handleSelectEnglish = (word: string) => {
    if (matched.some(m => m.english === word)) return;
    setSelectedEnglish(word);
    setWrongMatch(null);
  };

  const handleSelectHebrew = (word: string) => {
    if (!selectedEnglish) return;
    if (matched.some(m => m.hebrew === word)) return;

    const pair = pairs.find(p => p.english === selectedEnglish);
    if (pair && pair.hebrew === word) {
      // Correct match!
      const newMatched = [...matched, pair];
      setMatched(newMatched);

      if (newMatched.length === pairs.length) {
        // All matched!
        setTimeout(() => onAnswer(true), 500);
      }
    } else {
      // Wrong match
      setWrongMatch(word);
      setTimeout(() => {
        setWrongMatch(null);
        setSelectedEnglish(null);
      }, 800);
      onAnswer(false);
    }
    setSelectedEnglish(null);
  };

  const progress = (matched.length / pairs.length) * 100;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Match Words
            </span>
            <span className="text-sm text-gray-500">התאם מילים</span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {matched.length}/{pairs.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* English column */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 text-center mb-2">English</p>
            {englishWords.map((word) => {
              const isMatched = matched.some(m => m.english === word);
              const isSelected = selectedEnglish === word;
              return (
                <button
                  key={word}
                  onClick={() => handleSelectEnglish(word)}
                  disabled={isMatched}
                  className={`w-full p-3 rounded-xl font-medium transition-all ${
                    isMatched
                      ? 'bg-green-200 text-green-800 line-through'
                      : isSelected
                      ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>

          {/* Hebrew column */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 text-center mb-2">עברית</p>
            {hebrewWords.map((word) => {
              const isMatched = matched.some(m => m.hebrew === word);
              const isWrong = wrongMatch === word;
              return (
                <button
                  key={word}
                  onClick={() => handleSelectHebrew(word)}
                  disabled={isMatched}
                  className={`w-full p-3 rounded-xl font-medium transition-all ${
                    isMatched
                      ? 'bg-green-200 text-green-800 line-through'
                      : isWrong
                      ? 'bg-red-200 text-red-800 animate-shake'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                  }`}
                  dir="rtl"
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {matched.length === pairs.length && (
          <div className="mt-6 p-4 bg-green-100 border-2 border-green-300 rounded-xl text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-bold text-green-700">All matched! הכל הותאם!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// AUDIO PRACTICE (Listen and Type)
// ============================================

interface AudioPracticeProps {
  word: string;
  meaning: string;
  onAnswer: (correct: boolean) => void;
}

export function AudioPracticeQuestion({
  word,
  meaning,
  onAnswer
}: AudioPracticeProps) {
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playWord = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const handleCheck = () => {
    if (!input.trim()) return;
    setShowResult(true);
    const isCorrect = input.trim().toLowerCase() === word.toLowerCase();
    onAnswer(isCorrect);
  };

  const isCorrect = input.trim().toLowerCase() === word.toLowerCase();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            Listen & Type
          </span>
          <span className="text-sm text-gray-500">הקשב והקלד</span>
        </div>

        {/* Play button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={playWord}
            disabled={isPlaying}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all ${
              isPlaying
                ? 'bg-amber-300 animate-pulse'
                : 'bg-amber-500 hover:bg-amber-600'
            } text-white shadow-lg`}
          >
            {isPlaying ? '🔊' : '🔈'}
          </button>
        </div>

        {/* Meaning hint */}
        <div className="text-center mb-4 p-3 bg-gray-50 rounded-lg" dir="rtl">
          <p className="text-gray-500 text-sm">משמעות:</p>
          <p className="text-lg font-medium text-gray-800">{meaning}</p>
        </div>

        {/* Input */}
        {!showResult ? (
          <>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type what you hear..."
              className="w-full p-4 text-xl text-center border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:outline-none"
              dir="ltr"
              autoFocus
            />
            <button
              onClick={handleCheck}
              disabled={!input.trim()}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-white transition-all ${
                input.trim()
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Check / בדוק
            </button>
          </>
        ) : (
          <div className={`p-4 rounded-xl ${
            isCorrect
              ? 'bg-green-100 border-2 border-green-300'
              : 'bg-red-100 border-2 border-red-300'
          }`}>
            <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {isCorrect ? '✅ Correct! נכון!' : '❌ Not quite. לא בדיוק.'}
            </p>
            {!isCorrect && (
              <p className="text-gray-600 mt-1">
                The word is: <strong>{word}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
