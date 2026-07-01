const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const targetStr = `    const lLagnaScore = LAGNAM_SCORE[lotteryLagna] || 5;
    // Use livePanchanga hora/kaksha for precise astronomical hora
    const lHoraInfo = HORA_INFO[hora]||{score:5,te:'',lotteryMsg:''};
    const lKakshaInfo = KAKSHA_INFO[kaksha]||{score:5,te:'',lotteryOk:true};
    const lotteryTimeScore = Math.round((lLagnaScore + lHoraInfo.score + lKakshaInfo.score)/3);
    const lotteryHora = hora;
    const lotteryKaksha = kaksha;`;

const newStr = `    const lLagnaScore = LAGNAM_SCORE[lotteryLagna] || 5;
    // Use livePanchanga hora/kaksha for precise astronomical hora
    const hora = livePanchanga.horaTE;
    const kaksha = livePanchanga.kaksha;
    const lHoraInfo = HORA_INFO[hora]||{score:5,te:'',lotteryMsg:''};
    const lKakshaInfo = KAKSHA_INFO[kaksha]||{score:5,te:'',lotteryOk:true};
    const lotteryTimeScore = Math.round((lLagnaScore + lHoraInfo.score + lKakshaInfo.score)/3);
    const lotteryHora = hora;
    const lotteryKaksha = kaksha;`;

const t1 = targetStr.replace(/\r\n/g, '\n');
const t2 = targetStr.replace(/\n/g, '\r\n');

if (code.includes(t1)) {
  code = code.replace(t1, newStr.replace(/\n/g, '\n'));
} else if (code.includes(t2)) {
  code = code.replace(t2, newStr.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Fixed hora');
