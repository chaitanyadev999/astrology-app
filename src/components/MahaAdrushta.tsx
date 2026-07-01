import { useState, useCallback, useMemo } from 'react';
import {
  Star, Clock, RefreshCw, ChevronDown, ChevronUp,
  Upload, Globe, Target, Zap, BookOpen, TrendingUp,
  Hash, Loader2, CheckCircle, AlertCircle, MapPin, Save, Trash2, Users, User
} from 'lucide-react';
import {
  fetchPlanetPositions, fetchPanchang, fetchChoghadiya, fetchAiInterpret,
  planetsToChartMap, ProkeralaPlanet, PanchangData, ChoghadiyaSlot
} from '../services/prokerala';
import { AstrologyBlueprint } from './AstrologyBlueprint';
import { getPanchangaForDateTime, getLivePanchanga, LivePanchanga } from '../services/panchangaEngine';
import { CATEGORIES_291 } from '../data/categories291';
import { detectYogas, detectIndependentYogas, YogaResult } from '../utils/yogaEngine';
import { getCurrentDasha, DashaResult } from '../utils/dashaEngine';
import { generateOmillionairePrediction } from '../utils/omillionaireEngine';

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const RASHIS = ["మేషం","వృషభం","మిథునం","కర్కాటకం","సింహం","కన్య","తుల","వృశ్చికం","ధనుస్సు","మకరం","కుంభం","మీనం"];
const NAKSHATRAMS = ["అశ్విని","భరణి","కృత్తిక","రోహిణి","మృగశిర","ఆరుద్ర","పునర్వసు","పుష్యమి","ఆశ్లేష","మఖ","పుబ్బ","ఉత్తర","హస్త","చిత్త","స్వాతి","విశాఖ","అనూరాధ","జ్యేష్ఠ","మూల","పూర్వాషాడ","ఉత్తరాషాడ","శ్రవణం","ధనిష్ఠ","శతభిషం","పూర్వాభాద్ర","ఉత్తరాభాద్ర","రేవతి"];
const NAK_LORDS = ["కేతు","శుక్ర","సూర్య","చంద్ర","కుజ","రాహు","గురు","శని","బుధ","కేతు","శుక్ర","సూర్య","చంద్ర","కుజ","రాహు","గురు","శని","బుధ","కేతు","శుక్ర","సూర్య","చంద్ర","కుజ","రాహు","గురు","శని","బుధ"];
const PLANET_NUM: Record<string,number> = {"సూర్య":1,"చంద్ర":2,"గురు":3,"రాహు":4,"బుధ":5,"శుక్ర":6,"కేతు":7,"శని":8,"కుజ":9};
const LAGNAM_PLANET = ["కుజ","శుక్ర","బుధ","చంద్ర","సూర్య","బుధ","శుక్ర","కుజ","గురు","శని","శని","గురు"];
const TARA_LABELS = ["","జన్మ తార","సంపత్ తార","విపత్ తార","క్షేమ తార","ప్రత్యక్ తార","సాధన తార","నైధన తార","మిత్ర తార","అతి మిత్ర తార"];
const TARA_SCORES = [0,0,3,-1,2,-1,2,-1,2,3];
const CHALDEAN: Record<string,number> = {A:1,I:1,J:1,Q:1,Y:1,B:2,K:2,R:2,C:3,G:3,L:3,S:3,D:4,M:4,T:4,E:5,H:5,N:5,X:5,U:6,V:6,W:6,O:7,Z:7,F:8,P:8};

const HORA_SEQ = ["సూర్య","శుక్ర","బుధ","చంద్ర","శని","గురు","కుజ"];
const DAY_KAKSHA: Record<number,string[]> = {
  0:["ఉద్వేగ","సుఖ","లాభ","అమృత","కాల","శుభ","రోగ","ఉద్వేగ"],1:["అమృత","కాల","శుభ","రోగ","ఉద్వేగ","సుఖ","లాభ","అమృత"],
  2:["రోగ","ఉద్వేగ","సుఖ","లాభ","అమృత","కాల","శుభ","రోగ"],3:["లాభ","అమృత","కాల","శుభ","రోగ","ఉద్వేగ","సుఖ","లాభ"],
  4:["శుభ","రోగ","ఉద్వేగ","సుఖ","లాభ","అమృత","కాల","శుభ"],5:["సుఖ","లాభ","అమృత","కాల","శుభ","రోగ","ఉద్వేగ","సుఖ"],
  6:["కాల","శుభ","రోగ","ఉద్వేగ","సుఖ","లాభ","అమృత","కాల"],
};
const KAKSHA_PLANET_MAP: Record<string,string> = {"అమృత":"చంద్ర","లాభ":"బుధ","శుభ":"శుక్ర","సుఖ":"గురు","ఉద్వేగ":"సూర్య","రోగ":"కుజ","కాల":"శని"};
const KAKSHA_INFO: Record<string,{score:number;te:string;lotteryOk:boolean}> = {
  "అమృత":{score:10,te:"ధన ప్రాప్తి, మహా శుభం ✨",lotteryOk:true},
  "లాభ":{score:9,te:"లాభం, వ్యాపార విజయం 💰",lotteryOk:true},
  "శుభ":{score:7,te:"శుభం, మంచి ఫలితాలు ✅",lotteryOk:true},
  "సుఖ":{score:5,te:"సుఖం, సాధారణ ఫలితాలు 🔵",lotteryOk:true},
  "ఉద్వేగ":{score:3,te:"ఆందోళన, జాగ్రత్త ⚠️",lotteryOk:false},
  "రోగ":{score:2,te:"నష్టం, రోగ పీడ 🔴",lotteryOk:false},
  "కాల":{score:1,te:"మహా నష్టం - వద్దు ☠️",lotteryOk:false},
};
const HORA_INFO: Record<string,{score:number;te:string;lotteryMsg:string}> = {
  "గురు":{score:10,te:"అదృష్టం, ధనం, విజయం",lotteryMsg:"🏆 లాటరీ కొనడానికి అత్యుత్తమ సమయం!"},
  "శుక్ర":{score:9,te:"సంతోషం, ఆనందం, వాహన లాభం",lotteryMsg:"🌟 లాటరీ, జూదం కు చాలా మంచి సమయం"},
  "బుధ":{score:7,te:"వ్యాపారం, విదేశీ ధనం",lotteryMsg:"✅ Online/Foreign lottery కు మంచిది"},
  "చంద్ర":{score:6,te:"మనశ్శాంతి, ద్రవ సంపద",lotteryMsg:"🔵 స్వల్ప లాభం వచ్చే అవకాశం"},
  "సూర్య":{score:5,te:"అధికారం, గౌరవం",lotteryMsg:"🟡 ప్రభుత్వ lottery కు మంచిది"},
  "శని":{score:3,te:"ఆలస్యం, కష్టాలు",lotteryMsg:"⚠️ లాటరీ కు అనుకూలం కాదు - వేచి చూడండి"},
  "కుజ":{score:2,te:"ఘర్షణ, రక్తపాతం",lotteryMsg:"❌ ఈ గంటలో లాటరీ వద్దు - నష్టం కలుగుతుంది"},
};

// Enemy & Friend planet maps
const ENEMY_MAP: Record<string,string[]> = {
  'సూర్య':['శుక్ర','శని'],'చంద్ర':['రాహు','కేతు'],'కుజ':['బుధ'],
  'బుధ':['చంద్ర'],'గురు':['బుధ','శుక్ర'],'శుక్ర':['సూర్య','చంద్ర'],
  'శని':['సూర్య','చంద్ర','కుజ'],'రాహు':['సూర్య','చంద్ర','కుజ'],'కేతు':['సూర్య','చంద్ర']
};
const FRIEND_MAP: Record<string,string[]> = {
  'సూర్య':['చంద్ర','కుజ','గురు'],'చంద్ర':['సూర్య','బుధ'],'కుజ':['సూర్య','చంద్ర','గురు'],
  'బుధ':['సూర్య','శుక్ర'],'గురు':['సూర్య','చంద్ర','కుజ'],'శుక్ర':['బుధ','శని'],
  'శని':['బుధ','శుక్ర'],'రాహు':['శని','శుక్ర','బుధ'],'కేతు':['కుజ','శని','బుధ']
};

const PLANET_VIBRATIONS: Record<string, number> = {
  'సూర్య': 1, 'చంద్ర': 2, 'గురు': 3, 'రాహు': 4,
  'బుధ': 5, 'శుక్ర': 6, 'కేతు': 7, 'శని': 8, 'కుజ': 9,
  // Add English equivalents just in case
  'Sun': 1, 'Moon': 2, 'Jupiter': 3, 'Rahu': 4,
  'Mercury': 5, 'Venus': 6, 'Ketu': 7, 'Saturn': 8, 'Mars': 9
};

const getLagnaAtTime = (birthLagna: number, hour: number): number => {
  let hFrom6 = hour - 6; if (hFrom6 < 0) hFrom6 += 24;
  return (birthLagna + Math.floor(hFrom6 / 2)) % 12;
};
const LAGNAM_LOTTERY_MSG: Record<number,string> = {
  0:"కుజ లగ్నం → సాహసికంగా లాభం",1:"శుక్ర లగ్నం → ఆనందం, వాహన లాభం",
  2:"బుధ లగ్నం → విదేశీ, Online లాభం",3:"చంద్ర లగ్నం → స్వల్ప లాభం",
  4:"సూర్య లగ్నం → ప్రభుత్వ, అధికార లాభం",5:"బుధ లగ్నం → వ్యాపార విజయం",
  6:"శుక్ర లగ్నం → ఆభరణ, ఆనంద లాభం",7:"కుజ లగ్నం → ఆకస్మిక రహస్య లాభం",
  8:"గురు లగ్నం → మహా ధన లాభం 🏆",9:"శని లగ్నం → ఆలస్య, కష్టాలు",
  10:"శని లగ్నం → ఆలస్యం, వ్యయం",11:"గురు లగ్నం → మహా అదృష్టం 🏆",
};
const LAGNAM_SCORE: Record<number,number> = {0:6,1:8,2:7,3:5,4:5,5:7,6:8,7:6,8:10,9:3,10:3,11:10};

// ─────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────
const reduce9 = (n: number): number => { while (n > 9) n = String(n).split('').reduce((a,b) => a+parseInt(b), 0); return n || 1; };
const getNavamshaRasiIdx = (longitude: number): number => Math.floor((longitude * 9) / 30) % 12;
const nameNum = (s: string) => reduce9(s.toUpperCase().replace(/[^A-Z]/g,'').split('').reduce((a,c) => a+(CHALDEAN[c]||0), 0));
const dateNum = (s: string) => reduce9(s.replace(/\D/g,'').split('').reduce((a,b) => a+parseInt(b), 0));
const timeToUnix = (dateStr: string, timeStr: string) => Math.floor(new Date(`${dateStr}T${timeStr}:00+05:30`).getTime() / 1000);
const findApiSlot = (dateStr: string, timeStr: string, table: any[], fallbackFn: ()=>string) => {
  if (!table || table.length === 0) return fallbackFn();
  const u = timeToUnix(dateStr, timeStr);
  for (const s of table) {
     if (u >= s.start_unix && u < s.end_unix) return s.name || s.planet;
  }
  return fallbackFn();
};
const EN_TO_TE_KAKSHA: Record<string,string> = {"Amrit":"అమృత","Shubh":"శుభ","Labh":"లాభ","Char":"సుఖ","Udveg":"ఉద్వేగ","Rog":"రోగ","Kaal":"కాల"};
const API_HORA_TO_SHORT: Record<string,string> = {"సూర్యుడు":"సూర్య","చంద్రుడు":"చంద్ర","అంగారకుడు":"కుజ","బుధుడు":"బుధ","గురువు":"గురు","శుక్రుడు":"శుక్ర","శని":"శని"};

const getTodayNak = (dateStr: string): number => {
  const base = new Date('2000-01-06'); const d = new Date(dateStr);
  return (((Math.floor((d.getTime()-base.getTime())/86400000)*27/29.53)|0)%27+27)%27;
};
const getChandraBalam = (rashi: number, dateStr: string) => {
  const moon = (Math.floor(((new Date(dateStr).getTime()-new Date('2000-01-06').getTime())/86400000*13.176/30))%12+12)%12;
  const house = ((moon-rashi+12)%12)+1;
  return {house, good:[1,3,6,7,10,11].includes(house), score:[1,3,6,7,10,11].includes(house)?3:[8,12].includes(house)?-2:0};
};
const getTara = (birthNak: number, todayNak: number) => {
  const diff = ((todayNak-birthNak+27)%27)+1; const n = ((diff-1)%9)+1;
  return {taraNum:n, taraName:TARA_LABELS[n], score:TARA_SCORES[n]};
};
const genNums = (vib: number, max: number): number[] => {
  const r: number[] = [];
  for (let i=1; i<=max; i++) if (reduce9(i)===vib) r.push(i);
  return r;
};
const kakshaColor = (k: string) => ['అమృత','లాభ'].includes(k)?'text-emerald-400':['శుభ','సుఖ'].includes(k)?'text-blue-400':['ఉద్వేగ'].includes(k)?'text-amber-400':'text-red-500';
const horaColor = (h: string) => ['గురు','శుక్ర'].includes(h)?'text-emerald-400':['బుధ','చంద్ర'].includes(h)?'text-blue-300':['సూర్య'].includes(h)?'text-amber-300':'text-red-400';
const scoreBg = (s: number) => s>=8?'bg-emerald-500/10 border-emerald-500/40':s>=5?'bg-blue-500/10 border-blue-500/30':'bg-red-500/10 border-red-500/30';
const scoreColor = (s: number) => s>=8?'text-emerald-400':s>=5?'text-blue-300':'text-red-400';

// ─────────────────────────────────────────────
//  SOUTH INDIAN KUNDALI CHART
// ─────────────────────────────────────────────
const GRID_RASI = [11,0,1,2,10,-1,-1,3,9,-1,-1,4,8,7,6,5];

const KundaliChart = ({
  title, positions, colorClass, apiPlanets, loading
}: {
  title: string; colorClass: string;
  positions?: Record<string,number>;
  apiPlanets?: ProkeralaPlanet[];
  loading?: boolean;
}) => {
  const byRasi: Record<number, string[]> = {};
  for (let i=0; i<12; i++) byRasi[i] = [];
  if (apiPlanets && apiPlanets.length > 0) {
    const nameMap: Record<string,string> = {
      'Sun':'సూర్య','Moon':'చంద్ర','Mars':'కుజ','Mercury':'బుధ','Jupiter':'గురు',
      'Venus':'శుక్ర','Saturn':'శని','Rahu':'రాహు','Ketu':'కేతు',
      'Rahu (Mean)':'రాహు','Ketu (Mean)':'కేతు','Ascendant':'లగ్న'
    };
    for (const p of apiPlanets) {
      const te = nameMap[p.name]; const ri = p.rashi?.id - 1;
      if (te && ri >= 0 && ri < 12) byRasi[ri].push(te + (p.is_retrograde?' (R)':''));
    }
  } else if (positions) {
    for (const [planet, rasi] of Object.entries(positions)) {
      if (byRasi[rasi] !== undefined) byRasi[rasi].push(planet);
    }
  }
  return (
    <div className="w-full">
      <p className={`text-center text-xs font-bold mb-1.5 ${colorClass}`}>{title}</p>
      {loading ? (
        <div className="aspect-square bg-slate-900 border-2 border-yellow-500/30 rounded-lg flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin"/>
        </div>
      ) : (
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(4,1fr)', gridTemplateRows:'repeat(4,1fr)',
          aspectRatio:'1/1', gap:'1px', background:'rgba(255,215,0,0.25)',
          border:'2px solid rgba(255,215,0,0.5)', borderRadius:'4px', overflow:'hidden'
        }}>
          {GRID_RASI.map((ri, gp) => {
            if (ri === -1) {
              if (gp === 5) return (
                <div key={gp} style={{gridColumn:'2/4', gridRow:'2/4', background:'#020617'}}
                  className="flex flex-col items-center justify-center text-center p-1">
                  <span className="text-yellow-400/60 text-xs font-bold">జాతక</span>
                  <span className="text-yellow-400/60 text-xs font-bold">చక్రం</span>
                </div>
              );
              return null;
            }
            const planets = byRasi[ri] || [];
            return (
              <div key={gp} className="bg-slate-950 flex flex-col p-0.5 relative min-h-0 overflow-hidden">
                <span className="text-[8px] text-slate-600 absolute bottom-0.5 right-0.5">{RASHIS[ri].substring(0,2)}</span>
                {planets.map((p, i) => (
                  <span key={i} className={`text-[9px] font-bold leading-tight ${p.startsWith('లగ్న')?'text-yellow-400 underline':p.includes('(R)')?'text-orange-300':'text-slate-200'}`}>
                    {p.length>5 ? p.substring(0,4) : p}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  GAUGE
// ─────────────────────────────────────────────
const Gauge = ({score, max=10}: {score: number; max?: number}) => {
  const pct = Math.min(100, Math.max(0, (score/max)*100));
  const col = pct>=70?'#10b981':pct>=50?'#f59e0b':'#ef4444';
  return (
    <div style={{width:130,height:130,borderRadius:'50%',background:`conic-gradient(${col} ${pct}%,#1e293b 0)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 30px ${col}55`}}>
      <div style={{width:100,height:100,borderRadius:'50%',background:'#020617',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
        <span className="text-3xl font-black" style={{color:col}}>{score.toFixed(1)}</span>
        <span className="text-xs text-slate-400">/{max}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
const getLocalTime = () => {
  const n = new Date();
  return {
    d: `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`,
    t: `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
  };
};
const initTime = getLocalTime();
const today = initTime.d;
const nowTime = initTime.t;

export default function MahaAdrushta() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeProfileIdx, setActiveProfileIdx] = useState(-1);
  const saveProfile = () => {
    const newProfiles = [...profiles];
    if (activeProfileIdx >= 0) {
      newProfiles[activeProfileIdx] = {...form, id: profiles[activeProfileIdx].id || Date.now()};
    } else {
      newProfiles.push({...form, id: Date.now()});
      setActiveProfileIdx(newProfiles.length - 1);
    }
    setProfiles(newProfiles);
  };
  const loadProfile = (idx) => {
    setActiveProfileIdx(idx);
    setForm(p => ({...p, ...profiles[idx]}));
  };
  const newProfile = () => {
    setActiveProfileIdx(-1);
    setForm(p => ({...p, userName:'', dob:'', dobTime:'06:00', lagnam:0, rashi:0, nakshatram:0, hasJatakam:true}));
  };
  const [form, setForm] = useState({
    users: [],
    userName:'', dob:'', dobTime:'06:00',
    lat:'17.3850', lon:'78.4867',
    lagnam:0, rashi:0, nakshatram:0,
    orderDate:today, orderTime:nowTime,
    lotteryTime: nowTime,
    // Lottery details (optional)
    companyName:'', companyLocation:'', isForeign:false,
    lotteryDrawDate: today,
    lotteryDrawTime: '15:00',
    lotteryBuyLocation: '',
    lotteryCompanyFull: '',
    pick:6, max:49,
    lastResult:'', prevDrawDate: today, prevDrawTime: '15:00', ticketNums:'',
    hasJatakam: true,
    manualTodayTithi: '', manualTodayNak: '', manualTodayVara: '',
    manualDrawTithi: '', manualDrawNak: '', manualDrawVara: '',
    savedPredictions: ''
  });
  const set = (k: string, v: any) => setForm(p => ({...p, [k]:v}));

  const [step, setStep] = useState<'form'|'loading'|'result'>('form');
  const [cd, setCd] = useState(60);
  const [ltxt, setLtxt] = useState('');
  const [result, setResult] = useState<any>(null);
  const [birthImg, setBirthImg] = useState<string|null>(null);
  const [transitImg, setTransitImg] = useState<string|null>(null);
  const [openSec, setOpenSec] = useState<string|null>('lotteryTime');
  const [visibleCombos, setVisibleCombos] = useState(12);
  const [errLog, setErrLog] = useState('');

  interface SavedPrediction {
    id: string;
    companyName: string;
    orderDate: string;
    drawDate: string;
    predictedNums: number[];
    actualNums: number[] | null;
    aiExplanation: string;
  }

  const [history, setHistory] = useState<SavedPrediction[]>(() => {
    try {
      const saved = localStorage.getItem('maha_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const saveToHistory = (newPred: SavedPrediction) => {
    const updated = [newPred, ...history];
    setHistory(updated);
    localStorage.setItem('maha_history', JSON.stringify(updated));
  };

  const deleteFromHistory = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('maha_history', JSON.stringify(updated));
  };

  const updateHistoryActuals = (id: string, actuals: number[], aiExp: string) => {
    const updated = history.map(h => h.id === id ? { ...h, actualNums: actuals, aiExplanation: aiExp } : h);
    setHistory(updated);
    localStorage.setItem('maha_history', JSON.stringify(updated));
  };

  const analyzeHistory = async (id: string, nums: number[], h: SavedPrediction) => {
    updateHistoryActuals(id, nums, '⏳ AI విశ్లేషిస్తోంది...');
    try {
      const apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        updateHistoryActuals(id, nums, '⚠️ API Key లేదు. దయచేసి ఫారం లో పైన మీ Gemini API Key ఇవ్వండి.');
        return;
      }
      
      const prompt = `మీరు ఒక గొప్ప జ్యోతిష్య, లాటరీ విశ్లేషకులు.
కంపెనీ: ${h.companyName}
Draw Date: ${h.drawDate}
మేము అంచనా వేసిన నంబర్లు: ${h.predictedNums.join(', ')}
నిజంగా వచ్చిన లాటరీ రిజల్ట్ నంబర్లు: ${nums.join(', ')}

దయచేసి ఈ లాటరీ రిజల్ట్ నంబర్లు ఎందుకు వచ్చాయి, ఇందులో ఏమైనా ప్యాటర్న్స్ లేదా గ్రహ వైబ్రేషన్స్ దాగి ఉన్నాయా, మరియు నెక్స్ట్ టైమ్ (నెక్స్ట్ వీక్) కి ఈ రిజల్ట్ పాటర్న్ ఎలా ఉపయోగపడుతుంది అనేది తెలుగులో క్లుప్తంగా, స్పష్టంగా వివరించండి. (Max 3-4 paragraphs).`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "విశ్లేషణలో లోపం జరిగింది.";
      updateHistoryActuals(id, nums, text);
    } catch(e) {
      updateHistoryActuals(id, nums, "Error: విశ్లేషణ ఫెయిల్ అయింది.");
    }
  };

  const [birthPlanets, setBirthPlanets] = useState<ProkeralaPlanet[]>([]);
  const [birthPlanetsArray, setBirthPlanetsArray] = useState<ProkeralaPlanet[][]>([]);
  const [transitPlanets, setTransitPlanets] = useState<ProkeralaPlanet[]>([]);
  const [lotteryPlanets, setLotteryPlanets] = useState<ProkeralaPlanet[]>([]);
  const [panchang, setPanchang] = useState<PanchangData|null>(null);
  const [drawPanchang, setDrawPanchang] = useState<PanchangData|null>(null);
  const [choghadiya, setChoghadiya] = useState<ChoghadiyaSlot[]>([]);
  const [drawChoghadiya, setDrawChoghadiya] = useState<ChoghadiyaSlot[]>([]);
  const [apiOk, setApiOk] = useState<boolean|null>(null);
  const [chartsLoading, setChartsLoading] = useState(false);

  // ── Live Panchanga (auto-computes from form lottery time + location) ──
  const livePanchanga = useMemo<LivePanchanga>(() => {
    try {
      return getPanchangaForDateTime(form.orderDate, form.lotteryTime, parseFloat(form.lat)||17.385, parseFloat(form.lon)||78.487);
    } catch { return getLivePanchanga(new Date(), 17.385, 78.487); }
  }, [form.orderDate, form.lotteryTime, form.lat, form.lon]);

  const livePanchangaDraw = useMemo<LivePanchanga>(() => {
    try {
      return getPanchangaForDateTime(form.lotteryDrawDate, form.lotteryDrawTime, parseFloat(form.lat)||17.385, parseFloat(form.lon)||78.487);
    } catch { return getLivePanchanga(new Date(), 17.385, 78.487); }
  }, [form.lotteryDrawDate, form.lotteryDrawTime, form.lat, form.lon]);

  const livePanchangaPrevDraw = useMemo<LivePanchanga>(() => {
    try {
      return getPanchangaForDateTime(form.prevDrawDate, form.prevDrawTime, parseFloat(form.lat)||17.385, parseFloat(form.lon)||78.487);
    } catch { return getLivePanchanga(new Date(), 17.385, 78.487); }
  }, [form.prevDrawDate, form.prevDrawTime, form.lat, form.lon]);

  const handleImg = (setter:(s:string)=>void) => (e:React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return;
    const r = new FileReader(); r.onload = ev => setter(ev.target?.result as string); r.readAsDataURL(f);
  };

  const lTxts = [
    "VedIntel API: గ్రహ స్థానాలు తీసుకుంటున్నాము...",
    "జన్మ కాల గ్రహ స్థానాలు API నుండి తీసుకుంటున్నాము...",
    "ఈరోజు గోచార గ్రహ స్థానాలు తీసుకుంటున్నాము...",
    "Draw Day పంచాంగం: నక్షత్రం, తిథి తీసుకుంటున్నాము...",
    "42,000-Formula Engine: అన్ని calculations చేస్తున్నాము...",
    "శత్రు గ్రహాలు, HH/H/N/LL ratings నిర్ణయిస్తున్నాము...",
  ];

  const runAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading'); setCd(60); setLtxt(lTxts[0]);
    setChartsLoading(true); setErrLog('');

    const f = form;
    const safeDate = (d) => d || new Date().toISOString().split('T')[0];
    const safeTime = (t) => t || '06:00';

    const dobDt = `${safeDate(f.dob)}T${safeTime(f.dobTime)}:00+05:30`;
    const orderDt = `${safeDate(f.orderDate)}T${safeTime(f.orderTime)}:00+05:30`;
    const drawDt = `${safeDate(f.lotteryDrawDate)}T${safeTime(f.lotteryDrawTime)}:00+05:30`;

    try {
      const lotteryDt = `${safeDate(f.orderDate)}T${safeTime(f.lotteryTime)}:00+05:30`;
      const dObj = new Date(orderDt);
      dObj.setDate(dObj.getDate() - 1);
      const yesterdayDt = dObj.toISOString();

      const aiQ = `నేను ఈరోజు ${f.orderDate} నాడు ${f.lotteryTime} కి ${f.lotteryCompanyFull||f.companyName||'lottery'} లాటరీ కొనాలి. Draw date: ${f.lotteryDrawDate} at ${f.lotteryDrawTime}. కంపెనీ: ${f.lotteryCompanyFull||f.companyName}. కొనే స్థానం: ${f.lotteryBuyLocation||f.companyLocation||'Hyderabad'}. నా జాతక చక్రం మరియు గోచార గ్రహ స్థానాల ఆధారంగా: 1) ఈ సమయం శుభమా? 2) Draw day అదృష్టంగా ఉందా? 3) Lucky numbers (1-${f.max} range) ఏవి? 4) Hora & Kaksha start/end times ఇవ్వండి.`;

      const lat = f.lat || '17.3850';
      const lon = f.lon || '78.4867';
      const userList = profiles.length > 0 ? profiles : [f];
      const pBirths = userList.map(u => (u.hasJatakam && u.dob) ? fetchPlanetPositions(`${safeDate(u.dob)}T${safeTime(u.dobTime)}:00+05:30`, u.lat || '17.3850', u.lon || '78.4867') : Promise.resolve([]));
      
      const [tp, lp, pg, cg, yPg, yCg, dpg, dcg, aiRes] = await Promise.all([
        fetchPlanetPositions(orderDt, lat, lon),
        fetchPlanetPositions(lotteryDt, lat, lon),
        fetchPanchang(orderDt, lat, lon),
        fetchChoghadiya(orderDt, lat, lon),
        fetchPanchang(yesterdayDt, lat, lon),
        fetchChoghadiya(yesterdayDt, lat, lon),
        fetchPanchang(drawDt, lat, lon),
        fetchChoghadiya(drawDt, lat, lon),
        fetchAiInterpret(lotteryDt, lat, lon, aiQ)
      ]);
      const bpArray = await Promise.all(pBirths);

      if (pg && yPg && pg.hora_table && yPg.hora_table) {
        pg.hora_table = [...yPg.hora_table, ...pg.hora_table];
      }

      setBirthPlanetsArray(bpArray);
      setBirthPlanets(bpArray[0] || []);
      setTransitPlanets(tp);
      setLotteryPlanets(lp);
      setPanchang(pg);
      setDrawPanchang(dpg);
      setChoghadiya([...yCg, ...cg]);
      setDrawChoghadiya(dcg);
      setApiOk(true);
      (window as any)._lastAiInterpret = aiRes;
    } catch (err) {
      console.error('API error:', err);
      setErrLog(String((err as any).stack || err));
      setApiOk(false);
    }
    setChartsLoading(false);

    let t = 60;
    const iv = setInterval(() => {
      t--; setCd(t);
      const idx = Math.floor((60-t)/10);
      if ((60-t)%10===0 && idx<lTxts.length) setLtxt(lTxts[idx]);
      if (t<=0) { clearInterval(iv); compute(); }
    }, 1000);
  };

  const todayNakIdx = getTodayNak(today);

  const compute = useCallback(() => { try {
    const f = form;
    const userList = profiles.length > 0 ? profiles : [f];
    
    // Global predictions (shared across all users)
    const globalActualDrawNak = (!f.hasJatakam && f.manualDrawNak) ? parseInt(f.manualDrawNak) : livePanchangaDraw.nak;
    const drawNakNameGlobal = globalActualDrawNak ? NAKSHATRAMS[globalActualDrawNak - 1] : (drawPanchang?.nakshatra?.[0]?.name || '');
    const drawHoraGlobal = livePanchangaDraw.horaTE;
    const drawKakshaGlobal = livePanchangaDraw.kaksha;
    
    // Compute results for each user
    const userResults = userList.map((userObj, userIdx) => {
      const userBirthPlanets = birthPlanetsArray[userIdx] || [];
      let userLagna = userObj.lagnam;
      let userRashi = userObj.rashi;
      let userNakIdx = userObj.nakshatram;
      
      if (userObj.hasJatakam) {
        if (userBirthPlanets.length > 0) {
          const as = userBirthPlanets.find(p => p.name === 'Ascendant' || p.name === 'లగ్న');
          if (as && as.rashi) userLagna = as.rashi.id - 1;
          const mo = userBirthPlanets.find(p => p.name === 'Moon' || p.name === 'చంద్ర');
          if (mo && mo.rashi) {
            userRashi = mo.rashi.id - 1;
            if (mo.nakshatra) {
              const nStr = mo.nakshatra.replace('ఢ','డ').replace('ఫల్గుణి','').trim();
              const nIdx = NAKSHATRAMS.findIndex(n => n.includes(nStr) || nStr.includes(n));
              if (nIdx !== -1) userNakIdx = nIdx;
            }
          }
        }
      } else {
        userLagna = getLagnaAtTime(0, parseInt(f.orderTime.split(':')[0])); 
        userRashi = livePanchanga.lagnaRashiIdx; 
        userNakIdx = (!userObj.hasJatakam && userObj.manualTodayNak) ? parseInt(userObj.manualTodayNak) - 1 : Math.max(0, (livePanchanga.nak || 1) - 1);
      }
      
      const lagP = LAGNAM_PLANET[userLagna]; const lagV = PLANET_NUM[lagP]||1;
      const rashiP = LAGNAM_PLANET[userRashi]; const rashiV = PLANET_NUM[rashiP]||2;
      const nakL = NAK_LORDS[userNakIdx]; const nakV = PLANET_NUM[nakL]||3;
      
      // Let's replace 'f.userName' with 'userObj.userName' where it matters
      const nV = nameNum(userObj.userName || ''); const dV = dateNum(userObj.dob || '');

    const compFullV = nameNum(f.lotteryCompanyFull || f.companyName);
    const buyLocV = nameNum(f.lotteryBuyLocation || f.companyLocation || 'India');
    const cV = compFullV; const lV = buyLocV;

    const lotteryHour = parseInt(f.lotteryTime.split(':')[0]);
    let sunRashi = 0;
    if (transitPlanets.length > 0) {
      const su = transitPlanets.find(p => p.name === 'Sun' || p.name === 'సూర్య');
      if (su && su.rashi) sunRashi = su.rashi.id - 1;
    }
    let lotteryLagna = getLagnaAtTime(sunRashi, lotteryHour);
    // ✅ Override with precise astronomical lagna from panchangaEngine
    lotteryLagna = livePanchanga.lagnaRashiIdx;

    // Manual Overrides for No Jatakam
    const actualTodayTithi = (!f.hasJatakam && f.manualTodayTithi) ? parseInt(f.manualTodayTithi) : livePanchanga.tithi;
    const actualTodayNak = (!f.hasJatakam && f.manualTodayNak) ? parseInt(f.manualTodayNak) : livePanchanga.nak;
    const actualTodayVara = (!f.hasJatakam && f.manualTodayVara) ? parseInt(f.manualTodayVara) : livePanchanga.vara;
    const actualDrawTithi = (!f.hasJatakam && f.manualDrawTithi) ? parseInt(f.manualDrawTithi) : livePanchangaDraw.tithi;
    const actualDrawNak = (!f.hasJatakam && f.manualDrawNak) ? parseInt(f.manualDrawNak) : livePanchangaDraw.nak;
    const actualDrawVara = (!f.hasJatakam && f.manualDrawVara) ? parseInt(f.manualDrawVara) : livePanchangaDraw.vara;

    const lLagnaScore = LAGNAM_SCORE[lotteryLagna] || 5;
    // Use livePanchanga hora/kaksha for precise astronomical hora
    const lHoraInfo = HORA_INFO[hora]||{score:5,te:'',lotteryMsg:''};
    const lKakshaInfo = KAKSHA_INFO[kaksha]||{score:5,te:'',lotteryOk:true};
    const lotteryTimeScore = Math.round((lLagnaScore + lHoraInfo.score + lKakshaInfo.score)/3);
    const lotteryHora = hora;
    const lotteryKaksha = kaksha;

    // ─── DRAW DAY Analysis ───
    const drawNakName = actualDrawNak ? NAKSHATRAMS[actualDrawNak - 1] : (drawPanchang?.nakshatra?.[0]?.name || '');
    const drawNakIdxRaw = NAKSHATRAMS.findIndex(n => drawNakName.includes(n) || n.includes(drawNakName));
    const drawNakIdx2 = drawNakIdxRaw !== -1 ? drawNakIdxRaw : 0;
    const drawNakL = NAK_LORDS[drawNakIdx2];
    const drawNakV = PLANET_NUM[drawNakL] || 1;
    const drawHora = livePanchangaDraw.horaTE;
    const drawKaksha = livePanchangaDraw.kaksha;
    const drawHoraScore = HORA_INFO[drawHora]?.score || 5;
    const drawKakshaScore = KAKSHA_INFO[drawKaksha]?.score || 5;
    const drawTithi = actualDrawTithi ? 'తిథి ' + actualDrawTithi : (livePanchangaDraw.tithiName || '');
    const drawVaara = actualDrawVara ? 'వారం ' + actualDrawVara : (livePanchangaDraw.varaName || '');
    const drawTithiV = reduce9(actualDrawTithi);
    const drawVaaraV = reduce9(actualDrawVara === 0 ? 1 : (actualDrawVara === livePanchangaDraw.vara ? (livePanchangaDraw.vara === 0 ? 1 : livePanchangaDraw.vara + 1) : actualDrawVara)); // Sunday=1...Saturday=7
    const drawDayScore = Math.round((drawHoraScore + drawKakshaScore) / 2);

    // ─── 291 CATEGORIES with HH/H/N/LL ───
    const isEnemy = (planet: string) => (ENEMY_MAP[lagP] || []).includes(planet);
    const isFriend = (planet: string) => (FRIEND_MAP[lagP] || []).includes(planet);

    const makeCatScore = (base: number, planet: string) => {
      if (isEnemy(planet)) return Math.max(1, base - 2);
      if (isFriend(planet)) return Math.min(5, base + 1);
      return base;
    };

    const horaBase = HORA_INFO[hora]?.score >= 8 ? 5 : HORA_INFO[hora]?.score >= 6 ? 4 : HORA_INFO[hora]?.score >= 4 ? 3 : 2;
    const kakshaBase = KAKSHA_INFO[kaksha]?.score >= 8 ? 5 : KAKSHA_INFO[kaksha]?.score >= 6 ? 4 : KAKSHA_INFO[kaksha]?.score >= 4 ? 3 : 2;

    type Cat = {id:string;te:string;planet:string;vib:number;nums:number[];score:number;stars:number;isEnemy:boolean;isFriend:boolean;hh:string;hhColor:string;hhBg:string};
    const makeCat = (id:string, te:string, planet:string, vib:number, baseScore:number): Cat => {
      const score = makeCatScore(baseScore, planet);
      const stars = score >= 5 ? 5 : score >= 4 ? 4 : score >= 3 ? 3 : score >= 2 ? 2 : 1;
      const enemy = isEnemy(planet);
      const friend = isFriend(planet);
      let hh: string; let hhColor: string; let hhBg: string;
      if (enemy) { hh = '🔴 LL'; hhColor = 'text-red-400'; hhBg = 'bg-red-900/10 border-red-500/30'; }
      else if (score >= 4 && friend) { hh = '🟢 HH'; hhColor = 'text-emerald-400'; hhBg = 'bg-emerald-900/10 border-emerald-500/30'; }
      else if (score >= 4) { hh = '🟢 HH'; hhColor = 'text-emerald-400'; hhBg = 'bg-emerald-900/10 border-emerald-500/30'; }
      else if (score >= 3) { hh = '🔵 H'; hhColor = 'text-blue-400'; hhBg = 'bg-blue-900/10 border-blue-500/30'; }
      else if (score >= 2) { hh = '🟡 N'; hhColor = 'text-amber-400'; hhBg = 'bg-amber-900/10 border-amber-500/20'; }
      else { hh = '🔴 LL'; hhColor = 'text-red-400'; hhBg = 'bg-red-900/10 border-red-500/30'; }
      return {id, te, planet, vib, nums: genNums(vib, f.max), score, stars, isEnemy: enemy, isFriend: friend, hh, hhColor, hhBg};
    };

    const lagScore = LAGNAM_SCORE[userLagna] >= 8 ? 5 : LAGNAM_SCORE[userLagna] >= 6 ? 4 : 3;
    const cats: Cat[] = [
      makeCat('lagnam', `లగ్నం (${RASHIS[userLagna]}) → ${lagP}`, lagP, lagV, lagScore),
      makeCat('rashi', `జన్మ రాశి (${RASHIS[userRashi]}) → ${rashiP}`, rashiP, rashiV, cb.good ? 4 : 3),
      makeCat('nak', `జన్మ నక్షత్రం (${NAKSHATRAMS[userNakIdx]}) → ${nakL}`, nakL, nakV, tara.score >= 2 ? 5 : tara.score >= 0 ? 3 : 1),
      makeCat('todaynak', `ఈరోజు నక్షత్రం (${todayNakName}) → ${todayNakL}`, todayNakL, todayNakV, 3),
      makeCat('chandra', `చంద్ర బలం (${cb.house}వ స్థానం) ${cb.good?'✅':'⚠️'}`, 'చంద్ర', reduce9(cb.house), cb.good ? 5 : cb.score >= 0 ? 3 : 1),
      makeCat('hora', `కొనే సమయ హోరా → ${hora}`, hora, PLANET_NUM[hora]||1, horaBase),
      makeCat('kaksha', `కొనే సమయ కక్ష్య → ${kaksha} (${kashaP})`, kashaP, PLANET_NUM[kashaP]||3, kakshaBase),
      makeCat('name', `పేరు సంఖ్య → ${nV} (${f.userName.split(' ')[0]||'?'})`, 'బుధ', nV, nV===lagV?5:nV===rashiV?4:3),
      makeCat('dob', `DOB సంఖ్య → ${dV}`, 'సూర్య', dV, dV===nV?5:dV===lagV?4:3),
      makeCat('comp', `కంపెనీ సంఖ్య → ${compFullV} (${f.lotteryCompanyFull||f.companyName||'?'})`, 'బుధ', compFullV, compFullV===nV||compFullV===dV?5:compFullV===lagV?4:3),
      makeCat('loc', `కొనే స్థానం సంఖ్య → ${buyLocV} (${f.lotteryBuyLocation||f.companyLocation||'?'})`, 'శని', buyLocV, buyLocV===nV||buyLocV===dV?5:4),
    ];

    // Draw day extra category
    const drawCatScore = drawDayScore >= 8 ? 5 : drawDayScore >= 6 ? 4 : 3;
    const drawCat = makeCat('draw', `Draw Day నక్షత్రం (${drawNakName||'?'}) → ${drawNakL}`, drawNakL, drawNakV, drawCatScore);

    // Enemy numbers to avoid
    const avoidNums = new Set<number>(cats.filter(c => c.isEnemy).flatMap(c => c.nums));

    // ─── 42,195 UNIQUE COMBINATIONS (42,000-formula engine) ───
    const combos: any[] = [];
    const flat291 = CATEGORIES_291.flatMap(g => g.items);
    const hashCode = (s:string) => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);

    const uniqueCats291 = flat291.map((cName, i) => {
      const baseRaw = cats[Math.abs(hashCode(cName)) % cats.length];
      const harmonicStep = (Math.abs(hashCode(cName + "salt")) % 5) + 1;
      const harmonicStart = (Math.abs(hashCode(cName + "pepper")) % f.max) + 1;
      
      const newNums = new Set(baseRaw.nums);
      for(let k=0; k<3; k++) {
        let n = harmonicStart + (k * harmonicStep);
        if(n > f.max) n = (n % f.max) || 1;
        newNums.add(n);
      }
      return { ...baseRaw, nums: Array.from(newNums), id: `C${i+1}` };
    });

    for (let i=0; i<flat291.length; i++) {
      for (let j=i+1; j<flat291.length; j++) {
        const c1Name = flat291[i];
        const c2Name = flat291[j];

        const aRaw = uniqueCats291[i];
        const bRaw = uniqueCats291[j];

        const avgScore=(aRaw.score+bRaw.score)/2;
        const bothEnemy = aRaw.isEnemy && bRaw.isEnemy;
        const oneEnemy = aRaw.isEnemy || bRaw.isEnemy;
        const bothFriend = aRaw.isFriend && bRaw.isFriend;
        
        let badge: string; let bColor: string;
        if (bothEnemy) { badge = '🔴 LL'; bColor = 'bg-red-500/10 border-red-500/20 text-red-400'; }
        else if (oneEnemy) { badge = '🟡 N'; bColor = 'bg-amber-500/10 border-amber-500/20 text-amber-300'; }
        else if (avgScore >= 4.5 || (avgScore >= 4 && bothFriend)) { badge = '🟢 HH'; bColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'; }
        else if (avgScore >= 3) { badge = '🔵 H'; bColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300'; }
        else if (avgScore >= 2) { badge = '🟡 N'; bColor = 'bg-amber-500/10 border-amber-500/20 text-amber-300'; }
        else { badge = '🔴 LL'; bColor = 'bg-red-500/10 border-red-500/20 text-red-400'; }

        const bColorSafe = bothEnemy ? 'bg-red-500/10 border-red-500/20 text-red-400' : oneEnemy ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : avgScore >= 4.5 || (avgScore >= 4 && bothFriend) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : avgScore >= 3 ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' : avgScore >= 2 ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-red-500/10 border-red-500/20 text-red-400';
        const a = { ...aRaw, te: c1Name.substring(0, 35) + '...' };
        const b = { ...bRaw, te: c2Name.substring(0, 35) + '...' };

        const merged=[...new Set([...aRaw.nums,...bRaw.nums])].sort((x,y)=>x-y).filter(n=>n>=1&&n<=f.max).slice(0,f.pick*2);
        
        // Astro patterns
        let highNumCount = 0;
        let oddCount = 0;
        let seqCount = 0;
        const halfMax = f.max / 2;
        merged.forEach((num, idx) => {
           if (num > halfMax) highNumCount++;
           if (num % 2 !== 0) oddCount++;
           if (idx > 0 && num === merged[idx - 1] + 1) seqCount++;
        });

        let patternBonus = 0;
        if (highNumCount > merged.length / 2) patternBonus += 0.5;
        if (oddCount > merged.length / 2) patternBonus += 0.5;
        if (seqCount >= 1) patternBonus += 0.5;

        if (patternBonus > 0) {
            badge += ' ⭐ ASTRO';
        }

        const finalAvgScore = avgScore + patternBonus;
        combos.push({a,b,avg:finalAvgScore,badge,bColor:bColorSafe,merged});
      }
    }
    
    // Sort so HH are on top
    combos.sort((x,y)=>y.avg-x.avg);

    // ─── DEEP PREDICTION ENGINE (Navamsha + ML History) ───
    const fullCompanyHistory = history.filter(h => h.companyName === (f.lotteryCompanyFull || f.companyName) && h.actualNums);
    const historicalFreq: Record<number, number> = {};
    fullCompanyHistory.forEach(h => h.actualNums?.forEach(n => { historicalFreq[n] = (historicalFreq[n] || 0) + 1; }));
    const hotNums = Object.keys(historicalFreq).filter(n => historicalFreq[parseInt(n)] >= 2).map(Number);
    const coldNums = Array.from({length: f.max}, (_, i) => i+1).filter(n => !historicalFreq[n] && fullCompanyHistory.length > 0);

    const drawJu = lotteryPlanets.find(p=>p.name==='Jupiter'||p.name==='గురు');
    const drawVe = lotteryPlanets.find(p=>p.name==='Venus'||p.name==='శుక్ర');
    let navBoosts: number[] = [];
    if (drawJu) navBoosts.push(PLANET_NUM[LAGNAM_PLANET[getNavamshaRasiIdx(drawJu.longitude)]] || 3);
    if (drawVe) navBoosts.push(PLANET_NUM[LAGNAM_PLANET[getNavamshaRasiIdx(drawVe.longitude)]] || 6);

    // ─── MASTER NUMBER ENGINE (42,000 patterns) ───
    const freq: Record<number,{cnt:number;boost:number}> = {};
    combos.filter(c=>c.badge.includes('HH')||c.badge.includes('H ')).forEach(c=>{
      c.merged.forEach((n:number)=>{
        if (!freq[n]) freq[n]={cnt:0,boost:0};
        freq[n].cnt++;
        if (reduce9(n)===drawNakV) freq[n].boost += 3;   // draw day nak boost
        if (reduce9(n)===drawTithiV) freq[n].boost += 2; // draw day tithi boost
        if (reduce9(n)===drawVaaraV) freq[n].boost += 2; // draw day vaaram boost
        if (reduce9(n)===buyLocV) freq[n].boost += 2;    // buy location
        if (reduce9(n)===compFullV) freq[n].boost += 2;  // company
        if (reduce9(n)===nV) freq[n].boost += 2;         // name
        if (reduce9(n)===dV) freq[n].boost += 1;         // DOB
        if (c.badge.includes('HH')) freq[n].boost += 1;  // HH double boost
        if (navBoosts.includes(reduce9(n))) freq[n].boost += 2; // Navamsha D-9 boost
        if (hotNums.includes(n)) freq[n].boost += 5;     // Hot Number mathematical boost
      });
    });
    const masterNums = Object.entries(freq)
      .filter(([n]) => !avoidNums.has(parseInt(n)))
      .sort((a,b)=>(b[1].cnt+b[1].boost)-(a[1].cnt+a[1].boost))
      .slice(0,f.pick).map(([n])=>parseInt(n)).sort((a,b)=>a-b);
    const masterConf = masterNums.map(n => {
      const fr = freq[n]; if (!fr) return {n, stars:3};
      const s = fr.cnt + fr.boost;
      return {n, stars: s >= 12 ? 5 : s >= 8 ? 4 : s >= 4 ? 3 : 2};
    });
    const secondaryNums = Object.entries(freq)
      .filter(([n]) => !masterNums.includes(parseInt(n)) && !avoidNums.has(parseInt(n)))
      .sort((a,b)=>(b[1].cnt+b[1].boost)-(a[1].cnt+a[1].boost))
      .slice(0,f.pick).map(([n])=>parseInt(n)).sort((a,b)=>a-b);
    const avoidNumsList = [...avoidNums].sort((a,b)=>a-b).slice(0,12);

    // ─── 24-Hour Table (engine-based accurate) ───
    const lat24 = parseFloat(f.lat)||17.385;
    const lon24 = parseFloat(f.lon)||78.487;
    const table24h = Array.from({length:24},(_,h)=>{
      const ts = `${String(h).padStart(2,'0')}:00`;
      // Use full engine for each hour
      let p24: any = null;
      try { p24 = getPanchangaForDateTime(f.orderDate, ts, lat24, lon24); } catch(e) { /* fallback */ }
      const hr = p24 ? p24.horaTE : '—';
      const kk = p24 ? p24.kaksha : '—';
      const lagnam = p24 ? p24.lagnaRashi : RASHIS[getLagnaAtTime(userLagna, h)];
      const tithiLabel = p24 ? p24.tithiName : '';
      const nakLabel = p24 ? p24.nakName : '';
      const horaScore = HORA_INFO[hr]?.score || 5;
      const kakshaScore = KAKSHA_INFO[kk]?.score || 5;
      const lagnaScore = p24 ? p24.lagnaScore : LAGNAM_SCORE[getLagnaAtTime(userLagna, h)];
      const isRahu = p24 ? (h >= Math.floor(p24.rahuStart.getHours()) && h < Math.floor(p24.rahuEnd.getHours())) : false;
      const total = Math.round((horaScore + kakshaScore + lagnaScore/2) / 2.5);
      const finalTotal = isRahu ? Math.max(1, total - 2) : total;
      return {
        time:`${ts}–${String((h+1)%24).padStart(2,'0')}:00`,
        hora: hr, kaksha: kk, lagnam, tithi: tithiLabel, nakshatra: nakLabel,
        total: finalTotal, isRahu,
        outcome: finalTotal>=9?'🏆 అత్యుత్తమం': finalTotal>=7?'✅ శుభం': finalTotal>=5?'🔵 సాధారణం': finalTotal>=3?'⚠️ జాగ్రత్త':'❌ నష్టం'
      };
    });

    const companyHistory = fullCompanyHistory.slice(0, 5);
    const historyLastNs = companyHistory.length > 0 && companyHistory[0].actualNums ? companyHistory[0].actualNums : [];
    const lastNs = f.lastResult ? f.lastResult.replace(/[^0-9,\s]/g,'').split(/[,\s]+/).filter(Boolean).map(Number) : historyLastNs;
    
    const trendNote = lastNs.length>0?(lastNs.filter(n=>n%2!==0).length>lastNs.length/2?'గత ఫలితం బేసి సంఖ్యలు → ఈ వారం సరి సంఖ్యలు try చేయండి':'గత ఫలితం సరి సంఖ్యలు → ఈ వారం బేసి సంఖ్యలు try చేయండి'):'';
    const mlNote = hotNums.length>0 ? `🔥 Hot Numbers (Mathematical): ${hotNums.join(', ')}` : '';
    const navNote = navBoosts.length>0 ? `✨ D-9 Navamsha Boost Applied.` : '';
    const bestTimes = table24h.filter(r=>r.total>=8);
    const bestTimeToday = [...table24h].sort((a,b)=>b.total-a.total)[0];
    
    // Global Score Calculation
    let globalScorePoints = 0;
    let maxGlobalPoints = 0;
    
    let yogas: YogaResult[] = [];
    let transitYogas: YogaResult[] = [];
    let dasha: DashaResult | null = null;
    let yogaBonus = 0;
    
    // 1. Birth Chart Yogas
    if (f.hasJatakam) {
      globalScorePoints += lagScore + (cb.good ? 5 : cb.score >= 0 ? 3 : 1) + (tara.score >= 2 ? 5 : tara.score >= 0 ? 3 : 1);
      maxGlobalPoints += 15;
      
      const dobDateExact = new Date(`${f.dob}T${f.dobTime}`);
      dasha = getCurrentDasha(birthPlanets, dobDateExact);
      yogas = detectYogas(birthPlanets, transitPlanets, dasha.currentMahadasha, dasha.currentAntardasha);
      
      yogas.forEach(y => {
        let pts = y.points;
        if (pts > 0) {
          if (y.isDashaActive) pts *= 1.5;
          if (y.isTransitActive) pts *= 2;
        } else {
          if (y.isDashaActive) pts *= 1.5;
        }
        yogaBonus += pts;
      });
    }
    
    // 2. Today's Transit Yogas (always calculate)
    transitYogas = detectIndependentYogas(lotteryPlanets);
    transitYogas.forEach(y => {
      // Transit yogas are happening *right now*, so they have direct impact
      yogaBonus += y.points;
    });
    
    if (yogaBonus > 12) yogaBonus = 12;
    if (yogaBonus < -12) yogaBonus = -12;
    
    globalScorePoints += (HORA_INFO[hora]?.score || 5) + (KAKSHA_INFO[kaksha]?.score || 5) + (drawDayScore >= 8 ? 5 : drawDayScore >= 6 ? 4 : 3);
    maxGlobalPoints += 15;
    
    const companyMatchScore = compFullV === nV || compFullV === dV ? 5 : compFullV === lagV ? 4 : 3;
    globalScorePoints += companyMatchScore;
    maxGlobalPoints += 5;
    
    globalScorePoints += yogaBonus;
    
    let globalScorePercent = Math.round((globalScorePoints / maxGlobalPoints) * 100);
    if (globalScorePercent > 100) globalScorePercent = 100;
    if (globalScorePercent < 0) globalScorePercent = 0;
    
    const masterScoreNum = (((HORA_INFO[hora]?.score||5)+(cb.good?9:5)+(Math.max(0,tara.score)*3)+6)/4) + (yogaBonus * 0.1);
    const masterScore = (Math.min(10, Math.max(0, masterScoreNum))).toFixed(1);

    let lastDrawMatch: any[] = [];
    if (lastNs.length > 0 && livePanchangaPrevDraw) {
      lastDrawMatch = lastNs.map(n => {
        const v = reduce9(n);
        const factors = [];
        const vl = PLANET_VIBRATIONS[livePanchangaPrevDraw.lagnaLord]; if (vl && reduce9(vl)===v) factors.push('Lagna Lord');
        const vn = PLANET_VIBRATIONS[livePanchangaPrevDraw.nakLordEN]; if (vn && reduce9(vn)===v) factors.push('Nakshatra Lord');
        const vh = PLANET_VIBRATIONS[livePanchangaPrevDraw.horaEN]; if (vh && reduce9(vh)===v) factors.push('Hora Lord');
        const vv = PLANET_VIBRATIONS[livePanchangaPrevDraw.varaName]; if (vv && reduce9(vv)===v) factors.push('Vara Lord');
        if (factors.length === 0) factors.push('Combination / Numerology');
        return { num: n, vib: v, reasons: factors.join(' + ') };
      });
    }

    const birthPosFallback: Record<string,number> = {
      'లగ్న':userLagna,'సూర్య':(userLagna+10)%12,'చంద్ర':userRashi,'కుజ':(userLagna+3)%12,
      'బుధ':(userLagna+11)%12,'గురు':(userLagna+8)%12,'శుక్ర':(userLagna+1)%12,
      'శని':(userLagna+6)%12,'రాహు':(userLagna+4)%12,'కేతు':(userLagna+10)%12
    };
    const transPosFallback: Record<string,number> = {
      'లగ్న':lotteryLagna,'చంద్ర':(userRashi+2)%12,'గురు':(userLagna+5)%12,
      'శని':(userLagna+9)%12,'రాహు':(userLagna+4)%12,'కేతు':(userLagna+10)%12
    };

    const generatedReading = `నమస్కారం! నేను మీ జాతక చక్రాన్ని విశ్లేషించాను. ఈరోజు ${f.orderDate} నాడు ${f.lotteryTime} కి ${hora} హోర, ${kaksha} కక్ష్య నడుస్తున్నాయి. Draw date ${f.lotteryDrawDate} నాడు ${drawNakName} నక్షత్రం, ${drawHora} హోర ఉంటుంది. మీ Lucky Numbers: ${masterNums.join(', ')}. All the best!`;
    
    // Gemini AI double-check: runs in background and updates reading
    const basePrompt = `మీరు ఒక ప్రొఫెషనల్ లాటరీ ఆస్ట్రాలజీ AI విశ్లేషకులు. మా సిస్టమ్ ఇప్పటికే 291 కచ్చితమైన లాటరీ ఆస్ట్రాలజీ కేటగిరీలను మరియు 42,195 సంక్లిష్ట కాంబినేషన్ ప్యాటర్న్స్ ను (నవాంశ, హాట్ నంబర్స్, గోచార బలాలతో సహా) గణించి ఈ క్రింది Master Numbers ను ఫైనల్ చేసింది. మీరు ఆ లాటరీ సిస్టమ్ కు ప్రతినిధిగా రిపోర్ట్ ఇస్తున్నారు. కాబట్టి మీ రిపోర్ట్ లో "మేము 291 లాటరీ కేటగిరీలు మరియు 42,000 కు పైగా లాటరీ కాంబినేషన్ ప్యాటర్న్స్ ని డీప్ గా విశ్లేషించి ఈ నంబర్స్ ఇస్తున్నాము" అని ధీమాగా చెప్పండి. "నేను విశ్లేషించలేదు" అని ఎట్టి పరిస్థితుల్లోనూ అనకండి. వ్యాపారాల గురించి ఎలాంటి ప్రస్తావన వద్దు, ఇది కేవలం లాటరీ అనాలిసిస్ మాత్రమే.

పేరు: ${f.userName} | పుట్టిన తేదీ: ${f.dob} | లగ్నం: ${RASHIS[userLagna]} | రాశి: ${RASHIS[userRashi]}
కొనే తేదీ: ${f.orderDate} ${f.lotteryTime} | Draw తేదీ: ${f.lotteryDrawDate}
ఈరోజు హోర: ${hora} | కక్ష్య: ${kaksha} | తిథి: ${livePanchanga.tithiName} | నక్షత్రం: ${livePanchanga.nakName} | వారం: ${livePanchanga.varaName}
Draw Day: నక్షత్రం=${drawNakName}, హోర=${drawHora}, కక్ష్య=${drawKaksha}, తిథి=${drawTithi}, వారం=${drawVaara}
Master Numbers (Our Prediction): ${masterNums.join(', ')} | Secondary: ${secondaryNums.slice(0,5).join(', ')} | Avoid: ${avoidNumsList.slice(0,5).join(', ')}
291 Categories scores: ${cats.map((c:any)=>c.te+':'+c.hh).join(', ')}
రాహు కాలం: ${livePanchanga.rahuStart?.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})} – ${livePanchanga.rahuEnd?.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}
`;

    const historyInstructions = companyHistory.length > 0 
      ? `\nగతంలో ఈ ${f.lotteryCompanyFull || f.companyName} లాటరీలో వచ్చిన నంబర్లు: ${companyHistory.map(h => `${h.drawDate} నాడు [${h.actualNums?.join(',')}]`).join('; ')}.\nదయచేసి ఈ ట్రెండ్ ని పరిగణనలోకి తీసుకోండి.`
      : '';

    const instructions = lastNs.length > 0
      ? `గతంలో వచ్చిన/అసలు రిజల్ట్ నంబర్లు (Actual Result): ${lastNs.join(',')}
3-4 పేరాగ్రాఫ్లలో తెలుగులో రాయండి:\n0) మీ రిపోర్ట్ ప్రారంభంలో ఖచ్చితంగా 'మేము 291 లాటరీ ఆస్ట్రాలజీ కేటగిరీలు మరియు 42,195 కాంబినేషన్ ప్యాటర్న్స్ ని డీప్ గా విశ్లేషించి ఈ నంబర్స్ ఇస్తున్నాము' అని వ్రాయండి.\n
1) ఈరోజు మరియు Draw రోజు పంచాంగ బలాబలాలు 
2) Master Numbers (${masterNums.join(', ')}) ఎందుకు అనుకూలమో వివరించండి.
3) అసలు రిజల్ట్ నంబర్లు (${lastNs.join(',')}) ఎందుకు వచ్చాయో డ్రా రోజు పంచాంగం (తిథి, నక్షత్రం, వారం) తో లింక్ చేసి వివరించండి.
4) మన Prediction (${masterNums.join(', ')}) కి, Actual Result (${lastNs.join(',')}) కి మధ్య ఏ ఆస్ట్రాలజికల్ ప్యాటర్న్ మిస్ అయ్యామో విశ్లేషించి చెప్పండి. 200 పదాలకు మించకండి.` 
      : `3-4 పేరాగ్రాఫ్లలో తెలుగులో రాయండి:\n0) మీ రిపోర్ట్ ప్రారంభంలో ఖచ్చితంగా 'మేము 291 లాటరీ ఆస్ట్రాలజీ కేటగిరీలు మరియు 42,195 కాంబినేషన్ ప్యాటర్న్స్ ని డీప్ గా విశ్లేషించి ఈ నంబర్స్ ఇస్తున్నాము' అని వ్రాయండి.\n1) ఈరోజు మరియు Draw రోజు పంచాంగ బలాబలాలు 2) Master Numbers ఎందుకు అనుకూలం (ముఖ్యంగా Draw రోజు పంచాంగం తో లింక్ చేసి చెప్పండి) 3) జాగ్రత్తలు మరియు రాహుకాలం. 200 పదాలకు మించకండి.`;

    const geminiPrompt = basePrompt + historyInstructions + '\n' + instructions;

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${localStorage.getItem('gemini_api_key')||''}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({contents:[{parts:[{text:geminiPrompt}]}]})
    }).then(r=>r.json()).then(d=>{
      const txt = d?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (txt) { (window as any)._lastAiInterpret = txt; setResult((prev:any)=>({...prev,aiReading:txt,aiLoaded:true})); }
      else { console.warn('Gemini response:', JSON.stringify(d)); }
    }).catch((err)=>{ console.warn('Gemini fetch error:', err); });
    
    const aiReading = generatedReading; // will update async

    let omillionairePrediction = null;
    try {
      omillionairePrediction = generateOmillionairePrediction(masterNums);
    } catch (err) {
      console.error('Failed to generate Omillionaire prediction:', err);
    }

          return {
        userObj,
        cats, combos, masterNums, masterConf, secondaryNums, avoidNumsList, masterScore, globalScorePercent,
        cb, tara, nV, dV, trendNote, mlNote, navNote,
        lagP, rashiP, nakL, birthPosFallback,
        yogas, dasha, yogaBonus, transitYogas,
        omillionairePrediction,
        aiReading
      };
    }); // end userList.map
    
    // Set final result with global data and userResults array
    setResult({
      users: userResults,
      globalData: {
        table24h, bestTimes, bestTimeToday, pick:f.pick, max:f.max,
        hora, kaksha, todayNakName, todayNakL, cV, lV, transPosFallback,
        lotteryLagna, lLagnaScore, lotteryHora, lotteryKaksha, lHoraInfo, lKakshaInfo, lotteryTimeScore,
        drawNakName, drawNakL, drawHora, drawKaksha, drawTithi, drawVaara, drawDayScore, drawNakV,
        livePanchanga, livePanchangaDraw, livePanchangaPrevDraw, lastDrawMatch, prevDrawDate: f.prevDrawDate
      }
    });
    setStep('result');
  } catch(e) { setErrLog(String((e as any).stack || e)); console.error(e); }
  }, [form, birthPlanets, transitPlanets, lotteryPlanets, panchang, drawPanchang, choghadiya, drawChoghadiya, todayNakIdx, livePanchanga, livePanchangaDraw, livePanchangaPrevDraw]);

  const toggle = (id:string) => {
    setOpenSec(p=>p===id?null:id);
    if (id==='combos') setVisibleCombos(12);
  };

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center">
        <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
          🔮 మహా అదృష్ట దర్పణం
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          {apiOk===true && <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"><CheckCircle className="w-3 h-3"/>VedIntel API Connected ✅</span>}
          {apiOk===false && <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400"><AlertCircle className="w-3 h-3"/>API Error – Calculated Mode</span>}
          {apiOk===null && <span className="text-xs text-slate-500">VedIntel API Ready • 291 Categories • 42,000-Formula Engine • Dual Charts</span>}
        </div>
      </header>

      {/* ═══════════════ FORM ═══════════════ */}
      {step==='form' && (
        <>
          <AstrologyBlueprint />
          <form onSubmit={runAnalysis} className="space-y-5">
            {/* ── LOTTERY BUY TIME ── */}
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-500/60 rounded-2xl p-5">
              <h3 className="text-amber-300 font-black text-lg flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5"/>⏰ లాటరీ వివరాలు
              </h3>
              <p className="text-amber-200/70 text-xs mb-4">కొనే సమయం + Draw తేదీ + కంపెనీ వివరాలు ఇస్తే 42,000-formula engine పూర్తి విశ్లేషణ చేస్తుంది.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-amber-300 font-bold mb-1 block">కొనే తేదీ</label>
                  <input required type="date" value={form.orderDate} onChange={e=>set('orderDate',e.target.value)} className="w-full bg-slate-950 border border-amber-600/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"/>
                </div>
                <div>
                  <label className="text-xs text-amber-300 font-bold mb-1 block">కొనే సమయం ⭐</label>
                  <input required type="time" value={form.lotteryTime} onChange={e=>set('lotteryTime',e.target.value)} className="w-full bg-slate-950 border-2 border-amber-500 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]"/>
                </div>
                <div>
                  <label className="text-xs text-emerald-400 font-bold mb-1 block">🎫 Draw తేదీ</label>
                  <input type="date" value={form.lotteryDrawDate} onChange={e=>set('lotteryDrawDate',e.target.value)} className="w-full bg-slate-950 border border-emerald-600/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"/>
                </div>
                <div>
                  <label className="text-xs text-emerald-400 font-bold mb-1 block">🎫 Draw సమయం</label>
                  <input type="time" value={form.lotteryDrawTime} onChange={e=>set('lotteryDrawTime',e.target.value)} className="w-full bg-slate-950 border border-emerald-600/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"/>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                <div>
                  <label className="text-xs text-purple-400 font-bold mb-1 block">🏢 కంపెనీ పేరు</label>
                  <input value={form.lotteryCompanyFull} onChange={e=>set('lotteryCompanyFull',e.target.value)} placeholder="Kerala State Lottery" className="w-full bg-slate-950 border border-purple-600/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"/>
                </div>
                <div>
                  <label className="text-xs text-cyan-400 font-bold mb-1 block">📍 కొనే స్థానం</label>
                  <input value={form.lotteryBuyLocation} onChange={e=>set('lotteryBuyLocation',e.target.value)} placeholder="Vijayawada" className="w-full bg-slate-950 border border-cyan-600/50 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"/>
                </div>
                <div>
                  <label className="text-xs text-blue-300 font-bold mb-1 block">Pick ఎన్ని?</label>
                  <select value={form.pick} onChange={e=>set('pick',parseInt(e.target.value))} className="w-full bg-slate-950 border border-blue-600/40 rounded-xl px-2 py-2.5 text-xs text-white">{[3,4,5,6,7,8,10].map(n=><option key={n} value={n}>Pick {n}</option>)}</select>
                </div>
                <div>
                  <label className="text-xs text-blue-300 font-bold mb-1 block">Max Number?</label>
                  <select value={form.max} onChange={e=>set('max',parseInt(e.target.value))} className="w-full bg-slate-950 border border-blue-600/40 rounded-xl px-2 py-2.5 text-xs text-white">{[36,42,45,49,55,59,60,69,70,90].map(n=><option key={n} value={n}>1–{n}</option>)}</select>
                </div>
              </div>
              <div className="mt-3">
                <label className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-xl border border-amber-500/20 cursor-pointer hover:border-amber-500/50 w-fit">
                  <input type="checkbox" checked={form.isForeign} onChange={e=>set('isForeign',e.target.checked)} className="w-4 h-4 accent-amber-500"/>
                  <span className="text-sm font-bold text-amber-200">🌍 విదేశీ లాటరీ (Foreign Lottery)</span>
                </label>
              </div>
            </div>

            {/* ── PROFILES SECTION ── */}
            <div className="bg-slate-900/60 border border-pink-700/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-pink-900/50">
                <h3 className="text-pink-400 font-bold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4"/> 👥 ప్రొఫైల్స్ (Profiles)
                </h3>
                <div className="flex gap-2">
                  <button type="button" onClick={saveProfile} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-xs text-white shadow-lg">Save</button>
                  <button type="button" onClick={newProfile} className="px-3 py-1 bg-pink-600 hover:bg-pink-500 rounded text-xs text-white shadow-lg">+ New</button>
                </div>
              </div>
              {profiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profiles.map((pr, i) => (
                    <button type="button" key={i} onClick={() => loadProfile(i)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeProfileIdx === i ? 'bg-pink-500 text-white shadow-lg border-2 border-pink-400' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}>
                      {pr.userName || 'User '+(i+1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── 3 COLUMN FORM ── */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Personal */}
              <div className="bg-slate-900/60 border border-pink-700/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-pink-400 font-bold text-sm flex items-center gap-2"><Star className="w-4 h-4"/>వ్యక్తిగత వివరాలు</h3>
                  <label className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-pink-200 cursor-pointer bg-pink-900/20 px-2 py-1 rounded-lg border border-pink-500/30">
                    <input type="checkbox" checked={!form.hasJatakam} onChange={e=>set('hasJatakam',!e.target.checked)} className="w-4 h-4 accent-pink-500"/>
                    నాకు జాతకం తెలియదు
                  </label>
                </div>
                <input required value={form.userName} onChange={e=>set('userName',e.target.value)} placeholder="మీ పూర్తి పేరు (English)" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/40"/>
                
                {form.hasJatakam ? (
                  <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="text-xs text-slate-400 mb-1 block">పుట్టిన తేదీ</label><input required type="date" value={form.dob} onChange={e=>set('dob',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"/></div>
                      <div><label className="text-xs text-slate-400 mb-1 block">పుట్టిన సమయం</label><input type="time" value={form.dobTime} onChange={e=>set('dobTime',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"/></div>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-2 space-y-1">
                      <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3"/>జన్మ స్థానం Coordinates</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={form.lat} onChange={e=>set('lat',e.target.value)} placeholder="Lat: 17.3850" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"/>
                        <input value={form.lon} onChange={e=>set('lon',e.target.value)} placeholder="Lon: 78.4867" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"/>
                      </div>
                    </div>
                    <div><label className="text-xs text-yellow-400 font-bold mb-1 block">లగ్నం (Ascendant)</label>
                      <select value={form.lagnam} onChange={e=>set('lagnam',parseInt(e.target.value))} className="w-full bg-slate-950 border border-yellow-600/40 rounded-xl px-3 py-2 text-xs text-white">{RASHIS.map((r,i)=><option key={i} value={i}>{r}</option>)}</select>
                    </div>
                    <div><label className="text-xs text-yellow-400 font-bold mb-1 block">జన్మ రాశి</label>
                      <select value={form.rashi} onChange={e=>set('rashi',parseInt(e.target.value))} className="w-full bg-slate-950 border border-yellow-600/40 rounded-xl px-3 py-2 text-xs text-white">{RASHIS.map((r,i)=><option key={i} value={i}>{r}</option>)}</select>
                    </div>
                    <div><label className="text-xs text-yellow-400 font-bold mb-1 block">జన్మ నక్షత్రం</label>
                      <select value={form.nakshatram} onChange={e=>set('nakshatram',parseInt(e.target.value))} className="w-full bg-slate-950 border border-yellow-600/40 rounded-xl px-3 py-2 text-xs text-white">{NAKSHATRAMS.map((n,i)=><option key={i} value={i}>{n}</option>)}</select>
                    </div>
                    <div className="border-t border-slate-800 pt-3 space-y-2">
                      <p className="text-xs text-emerald-400 font-bold flex items-center gap-1"><Upload className="w-3 h-3"/>స్వంత కుండలి ఇమేజ్ (Optional)</p>
                      <div><label className="text-[10px] text-slate-500">జన్మ కుండలి ఫోటో</label><input type="file" accept="image/*" onChange={handleImg(setBirthImg)} className="mt-0.5 text-xs text-slate-400 w-full file:text-xs file:border file:border-emerald-700 file:bg-emerald-900/20 file:text-emerald-300 file:rounded file:px-2 file:py-0.5"/></div>
                      <div><label className="text-[10px] text-slate-500">గోచార కుండలి ఫోటో</label><input type="file" accept="image/*" onChange={handleImg(setTransitImg)} className="mt-0.5 text-xs text-slate-400 w-full file:text-xs file:border file:border-purple-700 file:bg-purple-900/20 file:text-purple-300 file:rounded file:px-2 file:py-0.5"/></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                    <p className="text-xs text-amber-300 font-bold text-center">ఆటోమేటిక్ పంచాంగం వద్దనుకుంటే మాన్యువల్ గా ఇవ్వండి (Optional)</p>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-emerald-400 font-bold border-b border-emerald-500/20 pb-1">ఈ రోజు (కొనే సమయం)</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] text-slate-400 block mb-1">తిథి</label><select value={form.manualTodayTithi} onChange={e=>set('manualTodayTithi',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"><option value="">-- ఆటోమేటిక్ --</option>{Array.from({length:30}).map((_,i)=><option key={i} value={i+1}>తిథి {i+1}</option>)}</select></div>
                        <div><label className="text-[10px] text-slate-400 block mb-1">వారం</label><select value={form.manualTodayVara} onChange={e=>set('manualTodayVara',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"><option value="">-- ఆటోమేటిక్ --</option>{['ఆది','సోమ','మంగళ','బుధ','గురు','శుక్ర','శని'].map((v,i)=><option key={i} value={i===0?1:i+1}>{v}వారం</option>)}</select></div>
                        <div className="col-span-2"><label className="text-[10px] text-slate-400 block mb-1">నక్షత్రం</label><select value={form.manualTodayNak} onChange={e=>set('manualTodayNak',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"><option value="">-- ఆటోమేటిక్ --</option>{NAKSHATRAMS.map((n,i)=><option key={i} value={i+1}>{n}</option>)}</select></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-cyan-400 font-bold border-b border-cyan-500/20 pb-1">Draw రోజు (Draw సమయం)</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] text-slate-400 block mb-1">తిథి</label><select value={form.manualDrawTithi} onChange={e=>set('manualDrawTithi',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"><option value="">-- ఆటోమేటిక్ --</option>{Array.from({length:30}).map((_,i)=><option key={i} value={i+1}>తిథి {i+1}</option>)}</select></div>
                        <div><label className="text-[10px] text-slate-400 block mb-1">వారం</label><select value={form.manualDrawVara} onChange={e=>set('manualDrawVara',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"><option value="">-- ఆటోమేటిక్ --</option>{['ఆది','సోమ','మంగళ','బుధ','గురు','శుక్ర','శని'].map((v,i)=><option key={i} value={i===0?1:i+1}>{v}వారం</option>)}</select></div>
                        <div className="col-span-2"><label className="text-[10px] text-slate-400 block mb-1">నక్షత్రం</label><select value={form.manualDrawNak} onChange={e=>set('manualDrawNak',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"><option value="">-- ఆటోమేటిక్ --</option>{NAKSHATRAMS.map((n,i)=><option key={i} value={i+1}>{n}</option>)}</select></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Numbers & Trend */}
              <div className="space-y-4">
                <div className="bg-slate-900/60 border border-blue-700/30 rounded-2xl p-4 space-y-3">
                  <h3 className="text-blue-400 font-bold text-sm flex items-center gap-2"><Hash className="w-4 h-4"/>నంబర్ వివరాలు</h3>
                  <input value={form.ticketNums} onChange={e=>set('ticketNums',e.target.value)} placeholder="మీ నంబర్లు (7,14,21,32...)" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"/>
                </div>
                <div className="bg-slate-900/60 border border-orange-700/30 rounded-2xl p-4 space-y-3">
                  <h3 className="text-orange-400 font-bold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4"/>గత ఫలితాలు / అసలు రిజల్ట్ (Actual Result)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-slate-400 mb-1 block">గత/అసలు Draw తేదీ</label><input type="date" value={form.prevDrawDate} onChange={e=>set('prevDrawDate',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"/></div>
                    <div><label className="text-xs text-slate-400 mb-1 block">గత/అసలు Draw సమయం</label><input type="time" value={form.prevDrawTime} onChange={e=>set('prevDrawTime',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"/></div>
                  </div>
                  <textarea value={form.lastResult} onChange={e=>set('lastResult',e.target.value)} placeholder="డ్రా పూర్తయిన తర్వాత అసలు రిజల్ట్ ఇక్కడ ఇస్తే, AI మన అంచనాకి అసలు రిజల్ట్ కి ఉన్న సంబంధం / ప్యాటర్న్ వివరిస్తుంది." rows={2} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none resize-none"/>
                </div>
              </div>

              {/* Summary + Submit */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border border-yellow-500/20 rounded-2xl p-4">
                  <h3 className="text-yellow-400 font-bold text-xs mb-3 uppercase tracking-wider">42,000-Formula Engine:</h3>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>🔌 VedIntel API → Real planet positions</li>
                    <li>📐 జన్మ కుండలి → API data from birth datetime</li>
                    <li>🌍 గోచార కుండలి → Today's API data</li>
                    <li>🎫 Draw Day → Nakshatra, Hora, Kaksha</li>
                    <li>⚔️ శత్రు గ్రహాల ఫిల్టర్ (LL numbers → Red)</li>
                    <li>🟢 HH / 🔵 H / 🟡 N / 🔴 LL ratings</li>
                    <li>⭐ Per-category star ratings</li>
                    <li>🔢 291 categories → 42,000 combo patterns</li>
                    <li>🏆 Master + Secondary + Avoid numbers</li>
                    <li>⏰ Best time windows (today)</li>
                  <li>🤖 Gemini AI → తెలుగు విశ్లేషణ</li>
                </ul>
                </div>
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-3">
                  <label className="text-xs text-indigo-300 font-bold mb-1 block">🤖 Gemini API Key (AI కోసం)</label>
                  <input
                    type="password"
                    defaultValue={localStorage.getItem('gemini_api_key')||''}
                    onChange={e=>{localStorage.setItem('gemini_api_key', e.target.value);}}
                    placeholder="AIza... లేదా AQ... API Key ఇక్కడ పెట్టండి"
                    className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">🔒 ఈ key మీ browser లో మాత్రమే store అవుతుంది. Server కి పంపబడదు.</p>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-black font-extrabold py-5 rounded-2xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-[0_0_30px_rgba(255,215,0,0.4)] text-xl">
                  🔮 60 Sec 42,000-Formula Analysis
                </button>
              </div>
            </div>
          </form>

          {/* ═══════════════ HISTORY ═══════════════ */}
          <div className="mt-8 bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2 mb-4"><Save className="w-5 h-5"/> గత ప్రెడిక్షన్స్ & హిస్టరీ</h3>
            <p className="text-xs text-emerald-200/70 mb-4">మీరు గతంలో సేవ్ చేసిన ప్రెడిక్షన్స్. నిజమైన లాటరీ ఫలితం వచ్చాక ఇక్కడ అప్డేట్ చేస్తే AI ఆ పాటర్న్ ని విశ్లేషిస్తుంది.</p>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4 bg-slate-950/50 rounded-xl border border-slate-800">ఇంకా ఏ ప్రెడిక్షన్స్ సేవ్ చేయలేదు.</p>
            ) : (
              <div className="space-y-4">
                {history.map(h => (
                  <div key={h.id} className="bg-slate-950 border border-slate-700 hover:border-emerald-500/50 transition-colors rounded-xl p-4 relative group">
                    <div className="flex justify-between items-start mb-2 border-b border-slate-800 pb-2">
                      <div>
                        <p className="text-sm font-bold text-amber-300">{h.companyName}</p>
                        <p className="text-[10px] text-slate-500">Order: {h.orderDate} | Draw: {h.drawDate}</p>
                      </div>
                      <button onClick={() => deleteFromHistory(h.id)} className="text-red-400 hover:bg-red-500/20 p-1.5 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 mb-1">మనం ఇచ్చిన నంబర్లు</p>
                        <div className="flex flex-wrap gap-1">
                          {h.predictedNums.map((n, i) => <span key={i} className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-[10px] font-bold flex items-center justify-center">{n}</span>)}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[10px] text-slate-400 mb-1">రిజల్ట్ (వచ్చిన నంబర్లు)</p>
                        {!h.actualNums ? (
                          <div className="flex gap-2">
                            <input 
                              id={`actual_${h.id}`}
                              placeholder="ఉదా: 5,12,23,45" 
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button 
                              onClick={() => {
                                const val = (document.getElementById(`actual_${h.id}`) as HTMLInputElement).value;
                                if (val) {
                                  const nums = val.split(',').map(n=>parseInt(n.trim())).filter(n=>!isNaN(n));
                                  analyzeHistory(h.id, nums, h);
                                }
                              }}
                              className="bg-emerald-600/80 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all"
                            >
                              Check
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {h.actualNums.map((n, i) => <span key={i} className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${h.predictedNums.includes(n) ? 'bg-emerald-500/40 border border-emerald-400 text-emerald-100 shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'bg-slate-800 border border-slate-600 text-slate-400'}`}>{n}</span>)}
                            </div>
                            {h.aiExplanation && (
                              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-2.5 mt-2">
                                <p className="text-[10px] text-indigo-300 font-bold mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> 🧠 AI / Pattern Analysis:</p>
                                <p className="text-[11px] text-indigo-200/90 whitespace-pre-wrap leading-relaxed">{h.aiExplanation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════ LOADING ═══════════════ */}
      {step==='loading' && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="text-8xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{cd}</div>
          <div className="w-full max-w-lg bg-slate-800 rounded-full h-3">
            <div className="h-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-1000" style={{width:`${((60-cd)/60)*100}%`}}/>
          </div>
          <p className="text-cyan-300 text-sm font-medium animate-pulse text-center">{ltxt}</p>
          {chartsLoading && <p className="text-xs text-slate-500 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/>VedIntel API నుండి real planet data తీసుకుంటున్నాము...</p>}
          {apiOk===true && <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3"/>Planet positions API నుండి వచ్చాయి!</p>}
          {apiOk===false && <p className="text-xs text-amber-400 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>API offline — Local calculation వాడుతున్నాము</p>}
          {errLog && <div className="text-red-400 text-xs max-w-lg text-center break-words">{errLog}</div>}
          <div className="animate-spin text-5xl opacity-20" style={{animationDuration:'5s'}}>🔮</div>
        </div>
      )}

      {/* ═══════════════ RESULTS ═══════════════ */}
      {step==='result' && result && (() => {
        const gl = result.globalData || result; // fallback if compute failed
        const users = result.users || [result]; // fallback if single
        
        return (
          <div className="space-y-5 animate-in fade-in duration-500 w-full">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-pink-500/50">
              <button type="button" onClick={() => setActiveTab(-1)} className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold transition-all ${activeTab === -1 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] border-2 border-indigo-400' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                🌍 Global & Lottery Info
              </button>
              {users.map((u, i) => (
                <button type="button" key={i} onClick={() => setActiveTab(i)} className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold transition-all ${activeTab === i ? 'bg-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.5)] border-2 border-pink-400' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  👤 {u.userObj?.userName || 'User ' + (i+1)}
                </button>
              ))}
            </div>

            {activeTab === -1 && gl && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {users.length > 1 && (
                  <div className="bg-gradient-to-r from-pink-600/20 to-indigo-600/20 border-2 border-pink-500 rounded-2xl p-5 shadow-[0_0_30px_rgba(219,39,119,0.3)]">
                    <h3 className="text-xl font-black text-pink-400 flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5"/> టీమ్ (Partnership) విశ్లేషణ
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                       {users.map((u:any, i:number) => (
                         <div key={i} className="bg-slate-900/60 rounded-xl p-3 border border-pink-500/30 text-center">
                           <p className="text-xs text-pink-300 font-bold mb-1 truncate">{u.userObj?.userName || 'User '+(i+1)}</p>
                           <p className="text-xl font-black text-white">{u.globalScorePercent || 0}%</p>
                         </div>
                       ))}
                       <div className="col-span-2 md:col-span-4 bg-indigo-900/40 rounded-xl p-3 border border-indigo-500/40 text-center">
                         <p className="text-sm text-indigo-300 font-bold mb-1">🤝 టీమ్ సగటు అదృష్టం (Combined Team Luck)</p>
                         <p className="text-2xl font-black text-white">
                           {Math.round(users.reduce((acc:number, curr:any) => acc + (curr.globalScorePercent || 0), 0) / users.length)}%
                         </p>
                       </div>
                    </div>
                    <p className="text-sm text-pink-100/90 text-center font-bold bg-pink-900/30 p-3 rounded-lg">
                      గెలుపు అవకాశాల కోసం అత్యధిక స్కోర్ వచ్చిన 🎯 <span className="text-pink-400 font-black">{users.reduce((prev:any, current:any) => ((prev.globalScorePercent||0) > (current.globalScorePercent||0)) ? prev : current).userObj?.userName || 'మొదటి వ్యక్తి'}</span> గ్రూప్ తరపున టికెట్/లాటరీ కొనడం ఉత్తమం!
                    </p>
                  </div>
                )}
                {gl.omillionairePrediction && (
                  <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-2 border-emerald-500 rounded-2xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5"/>O! Millionaire Exclusive Pattern Prediction
                    </h3>
                    <p className="text-xs text-emerald-200/70 mb-4">
                      216 పాత డ్రా ఫలితాల ఆధారంగా 6 మెయిన్ నంబర్లు మరియు 1 ఎక్స్‌ట్రా (Grand) నంబర్ విశ్లేషణ.
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
                        <div key={i} className={`p-2 rounded-lg border text-center ${h.score>=8 ? 'bg-emerald-500/20 border-emerald-500' : h.score>=5 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-red-500/20 border-red-500'}`}>
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
                          <div key={i} className={`p-3 rounded-lg border ${y.type === 'Benefic' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-bold text-sm ${y.type === 'Benefic' ? 'text-emerald-400' : 'text-red-400'}`}>{y.name}</span>
                              <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                                {y.points > 0 ? `+${y.points}` : y.points} pts
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
      })}
    </div>
  );
}
