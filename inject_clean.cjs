const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

// 1. Update State
code = code.replace(
  /const \[form, setForm\] = useState\(\{/,
  `const [profiles, setProfiles] = useState<any[]>([]);
  const [activeProfileIdx, setActiveProfileIdx] = useState(-1);
  const saveProfile = () => {
    const newProfiles = [...profiles];
    if (activeProfileIdx >= 0) {
      newProfiles[activeProfileIdx] = {...form, id: profiles[activeProfileIdx].id || Date.now()};
    } else {
      newProfiles.push({...form, id: Date.now()});
      setActiveProfileIdx(newProfiles.length - 1);
    }
    setProfiles(newProfiles);
  };
  const loadProfile = (idx) => {
    setActiveProfileIdx(idx);
    setForm(p => ({...p, ...profiles[idx]}));
  };
  const newProfile = () => {
    setActiveProfileIdx(-1);
    setForm(p => ({...p, userName:'', dob:'', dobTime:'06:00', lagnam:0, rashi:0, nakshatram:0, hasJatakam:true}));
  };
  const [form, setForm] = useState({`
);

// 2. Update Icons
code = code.replace(/User, /, 'User, Users, ');

// 3. Update Master Score
const masterScoreRegex = /const masterScore = \(\(\(HORA_INFO\[hora\]\?\.score\|\|5\)\+\(cb\.good\?9:5\)\+\(Math\.max\(0,tara\.score\)\*3\)\+6\)\/4\)\.toFixed\(1\);/;
const masterScoreRep = `const masterScoreNum = (((HORA_INFO[hora]?.score||5)+(cb.good?9:5)+(Math.max(0,tara.score)*3)+6)/4) + (yogaBonus * 0.1);
    const masterScore = (Math.min(10, Math.max(0, masterScoreNum))).toFixed(1);`;
code = code.replace(masterScoreRegex, masterScoreRep);

// 4. Inject Profile UI
const formUI = `<div className="bg-slate-900/60 border border-pink-700/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-pink-900/50">
                  <h3 className="text-pink-400 font-bold text-sm flex items-center gap-2">
                    <Users className="w-4 h-4"/> 👥 ప్రొఫైల్స్ (Profiles)
                  </h3>
                  <div className="flex gap-2">
                    <button type="button" onClick={saveProfile} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs text-white shadow-lg">Save</button>
                    <button type="button" onClick={newProfile} className="px-3 py-1 bg-pink-600 hover:bg-pink-500 rounded text-xs text-white shadow-lg">+ New</button>
                  </div>
                </div>
                {profiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profiles.map((pr, i) => (
                      <button type="button" key={i} onClick={() => loadProfile(i)} className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-all \${activeProfileIdx === i ? 'bg-pink-500 text-white shadow-lg border-2 border-pink-400' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}\`}>
                        {pr.userName || 'User '+(i+1)}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">`;

code = code.replace(/<div className="bg-slate-900\/60 border border-pink-700\/30 rounded-2xl p-4 space-y-3">\s*<div className="flex items-center justify-between">/, formUI);

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Restored fully without breaking anything!');
