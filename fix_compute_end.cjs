const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const regex = /setResult\(\{\s*cats, combos, masterNums, masterConf, secondaryNums, avoidNumsList, masterScore, globalScorePercent, bestTimeToday,[\s\S]*?omillionairePrediction\s*\}\);/;

const replacement = `      return {
        userObj: userObj,
        cats, combos, masterNums, masterConf, secondaryNums, avoidNumsList, masterScore, globalScorePercent,
        cb, tara, nV, dV, trendNote, mlNote, navNote,
        lagP, rashiP, nakL, birthPosFallback,
        yogas, dasha, yogaBonus, transitYogas,
        omillionairePrediction,
        aiReading
      };
    }); // end userList.map
    
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

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Fixed end of compute!');
