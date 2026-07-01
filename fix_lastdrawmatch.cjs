const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

// Add lastDrawMatch to declarations
if (!code.includes('let lastDrawMatch: any[] = [];')) {
  code = code.replace(
    'let transPosFallback = {};',
    'let transPosFallback = {};\n    let lastDrawMatch: any[] = [];'
  );
}

// Remove `let lastDrawMatch: any[] = [];` inside the map loop
// Be careful not to remove the outer one!
const lines = code.split('\n');
let insideMap = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const userResults = userList.map(')) {
    insideMap = true;
  }
  if (insideMap && lines[i].includes('let lastDrawMatch: any[] = [];')) {
    lines[i] = lines[i].replace('let lastDrawMatch: any[] = [];', 'lastDrawMatch = [];');
  }
  if (insideMap && lines[i].includes('}); // end userList.map')) {
    insideMap = false;
  }
}
code = lines.join('\n');

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Fixed lastDrawMatch hoist');
