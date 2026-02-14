import { useState, useCallback, useRef, useEffect } from 'react';
import { preprocessForTTS } from '../utils/ttsPreprocess';

export interface UseSpeechSynthesisOptions {
  /** Language code (e.g. 'en-US', 'he-IL'). Default: 'en-US' */
  lang?: string;
  /** Speech rate 0.1–10. Slower = clearer for learning. Default: 0.88 */
  rate?: number;
  /** Pitch 0–2. Default: 1 */
  pitch?: number;
  /** Speak sentence by sentence for clearer pacing and natural pauses. Default: true */
  speakBySentence?: boolean;
  /** Custom word -> spoken form for pronunciation (e.g. { "GIF": "jif" }). Only affects speech, not display. */
  pronunciationOverrides?: Record<string, string>;
}

/** Split text into sentences for chunked, clearer reading. */
function splitSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** Prefer a clear, natural English voice when available. */
function getPreferredVoice(synth: SpeechSynthesis, lang: string): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  const langPrefix = lang.slice(0, 2);
  const match = (v: SpeechSynthesisVoice) =>
    v.lang.startsWith(langPrefix) || v.lang.startsWith(lang);

  const preferred = voices.find(
    (v) => match(v) && (/google|samantha|daniel|karen|microsoft|zira|david/i.test(v.name) || v.default)
  );
  if (preferred) return preferred;
  const fallback = voices.find((v) => match(v));
  return fallback || voices.find((v) => v.default) || null;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const {
    lang = 'en-US',
    rate = 0.88,
    pitch = 1,
    speakBySentence = true,
    pronunciationOverrides = {},
  } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pendingCountRef = useRef(0);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      pendingCountRef.current = 0;
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis || !text?.trim()) return;

      window.speechSynthesis.cancel();
      pendingCountRef.current = 0;

      const synth = window.speechSynthesis;
      const voice = getPreferredVoice(synth, lang);

      const processedText = preprocessForTTS(text, {
        expandNumbers: true,
        maxNumberToWords: 100,
        overrides: pronunciationOverrides,
      });

      const speakOne = (sentence: string) => {
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = pitch;
        if (voice) utterance.voice = voice;

        utterance.onend = () => {
          pendingCountRef.current -= 1;
          if (pendingCountRef.current <= 0) {
            pendingCountRef.current = 0;
            setIsSpeaking(false);
            setIsPaused(false);
          }
        };
        utterance.onerror = () => {
          pendingCountRef.current -= 1;
          if (pendingCountRef.current <= 0) {
            pendingCountRef.current = 0;
            setIsSpeaking(false);
            setIsPaused(false);
          }
        };

        utteranceRef.current = utterance;
        synth.speak(utterance);
      };

      if (speakBySentence) {
        const sentences = splitSentences(processedText);
        if (sentences.length === 0) return;
        pendingCountRef.current = sentences.length;
        setIsSpeaking(true);
        setIsPaused(false);
        sentences.forEach((s) => speakOne(s));
      } else {
        pendingCountRef.current = 1;
        setIsSpeaking(true);
        setIsPaused(false);
        speakOne(processedText);
      }
    },
    [lang, rate, pitch, speakBySentence, pronunciationOverrides]
  );

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (isSpeaking) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    }
  }, [isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, stop, pause, resume, isSpeaking, isPaused };
}
