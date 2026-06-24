// Corrected Nakshatra Rulers
export const NAKSHATRAS = [
  { name: 'Ashwini', ruler: 'Ketu', degrees: '0°00 - 13°20 Aries' },
  { name: 'Bharani', ruler: 'Venus', degrees: '13°20 - 26°40 Aries' },
  { name: 'Krittika', ruler: 'Sun', degrees: '26°40 Aries - 10°00 Taurus' },
  { name: 'Rohini', ruler: 'Moon', degrees: '10°00 - 23°20 Taurus' },
  { name: 'Mrigashira', ruler: 'Mars', degrees: '23°20 Taurus - 6°40 Gemini' },
  { name: 'Ardra', ruler: 'Rahu', degrees: '6°40 - 20°00 Gemini' },
  { name: 'Punarvasu', ruler: 'Jupiter', degrees: '20°00 Gemini - 3°20 Cancer' },
  { name: 'Pushya', ruler: 'Saturn', degrees: '3°20 - 16°40 Cancer' },
  { name: 'Ashlesha', ruler: 'Mercury', degrees: '16°40 - 30°00 Cancer' },
  { name: 'Magha', ruler: 'Ketu', degrees: '0°00 - 13°20 Leo' },
  { name: 'Purva Phalguni', ruler: 'Venus', degrees: '13°20 - 26°40 Leo' },
  { name: 'Uttara Phalguni', ruler: 'Sun', degrees: '26°40 Leo - 10°00 Virgo' },
  { name: 'Hasta', ruler: 'Moon', degrees: '10°00 - 23°20 Virgo' },
  { name: 'Chitra', ruler: 'Mars', degrees: '23°20 Virgo - 6°40 Libra' },
  { name: 'Swati', ruler: 'Rahu', degrees: '6°40 - 20°00 Libra' },
  { name: 'Vishakha', ruler: 'Jupiter', degrees: '20°00 Libra - 3°20 Scorpio' },
  { name: 'Anuradha', ruler: 'Saturn', degrees: '3°20 - 16°40 Scorpio' },
  { name: 'Jyeshtha', ruler: 'Mercury', degrees: '16°40 - 30°00 Scorpio' },
  { name: 'Mula', ruler: 'Ketu', degrees: '0°00 - 13°20 Sagittarius' },
  { name: 'Purva Ashadha', ruler: 'Venus', degrees: '13°20 - 26°40 Sagittarius' },
  { name: 'Uttara Ashadha', ruler: 'Sun', degrees: '26°40 Sagittarius - 10°00 Capricorn' },
  { name: 'Shravana', ruler: 'Moon', degrees: '10°00 - 23°20 Capricorn' },
  { name: 'Dhanishta', ruler: 'Mars', degrees: '23°20 Capricorn - 6°40 Aquarius' },
  { name: 'Shatabhisha', ruler: 'Rahu', degrees: '6°40 - 20°00 Aquarius' },
  { name: 'Purva Bhadrapada', ruler: 'Jupiter', degrees: '20°00 Aquarius - 3°20 Pisces' },
  { name: 'Uttara Bhadrapada', ruler: 'Saturn', degrees: '3°20 - 16°40 Pisces' },
  { name: 'Revati', ruler: 'Mercury', degrees: '16°40 - 30°00 Pisces' }
];

// Corrected Zodiac Signs (Rasis) mapping to planets and their natures
export const RASIS = [
  { sign: 'Aries', sanskrit: 'Mesha', ruler: 'Mars', nature: 'Fire' },
  { sign: 'Taurus', sanskrit: 'Vrishabha', ruler: 'Venus', nature: 'Earth' },
  { sign: 'Gemini', sanskrit: 'Mithuna', ruler: 'Mercury', nature: 'Air' },
  { sign: 'Cancer', sanskrit: 'Karka', ruler: 'Moon', nature: 'Water' },
  { sign: 'Leo', sanskrit: 'Simha', ruler: 'Sun', nature: 'Fire' },
  { sign: 'Virgo', sanskrit: 'Kanya', ruler: 'Mercury', nature: 'Earth' },
  { sign: 'Libra', sanskrit: 'Tula', ruler: 'Venus', nature: 'Air' },
  { sign: 'Scorpio', sanskrit: 'Vrishchika', ruler: 'Mars', nature: 'Water' },
  { sign: 'Sagittarius', sanskrit: 'Dhanu', ruler: 'Jupiter', nature: 'Fire' },
  { sign: 'Capricorn', sanskrit: 'Makara', ruler: 'Saturn', nature: 'Earth' },
  { sign: 'Aquarius', sanskrit: 'Kumbha', ruler: 'Saturn', nature: 'Air' },
  { sign: 'Pisces', sanskrit: 'Meena', ruler: 'Jupiter', nature: 'Water' }
];

// Chaldean Numerology logic
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

export function calculateNameNumber(name: string): number {
  let sum = 0;
  for (const char of name.toUpperCase()) {
    if (CHALDEAN_MAP[char]) {
      sum += CHALDEAN_MAP[char];
    }
  }
  return reduceToSingleDigit(sum);
}

export function calculateBirthNumber(dob: string): number {
  // Assuming format YYYY-MM-DD
  if (!dob) return 0;
  const day = dob.split('-')[2];
  return reduceToSingleDigit(parseInt(day, 10));
}

export function calculateLifePathNumber(dob: string): number {
  if (!dob) return 0;
  const numStr = dob.replace(/-/g, '');
  let sum = 0;
  for (const char of numStr) {
    sum += parseInt(char, 10);
  }
  return reduceToSingleDigit(sum);
}

function reduceToSingleDigit(num: number): number {
  while (num > 9) {
    const digits = num.toString().split('');
    num = digits.reduce((acc, val) => acc + parseInt(val, 10), 0);
  }
  return num;
}

export const COUNTRY_RULERS = [
  { country: 'India', ruler: 'Jupiter', sign: 'Capricorn', luck: 'Stable long-term growth, deep wisdom and technology expansion.' },
  { country: 'USA', ruler: 'Mercury', sign: 'Gemini', luck: 'Great for trade, communication, fast-paced business and IT.' },
  { country: 'China', ruler: 'Saturn', sign: 'Capricorn', luck: 'Massive manufacturing, discipline, long-term investments.' },
  { country: 'UK', ruler: 'Mars', sign: 'Aries', luck: 'Pioneering, historical dominance, aggressive business growth.' },
  { country: 'Australia', ruler: 'Venus', sign: 'Taurus', luck: 'Luxury, natural resources, mining, lifestyle.' },
  { country: 'Canada', ruler: 'Moon', sign: 'Cancer', luck: 'Peaceful, water resources, food, immigration friendly.' },
  { country: 'UAE', ruler: 'Venus', sign: 'Taurus', luck: 'Ultimate luxury, oil wealth, gold, massive real estate.' },
  { country: 'Germany', ruler: 'Mars', sign: 'Aries', luck: 'Engineering precision, manufacturing, heavy machinery.' }
];

export function getFavorableCountries(userLagna: string, strongPlanet: string) {
  // If strong planet matches country ruler, it is very favorable
  return COUNTRY_RULERS.filter(c => c.ruler === strongPlanet || c.sign === userLagna);
}
