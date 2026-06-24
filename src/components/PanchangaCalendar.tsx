import { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, Star, Sun, MapPin, Zap, TrendingUp } from 'lucide-react';

// ── Astronomical constants ──────────────────────────────────
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const mod360 = (x: number) => ((x % 360) + 360) % 360;

// ── Data Tables ─────────────────────────────────────────────
const NAK_TE = ['అశ్విని','భరణి','కృత్తిక','రోహిణి','మృగశిర','ఆర్ద్ర','పునర్వసు','పుష్యమి','ఆశ్లేష','మఖ','పూర్వఫల్గుణి','ఉత్తరఫల్గుణి','హస్త','చిత్త','స్వాతి','విశాఖ','అనూరాధ','జ్యేష్ఠ','మూల','పూర్వాషాఢ','ఉత్తరాషాఢ','శ్రవణ','ధనిష్ఠ','శతభిష','పూర్వభాద్ర','ఉత్తరభాద్ర','రేవతి'];
const NAK_LORD_TE = ['కేతు','శుక్ర','సూర్య','చంద్ర','కుజ','రాహు','గురు','శని','బుధ','కేతు','శుక్ర','సూర్య','చంద్ర','కుజ','రాహు','గురు','శని','బుధ','కేతు','శుక్ర','సూర్య','చంద్ర','కుజ','రాహు','గురు','శని','బుధ'];
const NAK_LORD_EN = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury','Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const RASHI_TE = ['మేష','వృష','మిథున','కర్కాటక','సింహ','కన్య','తుల','వృశ్చిక','ధనుస్సు','మకర','కుంభ','మీన'];
const TITHI_TE = ['పాడ్యమి','విదియ','తదియ','చవితి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','పౌర్ణమి','పాడ్యమి','విదియ','తదియ','చవితి','పంచమి','షష్ఠి','సప్తమి','అష్టమి','నవమి','దశమి','ఏకాదశి','ద్వాదశి','త్రయోదశి','చతుర్దశి','అమావాస్య'];
const YOGA_TE = ['విష్కంభ','ప్రీతి','ఆయుష్మాన్','సౌభాగ్య','శోభన','అతిగండ','సుకర్మా','ధృతి','శూల','గండ','వృద్ధి','ధ్రువ','వ్యాఘాత','హర్షణ','వజ్ర','సిద్ధి','వ్యతీపాత','వరీయాన్','పరిఘ','శివ','సిద్ధ','సాధ్య','శుభ','శుక్ల','బ్రహ్మ','ఐంద్ర','వైధృతి'];
const VARA_TE = ['ఆదివారం','సోమవారం','మంగళవారం','బుధవారం','గురువారం','శుక్రవారం','శనివారం'];
const HORA_TE = ['సూర్య','శుక్ర','బుధ','చంద్ర','శని','గురు','కుజ'];
const HORA_EN = ['Sun','Venus','Mercury','Moon','Saturn','Jupiter','Mars'];
// Hora start index for each weekday (0=Sun..6=Sat)
const HORA_START = [0,3,6,2,5,1,4]; // Sun->Sun,Mon->Moon,Tue->Mars,Wed->Merc,Thu->Jup,Fri->Ven,Sat->Sat
// Rahu Kala slot (1-8) by weekday
const RAHU_SLOT   = [8,2,7,5,6,4,3];
const YAMA_SLOT   = [5,1,6,4,3,2,7];
const GULIKA_SLOT = [3,6,5,7,4,2,1];

// Auspicious / inauspicious yogas (tithi×vara combinations, 0-indexed)
// Score contribution for the "best time" analysis
const TITHI_SCORE = [4,3,5,3,5,3,4,2,3,5,5,4,3,2,5,4,3,5,3,5,3,4,2,3,5,5,4,3,2,1];
const VARA_SCORE  = [4,4,5,5,5,5,3]; // Sun Mon Tue Wed Thu Fri Sat
const NAK_SCORE   = [5,2,4,5,3,2,5,5,2,4,4,5,5,5,5,4,5,3,3,4,5,5,4,2,4,5,5];
const YOGA_GOOD   = new Set([1,3,5,11,13,15,21,23,24,25]); // 0-indexed Vishkambha etc
const YOGA_BAD    = new Set([5,8,12,16,18,26]); // Atiganda, Shula, Vyaghata, Vyatipata, Parigha, Vaidhrti

// ── Core Astronomy ───────────────────────────────────────────
function toJD(date: Date): number {
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours()/24 + date.getUTCMinutes()/1440 + date.getUTCSeconds()/86400;
  const a = Math.floor((14-m)/12), Y = y+4800-a, M = m+12*a-3;
  return d + Math.floor((153*M+2)/5) + 365*Y + Math.floor(Y/4) - Math.floor(Y/100) + Math.floor(Y/400) - 32045;
}

function lahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545) / 36525;
  return 23.85 + T * 0.013969;
}

function sunLon(jd: number): number {
  const T = (jd-2451545)/36525;
  const L0 = mod360(280.46646+36000.76983*T);
  const M  = mod360(357.52911+35999.05029*T);
  const C  = (1.914602-0.004817*T)*Math.sin(M*DEG)+(0.019993-0.000101*T)*Math.sin(2*M*DEG)+0.000289*Math.sin(3*M*DEG);
  const om = mod360(125.04-1934.136*T);
  return mod360(L0+C-0.00569-0.00478*Math.sin(om*DEG));
}

function moonLon(jd: number): number {
  const T = (jd-2451545)/36525;
  const L_ = mod360(218.3164477+481267.88123421*T-0.0015786*T*T);
  const D  = mod360(297.8501921+445267.1114034*T-0.0018819*T*T);
  const M  = mod360(357.5291092+35999.0502909*T-0.0001536*T*T);
  const M_ = mod360(134.9633964+477198.8675055*T+0.0087414*T*T);
  const F  = mod360(93.2720950+483202.0175233*T-0.0036539*T*T);
  let lon = 0;
  lon += 6.288774*Math.sin(M_*DEG);
  lon += 1.274027*Math.sin((2*D-M_)*DEG);
  lon += 0.658314*Math.sin(2*D*DEG);
  lon += 0.213618*Math.sin(2*M_*DEG);
  lon -= 0.185116*Math.sin(M*DEG);
  lon -= 0.114332*Math.sin(2*F*DEG);
  lon += 0.058793*Math.sin((2*D-2*M_)*DEG);
  lon += 0.057066*Math.sin((2*D-M-M_)*DEG);
  lon += 0.053322*Math.sin((2*D+M_)*DEG);
  lon += 0.045758*Math.sin((2*D-M)*DEG);
  lon -= 0.040923*Math.sin((M-M_)*DEG);
  lon -= 0.034720*Math.sin(D*DEG);
  lon -= 0.030383*Math.sin((M+M_)*DEG);
  lon += 0.015327*Math.sin((2*D-2*F)*DEG);
  lon += 0.010675*Math.sin((4*D-M_)*DEG);
  lon += 0.010034*Math.sin(3*M_*DEG);
  lon -= 0.007888*Math.sin((2*D+M-M_)*DEG);
  lon -= 0.006766*Math.sin((2*D+M)*DEG);
  lon += 0.005765*Math.sin((M-M_-D)*DEG);
  lon += 0.005228*Math.sin((4*D-M-M_)*DEG);
  lon += 0.004987*Math.sin((2*D+M+M_)*DEG);
  return mod360(L_ + lon);
}

function sidLon(tropical: number, jd: number): number { return mod360(tropical - lahiriAyanamsa(jd)); }

function obliquity(jd: number): number {
  const T = (jd-2451545)/36525;
  return 23.439291 - 0.013004*T - 0.000000164*T*T + 0.000000504*T*T*T;
}

function gst(jd: number): number {
  const T = (jd-2451545)/36525;
  return mod360(280.46061837 + 360.98564736629*(jd-2451545) + 0.000387933*T*T - T*T*T/38710000);
}

function calcLagna(jd: number, lat: number, lng: number): number {
  const ramc = mod360(gst(jd) + lng); // LST in degrees
  const eps = obliquity(jd);
  const x = -Math.cos(ramc*DEG);
  const y = Math.sin(ramc*DEG)*Math.cos(eps*DEG) + Math.tan(lat*DEG)*Math.sin(eps*DEG);
  let asc = Math.atan2(x, y)*RAD;
  asc = mod360(asc);
  // Quadrant fix
  if (Math.abs(mod360(asc - ramc + 180) - 180) > 90) asc = mod360(asc + 180);
  return mod360(asc - lahiriAyanamsa(jd));
}

// Sunrise/Sunset → local hours (tzOffset = IST +5.5 etc.)
function sunriseSunset(year: number, month: number, day: number, lat: number, lng: number, tz: number): {sr: number; ss: number} {
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

// ── Panchanga for a given JS Date ────────────────────────────
interface Panchanga {
  jd: number;
  tithi: number; tithiName: string; paksha: string;
  nak: number; nakName: string; nakLord: string; nakLordEN: string; pada: number;
  yoga: number; yogaName: string; yogaGood: boolean; yogaBad: boolean;
  karana: number; karanaName: string;
  vara: number; varaName: string;
  lagna: number; lagnaRashi: string;
  sunSid: number; moonSid: number;
}

const KARANA_NAMES_TE = ['బవ','బాలవ','కౌలవ','తైతిల','గర','వణిజ','విష్టి','శకుని','చతుష్పాద','నాగ','కింస్తుఘ్న'];

function getPanchanga(date: Date, lat: number, lng: number): Panchanga {
  const jd = toJD(date);
  const st = sidLon(sunLon(jd), jd);
  const mt = sidLon(moonLon(jd), jd);
  const diff = mod360(mt - st);
  const tithiIdx = Math.floor(diff/12);
  const nakIdx   = Math.floor(mt/(40/3)) % 27;
  const pada     = Math.floor((mt % (40/3))/(10/3)) + 1;
  const yogaIdx  = Math.floor(mod360(st+mt)/(40/3)) % 27;
  const karanaRaw = Math.floor(diff/6);
  let karanaIdx: number;
  if (karanaRaw === 0) karanaIdx = 10; // Kimstughna
  else if (karanaRaw >= 57) karanaIdx = 57 - karanaRaw + 7; // fixed last 4
  else karanaIdx = ((karanaRaw-1) % 7);
  const lagna = calcLagna(jd, lat, lng);
  const lagnaIdx = Math.floor(lagna/30) % 12;
  const varaIdx  = Math.floor(jd+1.5) % 7; // 0=Sun

  return {
    jd,
    tithi: tithiIdx+1, tithiName: TITHI_TE[tithiIdx], paksha: tithiIdx < 15 ? 'శుక్ల పక్షం' : 'కృష్ణ పక్షం',
    nak: nakIdx+1, nakName: NAK_TE[nakIdx], nakLord: NAK_LORD_TE[nakIdx], nakLordEN: NAK_LORD_EN[nakIdx], pada,
    yoga: yogaIdx+1, yogaName: YOGA_TE[yogaIdx], yogaGood: YOGA_GOOD.has(yogaIdx), yogaBad: YOGA_BAD.has(yogaIdx),
    karana: karanaIdx+1, karanaName: KARANA_NAMES_TE[Math.min(karanaIdx, KARANA_NAMES_TE.length-1)],
    vara: varaIdx, varaName: VARA_TE[varaIdx],
    lagna, lagnaRashi: RASHI_TE[lagnaIdx],
    sunSid: st, moonSid: mt,
  };
}

// Binary-search for next nakshatra change (returns Date or null)
function nextNakChange(fromDate: Date, lat: number, lng: number): Date {
  // Moon moves ~13.2°/day; each nak = 13.333° → approx 1.01 days per nak
  const jd0 = toJD(fromDate);
  const mt0  = sidLon(moonLon(jd0), jd0);
  const nak0 = Math.floor(mt0/(40/3)) % 27;
  // Boundary for next nak
  const nextBound = ((nak0+1) * (40/3));
  // Estimate: moon speed ~0.549°/hour
  const moonSpeed = 0.549; // deg/hr approx
  const hoursNeeded = (mod360(nextBound - mt0)) / moonSpeed;
  // Binary search ±1 hour around estimate
  let loJD = jd0 + (hoursNeeded - 1)/24;
  let hiJD = jd0 + (hoursNeeded + 2)/24;
  for (let i = 0; i < 40; i++) {
    const midJD = (loJD + hiJD) / 2;
    const mt = sidLon(moonLon(midJD), midJD);
    const nak = Math.floor(mt/(40/3)) % 27;
    if (nak === nak0) loJD = midJD; else hiJD = midJD;
    if ((hiJD - loJD) * 86400 < 1) break;
  }
  const midJD = (loJD + hiJD) / 2;
  return new Date((midJD - 2440587.5) * 86400000);
}

// Next Tithi change
function nextTithiChange(fromDate: Date): Date {
  const jd0 = toJD(fromDate);
  const st0  = sidLon(sunLon(jd0), jd0);
  const mt0  = sidLon(moonLon(jd0), jd0);
  const diff0 = mod360(mt0 - st0);
  const tithi0 = Math.floor(diff0/12);
  const nextBound = (tithi0+1)*12;
  const moonSpeed = 0.549 - 0.041; // moon - sun speed deg/hr approx
  const hoursNeeded = mod360(nextBound - diff0) / moonSpeed;
  let loJD = jd0 + (hoursNeeded - 1)/24;
  let hiJD = jd0 + (hoursNeeded + 2)/24;
  for (let i = 0; i < 40; i++) {
    const midJD = (loJD + hiJD) / 2;
    const diff = mod360(sidLon(moonLon(midJD), midJD) - sidLon(sunLon(midJD), midJD));
    if (Math.floor(diff/12) === tithi0) loJD = midJD; else hiJD = midJD;
    if ((hiJD - loJD) * 86400 < 1) break;
  }
  return new Date(((loJD+hiJD)/2 - 2440587.5) * 86400000);
}

// Hora schedule for a day
interface HoraSlot {
  idx: number; planet: string; planetEN: string;
  start: Date; end: Date; isNow: boolean;
  score: number;
}

function calcHoras(date: Date, lat: number, lng: number, tz: number): HoraSlot[] {
  const y = date.getFullYear(), m = date.getMonth()+1, d = date.getDate();
  const { sr, ss } = sunriseSunset(y, m, d, lat, lng, tz);
  const { sr: srNext } = sunriseSunset(y, m, d+1, lat, lng, tz);
  const dayMin  = (ss - sr) * 60;
  const nightMin = (srNext - ss + 24) * 60;
  const dayHora  = dayMin / 12;
  const nightHora = nightMin / 12;
  const varaIdx  = Math.floor(toJD(date)+1.5) % 7;
  const startIdx = HORA_START[varaIdx];
  const now = date;
  const slots: HoraSlot[] = [];
  const baseDate = new Date(date); baseDate.setHours(0,0,0,0);
  const srMs = baseDate.getTime() + sr * 3600000;
  for (let i = 0; i < 12; i++) {
    const pIdx = (startIdx + i) % 7;
    const startMs = srMs + i * dayHora * 60000;
    const endMs   = startMs + dayHora * 60000;
    const score = horaPlanetScore(HORA_EN[pIdx]);
    slots.push({ idx: i, planet: HORA_TE[pIdx], planetEN: HORA_EN[pIdx], start: new Date(startMs), end: new Date(endMs), isNow: now >= new Date(startMs) && now < new Date(endMs), score });
  }
  const ssMs = baseDate.getTime() + ss * 3600000;
  let nightStartIdx = (startIdx + 12) % 7;
  for (let i = 0; i < 12; i++) {
    const pIdx = (nightStartIdx + i) % 7;
    const startMs = ssMs + i * nightHora * 60000;
    const endMs   = startMs + nightHora * 60000;
    const score = horaPlanetScore(HORA_EN[pIdx]);
    slots.push({ idx: 12+i, planet: HORA_TE[pIdx], planetEN: HORA_EN[pIdx], start: new Date(startMs), end: new Date(endMs), isNow: now >= new Date(startMs) && now < new Date(endMs), score });
  }
  return slots;
}

function horaPlanetScore(planet: string): number {
  const scores: Record<string,number> = { Jupiter: 5, Venus: 5, Mercury: 4, Moon: 4, Sun: 3, Mars: 2, Saturn: 1 };
  return scores[planet] || 3;
}

// Rahu Kala, Yama, Gulika
interface SpecialTime { name: string; start: Date; end: Date; type: 'bad'|'neutral' }
function calcSpecialTimes(date: Date, lat: number, lng: number, tz: number): SpecialTime[] {
  const y = date.getFullYear(), m = date.getMonth()+1, d = date.getDate();
  const { sr, ss } = sunriseSunset(y, m, d, lat, lng, tz);
  const dayMs = (ss - sr) * 3600000;
  const slot  = dayMs / 8;
  const base  = new Date(date); base.setHours(0,0,0,0);
  const srMs  = base.getTime() + sr * 3600000;
  const varaIdx = Math.floor(toJD(date)+1.5) % 7;
  const rSlot  = RAHU_SLOT[varaIdx] - 1;
  const ySlot  = YAMA_SLOT[varaIdx] - 1;
  const gSlot  = GULIKA_SLOT[varaIdx] - 1;
  return [
    { name: 'రాహుకాలం', start: new Date(srMs + rSlot*slot), end: new Date(srMs + (rSlot+1)*slot), type: 'bad' },
    { name: 'యమగండం',  start: new Date(srMs + ySlot*slot), end: new Date(srMs + (ySlot+1)*slot), type: 'bad' },
    { name: 'గులిక',   start: new Date(srMs + gSlot*slot), end: new Date(srMs + (gSlot+1)*slot), type: 'neutral' },
  ];
}

// Lagna changes throughout the day — always compute, not lazy
function calcLagnaChanges(date: Date, lat: number, lng: number): {time: Date; rashi: string; deg: number; rashiIdx: number}[] {
  const base = new Date(date); base.setHours(0,0,0,0);
  const changes: {time: Date; rashi: string; deg: number; rashiIdx: number}[] = [];
  let prevRashi = -1;
  for (let min = 0; min <= 1440; min += 1) {
    const t = new Date(base.getTime() + min * 60000);
    const l = calcLagna(toJD(t), lat, lng);
    const r = Math.floor(l/30) % 12;
    if (r !== prevRashi) {
      changes.push({ time: t, rashi: RASHI_TE[r], deg: l, rashiIdx: r });
      prevRashi = r;
    }
  }
  return changes;
}

// Combined score for best time
function calcBestScore(p: Panchanga, hora: HoraSlot, specialTimes: SpecialTime[], checkTime: Date): {score: number; grade: string; reasons: string[]} {
  let score = 0;
  const reasons: string[] = [];
  // Tithi
  const ts = TITHI_SCORE[p.tithi-1] || 3;
  score += ts;
  if (ts >= 5) reasons.push(`✅ శుభ తిథి: ${p.tithiName}`);
  else if (ts <= 2) reasons.push(`❌ తిథి బలహీనం: ${p.tithiName}`);
  // Vara
  const vs = VARA_SCORE[p.vara] || 3;
  score += vs;
  if (vs >= 5) reasons.push(`✅ శుభ వారం: ${p.varaName}`);
  else if (vs <= 2) reasons.push(`❌ వారం ప్రతికూలం: ${p.varaName}`);
  // Nakshatra
  const ns = NAK_SCORE[p.nak-1] || 3;
  score += ns;
  if (ns >= 5) reasons.push(`✅ శుభ నక్షత్రం: ${p.nakName}`);
  else if (ns <= 2) reasons.push(`❌ నక్షత్రం ప్రతికూలం: ${p.nakName}`);
  // Yoga
  if (p.yogaGood) { score += 5; reasons.push(`✅ శుభ యోగం: ${p.yogaName}`); }
  else if (p.yogaBad) { score -= 3; reasons.push(`❌ అశుభ యోగం: ${p.yogaName}`); }
  else score += 3;
  // Hora
  score += hora.score;
  if (hora.score >= 5) reasons.push(`✅ శుభ హోరా: ${hora.planet} (${hora.planetEN})`);
  else if (hora.score <= 2) reasons.push(`⚠️ అశుభ హోరా: ${hora.planet}`);
  // Rahu Kala penalty
  const inRahu = specialTimes.some(st => st.name === 'రాహుకాలం' && checkTime >= st.start && checkTime < st.end);
  const inYama = specialTimes.some(st => st.name === 'యమగండం'  && checkTime >= st.start && checkTime < st.end);
  if (inRahu) { score -= 5; reasons.push('❌ రాహుకాలం — avoid!'); }
  if (inYama) { score -= 3; reasons.push('⚠️ యమగండం — caution'); }
  const maxScore = 25;
  const pct = Math.max(0, Math.min(100, Math.round((score/maxScore)*100)));
  const grade = pct >= 80 ? '🟢 అత్యుత్తమం' : pct >= 65 ? '🔵 మంచిది' : pct >= 45 ? '🟡 తటస్థం' : '🔴 ప్రతికూలం';
  return { score, grade, reasons };
}

// Find best hora windows for the day
function findBestWindows(date: Date, lat: number, lng: number, tz: number, p: Panchanga) {
  const horas = calcHoras(date, lat, lng, tz);
  const special = calcSpecialTimes(date, lat, lng, tz);
  return horas
    .map(h => ({ ...h, ...calcBestScore(p, h, special, h.start) }))
    .sort((a,b) => b.score - a.score)
    .slice(0, 5);
}

// Duration between two dates
function fmtDuration(from: Date, to: Date): string {
  const diff = Math.abs(to.getTime() - from.getTime());
  const h = Math.floor(diff/3600000);
  const m = Math.floor((diff%3600000)/60000);
  return h > 0 ? `${h}గం ${m}ని` : `${m}ని`;
}

// ── Main Component ────────────────────────────────────────────
export default function PanchangaCalendar() {
  const [location, setLocation] = useState({ lat: 17.3850, lng: 78.4867, name: 'హైదరాబాద్', tz: 5.5 });
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  });
  const [now, setNow] = useState(new Date());
  const [tab, setTab] = useState<'today'|'hora'|'calendar'|'best'>('today');
  const [locInput, setLocInput] = useState({ lat: '17.3850', lng: '78.4867', name: 'హైదరాబాద్', tz: '5.5' });

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  const displayDate = useMemo(() => {
    const [y,m,d] = selectedDate.split('-').map(Number);
    return new Date(y, m-1, d, now.getHours(), now.getMinutes());
  }, [selectedDate, now]);

  const p = useMemo(() => getPanchanga(now, location.lat, location.lng), [now, location]);
  const pSelected = useMemo(() => getPanchanga(displayDate, location.lat, location.lng), [displayDate, location]);
  const nakChangeTime = useMemo(() => nextNakChange(now, location.lat, location.lng), [now, location]);
  const tithiChangeTime = useMemo(() => nextTithiChange(now), [now]);
  const horas = useMemo(() => calcHoras(displayDate, location.lat, location.lng, location.tz), [displayDate, location]);
  const specialTimes = useMemo(() => calcSpecialTimes(displayDate, location.lat, location.lng, location.tz), [displayDate, location]);
  const lagnaChanges = useMemo(() => calcLagnaChanges(displayDate, location.lat, location.lng), [displayDate, location]);
  const bestWindows = useMemo(() => findBestWindows(displayDate, location.lat, location.lng, location.tz, pSelected), [displayDate, location, pSelected]);
  const currentHora = horas.find(h => h.isNow) || horas[0];
  const { sr, ss } = useMemo(() => sunriseSunset(displayDate.getFullYear(), displayDate.getMonth()+1, displayDate.getDate(), location.lat, location.lng, location.tz), [displayDate, location]);
  const srDate = (() => { const d = new Date(displayDate); d.setHours(0,0,0,0); return new Date(d.getTime() + sr*3600000); })();
  const ssDate = (() => { const d = new Date(displayDate); d.setHours(0,0,0,0); return new Date(d.getTime() + ss*3600000); })();

  // Combination analysis
  const todayScore = useMemo(() => {
    const hora = currentHora || horas[0];
    if (!hora) return null;
    return calcBestScore(p, hora, specialTimes, now);
  }, [p, currentHora, horas, specialTimes, now]);

  // Monthly calendar data
  const [calYear, calMonth] = useMemo(() => {
    const [y,m] = selectedDate.split('-').map(Number); return [y, m];
  }, [selectedDate]);
  const calDays = useMemo(() => {
    const days: Array<{date: Date; p: Panchanga; score: number}> = [];
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calYear, calMonth-1, d, 12);
      const pg = getPanchanga(date, location.lat, location.lng);
      const ts = TITHI_SCORE[pg.tithi-1] + VARA_SCORE[pg.vara] + NAK_SCORE[pg.nak-1] + (pg.yogaGood ? 5 : pg.yogaBad ? 0 : 3);
      days.push({ date, p: pg, score: ts });
    }
    return days;
  }, [calYear, calMonth, location]);

  const applyLoc = () => {
    const lat = parseFloat(locInput.lat), lng = parseFloat(locInput.lng), tz = parseFloat(locInput.tz);
    if (!isNaN(lat) && !isNaN(lng) && !isNaN(tz)) setLocation({ lat, lng, tz, name: locInput.name });
  };

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 65 ? 'text-blue-400' : s >= 45 ? 'text-amber-400' : 'text-red-400';
  const scoreBg   = (s: number) => s >= 80 ? 'bg-emerald-500/10 border-emerald-500/30' : s >= 65 ? 'bg-blue-500/10 border-blue-500/30' : s >= 45 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30';

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-500/30 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-400"/>🪐 పంచాంగ-లగ్న-హోరా కేంద్రం
            </h2>
            <p className="text-xs text-slate-400 mt-1">Real-time • {location.name} • IST {location.tz}:00 • Lahiri Ayanamsa</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white">{now.toLocaleTimeString('te-IN', { hour:'2-digit', minute:'2-digit' })}</p>
            <p className="text-xs text-slate-400">{now.toLocaleDateString('te-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
          </div>
        </div>

        {/* Location Input */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
          <input value={locInput.name} onChange={e => setLocInput(p=>({...p,name:e.target.value}))} placeholder="ఊరు పేరు"
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white col-span-2 md:col-span-1 focus:outline-none focus:ring-1 focus:ring-amber-500/50" />
          <input value={locInput.lat} onChange={e => setLocInput(p=>({...p,lat:e.target.value}))} placeholder="Latitude"
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
          <input value={locInput.lng} onChange={e => setLocInput(p=>({...p,lng:e.target.value}))} placeholder="Longitude"
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
          <input value={locInput.tz} onChange={e => setLocInput(p=>({...p,tz:e.target.value}))} placeholder="TZ (5.5)"
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
          <button onClick={applyLoc} className="bg-amber-600 text-white rounded-xl px-3 py-2 text-xs font-bold hover:bg-amber-500 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3"/>Set
          </button>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
          <p className="text-xs text-slate-400">🌅 సూర్యోదయం: {srDate.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})} | 🌇 సూర్యాస్తమయం: {ssDate.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[{id:'today',label:'🪐 ఈరోజు పంచాంగం'},{id:'hora',label:'⏰ హోరా పట్టిక'},{id:'best',label:'🏆 Best Time'},{id:'calendar',label:'📅 నెల క్యాలెండర్'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab===t.id?'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]':'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TODAY TAB ═══ */}
      {tab==='today' && (
        <div className="space-y-4">
          {/* Panchanga 5 Elements */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              {label:'తిథి',val:p.tithiName,sub:p.paksha,color:'yellow'},
              {label:'నక్షత్రం',val:p.nakName,sub:`పాదం ${p.pada} | ${p.nakLord}`,color:'purple'},
              {label:'యోగం',val:p.yogaName,sub:p.yogaGood?'✅ శుభం':p.yogaBad?'❌ అశుభం':'⚖️ తటస్థం',color:p.yogaGood?'emerald':p.yogaBad?'red':'blue'},
              {label:'కరణం',val:p.karanaName,sub:`#${p.karana}`,color:'cyan'},
              {label:'వారం',val:p.varaName,sub:'',color:'orange'},
              {label:'లగ్నం',val:p.lagnaRashi,sub:`${(p.lagna%30).toFixed(1)}° | ${RASHI_TE[Math.floor(p.lagna/30)%12]}`,color:'rose'},
            ].map(item=>(
              <div key={item.label} className={`bg-slate-900 border border-${item.color}-500/30 rounded-xl p-3 text-center`}>
                <p className={`text-[10px] text-${item.color}-400 font-bold uppercase tracking-wider`}>{item.label}</p>
                <p className={`text-base font-black text-${item.color}-300 mt-1`}>{item.val}</p>
                {item.sub && <p className="text-[9px] text-slate-400 mt-0.5">{item.sub}</p>}
              </div>
            ))}
          </div>

          {/* Nakshatra Tracker */}
          <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 mb-3"><Star className="w-4 h-4"/>నక్షత్ర పరిశీలన</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">ప్రస్తుత నక్షత్రం</p>
                <p className="text-3xl font-black text-purple-300">{p.nakName}</p>
                <p className="text-xs text-slate-400">అధిపతి: <span className="text-yellow-300 font-bold">{p.nakLord}</span> | పాదం: <span className="text-white">{p.pada}</span></p>
                <p className="text-xs text-slate-400 mt-1">చంద్రుడు: <span className="text-blue-300">{p.moonSid.toFixed(2)}°</span> | రాశి: <span className="text-white">{RASHI_TE[Math.floor(p.moonSid/30)%12]}</span></p>
              </div>
              <div>
                <div className="bg-slate-900/60 rounded-xl p-3 mb-2">
                  <p className="text-[10px] text-slate-400">⏳ నక్షత్ర మార్పు సమయం</p>
                  <p className="text-xl font-black text-emerald-300">{nakChangeTime.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                  <p className="text-xs text-slate-400">{nakChangeTime.toLocaleDateString('te-IN')} | తర్వాత: <span className="text-yellow-300">{NAK_TE[(p.nak % 27)]}</span></p>
                  <p className="text-[10px] text-amber-400 mt-1">మారడానికి: {fmtDuration(now, nakChangeTime)}</p>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400">⏳ తిథి మార్పు సమయం</p>
                  <p className="text-lg font-black text-blue-300">{tithiChangeTime.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                  <p className="text-xs text-slate-400">తర్వాత తిథి: <span className="text-white">{TITHI_TE[p.tithi % 30]}</span> | మారడానికి: <span className="text-amber-400">{fmtDuration(now, tithiChangeTime)}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Combination Analysis */}
          <div className={`border rounded-2xl p-4 ${todayScore ? scoreBg(Math.round((todayScore.score/25)*100)) : 'border-slate-700'}`}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4"/>నక్షత్రం + వారం + తిథి కలయిక విశ్లేషణ</h3>
            {todayScore && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-4xl font-black ${scoreColor(Math.round((todayScore.score/25)*100))}`}>{Math.round((todayScore.score/25)*100)}%</span>
                    <div>
                      <p className="text-lg font-black">{todayScore.grade}</p>
                      <p className="text-xs text-slate-400">Raw: {todayScore.score}/25</p>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 rounded-xl p-3 space-y-1">
                    {todayScore.reasons.map((r,i)=><p key={i} className="text-xs text-slate-300">{r}</p>)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {label:'తిథి స్కోర్', val: TITHI_SCORE[p.tithi-1], max:5},
                    {label:'వారం స్కోర్', val: VARA_SCORE[p.vara], max:5},
                    {label:'నక్షత్ర స్కోర్', val: NAK_SCORE[p.nak-1], max:5},
                    {label:'యోగ స్కోర్', val: p.yogaGood?5:p.yogaBad?0:3, max:5},
                    {label:'హోరా స్కోర్', val: currentHora?.score||3, max:5},
                    {label:'లగ్నం', val: p.lagnaRashi, max:0},
                  ].map((s,i)=>(
                    <div key={i} className="bg-slate-900/60 rounded-xl p-2 text-center">
                      <p className="text-[9px] text-slate-400">{s.label}</p>
                      {s.max>0 ? (
                        <>
                          <p className="text-lg font-black text-white">{s.val}/{s.max}</p>
                          <div className="mt-1 bg-slate-800 rounded-full h-1">
                            <div className="h-1 rounded-full bg-amber-500" style={{width:`${(Number(s.val)/s.max)*100}%`}}/>
                          </div>
                        </>
                      ) : <p className="text-sm font-black text-yellow-300">{s.val}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Special Times */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {specialTimes.map(st=>{
              const isActive = now >= st.start && now < st.end;
              return (
                <div key={st.name} className={`border rounded-xl p-3 ${isActive?'border-red-500/50 bg-red-500/10':'border-slate-700 bg-slate-900/40'}`}>
                  <p className={`text-xs font-bold ${st.type==='bad'?'text-red-400':'text-amber-400'}`}>{st.type==='bad'?'⛔':'⚠️'} {st.name}</p>
                  <p className="text-sm font-black text-white">{st.start.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})} – {st.end.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                  {isActive && <p className="text-[10px] text-red-400 font-bold animate-pulse">▶ ఇప్పుడు జరుగుతోంది — avoid!</p>}
                </div>
              );
            })}
          </div>

          {/* Prominent Lagna Section */}
          {(() => {
            const now2 = now;
            const currentLagnaIdx = Math.floor(p.lagna/30)%12;
            const currentLagnaDeg = (p.lagna%30).toFixed(2);
            const currentLagnaPada = Math.floor((p.lagna%30)/(30/4))+1;
            // Find next lagna change
            const nextChange = lagnaChanges.find(lc => lc.time > now2);
            const prevChange = [...lagnaChanges].reverse().find(lc => lc.time <= now2);
            const RASHI_LORDS_TE = ['కుజ','శుక్ర','బుధ','చంద్ర','సూర్య','బుధ','శుక్ర','కుజ','గురు','శని','శని','గురు'];
            const RASHI_ELEMENTS = ['అగ్ని 🔥','భూమి 🌍','వాయువు 💨','జలం 💧','అగ్ని 🔥','భూమి 🌍','వాయువు 💨','జలం 💧','అగ్ని 🔥','భూమి 🌍','వాయువు 💨','జలం 💧'];
            return (
              <div className="bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-500/30 rounded-2xl p-4">
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-3">⬆ లగ్న పరిశీలన (Ascendant)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Current Lagna Block */}
                  <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-rose-500/20">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">ఇప్పటి లగ్నం</p>
                    <p className="text-4xl font-black text-rose-300">{RASHI_TE[currentLagnaIdx]}</p>
                    <p className="text-sm font-bold text-white mt-1">{currentLagnaDeg}° | పాదం {currentLagnaPada}</p>
                    <p className="text-xs text-slate-400 mt-1">అధిపతి: <span className="text-yellow-300 font-bold">{RASHI_LORDS_TE[currentLagnaIdx]}</span></p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{RASHI_ELEMENTS[currentLagnaIdx]}</p>
                    <div className="mt-2 bg-slate-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-rose-500" style={{width:`${((p.lagna%30)/30)*100}%`}}/>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-0.5">{currentLagnaDeg}° / 30°</p>
                  </div>
                  {/* Next Change Block */}
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">⏳ తర్వాత లగ్న మార్పు</p>
                    {nextChange ? (
                      <>
                        <p className="text-2xl font-black text-emerald-300">{nextChange.time.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                        <p className="text-sm font-bold text-yellow-300 mt-1">→ {nextChange.rashi}</p>
                        <p className="text-xs text-slate-400 mt-1">అధిపతి: {RASHI_LORDS_TE[nextChange.rashiIdx]}</p>
                        <p className="text-[10px] text-amber-400 mt-2 font-bold">మారడానికి: {fmtDuration(now2, nextChange.time)}</p>
                      </>
                    ) : <p className="text-slate-500 text-xs">లెక్కిస్తున్నాం...</p>}
                    {prevChange && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <p className="text-[10px] text-slate-500">మారిన సమయం: {prevChange.time.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})} ({fmtDuration(prevChange.time, now2)} క్రితం)</p>
                      </div>
                    )}
                  </div>
                  {/* Today's Lagna Schedule */}
                  <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">📅 ఈరోజు లగ్న పట్టిక</p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {lagnaChanges.map((lc, i) => {
                        const isNow = lc.time <= now2 && (i === lagnaChanges.length-1 || lagnaChanges[i+1].time > now2);
                        const dur = i < lagnaChanges.length-1 ? fmtDuration(lc.time, lagnaChanges[i+1].time) : '';
                        return (
                          <div key={i} className={`flex items-center justify-between px-2 py-1 rounded-lg ${isNow ? 'bg-rose-500/20 border border-rose-500/40' : 'hover:bg-slate-800/40'}`}>
                            <div className="flex items-center gap-2">
                              {isNow && <span className="text-[8px] bg-rose-500 text-white px-1 rounded font-black">▶</span>}
                              <span className={`text-[10px] font-bold ${isNow ? 'text-rose-300' : 'text-slate-300'}`}>{lc.rashi}</span>
                              <span className="text-[9px] text-slate-600">{(lc.deg%30).toFixed(0)}°</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400">{lc.time.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}</span>
                              {dur && <span className="text-[8px] text-slate-600 ml-1">({dur})</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* ═══ HORA TAB ═══ */}
      {tab==='hora' && (
        <div className="space-y-3">
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2 mb-3"><Clock className="w-4 h-4"/>24-గంటల హోరా పట్టిక — {location.name}</h3>
            <div className="grid grid-cols-1 gap-1.5 max-h-[70vh] overflow-y-auto">
              {horas.map((h,i)=>{
                const inRahu = specialTimes.some(st=>st.name==='రాహుకాలం'&&h.start>=st.start&&h.start<st.end);
                const inYama = specialTimes.some(st=>st.name==='యమగండం'&&h.start>=st.start&&h.start<st.end);
                const bad = inRahu||inYama;
                return (
                  <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${h.isNow?'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/30':bad?'border-red-500/20 bg-red-500/5':'border-slate-800 bg-slate-900/40'}`}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-slate-800 text-slate-400 shrink-0">{i<12?'☀':'🌙'}{(i%12)+1}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${h.isNow?'text-amber-300':bad?'text-red-400':'text-slate-200'}`}>{h.planet} హోరా</span>
                        {h.isNow && <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-black">▶ LIVE</span>}
                        {inRahu && <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">రాహుకాలం</span>}
                        {inYama && <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded">యమగండం</span>}
                      </div>
                      <p className="text-[10px] text-slate-500">{h.start.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})} – {h.end.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s=><div key={s} className={`w-2 h-4 rounded-sm ${h.score>=s?bad?'bg-red-500':'bg-amber-500':'bg-slate-800'}`}/>)}
                    </div>
                    <span className={`text-xs font-black w-8 text-right ${h.score>=4?'text-emerald-400':h.score>=3?'text-amber-400':'text-red-400'}`}>{h.score}/5</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══ BEST TIME TAB ═══ */}
      {tab==='best' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-1"><Zap className="w-4 h-4"/>🏆 ఆ రోజు Best Time Windows</h3>
            <p className="text-xs text-slate-400 mb-3">తిథి + వారం + నక్షత్రం + యోగం + హోరా కలిపి score చేసిన Top 5 సమయాలు</p>
            {bestWindows.map((w,i)=>{
              const pct = Math.round((w.score/25)*100);
              return (
                <div key={i} className={`mb-3 border rounded-xl p-4 ${i===0?'border-yellow-500/40 bg-yellow-500/5':'border-slate-700 bg-slate-900/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-black ${i===0?'text-yellow-400':'text-slate-300'}`}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':'⭐'}#{i+1}</span>
                      <div>
                        <p className="text-sm font-black text-white">{w.planet} హోరా</p>
                        <p className="text-xs text-slate-400">{w.start.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})} – {w.end.toLocaleTimeString('te-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-black ${scoreColor(pct)}`}>{pct}%</p>
                      <p className="text-xs">{w.grade}</p>
                    </div>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-3 space-y-0.5">
                    {w.reasons.map((r,ri)=><p key={ri} className="text-[10px] text-slate-300">{r}</p>)}
                  </div>
                  <div className="mt-2 bg-slate-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${pct>=80?'bg-emerald-500':pct>=65?'bg-blue-500':pct>=45?'bg-amber-500':'bg-red-500'}`} style={{width:`${pct}%`}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Combination Table */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-purple-400 mb-3">📊 నక్షత్రం × వారం × తిథి → ఫలం పట్టిక</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400">అంశం</th>
                    <th className="text-left py-2 px-3 text-slate-400">విలువ</th>
                    <th className="text-center py-2 px-3 text-slate-400">స్కోర్</th>
                    <th className="text-left py-2 px-3 text-slate-400">ఫలం</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    {k:'తిథి',v:pSelected.tithiName,s:TITHI_SCORE[pSelected.tithi-1],f:TITHI_SCORE[pSelected.tithi-1]>=4?'శుభం ✅':TITHI_SCORE[pSelected.tithi-1]>=3?'తటస్థం ⚖️':'ప్రతికూలం ❌'},
                    {k:'వారం',v:pSelected.varaName,s:VARA_SCORE[pSelected.vara],f:VARA_SCORE[pSelected.vara]>=4?'అనుకూలం ✅':VARA_SCORE[pSelected.vara]>=3?'తటస్థం ⚖️':'అనుకూలం కాదు ❌'},
                    {k:'నక్షత్రం',v:pSelected.nakName,s:NAK_SCORE[pSelected.nak-1],f:NAK_SCORE[pSelected.nak-1]>=4?'శుభ నక్షత్రం ✅':NAK_SCORE[pSelected.nak-1]>=3?'తటస్థం ⚖️':'అశుభం ❌'},
                    {k:'యోగం',v:pSelected.yogaName,s:pSelected.yogaGood?5:pSelected.yogaBad?0:3,f:pSelected.yogaGood?'శుభ యోగం ✅':pSelected.yogaBad?'అశుభ యోగం ❌':'తటస్థం ⚖️'},
                    {k:'నక్షత్ర అధిపతి',v:pSelected.nakLord,s:3,f:'గ్రహ బలం చూడండి'},
                    {k:'పాదం',v:`పాదం ${pSelected.pada}`,s:3,f:'వ్యక్తిగత లెక్క అవసరం'},
                  ].map((row,i)=>(
                    <tr key={i} className={i%2===0?'bg-slate-900/20':''}>
                      <td className="py-2 px-3 font-bold text-slate-300">{row.k}</td>
                      <td className="py-2 px-3 text-yellow-300">{row.v}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex justify-center gap-0.5">
                          {[1,2,3,4,5].map(s=><div key={s} className={`w-2.5 h-2.5 rounded-sm ${row.s>=s?'bg-amber-500':'bg-slate-700'}`}/>)}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{row.f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={`mt-3 rounded-xl p-3 border ${scoreBg(Math.round(((TITHI_SCORE[pSelected.tithi-1]+VARA_SCORE[pSelected.vara]+NAK_SCORE[pSelected.nak-1]+(pSelected.yogaGood?5:pSelected.yogaBad?0:3))/20)*100))}`}>
              <p className="text-xs font-bold text-white">📌 {selectedDate} కి సమగ్ర ఫలం:</p>
              <p className="text-sm text-slate-300 mt-1">
                {pSelected.tithiName} + {pSelected.varaName} + {pSelected.nakName} + {pSelected.yogaName} →
                <span className={`font-black ml-2 ${scoreColor(Math.round(((TITHI_SCORE[pSelected.tithi-1]+VARA_SCORE[pSelected.vara]+NAK_SCORE[pSelected.nak-1]+(pSelected.yogaGood?5:pSelected.yogaBad?0:3))/20)*100))}`}>
                  {Math.round(((TITHI_SCORE[pSelected.tithi-1]+VARA_SCORE[pSelected.vara]+NAK_SCORE[pSelected.nak-1]+(pSelected.yogaGood?5:pSelected.yogaBad?0:3))/20)*100)}% {pSelected.yogaGood&&TITHI_SCORE[pSelected.tithi-1]>=4&&VARA_SCORE[pSelected.vara]>=4?'🏆 విజయం అనుకూలం':''}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CALENDAR TAB ═══ */}
      {tab==='calendar' && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4"/>{calYear} — {['జనవరి','ఫిబ్రవరి','మార్చి','ఏప్రిల్','మే','జూన్','జూలై','ఆగస్టు','సెప్టెంబర్','అక్టోబర్','నవంబర్','డిసెంబర్'][calMonth-1]} పంచాంగ క్యాలెండర్
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-2 px-2 text-slate-400 text-left">తేదీ</th>
                  <th className="py-2 px-2 text-slate-400">వారం</th>
                  <th className="py-2 px-2 text-slate-400">తిథి</th>
                  <th className="py-2 px-2 text-slate-400">నక్షత్రం</th>
                  <th className="py-2 px-2 text-slate-400">యోగం</th>
                  <th className="py-2 px-2 text-slate-400 text-center">స్కోర్</th>
                  <th className="py-2 px-2 text-slate-400">ఫలం</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {calDays.map(({date,p:dp,score},i)=>{
                  const isToday = date.toDateString()===now.toDateString();
                  const pct = Math.round((score/18)*100);
                  return (
                    <tr key={i} onClick={()=>{ setSelectedDate(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`); setTab('today'); }}
                      className={`cursor-pointer hover:bg-slate-800/40 ${isToday?'bg-amber-500/10 border-l-2 border-l-amber-500':''}`}>
                      <td className={`py-2 px-2 font-black ${isToday?'text-amber-400':'text-slate-200'}`}>{date.getDate()}{isToday?'  ◀':''}</td>
                      <td className="py-2 px-2 text-slate-400">{dp.varaName.slice(0,3)}</td>
                      <td className="py-2 px-2 text-blue-300">{dp.tithiName}</td>
                      <td className="py-2 px-2 text-purple-300">{dp.nakName}</td>
                      <td className={`py-2 px-2 ${dp.yogaGood?'text-emerald-400':dp.yogaBad?'text-red-400':'text-slate-400'}`}>{dp.yogaName}{dp.yogaGood?' ✅':dp.yogaBad?' ❌':''}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${pct>=75?'bg-emerald-500/20 text-emerald-400':pct>=55?'bg-blue-500/20 text-blue-400':pct>=40?'bg-amber-500/20 text-amber-400':'bg-red-500/20 text-red-400'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-400">{pct>=75?'🟢 శుభం':pct>=55?'🔵 మంచిది':pct>=40?'🟡 సాధారణం':'🔴 అనుకూలం కాదు'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-600 mt-3">* తేదీపై click చేస్తే ఆ రోజు వివరాలు "ఈరోజు పంచాంగం" లో చూడవచ్చు</p>
        </div>
      )}

      {/* Footer note */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
        <p className="text-[10px] text-slate-500">⚙️ Lahiri Ayanamsa • Jean Meeus simplified formulas • Accuracy: ±1° Sun, ±3° Moon • స్థానిక సూర్యోదయం-ఆస్తమయం ఆధారిత హోరా/రాహుకాలం • Do not remove old data — this tab is additive</p>
      </div>
    </div>
  );
}
