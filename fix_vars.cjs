const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const targetStr = `    const lotteryTimeScore = Math.round((lLagnaScore + lHoraInfo.score + lKakshaInfo.score)/3);
    const lotteryHora = hora;
    const lotteryKaksha = kaksha;`;

const newStr = `    const lotteryTimeScore = Math.round((lLagnaScore + lHoraInfo.score + lKakshaInfo.score)/3);
    const lotteryHora = hora;
    const lotteryKaksha = kaksha;

    // Restore missing variables
    const todayNakName = NAKSHATRAMS[actualTodayNak - 1] || 'Unknown';
    const todayNakL = NAK_LORDS[actualTodayNak - 1] || 'Unknown';
    const todayNakV = PLANET_NUM[todayNakL] || 1;
    const cb = getChandraBalam(userRashi, f.orderDate);
    const tara = getTara(userNakIdx, actualTodayNak - 1);
    const kashaP = kaksha === "అమృత" ? "చంద్ర" : kaksha === "లాభ" ? "బుధ" : kaksha === "శుభ" ? "గురు" : kaksha === "చల" ? "శుక్ర" : kaksha === "ఉద్వేగ" ? "సూర్య" : kaksha === "రోగ" ? "కుజ" : "శని";`;

const t1 = targetStr.replace(/\r\n/g, '\n');
const t2 = targetStr.replace(/\n/g, '\r\n');

if (code.includes(t1)) {
  code = code.replace(t1, newStr.replace(/\n/g, '\n'));
} else if (code.includes(t2)) {
  code = code.replace(t2, newStr.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Fixed variables');
