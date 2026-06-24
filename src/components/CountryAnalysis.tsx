import React, { useState } from 'react';
import { RASIS, getFavorableCountries, COUNTRY_RULERS } from '../lib/astrology';
import { Map, Star, ArrowRight } from 'lucide-react';

export default function CountryAnalysis() {
  const [lagna, setLagna] = useState(RASIS[0].sign);
  const [strongPlanet, setStrongPlanet] = useState(RASIS[0].ruler);

  const favorable = getFavorableCountries(lagna, strongPlanet);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl font-bold text-slate-100">Country Favorability</h2>
        <p className="text-slate-400 mt-2">Discover which countries are luckiest for you based on your strong planets and Lagna.</p>
      </header>

      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Select Your Lagna (Ascendant)</label>
            <select 
              value={lagna}
              onChange={e => setLagna(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200"
            >
              {RASIS.map(r => (
                <option key={r.sign} value={r.sign}>{r.sign} ({r.sanskrit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Select Your Strongest Planet</label>
            <select 
              value={strongPlanet}
              onChange={e => setStrongPlanet(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200"
            >
              {Array.from(new Set(RASIS.map(r => r.ruler))).map(planet => (
                <option key={planet} value={planet}>{planet}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-400" />
          Best Countries For You
        </h3>

        {favorable.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {favorable.map(c => (
              <div key={c.country} className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Star className="w-24 h-24 text-indigo-400" />
                </div>
                <h4 className="text-2xl font-bold text-slate-200 mb-1">{c.country}</h4>
                <div className="flex items-center gap-2 text-sm text-indigo-300 mb-4 font-medium">
                  <span>Ruled by {c.ruler}</span>
                  <span className="w-1 h-1 rounded-full bg-indigo-500/50"></span>
                  <span>{c.sign}</span>
                </div>
                <p className="text-slate-400 leading-relaxed">{c.luck}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            No specific extreme favorability found for this exact combination in our core database, but you can succeed anywhere with hard work! Check the encyclopedia for deeper planetary rules.
          </div>
        )}
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6">A-Z All Countries Matrix</h3>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400 text-sm">
                <th className="p-4 font-medium">Country</th>
                <th className="p-4 font-medium">Ruling Planet</th>
                <th className="p-4 font-medium">Zodiac Sign</th>
                <th className="p-4 font-medium">Core Energy</th>
              </tr>
            </thead>
            <tbody>
              {COUNTRY_RULERS.map((c, i) => (
                <tr key={c.country} className={`border-b border-slate-800/50 ${i % 2 === 0 ? 'bg-transparent' : 'bg-slate-950/20'} hover:bg-indigo-500/5 transition-colors`}>
                  <td className="p-4 font-medium text-slate-200">{c.country}</td>
                  <td className="p-4 text-indigo-300">{c.ruler}</td>
                  <td className="p-4 text-purple-300">{c.sign}</td>
                  <td className="p-4 text-slate-400 text-sm">{c.luck}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
