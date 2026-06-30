const fs = require('fs');
let code = fs.readFileSync('src/services/panchangaEngine.ts', 'utf8');

const sIdx = code.indexOf(`let localDay = date.getDay();`);
if (sIdx > -1) {
  const eIdx = code.indexOf(`}`, sIdx);
  if (eIdx > -1) {
    const oldBlock = code.substring(sIdx, eIdx + 1);
    const newBlock = `let localDay = date.getDay();
  if (nowMs < srMs) {
    localDay = (localDay + 6) % 7; // It's still previous day's Vaaram before sunrise
    // Fix: Use the PREVIOUS day's sunrise for calculations!
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevSr = getSunrise(lat, lng, prevDate);
    srMs = prevSr.getTime();
  }`;
    code = code.replace(oldBlock, newBlock);
    
    // Also we need to make sure srMs is 'let' and not 'const'
    code = code.replace('const srMs = sr.getTime();', 'let srMs = sr.getTime();');
    
    fs.writeFileSync('src/services/panchangaEngine.ts', code);
    console.log('Fixed panchangaEngine srMs');
  }
}
