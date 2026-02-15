/**
 * Preprocess text for text-to-speech to reduce mispronunciations.
 * Only the returned string is spoken; display text is unchanged.
 */

/** Type for pattern-replacement pairs */
type PatternReplacement = [pattern: RegExp | string, replacement: string];

/** Expand abbreviations and symbols so TTS pronounces them correctly. */
const ABBREVIATIONS: PatternReplacement[] = [
  [/\betc\.?\s/gi, 'et cetera '],
  [/\be\.g\.?\s/gi, 'for example '],
  [/\bi\.e\.?\s/gi, 'that is '],
  [/\bMr\.?\s/g, 'Mister '],
  [/\bMrs\.?\s/g, 'Missus '],
  [/\bMs\.?\s/g, 'Ms '],
  [/\bDr\.?\s/g, 'Doctor '],
  [/\bvs\.?\s/gi, 'versus '],
  [/\bNo\.\s/g, 'number '],
  [/\bapprox\.?\s/gi, 'approximately '],
  [/\bFig\.?\s/gi, 'Figure '],
  [/\bvol\.?\s/gi, 'volume '],
  [/\bSt\.\s/g, 'Street '],
  [/\bAve\.?\s/g, 'Avenue '],
  [/\baka\b/gi, 'also known as'],
  [/\b&\s/g, ' and '],
  [/\s&\s/g, ' and '],
  [/%/g, ' percent '],
  [/\$\s*(\d+)/g, '$1 dollars '],
  [/\s@\s/g, ' at '],
  [/\s#\s*(\d+)/g, ' number $1 '],
];

/** Contractions -> expanded form for clearer pronunciation. */
const CONTRACTIONS: [RegExp, string][] = [
  [/\bdon't\b/gi, 'do not'],
  [/\bdoesn't\b/gi, 'does not'],
  [/\bdidn't\b/gi, 'did not'],
  [/\bwon't\b/gi, 'will not'],
  [/\bwouldn't\b/gi, 'would not'],
  [/\bcan't\b/gi, 'cannot'],
  [/\bcouldn't\b/gi, 'could not'],
  [/\bshan't\b/gi, 'shall not'],
  [/\bshouldn't\b/gi, 'should not'],
  [/\bisn't\b/gi, 'is not'],
  [/\baren't\b/gi, 'are not'],
  [/\bwasn't\b/gi, 'was not'],
  [/\bweren't\b/gi, 'were not'],
  [/\bhaven't\b/gi, 'have not'],
  [/\bhasn't\b/gi, 'has not'],
  [/\bhadn't\b/gi, 'had not'],
  [/\bwe're\b/gi, 'we are'],
  [/\bthey're\b/gi, 'they are'],
  [/\byou're\b/gi, 'you are'],
  [/\bI'm\b/gi, 'I am'],
  [/\bhe's\b/gi, 'he is'],
  [/\bshe's\b/gi, 'she is'],
  [/\bit's\b/gi, 'it is'],
  [/\bthat's\b/gi, 'that is'],
  [/\bwhat's\b/gi, 'what is'],
  [/\bwho's\b/gi, 'who is'],
  [/\bwe'll\b/gi, 'we will'],
  [/\bthey'll\b/gi, 'they will'],
  [/\byou'll\b/gi, 'you will'],
  [/\bI'll\b/gi, 'I will'],
  [/\bhe'll\b/gi, 'he will'],
  [/\bshe'll\b/gi, 'she will'],
  [/\bit'll\b/gi, 'it will'],
  [/\bthat'll\b/gi, 'that will'],
  [/\bI've\b/gi, 'I have'],
  [/\bwe've\b/gi, 'we have'],
  [/\bthey've\b/gi, 'they have'],
  [/\byou've\b/gi, 'you have'],
  [/\bI'd\b/gi, 'I would'],
  [/\bwe'd\b/gi, 'we would'],
  [/\bthey'd\b/gi, 'they would'],
  [/\byou'd\b/gi, 'you would'],
  [/\bhe'd\b/gi, 'he would'],
  [/\bshe'd\b/gi, 'she would'],
  [/\blet's\b/gi, 'let us'],
  [/\bthere's\b/gi, 'there is'],
  [/\bthere're\b/gi, 'there are'],
  [/\bhere's\b/gi, 'here is'],
  [/\bwho'll\b/gi, 'who will'],
  [/\bwhat'll\b/gi, 'what will'],
  [/\bwould've\b/gi, 'would have'],
  [/\bcould've\b/gi, 'could have'],
  [/\bshould've\b/gi, 'should have'],
  [/\bmust've\b/gi, 'must have'],
  [/\bneedn't\b/gi, 'need not'],
  [/\bain't\b/gi, 'am not'],
];

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TEENS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function numberToWords(n: number): string {
  if (n < 0 || n > 9999) return String(n);
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return ONES[h] + ' hundred' + (rest ? ' ' + numberToWords(rest) : '');
  }
  const th = Math.floor(n / 1000);
  const rest = n % 1000;
  return numberToWords(th) + ' thousand' + (rest ? ' ' + numberToWords(rest) : '');
}

/**
 * Preprocess text for clearer TTS: expand abbreviations, contractions,
 * optional overrides, and optionally convert numbers to words.
 */
export function preprocessForTTS(
  text: string,
  options: {
    expandNumbers?: boolean;
    maxNumberToWords?: number;
    overrides?: Record<string, string>;
  } = {}
): string {
  const { expandNumbers = true, maxNumberToWords = 100, overrides = {} } = options;
  let out = text.trim().replace(/\s+/g, ' ');

  // Apply custom pronunciation overrides (word-boundary, case-insensitive)
  const overrideEntries = Object.entries(overrides);
  if (overrideEntries.length > 0) {
    for (const [key, value] of overrideEntries) {
      const re = new RegExp(`\\b${escapeRegex(key)}\\b`, 'gi');
      out = out.replace(re, value);
    }
  }

  // Abbreviations and symbols
  for (const [pattern, replacement] of ABBREVIATIONS) {
    if (typeof pattern === 'string') {
      out = out.replaceAll(pattern, replacement);
    } else {
      out = out.replace(pattern, replacement);
    }
  }

  // Contractions
  for (const [re, replacement] of CONTRACTIONS) {
    out = out.replace(re, replacement);
  }

  // Ordinals (e.g. 1st, 2nd, 3rd, 4th)
  out = out.replace(/\b(\d+)(st|nd|rd|th)\b/gi, (_match, num, _suffix) => {
    const n = parseInt(num, 10);
    if (n === 1) return 'first';
    if (n === 2) return 'second';
    if (n === 3) return 'third';
    if (n <= 20) return numberToWords(n) + 'th';
    return numberToWords(n) + 'th';
  });

  // Standalone numbers -> words (e.g. "1" -> "one", "12" -> "twelve")
  if (expandNumbers) {
    out = out.replace(/\b(\d+)\b/g, (match) => {
      const n = parseInt(match, 10);
      return n <= maxNumberToWords ? numberToWords(n) : match;
    });
  }

  // Ensure space after sentence endings
  out = out.replace(/([.!?])([A-Za-z])/g, '$1 $2');
  return out.replace(/\s+/g, ' ').trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
