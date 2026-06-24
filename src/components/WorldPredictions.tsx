import React, { useState } from 'react';
import { Globe, CalendarDays, BarChart4, Globe2, Activity, MapPin } from 'lucide-react';

const PREDICTIONS = {
  World: {
    day: "Global supply chains remain stable. Precious metals experience high volatility today.",
    week: "High geopolitical tension mid-week. Best time for short-term tech trading is between Tuesday and Thursday.",
    month: "With strong solar energy, this month heavily favors the AI and renewable energy sectors.",
    year: "Major shift towards decentralized finance and heavy regulation of social media platforms."
  },
  Country: {
    day: "National indices face mild correction. Banking sector holds strong.",
    week: "Government policy announcements on Friday will dictate market movement.",
    month: "Infrastructure and defense spending increases, boosting related stocks.",
    year: "Focus on national self-reliance and domestic manufacturing growth."
  },
  State: {
    day: "Regional transportation and logistics see high activity today.",
    week: "Agriculture and water resource management are the primary focus.",
    month: "State-level subsidies will boost local real estate development.",
    year: "Massive shift in regional demographic voting patterns and tax reforms."
  },
  City: {
    day: "Local retail and food businesses experience an unexpected surge in demand.",
    week: "Local real estate transactions slow down until the weekend.",
    month: "Commercial property values shift towards suburban tech-parks.",
    year: "Urban infrastructure overhauls will dominate local governance budgets."
  }
};

export default function WorldPredictions() {
  const [geoLevel, setGeoLevel] = useState<'World' | 'Country' | 'State' | 'City'>('World');
  const [locationName, setLocationName] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-400" />
          Geo-Mundane Predictions
        </h2>
        <p className="text-slate-400 mt-2">Filter astrological market trends from the Global macro-level down to your local City.</p>
      </header>

      {/* Geo Selector */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-end">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" /> Geographical Level
          </label>
          <select 
            value={geoLevel} 
            onChange={(e) => setGeoLevel(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-200"
          >
            <option value="World">World (Macro Global)</option>
            <option value="Country">Country (National)</option>
            <option value="State">State (Regional)</option>
            <option value="City">City (Local)</option>
          </select>
        </div>
        
        {geoLevel !== 'World' && (
          <div className="w-full md:w-2/3 animate-in fade-in zoom-in duration-300">
            <label className="block text-sm font-medium text-slate-400 mb-2">Enter {geoLevel} Name</label>
            <input 
              type="text" 
              placeholder={`E.g. ${geoLevel === 'Country' ? 'India, USA' : geoLevel === 'State' ? 'Texas, Telangana' : 'Mumbai, New York'}`}
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-200"
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Outlook */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <CalendarDays className="w-8 h-8 text-blue-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">Daily {geoLevel} Trend</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {PREDICTIONS[geoLevel].day}
          </p>
        </div>

        {/* Weekly Trend */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
          <Activity className="w-8 h-8 text-indigo-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">Weekly {geoLevel} Outlook</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {PREDICTIONS[geoLevel].week}
          </p>
        </div>

        {/* Monthly Outlook */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
          <BarChart4 className="w-8 h-8 text-purple-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">Monthly {geoLevel} Shift</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            {PREDICTIONS[geoLevel].month}
          </p>
        </div>

        {/* Yearly Macro */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-fuchsia-500/50 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500"></div>
          <Globe2 className="w-8 h-8 text-fuchsia-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">Yearly {geoLevel} Macro</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            {PREDICTIONS[geoLevel].year}
          </p>
        </div>
      </div>

      {geoLevel === 'World' && (
        <div className="mt-8 bg-slate-900/30 border border-slate-800 rounded-2xl p-8 animate-in fade-in duration-500">
          <h3 className="text-xl font-bold text-slate-200 mb-4">Global Hotspots</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <h4 className="text-emerald-400 font-bold mb-1">Highly Favored</h4>
              <p className="text-sm text-slate-300">USA (Tech), India (Manufacturing)</p>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <h4 className="text-amber-400 font-bold mb-1">Neutral / Shifting</h4>
              <p className="text-sm text-slate-300">Europe (Banking), Japan (Robotics)</p>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <h4 className="text-red-400 font-bold mb-1">Challenged</h4>
              <p className="text-sm text-slate-300">South America (Agriculture delays)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
