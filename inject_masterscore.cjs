const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const regex = /const masterScore = \(\(\(HORA_INFO\[hora\]\?\.score\|\|5\)\+\(cb\.good\?9:5\)\+\(Math\.max\(0,tara\.score\)\*3\)\+6\)\/4\)\.toFixed\(1\);/;

const replacement = `const masterScoreNum = (((HORA_INFO[hora]?.score||5)+(cb.good?9:5)+(Math.max(0,tara.score)*3)+6)/4) + (yogaBonus * 0.1);
    const masterScore = (Math.min(10, Math.max(0, masterScoreNum))).toFixed(1);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Added yogaBonus to masterScore!');
