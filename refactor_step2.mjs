import fs from 'fs';

let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

// 1. Add 'users: []' to initial form state
code = code.replace(
  /const \[form, setForm\] = useState\(\{/,
  `const [form, setForm] = useState({
    users: [],`
);

// 2. Add 'birthPlanetsArray' state
code = code.replace(
  /const \[birthPlanets, setBirthPlanets\] = useState<ProkeralaPlanet\[\]>\(\[\]\);/,
  `const [birthPlanets, setBirthPlanets] = useState<ProkeralaPlanet[]>([]);
  const [birthPlanetsArray, setBirthPlanetsArray] = useState<ProkeralaPlanet[][]>([]);`
);

// 3. Update runAnalysis to fetch for all users in form.users
const runAnalysisRegex = /const pBirth = \(f\.hasJatakam && f\.dob\) \? fetchPlanetPositions\(dobDt, lat, lon\) : Promise\.resolve\(\[\]\);\s*const \[bp, tp, lp, pg, cg, yPg, yCg, dpg, dcg, aiRes\] = await Promise\.all\(\[\s*pBirth,/;

const newRunAnalysis = `const userList = f.users && f.users.length > 0 ? f.users : [f];
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
      const bpArray = await Promise.all(pBirths);`;

code = code.replace(runAnalysisRegex, newRunAnalysis);

code = code.replace(
  /setBirthPlanets\(bp\);/,
  `setBirthPlanetsArray(bpArray);
      setBirthPlanets(bpArray[0] || []);`
);

// 4. Update the beginning of compute()
const computeStartRegex = /const compute = useCallback\(\(\) => \{ try \{\n\s*const f = form;\n\n\s*let userLagna = f\.lagnam;/;

const newComputeStart = `const compute = useCallback(() => { try {
    const f = form;
    const userList = f.users && f.users.length > 0 ? f.users : [f];
    
    // Global predictions (shared across all users)
    const drawNakNameGlobal = actualDrawNak ? NAKSHATRAMS[actualDrawNak - 1] : (drawPanchang?.nakshatra?.[0]?.name || '');
    const drawHoraGlobal = livePanchangaDraw.horaTE;
    const drawKakshaGlobal = livePanchangaDraw.kaksha;
    
    // Compute results for each user
    const userResults = userList.map((userObj, userIdx) => {
      const userBirthPlanets = birthPlanetsArray[userIdx] || [];
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
      
      // Let's replace 'f.userName' with 'userObj.userName' where it matters
      const nV = nameNum(userObj.userName || ''); const dV = dateNum(userObj.dob || '');
`;

code = code.replace(
  /const compute = useCallback\(\(\) => \{ try \{\s*const f = form;\s*let userLagna = f\.lagnam;[\s\S]*?const nV = nameNum\(f\.userName\); const dV = dateNum\(f\.dob\);/,
  newComputeStart
);

// 5. Update end of compute loop
const setResultRegex = /setResult\(\{\n\s*cats, combos, masterNums, masterConf, secondaryNums, avoidNumsList, masterScore, globalScorePercent, bestTimeToday,\n\s*hora, kaksha, cb, tara, todayNakName, todayNakL, nV, dV, cV, lV, trendNote, mlNote, navNote,\n\s*bestTimes, table24h, pick:f\.pick, max:f\.max,\n\s*lotteryLagna, lLagnaScore, lotteryHora, lotteryKaksha, lHoraInfo, lKakshaInfo, lotteryTimeScore,\n\s*lagP, rashiP, nakL, birthPosFallback, transPosFallback, aiReading,\n\s*drawNakName, drawNakL, drawHora, drawKaksha, drawTithi, drawVaara, drawDayScore, drawNakV,\n\s*livePanchanga, livePanchangaDraw, livePanchangaPrevDraw, lastDrawMatch, prevDrawDate: f\.prevDrawDate,\n\s*yogas, dasha, yogaBonus, transitYogas,\n\s*omillionairePrediction\n\s*\}\);/

const newSetResult = `      return {
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
    });`;

code = code.replace(setResultRegex, newSetResult);

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Script ran successfully!');
