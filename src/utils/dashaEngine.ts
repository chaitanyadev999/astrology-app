import { ProkeralaPlanet } from '../services/prokerala';

const DASHA_LORDS = [
  { name: 'Ketu', years: 7 },
  { name: 'Venus', years: 20 },
  { name: 'Sun', years: 6 },
  { name: 'Moon', years: 10 },
  { name: 'Mars', years: 7 },
  { name: 'Rahu', years: 18 },
  { name: 'Jupiter', years: 16 },
  { name: 'Saturn', years: 19 },
  { name: 'Mercury', years: 17 }
];

export interface DashaResult {
  currentMahadasha: string;
  currentAntardasha: string;
}

export function getCurrentDasha(birthPlanets: ProkeralaPlanet[], dobDate: Date): DashaResult {
  if (!birthPlanets || birthPlanets.length === 0) {
    return { currentMahadasha: 'Unknown', currentAntardasha: 'Unknown' };
  }

  const moon = birthPlanets.find(p => p.name === 'Moon' || p.name === 'చంద్ర');
  if (!moon || moon.longitude === undefined) {
    return { currentMahadasha: 'Unknown', currentAntardasha: 'Unknown' };
  }

  const moonLong = moon.longitude;
  const NAKSHATRA_SPAN = 13 + (20 / 60); // 13.3333 degrees

  const nakshatraIndex = Math.floor(moonLong / NAKSHATRA_SPAN);
  const lordIndex = nakshatraIndex % 9;

  const fractionTraversed = (moonLong % NAKSHATRA_SPAN) / NAKSHATRA_SPAN;
  const startLord = DASHA_LORDS[lordIndex];
  const yearsPassedAtBirth = fractionTraversed * startLord.years;
  const yearsRemainingAtBirth = startLord.years - yearsPassedAtBirth;

  const today = new Date();
  const diffTime = Math.abs(today.getTime() - dobDate.getTime());
  const ageInDays = diffTime / (1000 * 60 * 60 * 24);
  const ageInYears = ageInDays / 365.2425;

  let accumulatedYears = yearsRemainingAtBirth;
  let currentLordIdx = lordIndex;

  // Find Mahadasha
  if (ageInYears <= accumulatedYears) {
    // Still in first dasha
  } else {
    while (accumulatedYears <= ageInYears) {
      currentLordIdx = (currentLordIdx + 1) % 9;
      accumulatedYears += DASHA_LORDS[currentLordIdx].years;
    }
  }

  const mdLord = DASHA_LORDS[currentLordIdx];
  const mdYears = mdLord.years;

  // Find Antardasha
  // The Mahadasha ends at accumulatedYears
  // The Mahadasha started at (accumulatedYears - mdYears)
  const mdStartAge = accumulatedYears - mdYears;
  const yearsIntoMD = ageInYears - mdStartAge;

  let adAccumulator = 0;
  let adIdx = currentLordIdx;
  let adLordName = mdLord.name;

  for (let i = 0; i < 9; i++) {
    const adLordObj = DASHA_LORDS[adIdx];
    // Antardasha span = (MD Years * AD Years) / 120
    const adSpan = (mdYears * adLordObj.years) / 120;
    adAccumulator += adSpan;

    if (yearsIntoMD <= adAccumulator) {
      adLordName = adLordObj.name;
      break;
    }
    adIdx = (adIdx + 1) % 9;
  }

  return {
    currentMahadasha: mdLord.name,
    currentAntardasha: adLordName
  };
}
