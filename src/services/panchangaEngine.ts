// ════════════════════════════════════════════════════════════════
//  panchangaEngine.ts — Shared Astronomical Engine
//  Used by PanchangaCalendar.tsx AND MahaAdrushta.tsx
//  Jean Meeus algorithms + Lahiri Ayanamsa + IST timezone
// ════════════════════════════════════════════════════════════════

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;
export const mod360 = (x: number) => ((x % 360) + 360) % 360;

// ── Telugu data tables ────────────────────────────────────────
export const NAK_TE  = ['అశ్విని','భరణి','కృత్తిక','రోహిణి','మృగశిర','ఆర్ద్ర','పునర్వసు','పుష్యమి','ఆశ్లేష','మఖ','పూర్వఫల్గుణి','ఉత్తరఫల్గుణి','హస్త','చిత్త','స్వాతి','విశాఖ','అనూరాధ','జ్యేష్ఠ','మూల','పూర్వాషాఢ','ఉత్తరాషాఢ','శ్రవణ','ధనిష్ఠ','శతభిష','పూర్వభాద్ర','ఉత్తరభాద్ర','రేవతి'];
export const NAK_LORD_TE  = ['కేతు','శుక్ర','సూర్య','చంద్ర','కుజ','రాహు','గురు','శని','బుధ','కేతు','శుక్ర','సూర్య','చంద్ర','కుజ','రాహు','గురు','శని','బుధ','కేతు','శుక్ర','సూర్య','చంద్ర','కుజ','రాహు','గురు','శని','బుధ'];
export const RASHI_TE = ['మేష','వృష','మిథున','కర్కాటక','సింహ','కన్య','తుల','వృశ్చిక','ధనుస్సు','మకర','కుంభ','మీన'];
export const TITHI_TE = ['పాడ్యమి','విదియ','తదియ','చవితి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','పౌర్ణమి','పాడ్యమి','విదియ','తదియ','చవితి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','అమావాస్య'];
export const YOGA_TE  = ['విష్కంభ','ప్రీతి','ఆయుష్మాన్','సౌభాగ్య','శోభన','అతిగండ','సుకర్మా','ధృతి','శూల','గండ','వృద్ధి','ధ్రువ','వ్యాఘాత','హర్షణ','వజ్ర','సిద్ధి','వ్యతీపాత','వరీయాన్','పరిఘ','శివ','సిద్ధ','సాధ్య','శుభ','శుక్ల','బ్రహ్మ','ఐంద్ర','వైధృతి'];
export const VARA_TE  = ['ఆదివారం','సోమవారం','మంగళవారం','బుధవారం','గురువారం','శుక్రవారం','శనివారం'];
export const HORA_TE  = ['సూర్య','శుక్ర','బుధ','చంద్ర','శని','గురు','కుజ'];
export const HORA_EN  = ['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars'];
export const HORA_TE_FROM_EN: Record<string,string> = {Sun:'సూర్య',Venus:'శుక్ర',Mercury:'బుధ',Moon:'చంద్ర',Saturn:'శని',Jupiter:'గురు',Mars:'కుజ'};

// Hora start planet index for each weekday (0=Sun..6=Sat)
export const HORA_START = [0,3,6,2,5,1,4];
// Rahu/Yama/Gulika slot (1-8) by weekday
export const RAHU_SLOT   = [8,2,7,5,6,4,3];
export const YAMA_SLOT   = [5,1,6,4,3,2,7];
export const GULIKA_SLOT = [3,6,5,7,4,2,1];

// Scoring tables
export const TITHI_SCORE = [4,3,5,3,5,3,4,2,3,5,5,4,3,2,5,4,3,5,3,5,3,4,2,3,5,5,4,3,2,1];
export const VARA_SCORE  = [4,4,5,5,5,5,3]; // Sun Mon Tue Wed Thu Fri Sat
export const NAK_SCORE   = [5,2,4,5,3,2,5,5,2,4,4,5,5,5,5,4,5,3,3,4,5,5,4,2,4,5,5];
export const YOGA_GOOD   = new Set([1,3,5,11,13,15,21,23,24,25]);
export const YOGA_BAD    = new Set([5,8,12,16,18,26]);

// ── Core Astronomy ─────────────────────────────────────────────
export function toJD(date: Date): number {
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours()/24 + date.getUTCMinutes()/1440 + date.getUTCSeconds()/86400;
  const a = Math.floor((14-m)/12), Y = y+4800-a, M = m+12*a-3;
  return d + Math.floor((153*M+2)/5) + 365*Y + Math.floor(Y/4) - Math.floor(Y/100) + Math.floor(Y/400) - 32045.5;
}

export function lahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545) / 36525;
  return 23.85 + T * 0.013969;
}

export function sunLon(jd: number): number {
  const T = (jd-2451545)/36525;
  const L0 = mod360(280.46646+36000.76983*T);
  const M  = mod360(357.52911+35999.05029*T);
  const C  = (1.914602-0.004817*T)*Math.sin(M*DEG)+(0.019993-0.000101*T)*Math.sin(2*M*DEG)+0.000289*Math.sin(3*M*DEG);
  const om = mod360(125.04-1934.136*T);
  return mod360(L0+C-0.00569-0.00478*Math.sin(om*DEG));
}

export function moonLon(jd: number): number {
  const T = (jd-2451545)/36525;
  const L_ = mod360(218.3164477+481267.88123421*T-0.0015786*T*T);
  const D  = mod360(297.8501921+445267.1114034*T-0.0018819*T*T);
  const M  = mod360(357.5291092+35999.0502909*T-0.0001536*T*T);
  const M_ = mod360(134.9633964+477198.8675055*T+0.0087414*T*T);
  const F  = mod360(93.2720950+483202.0175233*T-0.0036539*T*T);
  let lon = 0;
  lon += 6.288774*Math.sin(M_*DEG); lon += 1.274027*Math.sin((2*D-M_)*DEG);
  lon += 0.658314*Math.sin(2*D*DEG); lon += 0.213618*Math.sin(2*M_*DEG);
  lon -= 0.185116*Math.sin(M*DEG); lon -= 0.114332*Math.sin(2*F*DEG);
  lon += 0.058793*Math.sin((2*D-2*M_)*DEG); lon += 0.057066*Math.sin((2*D-M-M_)*DEG);
  lon += 0.053322*Math.sin((2*D+M_)*DEG); lon += 0.045758*Math.sin((2*D-M)*DEG);
  lon -= 0.040923*Math.sin((M-M_)*DEG); lon -= 0.034720*Math.sin(D*DEG);
  lon -= 0.030383*Math.sin((M+M_)*DEG); lon += 0.015327*Math.sin((2*D-2*F)*DEG);
  lon += 0.010675*Math.sin((4*D-M_)*DEG); lon += 0.010034*Math.sin(3*M_*DEG);
  return mod360(L_ + lon);
}

export const sidLon = (tropical: number, jd: number) => mod360(tropical - lahiriAyanamsa(jd));

function obliquity(jd: number): number {
  const T = (jd-2451545)/36525;
  return 23.439291 - 0.013004*T - 0.000000164*T*T + 0.000000504*T*T*T;
}

function gst(jd: number): number {
  const T = (jd-2451545)/36525;
  return mod360(280.46061837 + 360.98564736629*(jd-2451545) + 0.000387933*T*T - T*T*T/38710000);
}

export function calcLagna(jd: number, lat: number, lng: number): number {
  const ramc = mod360(gst(jd) + lng);
  const eps = obliquity(jd);
  const y_m = Math.cos(ramc*DEG);
  const x_m = -Math.sin(ramc*DEG)*Math.cos(eps*DEG) - Math.tan(lat*DEG)*Math.sin(eps*DEG);
  let asc = Math.atan2(y_m, x_m) * RAD;
  return mod360(mod360(asc) - lahiriAyanamsa(jd));
}

export function sunriseSunset(year: number, month: number, day: number, lat: number, lng: number, tz: number): {sr: number; ss: number} {
  const jd = toJD(new Date(Date.UTC(year, month-1, day, 12)));
  const T  = (jd-2451545)/36525;
  const L0 = mod360(280.46646+36000.76983*T);
  const M  = mod360(357.52911+35999.05029*T);
  const C  = (1.914602-0.004817*T)*Math.sin(M*DEG)+0.019993*Math.sin(2*M*DEG);
  const sl = L0+C;
  const eps = obliquity(jd);
  const dec = Math.asin(Math.sin(eps*DEG)*Math.sin(sl*DEG))*RAD;
  const y2  = Math.tan((eps/2)*DEG)**2;
  const eqt = 4*RAD*(y2*Math.sin(2*L0*DEG)-2*0.016708*Math.sin(M*DEG)+4*0.016708*y2*Math.sin(M*DEG)*Math.cos(2*L0*DEG)-0.5*y2*y2*Math.sin(4*L0*DEG));
  const noon = 12 - eqt/60 - (lng - Math.round(lng/15)*15)/15 + tz;
  const cosH = (Math.cos(90.833*DEG)-Math.sin(lat*DEG)*Math.sin(dec*DEG))/(Math.cos(lat*DEG)*Math.cos(dec*DEG));
  if (cosH < -1) return { sr: 0, ss: 24 };
  if (cosH >  1) return { sr: 12, ss: 12 };
  const H = Math.acos(cosH)*RAD;
  return { sr: noon - H/15, ss: noon + H/15 };
}

// ── Panchanga result type ─────────────────────────────────────
export interface LivePanchanga {
  jd: number;
  // Tithi
  tithi: number; tithiName: string; paksha: string; tithiScore: number;
  // Nakshatra
  nak: number; nakName: string; nakLord: string; nakLordEN: string; pada: number; nakScore: number;
  // Yoga
  yoga: number; yogaName: string; yogaGood: boolean; yogaBad: boolean;
  // Karana
  karana: number; karanaName: string;
  // Vara
  vara: number; varaName: string; varaScore: number;
  // Lagna
  lagna: number; lagnaRashi: string; lagnaRashiIdx: number; lagnaLord: string; lagnaScore: number;
  // Hora
  horaTE: string; horaEN: string; horaScore: number;
  // Kaksha
  kaksha: string; kakshaOk: boolean; kakshaScore: number;
  // Raw positions
  sunSid: number; moonSid: number;
  // Sunrise/sunset (local hours)
  sunrise: number; sunset: number;
  // Rahu kala
  rahuStart: Date; rahuEnd: Date; inRahu: boolean;
  // Combined score
  totalScore: number; grade: string;
}

const KARANA_NAMES_TE = ['బవ','బాలవ','కౌలవ','తైతిల','గర','వణిజ','విష్టి','శకుని','చతుష్పాద','నాగ','కింస్తుఘ్న'];
const RASHI_LORD_TE   = ['కుజ','శుక్ర','బుధ','చంద్ర','సూర్య','బుధ','శుక్ర','కుజ','గురు','శని','శని','గురు'];
const HORA_SCORE_MAP: Record<string,number> = {Sun:5,Venus:9,Mercury:7,Moon:6,Saturn:3,Jupiter:10,Mars:2};
const LAGNA_SCORE_MAP = [6,8,7,5,5,7,8,6,10,3,3,10];

const DAY_KAKSHA_IDX: Record<number,string[]> = {
  0:['ఉద్వేగ','సుఖ','లాభ','అమృత','కాల','శుభ','రోగ','ఉద్వేగ'],
  1:['అమృత','కాల','శుభ','రోగ','ఉద్వేగ','సుఖ','లాభ','అమృత'],
  2:['రోగ','ఉద్వేగ','సుఖ','లాభ','అమృత','కాల','శుభ','రోగ'],
  3:['లాభ','అమృత','కాల','శుభ','రోగ','ఉద్వేగ','సుఖ','లాభ'],
  4:['శుభ','రోగ','ఉద్వేగ','సుఖ','లాభ','అమృత','కాల','శుభ'],
  5:['సుఖ','లాభ','అమృత','కాల','శుభ','రోగ','ఉద్వేగ','సుఖ'],
  6:['కాల','శుభ','రోగ','ఉద్వేగ','సుఖ','లాభ','అమృత','కాల'],
};
const KAKSHA_SCORE_MAP: Record<string,number> = {అమృత:10,లాభ:9,శుభ:7,సుఖ:5,ఉద్వేగ:3,రోగ:2,కాల:1};
const KAKSHA_OK: Record<string,boolean> = {అమృత:true,లాభ:true,శుభ:true,సుఖ:true,ఉద్వేగ:false,రోగ:false,కాల:false};

export function getLivePanchanga(date: Date, lat: number, lng: number, tz: number = 5.5): LivePanchanga {
  const jd = toJD(date);
  const st = sidLon(sunLon(jd), jd);
  const mt = sidLon(moonLon(jd), jd);
  const diff = mod360(mt - st);

  // Tithi
  const tithiIdx = Math.floor(diff/12);
  const tScore = TITHI_SCORE[tithiIdx] || 3;

  // Nakshatra
  const nakIdx  = Math.floor(mt/(40/3)) % 27;
  const pada    = Math.floor((mt % (40/3))/(10/3)) + 1;
  const nScore  = NAK_SCORE[nakIdx] || 3;

  // Yoga
  const yogaIdx = Math.floor(mod360(st+mt)/(40/3)) % 27;

  // Karana
  const karanaRaw = Math.floor(diff/6);
  let karanaIdx: number;
  if (karanaRaw === 0) karanaIdx = 10;
  else if (karanaRaw >= 57) karanaIdx = 57 - karanaRaw + 7;
  else karanaIdx = ((karanaRaw-1) % 7);

  // Calculate Sunrise for today
  const { sr, ss } = sunriseSunset(date.getFullYear(), date.getMonth()+1, date.getDate(), lat, lng, tz);
  let srMs = (() => { const b = new Date(date); b.setHours(0,0,0,0); return b.getTime() + sr*3600000; })();
  const ssMs = (() => { const b = new Date(date); b.setHours(0,0,0,0); return b.getTime() + ss*3600000; })();
  const nowMs = date.getTime();

  // In Vedic astrology, the day (Vara) changes at Sunrise, not at midnight.
  let localDay = date.getDay();
  let currentSrMs = srMs;
  if (nowMs < srMs) {
    localDay = (localDay + 6) % 7; // It's still previous day's Vaaram before sunrise
    // Fix: Use the PREVIOUS day's sunrise for calculations!
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevSr = getSunrise(lat, lng, prevDate);
    srMs = prevSr.getTime();
  }

  // Vara
  const varaIdx = localDay;
  const vScore  = VARA_SCORE[varaIdx] || 3;

  // Lagna
  const lagna    = calcLagna(jd, lat, lng);
  const lagnaIdx = Math.floor(lagna/30) % 12;
  const lScore   = LAGNA_SCORE_MAP[lagnaIdx] || 5;

  // Hora
  const dayDurMs = ssMs - srMs;
  const horaDurMs = dayDurMs / 12;
  const startIdx = HORA_START[localDay];
  
  let horaIdxInDay = Math.floor((nowMs - srMs) / horaDurMs);
  if (horaIdxInDay < 0) {
    // If before sunrise, it's night time of previous day
    // Night is divided into 12 horas from sunset to next sunrise
    // A simplified approach is just fallback to 0 or calculate properly.
    // For now we bound it.
    horaIdxInDay = 0; 
  }
  if (horaIdxInDay >= 12) horaIdxInDay = 11;
  
  const horaEN = HORA_EN[(startIdx + horaIdxInDay) % 7];
  const horaTE = HORA_TE[(startIdx + horaIdxInDay) % 7];
  const hScore = HORA_SCORE_MAP[horaEN] || 5;

  // Kaksha (90-min slots from sunrise)
  const minsFromSr = (nowMs - srMs) / 60000;
  const kakshaSlotIdx = Math.max(0, Math.min(7, Math.floor(minsFromSr / 90)));
  const kaksha = DAY_KAKSHA_IDX[localDay]?.[kakshaSlotIdx] || 'సుఖ';
  const kScore = KAKSHA_SCORE_MAP[kaksha] || 5;
  const kOk    = KAKSHA_OK[kaksha] !== false;

  // Rahu Kala
  const slotDurMs = dayDurMs / 8;
  const rSlot = RAHU_SLOT[localDay] - 1;
  const rahuStart = new Date(srMs + rSlot * slotDurMs);
  const rahuEnd   = new Date(srMs + (rSlot+1) * slotDurMs);
  const inRahu    = nowMs >= rahuStart.getTime() && nowMs < rahuEnd.getTime();

  // Combined score (out of 10)
  const rawTotal = tScore + vScore + nScore + (YOGA_GOOD.has(yogaIdx) ? 5 : YOGA_BAD.has(yogaIdx) ? 0 : 3) + hScore/2 + lScore/2;
  const maxRaw = 5+5+5+5+5+5;
  const totalScore = parseFloat(((rawTotal/maxRaw)*10).toFixed(1));
  const inRahuPenalty = inRahu ? -1.5 : 0;
  const finalScore = Math.max(0, Math.min(10, totalScore + inRahuPenalty));
  const grade = finalScore >= 8 ? '🟢 అత్యుత్తమం' : finalScore >= 6 ? '🔵 శుభం' : finalScore >= 4 ? '🟡 తటస్థం' : '🔴 ప్రతికూలం';

  return {
    jd,
    tithi: tithiIdx+1, tithiName: TITHI_TE[tithiIdx], paksha: tithiIdx < 15 ? 'శుక్ల' : 'కృష్ణ', tithiScore: tScore,
    nak: nakIdx+1, nakName: NAK_TE[nakIdx], nakLord: NAK_LORD_TE[nakIdx], nakLordEN: HORA_EN[['కేతు','శుక్ర','సూర్య','చంద్ర','కుజ','రాహు','గురు','శని','బుధ'].indexOf(NAK_LORD_TE[nakIdx]) >= 0 ? [7,5,0,3,6,3,2,4,2][['కేతు','శుక్ర','సూర్య','చంద్ర','కుజ','రాహు','గురు','శని','బుధ'].indexOf(NAK_LORD_TE[nakIdx])] : 0], pada, nakScore: nScore,
    yoga: yogaIdx+1, yogaName: YOGA_TE[yogaIdx], yogaGood: YOGA_GOOD.has(yogaIdx), yogaBad: YOGA_BAD.has(yogaIdx),
    karana: karanaIdx+1, karanaName: KARANA_NAMES_TE[Math.min(karanaIdx, KARANA_NAMES_TE.length-1)],
    vara: varaIdx, varaName: VARA_TE[varaIdx], varaScore: vScore,
    lagna, lagnaRashi: RASHI_TE[lagnaIdx], lagnaRashiIdx: lagnaIdx, lagnaLord: RASHI_LORD_TE[lagnaIdx], lagnaScore: lScore,
    horaTE, horaEN, horaScore: hScore,
    kaksha, kakshaOk: kOk, kakshaScore: kScore,
    sunSid: st, moonSid: mt,
    sunrise: sr, sunset: ss,
    rahuStart, rahuEnd, inRahu,
    totalScore: parseFloat(finalScore.toFixed(1)), grade,
  };
}

/** Get panchanga for a specific date+time string "YYYY-MM-DD" + "HH:MM" (local IST time) */
export function getPanchangaForDateTime(dateStr: string, timeStr: string, lat: number, lng: number, tz = 5.5): LivePanchanga {
  const [y,m,d] = dateStr.split('-').map(Number);
  const [h,mi]  = timeStr.split(':').map(Number);
  // local IST time => UTC: subtract tz offset
  const utcMs = Date.UTC(y, m-1, d, h, mi, 0) - Math.round(tz * 3600000);
  const dt = new Date(utcMs);
  return getLivePanchanga(dt, lat, lng, tz);
}
