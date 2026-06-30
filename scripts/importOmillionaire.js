import fs from 'fs';
import path from 'path';

async function importOmillionaire() {
  console.log('Fetching Omillionaire draws...');
  // The API returns all items if we request a large per_page
  const url = 'https://api.omillionaire.com/api/event/list-draws?per_page=500&page=1';
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    const json = await res.json();
    
    if (json.data && Array.isArray(json.data)) {
      const results = json.data;
      console.log(`Successfully fetched ${results.length} draws.`);
      
      const outputPath = path.resolve('./src/data/omillionaire_results.json');
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
      console.log(`Saved to ${outputPath}`);
    } else {
      console.log('No data array found in response.');
    }
  } catch (error) {
    console.error('Error importing Omillionaire:', error.message);
  }
}

importOmillionaire();
