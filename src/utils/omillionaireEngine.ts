import omillionaireData from '../data/omillionaire_results.json';

// Type definition for parsed draws
export interface ParsedDraw {
  id: number;
  date: string;
  mainNumbers: number[];
  grandNumber: number;
}

export function parseDraws(): ParsedDraw[] {
  return omillionaireData.map((draw: any) => {
    let mainNumbers: number[] = [];
    let grandNumber = 0;
    try {
      const parsed = JSON.parse(draw.results);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        mainNumbers = parsed[0];
        grandNumber = parsed[1][0] || 0;
      }
    } catch (e) {
      console.warn('Failed to parse draw result:', draw.results);
    }
    return {
      id: draw.id,
      date: draw.draw_date,
      mainNumbers,
      grandNumber
    };
  });
}

export function getFrequencies(draws: ParsedDraw[]) {
  const mainFreq: Record<number, number> = {};
  const grandFreq: Record<number, number> = {};

  for (let i = 1; i <= 44; i++) {
    mainFreq[i] = 0;
    grandFreq[i] = 0;
  }

  draws.forEach(d => {
    d.mainNumbers.forEach(num => {
      if (mainFreq[num] !== undefined) {
        mainFreq[num]++;
      }
    });
    if (grandFreq[d.grandNumber] !== undefined) {
      grandFreq[d.grandNumber]++;
    }
  });

  return { mainFreq, grandFreq };
}

export function generateOmillionairePrediction(userLuckyNumbers: number[] = []): {
  predictedMain: number[];
  predictedGrand: number;
  hotNumbers: number[];
  coldNumbers: number[];
} {
  const draws = parseDraws();
  const { mainFreq, grandFreq } = getFrequencies(draws);

  const sortedMain = Object.entries(mainFreq)
    .sort((a, b) => b[1] - a[1])
    .map(entry => parseInt(entry[0]));

  const sortedGrand = Object.entries(grandFreq)
    .sort((a, b) => b[1] - a[1])
    .map(entry => parseInt(entry[0]));

  // Hot numbers are the top 10 most frequent
  const hotNumbers = sortedMain.slice(0, 10);
  
  // Cold numbers are the 10 least frequent
  const coldNumbers = sortedMain.slice(-10).reverse();

  let predictedMain: Set<number> = new Set();
  
  // Add user lucky numbers that fall between 1 and 44
  const validLucky = userLuckyNumbers.filter(n => n >= 1 && n <= 44);
  validLucky.slice(0, 2).forEach(n => predictedMain.add(n)); // Pick up to 2 lucky numbers

  // Fill the rest with a mix of hot and cold (e.g. 3 hot, 1 cold)
  let hotIdx = 0;
  while (predictedMain.size < Math.min(5, validLucky.length + 3) && hotIdx < hotNumbers.length) {
    predictedMain.add(hotNumbers[hotIdx]);
    hotIdx++;
  }

  let coldIdx = 0;
  while (predictedMain.size < 6 && coldIdx < coldNumbers.length) {
    predictedMain.add(coldNumbers[coldIdx]);
    coldIdx++;
  }

  // Ensure we have exactly 6 numbers (fallback if something goes wrong)
  let fallback = 1;
  while (predictedMain.size < 6) {
    predictedMain.add(fallback);
    fallback++;
  }

  // Pick Grand Number from top 3 hot grand numbers randomly
  const predictedGrand = sortedGrand[Math.floor(Math.random() * Math.min(3, sortedGrand.length))] || 7;

  return {
    predictedMain: Array.from(predictedMain).sort((a, b) => a - b),
    predictedGrand,
    hotNumbers,
    coldNumbers
  };
}
