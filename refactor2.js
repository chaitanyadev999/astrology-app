const fs = require('fs');

let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

// 1. Convert compute() into an iteration over form.users
const computeStartRegex = /const compute = useCallback\(\(\) => \{ try \{\n\s*const f = form;\n\n\s*let userLagna = f\.lagnam;/;

code = code.replace(computeStartRegex, `const compute = useCallback(() => { try {
    const fGlobal = form;
    
    // Global data computation
    const drawNakNameGlobal = (drawPanchang?.nakshatra?.[0]?.name || '');
    const drawNakIdxRawGlobal = NAKSHATRAMS.findIndex(n => drawNakNameGlobal.includes(n) || n.includes(drawNakNameGlobal));
    const drawNakIdx2Global = drawNakIdxRawGlobal !== -1 ? drawNakIdxRawGlobal : 0;
    const drawNakLGlobal = NAK_LORDS[drawNakIdx2Global];
    const drawNakVGlobal = PLANET_NUM[drawNakLGlobal] || 1;
    const drawHoraGlobal = livePanchangaDraw.horaTE;
    const drawKakshaGlobal = livePanchangaDraw.kaksha;
    const drawHoraScoreGlobal = HORA_INFO[drawHoraGlobal]?.score || 5;
    const drawKakshaScoreGlobal = KAKSHA_INFO[drawKakshaGlobal]?.score || 5;
    const drawDayScoreGlobal = Math.round((drawHoraScoreGlobal + drawKakshaScoreGlobal) / 2);

    const lat24 = parseFloat(fGlobal.users[0]?.lat)||17.385;
    const lon24 = parseFloat(fGlobal.users[0]?.lon)||78.487;
    const table24h = Array.from({length:24},(_,h)=>{
      const ts = \`\${String(h).padStart(2,'0')}:00\`;
      let p24 = null;
      try { p24 = getPanchangaForDateTime(fGlobal.orderDate, ts, lat24, lon24); } catch(e) {}
      const hr = p24 ? p24.horaTE : '—';
      const kk = p24 ? p24.kaksha : '—';
      const lagnam = p24 ? p24.lagnaRashi : RASHIS[getLagnaAtTime(fGlobal.users[0]?.lagnam || 0, h)];
      const tithiLabel = p24 ? p24.tithiName : '';
      const nakLabel = p24 ? p24.nakName : '';
      const horaScore = HORA_INFO[hr]?.score || 5;
      const kakshaScore = KAKSHA_INFO[kk]?.score || 5;
      const lagnaScore = p24 ? p24.lagnaScore : LAGNAM_SCORE[getLagnaAtTime(fGlobal.users[0]?.lagnam || 0, h)];
      const isRahu = p24 ? (h >= Math.floor(p24.rahuStart.getHours()) && h < Math.floor(p24.rahuEnd.getHours())) : false;
      const total = Math.round((horaScore + kakshaScore + lagnaScore/2) / 2.5);
      const finalTotal = isRahu ? Math.max(1, total - 2) : total;
      return {
        time:\`\${ts}–\${String((h+1)%24).padStart(2,'0')}:00\`,
        hora: hr, kaksha: kk, lagnam, tithi: tithiLabel, nakshatra: nakLabel,
        total: finalTotal, isRahu,
        outcome: finalTotal>=9?'🏆 అత్యుత్తమం': finalTotal>=7?'✅ శుభం': finalTotal>=5?'🔵 సాధారణం': finalTotal>=3?'⚠️ జాగ్రత్త':'❌ నష్టం'
      };
    });
    const bestTimes = table24h.filter(r=>r.total>=8);
    const bestTimeToday = [...table24h].sort((a,b)=>b.total-a.total)[0];

    const userResults = form.users.map((f, userIndex) => {
      // NOTE: We assume birthPlanets is an array of arrays now: birthPlanets[userIndex]
      const userBirthPlanets = Array.isArray(birthPlanets[0]) ? (birthPlanets[userIndex] || []) : (userIndex === 0 ? birthPlanets : []);

      let userLagna = f.lagnam;`);

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Saved refactor2');
