const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function mod360(x) { return ((x % 360) + 360) % 360; }
function obliquity(jd) {
  const T = (jd-2451545)/36525;
  return 23.439291 - 0.013004*T - 0.000000164*T*T + 0.000000504*T*T*T;
}
function gst(jd) {
  const T = (jd-2451545)/36525;
  return mod360(280.46061837 + 360.98564736629*(jd-2451545) + 0.000387933*T*T - T*T*T/38710000);
}

function calcLagna(jd, lat, lng) {
  const ramc = mod360(gst(jd) + lng);
  const eps = obliquity(jd);
  
  const y_m = Math.cos(ramc*DEG);
  const x_m = -Math.sin(ramc*DEG)*Math.cos(eps*DEG) - Math.tan(lat*DEG)*Math.sin(eps*DEG);
  
  let asc = Math.atan2(y_m, x_m) * RAD;
  asc = mod360(asc);
  return asc;
}

const RASHI_TE = ['మేష','వృషభ','మిథున','కర్కాటక','సింహ','కన్య','తుల','వృశ్చిక','ధనుస్సు','మకర','కుంభ','మీన'];

function toJD(date) {
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours()/24 + date.getUTCMinutes()/1440 + date.getUTCSeconds()/86400;
  const a = Math.floor((14-m)/12), Y = y+4800-a, M = m+12*a-3;
  return d + Math.floor((153*M+2)/5) + 365*Y + Math.floor(Y/4) - Math.floor(Y/100) + Math.floor(Y/400) - 32045.5;
}

for (let h = 0; h < 24; h++) {
  const utcMs = Date.UTC(2026, 5, 30, h, 0, 0) - Math.round(5.5 * 3600000);
  const dt = new Date(utcMs);
  const jd = toJD(dt);
  let asc = calcLagna(jd, 17.385, 78.487);
  asc = mod360(asc - 24); // mock ayanamsa ~24
  const idx = Math.floor(asc/30) % 12;
  console.log(`Hour: ${h} -> Lagna: ${RASHI_TE[idx]} (idx: ${idx})`);
}
