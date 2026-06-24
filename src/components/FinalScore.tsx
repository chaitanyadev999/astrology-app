import React, { useState } from 'react';
import { Award, Zap, Shield, TrendingUp } from 'lucide-react';
import { NAKSHATRAS, RASIS } from '../lib/astrology';

export default function FinalScore() {
  const [lagna, setLagna] = useState(RASIS[0].sign);
  const [nakshatra, setNakshatra] = useState(NAKSHATRAS[0].name);
  const [score, setScore] = useState<number | null>(null);

  const calculateScore = () => {
    // A deterministic mock scoring logic out of 10
    let points = 5; // Base score
    
    // Add points based on Lagna (Fire/Earth/Air/Water)
    const lagnaData = RASIS.find(r => r.sign === lagna);
    if (lagnaData) {
      if (lagnaData.nature === 'Fire' || lagnaData.nature === 'Earth') points += 1.5;
      else points += 1;
    }

    // Add points based on Nakshatra Ruler
    const nakData = NAKSHATRAS.find(n => n.name === nakshatra);
    if (nakData) {
      const benefics = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
      if (benefics.includes(nakData.ruler)) points += 2;
      else points += 1.5; // Malefics also give strength
    }

    // Randomize a bit based on current date for "current transits"
    const transitMod = (new Date().getDate() % 3) * 0.5;
    points += transitMod;

    setScore(Math.min(10, Math.max(1, Number(points.toFixed(1)))));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl font-bold text-slate-100">Final Astrological Report</h2>
        <p className="text-slate-400 mt-2">Generate your ultimate luck and strength score out of 10 based on our deep analysis.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Select Your Lagna</label>
              <select 
                value={lagna}
                onChange={e => setLagna(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200"
              >
                {RASIS.map(r => (
                  <option key={r.sign} value={r.sign}>{r.sign}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Select Your Nakshatra</label>
              <select 
                value={nakshatra}
                onChange={e => setNakshatra(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200"
              >
                {NAKSHATRAS.map(n => (
                  <option key={n.name} value={n.name}>{n.name} (Ruled by {n.ruler})</option>
                ))}
              </select>
            </div>

            <button 
              onClick={calculateScore}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              Generate Final Score
            </button>
          </div>
        </div>

        {score !== null && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            
            <Award className="w-16 h-16 text-emerald-400 mb-4" />
            <h3 className="text-2xl font-bold text-slate-200 mb-2">Your Ultimate Score</h3>
            
            <div className="text-7xl font-black bg-gradient-to-br from-emerald-300 to-teal-500 bg-clip-text text-transparent my-4">
              {score}<span className="text-3xl text-slate-500">/10</span>
            </div>

            <p className="text-slate-400 max-w-sm">
              {score >= 8 
                ? "Excellent planetary alignment! The current transits and your chart rulers are indicating massive potential and luck."
                : score >= 6
                ? "Good strength. You have solid planetary foundations, just need to apply consistent hard work to see great results."
                : "A challenging phase. Your score indicates a need for patience and using the food/remedies recommended in the encyclopedia."}
            </p>

            <div className="flex gap-4 mt-8 w-full">
              <div className="flex-1 bg-slate-950/50 rounded-lg p-3 text-sm text-slate-400">
                <Zap className="w-4 h-4 text-yellow-400 mb-1 mx-auto" />
                High Energy
              </div>
              <div className="flex-1 bg-slate-950/50 rounded-lg p-3 text-sm text-slate-400">
                <Shield className="w-4 h-4 text-blue-400 mb-1 mx-auto" />
                Good Protection
              </div>
              <div className="flex-1 bg-slate-950/50 rounded-lg p-3 text-sm text-slate-400">
                <TrendingUp className="w-4 h-4 text-emerald-400 mb-1 mx-auto" />
                Steady Growth
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
