const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../public/stories.json');
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

const BOYS = ['Tom', 'Dan', 'Ben', 'Roy', 'Omer', 'Noam', 'Amir', 'Daniel', 'Idan', 'Gal', 'Yoni', 'Nadav', 'Itay', 'Matan', 'Shay'];
const GIRLS = ['Maya', 'Noa', 'Sara', 'Li', 'Tamar', 'Yael', 'Shira', 'Dana', 'Michal', 'Roni', 'Noya', 'Lior', 'Eden', 'Hadar', 'Aviv'];

const HEBREW_BOYS = ['תום', 'דן', 'בן', 'רוי', 'עומר', 'נועם', 'אמיר', 'דניאל', 'עידן', 'גל', 'יוני', 'נדב', 'איתי', 'מתן', 'שי'];
const HEBREW_GIRLS = ['מאיה', 'נועה', 'שרה', 'לי', 'תמר', 'יעל', 'שירה', 'דנה', 'מיכל', 'רוני', 'נויה', 'ליאור', 'עדן', 'הדר', 'אביב'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function wordCount(text) { return text.split(/\s+/).filter(w => w.length > 0).length; }
function sentenceCount(text) { return (text.match(/[.!?]+/g) || []).length; }
function extractVocab(text) {
  const words = text.toLowerCase().split(/\s+/);
  const unique = [...new Set(words.map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 2))];
  return unique.slice(0, 12);
}
function extractEmotions(text) {
  const emotions = ['happy', 'sad', 'angry', 'afraid', 'proud', 'worried', 'excited', 'tired', 'surprised', 'confused', 'brave', 'grateful', 'disappointed', 'curious', 'nervous', 'confident', 'determined'];
  const lower = text.toLowerCase();
  return emotions.filter(e => lower.includes(e));
}

// Get max ID
const maxId = Math.max(...stories.map(s => parseInt(s.id.split('_')[1])));
let idCounter = maxId + 1;
function genId() { return `story_${String(idCounter++).padStart(3, '0')}`; }

// Level 4 unique stories
const level4Templates = [
  (name, heName, pronoun) => ({
    en: `The school announces an environmental competition. ${name} decides to create a recycling program for the cafeteria. First, ${pronoun.toLowerCase()} talks to the principal about the idea. Then, ${pronoun.toLowerCase()} places special bins for paper, plastic, and glass. Within one month, the school reduces its waste by half. ${name} learns that small actions can lead to big changes.`,
    he: `בית הספר מכריז על תחרות סביבתית. ${heName} מחליט ליצור תוכנית מיחזור לקפיטריה. קודם, הוא מדבר עם המנהל על הרעיון. אז, הוא שם פחים מיוחדים לנייר, פלסטיק וזכוכית. תוך חודש אחד, בית הספר מפחית את הפסולת שלו בחצי. ${heName} לומד שפעולות קטנות יכולות להוביל לשינויים גדולים.`,
    theme: 'environment', question: `מה ${heName} יוצר?`, questionEn: `What does ${name} create?`,
    answers: ['תוכנית מיחזור', 'גינה', 'מועדון', 'תחרות'], answersEn: ['Recycling program', 'Garden', 'Club', 'Competition']
  }),
  (name, heName, pronoun) => ({
    en: `${name} is elected as the class representative. The role comes with many responsibilities. Students come to ${name} with their problems and suggestions. ${pronoun} listens carefully to everyone and brings their concerns to the teachers. Through this experience, ${name} learns that leadership means serving others and being a good listener.`,
    he: `${heName} נבחר כנציג הכיתה. התפקיד מגיע עם הרבה אחריות. תלמידים באים ל${heName} עם הבעיות וההצעות שלהם. הוא מקשיב בזהירות לכולם ומביא את הדאגות שלהם למורים. דרך החוויה הזו, ${heName} לומד שמנהיגות פירושה לשרת אחרים ולהיות מאזין טוב.`,
    theme: 'leadership', question: 'מה נציג הכיתה לומד?', questionEn: 'What does the class representative learn?',
    answers: ['מנהיגות פירושה לשרת אחרים', 'להיות הכי חזק', 'לקבל פרסים', 'לצוות על אחרים'], answersEn: ['Leadership means serving others', 'To be the strongest', 'To get prizes', 'To command others']
  }),
  (name, heName, pronoun) => ({
    en: `During a group project, ${name} notices that one team member is struggling. Instead of ignoring the problem, ${name} offers to help. They work together after school to complete the assignment. The project receives an excellent grade, and both students feel proud. ${name} realizes that helping others succeed makes everyone stronger.`,
    he: `במהלך פרויקט קבוצתי, ${heName} שם לב שחבר צוות אחד מתקשה. במקום להתעלם מהבעיה, ${heName} מציע לעזור. הם עובדים יחד אחרי בית הספר כדי להשלים את המשימה. הפרויקט מקבל ציון מצוין, ושני התלמידים מרגישים גאים. ${heName} מבין שעזרה לאחרים להצליח הופכת את כולם לחזקים יותר.`,
    theme: 'teamwork', question: `מה ${heName} מבין?`, questionEn: `What does ${name} realize?`,
    answers: ['עזרה לאחרים מחזקת את כולם', 'רק הציון חשוב', 'צריך לעבוד לבד', 'לא צריך לעזור'], answersEn: ['Helping others makes everyone stronger', 'Only the grade matters', 'Should work alone', 'No need to help']
  }),
  (name, heName, pronoun) => ({
    en: `${name} wants to improve in mathematics. After struggling with homework, ${pronoun.toLowerCase()} decides to ask for extra help. The teacher suggests practicing fifteen minutes every day. ${name} follows this plan for two months. When the next test comes, ${pronoun.toLowerCase()} scores much higher. ${name} understands that consistent effort leads to improvement.`,
    he: `${heName} רוצה להשתפר במתמטיקה. אחרי שמתקשה עם שיעורי הבית, הוא מחליט לבקש עזרה נוספת. המורה מציע להתאמן חמש עשרה דקות כל יום. ${heName} עוקב אחרי התוכנית הזו במשך חודשיים. כשמגיע המבחן הבא, הוא מקבל ציון הרבה יותר גבוה. ${heName} מבין שמאמץ עקבי מוביל לשיפור.`,
    theme: 'perseverance', question: 'מה מוביל לשיפור?', questionEn: 'What leads to improvement?',
    answers: ['מאמץ עקבי', 'מזל', 'עזרה מחברים בלבד', 'לוותר'], answersEn: ['Consistent effort', 'Luck', 'Help from friends only', 'To give up']
  }),
  (name, heName, pronoun) => ({
    en: `A new student joins the class. ${name} notices that the student sits alone during lunch. ${pronoun} decides to invite the new student to sit with ${pronoun.toLowerCase()} and ${pronoun.toLowerCase()} friends. They discover they share many interests. By the end of the week, the new student feels welcome. ${name} learns that small acts of kindness can make a big difference.`,
    he: `תלמיד חדש מצטרף לכיתה. ${heName} שם לב שהתלמיד יושב לבד במהלך הארוחה. הוא מחליט להזמין את התלמיד החדש לשבת איתו ועם החברים שלו. הם מגלים שיש להם הרבה תחומי עניין משותפים. עד סוף השבוע, התלמיד החדש מרגיש מוזמן. ${heName} לומד שמעשי חסד קטנים יכולים לעשות הבדל גדול.`,
    theme: 'kindness', question: `מה ${heName} לומד?`, questionEn: `What does ${name} learn?`,
    answers: ['מעשי חסד קטנים עושים הבדל גדול', 'לא להתערב', 'לחכות שמישהו אחר יעזור', 'חברים חדשים לא חשובים'], answersEn: ['Small acts of kindness make a big difference', 'Not to interfere', 'To wait for someone else to help', 'New friends are not important']
  }),
  (name, heName, pronoun) => ({
    en: `${name} finds a smartphone in the school hallway. ${pronoun} knows that keeping it would be wrong. After checking the lock screen, ${pronoun.toLowerCase()} sees it belongs to a classmate. ${name} returns the phone immediately. The owner is grateful and offers a reward, but ${name} refuses. ${name} believes that honesty is its own reward.`,
    he: `${heName} מוצא סמארטפון במסדרון בית הספר. הוא יודע שלשמור אותו יהיה לא נכון. אחרי שבודק את מסך הנעילה, הוא רואה שהוא שייך לבן כיתה. ${heName} מחזיר את הטלפון מיד. הבעלים אסיר תודה ומציע פרס, אבל ${heName} מסרב. ${heName} מאמין שכנות היא הפרס שלה עצמה.`,
    theme: 'honesty', question: `למה ${heName} מסרב לקבל פרס?`, questionEn: `Why does ${name} refuse the reward?`,
    answers: ['כי כנות היא הפרס שלה עצמה', 'הוא כבר עשיר', 'הוא מפחד', 'הוא לא רוצה צרות'], answersEn: ['Because honesty is its own reward', 'He is already rich', 'He is afraid', 'He does not want trouble']
  })
];

// Level 5 unique stories
const level5Templates = [
  (name, heName, pronoun) => ({
    en: `${name} volunteers at a local animal shelter on weekends. The work involves feeding animals, cleaning cages, and helping visitors find pets to adopt. Through this experience, ${name} develops a deep understanding of responsibility and compassion. ${pronoun} also learns about the importance of community service and how young people can contribute to society in meaningful ways.`,
    he: `${heName} מתנדב במקלט לחיות מקומי בסופי שבוע. העבודה כוללת להאכיל חיות, לנקות כלובים ולעזור למבקרים למצוא חיות מחמד לאמץ. דרך החוויה הזו, ${heName} מפתח הבנה עמוקה של אחריות וחמלה. הוא גם לומד על החשיבות של שירות קהילתי ואיך צעירים יכולים לתרום לחברה בדרכים משמעותיות.`,
    theme: 'volunteering', question: `מה ${heName} מפתח דרך ההתנדבות?`, questionEn: `What does ${name} develop through volunteering?`,
    answers: ['הבנה של אחריות וחמלה', 'מיומנויות טכניות', 'קשרים עסקיים', 'כסף'], answersEn: ['Understanding of responsibility and compassion', 'Technical skills', 'Business connections', 'Money']
  }),
  (name, heName, pronoun) => ({
    en: `When ${name} reads about water scarcity in different parts of the world, ${pronoun.toLowerCase()} decides to research solutions. The investigation reveals that simple technologies like rainwater collection can help many communities. ${name} presents these findings at the school science fair and inspires classmates to think about global challenges. The project demonstrates that knowledge can lead to positive action.`,
    he: `כש${heName} קורא על מחסור במים בחלקים שונים של העולם, הוא מחליט לחקור פתרונות. החקירה חושפת שטכנולוגיות פשוטות כמו איסוף מי גשמים יכולות לעזור להרבה קהילות. ${heName} מציג את הממצאים האלה ביריד המדע של בית הספר ומעודד חברי כיתה לחשוב על אתגרים גלובליים. הפרויקט מדגים שידע יכול להוביל לפעולה חיובית.`,
    theme: 'research', question: 'מה הפרויקט מדגים?', questionEn: 'What does the project demonstrate?',
    answers: ['ידע יכול להוביל לפעולה חיובית', 'מדע הוא קשה', 'אי אפשר לפתור בעיות', 'רק מבוגרים יכולים לעזור'], answersEn: ['Knowledge can lead to positive action', 'Science is hard', 'Problems cannot be solved', 'Only adults can help']
  }),
  (name, heName, pronoun) => ({
    en: `${name} faces peer pressure when friends want to skip class. They say it is just one day and will not matter. ${name} thinks carefully about the consequences and decides to attend class. Later, ${pronoun.toLowerCase()} learns that the teacher gave an important assignment that day. ${name} realizes that making independent choices, even when difficult, is an important part of growing up.`,
    he: `${heName} עומד בפני לחץ חברתי כשחברים רוצים לדלג על שיעור. הם אומרים שזה רק יום אחד ולא ישנה. ${heName} חושב בזהירות על ההשלכות ומחליט להשתתף בשיעור. אחר כך, הוא לומד שהמורה נתן משימה חשובה באותו יום. ${heName} מבין שלקבל החלטות עצמאיות, גם כשקשה, הוא חלק חשוב מלגדול.`,
    theme: 'independence', question: `מה ${heName} מבין?`, questionEn: `What does ${name} realize?`,
    answers: ['לקבל החלטות עצמאיות הוא חלק מלגדול', 'תמיד לעשות מה שחברים עושים', 'לדלג על שיעורים לא משנה', 'לימודים לא חשובים'], answersEn: ['Making independent choices is part of growing up', 'Always do what friends do', 'Skipping class does not matter', 'Studies are not important']
  }),
  (name, heName, pronoun) => ({
    en: `During a debate competition, ${name} must argue for a position that ${pronoun.toLowerCase()} personally disagrees with. At first, this feels uncomfortable. However, as ${name} researches the topic, ${pronoun.toLowerCase()} begins to understand different perspectives. The experience teaches ${name} that understanding opposing viewpoints is essential for meaningful dialogue and that we can learn from those who think differently.`,
    he: `במהלך תחרות דיבייט, ${heName} חייב לטעון בעד עמדה שהוא אישית לא מסכים איתה. בהתחלה, זה מרגיש לא נוח. אבל, כש${heName} חוקר את הנושא, הוא מתחיל להבין נקודות מבט שונות. החוויה מלמדת את ${heName} שהבנת נקודות מבט מנוגדות היא חיונית לדיאלוג משמעותי ושאנחנו יכולים ללמוד מאלה שחושבים אחרת.`,
    theme: 'perspective', question: 'מה החוויה מלמדת?', questionEn: 'What does the experience teach?',
    answers: ['להבין נקודות מבט שונות היא חיונית', 'תמיד להיות צודק', 'לא להקשיב לאחרים', 'דיבייט הוא בזבוז זמן'], answersEn: ['Understanding different perspectives is essential', 'Always be right', 'Do not listen to others', 'Debate is a waste of time']
  }),
  (name, heName, pronoun) => ({
    en: `${name} starts a small business selling handmade crafts at the local market. The venture requires planning, budgeting, and customer service skills. Some days are successful, while others are challenging. Through this entrepreneurial experience, ${name} learns valuable lessons about perseverance, financial responsibility, and the satisfaction of creating something that others appreciate.`,
    he: `${heName} מתחיל עסק קטן שמוכר מלאכות יד בשוק המקומי. המיזם דורש תכנון, תקצוב ומיומנויות שירות לקוחות. ימים מסוימים מצליחים, בעוד אחרים מאתגרים. דרך החוויה היזמית הזו, ${heName} לומד שיעורים יקרי ערך על התמדה, אחריות פיננסית והסיפוק של ליצור משהו שאחרים מעריכים.`,
    theme: 'entrepreneurship', question: `מה ${heName} לומד דרך העסק?`, questionEn: `What does ${name} learn through the business?`,
    answers: ['התמדה ואחריות פיננסית', 'להרוויח כסף מהר', 'שעסקים קלים', 'לא לעבוד קשה'], answersEn: ['Perseverance and financial responsibility', 'To make money quickly', 'That business is easy', 'Not to work hard']
  })
];

function createStory(level, template) {
  const isBoy = Math.random() > 0.5;
  const idx = Math.floor(Math.random() * (isBoy ? BOYS.length : GIRLS.length));
  const name = isBoy ? BOYS[idx] : GIRLS[idx];
  const heName = isBoy ? HEBREW_BOYS[idx] : HEBREW_GIRLS[idx];
  const pronoun = isBoy ? 'He' : 'She';

  const t = template(name, heName, pronoun);

  return {
    id: genId(),
    title: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    titleEn: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    text: t.en,
    hebrewTranslation: t.he,
    difficulty: level,
    wordCount: wordCount(t.en),
    sentences: sentenceCount(t.en),
    vocabularyIds: extractVocab(t.en),
    emotionWords: extractEmotions(t.en),
    themes: [t.theme],
    comprehensionQuestion: t.question,
    comprehensionQuestionEn: t.questionEn,
    answerOptions: t.answers,
    answerOptionsEn: t.answersEn,
    correctAnswerIndex: 0
  };
}

// Count by level
const byLevel = {};
stories.forEach(s => { byLevel[s.difficulty] = (byLevel[s.difficulty] || 0) + 1; });
console.log('Current distribution:', JSON.stringify(byLevel));

// Add stories to reach target
const TARGET = { 1: 50, 2: 50, 3: 100, 4: 50, 5: 50 };
const newStories = [];

// Add Level 4 stories
const needed4 = Math.max(0, TARGET[4] - (byLevel[4] || 0));
console.log(`Adding ${needed4} Level 4 stories...`);
for (let i = 0; i < needed4; i++) {
  const template = level4Templates[i % level4Templates.length];
  newStories.push(createStory(4, template));
}

// Add Level 5 stories
const needed5 = Math.max(0, TARGET[5] - (byLevel[5] || 0));
console.log(`Adding ${needed5} Level 5 stories...`);
for (let i = 0; i < needed5; i++) {
  const template = level5Templates[i % level5Templates.length];
  newStories.push(createStory(5, template));
}

// Combine and save
const allStories = [...stories, ...newStories];
fs.writeFileSync(storiesPath, JSON.stringify(allStories, null, 2));

console.log(`\nAdded ${newStories.length} new stories`);

// Final count
const finalByLevel = {};
allStories.forEach(s => { finalByLevel[s.difficulty] = (finalByLevel[s.difficulty] || 0) + 1; });
console.log('Final distribution:', JSON.stringify(finalByLevel));
console.log('Total stories:', allStories.length);
