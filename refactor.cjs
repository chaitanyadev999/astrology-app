const fs = require('fs');

let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

// 1. Replace form state
const oldStateRegex = /userName:'', dob:'', dobTime:'06:00',\s*lat:'17\.3850', lon:'78\.4867',\s*lagnam:0, rashi:0, nakshatram:0,\s*orderDate:today, orderTime:nowTime,\s*lotteryTime: nowTime,\s*\/\/ Lottery details \(optional\)\s*companyName:'', companyLocation:'', isForeign:false,\s*lotteryDrawDate: today,\s*lotteryDrawTime: '15:00',\s*lotteryBuyLocation: '',\s*lotteryCompanyFull: '',\s*pick:6, max:49,\s*lastResult:'', prevDrawDate: today, prevDrawTime: '15:00', ticketNums:'',/g;

code = code.replace(oldStateRegex, `users: [{
      id: Date.now(),
      userName:'', dob:'', dobTime:'06:00',
      lat:'17.3850', lon:'78.4867',
      lagnam:0, rashi:0, nakshatram:0,
      hasJatakam: true
    }],
    orderDate:today, orderTime:nowTime,
    lotteryTime: nowTime,
    companyName:'', companyLocation:'', isForeign:false,
    lotteryDrawDate: today,
    lotteryDrawTime: '15:00',
    lotteryBuyLocation: '',
    lotteryCompanyFull: '',
    pick:6, max:49,
    lastResult:'', prevDrawDate: today, prevDrawTime: '15:00', ticketNums:'',`);

// 2. Remove the old hasJatakam from form state root
code = code.replace(/hasJatakam: true,\s*manualTodayTithi:/, `manualTodayTithi:`);

fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
console.log('Saved');
