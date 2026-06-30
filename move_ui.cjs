const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const sIdx = code.indexOf(`<div className="flex items-center justify-between mb-2 pb-2 border-b border-pink-900/50">`);
const eIdx = code.indexOf(`)}`, sIdx + 500); // end of {profiles.length > 0 && ...}

if (sIdx > -1 && eIdx > -1) {
  const profileSection = code.substring(sIdx, eIdx + 2);
  
  // Remove from old location
  code = code.replace(profileSection, '');
  
  const targetAnchor = `{/* ── 3 COLUMN FORM ── */}`;
  const newUI = `{/* ── PROFILES SECTION ── */}
            <div className="bg-slate-900/60 border border-pink-700/30 rounded-2xl p-4 mb-4">
              ${profileSection}
            </div>

            ${targetAnchor}`;
            
  code = code.replace(targetAnchor, newUI);
  fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
  console.log('Moved Profiles UI up');
}
