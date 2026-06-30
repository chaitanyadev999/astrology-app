const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const sIdx = code.indexOf(`{/* ── PROFILES SECTION ── */}`);
const eIdx = code.indexOf(`నాకు జాతకం తెలియదు`, sIdx);

if (sIdx > -1 && eIdx > -1) {
  const eIdx2 = code.indexOf(`</label>`, eIdx) + 8;
  const chunkToReplace = code.substring(sIdx, eIdx2);
  
  const correctChunk = `{/* ── PROFILES SECTION ── */}
            <div className="bg-slate-900/60 border border-pink-700/30 rounded-2xl p-4 mb-4">
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
            </div>

            {/* ── 3 COLUMN FORM ── */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Personal */}
              <div className="bg-slate-900/60 border border-pink-700/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-pink-400 font-bold text-sm flex items-center gap-2"><Star className="w-4 h-4"/>వ్యక్తిగత వివరాలు</h3>
                  <label className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-pink-200 cursor-pointer bg-pink-900/20 px-2 py-1 rounded-lg border border-pink-500/30">
                    <input type="checkbox" checked={!form.hasJatakam} onChange={e=>set('hasJatakam',!e.target.checked)} className="w-4 h-4 accent-pink-500"/>
                    నాకు జాతకం తెలియదు
                  </label>`;
                  
  code = code.replace(chunkToReplace, correctChunk);
  fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
  console.log('Fixed broken UI block!');
} else {
  console.log('Could not find boundaries');
}
