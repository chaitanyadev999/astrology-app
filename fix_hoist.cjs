const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const targetVars = [
  'table24h', 'bestTimes', 'bestTimeToday', 'hora', 'kaksha', 'todayNakName', 'todayNakL', 'cV', 'lV', 'transPosFallback',
  'lotteryLagna', 'lLagnaScore', 'lotteryHora', 'lotteryKaksha', 'lHoraInfo', 'lKakshaInfo', 'lotteryTimeScore',
  'drawNakName', 'drawNakL', 'drawHora', 'drawKaksha', 'drawTithi', 'drawVaara', 'drawDayScore', 'drawNakV'
];

let declarations = `
    let table24h = [];
    let bestTimes = [];
    let bestTimeToday = null;
    let hora = '', kaksha = '', todayNakName = '', todayNakL = '', cV = 0, lV = 0;
    let lotteryLagna = 0, lLagnaScore = 0, lotteryHora = '', lotteryKaksha = '', lHoraInfo = null, lKakshaInfo = null, lotteryTimeScore = 0;
    let drawNakName = '', drawNakL = '', drawHora = '', drawKaksha = '', drawTithi = '', drawVaara = '', drawDayScore = 0, drawNakV = 0;
    let transPosFallback = {};
`;

// Insert declarations before `const userResults = userList.map(`
if (code.includes('const userResults = userList.map(')) {
    code = code.replace('const userResults = userList.map(', declarations + '\\n    const userResults = userList.map(');
} else {
    console.log("Could not find userList.map");
    process.exit(1);
}

// Now replace `const VARNAME =` with `VARNAME =`
for (let v of targetVars) {
  let regexConst = new RegExp('const \\\\s*' + v + '\\\\s*=', 'g');
  let regexLet = new RegExp('let \\\\s*' + v + '\\\\s*=', 'g');
  code = code.replace(regexConst, v + ' =');
  code = code.replace(regexLet, v + ' =');
}

// Specific fix for "const cV = compFullV; const lV = buyLocV;"
code = code.replace(/const cV = compFullV; const lV = buyLocV;/g, 'cV = compFullV; lV = buyLocV;');
// Fix transPosFallback which is "const transPosFallback: Record<string,number> ="
code = code.replace(/const transPosFallback: Record<string,number> =/g, 'transPosFallback =');

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Fixed hoisted variables');
