// VedIntel AstroAPI Service (Replaced Prokerala)
// Documentation: https://vedintelastroapi.com

const API_KEY = 'vai_pk_7wzzR9CIwsDZi9NYRansfHvPdlpeg9AW';
const BASE_URL = 'https://vedintelastroapi.com/api/v1';

export interface ProkeralaPlanet {
  id: number;
  name: string;
  longitude: number;
  is_retrograde: boolean;
  rashi: { id: number; name: string };
  house?: number;
  nakshatra?: string;
  nakshatra_lord?: string;
}

export interface PanchangData {
  nakshatra: Array<{ id: number; name: string; lord: { name: string }; start: string; end: string }>;
  tithi: Array<{ id: number; name: string; paksha: string }>;
  yoga: Array<{ id: number; name: string }>;
  karana: Array<{ id: number; name: string }>;
  vaara: { id: number; name: string };
  sunrise: string;
  sunset: string;
  moonrise: string;
  hora_table: Array<{ hora: number; planet: string; start_utc: string; end_utc: string; start_unix: number; end_unix: number }>;
}

export interface ChoghadiyaSlot {
  id: number;
  name: string;
  type: string; // 'good' | 'bad' | 'neutral'
  isDay: boolean;
  start: string;
  end: string;
  start_unix: number;
  end_unix: number;
}

// Utility to parse datetime to dob, tob
function parseDateParams(datetime: string) {
  const [datePart, timePart] = datetime.split('T');
  const [year, month, day] = datePart.split('-');
  return {
    dob: `${day}/${month}/${year}`,
    tob: timePart ? timePart.substring(0, 5) : '00:00',
    date: `${day}/${month}/${year}`
  };
}

// Fetch planet positions for a given datetime + location
export async function fetchPlanetPositions(
  datetime: string,
  lat: string,
  lon: string
): Promise<ProkeralaPlanet[]> {
  const { dob, tob } = parseDateParams(datetime);
  const q = new URLSearchParams({
    api_key: API_KEY,
    dob,
    tob,
    lat,
    lon,
    tz: '5.5',
    lang: 'te'
  });
  
  const res = await fetch(`${BASE_URL}/horoscope/planet-details?${q.toString()}`);
  if (!res.ok) throw new Error(`Planet API failed: ${res.status}`);
  const data = await res.json();
  
  const pMap: Record<string, string> = {
    'As': 'Ascendant', 'Su': 'Sun', 'Mo': 'Moon', 'Ma': 'Mars',
    'Me': 'Mercury', 'Ju': 'Jupiter', 'Ve': 'Venus', 'Sa': 'Saturn',
    'Ra': 'Rahu', 'Ke': 'Ketu'
  };

  return Object.values(data.response || {}).map((p: any) => ({
    id: p.rasi_no,
    name: pMap[p.name] || p.name,
    longitude: p.global_degree,
    is_retrograde: p.is_retro === 'true' || p.retro === true,
    rashi: { id: p.rasi_no, name: p.zodiac },
    house: p.house,
    nakshatra: p.nakshatra,
    nakshatra_lord: p.nakshatra_lord
  }));
}

// Fetch Panchang for given datetime + location
export async function fetchPanchang(
  datetime: string,
  lat: string,
  lon: string
): Promise<PanchangData | null> {
  const { date } = parseDateParams(datetime);
  const q = new URLSearchParams({
    api_key: API_KEY,
    date,
    lat,
    lon,
    tz: '5.5',
    lang: 'te'
  });
  
  const res = await fetch(`${BASE_URL}/panchang/panchang?${q.toString()}`);
  if (!res.ok) throw new Error(`Panchang API failed: ${res.status}`);
  const data = await res.json();
  const r = data.response;
  if (!r) return null;

  return {
    nakshatra: [{ id: r.nakshatra?.number || 0, name: r.nakshatra?.name || '', lord: { name: r.nakshatra?.lord || '' }, start: '', end: '' }],
    tithi: [{ id: r.tithi?.number || 0, name: r.tithi?.name || '', paksha: r.tithi?.paksha || '' }],
    yoga: [{ id: r.yoga?.number || 0, name: r.yoga?.name || '' }],
    karana: [],
    vaara: { id: 0, name: r.vara || '' },
    sunrise: r.sunrise?.utc || '',
    sunset: r.sunset?.utc || '',
    moonrise: r.moonrise?.utc || '',
    hora_table: r.hora_table || []
  };
}

// Fetch Choghadiya (Hora timing) for given datetime + location
export async function fetchChoghadiya(
  datetime: string,
  lat: string,
  lon: string
): Promise<ChoghadiyaSlot[]> {
  const { date } = parseDateParams(datetime);
  const q = new URLSearchParams({
    api_key: API_KEY,
    date,
    lat,
    lon,
    tz: '5.5',
    lang: 'te'
  });
  
  const res = await fetch(`${BASE_URL}/panchang/choghadiya-muhurta?${q.toString()}`);
  if (!res.ok) throw new Error(`Choghadiya API failed: ${res.status}`);
  const data = await res.json();
  const list: ChoghadiyaSlot[] = [];
  
  if (data.response?.day_choghadiya) {
    data.response.day_choghadiya.forEach((c: any) => {
      list.push({ id: 0, name: c.name, type: c.inauspicious ? 'bad' : 'good', isDay: true, start: c.start_utc, end: c.end_utc, start_unix: c.start_unix, end_unix: c.end_unix });
    });
  }
  if (data.response?.night_choghadiya) {
    data.response.night_choghadiya.forEach((c: any) => {
      list.push({ id: 0, name: c.name, type: c.inauspicious ? 'bad' : 'good', isDay: false, start: c.start_utc, end: c.end_utc, start_unix: c.start_unix, end_unix: c.end_unix });
    });
  }
  return list;
}

// Fetch AI Interpret Chart
export async function fetchAiInterpret(
  datetime: string,
  lat: string,
  lon: string,
  question?: string
): Promise<string | null> {
  const { dob, tob } = parseDateParams(datetime);
  const q = new URLSearchParams({
    api_key: API_KEY,
    dob,
    tob,
    lat,
    lon,
    tz: '5.5',
    lang: 'te'
  });
  if (question) q.append('question', question);
  
  try {
    const res = await fetch(`${BASE_URL}/ai/interpret/chart?${q.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.response?.response || data.response || null;
  } catch (err) {
    return null;
  }
}

// Map planet list to { 'సూర్య': rashiIdx, ... } for South Indian chart
export function planetsToChartMap(planets: ProkeralaPlanet[]): Record<string, number> {
  const nameMap: Record<string, string> = {
    Sun: 'సూర్య', Moon: 'చంద్ర', Mars: 'కుజ', Mercury: 'బుధ',
    Jupiter: 'గురు', Venus: 'శుక్ర', Saturn: 'శని',
    'Rahu (Mean)': 'రాహు', 'Ketu (Mean)': 'కేతు', Ascendant: 'లగ్న',
    'Rahu': 'రాహు', 'Ketu': 'కేతు',
  };
  const chart: Record<string, number> = {};
  for (const p of planets) {
    const te = nameMap[p.name] || p.name;
    if (te && p.rashi?.id) {
      chart[te] = p.rashi.id - 1; // VedIntel uses 1-12, we need 0-11
    }
  }
  return chart;
}
