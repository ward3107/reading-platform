// Micro-Lessons Data
// Short focused lessons for grammar, vocabulary, and reading tips

export interface MicroLesson {
  id: string;
  title: string;
  titleHe: string;
  type: 'grammar' | 'vocabulary' | 'reading' | 'pronunciation';
  level: number;
  duration: number; // in minutes
  content: LessonContent;
  quiz?: QuizQuestion[];
}

export interface LessonContent {
  intro: string;
  introHe: string;
  sections: LessonSection[];
  summary: string;
  summaryHe: string;
}

export interface LessonSection {
  title: string;
  titleHe?: string;
  content: string;
  contentHe?: string;
  example?: string;
  exampleHe?: string;
  highlight?: string;
}

export interface QuizQuestion {
  question: string;
  questionHe: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  explanationHe?: string;
}

// ============================================
// GRAMMAR LESSONS
// ============================================

export const grammarLessons: MicroLesson[] = [
  {
    id: 'grammar-present-simple',
    title: 'Present Simple Tense',
    titleHe: 'זמן הווה פשוט',
    type: 'grammar',
    level: 1,
    duration: 3,
    content: {
      intro: 'Learn how to talk about things that happen regularly!',
      introHe: 'למדו איך לדבר על דברים שקורים באופן קבוע!',
      sections: [
        {
          title: 'When do we use it?',
          titleHe: 'מתי משתמשים בו?',
          content: 'Use Present Simple for habits, facts, and things that are always true.',
          contentHe: 'משתמשים בהווה פשוט להרגלים, עובדות, ודברים שתמיד נכונים.',
          example: 'I read books every day. / The sun rises in the east.',
          exampleHe: 'אני קורא ספרים כל יום. / השמש זורחת במזרח.',
          highlight: 'every day, always, usually, often, sometimes'
        },
        {
          title: 'Form: I/You/We/They',
          titleHe: 'צורה: אני/אתה/אנחנו/הם',
          content: 'With I, you, we, they - use the base form of the verb.',
          contentHe: 'עם אני, אתה, אנחנו, הם - השתמשו בצורת הבסיס של הפועל.',
          example: 'I play. / We read. / They run.',
          highlight: 'Base form (no changes!)'
        },
        {
          title: 'Form: He/She/It',
          titleHe: 'צורה: הוא/היא/זה',
          content: 'With he, she, it - add -s or -es to the verb.',
          contentHe: 'עם הוא, היא, זה - הוסיפו -s או -es לפועל.',
          example: 'He plays. / She reads. / It runs.',
          highlight: 'Add -s/-es'
        }
      ],
      summary: 'Present Simple = habits & facts. Add -s for he/she/it!',
      summaryHe: 'הווה פשוט = הרגלים ועובדות. הוסף -s להוא/היא/זה!'
    },
    quiz: [
      {
        question: 'Which is correct?',
        questionHe: 'איזה משפט נכון?',
        options: ['She read books.', 'She reads books.', 'She reading books.'],
        correctIndex: 1,
        explanation: 'With "she" we add -s to the verb.',
        explanationHe: 'עם "היא" אנחנו מוסיפים -s לפועל.'
      }
    ]
  },
  {
    id: 'grammar-articles',
    title: 'Articles: A, An, The',
    titleHe: 'תוויות הגדרה: A, An, The',
    type: 'grammar',
    level: 1,
    duration: 2,
    content: {
      intro: 'Learn when to use a, an, and the!',
      introHe: 'למדו מתי להשתמש ב-a, an, ו-the!',
      sections: [
        {
          title: 'A and An',
          titleHe: 'A ו-An',
          content: 'Use "a" before consonant sounds, "an" before vowel sounds.',
          contentHe: 'השתמשו ב-"a" לפני צלילי עיצור, "an" לפני צלילי תנועה.',
          example: 'a book, a cat / an apple, an elephant',
          exampleHe: 'a ספר, a חתול / an תפוח, an פיל'
        },
        {
          title: 'The',
          titleHe: 'The',
          content: 'Use "the" when talking about something specific or known.',
          contentHe: 'השתמשו ב-"the" כשמדברים על משהו ספציפי או ידוע.',
          example: 'The book on the table. / The sun is bright.',
          exampleHe: 'הספר על השולחן. / השמש בהירה.'
        }
      ],
      summary: 'a/an = one of many, the = specific one',
      summaryHe: 'a/an = אחד מיני רבים, the = אחד ספציפי'
    }
  }
];

// ============================================
// VOCABULARY LESSONS
// ============================================

export const vocabularyLessons: MicroLesson[] = [
  {
    id: 'vocab-emotions',
    title: 'Emotions & Feelings',
    titleHe: 'רגשות והרגשות',
    type: 'vocabulary',
    level: 1,
    duration: 3,
    content: {
      intro: 'Learn words to describe how you feel!',
      introHe: 'למדו מילים לתאר איך אתם מרגישים!',
      sections: [
        {
          title: 'Happy Feelings',
          titleHe: 'רגשות טובים',
          content: 'happy 😊, excited 🎉, proud 🏆, grateful 🙏, loved ❤️',
          example: 'I am happy when I read. / She is excited about the trip.'
        },
        {
          title: 'Sad Feelings',
          titleHe: 'רגשות עצובים',
          content: 'sad 😢, worried 😰, lonely 😔, disappointed 😞',
          example: 'He feels sad today. / I am worried about the test.'
        },
        {
          title: 'Other Feelings',
          titleHe: 'רגשות אחרים',
          content: 'angry 😠, surprised 😮, confused 😕, tired 😴',
          example: 'She is angry at her brother. / I am surprised by the news!'
        }
      ],
      summary: 'Feelings help us express ourselves!',
      summaryHe: 'רגשות עוזרים לנו להביע את עצמנו!'
    }
  },
  {
    id: 'vocab-action-words',
    title: 'Action Words (Verbs)',
    titleHe: 'מילות פעולה (פעלים)',
    type: 'vocabulary',
    level: 1,
    duration: 2,
    content: {
      intro: 'Learn verbs to describe actions!',
      introHe: 'למדו פעלים לתאר פעולות!',
      sections: [
        {
          title: 'Movement',
          titleHe: 'תנועה',
          content: 'walk 🚶, run 🏃, jump 🦘, dance 💃, swim 🏊',
          example: 'I walk to school. / Fish swim in water.'
        },
        {
          title: 'Learning',
          titleHe: 'למידה',
          content: 'read 📖, write ✍️, listen 👂, speak 🗣️, learn 📚',
          example: 'We read stories. / Listen to your teacher.'
        },
        {
          title: 'Daily Actions',
          titleHe: 'פעולות יומיומיות',
          content: 'eat 🍽️, drink 🥤, sleep 😴, play 🎮, help 🤝',
          example: 'I eat breakfast. / Children play together.'
        }
      ],
      summary: 'Verbs show what we do!',
      summaryHe: 'פעלים מראים מה אנחנו עושים!'
    }
  }
];

// ============================================
// READING TIPS
// ============================================

export const readingLessons: MicroLesson[] = [
  {
    id: 'reading-context-clues',
    title: 'Using Context Clues',
    titleHe: 'שימוש ברמזי הקשר',
    type: 'reading',
    level: 2,
    duration: 3,
    content: {
      intro: 'Learn to understand new words without a dictionary!',
      introHe: 'למדו להבין מילים חדשות בלי מילון!',
      sections: [
        {
          title: 'What are Context Clues?',
          titleHe: 'מהם רמזי הקשר?',
          content: 'Words around a new word that help you understand its meaning.',
          contentHe: 'מילים מסביב למילה חדשה שעוזרות להבין את המשמעות שלה.',
          example: 'The enormous dog was bigger than any dog I had ever seen.',
          exampleHe: '"Enormous" means very big - we know from "bigger than any dog"'
        },
        {
          title: 'Types of Clues',
          titleHe: 'סוגי רמזים',
          content: '1. Definition clues 2. Example clues 3. Contrast clues',
          contentHe: '1. רמזי הגדרה 2. רמזי דוגמה 3. רמזי ניגוד',
          example: 'She was exhausted, very tired from running. / Unlike his lazy brother, Tom was energetic.'
        }
      ],
      summary: 'Look around the word for hints!',
      summaryHe: 'חפשו מסביב למילה רמזים!'
    }
  }
];

// ============================================
// PRONUNCIATION
// ============================================

export const pronunciationLessons: MicroLesson[] = [
  {
    id: 'pronunciation-th',
    title: 'The TH Sound',
    titleHe: 'צליל TH',
    type: 'pronunciation',
    level: 1,
    duration: 2,
    content: {
      intro: 'Master the tricky TH sound!',
      introHe: 'שלטו בצליל המסובך TH!',
      sections: [
        {
          title: 'How to Make the Sound',
          titleHe: 'איך להפיק את הצליל',
          content: 'Put your tongue between your teeth and blow air out.',
          contentHe: 'שימו את הלשון בין השיניים ונשפו אוויר החוצה.',
          example: 'think, three, thumb, Thursday'
        },
        {
          title: 'Practice Words',
          titleHe: 'מילים לתרגול',
          content: 'this, that, these, those / thank, think, thing',
          example: 'This thing thanks me. / Three thumbs think.'
        }
      ],
      summary: 'Tongue between teeth, blow air!',
      summaryHe: 'לשון בין השיניים, נשוף אוויר!'
    }
  }
];

// All lessons combined
export const allMicroLessons: MicroLesson[] = [
  ...grammarLessons,
  ...vocabularyLessons,
  ...readingLessons,
  ...pronunciationLessons
];

// Get lessons by type
export function getLessonsByType(type: MicroLesson['type']): MicroLesson[] {
  return allMicroLessons.filter(lesson => lesson.type === type);
}

// Get lessons by level
export function getLessonsByLevel(level: number): MicroLesson[] {
  return allMicroLessons.filter(lesson => lesson.level <= level);
}

// Get recommended lessons
export function getRecommendedLessons(currentLevel: number, limit: number = 5): MicroLesson[] {
  return allMicroLessons
    .filter(lesson => lesson.level <= currentLevel)
    .slice(0, limit);
}
