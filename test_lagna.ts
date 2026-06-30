import { getPanchangaForDateTime } from './src/services/panchangaEngine';

for (let h = 0; h < 24; h++) {
  const ts = `${String(h).padStart(2,'0')}:00`;
  const p = getPanchangaForDateTime('2026-06-30', ts, 17.385, 78.487);
  console.log(`Hour: ${ts} -> Lagna: ${p.lagnaRashi} (idx: ${p.lagnaRashiIdx}) | Sun Sid: ${p.sunSid.toFixed(2)} | Moon Sid: ${p.moonSid.toFixed(2)}`);
}
