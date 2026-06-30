const fs = require('fs');

let code = fs.readFileSync('src/components/MahaAdrushta.tsx', 'utf8');

const sIdx = code.indexOf(`{step==='result' && result && (`);
if (sIdx > -1) {
    let newUI = `{step==='result' && result && (() => {
        const gl = result.globalData || result; // fallback if compute failed
        const users = result.users || [result]; // fallback if single
        
        return (
          <div className="space-y-5 animate-in fade-in duration-500 w-full">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-pink-500/50">
              <button type="button" onClick={() => setActiveTab(-1)} className={\`whitespace-nowrap px-4 py-2 rounded-xl font-bold transition-all \${activeTab === -1 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] border-2 border-indigo-400' : 'bg-slate-800 text-slate-400 border border-slate-700'}\`}>
                🌍 Global & Lottery Info
              </button>
              {users.map((u, i) => (
                <button type="button" key={i} onClick={() => setActiveTab(i)} className={\`whitespace-nowrap px-4 py-2 rounded-xl font-bold transition-all \${activeTab === i ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.5)] border-2 border-pink-400' : 'bg-slate-800 text-slate-400 border border-slate-700'}\`}>
                  👤 {u.userObj?.userName || 'User ' + (i+1)}
                </button>
              ))}
            </div>

            {activeTab === -1 && gl && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {gl.omillionairePrediction && (
                  <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-2 border-emerald-500 rounded-2xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5"/>O! Millionaire Exclusive Pattern Prediction
                    </h3>
                    <p className="text-xs text-emerald-200/70 mb-4">
                      215 పాత డ్రా ఫలితాల ఆధారంగా 6 మెయిన్ నంబర్లు మరియు 1 ఎక్స్‌ట్రా (Grand) నంబర్ విశ్లేషణ.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="flex-1 bg-slate-900/60 rounded-xl p-4 border border-emerald-500/30 text-center">
                        <p className="text-xs text-emerald-300 font-bold mb-2">మెయిన్ 6 నంబర్లు (Main 6)</p>
                        <div className="flex flex-wrap justify-center gap-3">
                          {gl.omillionairePrediction.predictedMain.map((n) => (
                            <div key={n} className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-100 text-lg font-black flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                              {n}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-900/60 rounded-xl p-4 border border-amber-500/30 text-center flex flex-col items-center justify-center">
                        <p className="text-xs text-amber-300 font-bold mb-2">గ్రాండ్ నంబర్ (Grand 1)</p>
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-amber-300 text-black text-xl font-black flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                          {gl.omillionairePrediction.predictedGrand}
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                      <div className="bg-slate-900/40 rounded-xl p-3 border border-red-500/20">
                        <p className="text-[10px] text-red-400 font-bold mb-1">🔥 Hot Numbers (ఎక్కువసార్లు వచ్చినవి)</p>
                        <p className="text-xs text-slate-300">{gl.omillionairePrediction.hotNumbers.join(', ')}</p>
                      </div>
                      <div className="bg-slate-900/40 rounded-xl p-3 border border-blue-500/20">
                        <p className="text-[10px] text-blue-400 font-bold mb-1">❄️ Cold Numbers (తక్కువసార్లు వచ్చినవి)</p>
                        <p className="text-xs text-slate-300">{gl.omillionairePrediction.coldNumbers.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {gl.table24h && (
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
                    <h3 className="text-pink-400 font-bold flex items-center gap-2 mb-4"><Clock className="w-4 h-4"/> 24-గంటల అదృష్ట చార్ట్ (లాటరీ కొనుగోలుకు)</h3>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {gl.table24h.map((h, i) => (
                        <div key={i} className={\`p-2 rounded-lg border text-center \${h.score>=8 ? 'bg-emerald-500/20 border-emerald-500' : h.score>=5 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-red-500/20 border-red-500'}\`}>
                          <div className="text-[10px] text-slate-400 mb-1">{h.time}</div>
                          <div className="font-bold text-xs">{h.score.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab >= 0 && users[activeTab] && (() => {
              const uRes = users[activeTab];
              return (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
                      <h3 className="text-pink-400 font-bold flex items-center gap-2 mb-4"><User className="w-4 h-4"/> {uRes.userObj?.userName || 'User Details'}</h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div><span className="text-slate-400 block mb-1">పేరు బలం:</span> <span className="font-bold text-emerald-400">{uRes.nV}</span></div>
                        <div><span className="text-slate-400 block mb-1">పుట్టినతేదీ బలం:</span> <span className="font-bold text-emerald-400">{uRes.dV}</span></div>
                        <div><span className="text-slate-400 block mb-1">జన్మ లగ్నం:</span> <span className="font-bold text-purple-400">{uRes.userObj?.lagnam !== undefined ? RASHIS[uRes.userObj.lagnam] : ''} {uRes.lagP !== undefined ? '('+PLANETS[uRes.lagP]+')' : ''}</span></div>
                        <div><span className="text-slate-400 block mb-1">జన్మ రాశి:</span> <span className="font-bold text-purple-400">{uRes.userObj?.rashi !== undefined ? RASHIS[uRes.userObj.rashi] : ''} {uRes.rashiP !== undefined ? '('+PLANETS[uRes.rashiP]+')' : ''}</span></div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                      <h3 className="text-slate-400 text-sm font-bold mb-2">Master Luck Score</h3>
                      <div className="text-6xl font-black bg-gradient-to-br from-pink-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                        {uRes.masterScore} <span className="text-2xl text-slate-500">/ 10</span>
                      </div>
                      {uRes.yogaBonus > 0 && <div className="text-emerald-400 text-xs font-bold mt-2">+{uRes.yogaBonus} Yoga Bonus Points Applied!</div>}
                    </div>
                  </div>

                  {uRes.yogas && uRes.yogas.length > 0 && (
                    <div className="bg-slate-900/50 border border-yellow-500/30 rounded-2xl p-4">
                      <h4 className="text-yellow-400 font-bold text-sm mb-3">మీ జాతక యోగాలు (Birth Yogas)</h4>
                      {uRes.dasha && (
                        <div className="text-xs text-slate-400 mb-3 bg-slate-800 p-2 rounded inline-block">
                          ప్రస్తుత దశ: <span className="text-white font-bold">{uRes.dasha.currentMahadasha} మహాదశ</span> - <span className="text-white font-bold">{uRes.dasha.currentAntardasha} భుక్తి</span>
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-3">
                        {uRes.yogas.map((y, i) => (
                          <div key={i} className={\`p-3 rounded-lg border \${y.type === 'Benefic' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}\`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={\`font-bold text-sm \${y.type === 'Benefic' ? 'text-emerald-400' : 'text-red-400'}\`}>{y.name}</span>
                              <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                                {y.points > 0 ? \`+\${y.points}\` : y.points} pts
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mb-2">{y.description}</p>
                            <div className="flex gap-2 text-[10px] font-bold">
                              {y.isDashaActive && <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1"><Zap className="w-3 h-3"/>దశ నడుస్తోంది (Active)</span>}
                              {y.isTransitActive && <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30 flex items-center gap-1"><Star className="w-3 h-3"/>ఈరోజు గోచారం అద్భుతం ✨</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/50 rounded-2xl p-5">
                    <h3 className="text-xl font-black text-yellow-400 flex items-center gap-2 mb-1"><Star className="w-5 h-5"/>🏆 42,000-Formula Final Numbers (Pick {gl?.pick} / 1–{gl?.max})</h3>
                    <div className="text-xs text-amber-200/70 mb-4 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> అత్యంత సంక్లిష్టమైన పాటర్న్స్, రాశి-లగ్న బలాలతో జనరేట్ చేయబడినవి.</div>
                    <div className="flex flex-wrap gap-3 justify-center mb-6">
                      {uRes.masterNums?.map((n, i) => (
                        <div key={i} className="relative group">
                          <div className="absolute inset-0 bg-yellow-400 blur opacity-40 group-hover:opacity-75 transition-opacity rounded-full"></div>
                          <div className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-amber-600 rounded-full flex items-center justify-center border-2 border-yellow-200 shadow-xl relative transform group-hover:scale-110 transition-transform">
                            <span className="text-xl font-black text-slate-900">{n}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
                    <h3 className="text-indigo-400 font-bold flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4"/> AI విశ్లేషణ
                      {!uRes.aiLoaded && <span className="text-xs text-indigo-300/60 animate-pulse ml-2">⏳ AI విశ్లేషించుతోంది...</span>}
                      {uRes.aiLoaded && <span className="text-xs text-emerald-400 ml-2">✅ Gemini AI</span>}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {uRes.aiReading || 'AI విశ్లేషణ లోడ్ అవుతోంది...'}
                    </p>
                  </div>
                </div>
              );
            })()}

            <button onClick={()=>{setStep('form');setResult(null);}} className="w-full mt-6 bg-slate-800 border border-slate-700 text-slate-300 py-3 rounded-2xl hover:bg-slate-700 transition text-sm font-bold flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4"/> మరోకసారి ప్రయత్నించండి
            </button>
          </div>
        )
      })}`;
      
    code = code.substring(0, sIdx) + newUI + '\n    </div>\n  );\n}';
    fs.writeFileSync('src/components/MahaAdrushta.tsx', code);
    console.log('UI Refactored with substring to EOF successfully!');
}
