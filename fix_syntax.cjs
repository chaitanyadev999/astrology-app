const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const sIdx = code.indexOf(`const bpArray = await Promise.all(pBirths);`);
const eIdx = code.indexOf(`fetchAiInterpret(lotteryDt, lat, lon, aiQ)`, sIdx);

if (sIdx > -1 && eIdx > -1) {
  const eIdx2 = code.indexOf(`]);`, eIdx);
  if (eIdx2 > -1) {
    const chunkToRemove = code.substring(sIdx + `const bpArray = await Promise.all(pBirths);`.length, eIdx2 + 3);
    code = code.replace(chunkToRemove, '');
    fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
    console.log('Fixed duplicate block');
  }
}
