import React, { useState } from 'react';
import { calculateNameNumber, calculateBirthNumber, calculateLifePathNumber } from '../lib/astrology';
import { Calculator } from 'lucide-react';

export default function Dashboard() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [nameNum, setNameNum] = useState<number | null>(null);
  const [birthNum, setBirthNum] = useState<number | null>(null);
  const [lifePathNum, setLifePathNum] = useState<number | null>(null);

  const handleCalculate = () => {
    setNameNum(calculateNameNumber(name));
    setBirthNum(calculateBirthNumber(dob));
    setLifePathNum(calculateLifePathNumber(dob));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl font-bold text-slate-100">My Astrological Dashboard</h2>
        <p className="text-slate-400 mt-2">Enter your details to calculate your core numbers and get insights.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            Calculator
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Full Name or Business Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 transition-all"
                placeholder="e.g. John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date of Birth</label>
              <input 
                type="date" 
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 transition-all"
              />
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
            >
              Calculate Insights
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <ResultCard title="Name Number" value={nameNum} desc="Based on Chaldean Numerology" />
          <ResultCard title="Birth Number" value={birthNum} desc="Governs your basic personality" />
          <ResultCard title="Life Path Number" value={lifePathNum} desc="Shows your broader destiny and career" />
        </div>
      </div>
    </div>
  );
}

function ResultCard({ title, value, desc }: { title: string, value: number | null, desc: string }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex items-center justify-between group hover:bg-slate-800/50 transition-all">
      <div>
        <h4 className="text-slate-300 font-medium">{title}</h4>
        <p className="text-sm text-slate-500 mt-1">{desc}</p>
      </div>
      <div className="text-4xl font-bold bg-gradient-to-br from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        {value !== null ? value : '-'}
      </div>
    </div>
  );
}
