const fs = require('fs');
let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const targetStr = `    const f = form;
    const dobDt = \`\${f.dob}T\${f.dobTime}:00+05:30\`;
    const orderDt = \`\${f.orderDate}T\${f.orderTime}:00+05:30\`;
    const drawDt = \`\${f.lotteryDrawDate}T\${f.lotteryDrawTime}:00+05:30\`;

    try {
      const lotteryDt = \`\${f.orderDate}T\${f.lotteryTime}:00+05:30\`;`;

const newStr = `    const f = form;
    const safeDate = (d) => d || new Date().toISOString().split('T')[0];
    const safeTime = (t) => t || '06:00';

    const dobDt = \`\${safeDate(f.dob)}T\${safeTime(f.dobTime)}:00+05:30\`;
    const orderDt = \`\${safeDate(f.orderDate)}T\${safeTime(f.orderTime)}:00+05:30\`;
    const drawDt = \`\${safeDate(f.lotteryDrawDate)}T\${safeTime(f.lotteryDrawTime)}:00+05:30\`;

    try {
      const lotteryDt = \`\${safeDate(f.orderDate)}T\${safeTime(f.lotteryTime)}:00+05:30\`;`;

const t1 = targetStr.replace(/\r\n/g, '\n');
const t2 = targetStr.replace(/\n/g, '\r\n');

if (code.includes(t1)) {
  code = code.replace(t1, newStr.replace(/\n/g, '\n'));
} else if (code.includes(t2)) {
  code = code.replace(t2, newStr.replace(/\n/g, '\r\n'));
}

const targetStr2 = `const pBirths = userList.map(u => (u.hasJatakam && u.dob) ? fetchPlanetPositions(\`\${u.dob}T\${u.dobTime}:00+05:30\``;
const newStr2 = `const pBirths = userList.map(u => (u.hasJatakam && u.dob) ? fetchPlanetPositions(\`\${safeDate(u.dob)}T\${safeTime(u.dobTime)}:00+05:30\``;

code = code.replace(targetStr2, newStr2);

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Fixed dates');
