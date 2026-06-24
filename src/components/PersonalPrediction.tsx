import React, { useState } from 'react';
import { User, Sparkles, BookOpen, Star, ShieldCheck, Activity } from 'lucide-react';

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

// Extracted from Encyclopedia 1301-1400 Rules
const PLANETARY_REMEDIES: Record<number, any> = {
  1: {
    planet: "సూర్యుడు (Sun)",
    gemstone: "Ruby (కెంపు)",
    metal: "Gold or Copper",
    finger: "Ring Finger (ఉంగరం వేలు)",
    day: "Sunday morning",
    mantra: "Om Hraam Hreem Hroum Sah Suryaya Namah",
    color: "Red, Orange, Gold",
    health: "Good for heart, eyes, and bones.",
    business: "Highly recommended for politicians, government employees, and CEOs."
  },
  2: {
    planet: "చంద్రుడు (Moon)",
    gemstone: "Natural Pearl (ముత్యం)",
    metal: "Silver",
    finger: "Little Finger (చిటికెన వేలు)",
    day: "Monday morning/night",
    mantra: "Om Shraam Shreem Shroum Sah Chandraya Namah",
    color: "White, Silver, Pale Blue",
    health: "Controls blood pressure, mental depression.",
    business: "Good for artists, nurses, sailors, psychology."
  },
  3: {
    planet: "గురుడు (Jupiter)",
    gemstone: "Yellow Sapphire (కనకపుష్యరాగం)",
    metal: "Gold",
    finger: "Index Finger (చూపుడు వేలు)",
    day: "Thursday morning",
    mantra: "Om Graam Greem Groum Sah Gurave Namah",
    color: "Yellow, Light Yellow",
    health: "Liver, fat metabolism, digestion.",
    business: "Teachers, bankers, consultants, judges."
  },
  4: {
    planet: "రాహువు (Rahu)",
    gemstone: "Hessonite Garnet (గోమేధికం)",
    metal: "Ashtadhatu or Silver",
    finger: "Middle Finger",
    day: "Saturday or Wednesday evening",
    mantra: "Om Bhraam Bhreem Bhroum Sah Rahave Namah",
    color: "Smoky, Brown",
    health: "Mental confusion, hidden diseases, phobias.",
    business: "IT, hacking, stock market speculation, foreign trading."
  },
  5: {
    planet: "బుధుడు (Mercury)",
    gemstone: "Emerald (పచ్చ)",
    metal: "Gold or Silver",
    finger: "Little Finger",
    day: "Wednesday morning",
    mantra: "Om Braam Breem Broum Sah Budhaya Namah",
    color: "Green (ఆకుపచ్చ)",
    health: "Nervous system, skin diseases, speech disorders.",
    business: "Traders, CA, IT professionals, writers."
  },
  6: {
    planet: "శుక్రుడు (Venus)",
    gemstone: "Diamond (వజ్రం)",
    metal: "Platinum, White Gold, or Silver",
    finger: "Middle or Ring Finger",
    day: "Friday morning",
    mantra: "Om Draam Dreem Droum Sah Shukraya Namah",
    color: "Pure White, Pink",
    health: "Reproductive system, face glow, kidney function.",
    business: "Fashion, film industry, luxury cars, cosmetics."
  },
  7: {
    planet: "కేతువు (Ketu)",
    gemstone: "Cat's Eye (వైడూర్యం)",
    metal: "Ashtadhatu, Silver, or Gold",
    finger: "Ring Finger or Little Finger",
    day: "Tuesday or Thursday morning",
    mantra: "Om Sraam Sreem Sroum Sah Ketave Namah",
    color: "Multi-colored, Gray",
    health: "Unknown infections, allergies.",
    business: "Healing, occult, astrology, deep research."
  },
  8: {
    planet: "శనిదేవుడు (Saturn)",
    gemstone: "Blue Sapphire (నీలం)",
    metal: "Iron or Panchaloha",
    finger: "Middle Finger",
    day: "Saturday evening",
    mantra: "Om Praam Preem Proum Sah Shanaishcharaya Namah",
    color: "Black, Dark Blue",
    health: "Chronic diseases, bone marrow, knees.",
    business: "Heavy machinery, mining, agriculture, labor."
  },
  9: {
    planet: "కుజుడు (Mars)",
    gemstone: "Red Coral (పగడం)",
    metal: "Copper, Silver, or Gold",
    finger: "Ring Finger",
    day: "Tuesday morning",
    mantra: "Om Kraam Kreem Kroum Sah Bhaumaya Namah",
    color: "Bright Red (ముదురు ఎరుపు)",
    health: "Blood circulation, muscle strength.",
    business: "Engineers, surgeons, military, real estate."
  }
};

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

export default function PersonalPrediction() {
  const [userName, setUserName] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculatePersonalOracle = () => {
    if (!userName || !dob) return;

    const userNum = calculateNumerology(userName);
    const dobDigits = dob.replace(/[^0-9]/g, '');
    const lifePath = getSingleDigit(dobDigits.split('').reduce((sum, d) => sum + parseInt(d), 0));

    // Assume the most powerful ruling planet is determined by the lifePath (Date of Birth)
    const rulingPlanetId = lifePath;
    const therapy = PLANETARY_REMEDIES[rulingPlanetId];

    setResult({
      userNum,
      lifePath,
      therapy
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-fuchsia-400" />
          Personal Life Oracle
        </h2>
        <p className="text-slate-400 mt-2">Dynamic predictions pulled directly from the Encyclopedia 1-1400 Rules based on your exact Birth Date.</p>
      </header>

      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Your Full Name</label>
            <input 
              type="text" 
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 text-slate-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth</label>
            <input 
              type="date" 
              value={dob}
              onChange={e => setDob(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 text-slate-200"
            />
          </div>
        </div>
        
        <button 
          onClick={calculatePersonalOracle}
          className="w-full mt-6 bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:from-fuchsia-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] text-lg"
        >
          Generate My Personal Encyclopedia
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2 mb-6">
              <User className="w-6 h-6 text-fuchsia-400" /> Your Astrological Core
            </h3>
            <div className="flex gap-8">
              <div>
                <p className="text-slate-400 text-sm">Destiny Number (Name)</p>
                <p className="text-3xl font-black text-slate-200">{result.userNum}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Life Path Number (DOB)</p>
                <p className="text-3xl font-black text-fuchsia-400">{result.lifePath}</p>
              </div>
              <div className="flex-1">
                <p className="text-slate-400 text-sm">Primary Ruling Planet</p>
                <p className="text-xl font-bold text-fuchsia-300 mt-1">{result.therapy.planet}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                <Sparkles className="w-5 h-5 text-emerald-400" /> Gemstone Therapy (Rules 1300-1400)
              </h4>
              <ul className="space-y-4">
                <li className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Recommended Gemstone</span>
                  <span className="text-lg text-emerald-400 font-black">{result.therapy.gemstone}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Metal & Finger</span>
                  <span className="text-slate-300">{result.therapy.metal} • {result.therapy.finger}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Wearing Time</span>
                  <span className="text-slate-300">{result.therapy.day}</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                <Activity className="w-5 h-5 text-blue-400" /> Life & Business Paths
              </h4>
              <ul className="space-y-4">
                <li className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Mantra Activation</span>
                  <span className="text-sm font-medium text-blue-300 bg-blue-500/10 p-2 rounded mt-1 border border-blue-500/20">
                    {result.therapy.mantra}
                  </span>
                </li>
                <li className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Color Therapy</span>
                  <span className="text-slate-300">{result.therapy.color}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Business Alignment</span>
                  <span className="text-slate-300">{result.therapy.business}</span>
                </li>
                <li className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Health Benefits</span>
                  <span className="text-slate-300">{result.therapy.health}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-red-400 shrink-0" />
            <p className="text-sm text-red-200">
              <strong className="text-red-400">Rule 1400:</strong> Never combine enemy gemstones without deep horoscopic testing (e.g. wearing Blue Sapphire with Ruby is strictly prohibited).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
