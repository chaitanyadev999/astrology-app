import fs from 'fs';

let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

// 1. Refactor form initialization
code = code.replace(
  /userName:'', dob:'', dobTime:'06:00',[\s\S]*?hasJatakam: true,/,
  `users: [{ id: 1, userName: '', dob: '', dobTime: '06:00', lat: '17.3850', lon: '78.4867', lagnam: 0, rashi: 0, nakshatram: 0, hasJatakam: true }],`
);

// 2. Refactor birthPlanets array of arrays
code = code.replace(
  /const \[birthPlanets, setBirthPlanets\] = useState<ProkeralaPlanet\[\]>\(\[\]\);/,
  `const [birthPlanetsArray, setBirthPlanetsArray] = useState<ProkeralaPlanet[][]>([]);`
);

// 3. Fix runAnalysis fetches
code = code.replace(
  /const pBirth = \(f\.hasJatakam && f\.dob\) \? fetchPlanetPositions\(dobDt, lat, lon\) : Promise\.resolve\(\[\]\);/,
  `const pBirths = f.users.map(u => (u.hasJatakam && u.dob) ? fetchPlanetPositions(\`\${u.dob}T\${u.dobTime}:00+05:30\`, u.lat || '17.3850', u.lon || '78.4867') : Promise.resolve([]));`
);

code = code.replace(
  /pBirth,/,
  `Promise.all(pBirths),`
);

code = code.replace(
  /setBirthPlanets\(bp\);/,
  `setBirthPlanetsArray(bp);`
);

code = code.replace(
  /birthPlanets\.length/,
  `birthPlanetsArray.length`
);

// Write changes back to file to save progress
fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Refactor script applied successfully!');
