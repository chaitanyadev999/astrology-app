import { useState, useCallback, useMemo } from 'react';
import {
  Star, Clock, RefreshCw, ChevronDown, ChevronUp,
  Upload, Globe, Target, Zap, BookOpen, TrendingUp,
  Hash, Loader2, CheckCircle, AlertCircle, MapPin
} from 'lucide-react';
import {
  fetchPlanetPositions, fetchPanchang, fetchChoghadiya, fetchAiInterpret,
  planetsToChartMap, ProkeralaPlanet, PanchangData, ChoghadiyaSlot
} from '../services/prokerala';
import { AstrologyBlueprint } from './AstrologyBlueprint';
import { getPanchangaForDateTime, getLivePanchanga, LivePanchanga } from '../services/panchangaEngine';

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
const getHora = (dateStr: string, timeStr: string): string => {
  const dt = new Date(`${dateStr}T${timeStr}`); let day = dt.getDay(); const hr = dt.getHours();
  const starts: Record<number,number> = {0:0,1:3,2:6,3:2,4:5,5:1,6:4};
  let hFrom6 = hr - 6; if (hFrom6 < 0) { hFrom6 += 24; day = (day + 6) % 7; }
  return HORA_SEQ[(starts[day] + hFrom6) % 7];
};
const getKaksha = (dateStr: string, timeStr: string): string => {
  const dt = new Date(`${dateStr}T${timeStr}`); let day = dt.getDay(); const h = dt.getHours(); const m = dt.getMinutes();
  let minFrom6 = h*60+m - 6*60; if (minFrom6 < 0) { minFrom6 += 24*60; day = (day + 6) % 7; }
  const idx = Math.floor(minFrom6 / 90) % 8;
  return DAY_KAKSHA[day][idx];
};
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
  const [form, setForm] = useState({
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
    lastResult:'', prevDrawDate: today, prevDrawTime: '15:00', ticketNums:''
  });
  const set = (k: string, v: any) => setForm(p => ({...p, [k]:v}));

  const [step, setStep] = useState<'form'|'loading'|'result'>('form');
  const [cd, setCd] = useState(60);
  const [ltxt, setLtxt] = useState('');
  const [result, setResult] = useState<any>(null);
  const [birthImg, setBirthImg] = useState<string|null>(null);
  const [transitImg, setTransitImg] = useState<string|null>(null);
  const [openSec, setOpenSec] = useState<string|null>('lotteryTime');
  const [showAllCombos, setShowAll] = useState(false);
  const [errLog, setErrLog] = useState('');

  const [birthPlanets, setBirthPlanets] = useState<ProkeralaPlanet[]>([]);
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
    "1000-Formula Engine: అన్ని calculations చేస్తున్నాము...",
    "శత్రు గ్రహాలు, HH/H/N/LL ratings నిర్ణయిస్తున్నాము...",
  ];

  const runAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading'); setCd(60); setLtxt(lTxts[0]);
    setChartsLoading(true); setErrLog('');

    const f = form;
    const dobDt = `${f.dob}T${f.dobTime}:00+05:30`;
    const orderDt = `${f.orderDate}T${f.orderTime}:00+05:30`;
    const drawDt = `${f.lotteryDrawDate}T${f.lotteryDrawTime}:00+05:30`;

    try {
      const lotteryDt = `${f.orderDate}T${f.lotteryTime}:00+05:30`;
      const dObj = new Date(orderDt);
      dObj.setDate(dObj.getDate() - 1);
      const yesterdayDt = dObj.toISOString();

      const aiQ = `నేను ఈరోజు ${f.orderDate} నాడు ${f.lotteryTime} కి ${f.lotteryCompanyFull||f.companyName||'lottery'} లాటరీ కొనాలి. Draw date: ${f.lotteryDrawDate} at ${f.lotteryDrawTime}. కంపెనీ: ${f.lotteryCompanyFull||f.companyName}. కొనే స్థానం: ${f.lotteryBuyLocation||f.companyLocation||'Hyderabad'}. నా జాతక చక్రం మరియు గోచార గ్రహ స్థానాల ఆధారంగా: 1) ఈ సమయం శుభమా? 2) Draw day అదృష్టంగా ఉందా? 3) Lucky numbers (1-${f.max} range) ఏవి? 4) Hora & Kaksha start/end times ఇవ్వండి.`;

      const [bp, tp, lp, pg, cg, yPg, yCg, dpg, dcg, aiRes] = await Promise.all([
        fetchPlanetPositions(dobDt, f.lat, f.lon),
        fetchPlanetPositions(orderDt, f.lat, f.lon),
        fetchPlanetPositions(lotteryDt, f.lat, f.lon),
        fetchPanchang(orderDt, f.lat, f.lon),
        fetchChoghadiya(orderDt, f.lat, f.lon),
        fetchPanchang(yesterdayDt, f.lat, f.lon),
        fetchChoghadiya(yesterdayDt, f.lat, f.lon),
        fetchPanchang(drawDt, f.lat, f.lon),
        fetchChoghadiya(drawDt, f.lat, f.lon),
        fetchAiInterpret(lotteryDt, f.lat, f.lon, aiQ)
      ]);

      if (pg && yPg && pg.hora_table && yPg.hora_table) {
        pg.hora_table = [...yPg.hora_table, ...pg.hora_table];
      }

      setBirthPlanets(bp);
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

    let userLagna = f.lagnam;
    let userRashi = f.rashi;
    let userNakIdx = f.nakshatram;

    if (birthPlanets.length > 0) {
      const as = birthPlanets.find(p => p.name === 'Ascendant' || p.name === 'లగ్న');
      if (as && as.rashi) userLagna = as.rashi.id - 1;
      const mo = birthPlanets.find(p => p.name === 'Moon' || p.name === 'చంద్ర');
      if (mo && mo.rashi) {
        userRashi = mo.rashi.id - 1;
        if (mo.nakshatra) {
          const nStr = mo.nakshatra.replace('ఢ','డ').replace('ఫల్గుణి','').trim();
          const nIdx = NAKSHATRAMS.findIndex(n => n.includes(nStr) || nStr.includes(n));
          if (nIdx !== -1) userNakIdx = nIdx;
        }
      }
    }

    const lagP = LAGNAM_PLANET[userLagna]; const lagV = PLANET_NUM[lagP]||1;
    const rashiP = LAGNAM_PLANET[userRashi]; const rashiV = PLANET_NUM[rashiP]||2;
    const nakL = NAK_LORDS[userNakIdx]; const nakV = PLANET_NUM[nakL]||3;

    let todayNakName = NAKSHATRAMS[todayNakIdx];
    const uLottery = timeToUnix(f.orderDate, f.lotteryTime);
    if (panchang && panchang.nakshatra) {
      const activeNak = panchang.nakshatra.find((n:any) => n.end_unix > uLottery) || panchang.nakshatra[0];
      if (activeNak) todayNakName = activeNak.name;
    }
    const todayNakIdxApi = NAKSHATRAMS.findIndex(n => todayNakName.includes(n) || n.includes(todayNakName));
    const finalTodayNakIdx = todayNakIdxApi !== -1 ? todayNakIdxApi : todayNakIdx;
    const todayNakL = NAK_LORDS[finalTodayNakIdx]; const todayNakV = PLANET_NUM[todayNakL]||3;

    const apiHoraRaw = panchang ? findApiSlot(f.orderDate, f.lotteryTime, panchang.hora_table, () => getHora(f.orderDate, f.lotteryTime)) : getHora(f.orderDate, f.lotteryTime);
    const apiHora = API_HORA_TO_SHORT[apiHoraRaw] || apiHoraRaw;
    const apiKakshaRaw = choghadiya.length ? findApiSlot(f.orderDate, f.lotteryTime, choghadiya, () => getKaksha(f.orderDate, f.lotteryTime)) : getKaksha(f.orderDate, f.lotteryTime);
    const apiKaksha = EN_TO_TE_KAKSHA[apiKakshaRaw] || apiKakshaRaw;
    const hora = apiHora;
    const kaksha = apiKaksha;
    const kashaP = KAKSHA_PLANET_MAP[kaksha]||'గురు';
    const cb = getChandraBalam(userRashi, f.orderDate);
    const tara = getTara(userNakIdx, finalTodayNakIdx);
    const nV = nameNum(f.userName); const dV = dateNum(f.dob);
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

    const lLagnaScore = LAGNAM_SCORE[lotteryLagna] || 5;
    // Use livePanchanga hora/kaksha for precise astronomical hora
    const lHoraInfo = HORA_INFO[hora]||{score:5,te:'',lotteryMsg:''};
    const lKakshaInfo = KAKSHA_INFO[kaksha]||{score:5,te:'',lotteryOk:true};
    const lotteryTimeScore = Math.round((lLagnaScore + lHoraInfo.score + lKakshaInfo.score)/3);
    const lotteryHora = hora;
    const lotteryKaksha = kaksha;

    // ─── DRAW DAY Analysis ───
    const drawNakName = drawPanchang?.nakshatra?.[0]?.name || '';
    const drawNakIdxRaw = NAKSHATRAMS.findIndex(n => drawNakName.includes(n) || n.includes(drawNakName));
    const drawNakIdx2 = drawNakIdxRaw !== -1 ? drawNakIdxRaw : 0;
    const drawNakL = NAK_LORDS[drawNakIdx2];
    const drawNakV = PLANET_NUM[drawNakL] || 1;
    const drawHoraRaw = drawPanchang ? findApiSlot(f.lotteryDrawDate, f.lotteryDrawTime, drawPanchang.hora_table || [], () => getHora(f.lotteryDrawDate, f.lotteryDrawTime)) : getHora(f.lotteryDrawDate, f.lotteryDrawTime);
    const drawHora = API_HORA_TO_SHORT[drawHoraRaw] || drawHoraRaw;
    const drawKakshaRaw = drawChoghadiya.length ? findApiSlot(f.lotteryDrawDate, f.lotteryDrawTime, drawChoghadiya, () => getKaksha(f.lotteryDrawDate, f.lotteryDrawTime)) : getKaksha(f.lotteryDrawDate, f.lotteryDrawTime);
    const drawKaksha = EN_TO_TE_KAKSHA[drawKakshaRaw] || drawKakshaRaw;
    const drawHoraScore = HORA_INFO[drawHora]?.score || 5;
    const drawKakshaScore = KAKSHA_INFO[drawKaksha]?.score || 5;
    const drawTithi = drawPanchang?.tithi?.[0]?.name || '';
    const drawVaara = drawPanchang?.vaara?.name || '';
    const drawDayScore = Math.round((drawHoraScore + drawKakshaScore) / 2);

    // ─── 11 CATEGORIES with HH/H/N/LL ───
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

    // ─── 55 COMBINATIONS (1000-formula engine) ───
    const combos: any[] = [];
    for (let i=0; i<cats.length; i++) {
      for (let j=i+1; j<cats.length; j++) {
        const a=cats[i]; const b=cats[j];
        const avgScore=(a.score+b.score)/2;
        const bothEnemy = a.isEnemy && b.isEnemy;
        const oneEnemy = a.isEnemy || b.isEnemy;
        const bothFriend = a.isFriend && b.isFriend;
        let badge: string; let bColor: string;
        if (bothEnemy) { badge = '🔴 LL'; bColor = 'bg-red-500/10 border-red-500/20 text-red-400'; }
        else if (oneEnemy) { badge = '🟡 N'; bColor = 'bg-amber-500/10 border-amber-500/20 text-amber-300'; }
        else if (avgScore >= 4.5 || (avgScore >= 4 && bothFriend)) { badge = '🟢 HH'; bColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'; }
        else if (avgScore >= 3) { badge = '🔵 H'; bColor = 'bg-blue-500/10 border-blue-500/30 text-blue-300'; }
        else if (avgScore >= 2) { badge = '🟡 N'; bColor = 'bg-amber-500/10 border-amber-500/20 text-amber-300'; }
        else { badge = '🔴 LL'; bColor = 'bg-red-500/10 border-red-500/20 text-red-400'; }
        const merged=[...new Set([...a.nums,...b.nums])].sort((x,y)=>x-y).filter(n=>n>=1&&n<=f.max).slice(0,f.pick*2);
        combos.push({a,b,avg:avgScore,badge,bColor,merged});
      }
    }
    combos.sort((x,y)=>y.avg-x.avg);

    // ─── MASTER NUMBER ENGINE (1000 patterns) ───
    const freq: Record<number,{cnt:number;boost:number}> = {};
    combos.filter(c=>c.badge.includes('HH')||c.badge.includes('H ')).forEach(c=>{
      c.merged.forEach((n:number)=>{
        if (!freq[n]) freq[n]={cnt:0,boost:0};
        freq[n].cnt++;
        if (reduce9(n)===drawNakV) freq[n].boost += 3;   // draw day nak boost
        if (reduce9(n)===buyLocV) freq[n].boost += 2;    // buy location
        if (reduce9(n)===compFullV) freq[n].boost += 2;  // company
        if (reduce9(n)===nV) freq[n].boost += 2;         // name
        if (reduce9(n)===dV) freq[n].boost += 1;         // DOB
        if (c.badge.includes('HH')) freq[n].boost += 1;  // HH double boost
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

    // ─── 24-Hour Table ───
    const table24h = Array.from({length:24},(_,h)=>{
      const ts=`${String(h).padStart(2,'0')}:00`;
      const hrRaw = panchang ? findApiSlot(f.orderDate, ts, panchang.hora_table, () => getHora(f.orderDate, ts)) : getHora(f.orderDate, ts);
      const hr = API_HORA_TO_SHORT[hrRaw] || hrRaw;
      const kkRaw = choghadiya.length ? findApiSlot(f.orderDate, ts, choghadiya, () => getKaksha(f.orderDate, ts)) : getKaksha(f.orderDate, ts);
      const kk = EN_TO_TE_KAKSHA[kkRaw] || kkRaw;
      const lag=getLagnaAtTime(sunRashi,h);
      const total=Math.round(((HORA_INFO[hr]?.score||5)+(KAKSHA_INFO[kk]?.score||5)+LAGNAM_SCORE[lag])/3);
      return {time:`${ts}–${String((h+1)%24).padStart(2,'0')}:00`,hora:hr,kaksha:kk,lagnam:RASHIS[lag],total,
        outcome:total>=9?'🏆 అత్యుత్తమం':total>=7?'✅శుభం':total>=5?'🔵సాధారణం':total>=3?'⚠️జాగ్రత్త':'❌నష్టం'};
    });

    const lastNs=f.lastResult.replace(/[^0-9,\s]/g,'').split(/[,\s]+/).filter(Boolean).map(Number);
    const trendNote = lastNs.length>0?(lastNs.filter(n=>n%2!==0).length>lastNs.length/2?'గత వారం బేసి → ఈ వారం సరి సంఖ్యలు try చేయండి':'గత వారం సరి → ఈ వారం బేసి సంఖ్యలు try చేయండి'):'';
    const bestTimes = table24h.filter(r=>r.total>=8);
    const masterScore = (((HORA_INFO[hora]?.score||5)+(cb.good?9:5)+(Math.max(0,tara.score)*3)+6)/4).toFixed(1);

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
    const aiReading = (window as any)._lastAiInterpret || generatedReading;

    setResult({
      cats, combos, masterNums, masterConf, secondaryNums, avoidNumsList, masterScore,
      hora, kaksha, cb, tara, todayNakName, todayNakL, nV, dV, cV, lV, trendNote,
      bestTimes, table24h, pick:f.pick, max:f.max,
      lotteryLagna, lLagnaScore, lotteryHora, lotteryKaksha, lHoraInfo, lKakshaInfo, lotteryTimeScore,
      lagP, rashiP, nakL, birthPosFallback, transPosFallback, aiReading,
      drawNakName, drawNakL, drawHora, drawKaksha, drawTithi, drawVaara, drawDayScore, drawNakV,
      livePanchanga, livePanchangaDraw, livePanchangaPrevDraw, lastDrawMatch, prevDrawDate: f.prevDrawDate
    });
    setStep('result');
  } catch(e) { setErrLog(String((e as any).stack || e)); console.error(e); }
  }, [form, birthPlanets, transitPlanets, lotteryPlanets, panchang, drawPanchang, choghadiya, drawChoghadiya, todayNakIdx, livePanchanga, livePanchangaDraw, livePanchangaPrevDraw]);

  const toggle = (id:string) => setOpenSec(p=>p===id?null:id);

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
          {apiOk===null && <span className="text-xs text-slate-500">VedIntel API Ready • 11 Categories • 1000-Formula Engine • Dual Charts</span>}
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
              <p className="text-amber-200/70 text-xs mb-4">కొనే సమయం + Draw తేదీ + కంపెనీ వివరాలు ఇస్తే 1000-formula engine పూర్తి విశ్లేషణ చేస్తుంది.</p>
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

            {/* ── 3 COLUMN FORM ── */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Personal */}
              <div className="bg-slate-900/60 border border-pink-700/30 rounded-2xl p-4 space-y-3">
                <h3 className="text-pink-400 font-bold text-sm flex items-center gap-2"><Star className="w-4 h-4"/>వ్యక్తిగత & జాతక వివరాలు</h3>
                <input required value={form.userName} onChange={e=>set('userName',e.target.value)} placeholder="మీ పూర్తి పేరు (English)" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/40"/>
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

              {/* Numbers & Trend */}
              <div className="space-y-4">
                <div className="bg-slate-900/60 border border-blue-700/30 rounded-2xl p-4 space-y-3">
                  <h3 className="text-blue-400 font-bold text-sm flex items-center gap-2"><Hash className="w-4 h-4"/>నంబర్ వివరాలు</h3>
                  <input value={form.ticketNums} onChange={e=>set('ticketNums',e.target.value)} placeholder="మీ నంబర్లు (7,14,21,32...)" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"/>
                </div>
                <div className="bg-slate-900/60 border border-orange-700/30 rounded-2xl p-4 space-y-3">
                  <h3 className="text-orange-400 font-bold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4"/>గత వారం ఫలితాలు</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-slate-400 mb-1 block">గత Draw తేదీ</label><input type="date" value={form.prevDrawDate} onChange={e=>set('prevDrawDate',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"/></div>
                    <div><label className="text-xs text-slate-400 mb-1 block">గత Draw సమయం</label><input type="time" value={form.prevDrawTime} onChange={e=>set('prevDrawTime',e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"/></div>
                  </div>
                  <textarea value={form.lastResult} onChange={e=>set('lastResult',e.target.value)} placeholder="గత ఫలితాల నంబర్లు Ex: 7, 14, 23, 31, 42, 6" rows={2} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none resize-none"/>
                </div>
              </div>

              {/* Summary + Submit */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border border-yellow-500/20 rounded-2xl p-4">
                  <h3 className="text-yellow-400 font-bold text-xs mb-3 uppercase tracking-wider">1000-Formula Engine:</h3>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    <li>🔌 VedIntel API → Real planet positions</li>
                    <li>📐 జన్మ కుండలి → API data from birth datetime</li>
                    <li>🌍 గోచార కుండలి → Today's API data</li>
                    <li>🎫 Draw Day → Nakshatra, Hora, Kaksha</li>
                    <li>⚔️ శత్రు గ్రహాల ఫిల్టర్ (LL numbers → Red)</li>
                    <li>🟢 HH / 🔵 H / 🟡 N / 🔴 LL ratings</li>
                    <li>⭐ Per-category star ratings</li>
                    <li>🔢 11 categories → 55 combo patterns</li>
                    <li>🏆 Master + Secondary + Avoid numbers</li>
                    <li>⏰ Best time windows (today)</li>
                  </ul>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-black font-extrabold py-5 rounded-2xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-[0_0_30px_rgba(255,215,0,0.4)] text-xl">
                  🔮 60 Sec 1000-Formula Analysis
                </button>
              </div>
            </div>
          </form>
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
      {step==='result' && result && (
        <div className="space-y-5 animate-in fade-in duration-500">

          {/* API Status */}
          {apiOk!==null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs border ${apiOk?'bg-emerald-500/10 border-emerald-500/30 text-emerald-300':'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
              {apiOk?<CheckCircle className="w-4 h-4"/>:<AlertCircle className="w-4 h-4"/>}
              {apiOk?`✅ VedIntel API నుండి Real planet positions జన్మ కుండలి & గోచార చార్ట్ లో చూపిస్తున్నాము!`:`⚠️ API offline — Calculated positions వాడుతున్నాము.`}
            </div>
          )}

          {/* ═══ DUAL CHARTS ═══ */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-yellow-500/20 rounded-2xl p-4">
              {birthImg ? (
                <><p className="text-cyan-300 text-xs font-bold text-center mb-2">జన్మ కుండలి (మీరు Upload చేసినది)</p><img src={birthImg} alt="birth" className="rounded-xl w-full border border-yellow-500/30"/></>
              ) : (
                <KundaliChart title={apiOk?`జన్మ కుండలి — API (${form.dob} ${form.dobTime})`:"జన్మ కుండలి (Calculated)"} colorClass="text-cyan-300" apiPlanets={apiOk?birthPlanets:undefined} positions={result.birthPosFallback} loading={chartsLoading}/>
              )}
              {!birthImg && birthPlanets.length>0 && (
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {birthPlanets.filter(p=>p.name!=='Ascendant').map(p=>(
                    <div key={p.name} className="bg-slate-950 rounded px-2 py-1 text-center">
                      <p className="text-[9px] text-slate-500">{p.name}</p>
                      <p className="text-[10px] text-yellow-300 font-bold">{p.rashi?.name} {p.is_retrograde?'(R)':''}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-slate-900/50 border border-yellow-500/20 rounded-2xl p-4">
              {transitImg ? (
                <><p className="text-purple-300 text-xs font-bold text-center mb-2">గోచార కుండలి (మీరు Upload చేసినది)</p><img src={transitImg} alt="transit" className="rounded-xl w-full border border-yellow-500/30"/></>
              ) : (
                <KundaliChart title={apiOk?`ఈరోజు గోచార చార్ట్ — API (${form.orderDate})`:"ఈరోజు గోచార చార్ట్ (Calculated)"} colorClass="text-purple-300" apiPlanets={apiOk?transitPlanets:undefined} positions={result.transPosFallback} loading={chartsLoading}/>
              )}
              {!transitImg && panchang && (
                <div className="mt-2 bg-slate-950/60 rounded-xl p-2">
                  <p className="text-xs font-bold text-yellow-400 mb-1">📅 ఈరోజు పంచాంగం (API)</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-slate-400">నక్షత్రం:</span><span className="text-yellow-300 font-bold">{panchang.nakshatra?.[0]?.name||result.todayNakName}</span>
                    <span className="text-slate-400">తిథి:</span><span className="text-blue-300">{panchang.tithi?.[0]?.name} ({panchang.tithi?.[0]?.paksha})</span>
                    <span className="text-slate-400">యోగ:</span><span className="text-purple-300">{panchang.yoga?.[0]?.name}</span>
                    <span className="text-slate-400">వార:</span><span className="text-cyan-300">{panchang.vaara?.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ LIVE PANCHANGA DASHBOARD ═══ */}
          {result.livePanchanga && (() => {
            const lp: LivePanchanga = result.livePanchanga;
            const dp: LivePanchanga = result.livePanchangaDraw;
            const scoreCol = (s: number) => s >= 8 ? 'text-emerald-400' : s >= 6 ? 'text-blue-400' : s >= 4 ? 'text-amber-400' : 'text-red-400';
            const scoreBorder = (s: number) => s >= 8 ? 'border-emerald-500/40 bg-emerald-500/5' : s >= 6 ? 'border-blue-500/40 bg-blue-500/5' : s >= 4 ? 'border-amber-500/40 bg-amber-500/5' : 'border-red-500/40 bg-red-500/5';
            const PanchangCard = ({label,val,sub,score,max=5,color='yellow'}: {label:string;val:string;sub?:string;score:number;max?:number;color?:string}) => (
              <div className={`bg-slate-900/60 border rounded-xl p-3 text-center ${scoreBorder(score/max*10)}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider text-${color}-400`}>{label}</p>
                <p className={`text-sm font-black text-${color}-300 mt-0.5`}>{val}</p>
                {sub && <p className="text-[9px] text-slate-400">{sub}</p>}
                <div className="mt-1 bg-slate-800 rounded-full h-1">
                  <div className={`h-1 rounded-full bg-${color}-500`} style={{width:`${(score/max)*100}%`}}/>
                </div>
                <p className={`text-[9px] mt-0.5 font-bold ${scoreCol(score/max*10)}`}>{score}/{max}</p>
              </div>
            );
            return (
              <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 border-2 border-indigo-500/40 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-indigo-300 flex items-center gap-2">
                    🪐 Live Panchanga Dashboard — {form.orderDate} {form.lotteryTime}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-black border ${scoreBorder(lp.totalScore)}`}>
                    <span className={scoreCol(lp.totalScore)}>{lp.totalScore}/10</span>
                    <span className="text-slate-400 text-xs ml-1">{lp.grade}</span>
                  </div>
                </div>

                {/* Buy Time Panchanga Grid */}
                <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-2">🛒 కొనే సమయం పంచాంగం</p>
                <div className="grid grid-cols-3 md:grid-cols-9 gap-2 mb-4">
                  <PanchangCard label="తిథి" val={lp.tithiName} sub={lp.paksha} score={lp.tithiScore} color="yellow"/>
                  <PanchangCard label="వారం" val={lp.varaName} sub="" score={lp.varaScore} color="orange"/>
                  <PanchangCard label="నక్షత్రం" val={lp.nakName} sub={`${lp.nakLord} | పాదం ${lp.pada}`} score={lp.nakScore} color="purple"/>
                  <PanchangCard label="యోగం" val={lp.yogaName} sub={lp.yogaGood?'శుభం':lp.yogaBad?'అశుభం':'తటస్థం'} score={lp.yogaGood?5:lp.yogaBad?1:3} color="cyan"/>
                  <PanchangCard label="కరణం" val={lp.karanaName} sub={`#${lp.karana}`} score={3} color="teal"/>
                  <PanchangCard label="లగ్నం ⭐" val={lp.lagnaRashi} sub={`${(lp.lagna%30).toFixed(1)}° | ${lp.lagnaLord}`} score={lp.lagnaScore} max={10} color="rose"/>
                  <PanchangCard label="హోరా" val={lp.horaTE} sub={lp.horaEN} score={lp.horaScore} max={10} color="amber"/>
                  <PanchangCard label="కక్ష్య" val={lp.kaksha} sub={lp.kakshaOk?'✅ అనుకూలం':'❌ నివారణ'} score={lp.kakshaScore} max={10} color={lp.kakshaOk?'emerald':'red'}/>
                  <div className={`bg-slate-900/60 border rounded-xl p-3 text-center ${lp.inRahu?'border-red-500 bg-red-500/10':'border-slate-700'}`}>
                    <p className="text-[10px] font-bold text-red-400">రాహుకాలం</p>
                    <p className={`text-xs font-black ${lp.inRahu?'text-red-400 animate-pulse':'text-slate-400'}`}>
                      {lp.inRahu ? '⛔ ACTIVE' : '✅ Safe'}
                    </p>
                    <p className="text-[9px] text-slate-500">{lp.rahuStart.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}–{lp.rahuEnd.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                  </div>
                </div>

                {/* Draw Day Panchanga */}
                {dp && (
                  <>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2">🎫 Draw Day పంచాంగం — {form.lotteryDrawDate} {form.lotteryDrawTime}</p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      <PanchangCard label="తిథి" val={dp.tithiName} sub={dp.paksha} score={dp.tithiScore} color="yellow"/>
                      <PanchangCard label="వారం" val={dp.varaName} sub="" score={dp.varaScore} color="orange"/>
                      <PanchangCard label="నక్షత్రం" val={dp.nakName} sub={dp.nakLord} score={dp.nakScore} color="purple"/>
                      <PanchangCard label="యోగం" val={dp.yogaName} sub={dp.yogaGood?'శుభం':dp.yogaBad?'అశుభం':'తటస్థం'} score={dp.yogaGood?5:dp.yogaBad?1:3} color="cyan"/>
                      <PanchangCard label="Draw లగ్నం" val={dp.lagnaRashi} sub={`${(dp.lagna%30).toFixed(1)}° | ${dp.lagnaLord}`} score={dp.lagnaScore} max={10} color="rose"/>
                      <PanchangCard label="Draw హోరా" val={dp.horaTE} sub={dp.horaEN} score={dp.horaScore} max={10} color="amber"/>
                    </div>
                    <div className={`mt-3 rounded-xl p-3 border text-center ${scoreBorder(dp.totalScore)}`}>
                      <p className="text-xs text-slate-400">Draw Day మొత్తం అనుకూలత:</p>
                      <p className={`text-2xl font-black ${scoreCol(dp.totalScore)}`}>{dp.totalScore}/10 {dp.grade}</p>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* ═══ LOTTERY TIME ANALYSIS ═══ */}
          <div className="bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border-2 border-amber-500/60 rounded-2xl p-5">
            <h3 className="text-2xl font-black text-amber-400 flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6"/>⏰ లాటరీ సమయ విశ్లేషణ — {form.lotteryTime}
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className={`rounded-2xl p-4 border ${scoreBg(result.lLagnaScore)}`}>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">ఆ సమయ లగ్నం</p>
                <p className="text-2xl font-black text-yellow-300">{RASHIS[result.lotteryLagna]}</p>
                <p className="text-xs text-slate-300 mt-1">{LAGNAM_LOTTERY_MSG[result.lotteryLagna]}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-yellow-500" style={{width:`${result.lLagnaScore*10}%`}}/></div>
                  <span className={`text-sm font-black ${scoreColor(result.lLagnaScore)}`}>{result.lLagnaScore}/10</span>
                </div>
              </div>
              <div className={`rounded-2xl p-4 border ${scoreBg(result.lHoraInfo.score)}`}>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">ఆ సమయ హోరా</p>
                <p className={`text-2xl font-black ${horaColor(result.lotteryHora)}`}>{result.lotteryHora} హోరా</p>
                <p className="text-xs text-slate-300 mt-1">{result.lHoraInfo.te}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${['గురు','శుక్ర'].includes(result.lotteryHora)?'bg-emerald-500':'bg-amber-500'}`} style={{width:`${result.lHoraInfo.score*10}%`}}/></div>
                  <span className={`text-sm font-black ${scoreColor(result.lHoraInfo.score)}`}>{result.lHoraInfo.score}/10</span>
                </div>
              </div>
              <div className={`rounded-2xl p-4 border ${scoreBg(result.lKakshaInfo.score)}`}>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">ఆ సమయ కక్ష్య</p>
                <p className={`text-2xl font-black ${kakshaColor(result.lotteryKaksha)}`}>{result.lotteryKaksha}</p>
                <p className="text-xs text-slate-300 mt-1">{result.lKakshaInfo.te}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${['అమృత','లాభ'].includes(result.lotteryKaksha)?'bg-emerald-500':'bg-red-500'}`} style={{width:`${result.lKakshaInfo.score*10}%`}}/></div>
                  <span className={`text-sm font-black ${scoreColor(result.lKakshaInfo.score)}`}>{result.lKakshaInfo.score}/10</span>
                </div>
              </div>
            </div>
            <div className={`rounded-2xl p-4 border text-center ${scoreBg(result.lotteryTimeScore)}`}>
              <p className={`text-xl font-black ${scoreColor(result.lotteryTimeScore)} mb-1`}>
                {result.lotteryTimeScore>=8?'🏆 ఈ సమయం లాటరీ కొనడానికి అత్యుత్తమం!':result.lotteryTimeScore>=6?'✅ ఈ సమయం లాటరీ కొనవచ్చు':result.lotteryTimeScore>=4?'🔵 సాధారణ సమయం — వేరే సమయం కూడా చూడండి':'❌ ఈ సమయం వద్దు — వేరే సమయం ఎంచుకోండి'}
              </p>
              {result.lHoraInfo.lotteryMsg && <p className="mt-2 text-sm text-amber-200">{result.lHoraInfo.lotteryMsg}</p>}
            </div>
            {choghadiya.length>0 && (
              <div className="mt-3 bg-slate-900/60 rounded-xl p-3">
                <p className="text-xs font-bold text-yellow-400 mb-2">📅 Choghadiya (ఈరోజు API నుండి)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                  {choghadiya.slice(0,8).map((c,i)=>(
                    <div key={i} className={`rounded-lg p-2 text-center text-xs border ${c.type==='good'?'bg-emerald-500/10 border-emerald-500/30 text-emerald-300':c.type==='bad'?'bg-red-500/10 border-red-500/30 text-red-400':'bg-slate-800 border-slate-700 text-slate-400'}`}>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-[10px] opacity-70">{new Date(c.start).toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}–{new Date(c.end).toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ═══ DRAW DAY ANALYSIS ═══ */}
          {result.drawNakName && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/40 rounded-2xl p-5">
              <h3 className="text-lg font-black text-emerald-400 flex items-center gap-2 mb-3">
                🎫 Draw Day జ్యోతిష్య విశ్లేషణ — {form.lotteryDrawDate} {form.lotteryDrawTime}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-emerald-500/20">
                  <p className="text-[10px] text-slate-400 mb-1">Draw నక్షత్రం</p>
                  <p className="text-base font-black text-yellow-300">{result.drawNakName||'?'}</p>
                  <p className="text-[10px] text-slate-400">{result.drawNakL} (vib {result.drawNakV})</p>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-emerald-500/20">
                  <p className="text-[10px] text-slate-400 mb-1">Draw హోరా</p>
                  <p className={`text-base font-black ${horaColor(result.drawHora)}`}>{result.drawHora||'?'}</p>
                  <p className="text-[10px] text-slate-400">{HORA_INFO[result.drawHora]?.score||'?'}/10</p>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-emerald-500/20">
                  <p className="text-[10px] text-slate-400 mb-1">Draw కక్ష్య</p>
                  <p className={`text-base font-black ${kakshaColor(result.drawKaksha)}`}>{result.drawKaksha||'?'}</p>
                  <p className="text-[10px] text-slate-400">{KAKSHA_INFO[result.drawKaksha]?.lotteryOk ? '✅ శుభం' : '⚠️ జాగ్రత్త'}</p>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-emerald-500/20">
                  <p className="text-[10px] text-slate-400 mb-1">Draw Day స్కోరు</p>
                  <p className={`text-2xl font-black ${scoreColor(result.drawDayScore)}`}>{result.drawDayScore}/10</p>
                  <p className="text-[10px] text-slate-400">{result.drawTithi} {result.drawVaara}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Draw Day నక్షత్రం లార్డ్ ({result.drawNakL}) వైబ్రేషన్ {result.drawNakV} — ఈ వైబ్రేషన్ master numbers లో extra boost అయ్యాయి.</p>
            </div>
          )}

          {/* ═══ MASTER NUMBERS (1000-Formula) ═══ */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/50 rounded-2xl p-5">
            <h3 className="text-xl font-black text-yellow-400 flex items-center gap-2 mb-1"><Star className="w-5 h-5"/>🏆 ఫైనల్ మాస్టర్ నంబర్లు (Pick {result.pick} / 1–{result.max})</h3>
            <p className="text-xs text-amber-200/60 mb-4">1000-Formula: 11 categories × 55 combinations × draw-day boost × enemy-planet filter</p>
            <div className="flex flex-wrap gap-3 mb-4">
              {(result.masterConf||result.masterNums.map((n:number)=>({n,stars:3}))).map((c:any)=>(
                <div key={c.n} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 text-black text-xl font-black flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.4)]">{c.n}</div>
                  <span className="text-[9px] text-yellow-300">{'⭐'.repeat(c.stars)}</span>
                </div>
              ))}
            </div>
            {result.secondaryNums?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-blue-300 font-bold mb-2">🔵 Secondary Numbers (Medium Confidence)</p>
                <div className="flex flex-wrap gap-2">
                  {result.secondaryNums.map((n:number)=>(
                    <div key={n} className="w-11 h-11 rounded-full bg-blue-900/60 border border-blue-500/50 text-blue-200 text-sm font-bold flex items-center justify-center">{n}</div>
                  ))}
                </div>
              </div>
            )}
            {result.avoidNumsList?.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                <p className="text-xs text-red-400 font-bold mb-2">🔴 Avoid Numbers (శత్రు గ్రహాల వైబ్రేషన్)</p>
                <div className="flex flex-wrap gap-2">
                  {result.avoidNumsList.map((n:number)=>(
                    <div key={n} className="w-10 h-10 rounded-full bg-red-900/40 border border-red-500/40 text-red-400 text-xs font-bold flex items-center justify-center line-through opacity-60">{n}</div>
                  ))}
                </div>
                <p className="text-[10px] text-red-400/60 mt-1">ఈ నంబర్లు మీ లగ్నాధిపతికి శత్రు గ్రహాల వైబ్రేషన్ కి చెందినవి — skip చేయండి</p>
              </div>
            )}
          </div>

          {/* ═══ LAST DRAW ANALYSIS ═══ */}
          {result.lastDrawMatch?.length > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 mt-4 mb-4">
              <h3 className="text-xl font-black text-orange-400 flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5"/>గత Draw ({result.prevDrawDate}) విశ్లేషణ</h3>
              <p className="text-xs text-orange-200/70 mb-4">మీరు ఇచ్చిన గత ఫలితాలు (నంబర్లు) మన 1000-formula engine లో ఏ కేటగిరీల ఆధారంగా వచ్చాయో ఇక్కడ చూడవచ్చు. ఈ trend ఆధారంగా నేటి నంబర్లు అంచనా వేయవచ్చు.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.lastDrawMatch.map((m:any, i:number) => (
                  <div key={i} className="bg-slate-900 border border-orange-600/30 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-900 border border-orange-500 text-orange-300 text-lg font-black flex items-center justify-center shrink-0">
                      {m.num}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Vibration: {m.vib}</p>
                      <p className="text-xs text-orange-300 font-bold leading-tight">{m.reasons}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ BEST TIME WINDOWS ═══ */}
          {result.bestTimes.length>0&&(
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
              <h3 className="text-emerald-400 font-bold text-sm flex items-center gap-2 mb-3"><Clock className="w-4 h-4"/>⏰ ఈరోజు Best Time Windows (Score 8+/10)</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {result.bestTimes.slice(0,6).map((t:any,i:number)=>(
                  <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-300 text-xs font-bold">✅ {t.time}</span>
                      <span className="text-[10px] text-emerald-400/70">{t.hora} + {t.kaksha}</span>
                    </div>
                    <p className="text-[10px] text-emerald-200/50 mt-0.5">{t.outcome} — {t.total}/10</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ 24-Hour Table ═══ */}
          <div>
            <button onClick={()=>toggle('24h')} className="w-full flex items-center justify-between bg-slate-900/60 border border-amber-700/30 rounded-2xl px-4 py-3 hover:bg-slate-800/50 transition-colors">
              <span className="font-bold text-amber-400 flex items-center gap-2"><Clock className="w-4 h-4"/>24 గంటల లగ్న + హోరా + కక్ష్య పట్టిక</span>
              {openSec==='24h'?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}
            </button>
            {openSec==='24h' && (
              <div className="mt-2 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-950 border-b border-slate-800">
                      <tr>{['సమయం','లగ్నం','హోరా','కక్ష్య','స్కోరు','ఫలితం'].map(h=><th key={h} className="py-2 px-2 text-yellow-400 text-left font-bold">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {result.table24h.map((r:any,i:number)=>{
                        const isLotteryHour = form.lotteryTime && parseInt(form.lotteryTime.split(':')[0])===i;
                        return (
                          <tr key={i} className={`border-b border-slate-900 ${isLotteryHour?'ring-1 ring-amber-500/50 bg-amber-500/10':r.total>=8?'bg-emerald-500/5':r.total<=3?'bg-red-500/5':''} hover:bg-slate-800/30`}>
                            <td className="py-1.5 px-2 font-medium text-slate-200">{r.time} {isLotteryHour&&<span className="text-amber-400">⭐</span>}</td>
                            <td className="py-1.5 px-2 text-yellow-200 text-xs">{r.lagnam}</td>
                            <td className={`py-1.5 px-2 font-bold ${horaColor(r.hora)}`}>{r.hora}</td>
                            <td className={`py-1.5 px-2 font-bold ${kakshaColor(r.kaksha)}`}>{r.kaksha}</td>
                            <td className="py-1.5 px-2 font-black text-white">{r.total}/10</td>
                            <td className="py-1.5 px-2">{r.outcome}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ═══ 11 CATEGORIES with HH/H/N/LL ═══ */}
          <div>
            <button onClick={()=>toggle('cats')} className="w-full flex items-center justify-between bg-slate-900/60 border border-blue-700/30 rounded-2xl px-4 py-3 hover:bg-slate-800/50 transition-colors">
              <span className="font-bold text-blue-400 flex items-center gap-2"><BookOpen className="w-4 h-4"/>11 Categories — 🟢HH 🔵H 🟡N 🔴LL Ratings</span>
              {openSec==='cats'?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}
            </button>
            {openSec==='cats' && (
              <div className="mt-2 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.cats.map((cat:any)=>(
                  <div key={cat.id} className={`rounded-xl p-3 border ${cat.hhBg}`}>
                    <div className="flex justify-between items-start mb-1.5">
                      <p className="text-xs font-bold text-slate-200 leading-tight flex-1 mr-2">{cat.te}</p>
                      <span className={`text-xs font-bold whitespace-nowrap ${cat.hhColor}`}>{cat.hh}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] text-slate-500">వైబ్రేషన్: <strong className="text-white">{cat.vib}</strong></p>
                      <span className="text-[10px] text-yellow-300">{'⭐'.repeat(cat.stars)}</span>
                    </div>
                    {cat.isEnemy && <p className="text-[10px] text-red-400 mb-1">⚠️ శత్రు గ్రహం — ఈ నంబర్లు avoid చేయండి</p>}
                    <div className="flex flex-wrap gap-1">
                      {cat.nums.slice(0,14).map((n:number)=>(
                        <span key={n} className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border ${
                          cat.isEnemy
                            ? 'bg-red-900/40 border-red-500/40 text-red-400 line-through opacity-60'
                            : cat.isFriend
                            ? 'bg-emerald-900/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>{n}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══ 55 COMBINATIONS ═══ */}
          <div>
            <button onClick={()=>toggle('combos')} className="w-full flex items-center justify-between bg-slate-900/60 border border-purple-700/30 rounded-2xl px-4 py-3 hover:bg-slate-800/50 transition-colors">
              <span className="font-bold text-purple-400 flex items-center gap-2"><Zap className="w-4 h-4"/>55 Combination Patterns (1000-Formula Engine)</span>
              {openSec==='combos'?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}
            </button>
            {openSec==='combos' && (
              <div className="mt-2 space-y-2">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(showAllCombos?result.combos:result.combos.slice(0,12)).map((c:any,i:number)=>(
                    <div key={i} className={`rounded-xl p-3 border ${c.bColor}`}>
                      <div className="flex justify-between mb-1"><span className="text-xs font-bold">{c.badge}</span><span className="text-[10px] text-slate-500">{c.a.id}+{c.b.id}</span></div>
                      <p className="text-[10px] font-semibold mb-1 leading-tight">{c.a.te.split('→')[0].trim()} + {c.b.te.split('→')[0].trim()}</p>
                      <div className="flex flex-wrap gap-1">{c.merged.slice(0,8).map((n:number)=><span key={n} className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border ${c.badge.includes('LL')?'bg-red-900/30 border-red-500/30 text-red-400':'bg-slate-900 border-slate-700 text-slate-200'}`}>{n}</span>)}</div>
                    </div>
                  ))}
                </div>
                {result.combos.length>12&&<button onClick={()=>setShowAll(!showAllCombos)} className="w-full text-sm text-purple-400 hover:text-purple-300 py-2 border border-purple-700/30 rounded-xl transition-colors">{showAllCombos?'తక్కువ చూపించు ▲':`మిగిలిన ${result.combos.length-12} combinations చూపించు ▼`}</button>}
              </div>
            )}
          </div>

          {/* AI Reading */}
          {result.aiReading && (
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4">
              <h3 className="text-indigo-400 font-bold text-sm flex items-center gap-2 mb-2"><Star className="w-4 h-4"/>🤖 AI జ్యోతిష్య విశ్లేషణ</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{result.aiReading}</p>
            </div>
          )}

          {result.trendNote&&<div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4"><h3 className="text-orange-400 font-bold text-sm flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4"/>గత వారం ట్రెండ్</h3><p className="text-xs text-orange-200">{result.trendNote}</p></div>}

          <button onClick={()=>{setStep('form');setResult(null);setOpenSec('lotteryTime');setShowAll(false);setApiOk(null);setBirthPlanets([]);setTransitPlanets([]);setLotteryPlanets([]);setPanchang(null);setDrawPanchang(null);setChoghadiya([]);setDrawChoghadiya([]);setErrLog('');}} className="w-full bg-slate-800 border border-slate-700 text-slate-300 py-3 rounded-2xl hover:bg-slate-700 transition text-sm font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4"/> మరోకసారి ప్రయత్నించండి
          </button>
        </div>
      )}
    </div>
  );
}
