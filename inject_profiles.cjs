const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

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

const formUI = `              <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <h3 className="text-pink-400 font-bold flex items-center gap-2">
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
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-pink-400 font-bold flex items-center gap-2"><User className="w-4 h-4"/> 2. మీ జాతక వివరాలు</h3>`;

code = code.replace(
  /<div className="bg-slate-900\/50 border border-slate-700 rounded-2xl p-4 space-y-4">\s*<div className="flex items-center justify-between mb-2">\s*<h3 className="text-pink-400 font-bold flex items-center gap-2"><User className="w-4 h-4"\/> 2\. మీ జాతక వివరాలు<\/h3>/,
  formUI
);

code = code.replace(/User, /, 'User, Users, ');

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Injected Profiles!');
