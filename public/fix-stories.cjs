const fs = require('fs');

let data = fs.readFileSync('stories.json', 'utf8');

// Fix all instances of .split(", ") in vocabularyIds
const regex = /"vocabularyIds": "([^"]*)"\.split\(", "\)/g;
let count = 0;

data = data.replace(regex, (match, vocab) => {
  const words = vocab.split(', ');
  const arrayStr = JSON.stringify(words);
  count++;
  return `"vocabularyIds": ${arrayStr}`;
});

fs.writeFileSync('stories.json', data);
console.log(`Fixed ${count} instances`);
