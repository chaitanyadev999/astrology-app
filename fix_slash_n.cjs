const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

code = code.replace(/\\n    const userResults = userList.map/g, '\n    const userResults = userList.map');

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
