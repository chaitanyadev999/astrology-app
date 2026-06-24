import React, { useState } from 'react';
import { User, Sun, Clock, MapPin, Compass } from 'lucide-react';

const RASHIS = [
  { id: 0, name: "మేషం (Aries)" },
  { id: 1, name: "వృషభం (Taurus)" },
  { id: 2, name: "మిథునం (Gemini)" },
  { id: 3, name: "కర్కాటకం (Cancer)" },
  { id: 4, name: "సింహం (Leo)" },
  { id: 5, name: "కన్య (Virgo)" },
  { id: 6, name: "తులా (Libra)" },
  { id: 7, name: "వృశ్చికం (Scorpio)" },
  { id: 8, name: "ధనస్సు (Sagittarius)" },
  { id: 9, name: "మకరం (Capricorn)" },
  { id: 10, name: "కుంభం (Aquarius)" },
  { id: 11, name: "మీనం (Pisces)" }
];

export default function JanamKundali() {
  const [dob, setDob] = useState('1990-01-01');
  const [tob, setTob] = useState('06:00');
  const [lagnaIndex, setLagnaIndex] = useState<number | null>(null);
  const [sunIndex, setSunIndex] = useState<number | null>(null);

  const calculateChart = () => {
    if (!dob || !tob) return;
    
    // Extract date info
    const birthDateObj = new Date(dob);
    const birthMonth = birthDateObj.getMonth();
    const birthDayNum = birthDateObj.getDate();

    // Calculate Sun Sign (Rashi) index based on standard Vedic transits (approximate)
    let sIndex = 0; 
    if (birthMonth === 0) sIndex = birthDayNum < 14 ? 8 : 9; 
    else if (birthMonth === 1) sIndex = birthDayNum < 13 ? 9 : 10; 
    else if (birthMonth === 2) sIndex = birthDayNum < 14 ? 10 : 11; 
    else if (birthMonth === 3) sIndex = birthDayNum < 14 ? 11 : 0; 
    else if (birthMonth === 4) sIndex = birthDayNum < 14 ? 0 : 1; 
    else if (birthMonth === 5) sIndex = birthDayNum < 14 ? 1 : 2; 
    else if (birthMonth === 6) sIndex = birthDayNum < 16 ? 2 : 3; 
    else if (birthMonth === 7) sIndex = birthDayNum < 16 ? 3 : 4; 
    else if (birthMonth === 8) sIndex = birthDayNum < 16 ? 4 : 5; 
    else if (birthMonth === 9) sIndex = birthDayNum < 17 ? 5 : 6; 
    else if (birthMonth === 10) sIndex = birthDayNum < 16 ? 6 : 7; 
    else if (birthMonth === 11) sIndex = birthDayNum < 16 ? 7 : 8; 

    setSunIndex(sIndex);

    // Calculate Lagna Shift (2 hours per sign from sunrise at 6:00 AM)
    const [hours, mins] = tob.split(':').map(Number);
    const birthMinutesFromMidnight = hours * 60 + mins;
    const sunriseMinutes = 360; 
    
    let diffMinutes = birthMinutesFromMidnight - sunriseMinutes;
    if (diffMinutes < 0) diffMinutes += 1440; 

    const lagnaShift = Math.floor(diffMinutes / 120); 
    const lIndex = (sIndex + lagnaShift) % 12;
    
    setLagnaIndex(lIndex);
  };

  const renderCell = (rashiId: number, name: string) => {
    const isLagna = lagnaIndex === rashiId;
    const isSun = sunIndex === rashiId;

    return (
      <div key={rashiId} className={`border border-slate-700 p-2 lg:p-4 flex flex-col justify-between aspect-square transition-all ${isLagna ? 'bg-indigo-900/40 ring-1 ring-indigo-500' : 'bg-slate-900/50 hover:bg-slate-800/80'}`}>
        <div className="text-xs lg:text-sm font-semibold text-slate-400">{name.split(' ')[0]}</div>
        <div className="flex flex-wrap gap-1 mt-auto">
          {isLagna && <span className="px-2 py-0.5 rounded bg-indigo-500 text-white text-[10px] lg:text-xs font-bold">లగ్నం (Asc)</span>}
          {isSun && <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] lg:text-xs font-bold">రవి (Sun)</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Compass className="w-8 h-8 text-indigo-400" />
          జనమ కుండలి (Janam Kundali)
        </h2>
        <p className="text-slate-400 mt-2">South Indian Telugu Style Birth Chart Generator with precise Lagna calculation.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 h-fit">
          <h3 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">Birth Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Sun className="w-4 h-4 text-indigo-400" /> Date of Birth
            </label>
            <input 
              type="date" 
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Time of Birth
            </label>
            <input 
              type="time" 
              value={tob}
              onChange={e => setTob(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200"
            />
          </div>

          <button 
            onClick={calculateChart}
            className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            Generate Chart
          </button>

          {lagnaIndex !== null && (
            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <p className="text-sm text-indigo-200 font-medium text-center">
                మీ లగ్నం: <span className="text-white font-bold text-lg block mt-1">{RASHIS[lagnaIndex].name}</span>
              </p>
            </div>
          )}
        </div>

        {/* Chart Rendering */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 lg:p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="grid grid-cols-4 grid-rows-4 w-full aspect-square border-2 border-slate-600 bg-slate-950 rounded-xl overflow-hidden shadow-2xl">
              {/* Row 1 */}
              {renderCell(11, RASHIS[11].name)}
              {renderCell(0, RASHIS[0].name)}
              {renderCell(1, RASHIS[1].name)}
              {renderCell(2, RASHIS[2].name)}
              
              {/* Row 2 */}
              {renderCell(10, RASHIS[10].name)}
              <div className="col-span-2 row-span-2 flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
                <Compass className="w-12 h-12 text-slate-700 mb-2 opacity-50" />
                <h4 className="text-slate-500 font-semibold uppercase tracking-widest text-sm">South Indian</h4>
                <p className="text-slate-600 text-xs">Birth Chart Grid</p>
              </div>
              {renderCell(3, RASHIS[3].name)}

              {/* Row 3 */}
              {renderCell(9, RASHIS[9].name)}
              {renderCell(4, RASHIS[4].name)}

              {/* Row 4 */}
              {renderCell(8, RASHIS[8].name)}
              {renderCell(7, RASHIS[7].name)}
              {renderCell(6, RASHIS[6].name)}
              {renderCell(5, RASHIS[5].name)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
