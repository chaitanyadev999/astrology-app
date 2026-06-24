import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Clock, AlertTriangle, ShieldCheck, Zap, MapPin, Star, Moon, Compass } from 'lucide-react';

const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

const PLANET_NAMES: Record<number, string> = {
  1: "సూర్యుడు (Sun)", 2: "చంద్రుడు (Moon)", 3: "గురుడు (Jupiter)",
  4: "రాహువు (Rahu)", 5: "బుధుడు (Mercury)", 6: "శుక్రుడు (Venus)",
  7: "కేతువు (Ketu)", 8: "శనిదేవుడు (Saturn)", 9: "కుజుడు (Mars)"
};

const RASHIS = ["మేషం (Aries)", "వృషభం (Taurus)", "మిథునం (Gemini)", "కర్కాటకం (Cancer)", "సింహం (Leo)", "కన్య (Virgo)", "తులా (Libra)", "వృశ్చికం (Scorpio)", "ధనస్సు (Sagittarius)", "మకరం (Capricorn)", "కుంభం (Aquarius)", "మీనం (Pisces)"];
const NAKSHATRAS = ["Ashwini (అశ్విని)", "Bharani (భరణి)", "Krittika (కృత్తిక)", "Rohini (రోహిణి)", "Mrigashira (మృగశిర)", "Ardra (ఆరుద్ర)", "Punarvasu (పునర్వసు)", "Pushya (పుష్యమి)", "Ashlesha (ఆశ్లేష)", "Magha (మఖ)", "Purva Phalguni (పుబ్బ)", "Uttara Phalguni (ఉత్తర)", "Hasta (హస్త)", "Chitra (చిత్త)", "Swati (స్వాతి)", "Vishakha (విశాఖ)", "Anuradha (అనూరాధ)", "Jyeshtha (జ్యేష్ఠ)", "Mula (మూల)", "Purva Ashadha (పూర్వాషాఢ)", "Uttara Ashadha (ఉత్తరాషాఢ)", "Shravana (శ్రవణం)", "Dhanishta (ధనిష్ఠ)", "Shatabhisha (శతభిషం)", "Purva Bhadrapada (పూర్వాభాద్ర)", "Uttara Bhadrapada (ఉత్తరాభాద్ర)", "Revati (రేవతి)"];
const LAGNAS = RASHIS;

// Kaksha (Choghadiya) Types
const KAKSHA_TYPES: Record<string, { name: string, effect: string, color: string }> = {
  Amruta: { name: "అమృత (Amruta)", effect: "Excellent", color: "text-emerald-400" },
  Shubha: { name: "శుభ (Shubha)", effect: "Good", color: "text-emerald-300" },
  Labha: { name: "లాభ (Labha)", effect: "Profit", color: "text-emerald-500" },
  Sukha: { name: "సుఖ / చల (Sukha/Chala)", effect: "Neutral/Comfort", color: "text-blue-400" },
  Udvega: { name: "ఉద్వేగ (Udvega)", effect: "Anxiety", color: "text-amber-500" },
  Roga: { name: "రోగ (Roga)", effect: "Disease", color: "text-red-500" },
  Kala: { name: "కాల (Kala)", effect: "Loss", color: "text-red-600" }
};

// Standard Kaksha Sequences
const DAY_KAKSHA = [
  ['Udvega', 'Sukha', 'Labha', 'Amruta', 'Kala', 'Shubha', 'Roga', 'Udvega'], // Sun (0)
  ['Amruta', 'Kala', 'Shubha', 'Roga', 'Udvega', 'Sukha', 'Labha', 'Amruta'], // Mon (1)
  ['Roga', 'Udvega', 'Sukha', 'Labha', 'Amruta', 'Kala', 'Shubha', 'Roga'],   // Tue (2)
  ['Labha', 'Amruta', 'Kala', 'Shubha', 'Roga', 'Udvega', 'Sukha', 'Labha'],  // Wed (3)
  ['Shubha', 'Roga', 'Udvega', 'Sukha', 'Labha', 'Amruta', 'Kala', 'Shubha'], // Thu (4)
  ['Sukha', 'Labha', 'Amruta', 'Kala', 'Shubha', 'Roga', 'Udvega', 'Sukha'],  // Fri (5)
  ['Kala', 'Shubha', 'Roga', 'Udvega', 'Sukha', 'Labha', 'Amruta', 'Kala']    // Sat (6)
];
const NIGHT_KAKSHA = [
  ['Shubha', 'Amruta', 'Sukha', 'Roga', 'Kala', 'Labha', 'Udvega', 'Shubha'], // Sun Night (0)
  ['Sukha', 'Roga', 'Kala', 'Labha', 'Udvega', 'Shubha', 'Amruta', 'Sukha'],  // Mon Night (1)
  ['Kala', 'Labha', 'Udvega', 'Shubha', 'Amruta', 'Sukha', 'Roga', 'Kala'],   // Tue Night (2)
  ['Udvega', 'Shubha', 'Amruta', 'Sukha', 'Roga', 'Kala', 'Labha', 'Udvega'], // Wed Night (3)
  ['Amruta', 'Sukha', 'Roga', 'Kala', 'Labha', 'Udvega', 'Shubha', 'Amruta'], // Thu Night (4)
  ['Roga', 'Kala', 'Labha', 'Udvega', 'Shubha', 'Amruta', 'Sukha', 'Roga'],   // Fri Night (5)
  ['Labha', 'Udvega', 'Shubha', 'Amruta', 'Sukha', 'Roga', 'Kala', 'Labha']   // Sat Night (6)
];

const getSingleDigit = (num: number): number => {
  if (num <= 0) return 5; 
  let s = num;
  while (s > 9) {
    s = s.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
  }
  return s === 0 ? 5 : s;
};

const calculateNumerology = (name: string) => {
  let total = 0;
  name.toUpperCase().replace(/[^A-Z]/g, '').split('').forEach(char => {
    total += CHALDEAN_MAP[char] || 0;
  });
  return getSingleDigit(total);
};

export default function LotteryInvest() {
  // Required
  const [userName, setUserName] = useState('');
  const [targetName, setTargetName] = useState('');
  const [dob, setDob] = useState('');
  
  // Optional Deep Scan
  const [isDeepScanOpen, setIsDeepScanOpen] = useState(false);
  const [userRashi, setUserRashi] = useState('');
  const [userNakshatram, setUserNakshatram] = useState('');
  const [userLagna, setUserLagna] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  
  const [result, setResult] = useState<any>(null);
  const [currentKaksha, setCurrentKaksha] = useState<string | null>(null);

  useEffect(() => {
    const updateKaksha = () => {
      const now = new Date();
      let dayOfWeek = now.getDay(); 
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      
      const totalMinutesFromMidnight = currentHour * 60 + currentMin;
      let isDayTime = true;
      let minutesFromStart = 0;
      const sunriseMins = 6 * 60; 
      const sunsetMins = 18 * 60; 

      if (totalMinutesFromMidnight >= sunriseMins && totalMinutesFromMidnight < sunsetMins) {
        isDayTime = true;
        minutesFromStart = totalMinutesFromMidnight - sunriseMins;
      } else {
        isDayTime = false;
        if (totalMinutesFromMidnight < sunriseMins) {
          dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          minutesFromStart = (totalMinutesFromMidnight + 24 * 60) - sunsetMins;
        } else {
          minutesFromStart = totalMinutesFromMidnight - sunsetMins;
        }
      }

      const kakshaIndex = Math.floor(minutesFromStart / 90);
      const safeIndex = Math.min(7, Math.max(0, kakshaIndex));

      let activeKaksha = isDayTime ? DAY_KAKSHA[dayOfWeek][safeIndex] : NIGHT_KAKSHA[dayOfWeek][safeIndex];
      setCurrentKaksha(activeKaksha);
    };

    updateKaksha();
    const timer = setInterval(updateKaksha, 60000);
    return () => clearInterval(timer);
  }, []);

  const analyzeLottery = () => {
    if (!userName || !targetName || !dob) return;

    const userNum = calculateNumerology(userName);
    const targetNum = calculateNumerology(targetName);
    
    const dobDigits = dob.replace(/[^0-9]/g, '');
    const lifePath = getSingleDigit(dobDigits.split('').reduce((sum, d) => sum + parseInt(d), 0));

    let score = 50;
    let deepInsights = [];
    
    // Core check
    if (userNum === targetNum) score += 20;
    if (lifePath === targetNum) score += 15;

    // Kaksha Check
    let timeStatus = "Neutral";
    if (currentKaksha === 'Labha' || currentKaksha === 'Amruta') {
      score += 15;
      timeStatus = `Extremely Auspicious (${currentKaksha} Kaksha operating)`;
    } else if (currentKaksha === 'Shubha' || currentKaksha === 'Sukha') {
      score += 5;
      timeStatus = `Favorable (${currentKaksha} Kaksha operating)`;
    } else {
      score -= 15;
      timeStatus = `Delay / Blockage (${currentKaksha} Kaksha operating - Avoid)`;
    }

    // Optional Location Match (కలిసి వస్తుందా?)
    let locationStatus = null;
    let locationScore = 0;
    if (companyLocation) {
      const locNum = calculateNumerology(companyLocation);
      const isFriendly = (locNum === userNum || locNum === lifePath || [3,5,6].includes(locNum));
      
      if (locNum === userNum) {
        locationScore = 15;
        score += 15;
        locationStatus = `ఈ ప్రదేశం (${companyLocation}) మీకు 100% కలిసి వస్తుంది! (Very Highly Favorable)`;
      } else if (isFriendly) {
        locationScore = 10;
        score += 10;
        locationStatus = `ఈ ప్రదేశం మీకు అనుకూలంగా ఉంది. (Favorable Location)`;
      } else {
        score -= 5;
        locationStatus = `ఈ ప్రదేశం అంత అనుకూలం కాదు. (Neutral or Challenging Location)`;
      }
    }

    // Optional Rashi/Nakshatra/Lagna Depth
    if (userRashi) {
      score += 5; // Adds confidence to the calculation
      deepInsights.push(`రాశి బలం: ${userRashi} శక్తి పరిగణనలోకి తీసుకోబడింది.`);
    }
    if (userNakshatram) {
      score += 5;
      deepInsights.push(`నక్షత్ర బలం: ${userNakshatram} దశ అనుకూలత స్కోర్ జోడించబడింది.`);
    }
    if (userLagna) {
      score += 5;
      deepInsights.push(`లగ్న బలం: ${userLagna} లగ్న కారకత్వం విశ్లేషించబడింది.`);
    }

    const winProbability = Math.min(99, Math.max(1, score));

    setResult({
      userNum,
      targetNum,
      lifePath,
      winProbability,
      timeStatus,
      locationStatus,
      deepInsights,
      targetPlanetName: PLANET_NAMES[targetNum] || "Unknown",
      userPlanetName: PLANET_NAMES[userNum] || "Unknown",
      kakshaName: currentKaksha ? KAKSHA_TYPES[currentKaksha].name : "Unknown",
      kakshaColor: currentKaksha ? KAKSHA_TYPES[currentKaksha].color : "text-white"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Target className="w-8 h-8 text-emerald-400" />
          Lottery & Investment Oracle
        </h2>
        <p className="text-slate-400 mt-2">Deep Advanced Scan: Numerology, Kaksha, Location compatibility, and Rashi/Nakshatra strength.</p>
      </header>

      {/* Real-Time Kaksha Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Current Time Kaksha (కక్ష్య)
          </h3>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            Right now, the universal phase is: 
            <strong className={`ml-2 text-lg ${currentKaksha ? KAKSHA_TYPES[currentKaksha].color : 'text-slate-400'}`}>
              {currentKaksha ? KAKSHA_TYPES[currentKaksha].name : "Calculating..."}
            </strong>
          </p>
        </div>
        <div className="hidden md:block">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 h-fit">
          <h3 className="text-xl font-bold text-slate-200 mb-4 border-b border-slate-800 pb-2">Core Details (Required)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Your Full Name</label>
              <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="E.g. Mohan Kumar"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-200" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-200" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Lottery Company / Asset Name</label>
              <input type="text" value={targetName} onChange={e => setTargetName(e.target.value)} placeholder="E.g. Mega Millions, Tesla"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-200" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button 
              onClick={() => setIsDeepScanOpen(!isDeepScanOpen)}
              className="text-sm font-medium flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isDeepScanOpen ? <Moon className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              {isDeepScanOpen ? "Hide Advanced Astrological Inputs" : "Show Deep Scan Options (Rashi, Lagna, Location)"}
            </button>
          </div>

          {isDeepScanOpen && (
            <div className="space-y-4 pt-4 animate-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400"/> Company Location (కలిసి వస్తుందా?)</label>
                <input type="text" value={companyLocation} onChange={e => setCompanyLocation(e.target.value)} placeholder="E.g. Dubai, New York, Mumbai"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Rashi (రాశి)</label>
                  <select value={userRashi} onChange={e => setUserRashi(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-200">
                    <option value="">-- Select --</option>
                    {RASHIS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Lagna (లగ్నం)</label>
                  <select value={userLagna} onChange={e => setUserLagna(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-200">
                    <option value="">-- Select --</option>
                    {LAGNAS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Nakshatram (నక్షత్రం)</label>
                <select value={userNakshatram} onChange={e => setUserNakshatram(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-200">
                  <option value="">-- Select --</option>
                  {NAKSHATRAS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          )}

          <button 
            onClick={analyzeLottery}
            className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] text-lg"
          >
            Run Deep Astrological Scan
          </button>
        </div>

        {result && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-start relative overflow-hidden h-fit">
            <div className={`absolute top-0 left-0 w-full h-1 ${result.winProbability >= 70 ? 'bg-emerald-400' : result.winProbability >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}></div>
            
            <div className="text-center mb-8 pt-4">
              <h3 className="text-xl font-bold text-slate-200">Total Success Probability</h3>
              <div className={`text-7xl font-black mt-4 ${result.winProbability >= 70 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]' : result.winProbability >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {result.winProbability}%
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-sm">Target Asset Planet</span>
                <span className="text-slate-200 font-bold">{result.targetPlanetName}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-sm">Your Destiny Planet</span>
                <span className="text-slate-200 font-bold">{result.userPlanetName}</span>
              </div>
              
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Present Time Verdict
                </h4>
                <p className="text-sm text-slate-400">{result.timeStatus}</p>
                {result.timeStatus.includes("Avoid") && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Wait for a favorable Kaksha.</p>
                )}
              </div>

              {result.locationStatus && (
                <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" /> Location Compatibility
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium">{result.locationStatus}</p>
                </div>
              )}

              {result.deepInsights.length > 0 && (
                <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deep Astrological Hits</h4>
                  <ul className="space-y-2">
                    {result.deepInsights.map((insight: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                        <Star className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
