import { ProkeralaPlanet } from '../services/prokerala';

export interface YogaResult {
  name: string;
  description: string;
  type: 'Benefic' | 'Malefic' | 'Mixed' | 'Bhanga';
  isDashaActive: boolean;
  isTransitActive: boolean;
  points: number;
}

const RASHI_LORDS: Record<number, string> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon',
  5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Mars',
  9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

const EXALTATION_RASHI: Record<string, number> = {
  'Sun': 1, 'Moon': 2, 'Mars': 10, 'Mercury': 6,
  'Jupiter': 4, 'Venus': 12, 'Saturn': 7, 'Rahu': 2, 'Ketu': 8
};

const DEBILITATION_RASHI: Record<string, number> = {
  'Sun': 7, 'Moon': 8, 'Mars': 4, 'Mercury': 12,
  'Jupiter': 10, 'Venus': 6, 'Saturn': 1, 'Rahu': 8, 'Ketu': 2
};

function getHouse(planetRashi: number, ascRashi: number): number {
  return ((planetRashi - ascRashi + 12) % 12) + 1;
}

// Function to purely detect yogas in ANY chart (birth or transit)
export function detectIndependentYogas(planets: ProkeralaPlanet[]): YogaResult[] {
  const yogas: YogaResult[] = [];
  if (!planets || planets.length === 0) return yogas;

  const asc = planets.find(p => p.name === 'Ascendant' || p.name === 'లగ్న');
  // If there is no ascendant (rare, but possible if API failed), fallback to Moon chart (Chandra Lagna)
  let ascRashi = asc?.rashi?.id;
  const moon = planets.find(p => p.name === 'Moon' || p.name === 'చంద్ర');
  
  if (!ascRashi) {
    if (!moon || !moon.rashi) return yogas;
    ascRashi = moon.rashi.id; // Chandra Lagna
  }

  const getP = (name: string) => planets.find(p => p.name === name || p.name.includes(name));

  const sun = getP('Sun');
  const mars = getP('Mars');
  const mercury = getP('Mercury');
  const jupiter = getP('Jupiter');
  const venus = getP('Venus');
  const saturn = getP('Saturn');
  const rahu = getP('Rahu');
  const ketu = getP('Ketu');

  const houseOf = (p: ProkeralaPlanet | undefined) => p && p.rashi ? getHouse(p.rashi.id, ascRashi!) : -1;
  const houseFromMoon = (p: ProkeralaPlanet | undefined) => (p && p.rashi && moon && moon.rashi) ? getHouse(p.rashi.id, moon.rashi.id) : -1;
  const houseFromSun = (p: ProkeralaPlanet | undefined) => (p && p.rashi && sun && sun.rashi) ? getHouse(p.rashi.id, sun.rashi.id) : -1;

  const isOwnOrExalted = (p: ProkeralaPlanet) => {
    if (!p || !p.rashi) return false;
    if (RASHI_LORDS[p.rashi.id] === p.name) return true;
    if (EXALTATION_RASHI[p.name] === p.rashi.id) return true;
    return false;
  };

  const isDebilitated = (p: ProkeralaPlanet) => {
    if (!p || !p.rashi) return false;
    return DEBILITATION_RASHI[p.name] === p.rashi.id;
  };

  const isKendra = (h: number) => [1, 4, 7, 10].includes(h);
  const isTrikona = (h: number) => [1, 5, 9].includes(h);
  const isDushtana = (h: number) => [6, 8, 12].includes(h);
  const isBenefic = (pName: string) => ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(pName);

  // Helper to add yoga
  const addYoga = (name: string, desc: string, type: 'Benefic'|'Malefic'|'Mixed'|'Bhanga', pts: number, planetNames: string[] = []) => {
    yogas.push({
      name, description: desc, type, points: pts,
      isDashaActive: false, isTransitActive: false // Set later by wrapper
    });
  };

  // --- A. Pancha Mahapurusha Yogas ---
  if (mars && isKendra(houseOf(mars)) && isOwnOrExalted(mars)) 
    addYoga('Ruchaka Yoga', 'అంగారకుడు కేంద్రంలో స్వక్షేత్ర/ఉచ్ఛ స్థితిలో ఉన్నాడు. ధైర్యం, నాయకత్వం, విజయం.', 'Benefic', 5, ['Mars']);
  if (mercury && isKendra(houseOf(mercury)) && isOwnOrExalted(mercury)) 
    addYoga('Bhadra Yoga', 'బుధుడు కేంద్రంలో స్వక్షేత్ర/ఉచ్ఛ స్థితిలో ఉన్నాడు. మేధస్సు, వ్యాపార నైపుణ్యం.', 'Benefic', 5, ['Mercury']);
  if (jupiter && isKendra(houseOf(jupiter)) && isOwnOrExalted(jupiter)) 
    addYoga('Hamsa Yoga', 'గురువు కేంద్రంలో స్వక్షేత్ర/ఉచ్ఛ స్థితిలో ఉన్నాడు. జ్ఞానం, గౌరవం, అదృష్టం.', 'Benefic', 5, ['Jupiter']);
  if (venus && isKendra(houseOf(venus)) && isOwnOrExalted(venus)) 
    addYoga('Malavya Yoga', 'శుక్రుడు కేంద్రంలో స్వక్షేత్ర/ఉచ్ఛ స్థితిలో ఉన్నాడు. కళా నైపుణ్యం, వాహన/ధన యోగం.', 'Benefic', 5, ['Venus']);
  if (saturn && isKendra(houseOf(saturn)) && isOwnOrExalted(saturn)) 
    addYoga('Shasha Yoga', 'శని కేంద్రంలో స్వక్షేత్ర/ఉచ్ఛ స్థితిలో ఉన్నాడు. అధికారం, స్థిరాస్తి లాభాలు.', 'Benefic', 5, ['Saturn']);

  // --- B. Lunar Yogas ---
  let sunapha = false, anapha = false;
  const planetsExceptSun = [mars, mercury, jupiter, venus, saturn].filter(p => p !== undefined) as ProkeralaPlanet[];
  
  if (planetsExceptSun.some(p => houseFromMoon(p) === 2)) sunapha = true;
  if (planetsExceptSun.some(p => houseFromMoon(p) === 12)) anapha = true;

  if (sunapha && anapha) addYoga('Durudhura Yoga', 'చంద్రునికి ఇరువైపులా గ్రహాలు ఉన్నాయి. విశేష ధన లాభం, ఖ్యాతి.', 'Benefic', 4);
  else if (sunapha) addYoga('Sunapha Yoga', 'చంద్రునికి రెండవ ఇంట గ్రహాలు. స్వయంకృషితో ధనార్జన.', 'Benefic', 3);
  else if (anapha) addYoga('Anapha Yoga', 'చంద్రునికి 12వ ఇంట గ్రహాలు. మంచి ఆరోగ్యం, సుఖం.', 'Benefic', 3);
  
  if (!sunapha && !anapha && planetsExceptSun.every(p => !isKendra(houseFromMoon(p)))) {
    addYoga('Kemadruma Yoga', 'చంద్రునికి ఇరువైపులా మరియు కేంద్రంలో గ్రహాలు లేవు. ఆందోళన, ఒంటరితనం.', 'Malefic', -3);
  }

  if (moon && jupiter && isKendra(houseFromMoon(jupiter))) {
    addYoga('Gaja Kesari Yoga', 'చంద్రుని నుండి గురువు కేంద్రంలో ఉన్నాడు. రాజపూజ్యం, కీర్తి, సంపద.', 'Benefic', 5, ['Jupiter', 'Moon']);
  }

  if (moon && mars && houseOf(moon) === houseOf(mars)) {
    addYoga('Chandra-Mangala Yoga', 'చంద్రుడు, కుజుడు కలిసి ఉన్నారు. ఆకస్మిక ధన లాభం, వ్యాపార లాభాలు.', 'Benefic', 4, ['Mars', 'Moon']);
  }

  // --- C. Solar Yogas ---
  if (sun && mercury && houseOf(sun) === houseOf(mercury)) {
    addYoga('Budha-Aditya Yoga', 'సూర్య బుధులు కలిసి ఉన్నారు. మేధస్సు, అడ్మినిస్ట్రేషన్.', 'Benefic', 3, ['Sun', 'Mercury']);
  }

  let veshi = false, vasi = false;
  const planetsExceptMoonNodes = [mars, mercury, jupiter, venus, saturn].filter(p => p !== undefined) as ProkeralaPlanet[];
  if (planetsExceptMoonNodes.some(p => houseFromSun(p) === 2)) veshi = true;
  if (planetsExceptMoonNodes.some(p => houseFromSun(p) === 12)) vasi = true;

  if (veshi && vasi) addYoga('Ubhayachari Yoga', 'సూర్యునికి ఇరువైపులా గ్రహాలు. గొప్ప కీర్తి, సంపద, అదృష్టం.', 'Benefic', 4);
  else if (veshi) addYoga('Veshi Yoga', 'సూర్యునికి 2వ ఇంట గ్రహాలు. సత్యసంధత, మంచి మాటతీరు.', 'Benefic', 3);
  else if (vasi) addYoga('Vasi Yoga', 'సూర్యునికి 12వ ఇంట గ్రహాలు. దాతృత్వం, విదేశీ లాభాలు.', 'Benefic', 3);

  // --- D. Raj Yogas & Dhana Yogas ---
  const ninthLord = planets.find(p => p.name === RASHI_LORDS[((ascRashi! + 7) % 12) + 1]);
  const tenthLord = planets.find(p => p.name === RASHI_LORDS[((ascRashi! + 8) % 12) + 1]);
  const eleventhLord = planets.find(p => p.name === RASHI_LORDS[((ascRashi! + 9) % 12) + 1]);
  const secondLord = planets.find(p => p.name === RASHI_LORDS[(ascRashi! % 12) + 1]);
  const ascLord = planets.find(p => p.name === RASHI_LORDS[ascRashi!]);
  
  if (ninthLord && tenthLord && (houseOf(ninthLord) === houseOf(tenthLord) || isKendra(houseOf(ninthLord)))) {
    addYoga('Dharma-Karmadhipati Yoga', '9, 10 అధిపతుల కలయిక/వీక్షణ. అత్యుత్తమ రాజయోగం, వృత్తిలో శిఖరాగ్ర స్థాయి.', 'Benefic', 5);
  }

  if (ninthLord && venus && isKendra(houseOf(ninthLord)) && isOwnOrExalted(ninthLord)) {
    addYoga('Lakshmi Yoga', '9వ అధిపతి ఉచ్ఛ/స్వక్షేత్రంలో ఉండి, శుక్రుడు బలంగా ఉన్నాడు. అపార సంపద.', 'Benefic', 5, ['Venus', ninthLord.name]);
  }

  if (secondLord && eleventhLord && (houseOf(secondLord) === houseOf(eleventhLord) || houseOf(eleventhLord) === 1 || houseOf(secondLord) === 11)) {
    addYoga('Maha Dhana Yoga', '2, 11 అధిపతుల బంధం. ధనాకర్షణ, అద్భుతమైన ఆర్థిక లాభాలు.', 'Benefic', 5);
  }

  // --- E. Vipareeta Raj Yogas ---
  const sixthLord = planets.find(p => p.name === RASHI_LORDS[((ascRashi! + 4) % 12) + 1]);
  const eighthLord = planets.find(p => p.name === RASHI_LORDS[((ascRashi! + 6) % 12) + 1]);
  const twelfthLord = planets.find(p => p.name === RASHI_LORDS[((ascRashi! + 10) % 12) + 1]);

  if (sixthLord && [8, 12].includes(houseOf(sixthLord))) addYoga('Harsha Yoga (Vipareeta Raj)', '6వ అధిపతి 8 లేదా 12లో. శత్రు నాశనం, ఆకస్మిక ధన లాభం.', 'Benefic', 4);
  if (eighthLord && [6, 12].includes(houseOf(eighthLord))) addYoga('Sarala Yoga (Vipareeta Raj)', '8వ అధిపతి 6 లేదా 12లో. కష్టాల తర్వాత ఊహించని అదృష్టం, దీర్ఘాయుష్షు.', 'Benefic', 4);
  if (twelfthLord && [6, 8].includes(houseOf(twelfthLord))) addYoga('Vimala Yoga (Vipareeta Raj)', '12వ అధిపతి 6 లేదా 8లో. ఖర్చులు తగ్గి ఆస్తులు పెరుగుతాయి.', 'Benefic', 4);

  // --- F. Other Doshas ---
  if (jupiter && rahu && houseOf(jupiter) === houseOf(rahu)) addYoga('Guru-Chandala Dosha', 'గురువు, రాహువు కలయిక. నిర్ణయాల్లో గందరగోళం, ఆటంకాలు.', 'Malefic', -2, ['Jupiter', 'Rahu']);
  if (saturn && moon && houseOf(saturn) === houseOf(moon)) addYoga('Vish Yoga', 'చంద్రుడు, శని కలయిక. మానసిక ఆందోళన, జాప్యం.', 'Malefic', -2, ['Saturn', 'Moon']);
  if (sun && (houseOf(sun) === houseOf(rahu) || houseOf(sun) === houseOf(ketu))) addYoga('Surya Grahan Dosha', 'సూర్యుడు రాహు/కేతువులతో కలిశాడు. ఆత్మవిశ్వాసం తగ్గడం, అధికారితో సమస్యలు.', 'Malefic', -2, ['Sun']);

  return yogas;
}

export function detectYogas(
  birthPlanets: ProkeralaPlanet[],
  transitPlanets: ProkeralaPlanet[],
  currentMahadashaLord: string,
  currentAntardashaLord: string
): YogaResult[] {
  // Get base yogas from birth chart
  const yogas = detectIndependentYogas(birthPlanets);
  
  if (!birthPlanets || birthPlanets.length === 0) return yogas;
  const asc = birthPlanets.find(p => p.name === 'Ascendant' || p.name === 'లగ్న');
  const ascRashi = asc?.rashi?.id || 1;

  const getT = (name: string) => transitPlanets.find(p => p.name === name || p.name.includes(name));
  const isKendra = (h: number) => [1, 4, 7, 10].includes(h);
  const isTrikona = (h: number) => [1, 5, 9].includes(h);
  const isOwnOrExalted = (p: ProkeralaPlanet) => {
    if (!p || !p.rashi) return false;
    if (RASHI_LORDS[p.rashi.id] === p.name) return true;
    if (EXALTATION_RASHI[p.name] === p.rashi.id) return true;
    return false;
  };

  const isTransitStrong = (planetName: string) => {
    if (planetName === 'Rahu' || planetName === 'Ketu') return false; // complex
    const tp = getT(planetName);
    if (!tp || !tp.rashi) return false;
    const h = getHouse(tp.rashi.id, ascRashi);
    return isKendra(h) || isTrikona(h) || isOwnOrExalted(tp);
  };

  // Enhance with dasha and transit info (crude matching using yoga description/name if planetName array not passed, but we can do a broad match)
  return yogas.map(y => {
    let activeDasha = false;
    let activeTransit = false;
    
    // We try to find planet names mentioned in the yoga name
    const allPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const planetsInYoga = allPlanets.filter(p => y.name.includes(p) || y.description.includes(RASHI_LORDS[1]! /* Just crude lookup */) ); 
    // Wait, let's just use a simpler heuristic or the explicit array we passed. Since we didn't pass array for all, we check if Mahadasha lord is in the description
    // Better: Just check if Mahadasha lord or Antardasha lord string is part of the translation or just give broad bonus.
    
    // Actually, I can check string inclusions in the English/Telugu names
    const teluguMap: Record<string, string> = {'Sun':'సూర్య','Moon':'చంద్ర','Mars':'కుజ','Mercury':'బుధ','Jupiter':'గురు','Venus':'శుక్ర','Saturn':'శని','Rahu':'రాహు','Ketu':'కేతు'};
    const engT = [currentMahadashaLord, currentAntardashaLord];
    const telT = engT.map(e => teluguMap[e]);

    if (engT.some(e => y.name.includes(e) || y.description.includes(e)) || telT.some(t => y.name.includes(t) || y.description.includes(t))) {
      activeDasha = true;
    }
    
    // Transit active? 
    allPlanets.forEach(p => {
      if ((y.name.includes(p) || y.description.includes(teluguMap[p])) && isTransitStrong(p)) {
        activeTransit = true;
      }
    });

    // Special cases based on name
    if (y.name.includes('Mahapurusha') || y.name.includes('Ruchaka') || y.name.includes('Bhadra') || y.name.includes('Hamsa') || y.name.includes('Malavya') || y.name.includes('Shasha')) {
      const p = y.name.includes('Ruchaka') ? 'Mars' : y.name.includes('Bhadra') ? 'Mercury' : y.name.includes('Hamsa') ? 'Jupiter' : y.name.includes('Malavya') ? 'Venus' : 'Saturn';
      activeDasha = engT.includes(p);
      activeTransit = isTransitStrong(p);
    }
    
    if (y.name.includes('Raj') || y.name.includes('Dhana')) {
      // Very broad, if Lagna lord or 9th lord is active
      activeDasha = true; // Assume Raj yogas get activated partially in many dashas
    }

    return { ...y, isDashaActive: activeDasha, isTransitActive: activeTransit };
  });
}
