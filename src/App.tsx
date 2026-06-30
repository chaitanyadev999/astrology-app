import React, { useState } from 'react';
import { LayoutGrid, Compass, BookOpen, User, Star, Menu, X } from 'lucide-react';
import BusinessAnalyzer from './components/BusinessAnalyzer';
import Encyclopedia from './components/Encyclopedia';
import PersonalPrediction from './components/PersonalPrediction';
import CountryAnalysis from './components/CountryAnalysis';
import FinalScore from './components/FinalScore';
import JanamKundali from './components/JanamKundali';
import LotteryInvest from './components/LotteryInvest';
import WorldPredictions from './components/WorldPredictions';
import MahaAdrushta from './components/MahaAdrushta';
import LotteryChecklist from './components/LotteryChecklist';
import PanchangaCalendar from './components/PanchangaCalendar';

export default function App() {
  const [activeTab, setActiveTab] = useState('maha');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'analyzer', label: 'Vyapaara Jaathakam Global Pro', icon: <Star className="w-5 h-5" /> },
    { id: 'personal', label: 'Personal Prediction', icon: <User className="w-5 h-5" /> },
    { id: 'kundali', label: 'Janam Kundali (Telugu)', icon: <User className="w-5 h-5" /> },
    { id: 'lottery', label: 'Lottery & Laba Kaksha', icon: <Compass className="w-5 h-5 text-emerald-400" /> },
    { id: 'world', label: 'World Predictions', icon: <LayoutGrid className="w-5 h-5 text-blue-400" /> },
    { id: 'country', label: 'Global Astrology', icon: <Compass className="w-5 h-5" /> },
    { id: 'encyclopedia', label: 'Encyclopedia', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'maha', label: '🔮 మహా అదృష్ట దర్పణం', icon: <Star className="w-5 h-5 text-yellow-400" /> },
    { id: 'checklist', label: '📋 సమగ్ర చెక్లిస్ట్', icon: <BookOpen className="w-5 h-5 text-purple-400" /> },
    { id: 'panchanga', label: '🪐 పంచాంగ-హోరా', icon: <Star className="w-5 h-5 text-amber-400" /> },
    { id: 'final', label: 'Final Report', icon: <LayoutGrid className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AstroVedic</h1>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Premium Master Suite</p>
            </div>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // close on mobile
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === item.id 
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-800">
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Powered by ancient Vedic wisdom, numerology, and deep astrological calculations.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 relative z-40">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AstroVedic</h2>
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {activeTab === 'analyzer' && <BusinessAnalyzer />}
          {activeTab === 'personal' && <PersonalPrediction />}
          {activeTab === 'kundali' && <JanamKundali />}
          {activeTab === 'lottery' && <LotteryInvest />}
          {activeTab === 'world' && <WorldPredictions />}
          {activeTab === 'country' && <CountryAnalysis />}
          {activeTab === 'encyclopedia' && <Encyclopedia />}
          {activeTab === 'maha' && <MahaAdrushta />}
          {activeTab === 'checklist' && <LotteryChecklist />}
          {activeTab === 'panchanga' && <PanchangaCalendar />}
          {activeTab === 'final' && <FinalScore />}
        </div>
      </main>
    </div>
  );
}
