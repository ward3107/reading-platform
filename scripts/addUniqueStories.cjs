const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../public/stories.json');
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

console.log('Current stories:', stories.length);

// Get max ID
const maxId = Math.max(...stories.map(s => parseInt(s.id.split('_')[1])));
let idCounter = maxId + 1;
function genId() { return `story_${String(idCounter++).padStart(3, '0')}`; }

function wc(text) { return text.split(/\s+/).filter(w => w.length > 0).length; }
function sc(text) { return (text.match(/[.!?]+/g) || []).length; }
function vocab(text) {
  const words = text.toLowerCase().split(/\s+/);
  return [...new Set(words.map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 2))].slice(0, 12);
}
function emotions(text) {
  const ems = ['happy', 'sad', 'angry', 'afraid', 'proud', 'worried', 'excited', 'tired', 'surprised', 'confused', 'brave', 'grateful', 'disappointed', 'curious', 'nervous', 'confident', 'determined'];
  const lower = text.toLowerCase();
  return ems.filter(e => lower.includes(e));
}

// Unique Level 1 stories (simple vocabulary, 4-5 sentences)
const level1Stories = [
  { en: "Tom has a red ball. He plays in the park. The ball rolls away. A dog brings it back. Tom is happy.", he: "לתום יש כדור אדום. הוא משחק בפארק. הכדור מתגלגל החוצה. כלב מחזיר אותו. תום שמח.", theme: "play", q: "מה הכלב עושה?", qEn: "What does the dog do?", a: ["מחזיר את הכדור", "לוקח את הכדור", "נושך את הכדור", "בורח"] },
  { en: "Maya draws a picture. She uses blue and green. The picture is of a tree. Mom puts it on the wall. Maya smiles.", he: "מאיה מציירת תמונה. היא משתמשת בכחול וירוק. התמונה היא של עץ. אמא שמה אותה על הקיר. מאיה מחייכת.", theme: "art", q: "מה מאיה מציירת?", qEn: "What does Maya draw?", a: ["עץ", "פרח", "בית", "כלב"] },
  { en: "Dan eats lunch at school. He has a sandwich. His friend sits next to him. They talk and eat. Lunch is fun.", he: "דן אוכל ארוחת צהריים בבית ספר. יש לו כריך. החבר שלו יושב לידו. הם מדברים ואוכלים. ארוחת צהריים כיף.", theme: "school", q: "מה דן אוכל?", qEn: "What does Dan eat?", a: ["כריך", "פיצה", "סלט", "פסטה"] },
  { en: "Noa helps her mom. She cleans her room. She puts toys in a box. Mom gives her a hug. Noa feels proud.", he: "נועה עוזרת לאמא שלה. היא מנקה את החדר שלה. היא שמה צעצועים בקופסה. אמא חיבוק אותה. נועה מרגישה גאה.", theme: "helping", q: "מה נועה מנקה?", qEn: "What does Noa clean?", a: ["את החדר שלה", "את המטבח", "את הסלון", "את החצר"] },
  { en: "Ben has a pet fish. The fish is orange. Ben feeds it every day. He watches it swim. The fish is happy.", he: "לבן יש דג מחמד. הדג הוא כתום. בן מאכיל אותו כל יום. הוא צופה בו שוחה. הדג שמח.", theme: "pets", q: "איזה צבע הדג?", qEn: "What color is the fish?", a: ["כתום", "כחול", "אדום", "ירוק"] },
  { en: "Li reads a book about cats. The book has many pictures. She reads ten pages. The story is funny. Li laughs.", he: "לי קוראת ספר על חתולים. לספר יש הרבה תמונות. היא קוראת עשר עמודים. הסיפור מצחיק. לי צוחקת.", theme: "reading", q: "על מה הספר?", qEn: "What is the book about?", a: ["חתולים", "כלבים", "ציפורים", "דגים"] },
  { en: "Roy plays with blocks. He builds a tall tower. The tower falls down. He builds it again. Roy is patient.", he: "רוי משחק עם קוביות. הוא בונה מגדל גבוה. המגדל נופל. הוא בונה אותו שוב. רוי סבלני.", theme: "play", q: "מה רוי בונה?", qEn: "What does Roy build?", a: ["מגדל", "בית", "גשר", "מכונית"] },
  { en: "Sara visits grandma. Grandma makes cookies. They smell good. Sara eats two cookies. Grandma smiles.", he: "שרה מבקרת את סבתא. סבתא עושה עוגיות. הן מריחות טוב. שרה אוכלת שתי עוגיות. סבתא מחייכת.", theme: "family", q: "מה סבתא עושה?", qEn: "What does grandma make?", a: ["עוגיות", "עוגה", "לחם", "פשטידה"] },
  { en: "Yael rides her bike. She rides to the park. The sun is warm. She sees her friends. They play together.", he: "יעל רוכבת על האופניים שלה. היא רוכבת לפארק. השמש חמה. היא רואה את החברים שלה. הם משחקים יחד.", theme: "outdoor", q: "לאן יעל רוכבת?", qEn: "Where does Yael ride?", a: ["לפארק", "לבית הספר", "לחנות", "לבית"] },
  { en: "Itay puts on his shoes. He is ready for school. Mom gives him a bag. He says goodbye. Itay walks to school.", he: "איתי נועל את הנעליים שלו. הוא מוכן לבית ספר. אמא נותנת לו תיק. הוא אומר להתראות. איתי הולך לבית ספר.", theme: "school", q: "לאן איתי הולך?", qEn: "Where is Itay going?", a: ["לבית ספר", "לפארק", "לחנות", "לסבתא"] },
  { en: "Noya waters the flowers. The flowers are red and pink. They grow big. Bees come to the flowers. Noya watches them.", he: "נויה משקה את הפרחים. הפרחים אדומים וורודים. הם גדלים גדול. דבורים באות לפרחים. נויה צופה בהן.", theme: "nature", q: "איזה צבע הפרחים?", qEn: "What color are the flowers?", a: ["אדומים וורודים", "כחולים", "צהובים", "לבנים"] },
  { en: "Gal counts the stars. It is night time. The sky is dark. He sees many stars. Gal feels small but happy.", he: "גל סופר את הכוכבים. זה בלילה. השמיים כהים. הוא רואה הרבה כוכבים. גל מרגיש קטן אבל שמח.", theme: "nature", q: "מתי גל סופר כוכבים?", qEn: "When does Gal count stars?", a: ["בלילה", "בבוקר", "בצהריים", "בערב"] },
  { en: "Michal paints a flower. She uses many colors. Red, yellow, and blue. The painting is beautiful. Dad hangs it up.", he: "מיכל מציירת פרח. היא משתמשת בהרבה צבעים. אדום, צהוב וכחול. הציור יפה. אבא תולה אותו.", theme: "art", q: "מה מיכל מציירת?", qEn: "What does Michal paint?", a: ["פרח", "עץ", "בית", "שמש"] },
  { en: "Amir sings a song. He learns it at school. The song is about friends. He sings to his mom. Mom claps her hands.", he: "אמיר שר שיר. הוא לומד אותו בבית ספר. השיר על חברים. הוא שר לאמא שלו. אמא מוחאת כפיים.", theme: "music", q: "על מה השיר?", qEn: "What is the song about?", a: ["על חברים", "על חיות", "על משפחה", "על טבע"] },
  { en: "Dana picks apples. She goes to a farm. The apples are red. She puts them in a basket. They taste sweet.", he: "דנה קוטפת תפוחים. היא הולכת לחווה. התפוחים אדומים. היא שמה אותם בסל. הם טעימים מתוק.", theme: "nature", q: "איפה דנה קוטפת תפוחים?", qEn: "Where does Dana pick apples?", a: ["בחווה", "בפארק", "בחנות", "בבית"] },
  { en: "Omer washes his hands. Soap and water. He dries them well. Clean hands are good. Now he can eat.", he: "עומר שוטף את הידיים שלו. סבון ומים. הוא מייבש אותם טוב. ידיים נקיות זה טוב. עכשיו הוא יכול לאכול.", theme: "health", q: "מה עומר עושה?", qEn: "What does Omer do?", a: ["שוטף ידיים", "אוכל", "ישן", "משחק"] },
  { en: "Eden builds with clay. She makes a bowl. It is round and small. She paints it blue. Mom uses it for keys.", he: "עדן בונה עם חימר. היא עושה קערה. היא עגולה וקטנה. היא צובעת אותה כחול. אמא משתמשת בה למפתחות.", theme: "crafts", q: "מה עדן עושה?", qEn: "What does Eden make?", a: ["קערה", "כוס", "צלחת", "סיר"] },
  { en: "Shay looks at the clouds. One looks like a rabbit. Another looks like a car. Clouds are fun to watch. The sky is blue.", he: "שי מסתכל על העננים. אחד נראה כמו ארנב. אחר נראה כמו מכונית. כיף לצפות בעננים. השמיים כחולים.", theme: "nature", q: "במה הענן נראה כמו?", qEn: "What does the cloud look like?", a: ["ארנב", "כלב", "חתול", "ציפור"] },
  { en: "Tamar plants a seed. She puts it in dirt. She waters it every day. A small plant grows. Tamar is happy.", he: "תמר שותלת זרע. היא שמה אותו באדמה. היא משקה אותו כל יום. צמח קטן גדל. תמר שמחה.", theme: "nature", q: "מה תמר שותלת?", qEn: "What does Tamar plant?", a: ["זרע", "עץ", "פרח", "שיח"] }
];

// Unique Level 4 stories
const level4Stories = [
  { en: "The school organizes a science fair. Daniel decides to build a model of the solar system. He researches each planet carefully and learns about their sizes and distances from the sun. His project wins first place, and he discovers a passion for astronomy.", he: "בית הספר מארגן יריד מדע. דניאל מחליט לבנות דגם של מערכת השמש. הוא חוקר כל כוכב לכת בזהירות ולומד על הגדלים והמרחקים שלהם מהשמש. הפרויקט שלו זוכה במקום הראשון, והוא מגלה תשוקה לאסטרונומיה.", theme: "science", q: "במה דניאל זוכה?", qEn: "What does Daniel win?", a: ["מקום ראשון", "מקום שני", "שום דבר", "פרס כספי"] },
  { en: "Sarah notices that many students throw away perfectly good food during lunch. She starts a campaign to reduce food waste. She creates posters and gives a presentation to the school. The cafeteria now donates extra food to a local shelter instead of throwing it away.", he: "שרה שמה לב שהרבה תלמידים זורקים אוכל טוב לחלוטין במהלך הצהריים. היא מתחילה קמפיין להפחית בזבוז אוכל. היא יוצרת כרזות ונותנת מצגת לבית הספר. הקפיטריה עכשיו תורמת אוכל עודף למקלט מקומי במקום לזרוק אותו.", theme: "community", q: "לאן הקפיטריה תורמת אוכל?", qEn: "Where does the cafeteria donate food?", a: ["למקלט מקומי", "לבית ספר אחר", "לפארק", "לא תורמת"] },
  { en: "When a new student arrives from another country, Michael befriends him. He learns that the student does not speak Hebrew well. Michael decides to help him practice. They meet during recess, and Michael teaches him new words every day. They become best friends.", he: "כשתלמיד חדש מגיע ממדינה אחרת, מיכאל מתיידד איתו. הוא לומד שהתלמיד לא מדבר עברית טוב. מיכאל מחליט לעזור לו להתאמן. הם נפגשים במהלך ההפסקה, ומיכאל מלמד אותו מילים חדשות כל יום. הם הופכים לחברים הכי טובים.", theme: "friendship", q: "מה מיכאל מלמד את התלמיד החדש?", qEn: "What does Michael teach the new student?", a: ["מילים חדשות בעברית", "מתמטיקה", "ספורט", "מוזיקה"] },
  { en: "Rachel participates in a debate about whether homework should be banned. Her team argues against banning it. Through research and preparation, she learns to present clear arguments and respond to opposing views. Even though her team loses, Rachel gains confidence in public speaking.", he: "רחל משתתפת בדיבייט האם לאסור שיעורי בית. הקבוצה שלה טוענת נגד האיסור. דרך מחקר והכנה, היא לומדת להציג טיעונים ברורים ולהגיב לדעות מנוגדות. למרות שהקבוצה שלה מפסידה, רחל צוברת ביטחון בדיבור לפני קהל.", theme: "education", q: "מה רחל משיגה?", qEn: "What does Rachel gain?", a: ["ביטחון בדיבור לפני קהל", "פרס כספי", "ציון טוב", "חופש משיעורים"] },
  { en: "David wants to buy a new bicycle. Instead of asking his parents for money, he decides to earn it himself. He starts walking dogs in the neighborhood after school. After three months of hard work, he saves enough money. David feels proud of his achievement.", he: "דוד רוצה לקנות אופניים חדשים. במקום לבקש כסף מההורים שלו, הוא מחליט להרוויח אותו בעצמו. הוא מתחיל ללכת עם כלבים בשכונה אחרי בית ספר. אחרי שלושה חודשים של עבודה קשה, הוא חוסך מספיק כסף. דוד מרגיש גאה בהישג שלו.", theme: "responsibility", q: "מה דוד עושה כדי להרוויח כסף?", qEn: "What does David do to earn money?", a: ["הולך עם כלבים", "מוכר לימונדה", "עובד בחנות", "עוזר בבית"] },
  { en: "The class goes on a field trip to a museum. Jessica is especially interested in the ancient history section. She asks many questions and takes detailed notes. The guide is impressed by her curiosity. Jessica decides she wants to become an archaeologist one day.", he: "הכיתה יוצאת לטיול למוזיאון. ג'סיקה מתעניינת במיוחד באגף ההיסטוריה העתיקה. היא שואלת הרבה שאלות ורושמת הערות מפורטות. המדריך מתרשם מהסקרנות שלה. ג'סיקה מחליטה שהיא רוצה להיות ארכיאולוגית יום אחד.", theme: "learning", q: "במה ג'סיקה רוצה לעבוד?", qEn: "What does Jessica want to become?", a: ["ארכיאולוגית", "מורה", "רופאה", "אומנית"] }
];

// Unique Level 5 stories
const level5Stories = [
  { en: "When Maya learns about children in other parts of the world who lack access to books, she organizes a book drive at her school. She creates flyers, sends emails to parents, and sets up collection boxes. Within two weeks, the school collects over five hundred books. Maya coordinates with an international organization to ship them to schools in need. This experience teaches her that young people can make a significant impact on global issues through local action.", he: "כשמאיה לומדת על ילדים בחלקים אחרים של העולם שאין להם גישה לספרים, היא מארגנת איסוף ספרים בבית הספר שלה. היא יוצרת כרזות, שולחת מיילים להורים, ומקימה קופסאות איסוף. תוך שבועיים, בית הספר אוסף יותר מחמש מאות ספרים. מאיה מתאמת עם ארגון בינלאומי לשלוח אותם לבתי ספר נזקקים. החוויה הזו מלמדת אותה שצעירים יכולים להשפיע משמעותית על נושאים גלובליים דרך פעולה מקומית.", theme: "global", q: "כמה ספרים בית הספר אוסף?", qEn: "How many books does the school collect?", a: ["יותר מחמש מאות", "מאה", "אלף", "חמישים"] },
  { en: "Jordan discovers that his grandmother has early-stage diabetes. He decides to research the disease thoroughly to understand how he can help. He learns about nutrition, exercise, and blood sugar management. Jordan then helps his grandmother plan healthier meals and accompanies her on daily walks. Through this experience, he becomes interested in pursuing a career in medicine and develops a deeper appreciation for family health.", he: "ג'ורדן מגלה שלסבתא שלו יש סוכרת בשלב מוקדם. הוא מחליט לחקור את המחלה ביסודיות כדי להבין איך הוא יכול לעזור. הוא לומד על תזונה, פעילות גופנית וניהול רמת סוכר בדם. ג'ורדן אז עוזר לסבתא שלו לתכנן ארוחות בריאות יותר ומלווה אותה בהליכות יומיות. דרך החוויה הזו, הוא מתעניין בקריירה ברפואה ומפתח הערכה עמוקה יותר לבריאות המשפחה.", theme: "health", q: "במה ג'ורדן מתעניין?", qEn: "What does Jordan become interested in?", a: ["קריירה ברפואה", "בישול", "ספורט", "מוזיקה"] },
  { en: "During a class discussion about artificial intelligence, Alex realizes that many of his classmates have concerns about how AI might affect future jobs. He proposes creating a research project to investigate this topic. The team interviews professionals in various fields and presents their findings to the school. Alex learns that understanding technology is crucial for preparing for the future workplace and that informed discussion can help reduce anxiety about change.", he: "במהלך דיון בכיתה על בינה מלאכותית, אלכס מבין שלהרבה מחברי הכיתה שלו יש חששות לגבי איך בינה מלאכותית עשויה להשפיע על עבודות עתידיות. הוא מציע ליצור פרויקט מחקר כדי לחקור את הנושא הזה. הצוות מראיין אנשי מקצוע בתחומים שונים ומציג את הממצאים לבית הספר. אלכס לומד שהבנת טכנולוגיה היא קריטית להכנה למקום העבודה העתידי ושדיון מושכל יכול לעזור להפחית חרדה לגבי שינוי.", theme: "technology", q: "מה אלכס לומד על טכנולוגיה?", qEn: "What does Alex learn about technology?", a: ["שהבנת טכנולוגיה קריטית לעתיד", "שטכנולוגיה מסוכנת", "שאין צורך ללמוד טכנולוגיה", "שטכנולוגיה תחליף את כולם"] },
  { en: "Lily reads about how social media can affect mental health. She notices that she sometimes feels sad after spending too much time online. Lily decides to conduct an experiment on herself: she limits her social media use to thirty minutes a day for one month. She keeps a journal of her feelings and discovers that she sleeps better and feels more focused. Lily shares her findings with friends, encouraging them to be mindful of their screen time.", he: "לילי קוראת על איך רשתות חברתיות יכולות להשפיע על בריאות הנפש. היא שמה לב שהיא לפעמים מרגישה עצובה אחרי שבילתה יותר מדי זמן באינטרנט. לילי מחליטה לערוך ניסוי על עצמה: היא מגבילה את השימוש שלה ברשתות חברתיות לשלושים דקות ביום במשך חודש. היא שומרת יומן של הרגשות שלה ומגלה שהיא ישנה טוב יותר ומרגישה ממוקדת יותר. לילי משתפת את הממצאים שלה עם חברים, ומעודדת אותם להיות מודעים לזמן המסך שלהם.", theme: "wellness", q: "מה לילי מגלה?", qEn: "What does Lily discover?", a: ["שהיא ישנה טוב יותר וממוקדת יותר", "שרשתות חברתיות טובות", "שהניסוי נכשל", "שאין השפעה"] },
  { en: "When a local park becomes polluted with trash, Noah organizes a community cleanup day. He contacts the city council for support, recruits volunteers through social media, and arranges for proper waste disposal. On the day of the event, over fifty people show up to help. The park is transformed, and Noah realizes that leadership involves bringing people together for a common cause.", he: "כשפארק מקומי מזוהם באשפה, נוח מארגן יום ניקיון קהילתי. הוא יוצר קשר עם מועצת העיר לתמיכה, מגייס מתנדבים דרך רשתות חברתיות, ומארגן פינוי פסולת נכון. ביום האירוע, יותר מחמישים אנשים מגיעים לעזור. הפארק עובר שינוי, ונוח מבין שמנהיגות כוללת לאחד אנשים למען מטרה משותפת.", theme: "leadership", q: "כמה אנשים מגיעים לעזור?", qEn: "How many people show up to help?", a: ["יותר מחמישים", "עשרה", "מאה", "עשרים"] },
  { en: "Emma studies the history of women's rights for a school project. She is surprised to learn about the many challenges women faced in the past. Her research inspires her to interview women in her community about their experiences. Emma creates a presentation that highlights both historical progress and current challenges. She realizes that understanding history is essential for creating a better future.", he: "אמה לומדת את ההיסטוריה של זכויות נשים לפרויקט בית ספר. היא מופתעת ללמוד על האתגרים הרבים שנשים התמודדו איתם בעבר. המחקר שלה מעורר השראה לראיין נשים בקהילה שלה על החוויות שלהן. אמה יוצרת מצגת שמדגישה גם התקדמות היסטורית וגם אתגרים נוכחיים. היא מבינה שהבנת ההיסטוריה היא חיונית ליצירת עתיד טוב יותר.", theme: "history", q: "מה אמה מבינה?", qEn: "What does Emma realize?", a: ["שהבנת ההיסטוריה חיונית לעתיד טוב יותר", "שההיסטוריה לא חשובה", "שאין צורך ללמוד", "שהעתיד לא חשוב"] }
];

// Count current stories by level
const currentByLevel = {};
stories.forEach(s => { currentByLevel[s.difficulty] = (currentByLevel[s.difficulty] || 0) + 1; });
console.log('Current distribution:', JSON.stringify(currentByLevel));

// Add stories
const TARGET = { 1: 50, 2: 50, 3: 100, 4: 50, 5: 50 };

// Add Level 1 stories
const needed1 = Math.max(0, TARGET[1] - (currentByLevel[1] || 0));
console.log(`Adding ${needed1} Level 1 stories...`);
for (let i = 0; i < needed1 && i < level1Stories.length; i++) {
  const t = level1Stories[i];
  stories.push({
    id: genId(),
    title: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    titleEn: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    text: t.en,
    hebrewTranslation: t.he,
    difficulty: 1,
    wordCount: wc(t.en),
    sentences: sc(t.en),
    vocabularyIds: vocab(t.en),
    emotionWords: emotions(t.en),
    themes: [t.theme],
    comprehensionQuestion: t.q,
    comprehensionQuestionEn: t.qEn,
    answerOptions: t.a,
    answerOptionsEn: t.a,
    correctAnswerIndex: 0
  });
}

// Add Level 4 stories
const needed4 = Math.max(0, TARGET[4] - (currentByLevel[4] || 0));
console.log(`Adding ${needed4} Level 4 stories...`);
for (let i = 0; i < needed4 && i < level4Stories.length; i++) {
  const t = level4Stories[i];
  stories.push({
    id: genId(),
    title: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    titleEn: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    text: t.en,
    hebrewTranslation: t.he,
    difficulty: 4,
    wordCount: wc(t.en),
    sentences: sc(t.en),
    vocabularyIds: vocab(t.en),
    emotionWords: emotions(t.en),
    themes: [t.theme],
    comprehensionQuestion: t.q,
    comprehensionQuestionEn: t.qEn,
    answerOptions: t.a,
    answerOptionsEn: t.a,
    correctAnswerIndex: 0
  });
}

// Add Level 5 stories
const needed5 = Math.max(0, TARGET[5] - (currentByLevel[5] || 0));
console.log(`Adding ${needed5} Level 5 stories...`);
for (let i = 0; i < needed5 && i < level5Stories.length; i++) {
  const t = level5Stories[i];
  stories.push({
    id: genId(),
    title: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    titleEn: t.theme.charAt(0).toUpperCase() + t.theme.slice(1),
    text: t.en,
    hebrewTranslation: t.he,
    difficulty: 5,
    wordCount: wc(t.en),
    sentences: sc(t.en),
    vocabularyIds: vocab(t.en),
    emotionWords: emotions(t.en),
    themes: [t.theme],
    comprehensionQuestion: t.q,
    comprehensionQuestionEn: t.qEn,
    answerOptions: t.a,
    answerOptionsEn: t.a,
    correctAnswerIndex: 0
  });
}

// Save
fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2));

// Final count
const finalByLevel = {};
stories.forEach(s => { finalByLevel[s.difficulty] = (finalByLevel[s.difficulty] || 0) + 1; });
console.log('Final distribution:', JSON.stringify(finalByLevel));
console.log('Total stories:', stories.length);
