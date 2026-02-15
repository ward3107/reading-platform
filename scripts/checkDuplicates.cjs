const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../public/stories.json');
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

console.log('Total stories:', stories.length);

// Check for duplicate IDs
const ids = stories.map(s => s.id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
console.log('Duplicate IDs:', duplicateIds.length);

// Check for duplicate text content
const textMap = {};
stories.forEach(s => {
  const key = s.text.trim().toLowerCase();
  if (!textMap[key]) textMap[key] = [];
  textMap[key].push({ id: s.id, difficulty: s.difficulty });
});

const duplicateTexts = Object.entries(textMap).filter(([k, v]) => v.length > 1);
console.log('Stories with duplicate text:', duplicateTexts.length);

if (duplicateTexts.length > 0) {
  console.log('\n--- Duplicate stories preview ---');
  duplicateTexts.slice(0, 5).forEach(([text, entries]) => {
    console.log('\nIDs:', entries.map(e => `${e.id} (L${e.difficulty})`).join(', '));
    console.log('Text:', text.substring(0, 80) + '...');
  });
  console.log('\n... and', duplicateTexts.length - 5, 'more duplicates');
}

// Count by level
const byLevel = {};
stories.forEach(s => {
  byLevel[s.difficulty] = (byLevel[s.difficulty] || 0) + 1;
});
console.log('\nCurrent distribution by level:', JSON.stringify(byLevel));
