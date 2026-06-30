import fs from 'fs';

let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const globals = [
  'bestTimeToday', 'table24h', 'livePanchanga', 'livePanchangaDraw',
  'drawNakName', 'drawHora', 'drawKaksha', 'transPosFallback',
  'pick', 'max', 'lastDrawMatch', 'prevDrawDate', 'lotteryTimeScore'
];

globals.forEach(g => {
  const regex = new RegExp('result\\\\.' + g, 'g');
  code = code.replace(regex, 'result.globalData.' + g);
});

code = code.replace(
  /\{birthImg \? \([\s\S]*?\{!birthImg && birthPlanets\.length>0 && \([\s\S]*?\{result\.yogas && result\.yogas\.length > 0 && \(/,
  '{result.users && result.users.map((uResult, uIdx) => (' +
  '  <div key={uIdx} className="mb-10 space-y-5 border border-pink-500/30 rounded-2xl p-4 bg-slate-900/40 relative">' +
  '    <div className="absolute top-0 left-0 bg-pink-600 text-white px-4 py-1 rounded-br-xl rounded-tl-xl text-sm font-bold shadow-lg">' +
  '      User: {uResult.userObj.userName || "User "+(uIdx+1)}' +
  '    </div>' +
  '    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border-2 border-indigo-500/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.15)] mt-8">' +
  '      <h3 className="text-indigo-300 font-bold mb-4 flex items-center gap-2">అదృష్టం (Score)</h3>' +
  '      <Gauge score={uResult.globalScorePercent} max={100} />' +
  '    </div>' +
  '    <div className="grid md:grid-cols-2 gap-4">' +
  '      <div className="bg-slate-900/50 border border-yellow-500/20 rounded-2xl p-4">' +
  '        <KundaliChart title={"జన్మ కుండలి"} colorClass="text-cyan-300" apiPlanets={birthPlanetsArray[uIdx]} positions={uResult.birthPosFallback} loading={chartsLoading}/>' +
  '        {uResult.yogas && uResult.yogas.length > 0 && ('
);

const userVars = [
  'yogas', 'dasha', 'cats', 'masterScore', 'masterNums', 'secondaryNums',
  'avoidNumsList', 'omillionairePrediction', 'cb', 'tara', 'nV', 'dV',
  'trendNote', 'mlNote', 'navNote', 'aiReading', 'combos', 'masterConf'
];

userVars.forEach(u => {
  const regex = new RegExp('result\\\\.' + u, 'g');
  code = code.replace(regex, 'uResult.' + u);
});

code = code.replace(
  /\{uResult\.navNote&&<div className="bg-emerald-500\/5 border border-emerald-500\/20 rounded-2xl p-4"><h3 className="text-emerald-400 font-bold text-sm flex items-center gap-2 mb-1"><Star className="w-4 h-4"\/>నవాంశ \(D-9\) ఫిల్టర్<\/h3><p className="text-xs text-emerald-200">\{uResult\.navNote\}<\/p><\/div>\}/,
  '{uResult.navNote&&<div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4"><h3 className="text-emerald-400 font-bold text-sm flex items-center gap-2 mb-1"><Star className="w-4 h-4"/>నవాంశ (D-9) ఫిల్టర్</h3><p className="text-xs text-emerald-200">{uResult.navNote}</p></div>}' +
  '  </div>' +
  '))}'
);

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Script ran successfully!');
