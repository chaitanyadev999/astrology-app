const fs = require('fs');

let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

// 1. Initial State
code = code.replace(
  /const \[form, setForm\] = useState\(\{/,
  `const [form, setForm] = useState({
    users: [],`
);

// 2. Planets Array
code = code.replace(
  /const \[birthPlanets, setBirthPlanets\] = useState<ProkeralaPlanet\[\]>\(\[\]\);/,
  `const [birthPlanets, setBirthPlanets] = useState<ProkeralaPlanet[]>([]);
  const [birthPlanetsArray, setBirthPlanetsArray] = useState<ProkeralaPlanet[][]>([]);`
);

// 3. runAnalysis
const rIdx1 = code.indexOf('const pBirth = (f.hasJatakam && f.dob)');
const rIdx2 = code.indexOf('const [bp, tp, lp, pg, cg, yPg, yCg, dpg, dcg, aiRes] = await Promise.all([');
const rIdx3 = code.indexOf('setBirthPlanets(bp);');

if (rIdx1 > 0 && rIdx3 > 0) {
  const beforePBirth = code.substring(0, rIdx1);
  const afterSetBP = code.substring(rIdx3 + 'setBirthPlanets(bp);'.length);

  const newRunAnalysis = `const userList = (typeof profiles !== 'undefined' && profiles.length > 0) ? profiles : [f];
      const pBirths = userList.map(u => (u.hasJatakam && u.dob) ? fetchPlanetPositions(\`\${u.dob}T\${u.dobTime}:00+05:30\`, u.lat || '17.3850', u.lon || '78.4867') : Promise.resolve([]));
      
      const [tp, lp, pg, cg, yPg, yCg, dpg, dcg, aiRes] = await Promise.all([
        fetchPlanetPositions(orderDt, lat, lon),
        fetchPlanetPositions(lotteryDt, lat, lon),
        fetchPanchang(orderDt, lat, lon),
        fetchChoghadiya(orderDt, lat, lon),
        fetchPanchang(yesterdayDt, lat, lon),
        fetchChoghadiya(yesterdayDt, lat, lon),
        fetchPanchang(drawDt, lat, lon),
        fetchChoghadiya(drawDt, lat, lon),
        fetchAiInterpret(lotteryDt, lat, lon, aiQ)
      ]);
      const bpArray = await Promise.all(pBirths);
      setBirthPlanetsArray(bpArray);
      setBirthPlanets(bpArray[0] || []);`;

  // We need to cut out everything from `const pBirth = ...` up to `setBirthPlanets(bp);`
  // Wait, `await Promise.all([ pBirth, tp... ])` was there. Let's just find the exact block to replace.
}

// Actually, I can use replace with a simpler regex or manual slicing.
const runAnalysisStart = 'const pBirth = (f.hasJatakam && f.dob)';
const runAnalysisEnd = 'setBirthPlanets(bp);';

const s1 = code.indexOf(runAnalysisStart);
const s2 = code.indexOf(runAnalysisEnd);
if (s1 > -1 && s2 > -1) {
  code = code.substring(0, s1) + `const userList = (typeof profiles !== 'undefined' && profiles.length > 0) ? profiles : [f];
      const pBirths = userList.map(u => (u.hasJatakam && u.dob) ? fetchPlanetPositions(\`\${u.dob}T\${u.dobTime}:00+05:30\`, u.lat || '17.3850', u.lon || '78.4867') : Promise.resolve([]));
      
      const [tp, lp, pg, cg, yPg, yCg, dpg, dcg, aiRes] = await Promise.all([
        fetchPlanetPositions(orderDt, lat, lon),
        fetchPlanetPositions(lotteryDt, lat, lon),
        fetchPanchang(orderDt, lat, lon),
        fetchChoghadiya(orderDt, lat, lon),
        fetchPanchang(yesterdayDt, lat, lon),
        fetchChoghadiya(yesterdayDt, lat, lon),
        fetchPanchang(drawDt, lat, lon),
        fetchChoghadiya(drawDt, lat, lon),
        fetchAiInterpret(lotteryDt, lat, lon, aiQ)
      ]);
      const bpArray = await Promise.all(pBirths);
      setBirthPlanetsArray(bpArray);
      setBirthPlanets(bpArray[0] || []);` + code.substring(s2 + runAnalysisEnd.length);
}

// 4. Update the beginning of compute()
const computeStart = 'const compute = useCallback(() => { try {';
const computeEnd = 'const nV = nameNum(f.userName); const dV = dateNum(f.dob);';
const cs1 = code.indexOf(computeStart);
const cs2 = code.indexOf(computeEnd);
if (cs1 > -1 && cs2 > -1) {
  code = code.substring(0, cs1) + `const compute = useCallback(() => { try {
    const f = form;
    const userList = (typeof profiles !== 'undefined' && profiles.length > 0) ? profiles : [f];
    
    // Global predictions (shared across all users)
    const drawNakNameGlobal = actualDrawNak ? NAKSHATRAMS[actualDrawNak - 1] : (drawPanchang?.nakshatra?.[0]?.name || '');
    const drawHoraGlobal = livePanchangaDraw.horaTE;
    const drawKakshaGlobal = livePanchangaDraw.kaksha;
    
    // Compute results for each user
    const userResults = userList.map((userObj, userIdx) => {
      const userBirthPlanets = (typeof birthPlanetsArray !== 'undefined' && birthPlanetsArray.length > 0) ? (birthPlanetsArray[userIdx] || []) : birthPlanets;
      let userLagna = userObj.lagnam;
      let userRashi = userObj.rashi;
      let userNakIdx = userObj.nakshatram;
      
      if (userObj.hasJatakam) {
        if (userBirthPlanets.length > 0) {
          const as = userBirthPlanets.find(p => p.name === 'Ascendant' || p.name === 'లగ్న');
          if (as && as.rashi) userLagna = as.rashi.id - 1;
          const mo = userBirthPlanets.find(p => p.name === 'Moon' || p.name === 'చంద్ర');
          if (mo && mo.rashi) {
            userRashi = mo.rashi.id - 1;
            if (mo.nakshatra) {
              const nStr = mo.nakshatra.replace('ఢ','డ').replace('ఫల్గుణి','').trim();
              const nIdx = NAKSHATRAMS.findIndex(n => n.includes(nStr) || nStr.includes(n));
              if (nIdx !== -1) userNakIdx = nIdx;
            }
          }
        }
      } else {
        userLagna = getLagnaAtTime(0, parseInt(f.orderTime.split(':')[0])); 
        userRashi = livePanchanga.lagnaRashiIdx; 
        userNakIdx = (!userObj.hasJatakam && userObj.manualTodayNak) ? parseInt(userObj.manualTodayNak) - 1 : Math.max(0, (livePanchanga.nak || 1) - 1);
      }
      
      const lagP = LAGNAM_PLANET[userLagna]; const lagV = PLANET_NUM[lagP]||1;
      const rashiP = LAGNAM_PLANET[userRashi]; const rashiV = PLANET_NUM[rashiP]||2;
      const nakL = NAK_LORDS[userNakIdx]; const nakV = PLANET_NUM[nakL]||3;
      
      const nV = nameNum(userObj.userName || ''); const dV = dateNum(userObj.dob || '');` + code.substring(cs2 + computeEnd.length);
}

// 5. Update end of compute loop
const setResultStart = 'setResult({';
const setResultEnd = '});\n    setStep(\'result\');';

const sr1 = code.lastIndexOf(setResultStart, code.indexOf('setStep(\'result\');'));
const sr2 = code.indexOf('});', sr1);

if (sr1 > -1 && sr2 > -1) {
  code = code.substring(0, sr1) + `      return {
        userObj,
        cats, combos, masterNums, masterConf, secondaryNums, avoidNumsList, masterScore, globalScorePercent,
        cb, tara, nV, dV, trendNote, mlNote, navNote,
        lagP, rashiP, nakL, birthPosFallback,
        yogas, dasha, yogaBonus, transitYogas,
        omillionairePrediction,
        aiReading
      };
    }); // end userList.map
    
    // Set final result with global data and userResults array
    setResult({
      users: userResults,
      globalData: {
        table24h, bestTimes, bestTimeToday, pick:f.pick, max:f.max,
        hora, kaksha, todayNakName, todayNakL, cV, lV, transPosFallback,
        lotteryLagna, lLagnaScore, lotteryHora, lotteryKaksha, lHoraInfo, lKakshaInfo, lotteryTimeScore,
        drawNakName, drawNakL, drawHora, drawKaksha, drawTithi, drawVaara, drawDayScore, drawNakV,
        livePanchanga, livePanchangaDraw, livePanchangaPrevDraw, lastDrawMatch, prevDrawDate: f.prevDrawDate
      }
    });` + code.substring(sr2 + 3);
}

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Successfully refactored compute loop!');
