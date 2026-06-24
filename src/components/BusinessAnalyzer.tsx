import React, { useState, useEffect } from 'react';
import { 
  Sparkles, User, Calendar, Briefcase, Compass, AlertTriangle, RotateCcw, Award,
  BookOpen, Globe, Flame, LayoutGrid, Users, Zap, Target, CheckCircle2, Map,
  XCircle, TrendingDown, ChevronRight, TrendingUp, Info, ShieldAlert, Search,
  Check, ShieldCheck, Activity, Clock, Fingerprint, Wrench, Trash2, PlusCircle,
  CheckSquare, MinusCircle
} from 'lucide-react';

const CHALDEAN_MAP = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8
};

const PYTHAGOREAN_MAP = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};

const KABBALAH_MAP = {
  A: 1, B: 2, C: 11, D: 4, M: 12, N: 13,
  E: 5, F: 17, G: 3, H: 8, O: 15, P: 80,
  I: 10, J: 10, K: 19, L: 30, Q: 100, R: 200,
  S: 60, T: 9, U: 6, V: 6, W: 6, X: 60, Y: 10, Z: 7
};

// పంచధా మైత్రి (5-Fold Relationships): Ati-Mitra, Mitra, Sama, Satru, Ati-Satru
const PLANETS = {
  1: { name: "సూర్యుడు (Sun)", element: "అగ్ని", color: "బంగారు రంగు, పసుపు, కాషాయం", qualities: "లీడర్‌షిప్, అథారిటీ, గ్లోబల్ కీర్తి", lordKey: "Sun",
       atiMitra: [2, 3, 9], mitra: [1, 5], sama: [4, 7], satru: [6], atiSatru: [8],
       get friends() { return [...this.atiMitra, ...this.mitra]; }, get enemies() { return [...this.satru, ...this.atiSatru]; }, dashaYears: 6 },
  2: { name: "చంద్రుడు (Moon)", element: "నీరు", color: "తెలుపు, సిల్వర్", qualities: "భావోద్వేగం, కస్టమర్ కేర్, సృజనాత్మకత", lordKey: "Moon",
       atiMitra: [1, 5], mitra: [2, 3], sama: [7, 9], satru: [4, 6], atiSatru: [8],
       get friends() { return [...this.atiMitra, ...this.mitra]; }, get enemies() { return [...this.satru, ...this.atiSatru]; }, dashaYears: 10 },
  3: { name: "గురుడు (Jupiter)", element: "ఆకాశం", color: "పసుపు, గోల్డెన్", qualities: "విజ్ఞానం, స్థిరమైన ప్రగతి, నమ్మకం", lordKey: "Jupiter",
       atiMitra: [1, 2, 9], mitra: [3, 5], sama: [7], satru: [4, 6], atiSatru: [8],
       get friends() { return [...this.atiMitra, ...this.mitra]; }, get enemies() { return [...this.satru, ...this.atiSatru]; }, dashaYears: 16 },
  4: { name: "రాహువు (Rahu)", element: "వాయువు", color: "గ్రే, బ్లూ", qualities: "మల్టీమీడియా, ఇంటర్నెట్ వృద్ధి, దూకుడు", lordKey: "Rahu",
       atiMitra: [6, 8], mitra: [4, 5, 7], sama: [3], satru: [1, 2], atiSatru: [9],
       get friends() { return [...this.atiMitra, ...this.mitra]; }, get enemies() { return [...this.satru, ...this.atiSatru]; }, dashaYears: 18 },
  5: { name: "బుధుడు (Mercury)", element: "భూమి", color: "ఆకుపచ్చ (Green)", qualities: "బుద్ధి కుశలత, వాణిజ్య నైపుణ్యం, లెక్కలు", lordKey: "Mercury",
       atiMitra: [1, 6], mitra: [5, 8], sama: [4, 7], satru: [2, 3], atiSatru: [9],
       get friends() { return [...this.atiMitra, ...this.mitra]; }, get enemies() { return [...this.satru, ...this.atiSatru]; }, dashaYears: 17 },
  6: { name: "శుక్రుడు (Venus)", element: "నీరు/భూమి", color: "వైట్, లైట్ పింక్", qualities: "లగ్జరీ, ఫ్యాషన్, గ్లామర్, గ్లోబల్ డిజైన్", lordKey: "Venus",
       atiMitra: [5, 8], mitra: [4, 6, 7], sama: [9], satru: [3], atiSatru: [1, 2],
       get friends() { return [...this.atiMitra, ...this.mitra]; }, get enemies() { return [...this.satru, ...this.atiSatru]; }, dashaYears: 20 },
  7: { name: "కేతువు (Ketu)", element: "ఆకాశం", color: "మల్టీ కలర్, లైట్ గ్రీన్", qualities: "పరిశోధన, ఆన్‌లైన్ ట్రేడింగ్, ఇంట్యూషన్", lordKey: "Ketu",
       atiMitra: [3, 9], mitra: [4, 5, 6, 7], sama: [1, 2], satru: [8], atiSatru: [],
       get friends() { return [...this.atiMitra, ...this.mitra]; }, get enemies() { return [...this.satru, ...this.atiSatru]; }, dashaYears: 7 },
  8: { name: "శనిదేవుడు (Saturn)", element: "భూమి", color: "నలుపు, రాయల్ బ్లూ", qualities: "నిర్మాణం, దీర్ఘకాలిక పునాది, కఠిన శ్రమ", lordKey: "Saturn",
       atiMitra: [5, 6], mitra: [4, 8], sama: [7], satru: [3, 9], atiSatru: [1, 2],
       get friends() { return [...this.atiMitra, ...this.mitra]; }, get enemies() { return [...this.satru, ...this.atiSatru]; }, dashaYears: 19 },
  9: { name: "కుజుడు (Mars)", element: "అగ్ని", color: "ఎరుపు (Red)", qualities: "ధైర్యం, రియల్ ఎస్టేట్, పోటీ తత్వం", lordKey: "Mars",
       atiMitra: [1, 3], mitra: [2, 9], sama: [6, 7], satru: [5, 8], atiSatru: [4],
       get friends() { return [...this.atiMitra, ...this.mitra]; }, get enemies() { return [...this.satru, ...this.atiSatru]; }, dashaYears: 7 }
};

const getPlanetRelation = (p1Num, p2Num) => {
  const p1 = PLANETS[p1Num];
  if (!p1) return { level: "sama", text: "సమ-గ్రహం (Sama - Neutral)", score: 0 };
  if (p1.atiMitra.includes(p2Num)) return { level: "atiMitra", text: "అతి-మిత్ర గ్రహం (Ati-Mitra - Intimate Friend)", score: 2 };
  if (p1.mitra.includes(p2Num)) return { level: "mitra", text: "మిత్ర గ్రహం (Mitra - Friendly)", score: 1 };
  if (p1.sama.includes(p2Num)) return { level: "sama", text: "సమ-గ్రహం (Sama - Neutral)", score: 0 };
  if (p1.satru.includes(p2Num)) return { level: "satru", text: "శత్రు గ్రహం (Satru - Enemy)", score: -1 };
  if (p1.atiSatru.includes(p2Num)) return { level: "atiSatru", text: "అతి-శత్రు గ్రహం (Adhi-Shatru - Arch Enemy)", score: -2 };
  return { level: "sama", text: "సమ-గ్రహం (Sama - Neutral)", score: 0 };
};

const COMPOUND_NUMBERS = {
  10: { status: "Auspicious (శుభప్రదం)", desc: "ఇది 'సక్సెస్ చక్రం' అని పిలువబడుతుంది. నూతన ఆవిష్కరణలకు, ఆటోమేటిక్ వృద్ధికి ఈ సంఖ్య అఖండ విజయాన్ని ఇస్తుంది." },
  11: { status: "Moderate (మధ్యమం)", desc: "తీవ్రమైన పోటీని మరియు కొన్ని ఆటంకాలను ఎదుర్కొని నిలబడేలా చేస్తుంది. కఠిన శ్రమ అవసరం." },
  12: { status: "Inauspicious (ప్రతికూలం)", desc: "అనవసరమైన ఆందోళనలు, శత్రువుల నుండి ఇబ్బందులు లేదా లీగల్ సమస్యలను తెచ్చే ప్రమాదం ఉంది." },
  13: { status: "Auspicious/Power (తీవ్ర శక్తి)", desc: "అధికారం మరియు మార్పులకు సూచిక. సాఫ్ట్‌వేర్ లేదా రీసెర్చ్ రంగాల వారికి అద్భుత లాభాలు ఇస్తుంది." },
  14: { status: "Auspicious (అత్యంత శుభప్రదం)", desc: "బుధుని సంపూర్ణ శక్తి. వ్యాపార కమ్యూనికేషన్, సేల్స్ మరియు మార్కెటింగ్ కు తిరుగులేని అదృష్ట సంఖ్య." },
  15: { status: "Auspicious (మంత్ర శక్తి సంఖ్య)", desc: "అయస్కాంతం లాగా కస్టమర్లను ఆకర్షించే సమ్మోహన శక్తి ఈ సంఖ్యకు కలదు. రిటైల్ మరియు హోటల్స్ కు అత్యుత్తమం." },
  16: { status: "Inauspicious (ప్రమాదకర సంఖ్య)", desc: "అకస్మాత్తుగా నష్టాలు తేవడం లేదా అగ్ని, కోర్టు లావాదేవీల వల్ల వ్యాపారాన్ని దెబ్బతీయడం దీని లక్షణం." },
  17: { status: "Auspicious (కీర్తి సంఖ్య)", desc: "సుదూర ప్రాంతాలలో బ్రాండ్ వాల్యూ పెరిగి కీర్తి లభిస్తుంది. అంతర్జాతీయ వాణిజ్యానికి అనుకూలం." },
  18: { status: "Inauspicious (పరమ శత్రు సంఖ్య)", desc: "కుటుంబ కలహాలు, భాగస్వామ్యుల మధ్య మోసాలు మరియు ఆకస్మిక ధన నష్టాన్ని సూచిస్తుంది. వద్దు." },
  19: { status: "Auspicious (సూర్య విజయ సంఖ్య)", desc: "విజయ శిఖరాలను అధిరోహించేలా చేస్తుంది. ప్రభుత్వ కాంట్రాక్టులు, రియల్ ఎస్టేట్ లో అఖండ వృద్ధి." },
  20: { status: "Moderate (సాధారణం)", desc: "తరచూ ఒడిదుడుకులు ఉంటాయి. నిలకడ లేని వ్యాపార నడుమ లాభాలు క్రమంగా వస్తాయి." },
  21: { status: "Auspicious (విజయ సంఖ్య)", desc: "అనేక ఆటంకాలను ఎదుర్కొని చివరికి అఖండమైన ధనలాభాన్ని, ఘన విజయాన్ని అందుకుంటుంది." },
  22: { status: "Inauspicious (భ్రాంతి సంఖ్య)", desc: "తప్పుడు అంచనాలు వేయడం, నమ్మి మోసపోవడం మరియు అప్పుల పాలవడం దీని ముఖ్య లక్షణం." },
  23: { status: "Auspicious (కుబేర సంఖ్య)", desc: "వ్యాపార సామ్రాజ్యాన్ని విస్తరించడానికి మరియు అడ్వాన్స్డ్ ఇన్వెస్ట్‌మెంట్స్‌కు అత్యంత భాగ్యవంతమైన సంఖ్య." },
  24: { status: "Auspicious (లక్ష్మీ కటాక్ష సంఖ్య)", desc: "స్త్రీల ఆదరణ, లగ్జరీ వస్తువులు, ఫ్యాషన్ మరియు బంగారం వ్యాపారాలకు నిరంతర ఆర్ధిక లాభాలను ఇస్తుంది." },
  25: { status: "Auspicious (జ్ఞాన వృద్ధి సంఖ్య)", desc: "అనుభవం ద్వారా గొప్ప విజయాలు సాధిస్తారు. ఎడ్యుకేషన్, ఫైనాన్స్ రంగాలకు అత్యంత అనుకూలం." },
  26: { status: "Inauspicious (తీవ్ర వైరుధ్యం)", desc: "శ్రమకు తగిన ప్రతిఫలం లభించదు. నిరంతరం నిరాశ, ఆందోళనలు ఉండేలా చేస్తుంది." },
  27: { status: "Auspicious (రాజకీయ/వ్యాపార యోగం)", desc: "అధికారం, పలుకుబడి మరియు అపార ధన ప్రవాహం తెస్తుంది. లీడర్‌షిప్ బ్రాండ్లకు పర్ఫెక్ట్." },
  28: { status: "Moderate (పోరాట సంఖ్య)", desc: "కొత్త భాగస్వామ్యాల వల్ల లేదా కోర్టు కేసుల వల్ల మొదట్లో ఒడిదుడుకులు తెస్తుంది." },
  29: { status: "Inauspicious (నమ్మకద్రోహ సంఖ్య)", desc: "ఆత్మీయులే వెన్నుపోటు పొడవడం లేదా గుమస్తాలు మోసం చేయడం... తీవ్ర ఆందోణన కలిగిస్తుంది." },
  30: { status: "Auspicious (ఏకాంత శక్తి)", desc: "మేధోపరమైన వ్యాపారాలకు, సాఫ్ట్‌వేర్ మరియు కన్సల్టింగ్ రంగాలకు అఖండ విజయం ఇస్తుంది." },
  32: { status: "Auspicious (బుధ కుబేర శక్తి)", desc: "వ్యాపార కమ్యూనికేషన్ లో తిరుగులేని విజయం సాధించి, ఊహించని విధంగా భారీ ఆర్డర్లు తెస్తుంది." },
  33: { status: "Auspicious (దైవిక సంరక్షణ)", desc: "అదృష్టం ఎల్లప్పుడూ తోడుంటుంది. లగ్జరీ హోటళ్లు, ఫుడ్ బిజినెస్ మరియు కీర్తికి అత్యున్నత సంఖ్య." },
  35: { status: "Inauspicious (ఆర్థిక అడ్డంకులు)", desc: "పెట్టుబడులు ఆవిరి కావడం, సకాలంలో బిల్లులు రాకపోవడం వంటి ఇబ్బందులు తెస్తుంది." },
  37: { status: "Auspicious (అదృష్ట నక్షత్ర సంఖ్య)", desc: "కుబేర యోగాన్ని ఇస్తుంది. ఈ సంఖ్యలో పేరు ఉన్న వ్యాపారం రాత్రికి రాత్రే దేశవ్యాప్త బ్రాండ్ కాగలదు." },
  41: { status: "Auspicious (రాజయోగ సంఖ్య)", desc: "పరిశ్రమలు స్థాపించడానికి, గ్లోబల్ విస్తరణకు మరియు వేల మందికి ఉపాధి కల్పించే శక్తిని ఇస్తుంది." },
  42: { status: "Auspicious (సౌందర్య విజయం)", desc: "కళలు, డిజైన్స్, సినిమా, ఫ్యాషన్ మరియు హోటల్స్ రంగంలో తిరుగులేని విజయాలు ఇస్తుంది." },
  45: { status: "Auspicious (పూర్ణ విజయం)", desc: "ప్రజాదరణ, ప్రభుత్వ మద్దతు మరియు కస్టమర్ల నుండి అంతులేని నమ్మకాన్ని ఆకర్షిస్తుంది." },
  46: { status: "Auspicious (సూర్య-శుక్ర బలం)", desc: "కీర్తి, ఐశ్వర్యం మరియు ఉన్నత జీవన ప్రమాణాలు ఇచ్చే అత్యున్నత వ్యాపార సంఖ్య." },
  48: { status: "Inauspicious (తీవ్ర శని దోషం)", desc: "ఎంత కష్టపడినా నష్టాలు రావడం, తీవ్ర ఒత్తిడి మరియు వ్యాపార నిలిపివేతకు దారితీయవచ్చు." },
  50: { status: "Auspicious (బుధ పూర్ణ శారద)", desc: "వాగ్ధాటి, వ్యాపార విస్తరణ, ఇంటర్నేషనల్ డీల్స్ కు అత్యంత అనుకూల సంఖ్య." },
  51: { status: "Auspicious (సింహ బలం)", desc: "శత్రువులను జయించి, మార్కెట్లో నెంబర్ 1 స్థానానికి చేరుకునే బలమైన సంఖ్య." }
};

const BUSINESS_CATEGORIES = {
  luxury: { name: "లగ్జరీ & ఫ్యాషన్ (Fashion, Jewelry)", rulingPlanet: 6, idealCustomers: "సంపన్న వర్గాలు, యువత, ఆధునిక కస్టమర్లు", suitability: "బంగారు ఆభరణాలు, డిజైనర్ బట్టలు, కాస్మెటిక్స్", attractionVibe: "అలంకరణ, గ్లామర్ మరియు లగ్జరీని అమితంగా ఇష్టపడే కస్టమర్లను ఆకర్షిస్తుంది." },
  tech: { name: "సాఫ్ట్‌వేర్ & ఐటి (IT, AI, Hardware)", rulingPlanet: 5, idealCustomers: "టెక్ ప్రియులు, యువత, నిపుణులు", suitability: "సాఫ్ట్‌వేర్ సంస్థలు, మొబైల్స్, ఐటి కన్సల్టింగ్", attractionVibe: "వేగం, ఇన్నోవేషన్, మరియు స్మార్ట్ సొల్యూషన్స్ వెతికే వారిని ఆకర్షిస్తుంది." },
  gaming: { name: "గేమింగ్ & ఈ-స్పోర్ట్స్ (Gaming, Esports)", rulingPlanet: 9, idealCustomers: "యువత, ప్రో-గేమర్స్, వినూత్న టెక్ ప్రియులు", suitability: "గేమ్ డెవలప్‌మెంట్, ఈ-స్పోర్ట్స్ అకాడమీలు, వర్చువల్ గేమింగ్ జోన్స్, గేమింగ్ ల్యాబ్స్", attractionVibe: "పోటీతత్వం, అపరిమిత ఉత్సాహం, లీడర్‌షిప్ మరియు అడ్రినలిన్ రష్ ని ఇష్టపడే కస్టమర్లను అయస్కాంతంలా ఆకర్షిస్తుంది." },
  socialmedia: { name: "సోషల్ మీడియా ఏజెన్సీ (Social Media, PR)", rulingPlanet: 4, idealCustomers: "ఆధునిక నెటిజన్లు, బ్రాండ్స్, క్రియేటివ్ యూత్", suitability: "డిజిటల్ మార్కెటింగ్ ఏజెన్సీలు, పిఆర్ కన్సల్టెన్సీలు, ఇన్‌ఫ్లుయెన్సర్ మేనేజ్‌మెంట్ నెట్‌వర్క్స్", attractionVibe: "వైరల్ ట్రెండ్స్, కమ్యూనిటీ బిల్డింగ్, నిరంతర ఆన్‌లైన్ కనెక్టివిటీ మరియు గ్లోబల్ ప్రమోషన్స్ ని కోరుకునే వారిని ఆకర్షిస్తుంది." },
  blogging: { name: "కంటెంట్ క్రియేషన్ (Blogging, YouTube)", rulingPlanet: 5, idealCustomers: "సమాచార శోధకులు, వీక్షకులు, డిజిటల్ చదువరులు, శ్రోతలు", suitability: "యూట్యూబ్ ఛానెల్స్, ప్రొడక్షన్ హౌసెస్, బ్లాగ్s, కంటెంట్ రైటింగ్ సర్వీసెస్, ఆడియో పాడ్‌కాస్ట్స్", attractionVibe: "సృజనాత్మకత, ఉపయోగకరమైన సమాచారం, కమ్యూనికేషన్ మరియు నిత్య నూతన వినోద అంశాలను తెలుసుకోవాలనుకునే వారిని ఆకర్షిస్తుంది." },
  essential: { name: "సూపర్ మార్కెట్ (Grocery, FMCG)", rulingPlanet: 2, idealCustomers: "కుటుంబాలు, గృహిణులు, సాధారణ ప్రజానీకం", suitability: "డిపార్ట్‌మెంటల్ స్టోర్స్, ఆర్గానిక్ ఫుడ్స్, డైరీ షాప్స్", attractionVibe: "నిత్యజీవిత అవసరాలు, ఆరోగ్యం మరియు స్నేహపూర్వక బడ్జెట్ చూసే వారిని ఆకర్షిస్తుంది." },
  construction: { name: "రియల్ ఎస్టేట్ (Real Estate, Builders)", rulingPlanet: 8, idealCustomers: "ఇల్లు కట్టుకునేవారు, కాంట్రాక్టర్లు, స్థిరాస్తి ఇన్వెస్టర్లు", suitability: "నిర్మాణ రంగాలు, హార్డ్‌వేర్, ఫ్లాట్స్ సేల్స్", attractionVibe: "జీవితకాల భద్రత, బలం, మరియు నాణ్యతను కోరుకునే కస్టమర్లను ఆకర్షిస్తుంది." },
  finance: { name: "ఫైనాన్స్ (FinTech, Banking, Wealth)", rulingPlanet: 3, idealCustomers: "వ్యాపారవేత్తలు, పొదుపుపరులు, ఇన్వెస్టర్లు", suitability: "చిట్ ఫండ్స్, బ్యాంకింగ్ అప్లికేషన్లు, స్టాక్ బ్రోకింగ్", attractionVibe: "నమ్మకం, ద్రవ్య వృద్ధి, మరియు ఆర్థిక సుస్థిరత కోరుకునే వారిని ఆకర్షిస్తుంది." },
  entertainment: { name: "వినోదం & ఈవెంట్స్ (Media, Restaurants)", rulingPlanet: 6, idealCustomers: "యువత, ఫుడ్ ప్రియులు, సామాజిక వర్గాలు", suitability: "సినిమా హాల్స్, రెస్టారెంట్స్, ఈవెంట్ మేనేజ్‌మెంట్", attractionVibe: "సంతోషం, వినోదం మరియు కమ్యూనిటీ గెట్-టుగెదర్స్ ను ఇష్టపడే వారిని ఆకర్షిస్తుంది." },
  healthcare: { name: "వైద్యం & ఫార్మా (Hospitals, Clinics)", rulingPlanet: 1, idealCustomers: "ఆరోగ్య స్పృహ ఉన్నవారు, రోగులు, కుటుంబాలు", suitability: "హాస్పిటల్స్, మెడికల్ షాప్స్, ల్యాబ్స్", attractionVibe: "సేవ, శీఘ్ర నివారణ మరియు సురక్షితమైన వైద్య సంరక్షణ ఆశిస్తే ఆకర్షితులవుతారు." },
  education: { name: "విద్య & శిక్షణ (Schools, Coaching)", rulingPlanet: 3, idealCustomers: "విద్యార్థులు, తల్లిదండ్రులు, ఉద్యోగార్థులు", suitability: "స్కూల్స్, ఆన్‌లైన్ కోర్సులు, ట్రైనింగ్ సెంటర్స్", attractionVibe: "నాలెడ్జ్, క్రమశిక్షణ, మరియు ఉజ్వల కెరీర్ వృద్ధిని చూసే వారిని ఆకర్షిస్తుంది." },
  transport: { name: "ట్రాన్స్‌పోర్ట్ & లాజిస్టిక్స్ (Travel, Delivery)", rulingPlanet: 7, idealCustomers: "ప్రయాణికులు, కార్పొరేట్ సంస్థలు", suitability: "డెలివరీ నెట్‌వర్క్స్, ఫారిన్ లాజిస్టిక్స్, టూర్స్", attractionVibe: "వేగం, భద్రత మరియు గ్లోబల్ కనెక్టివిటీ చూసే వారిని ఆకర్షిస్తుంది." },
  books: { name: "పుస్తకాలు & పబ్లిషింగ్ (Books, Novels)", rulingPlanet: 3, idealCustomers: "చదువరులు, విద్యార్థులు, మేధావులు, సాహిత్య ప్రియులు", suitability: "బుక్ స్టోర్స్, పబ్లిషింగ్ హౌసెస్, స్టోరీ బుక్స్, నవలల విక్రయం", attractionVibe: "జ్ఞానం, కల్పనా శక్తి (Imagination) మరియు సాహిత్య ప్రపంచాన్ని ఆస్వాదించే వారిని అద్భుతంగా ఆకర్షిస్తుంది." }
};

const NAKSHATRAS = [
  { name: "అశ్విని (Ashwini)", letters: ["A", "L", "C", "CH"], lord: "Ketu", yoni: "Horse (గుర్రం)", gana: "Deva (దేవ గణం)" },
  { name: "భరణి (Bharani)", letters: ["L", "E", "I", "LO"], lord: "Venus", yoni: "Elephant (ఏనుగు)", gana: "Manushya (మనుష్య గణం)" },
  { name: "కృత్తిక (Krittika)", letters: ["A", "I", "U", "E", "V"], lord: "Sun", yoni: "Sheep (గొర్రె)", gana: "Rakshasa (రాక్షస గణం)" },
  { name: "రోహిణి (Rohini)", letters: ["O", "V", "B", "VA"], lord: "Moon", yoni: "Serpent (పాము)", gana: "Manushya (మనుష్య గణం)" },
  { name: "మృగశిర (Mrigashira)", letters: ["V", "K", "W", "KE"], lord: "Mars", yoni: "Serpent (పాము)", gana: "Deva (దేవ గణం)" },
  { name: "ఆరుద్ర (Ardra)", letters: ["K", "G", "N", "CH"], lord: "Rahu", yoni: "Dog (కుక్క)", gana: "Manushya (మనుష్య గణం)" },
  { name: "పునర్వసు (Punarvasu)", letters: ["K", "H", "D", "HA"], lord: "Jupiter", yoni: "Cat (పిల్లి)", gana: "Deva (దేవ గణం)" },
  { name: "పుష్యమి (Pushya)", letters: ["H", "D", "S", "HE"], lord: "Saturn", yoni: "Sheep (గొర్రె)", gana: "Deva (దేవ గణం)" },
  { name: "ఆశ్లేష (Ashlesha)", letters: ["D", "M", "DO", "ME"], lord: "Mercury", yoni: "Cat (పిల్లి)", gana: "Rakshasa (రాక్షస గణం)" },
  { name: "మఖ (Magha)", letters: ["M", "T", "MA", "TA"], lord: "Ketu", yoni: "Rat (ఎలుక)", gana: "Rakshasa (రాక్షస గణం)" },
  { name: "పూరఫాల్గుణి (Pubba)", letters: ["M", "T", "MO", "TO"], lord: "Venus", yoni: "Rat (ఎలుక)", gana: "Manushya (మనుష్య గణం)" },
  { name: "ఉత్తరఫాల్గుణి (Uttara)", letters: ["T", "P", "TE", "PE"], lord: "Sun", yoni: "Cow (ఆవు)", gana: "Manushya (మనుష్య గణం)" },
  { name: "హస్త (Hasta)", letters: ["P", "S", "N", "SHA"], lord: "Moon", yoni: "Buffalo (గేదె)", gana: "Deva (దేవ గణం)" },
  { name: "చిత్త (Chitra)", letters: ["P", "R", "T", "RA"], lord: "Mars", yoni: "Tiger (పులి)", gana: "Rakshasa (రాక్షస గణం)" },
  { name: "స్వాతి (Svati)", letters: ["R", "T", "RU", "RE"], lord: "Rahu", yoni: "Buffalo (గేదె)", gana: "Deva (దేవ గణం)" },
  { name: "విశాఖ (Vishakha)", letters: ["T", "D", "Z", "TO"], lord: "Jupiter", yoni: "Tiger (పులి)", gana: "Rakshasa (రాక్షస గణం)" },
  { name: "అనూరాధ (Anuradha)", letters: ["N", "Y", "NE", "YO"], lord: "Saturn", yoni: "Deer (లేడి)", gana: "Deva (దేవ గణం)" },
  { name: "జ్యేష్ట (Jyeshtha)", letters: ["N", "Y", "NO", "YA"], lord: "Mercury", yoni: "Deer (లేడి)", gana: "Rakshasa (రాక్షస గణం)" },
  { name: "మూల (Mula)", letters: ["Y", "B", "F", "YE"], lord: "Ketu", yoni: "Dog (కుక్క)", gana: "Rakshasa (రాక్షస గణం)" },
  { name: "పూర్వాషాఢ (Purvashadha)", letters: ["B", "D", "P", "BU"], lord: "Venus", yoni: "Monkey (కోతి)", gana: "Manushya (మనుష్య గణం)" },
  { name: "ఉత్తరాషాఢ (Uttarashadha)", letters: ["B", "J", "K", "BE"], lord: "Sun", yoni: "Mongoose (కీరిపిల్ల)", gana: "Manushya (మనుష్య గణం)" },
  { name: "శ్రవణం (Shravana)", letters: ["J", "K", "S", "SO"], lord: "Moon", yoni: "Monkey (కోతి)", gana: "Deva (దేవ గణం)" },
  { name: "ధనిష్ట (Dhanishta)", letters: ["G", "S", "V", "GA"], lord: "Mars", yoni: "Lion (సింహం)", gana: "Rakshasa (రాక్షస గణం)" },
  { name: "శతభిషం (Shatabhisha)", letters: ["G", "S", "SH", "GO"], lord: "Rahu", yoni: "Horse (గుర్రం)", gana: "Rakshasa (రాక్షస గణం)" },
  { name: "పూర్వాభాద్ర (Purvabhadra)", letters: ["S", "D", "T", "SE"], lord: "Jupiter", yoni: "Lion (సింహం)", gana: "Manushya (మనుష్య గణం)" },
  { name: "ఉత్తరాభాద్ర (Uttarabhadra)", letters: ["D", "J", "G", "CA"], lord: "Saturn", yoni: "Cow (ఆవు)", gana: "Manushya (మనుష్య గణం)" },
  { name: "రేవతి (Revati)", letters: ["D", "C", "Z", "DE"], lord: "Mercury", yoni: "Elephant (ఏనుగు)", gana: "Deva (దేవ గణం)" }
];

const YONI_MAHA_VAIRA = {
  "Serpent (పాము)": "Mongoose (కీరిపిల్ల)", "Mongoose (కీరిపిల్ల)": "Serpent (పాము)",
  "Cat (పిల్లి)": "Rat (ఎలుక)", "Rat (ఎలుక)": "Cat (పిల్లి)",
  "Dog (కుక్క)": "Cat (పిల్లి)", "Tiger (పులి)": "Cow (ఆవు)",
  "Cow (ఆవు)": "Tiger (పులి)", "Lion (సింహం)": "Elephant (ఏనుగు)",
  "Elephant (ఏనుగు)": "Lion (సింహం)", "Horse (గుర్రం)": "Buffalo (గేదె)",
  "Buffalo (గేదె)": "Horse (గుర్రం)", "Sheep (గొర్రె)": "Monkey (కోతి)",
  "Monkey (కోతి)": "Sheep (గొర్రె)"
};

const RASHIS = [
  { id: 0, name: "మేషం (Aries)", lord: "Mars", lordNum: 9, element: "అగ్ని", direction: "తూర్పు (East)", letters: ["A", "L", "CH"], friendlyRashis: [4, 8, 2, 6] },
  { id: 1, name: "వృషభం (Taurus)", lord: "Venus", lordNum: 6, element: "భూమి", direction: "దక్షిణం (South)", letters: ["O", "V", "B", "U"], friendlyRashis: [5, 9, 2, 6] },
  { id: 2, name: "మిథునం (Gemini)", lord: "Mercury", lordNum: 5, element: "వాయువు", direction: "పడమర (West)", letters: ["K", "G", "H"], friendlyRashis: [6, 10, 1, 5] },
  { id: 3, name: "కర్కాటకం (Cancer)", lord: "Moon", lordNum: 2, element: "నీరు", direction: "ఉత్తరం (North)", letters: ["D", "M"], friendlyRashis: [7, 11, 1, 8] },
  { id: 4, name: "సింహం (Leo)", lord: "Sun", lordNum: 1, element: "అగ్ని", direction: "తూర్పు (East)", letters: ["M", "T"], friendlyRashis: [0, 8, 2, 6] },
  { id: 5, name: "కన్య (Virgo)", lord: "Mercury", lordNum: 5, element: "భూమి", direction: "దక్షిణం (South)", letters: ["P", "S", "N"], friendlyRashis: [1, 9, 2, 6] },
  { id: 6, name: "తులా (Libra)", lord: "Venus", lordNum: 6, element: "వాయువు", direction: "పడమర (West)", letters: ["R", "T"], friendlyRashis: [2, 10, 1, 5] },
  { id: 7, name: "వృశ్చికం (Scorpio)", lord: "Mars", lordNum: 9, element: "నీరు", direction: "ఉత్తరం (North)", letters: ["N", "Y"], friendlyRashis: [3, 11, 0, 9] },
  { id: 8, name: "ధనస్సు (Sagittarius)", lord: "Jupiter", lordNum: 3, element: "అగ్ని", direction: "తూర్పు (East)", letters: ["Y", "B", "F"], friendlyRashis: [0, 4, 3, 11] },
  { id: 9, name: "మకరం (Capricorn)", lord: "Saturn", lordNum: 8, element: "భూమి", direction: "దక్షిణం (South)", letters: ["J", "K"], friendlyRashis: [1, 5, 10, 7] },
  { id: 10, name: "కుంభం (Aquarius)", lord: "Saturn", lordNum: 8, element: "వాయువు", direction: "పడమర (West)", letters: ["G", "S", "D"], friendlyRashis: [2, 6, 9, 1] },
  { id: 11, name: "మీనం (Pisces)", lord: "Jupiter", lordNum: 3, element: "నీరు", direction: "ఉత్తరం (North)", letters: ["D", "C", "Z"], friendlyRashis: [3, 7, 8, 1] }
];

const GLOBAL_COUNTRIES = [
  { key: "india", name: "భారతదేశం (India)", rulingPlanet: 8, significance: "శనిదేవుడు (Saturn)", details: "భారీ పరిశ్రమలు, సాంప్రదాయ వాణిజ్యానికి మరియు కఠిన శ్రమతో కూడిన బిజినెస్‌లకు అనుకూలం." },
  { key: "usa", name: "అమెరికా (USA)", rulingPlanet: 5, significance: "బుధ గ్రహం (Mercury)", details: "సాఫ్ట్‌వేర్ స్టార్టప్స్, సోషల్ మీడియా, ఈ-స్పోర్ట్స్ మరియు డిజిటల్ నెట్‌వర్క్స్ కి అనుకూలం." },
  { key: "uae", name: "దుబాయ్ (UAE)", rulingPlanet: 6, significance: "శుక్ర గ్రహం (Venus)", details: "బంగారం, విలాసవంతమైన రియల్ ఎస్టేట్ మరియు లగ్జరీ గ్లామర్ రంగాలకు అద్భుతం." },
  { key: "uk", name: "లండన్ (United Kingdom)", rulingPlanet: 3, significance: "గురు గ్రహం (Jupiter)", details: "ఉన్నత విద్య, కన్సల్టింగ్, పబ్లిషింగ్, లీగల్ రంగాలకు యోగం." },
  { key: "singapore", name: "సింగపూర్ (Singapore)", rulingPlanet: 7, significance: "కేతు గ్రహం (Ketu)", details: "ఫారిన్ ఎక్స్ఛేంజ్, ఎగుమతులు, గ్లోబల్ ట్రేడ్ మరియు ఆన్‌లైన్ ట్రేడింగ్ కి పర్ఫెక్ట్." },
  { key: "germany", name: "జర్మనీ (Germany)", rulingPlanet: 9, significance: "కుజుడు (Mars)", details: "ఆటోమొబైల్స్, హెవీ ఇంజనీరింగ్ మరియు గేమింగ్ గేమ్ డెవలప్‌మెంట్ కి అనుకూలం." },
  { key: "japan", name: "జపాన్ (Japan)", rulingPlanet: 8, significance: "శనిదేవుడు (Saturn)", details: "రోబోటిక్స్, హార్డ్‌వేర్, దీర్ఘకాలిక పరిశ్రమలు మరియు ఉత్పత్తి తయారీకి అనుకూలం." },
  { key: "australia", name: "ఆస్ట్రేలియా (Australia)", rulingPlanet: 3, significance: "గురు గ్రహం (Jupiter)", details: "వ్యవసాయం, విద్యా సంస్థలు, హాస్పిటాలిటీ మరియు పర్యాటక రంగాలకు బలం." },
  { key: "canada", name: "కెనడా (Canada)", rulingPlanet: 2, significance: "చంద్ర గ్రహం (Moon)", details: "ఎడ్యుకేషన్, ఫుడ్ ఇండస్ట్రీ, కస్టమర్ సర్వీసెస్ మరియు కంటెంట్ క్రియేషన్ కి యోగం." },
  { key: "france", name: "ఫ్రాన్స్ (France)", rulingPlanet: 6, significance: "శుక్ర గ్రహం (Venus)", details: "ఫ్యాషన్ బ్రాండ్స్, ఆర్ట్, సౌందర్య సాధనాలు మరియు డిజైన్స్ వ్యాపారాలకు శుభకరం." },
  { key: "switzerland", name: "స్విట్జర్లాండ్ (Switzerland)", rulingPlanet: 5, significance: "బుధుడు (Mercury)", details: "గ్లోబల్ బ్యాంకింగ్, లగ్జరీ వాచీలు, మరియు ఫార్మాసియుటికల్స్ కి అనుకూలం." },
  { key: "saudi", name: "సౌదీ అరేబియా (Saudi Arabia)", rulingPlanet: 9, significance: "కుజుడు (Mars)", details: "ఆయిల్ ఎగుమతులు, భారీ ఇన్‌ఫ్రాస్ట్రక్చర్, మరియు లాజిస్టిక్స్ కి ప్రసిద్ధి." },
  { key: "italy", name: "ఇటలీ (Italy)", rulingPlanet: 1, significance: "సూర్యుడు (Sun)", details: "డిజైనర్ బ్రాండ్స్, వస్త్ర కళలు, ఫుడ్ రీటైలింగ్ వ్యాపారాలకు అత్యుత్తమం." },
  { key: "newzealand", name: "న్యూజిలాండ్ (New Zealand)", rulingPlanet: 3, significance: "గురుడు (Jupiter)", details: "ఆర్గానిక్ ఫుడ్స్, డైరీ డైరెక్ట్ ఎగుమతులు మరియు టూరిజం వ్యాపారాలకు యోగం." },
  { key: "southafrica", name: "సౌత్ ఆఫ్రికా (South Africa)", rulingPlanet: 4, significance: "రాహువు (Rahu)", details: "ఖనిజాలు, విలువైన లోహాలు (గోల్డ్, డైమండ్స్) మరియు నెట్‌వర్కింగ్ రంగానికి బలం." }
];

function translitTeluguToEnglish(str) {
  if (!str) return "";
  const mapping = {
    'అ': 'A', 'ఆ': 'A', 'ఇ': 'I', 'ఈ': 'EE', 'ఉ': 'U', 'ఊ': 'OO', 'ఋ': 'RU', 'ఎ': 'E', 'ఏ': 'AE', 'ఐ': 'AI', 'ఒ': 'O', 'ఓ': 'OO', 'ఔ': 'OU',
    'క': 'K', 'ఖ': 'KH', 'గ': 'G', 'ఘ': 'GH', 'ఙ': 'NG',
    'చ': 'CH', 'ఛ': 'CH', 'జ': 'J', 'झ': 'JH', 'ఞ': 'NY',
    'ట': 'T', 'ఠ': 'TH', 'డ': 'D', 'ఢ': 'DH', 'ణ': 'N',
    'త': 'T', 'థ': 'TH', 'ద': 'D', 'ధ': 'DH', 'న': 'N',
    'ప': 'P', 'ఫ': 'PH', 'బ': 'B', 'భ': 'BH', 'మ': 'M',
    'య': 'Y', 'ర': 'R', 'ల': 'L', 'వ': 'V', 'శ': 'S', 'ష': 'SH', 'స': 'S', 'హ': 'H', 'ళ': 'L', 'క్ష': 'KSH',
    'ా': 'A', 'ి': 'I', 'ీ': 'EE', 'ు': 'U', 'ూ': 'OO', 'ృ': 'RU', 'ె': 'E', 'ే': 'AE', 'ై': 'AI', 'ొ': 'O', 'ో': 'OO', 'ౌ': 'OU', 'ం': 'M'
  };
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    result += mapping[char] || char;
  }
  return result;
}

export default function App() {
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('06:00'); 
  
  const [selectedCategories, setSelectedCategories] = useState(['luxury']);
  const [selectedNakshatra, setSelectedNakshatra] = useState(NAKSHATRAS[0].name);
  const [selectedRashi, setSelectedRashi] = useState(RASHIS[0].name);
  const [birthPlace, setBirthPlace] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [targetPlanets, setTargetPlanets] = useState([]);
  const [partners, setPartners] = useState([]);

  const toggleCategory = (catKey) => {
    if (selectedCategories.includes(catKey)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(k => k !== catKey));
      } else {
        setAlertMsg("కనీసం ఒక వ్యాపార విభాగం ఎంచుకోవాలి (At least one category is required).");
      }
    } else {
      if (selectedCategories.length < 3) {
        setSelectedCategories([...selectedCategories, catKey]);
      } else {
        setAlertMsg("గరిష్టంగా 3 విభాగాలు మాత్రమే ఎంచుకోగలరు (Max 3 categories allowed).");
      }
    }
  };

  const toggleTargetPlanet = (numStr) => {
    if (targetPlanets.includes(numStr)) {
      setTargetPlanets(targetPlanets.filter(n => n !== numStr));
    } else {
      if (targetPlanets.length < 3) {
        setTargetPlanets([...targetPlanets, numStr]);
      } else {
        setAlertMsg("గరిష్టంగా 3 గ్రహాలను మాత్రమే ఎంచుకోగలరు (Max 3 target planets allowed).");
      }
    }
  };

  const addPartner = () => {
    setPartners([...partners, { 
      id: Date.now(), 
      name: '', 
      dob: '', 
      nakshatra: NAKSHATRAS[0].name, 
      rashi: RASHIS[0].name 
    }]);
  };

  const removePartner = (id) => {
    setPartners(partners.filter(p => p.id !== id));
  };

  const updatePartner = (id, field, value) => {
    setPartners(partners.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60); 
  const [loadingText, setLoadingText] = useState('');
  const [report, setReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('mha_synthesis');
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    let timer;
    if (loading && countdown > 0) {
      if (countdown > 50) setLoadingText("సూర్యోదయ సమయం ప్రకారం మీ జన్మ లగ్నాన్ని లెక్కిస్తున్నాము...");
      else if (countdown > 40) setLoadingText("జన్మ రాశి, జన్మ నక్షత్రం, 100+ వేద యోగాలను సరిపోలుస్తున్నాము...");
      else if (countdown > 30) setLoadingText("పంచధా మైత్రి (5-Fold Relationships) మరియు తారా బలాన్ని అంచనా వేస్తున్నాము...");
      else if (countdown > 20) setLoadingText("భాగస్వాముల గ్రహాలు మరియు గ్రహాతీత వజ్ర కవచ బలాన్ని లెక్కిస్తున్నాము...");
      else if (countdown > 10) setLoadingText("ఎంచుకున్న బహుళ వ్యాపార రంగాలకు సరిపడే సమతుల్య గ్రహ బలాన్ని ఫైండ్ చేస్తున్నాము...");
      else setLoadingText("వ్యాపార అభివృద్ధి టైమ్‌లైన్ మరియు ఫైనల్ నివేదికను సిద్ధం చేస్తున్నాము...");
      
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (loading && countdown === 0) {
      processFinalReport();
    }
    return () => clearTimeout(timer);
  }, [loading, countdown]);

  const getSingleDigit = (num) => {
    if (num <= 0) return 5; 
    let s = num;
    while (s > 9) {
      s = s.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return s === 0 ? 5 : s;
  };

  const handleDemoFill = () => {
    setOwnerName('Kalyan Ram');
    setBusinessName('Mercury Dynamics'); 
    setDob('1992-06-23'); 
    setTob('14:30'); 
    setBirthPlace('Visakhapatnam');
    setSearchCity('Hyderabad'); 
    setSelectedNakshatra('రోహిణి (Rohini)'); 
    setSelectedRashi('వృషభం (Taurus)');
    setSelectedCategories(['tech', 'gaming']); 
    setTargetPlanets(['5', '6']); 
    
    setPartners([
      { id: 1, name: 'Siva Kumar', dob: '1990-08-15', nakshatra: 'మఖ (Magha)', rashi: 'సింహం (Leo)' },
      { id: 2, name: 'Anitha Devi', dob: '1994-02-10', nakshatra: 'శ్రవణం (Shravana)', rashi: 'మకరం (Capricorn)' }
    ]);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!ownerName || !businessName || !dob || !tob || !birthPlace) {
      setAlertMsg("దయచేసి అన్ని వివరాలు మరియు పుట్టిన సమయాన్ని ఖచ్చితంగా నమోదు చేయండి.");
      return;
    }
    if (selectedCategories.length === 0) {
      setAlertMsg("దయచేసి కనీసం ఒక వ్యాపార విభాగాన్ని ఎంచుకోండి.");
      return;
    }
    setCountdown(60); 
    setLoading(true);
  };

  const processFinalReport = () => {
    const convertedBizName = translitTeluguToEnglish(businessName);
    const convertedOwnerName = translitTeluguToEnglish(ownerName);
    const cleanBizName = convertedBizName.toUpperCase().replace(/[^A-Z]/g, '') || "MERCURY";

    let chaldeanTotal = 0;
    cleanBizName.split('').forEach(char => {
      chaldeanTotal += CHALDEAN_MAP[char] || 0;
    });
    const chaldeanSingle = getSingleDigit(chaldeanTotal);

    let pythagoreanTotal = 0;
    cleanBizName.split('').forEach(char => {
      pythagoreanTotal += PYTHAGOREAN_MAP[char] || 0;
    });
    const pythagoreanSingle = getSingleDigit(pythagoreanTotal);

    let kabbalahTotal = 0;
    cleanBizName.split('').forEach(char => {
      kabbalahTotal += KABBALAH_MAP[char] || 0;
    });
    const kabbalahSingle = getSingleDigit(kabbalahTotal);

    const dobDigits = dob.replace(/[^0-9]/g, '');
    const dayDigits = dob.split('-')[2];
    const mulank = getSingleDigit(parseInt(dayDigits) || 1);
    const dobSum = dobDigits.split('').reduce((sum, d) => sum + parseInt(d), 0);
    const lifePathNumber = getSingleDigit(dobSum);

    const isDriverConductorEnemy = getPlanetRelation(mulank, lifePathNumber).score < 0;

    let ownerNameTotal = 0;
    convertedOwnerName.toUpperCase().replace(/[^A-Z]/g, '').split('').forEach(char => {
      ownerNameTotal += CHALDEAN_MAP[char] || 0;
    });
    const ownerDestinyNumber = getSingleDigit(ownerNameTotal);

    const loshuMap = { 4: "", 9: "", 2: "", 3: "", 5: "", 7: "", 8: "", 1: "", 6: "" };
    dobDigits.split('').forEach(digit => {
      if (loshuMap[digit] !== undefined) {
        loshuMap[digit] += digit;
      }
    });

    const birthDateObj = new Date(dob);
    const birthMonth = birthDateObj.getMonth();
    const birthDayNum = birthDateObj.getDate();

    let sunRashiIndex = 0; 
    if (birthMonth === 0) sunRashiIndex = birthDayNum < 14 ? 8 : 9; 
    else if (birthMonth === 1) sunRashiIndex = birthDayNum < 13 ? 9 : 10; 
    else if (birthMonth === 2) sunRashiIndex = birthDayNum < 14 ? 10 : 11; 
    else if (birthMonth === 3) sunRashiIndex = birthDayNum < 14 ? 11 : 0; 
    else if (birthMonth === 4) sunRashiIndex = birthDayNum < 14 ? 0 : 1; 
    else if (birthMonth === 5) sunRashiIndex = birthDayNum < 14 ? 1 : 2; 
    else if (birthMonth === 6) sunRashiIndex = birthDayNum < 16 ? 2 : 3; 
    else if (birthMonth === 7) sunRashiIndex = birthDayNum < 16 ? 3 : 4; 
    else if (birthMonth === 8) sunRashiIndex = birthDayNum < 16 ? 4 : 5; 
    else if (birthMonth === 9) sunRashiIndex = birthDayNum < 17 ? 5 : 6; 
    else if (birthMonth === 10) sunRashiIndex = birthDayNum < 16 ? 6 : 7; 
    else if (birthMonth === 11) sunRashiIndex = birthDayNum < 16 ? 7 : 8; 

    const [hours, mins] = tob.split(':').map(Number);
    const birthMinutesFromMidnight = hours * 60 + mins;
    const sunriseMinutes = 360; 
    
    let diffMinutes = birthMinutesFromMidnight - sunriseMinutes;
    if (diffMinutes < 0) diffMinutes += 1440; 

    const lagnaShift = Math.floor(diffMinutes / 120); 
    const calculatedLagnaIndex = (sunRashiIndex + lagnaShift) % 12;
    const activeLagna = RASHIS[calculatedLagnaIndex];

    const lagnaTimeline = [];
    for (let i = 0; i < 12; i++) {
      const currentRashiIndex = (sunRashiIndex + i) % 12;
      const startHour = (6 + i * 2) % 24;
      const endHour = (6 + (i + 1) * 2) % 24;

      const formatHourString = (h) => {
        const period = h >= 12 ? "PM" : "AM";
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${displayH.toString().padStart(2, '0')}:00 ${period}`;
      };

      const startTotalMins = (360 + i * 120) % 1440;
      const endTotalMins = (360 + (i + 1) * 120) % 1440;
      
      let isUserSlot = false;
      if (startTotalMins < endTotalMins) {
        isUserSlot = birthMinutesFromMidnight >= startTotalMins && birthMinutesFromMidnight < endTotalMins;
      } else {
        isUserSlot = birthMinutesFromMidnight >= startTotalMins || birthMinutesFromMidnight < endTotalMins;
      }

      lagnaTimeline.push({
        slotTime: `${formatHourString(startHour)} - ${formatHourString(endHour)}`,
        rashi: RASHIS[currentRashiIndex],
        isUserSlot
      });
    }

    const nakshatraObj = NAKSHATRAS.find(n => n.name === selectedNakshatra) || NAKSHATRAS[0];
    const bizFirstLetter = cleanBizName.charAt(0);
    const bizFirstLetterNak = NAKSHATRAS.find(n => n.letters.includes(bizFirstLetter)) || NAKSHATRAS[0];
    const bizYoni = bizFirstLetterNak.yoni;
    const bizGana = bizFirstLetterNak.gana;

    const matchedBizRashi = RASHIS.find(r => r.letters.includes(bizFirstLetter)) || RASHIS[0];
    const ownerRashiObj = RASHIS.find(r => r.name === selectedRashi) || RASHIS[0];

    const isYoniClash = YONI_MAHA_VAIRA[nakshatraObj.yoni] === bizYoni;
    const ownerPlanet = PLANETS[lifePathNumber] || PLANETS[5];
    const businessPlanet = PLANETS[chaldeanSingle] || PLANETS[5];
    
    // Panchadha Maitri Logic
    const ownerBizRelation = getPlanetRelation(lifePathNumber, chaldeanSingle);
    const isEnemeyVibe = ownerBizRelation.score < 0;

    const ownerRashiLordPlanet = PLANETS[ownerRashiObj.lordNum] || PLANETS[5];
    const bizRashiLordPlanet = PLANETS[matchedBizRashi.lordNum] || PLANETS[5];
    const rashiRelation = getPlanetRelation(ownerRashiObj.lordNum, matchedBizRashi.lordNum);
    const isRashiLordEnemy = rashiRelation.score < 0;

    let ganaMatchStatus = "అనుకూలం (Peaceful)";
    if ((nakshatraObj.gana.includes("Rakshasa") && bizGana.includes("Deva")) || 
        (nakshatraObj.gana.includes("Deva") && bizGana.includes("Rakshasa"))) {
      ganaMatchStatus = "తీవ్ర వైరుధ్యం (Hostile Gana Clash)";
    } else if (bizGana.includes("Rakshasa")) {
      ganaMatchStatus = "ఉద్వేగభరిత గణం (Friction Risk)";
    }

    // Tara Bala Calculation
    const ownerNakIndex = NAKSHATRAS.findIndex(n => n.name === selectedNakshatra);
    const bizNakIndex = NAKSHATRAS.findIndex(n => n.name === bizFirstLetterNak.name);
    const taraDistance = ((bizNakIndex - ownerNakIndex + 27) % 27) + 1;
    const taraRemainder = taraDistance % 9;

    const taraTypes = {
      1: { name: "జన్మ తార (Janma)", status: "మధ్యమం / అశాంతి", type: "neutral", desc: "వ్యాపారంలో మానసిక ఒత్తిడి, పోరాటం మరియు అనవసరపు భయాలు తెస్తుంది." },
      2: { name: "సంపత్ తార (Sampat)", status: "అత్యంత శుభప్రదం", type: "good", desc: "అఖండ ఐశ్వర్యం, కస్టమర్ల ఆకర్షణ మరియు స్థిరమైన ఆర్థిక లాభాలను ఇస్తుంది." },
      3: { name: "విపత్ తార (Vipat)", status: "ప్రమాదకరం", type: "bad", desc: "అకస్మాత్తుగా నష్టాలు, ప్రభుత్వ అధికారులతో లేదా భాగస్వాములతో గొడవలు తెస్తుంది." },
      4: { name: "క్షేమ తార (Kshema)", status: "శుభప్రదం", type: "good", desc: "లక్ష్మీ కటాక్షం, రక్షణ, క్షేమం మరియు నిలకడైన వ్యాపార వృద్ధిని ఇస్తుంది." },
      5: { name: "ప్రత్యక్ తార (Pratyak)", status: "ఆటంకాలు", type: "bad", desc: "చేసే ప్రతి పనిలో అడ్డంకులు, ఆర్డర్స్ ఆగిపోవడం మరియు ఆందోళన ఎదురవుతాయి." },
      6: { name: "సాధన తార (Sadhana)", status: "అద్భుత విజయం", type: "good", desc: "మీ పట్టుదలతో సాధించే అఖండ విజయం, పేరు ప్రఖ్యాతులు మరియు కీర్తిని ఇస్తుంది." },
      7: { name: "నైధన తార (Naidhana)", status: "అత్యంత ప్రమాదకరం (వద్దు)", type: "bad", desc: "తీవ్ర నష్టాలు, వ్యాపార నిలిపివేత, దివాలా తీయడం మరియు కష్టాలను తెస్తుంది." },
      8: { name: "మిత్ర తార (Mitra)", status: "శుభకరం", type: "good", desc: "నమ్మకమైన కస్టమర్లు, నెట్‌వర్క్ పెరుగుదల మరియు అద్భుతమైన ఆనందం." },
      0: { name: "పరమ మిత్ర తార (Parama Mitra)", status: "అత్యంత శుభకరం", type: "good", desc: "అద్భుతమైన ప్రజాదరణ, మార్కెట్లో ఏకఛత్రాధిపత్యం మరియు గ్లోబల్ కీర్తి." }
    };
    const taraResult = taraTypes[taraRemainder];

    // Pancha Tatva Synergy
    const ownerElement = ownerPlanet.element;
    const bizElement = businessPlanet.element;
    let tatvaStatus = "సమతుల్యం (Balanced Nature)";
    if ((ownerElement === "అగ్ని" && bizElement === "నీరు") || (ownerElement === "నీరు" && bizElement === "అగ్ని")) {
        tatvaStatus = "పరమ శత్రుత్వం (Fire vs Water Clash) - వ్యాపారంలో ఒడిదుడుకులు";
    } else if ((ownerElement === "అగ్ని" && bizElement === "వాయువు") || (ownerElement === "వాయువు" && bizElement === "అగ్ని")) {
        tatvaStatus = "అద్భుత మిత్రత్వం (Fire & Air Synergy) - వేగవంతమైన వ్యాప్తి";
    } else if ((ownerElement === "భూమి" && bizElement === "నీరు") || (ownerElement === "నీరు" && bizElement === "భూమి")) {
        tatvaStatus = "సారవంతమైన వృద్ధి (Earth & Water Synergy) - స్థిరమైన సంపద";
    } else if (ownerElement === bizElement) {
        tatvaStatus = "ఏక తత్వ బలం (Same Element Power) - అత్యంత అనుకూలం";
    }

    const selectedCatObjs = selectedCategories.map(k => BUSINESS_CATEGORIES[k]).filter(Boolean);
    if(selectedCatObjs.length === 0) selectedCatObjs.push(BUSINESS_CATEGORIES.luxury); 
    
    let categoryMatches = selectedCatObjs.map(cat => {
      const pNum = cat.rulingPlanet;
      const pObj = PLANETS[pNum];
      const rel = getPlanetRelation(pNum, chaldeanSingle);
      return {
        catName: cat.name,
        planetNum: pNum,
        planetName: pObj.name,
        isMatch: pNum === chaldeanSingle,
        isEnemy: rel.score < 0,
        isFriend: rel.score > 0,
        relationText: rel.text
      };
    });

    const isAnyCategoryEnemy = categoryMatches.some(c => c.isEnemy);
    const isAnyCategoryMatch = categoryMatches.some(c => c.isMatch);

    let processedPartners = [];
    let commonFriendlyNumbers = [...ownerPlanet.atiMitra, ...ownerPlanet.mitra];
    let partnerScoreDeduction = 0;

    if (partners.length > 0) {
      partners.forEach(partner => {
        if (!partner.dob) return;
        const pDobDigits = partner.dob.replace(/[^0-9]/g, '');
        const pDobSum = pDobDigits.split('').reduce((sum, d) => sum + parseInt(d), 0);
        const partnerLifePath = getSingleDigit(pDobSum);
        const partnerPlanet = PLANETS[partnerLifePath] || PLANETS[5];

        const pOwnerRel = getPlanetRelation(lifePathNumber, partnerLifePath);
        const pBizRel = getPlanetRelation(partnerLifePath, chaldeanSingle);
        
        const isPartnerOwnerEnemy = pOwnerRel.score < 0;
        const isPartnerBizEnemy = pBizRel.score < 0;

        if (isPartnerOwnerEnemy) partnerScoreDeduction += Math.abs(pOwnerRel.score);
        if (isPartnerBizEnemy) partnerScoreDeduction += Math.abs(pBizRel.score);

        commonFriendlyNumbers = commonFriendlyNumbers.filter(f => partnerPlanet.atiMitra.includes(f) || partnerPlanet.mitra.includes(f));

        processedPartners.push({
          ...partner,
          partnerLifePath,
          partnerPlanet,
          isPartnerOwnerEnemy,
          isPartnerBizEnemy,
          ownerRelText: pOwnerRel.text,
          bizRelText: pBizRel.text,
          partnerRashiObj: RASHIS.find(r => r.name === partner.rashi) || RASHIS[0]
        });
      });
    }

    if (commonFriendlyNumbers.length === 0) {
      commonFriendlyNumbers = [5, 6]; 
    }

    const words = businessName.trim().split(/\s+/).filter(w => w.length > 0);
    let multiWordAnalysis = {
      isMulti: words.length > 1,
      words: [],
      hasEnmity: false,
      enmityDetails: []
    };

    if (words.length > 0) {
      words.forEach((w) => {
        let wVal = 0;
        translitTeluguToEnglish(w).toUpperCase().replace(/[^A-Z]/g, '').split('').forEach(ch => { wVal += CHALDEAN_MAP[ch] || 0; });
        const wSingle = getSingleDigit(wVal);
        multiWordAnalysis.words.push({
          word: w,
          single: wSingle,
          planet: PLANETS[wSingle] || PLANETS[5]
        });
      });

      if (multiWordAnalysis.isMulti) {
        for (let i = 0; i < multiWordAnalysis.words.length; i++) {
          for (let j = i + 1; j < multiWordAnalysis.words.length; j++) {
            const s1 = multiWordAnalysis.words[i].single;
            const p1 = multiWordAnalysis.words[i].planet;
            const s2 = multiWordAnalysis.words[j].single;
            const p2 = multiWordAnalysis.words[j].planet;
            
            const rel = getPlanetRelation(s1, s2);
            if (rel.score < 0) {
              multiWordAnalysis.hasEnmity = true;
              multiWordAnalysis.enmityDetails.push(`'${multiWordAnalysis.words[i].word}' (${p1.name}) మరియు '${multiWordAnalysis.words[j].word}' (${p2.name}) మధ్య ${rel.text}`);
            }
          }
        }
      }
    }

    let matchScore = 10;
    if (ownerBizRelation.score < 0) matchScore += ownerBizRelation.score; // adds negative value
    else if (ownerBizRelation.score > 0) matchScore += 1;
    
    if (rashiRelation.score < 0) matchScore -= 2;
    if (isYoniClash) matchScore -= 2;
    if (ganaMatchStatus.includes("తీవ్ర")) matchScore -= 2;
    else if (ganaMatchStatus.includes("ఉద్వేగభరిత")) matchScore -= 1;
    if (isDriverConductorEnemy) matchScore -= 1;
    if (isAnyCategoryEnemy) matchScore -= 1; 
    
    if (taraResult.type === 'bad') matchScore -= 2.5;
    else if (taraResult.type === 'good') matchScore += 1;
    
    if (tatvaStatus.includes("శత్రుత్వం")) matchScore -= 1;
    
    matchScore -= partnerScoreDeduction; 
    matchScore = Math.min(10, Math.max(matchScore, 2));
    const finalRatingOutOf10 = parseFloat(matchScore.toFixed(1));

    let remedyList = [];
    if (finalRatingOutOf10 < 10) {
      if (processedPartners.length > 0) {
        let ownerClashPartners = processedPartners.filter(p => p.isPartnerOwnerEnemy).map(p => p.name).join(", ");
        if (ownerClashPartners) {
          remedyList.push({
            type: "భాగస్వామి - యజమాని వైరుధ్యం (Partner Clash)",
            solution: `యజమాని జాతకానికి మరియు భాగస్వాములైన [${ownerClashPartners}] గ్రహాలకు మధ్య శత్రుత్వం ఉంది. మీ అందరికీ వ్యాపార నామం వంతెనలా (Bridge) పనిచేయాలి కాబట్టి, సయుక్త సంఖ్యను మీ అందరికీ మిత్రులైన [${commonFriendlyNumbers.join(", ")}] సంఖ్యల్లో ఏదో ఒకదానికి మార్చుకోవాలి.`
          });
        }
        let bizClashPartners = processedPartners.filter(p => p.isPartnerBizEnemy && !p.isPartnerOwnerEnemy).map(p => p.name).join(", ");
        if (bizClashPartners) {
          remedyList.push({
            type: "భాగస్వామి - వ్యాపార నామ శత్రుత్వం",
            solution: `యజమానికి పేరు బాగానే ఉన్నప్పటికీ, భాగస్వాములైన [${bizClashPartners}] కి ఈ వ్యాపార సంఖ్య పడటం లేదు. కాబట్టి పేరులో అక్షరాలను మార్చి మీ అందరికీ ఉమ్మడిగా సరిపోయే సంఖ్య [${commonFriendlyNumbers.join(", ")}] కు సెట్ చేయండి.`
          });
        }
      }
      if (isEnemeyVibe) {
        const friendlyNumbers = [...ownerPlanet.atiMitra, ...ownerPlanet.mitra].join(", ");
        remedyList.push({
          type: "గ్రహ శత్రుత్వ దోషం (Planet Clash)",
          solution: `మీ జాతకానికి ${businessPlanet.name} (${chaldeanSingle}) శత్రు గ్రహం. దీనికి బదులుగా మీరు పేరు చివరలో 'S' లేదా 'A' అక్షరాలను జోడించడం ద్వారా మొత్తం సయుక్త సంఖ్యను మీ మిత్ర సంఖ్యలైన [${friendlyNumbers}] లో ఏదో ఒక దానికి మారేలా స్పెల్లింగ్ మార్చుకోండి.`
        });
      }
      if (isRashiLordEnemy || isYoniClash || ganaMatchStatus.includes("తీవ్ర")) {
        const goodLetters = ownerRashiObj.letters.join(", ");
        remedyList.push({
          type: "ప్రారంభ అక్షర దోషం (Starting Letter Clash)",
          solution: `వ్యాపారం పేరు యొక్క మొదటి అక్షరం ('${bizFirstLetter}') మీ జన్మ రాశి/నక్షత్రంతో తీవ్ర ఘర్షణ పడుతోంది. ఈ దోషాన్ని పోగొట్టడానికి, మీ మిత్ర రాశి అక్షరాలైన [${goodLetters}] తో మొదలయ్యేలా పేరు ముందు 'Sri' లేదా 'The' వంటి పదాలను జోడించి లేదా కొత్త పేరును ఎంచుకోండి.`
        });
      }
      if (isDriverConductorEnemy) {
        remedyList.push({
          type: "డ్రైవర్-కండక్టర్ విరోధం (Inner Destiny Clash)",
          solution: `మీ పుట్టిన తేదీలో అంతర్గత విరోధం ఉంది. కాబట్టి వ్యాపార పేరు తప్పనిసరిగా 'బుధుడు (5)' లేదా 'గురుడు (3)' సంఖ్యకు వచ్చేలా ('E', 'N', లేదా 'G' అక్షరాలను జోడించడం ద్వారా) మార్చుకోండి. ఇది మీకు 100% సేఫ్టీ ఇస్తుంది.`
        });
      }
      if (isAnyCategoryEnemy) {
         let enemyCats = categoryMatches.filter(c => c.isEnemy).map(c => c.catName).join(", ");
         remedyList.push({
            type: "వ్యాపార రంగ శత్రుత్వం (Category Clash)",
            solution: `మీరు ఎంచుకున్న [${enemyCats}] రంగాలకు మరియు మీ వ్యాపార సంఖ్య ${chaldeanSingle} కి వైరుధ్యం ఉంది. ఈ రంగాల్లో రాణించాలంటే పేరు స్పెల్లింగ్ మార్చి బ్యాలెన్స్డ్ గ్రహ బలాన్ని ఆకర్షించండి.`
         });
      }
      if (remedyList.length === 0) {
        remedyList.push({
          type: "సాధారణ సంఖ్యా సవరణ (General Numerology Tweak)",
          solution: `ఈ పేరులో చిన్నపాటి వైరుధ్యాలు ఉన్నాయి. మీ అదృష్ట సంఖ్య ${ownerPlanet.lordKey === "Mercury" ? 5 : 1} వచ్చేలా పేరులో అదనంగా ఒక 'A' లేదా 'I' అక్షరాన్ని కలిపి (ఉదాహరణకు: Dynamics బదులు Dynamicss) రిజిస్టర్ చేసుకోండి.`
        });
      }
    }

    const friendlyRashiIds = ownerRashiObj.friendlyRashis || [2, 6, 1]; 
    const friendlyRashiList = friendlyRashiIds.map(id => RASHIS.find(r => r.id === id)).filter(Boolean);

    let mitraRashiSuggestions = [];
    friendlyRashiList.forEach((friendlyRashi) => {
      const letter = friendlyRashi.letters[0]; 
      const proposedMitraName = `${letter}avish Global`;
      const proposedMitraName2 = `Sri ${letter}asvi Group`;

      [proposedMitraName, proposedMitraName2].forEach(mName => {
        let mVal = 0;
        mName.toUpperCase().replace(/[^A-Z]/g, '').split('').forEach(ch => {
          mVal += CHALDEAN_MAP[ch] || 0;
        });
        const mSingle = getSingleDigit(mVal);
        mitraRashiSuggestions.push({
          name: mName,
          singleNum: mSingle,
          totalVal: mVal,
          mitraRashiName: friendlyRashi.name,
          lord: PLANETS[friendlyRashi.lordNum]?.name || "బుధుడు",
          reason: `ఇది మీ అత్యంత అనుకూల మిత్ర రాశి అయిన "${friendlyRashi.name}" ధ్వని తరంగాలతో కూడిన పేరు. ఒకవేళ మీ జన్మ రాశి బలహీనంగా ఉన్న సమయాలలో కూడా ఈ పేరు మీకు అఖండ ఐశ్వర్యాన్ని, రక్షణను అందిస్తుంది.`
        });
      });
    });

    const shieldedCompoundNumbers = [14, 15, 19, 23, 24, 32, 33, 37, 41, 45, 46, 50, 51];
    const hasTransitShield = shieldedCompoundNumbers.includes(chaldeanTotal);
    const transitImmunityScore = hasTransitShield ? 98 : (chaldeanSingle === 5 || chaldeanSingle === 6) ? 85 : 55;

    let shieldType = "సాధారణ కవచం (Standard Shield)";
    let shieldDesc = "ఈ పేరు గోచార శని మరియు రాహు ప్రభావాలను పాక్షికంగా మాత్రమే అడ్డుకోగలదు. తీవ్ర ప్రతికూల గ్రహ సంచార కాలాల్లో వ్యాపారంలో కాస్త నెమ్మదితనం ఉండవచ్చు.";
    if (transitImmunityScore >= 95) {
      shieldType = "వజ్ర గ్రహ రక్షణ కవచం (Diamond Astro Shield)";
      shieldDesc = "అత్యంత శక్తివంతమైన సయుక్త సంఖ్యా బలం ఉండటం వల్ల, శని దేవుని ఏల్నాటి శని కాలం కానీ, రాహువు శత్రు సంచారం కానీ మీ వ్యాపార లాభాల ప్రవాహాన్ని తాకలేవు. ఈ పేరు దైవిక ఫ్రీక్వెన్సీలో పనిచేస్తూ నిరంతరం ఎదుగుతూనే ఉంటుంది!";
    } else if (transitImmunityScore >= 80) {
      shieldType = "సువర్ణ రక్షణ కవచం (Golden Astro Shield)";
      shieldDesc = "బుధ, శుక్ర గ్రహాల సానుకూల ప్రభావం వల్ల వ్యాపార లావాదేవీలు మరియు కస్టమర్ల ఆదరణ గోచార నెగటివ్ గ్రహ ప్రభావాల వల్ల ఆగిపోదు. చాలా సేఫ్ మరియు సురక్షితమైన పేరు.";
    }

    const luckyColorName = businessPlanet.color;
    const recommendedLogoPalette = {
      1: { name: "సూర్య తేజస్సు ప్యాలెట్ (Sun Gold)", colors: ["#F59E0B", "#EF4444", "#FFF9E6"], shape: "గుండ్రటి వృత్తం లేదా సూర్య కిరణాల ఆకారం (Circular / Sunburst)", symbol: "సింహం, సూర్యుడు, లేదా ఎదుగుతున్న బాణం (Lion / Rising Arrow)" },
      2: { name: "చాంద్ర సౌమ్య ప్యాలెట్ (Pearl Cream)", colors: ["#FFFFFF", "#E2E8F0", "#38BDF8"], shape: "అలల వంటి తరంగాలు లేదా అర్ధ చంద్రాకారం (Waves / Moon Crescent)", symbol: "కమలం, జల చిహ్నాలు, లేదా మృదువైన వృత్తం (Lotus / Soft Curves)" },
      3: { name: "గురు బ్రాండ్ ప్యాలెట్ (Saffron Sahu)", colors: ["#F59E0B", "#D97706", "#FFFFFF"], shape: "త్రిభుజాకారం లేదా పటిష్టమైన చతురస్రం (Triangle / Solid Square)", symbol: "పుస్తకం, దైవిక గుర్తు, లేదా పైకి వెళ్లే రేఖలు (Holy symbols / Upward Lines)" },
      4: { name: "రాహు డిజిటల్ ప్యాలెట్ (Neon Gray)", colors: ["#3B82F6", "#475569", "#1E293B"], shape: "అబ్‌స్ట్రాక్ట్ లేదా సరిహద్దులు లేని వినూత్న ఆకారం (Abstract / Futuristic)", symbol: "డిజిటల్ గ్రిడ్, గ్లోబ్, లేదా మెరుపు తీగ (Tech grids / Flash symbol)" },
      5: { name: "బుధ వాణిజ్య ప్యాలెట్ (Emerald Green)", colors: ["#10B981", "#059669", "#ECFDF5"], shape: "అండాకారం లేదా ఆకు ఆకారం (Oval / Leaf shape)", symbol: "వృక్షం, నాణేలు, లేదా కమ్యూనికేషన్ బబుల్ (Tree / Coins / Chat bubble)" },
      6: { name: "శుక్ర లగ్జరీ ప్యాలెట్ (Pastel Pink)", colors: ["#EC4899", "#F472B6", "#FFFFFF"], shape: "నక్షత్రం లేదా డైమండ్ ఆకారం (Star / Diamond shape)", symbol: "వజ్రం, పూల గుచ్ఛం, లేదా అందమైన కర్సివ్ అక్షరం (Flower / Elegant typography)" },
      7: { name: "కేతు కాస్మిక్ ప్యాలెట్ (Aqua Spirit)", colors: ["#06B6D4", "#0891B2", "#F0FDFA"], shape: "సర్పిలాకారం లేదా సహజమైన ఫ్రీఫార్మ్ (Spiral / Freeform structure)", symbol: "త్రిశూలం, ఆధ్యాత్మిక గుర్తులు, లేదా చక్రం (Chakra / Spiral wave)" },
      8: { name: "శని స్థిరత్వ ప్యాలెట్ (Royal Navy Blue)", colors: ["#1E3A8A", "#0F172A", "#FFFFFF"], shape: "షట్కోణ ఆకారం లేదా పర్వత ఆకారం (Hexagon / Mountain style)", symbol: "నిర్మాణ ఇటుక, భీమ్, లేదా బలమైన పునాది స్తంభాలు (Pillar / Mountain lines)" },
      9: { name: "కుజ శౌర్య ప్యాలెట్ (Crimson Red)", colors: ["#DC2626", "#991B1B", "#FFF5F5"], shape: "దుమ్ము రేపే కోణాలు లేదా ఈటె ఆకారం (Sharp angles / Arrow heads)", symbol: "అగ్ని జ్వాల, త్రిశూలం, లేదా వేగవంతమైన రేసింగ్ గీతలు (Flame / Sharp arrows)" }
    }[chaldeanSingle] || { name: "యూనివర్సల్ ప్యాలెట్ (Multi-business)", colors: ["#F59E0B", "#10B981", "#FFFFFF"], shape: "వృత్తాకారం", symbol: "అదృష్ట గుర్తులు" };

    const rashiLordsBestFields = {
      "మేషం (Aries)": ["రియల్ ఎస్టేట్ & ఇన్‌ఫ్రా", "గేమింగ్ & ఈ-స్పోర్ట్స్", "హోటల్స్, రెస్టారెంట్స్ & ఫుడ్", "మెటల్ ట్రేడింగ్", "పోలీస్/సెక్యూరిటీ ఏజెన్సీలు"],
      "వృషభం (Taurus)": ["లగ్జరీ & ఫ్యాషన్ బుటిక్స్", "బంగారం, జ్యువెలరీ దుకాణం", "సినిమా, మీడియా ప్రొడక్షన్", "ఇంటి ఇంటీరియర్ డిజైన్స్", "కాస్మెటిక్స్ బ్రాండ్స్"],
      "మిథునం (Gemini)": ["సాఫ్ట్‌వేర్ & ఐటి సర్వీసెస్", "బ్లాగింగ్, యూట్యూబ్ & కంటెంట్ క్రియేషన్", "సోషల్ మీడియా ఏజెన్సీ", "స్టేషనరీ & ప్రింటింగ్", "షేర్ మార్కెట్ ట్రేడింగ్"],
      "కర్కాటకం (Cancer)": ["నిత్యావసరాలు & సూపర్ మార్కెట్", "పాల ఉత్పత్తులు & ఆర్గానిక్ వ్యవసాయం", "ఫారన్ కన్సల్టెన్సీ", "వాటర్ ప్లాంట్ & మినరల్స్", "రెస్టారెంట్ బిజినెస్"],
      "సింహం (Leo)": ["వైద్యం, క్లినిక్స్ & హాస్పిటల్స్", "ప్రభుత్వ కాంట్రాక్టులు", "బంగారు దుకాణం", "లీడర్‌షిప్ ట్రైనింగ్ సెంటర్స్", "ఫార్మాస్యూటికల్స్"],
      "కన్య (Virgo)": ["అకౌంటింగ్ & ఆడిటింగ్ సంస్థలు", "సాఫ్ట్‌వేర్ డెవలప్‌మెంట్", "కంటెంట్ రైటింగ్ & పాడ్‌కాస్ట్స్", "ఈ-కామర్స్ స్టోర్స్", "మందుల షాప్"],
      "తులా (Libra)": ["ఫ్యాషన్ డిజైనింగ్ & బట్టల షోరూమ్", "బ్యూటీ పార్లర్ & గ్లామర్ ప్రొడక్ట్స్", "ఈవెంట్ మేనేజ్‌మెంట్", "విలాసవంతమైన రియల్ ఎస్టేట్", "సినిమా డిస్ట్రిబ్యూషన్"],
      "వృశ్చికం (Scorpio)": ["గేమింగ్ అకాడమీలు", "భారీ యంత్రాలు & ఐరన్ వ్యాపారం", "రియల్ ఎస్టేట్ వెంచర్స్", "ఫుడ్ కేటరింగ్ & హోటల్స్", "ఫైర్ సేఫ్టీ వస్తువుల బిజినెస్"],
      "ధనస్సు (Sagittarius)": ["స్కూల్స్ & విద్యా సంస్థలు", "ఫైనాన్స్, బ్యాంకింగ్ & చిట్స్", "బుక్స్ పబ్లిషింగ్", "యోగ & ఆధ్యాత్మిక కేంద్రాన్ని నడపడం", "ఇన్వెస్ట్‌మెంట్ అడ్వైజరీ"],
      "మకరం (Capricorn)": ["ఇనుము, సిమెంట్ & కన్‌స్ట్రక్షన్ మెటీరియల్", "ట్రాన్స్‌పోర్ట్ & లాజిస్టిక్స్", "హార్డ్‌వేర్ షాప్స్", "మైనింగ్ వ్యాపారాలు", "వ్యవసాయ ఎగుమతులు"],
      "కుంభం (Aquarius)": ["సాఫ్ట్‌వేర్ స్టార్టప్స్", "సోషల్ మీడియా ఇన్ఫ్లూయెన్సర్ ఏజెన్సీ", "గ్యాడ్జెట్స్ & ఎలక్ట్రానిక్స్ షాప్", "మ్యానుఫ్యాక్చరింగ్ ఇండస్ట్రీ", "ట్రేడింగ్"],
      "మీనం (Pisces)": ["విద్యా శిక్షణ సంస్థలు", "ఫైనాన్స్ కన్సల్టింగ్", "మందులు, హాస్పిటల్స్ బిజినెస్", "మినరల్ వాటర్ రవాణా", "ఆధ్యాత్మిక వస్తువుల విక్రయం"]
    };
    const recommendedFields = rashiLordsBestFields[ownerRashiObj.name] || ["సాఫ్ట్‌వేర్ & ఐటి", "సూపర్ మార్కెట్ & కిరాణా"];

    let birthYogas = [];
    let wealthYogaCount = 0;
    let rajYogaCount = 0;

    const lagnaLord = PLANETS[activeLagna.lordNum]?.lordKey;
    const rashiLord = ownerRashiLordPlanet.lordKey;
    const nakLord = nakshatraObj.lord;

    if (lagnaLord === "Mars" || rashiLord === "Mars") { birthYogas.push({ name: "రుచక మహాపురుష యోగం (Ruchaka Yoga)", desc: "అపారమైన ధైర్యం, రియల్ ఎస్టేట్ మరియు పోలీస్/డిఫెన్స్/ఇంజనీరింగ్ వ్యాపారాలలో తిరుగులేని ఆధిపత్యం.", type: "రాజయోగం" }); rajYogaCount++; }
    if (lagnaLord === "Mercury" || rashiLord === "Mercury") { birthYogas.push({ name: "భద్ర మహాపురుష యోగం (Bhadra Yoga)", desc: "వ్యాపార చతురత, వాగ్ధాటి. ఐటీ, కమ్యూనికేషన్స్, పబ్లిషింగ్ రంగాల్లో కోట్లు గడించే బలం.", type: "రాజయోగం" }); rajYogaCount++; }
    if (lagnaLord === "Jupiter" || rashiLord === "Jupiter") { birthYogas.push({ name: "హంస మహాపురుష యోగం (Hansa Yoga)", desc: "సమాజంలో ఉన్నత గౌరవం, స్వచ్ఛమైన కీర్తి. కన్సల్టింగ్, విద్య, ఆర్థిక రంగాల్లో విశేష రాణింపు.", type: "రాజయోగం" }); rajYogaCount++; }
    if (lagnaLord === "Venus" || rashiLord === "Venus") { birthYogas.push({ name: "మాలవ్య మహాపురుష యోగం (Malavya Yoga)", desc: "లగ్జరీ, కళలు, సినిమా, బ్యూటీ మరియు వస్త్ర వ్యాపారాలలో అంతులేని అదృష్టం, ఆకర్షణ.", type: "రాజయోగం" }); rajYogaCount++; }
    if (lagnaLord === "Saturn" || rashiLord === "Saturn") { birthYogas.push({ name: "శశ మహాపురుష యోగం (Shasha Yoga)", desc: "కార్మికుల మద్దతు, రాజకీయ పలుకుబడి. కన్‌స్ట్రక్షన్, ఇనుము, మైనింగ్ రంగాల్లో సుస్థిర విజయం.", type: "రాజయోగం" }); rajYogaCount++; }
    if (nakLord === "Jupiter" || rashiLord === "Moon" || lagnaLord === "Moon") { birthYogas.push({ name: "గజకేసరి యోగం (Gajakesari Yoga)", desc: "ఏనుగు మీద సింహం కూర్చున్నంత బలం! శత్రువులను సులభంగా జయించి, నాయకత్వ హోదాలో నిలబడతారు.", type: "రాజయోగం" }); rajYogaCount++; }
    if (rashiLord === "Venus" || chaldeanSingle === 6) { birthYogas.push({ name: "లక్ష్మీ యోగం (Laxmi Yoga)", desc: "లక్ష్మీ కటాక్షం. జీవితాంతం ఆర్థిక ఇబ్బందులు లేకుండా విలాసవంతమైన జీవనం.", type: "ధనయోగం" }); wealthYogaCount++; }
    if (mulank === 5 || lifePathNumber === 1 || mulank === 1) { birthYogas.push({ name: "బుధాదిత్య యోగం (Budhaditya Yoga)", desc: "సూర్య-బుధుల కలయిక. అద్భుతమైన తెలివితేటలు, గ్లోబల్ మార్కెటింగ్ మరియు ప్రఖ్యాతి.", type: "రాజయోగం" }); rajYogaCount++; }
    if (rashiLord === "Mars" && nakLord === "Moon") { birthYogas.push({ name: "చంద్ర-మంగళ యోగం (Chandra Mangala Yoga)", desc: "ఆర్థిక లావాదేవీలలో అద్భుత నైపుణ్యం. రియల్ ఎస్టేట్ ద్వారా కుబేర యోగం.", type: "ధనయోగం" }); wealthYogaCount++; }
    if (mulank === 8 || lifePathNumber === 8 || activeLagna.lordNum === 8) { birthYogas.push({ name: "కర్మ సిద్ధి యోగం (Karma Siddhi Yoga)", desc: "మొదట్లో కఠిన శ్రమ ఉన్నప్పటికీ, 36 ఏళ్ల తర్వాత ఎవరూ అందుకోలేనంత ఎత్తుకు ఎదుగుతారు.", type: "కర్మయోగం" }); }
    if (mulank === 3 || lifePathNumber === 3) { birthYogas.push({ name: "అమల యోగం (Amala Yoga)", desc: "స్వచ్ఛమైన మరియు నీతిమంతమైన వ్యాపారం ద్వారా సమాజంలో మచ్చలేని కీర్తి లభిస్తుంది.", type: "రాజయోగం" }); rajYogaCount++; }
    if (chaldeanSingle === 5 || chaldeanSingle === 6) { birthYogas.push({ name: "మహా భాగ్య యోగం (Maha Bhagya Yoga)", desc: "వ్యాపార నామంలో ఉన్న అదృష్ట సంఖ్య కారణంగా ప్రజాదరణ మరియు ఆకస్మిక ధన లాభం వస్తుంది.", type: "ధనయోగం" }); wealthYogaCount++; }

    if (birthYogas.length <= 2) {
      birthYogas.push({ name: "అనఘ యోగం (Anapha Yoga)", desc: "కఠిన శ్రమ తర్వాత లభించే అద్భుత ప్రజాదరణ, నమ్మకం మరియు నిలకడైన ఆర్ధిక అభివృద్ధి.", type: "శుభయోగం" });
    }
    const yogasSummary = `మీ జాతక చక్రం మరియు సంఖ్యా శాస్త్రం ఆధారంగా మొత్తం 100+ ముఖ్య యోగాలను శోధించగా.. మీ జాతకంలో ${rajYogaCount} మహా రాజయోగాలు మరియు ${wealthYogaCount} అఖండ ధనయోగాలు బలంగా ఉన్నట్లు నిర్ధారించబడింది. వ్యాపార సామ్రాజ్యాన్ని స్థాపించడానికి ఇది చాలా అత్యుత్తమమైన పునాది!`;

    const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    const startLord = nakshatraObj.lord;
    let startOrderIndex = DASHA_ORDER.indexOf(startLord);
    if (startOrderIndex === -1) startOrderIndex = 0;

    const dobDateExact = new Date(dob);
    const todayExact = new Date();
    const ageInDays = (todayExact - dobDateExact) / (1000 * 60 * 60 * 24);
    const ageInYearsPrecise = ageInDays / 365.25;

    let accumulatedYears = 0;
    const firstDashaPlanet = Object.values(PLANETS).find(p => p.lordKey === startLord) || PLANETS[1];
    const initialRemainingYears = firstDashaPlanet.dashaYears * 0.6; 
    
    let currentDashaPlanet = firstDashaPlanet;
    let currentDashaName = startLord;
    let dashaStartYear = dobDateExact.getFullYear();
    let dashaEndYear = dashaStartYear + Math.round(initialRemainingYears);

    accumulatedYears += initialRemainingYears;

    if (ageInYearsPrecise > accumulatedYears) {
      let currentIndex = startOrderIndex;
      while (accumulatedYears <= ageInYearsPrecise) {
        currentIndex = (currentIndex + 1) % 9;
        const nextDashaKey = DASHA_ORDER[currentIndex];
        const nextDashaObj = Object.values(PLANETS).find(p => p.lordKey === nextDashaKey) || PLANETS[1];
        dashaStartYear = dobDateExact.getFullYear() + Math.round(accumulatedYears);
        dashaEndYear = dashaStartYear + nextDashaObj.dashaYears;
        accumulatedYears += nextDashaObj.dashaYears;
        currentDashaPlanet = nextDashaObj;
        currentDashaName = nextDashaKey;
      }
    }

    const dashaRelationToBiz = selectedCatObjs.some(cat => getPlanetRelation(currentDashaPlanet.lordKey === "Sun" ? 1 : currentDashaPlanet.lordKey === "Moon" ? 2 : currentDashaPlanet.lordKey === "Jupiter" ? 3 : currentDashaPlanet.lordKey === "Rahu" ? 4 : currentDashaPlanet.lordKey === "Mercury" ? 5 : currentDashaPlanet.lordKey === "Venus" ? 6 : currentDashaPlanet.lordKey === "Ketu" ? 7 : currentDashaPlanet.lordKey === "Saturn" ? 8 : 9, cat.rulingPlanet).score < 0) ? "hostile" : "friendly";

    let presentYogas = [];
    if (dashaRelationToBiz === "friendly") {
      presentYogas.push({ name: `${currentDashaPlanet.name} మహాదశ లాభ యోగం`, desc: `ఈ దశ మీకు ${dashaStartYear} నుండి ${dashaEndYear} వరకు ఉంటుంది. ఈ కాలంలో అంతులేని కస్టమర్ల ప్రవాహం మరియు ఆర్థిక వృద్ధి లభిస్తుంది.` });
      if (currentDashaPlanet.atiMitra.includes(chaldeanSingle) || currentDashaPlanet.mitra.includes(chaldeanSingle)) {
        presentYogas.push({ name: "దశా-నామ బంధ యోగం", desc: "మీ ప్రస్తుత దశానాథుడికి మరియు వ్యాపార నామానికి పూర్తి మైత్రి ఉన్నది. ఇది పెట్టుబడులను 3 రెట్లు పెంచుతుంది." });
      }
    } else {
      presentYogas.push({ name: `${currentDashaPlanet.name} ధర్మ పోరాట యోగం`, desc: `ఈ దశ మీకు ${dashaStartYear} నుండి ${dashaEndYear} వరకు నడుస్తుంది. మీ బహుళ వ్యాపార రంగాలకు మరియు ఈ దశానాథుడికి మధ్య శత్రుత్వం ఉండటం వల్ల కాస్త శ్రమతో కూడిన లాభాలు వస్తాయి.` });
      presentYogas.push({ name: "కాల సర్ప ఛాయా యోగం (తాత్కాలికం)", desc: "దశ అనుకూలించని కారణంగా చిన్నపాటి ఆర్థిక ఒడిదుడుకులు ఉంటాయి. ఓపికతో వ్యవహరించాలి." });
    }

    let activeOperatingYoga = { name: presentYogas[0].name, desc: presentYogas[0].desc };

    let growthTimeline = [];
    if (dashaRelationToBiz === "friendly") {
      growthTimeline = [
        { year: "1వ సంవత్సరం", status: "ఆశించిన వృద్ధి", desc: "వ్యాపారం ప్రారంభించిన మొదటి 6 నెలల్లోనే బ్రేక్-ఈవెన్ సాధించి లాభాల బాట పడుతుంది." },
        { year: "2వ సంవత్సరం", status: "విస్తరణ యోగం", desc: "స్థానిక మార్కెట్ లో మంచి బ్రాండ్ వ్యాల్యూ ఏర్పడి కస్టమర్ల తాకిడి విపరీతంగా పెరుగుతుంది." },
        { year: "3వ సంవత్సరం", status: "అఖండ లాభాలు", desc: "సర్వత్రా మీ బ్రాండ్ కీర్తి వ్యాపించి, పెట్టుబడికి మూడింతల లాభం (3x ROI) లభిస్తుంది." },
        { year: "5వ సంవత్సరం", status: "మల్టీ-బ్రాంచ్ సామ్రాజ్యం", desc: "ఇతర నగరాలు లేదా దేశాలకు బ్రాంచ్‌లను విస్తరించి ఏకఛత్రాధిపత్యం సాధిస్తారు." }
      ];
    } else {
      growthTimeline = [
        { year: "1వ సంవత్సరం", status: "తీవ్ర పోరాటం", desc: "తీవ్రమైన మార్కెట్ పోటీ మరియు లోపాలు ఉండటం వల్ల బ్రేక్-ఈవెన్ కోసం శ్రమించాల్సి వస్తుంది." },
        { year: "2వ సంవత్సరం", status: "నిలకడ", desc: "పరిహారాలు చేసుకోవడం వల్ల క్రమంగా కస్టమర్లు అలవాటు పడి నిలకడైన ఆదాయం మొదలవుతుంది." },
        { year: "3వ సంవత్సరం", status: "ఆర్థిక వృద్ధి", desc: "3 సంవత్సరాల తర్వాత వ్యాపారంలో అద్భుతమైన మార్పులు వచ్చి నూతన లాభాలు ప్రారంభమవుతాయి." },
        { year: "5వ సంవత్సరం", status: "స్థిరమైన బ్రాండ్", desc: "ఒడిదుడుకులన్నీ దాటి ఒక నమ్మకమైన మరియు స్థిరమైన స్థానిక బ్రాండ్‌గా అవతరిస్తారు." }
      ];
    }

    let typedCityReport = null; 
    if (searchCity) {
      const cleanCity = translitTeluguToEnglish(searchCity).toUpperCase().replace(/[^A-Z]/g, '') || "HYDERABAD";
      let cityVal = 0;
      cleanCity.split('').forEach(char => { cityVal += CHALDEAN_MAP[char] || 0; });
      const citySingle = getSingleDigit(cityVal);
      const cityPlanet = PLANETS[citySingle] || PLANETS[5];

      let cityScore = 100;
      let cityReasons = [];
      const cityBizRel = getPlanetRelation(citySingle, chaldeanSingle);
      if (cityBizRel.score < 0) {
        cityScore -= 40;
        cityReasons.push(`వ్యాపార సంఖ్యకు (${chaldeanSingle}), మీ ఎంటర్ చేసిన నగర అధిపతి గ్రహానికి (${cityPlanet.name}) మధ్య ${cityBizRel.text} ఉంది.`);
      }
      const cityOwnerRel = getPlanetRelation(citySingle, lifePathNumber);
      if (cityOwnerRel.score < 0) {
        cityScore -= 30;
        cityReasons.push(`యజమాని జాతక సంఖ్యకు (${lifePathNumber}), ఈ నగర తరంగాలకు అనుకూలత లేదు.`);
      }
      cityScore = Math.min(Math.max(cityScore, 20), 100);
      
      const commonCityOwnerFriends = [...ownerPlanet.atiMitra, ...ownerPlanet.mitra].filter(f => cityPlanet.atiMitra.includes(f) || cityPlanet.mitra.includes(f));
      const targetCityNumbers = commonCityOwnerFriends.length > 0 ? commonCityOwnerFriends : [5, 6];
      const cityRemedyText = `ఈ నగరంలో ('${searchCity}') మీ వ్యాపారం 100% మహా విజయం సాధించాలంటే... మీ వ్యాపార నామ సంఖ్యను ${targetCityNumbers.join(', ')} లలో ఏదో ఒక దానికి (ఉదాహరణకు: ${PLANETS[targetCityNumbers[0]].name}) వచ్చేలా స్పెల్లింగ్ మార్చుకోండి. అప్పుడు ఈ ప్రాంత శక్తులు మీకు పూర్తిగా సహకరిస్తాయి.`;

      typedCityReport = {
        name: searchCity, total: cityVal, single: citySingle, planet: cityPlanet.name, score: cityScore,
        reasons: cityReasons.length > 0 ? cityReasons : ["ఈ నగరం మీ వ్యాపారానికి సర్వత్రా లాభాలను, అఖండ కీర్తిని ఇస్తుంది!"],
        remedy: cityScore < 100 ? cityRemedyText : "మీ పేరు ఈ నగరానికి 100% పర్ఫెక్ట్ మ్యాచ్! ఎలాంటి మార్పులు అవసరం లేదు."
      };
    }

    const locationSuitabilityList = GLOBAL_COUNTRIES.map(city => {
      let cityScore = 100;
      let reasons = [];
      let status = "అద్భుత యోగం";
      const relBiz = getPlanetRelation(city.rulingPlanet, chaldeanSingle);
      
      if (relBiz.score < 0) {
        cityScore -= 40;
        reasons.push(`వ్యాపార సంఖ్య ${chaldeanSingle} కు, ఈ దేశాధినేత గ్రహం (${PLANETS[city.rulingPlanet].name}) తో ${relBiz.text} కలదు.`);
      } else if (relBiz.score > 0) {
        cityScore += 10;
        reasons.push(`${relBiz.text} వల్ల ఈ దేశంలో అద్భుత ప్రజాదరణ పొందుతారు.`);
      }
      const relOwn = getPlanetRelation(city.rulingPlanet, lifePathNumber);
      if (relOwn.score < 0) {
        cityScore -= 30;
        reasons.push(`యజమాని సంఖ్య ${lifePathNumber} మరియు ఈ ప్రాంత గ్రహ శక్తుల మధ్య నిరంతర ఆటంకాలు రావచ్చు.`);
      }
      cityScore = Math.min(Math.max(cityScore, 20), 100);
      if (cityScore >= 80) status = "అద్భుత యోగం (Superb)";
      else if (cityScore >= 60) status = "మధ్యమం (Standard)";
      else status = "ప్రతికూలం / వద్దు (Avoid)";
      return { ...city, score: cityScore, status, reasons: reasons.length > 0 ? reasons : ["ఈ దేశంలో మీ వ్యాపారానికి సర్వత్రా విజయం లభిస్తుంది."] };
    });

    let universalSuggestedNames = [];
    const prefixes = nakshatraObj.letters;
    prefixes.forEach(pref => {
      const potential1 = `Sri ${pref}anvi Global`;
      const potential2 = `${pref}avyan Industries`;
      [potential1, potential2].forEach(name => {
        let nameVal = 0;
        name.toUpperCase().replace(/[^A-Z]/g, '').split('').forEach(ch => { nameVal += CHALDEAN_MAP[ch] || 0; });
        const nameSingle = getSingleDigit(nameVal);
        if (getPlanetRelation(lifePathNumber, nameSingle).score >= 0) {
          universalSuggestedNames.push({
            name, singleNumber: nameSingle, totalValue: nameVal, planetName: PLANETS[nameSingle]?.name || "బుధుడు",
            reason: "ఈ పేరు సమస్త వ్యాపార విభాగాలకు మరియు ఏ ప్రాంతంలోనైనా విజయం సాధించడానికి అనుకూలం."
          });
        }
      });
    });

    let spellingSuggestions = [];
    let idealNumbers = [];
    let isTargetForced = false;
    let targetPlanetNames = "";

    if (targetPlanets.length > 0) {
      idealNumbers = targetPlanets.map(Number);
      isTargetForced = true;
      targetPlanetNames = targetPlanets.map(num => PLANETS[num].name).join(', ');
    } else {
      idealNumbers = [...ownerPlanet.atiMitra, ...ownerPlanet.mitra].filter(f => {
         return !selectedCatObjs.some(cat => getPlanetRelation(cat.rulingPlanet, f).score < 0);
      });
      if (idealNumbers.length === 0) idealNumbers = [1, 5, 6]; 
    }

    if (finalRatingOutOf10 < 10 || isEnemeyVibe || isAnyCategoryEnemy || isTargetForced) { 
      const suffixes = ["S", "A", "I", "K", "R", "Y", "SS", "AA", "EE", "OO", "NN", "MM", "LL", "TT", "ZZ", "VV"];
      const originalNameParts = businessName.trim().split(' ');
      const lastWordIndex = originalNameParts.length - 1;

      suffixes.forEach(suffix => {
        let testParts = [...originalNameParts];
        testParts[lastWordIndex] = testParts[lastWordIndex] + suffix;
        let testName = testParts.join(' ');
        
        let testVal = 0;
        testName.toUpperCase().replace(/[^A-Z]/g, '').split('').forEach(ch => { testVal += CHALDEAN_MAP[ch] || 0; });
        let testSingle = getSingleDigit(testVal);

        if (idealNumbers.includes(testSingle)) {
          const compoundStatus = COMPOUND_NUMBERS[testVal]?.status || "";
          const isHighlyInauspicious = compoundStatus.includes("Inauspicious") || compoundStatus.includes("ప్రతికూలం") || compoundStatus.includes("శత్రు") || compoundStatus.includes("ప్రమాదకర");
          
          if (!spellingSuggestions.some(s => s.name === testName) && !isHighlyInauspicious) {
            spellingSuggestions.push({
              name: testName, total: testVal, single: testSingle, planetName: PLANETS[testSingle]?.name || "బుధుడు",
              reason: `అదనంగా '${suffix}' అక్షరాన్ని చేర్చడం వల్ల పేరు అత్యంత శుభప్రదమైన ${testVal} (${testSingle}) సయుక్త సంఖ్యకు మారుతుంది. ఇది గ్రహ దోషాలను 100% తొలగించి, మార్కెట్లో అఖండ ఆకర్షణను ఇస్తుంది.`
            });
          }
        }
      });
      spellingSuggestions = spellingSuggestions.slice(0, 3); 
      
      if (spellingSuggestions.length === 0 && isTargetForced) {
         spellingSuggestions.push({
            name: businessName + " Group", total: chaldeanTotal + 24, single: idealNumbers[0], planetName: PLANETS[idealNumbers[0]]?.name || "బుధుడు",
            reason: `మీరు ఎంచుకున్న గ్రహ బలం పొందడానికి.. స్పెల్లింగ్ మార్చడం కంటే వ్యాపార నామం పక్కన 'Group' లేదా 'Enterprises' అని చేర్చడం 100% సురక్షితం.`
         });
      }
    }

    setReport({
      finalRatingOutOf10, chaldeanTotal, chaldeanSingle, pythagoreanTotal, pythagoreanSingle, kabbalahTotal, kabbalahSingle,
      lifePathNumber, mulank, isDriverConductorEnemy, ownerDestinyNumber, isYoniClash, ownerYoni: nakshatraObj.yoni,
      bizYoni, ownerGana: nakshatraObj.gana, bizGana, ganaMatchStatus, taraResult, ownerElement, bizElement, tatvaStatus,
      selectedCatObjs, categoryMatches, isAnyCategoryEnemy, isAnyCategoryMatch, ownerPlanet, businessPlanet, isEnemeyVibe,
      ownerBizRelation, locationSuitabilityList, loshuMap, typedCityReport, finalUniversalSuggestions: universalSuggestedNames.slice(0, 3),
      spellingSuggestions, isTargetForced, targetPlanets, targetPlanetNames, ownerRashi: ownerRashiObj.name,
      ownerRashiLord: ownerRashiLordPlanet.name, bizRashi: matchedBizRashi.name, bizRashiLord: bizRashiLordPlanet.name,
      isRashiLordEnemy, rashiRelation, activeLagna: activeLagna.name, lagnaPlanet: PLANETS[activeLagna.lordNum]?.name || "లగ్నాధిపతి",
      lagnaTimeline, birthYogas, yogasSummary, currentDashaName, currentDashaPlanet, dashaStartYear, dashaEndYear,
      presentYogas, dashaRelationToBiz, activeOperatingYoga, growthTimeline, friendlyRashiList,
      mitraRashiSuggestions: mitraRashiSuggestions.slice(0, 4), transitImmunityScore, shieldType, shieldDesc,
      hasTransitShield, luckyColorName, recommendedLogoPalette, recommendedFields, remedyList, multiWordAnalysis, processedPartners
    });

    setLoading(false);
    setActiveTab('mha_synthesis');
  };

  const handleSkipCountdown = () => {
    setCountdown(0);
    processFinalReport();
  };

  return (
    <div className="min-h-screen bg-[#03040c] text-slate-100 font-sans pb-16 relative">
      <header className="border-b border-slate-950 bg-[#050717]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                Vyapaara Jaathakam Global Pro
              </h1>
            </div>
          </div>
          <button 
            onClick={handleDemoFill}
            className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-xl transition-all hover:bg-amber-500/20 font-bold"
          >
            🚀 ఉదాహరణ డేటా లోడ్ చేయి (Demo Fill)
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {alertMsg && (
          <div className="max-w-md mx-auto mb-6 bg-amber-950/80 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-amber-200">{alertMsg}</p>
              <button onClick={() => setAlertMsg(null)} className="mt-2 text-xs bg-amber-500 text-slate-950 px-3 py-1 rounded">సరే</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="max-w-xl mx-auto bg-[#07091e] border border-slate-800 p-8 rounded-3xl text-center shadow-2xl space-y-6 my-12">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 absolute">
                <circle cx="56" cy="56" r="48" className="stroke-slate-900" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="48" 
                  className="stroke-amber-500 transition-all duration-1000" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (countdown / 60)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-3xl font-black text-amber-400 z-10">{countdown}s</span>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">మహా జాతక గణన జరుగుతోంది...</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono min-h-[40px] px-4">{loadingText}</p>
            </div>

            <div className="pt-4 border-t border-slate-900">
              <button onClick={handleSkipCountdown} className="text-xs text-slate-500 hover:text-amber-400 underline transition-all">
                విశ్లేషణను స్కిప్ చేసి ఫలితాలు వెంటనే చూపించు ≫
              </button>
            </div>
          </div>
        ) : !report ? (
          <div className="max-w-3xl mx-auto bg-[#07091e]/90 border border-slate-850 rounded-3xl p-6 shadow-2xl">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" /> ప్రధాన యజమాని & వ్యాపార వివరాలు
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">యజమాని పూర్తి పేరు (తెలుగు లేదా English)</label>
                  <input type="text" required placeholder="Mohan Kumar" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-amber-500 focus:outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">వ్యాపార నామం (తెలుగు లేదా English)</label>
                  <input type="text" required placeholder="Vortex Gaming" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-amber-500 focus:outline-none font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">పుట్టిన తేదీ (Date of Birth)</label>
                  <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-amber-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">పుట్టిన సమయం (TOB - లగ్నం కోసం)</label>
                  <input type="time" required value={tob} onChange={(e) => setTob(e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-amber-500 focus:outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">జన్మ నక్షత్రం</label>
                  <select value={selectedNakshatra} onChange={(e) => setSelectedNakshatra(e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-slate-200 focus:border-amber-500 focus:outline-none">
                    {NAKSHATRAS.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">యజమాని జన్మ రాశి (Zodiac Sign)</label>
                  <select value={selectedRashi} onChange={(e) => setSelectedRashi(e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-slate-200 focus:border-amber-500 focus:outline-none">
                    {RASHIS.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">పుట్టిన ఊరు (City)</label>
                  <input type="text" required placeholder="Visakhapatnam" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-amber-500 focus:outline-none font-mono" />
                </div>
              </div>

              {/* Multi-Select Category */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckSquare className="w-4 h-4" /> వ్యాపార విభాగాలు (Multi-Select Category)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2 font-sans">మీరు బహుళ వ్యాపారాలు చేస్తున్నట్లయితే ఒకటి కన్నా ఎక్కువ రంగాలను ఎంచుకోవచ్చు (గరిష్టంగా 3). సిస్టమ్ ఈ రంగాలన్నింటికీ ఉమ్మడిగా సరిపోయే గ్రహ బలాన్ని ఫైండ్ చేస్తుంది.</p>
                  
                  <div className="flex flex-wrap gap-2.5 max-h-48 overflow-y-auto p-3 bg-[#02030a] border border-slate-800 rounded-xl custom-scrollbar">
                    {Object.entries(BUSINESS_CATEGORIES).map(([key, value]) => (
                      <button
                        key={key} type="button" onClick={() => toggleCategory(key)}
                        className={`text-[10px] sm:text-xs px-3.5 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                          selectedCategories.includes(key) 
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                        }`}
                      >
                        {selectedCategories.includes(key) && <Check className="w-3 h-3" />}
                        {value.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Multi-Select Target Planets */}
              <div className="grid grid-cols-1 gap-6 pt-2">
                <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-2xl">
                  <label className="block text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <Target className="w-4 h-4" /> వ్యాపార నామానికి మీకు ప్రత్యేకంగా ఏ గ్రహ బలం కావాలి? (Multi-Select)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-3 font-sans">మీకు ఇష్టమైన లేదా మీ గురువుగారు సూచించిన గ్రహ సంఖ్యలను ఎంచుకోండి (గరిష్టంగా 3). ఏదీ ఎంచుకోకపోతే సిస్టమ్ ఆటోమేటిక్‌గా బెస్ట్ గ్రహాన్ని సూచిస్తుంది.</p>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {Object.entries(PLANETS).map(([num, p]) => (
                      <button
                        key={`target_${num}`} type="button" onClick={() => toggleTargetPlanet(num)}
                        className={`text-[10px] sm:text-xs px-3.5 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                          targetPlanets.includes(num)
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                        }`}
                      >
                        {targetPlanets.includes(num) && <Check className="w-3 h-3" />}
                        {num} - {p.name.split(' (')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-amber-400 mb-2 flex items-center gap-1">
                    <Globe className="w-4 h-4" /> ఏదైనా నగరం/దేశం విశ్లేషించండి (Optional)
                  </label>
                  <input type="text" placeholder="ఉదా: Hyderabad, Dubai, New York, London, Kakinada" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-amber-500 focus:outline-none font-mono" />
                </div>
              </div>

              {/* Partners Section */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" /> వ్యాపార భాగస్వాముల వివరాలు (ఆప్షనల్)
                  </h3>
                  <button type="button" onClick={addPartner} className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30">
                    <PlusCircle className="w-4 h-4" /> + మరో భాగస్వామిని జోడించండి
                  </button>
                </div>
                <div className="space-y-4">
                  {partners.map((partner, index) => (
                    <div key={partner.id} className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl relative animate-fadeIn">
                      <div className="absolute -top-2.5 left-4 bg-[#07091e] px-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20 rounded">పార్టనర్ {index + 1}</div>
                      <button type="button" onClick={() => removePartner(partner.id)} className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all" title="తొలగించు"><Trash2 className="w-4 h-4" /></button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-[11px] font-bold text-indigo-300 mb-1.5 uppercase">పేరు (Partner Name)</label>
                          <input type="text" required placeholder="Partner Name" value={partner.name} onChange={(e) => updatePartner(partner.id, 'name', e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none font-mono" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-indigo-300 mb-1.5 uppercase">పుట్టిన తేదీ (DOB)</label>
                          <input type="date" required value={partner.dob} onChange={(e) => updatePartner(partner.id, 'dob', e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-indigo-300 mb-1.5 uppercase">జన్మ నక్షత్రం</label>
                          <select value={partner.nakshatra} onChange={(e) => updatePartner(partner.id, 'nakshatra', e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none">
                            {NAKSHATRAS.map(n => <option key={`p_${partner.id}_${n.name}`} value={n.name}>{n.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-indigo-300 mb-1.5 uppercase">జన్మ రాశి</label>
                          <select value={partner.rashi} onChange={(e) => updatePartner(partner.id, 'rashi', e.target.value)} className="w-full bg-[#02030a] border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none">
                            {RASHIS.map(r => <option key={`p_${partner.id}_${r.name}`} value={r.name}>{r.name}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {partners.length === 0 && (
                    <div className="text-center p-4 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500 font-sans">ప్రస్తుతం ఏ భాగస్వామి వివరాలు నమోదు చేయబడలేదు. సింగిల్ ఓనర్ వ్యాపారంగా పరిగణించబడుతుంది.</div>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-950 rounded-2xl py-4 font-black text-sm hover:from-amber-300 hover:to-yellow-500 transition-all shadow-lg shadow-amber-500/10 mt-2">
                సంపూర్ణ మహా సమన్వయ విశ్లేషణ ప్రారంభించు (60 Secs)
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* Nav Tabs */}
            <div className="flex border-b border-slate-850 bg-[#070a24]/60 p-1.5 rounded-xl gap-1 overflow-x-auto custom-scrollbar">
              {[
                { id: 'mha_synthesis', label: 'సంపూర్ణ మహా సమన్వయ నివేదిక' },
                { id: 'logo_fields', label: 'లోగో డిజైన్ & అనుకూల రంగాలు 🎨' },
                { id: 'transit_shield', label: 'గ్రహాతీత వజ్ర కవచం 🛡️' },
                { id: 'mitra_shield', label: 'మిత్ర రాశి బూస్టర్' },
                { id: 'yogas_timeline', label: 'జన్మ యోగాలు & వృద్ధి టైమ్‌లైన్' },
                { id: 'clashes', label: 'శత్రుత్వ విశ్లేషణ (5-Fold)' },
                { id: 'lagna_timeline', label: 'సమయాల వారీ లగ్న చక్రం' },
                { id: 'global_locations', label: 'గ్లోబల్ లోకేషన్స్ రిపోర్ట్' },
                { id: 'numerology', label: 'లోషు గ్రిడ్ & సయుక్త సంఖ్యలు' }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-amber-500 text-slate-950 font-black shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900/30'}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: MAHA SYNTHESIS */}
            {activeTab === 'mha_synthesis' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-gradient-to-b from-[#090c29] to-[#040516] border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-84 h-84 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 px-4 py-1 rounded-b-xl shadow-lg z-10 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                    <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">100% Astro-Verified Result</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-4">
                    <div className="md:col-span-4 flex flex-col items-center text-center relative z-10">
                      <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="88" cy="88" r="72" className="stroke-slate-950" strokeWidth="12" fill="transparent" />
                          <circle cx="88" cy="88" r="72" className="stroke-amber-500 transition-all duration-1000" strokeWidth="12" fill="transparent" strokeDasharray={2 * Math.PI * 72} strokeDashoffset={2 * Math.PI * 72 * (1 - report.finalRatingOutOf10 / 10)} strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-4xl font-black text-white">{report.finalRatingOutOf10}</span>
                          <span className="text-[10px] text-amber-500 font-bold uppercase mt-1 tracking-widest">మొత్తం రేటింగ్</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        {report.finalRatingOutOf10 >= 8.0 ? (
                          <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5">🌟 అద్భుతమైన పేరు! (Auspicious)</span>
                        ) : report.finalRatingOutOf10 >= 6.0 ? (
                          <span className="px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 rounded-full text-xs font-bold flex items-center gap-1.5">⚠️ సగటు సరిపోలిక (Moderate)</span>
                        ) : (
                          <span className="px-4 py-1.5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-full text-xs font-bold flex items-center gap-1.5">🛑 శత్రుత్వం కలదు (Hostile Clashes)</span>
                        )}
                      </div>
                    </div>

                    {((report.finalRatingOutOf10 < 10 && report.spellingSuggestions && report.spellingSuggestions.length > 0) || (report.isTargetForced && report.spellingSuggestions && report.spellingSuggestions.length > 0)) && (
                      <div className="md:col-span-8 bg-gradient-to-r from-indigo-950 to-[#030514] p-5 sm:p-6 rounded-2xl border border-indigo-500/50 space-y-4 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        <h4 className="font-extrabold text-indigo-400 text-sm sm:text-base flex items-center gap-2 relative z-10 font-sans">
                          <Wrench className="w-5 h-5 animate-pulse text-indigo-300" /> {report.isTargetForced ? "మీరు కోరుకున్న గ్రహ బలం కోసం స్పెల్లింగ్ మార్పులు:" : "100% పర్ఫెక్ట్ స్కోర్ సాధించడానికి ఆస్ట్రో-పరిహారాలు:"}
                        </h4>
                        {report.isTargetForced ? (
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed relative z-10 font-sans">
                            మీరు మీ వ్యాపారానికి ప్రత్యేకంగా <strong>"{report.targetPlanetNames}"</strong> బలాన్ని కోరుకున్నారు. మీ ప్రస్తుత వ్యాపార సంఖ్య <strong>{report.chaldeanSingle}</strong>. 100% ప్రామాణిక సంఖ్యాశాస్త్ర నిబంధనల ప్రకారం.. చెడు సయుక్త సంఖ్యలు (Negative Compound Numbers) రాకుండా, అచ్చంగా మీరు కోరుకున్న వైబ్రేషన్స్ రావడానికి ప్రస్తుత <strong>"{businessName}"</strong> పేరుకే ఈ కింది స్పెల్లింగ్ మార్పులు చేయండి:
                          </p>
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed relative z-10 font-sans">
                            కొత్త పేరు కోసం వెదకాల్సిన అవసరం లేదు! 100% ప్రామాణిక జ్యోతిష్య సంఖ్యాశాస్త్రం ప్రకారం.. యజమానికి, భాగస్వాములకు మరియు అన్ని వ్యాపార రంగాలకు ఉమ్మడిగా సరిపోయే "అదృష్ట మహా సంఖ్యను" ఈ కింది చిన్నపాటి స్పెల్లింగ్ మార్పుల ద్వారా ఆకర్షించవచ్చు:
                          </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 relative z-10">
                          {report.spellingSuggestions.map((sug, idx) => (
                            <div key={idx} className="bg-[#020411] p-4 rounded-xl border border-indigo-500/30 hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex flex-col justify-between group">
                              <div>
                                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Suggestion {idx + 1}</div>
                                <div className="font-mono text-lg font-black text-white group-hover:text-amber-400 transition-colors">{sug.name}</div>
                                <div className="text-xs text-slate-400 mt-1.5 font-sans">కొత్త సంఖ్య: <strong className="text-amber-400">{sug.single}</strong> (విలువ: {sug.total}) <br/> గ్రహం: <strong className="text-white">{sug.planetName}</strong></div>
                              </div>
                              <div className="text-[10px] sm:text-xs text-slate-350 mt-3 pt-3 border-t border-slate-800 font-sans leading-relaxed">{sug.reason}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Multi-Word Analysis Block */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-[#030514] p-5 sm:p-6 rounded-2xl border border-purple-500/30 space-y-4 shadow-[0_0_20px_rgba(168,85,247,0.05)]">
                    <h4 className="font-extrabold text-purple-400 text-xs sm:text-sm flex items-center gap-2 font-sans uppercase tracking-wide">
                      <Activity className="w-5 h-5 text-purple-500" /> వ్యాపార నామ బహుళ పదాల గ్రహ బలం (Multi-Word Synergy):
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed mt-1">
                      ఒక బ్రాండ్ అఖండ విజయం సాధించాలంటే వ్యాపార నామంలో ఉన్న <strong>ప్రతి పదం (Word)</strong> అదృష్ట గ్రహాన్ని ఆకర్షించాలి మరియు పదాల మధ్య పరస్పర పంచధా మైత్రి ఉండాలి. దీన్నే బహుళ గ్రహ బలం (Multi-Engine Power) అంటారు.
                    </p>
                    {report.multiWordAnalysis.isMulti ? (
                      <div className="mt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {report.multiWordAnalysis.words.map((wData, wIdx) => {
                            const bgColors = ['bg-blue-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];
                            const textColors = ['group-hover:text-blue-400', 'group-hover:text-pink-400', 'group-hover:text-amber-400', 'group-hover:text-emerald-400', 'group-hover:text-purple-400'];
                            return (
                              <div key={wIdx} className="bg-slate-950/60 p-4 rounded-xl border border-purple-500/20 text-center relative overflow-hidden group">
                                <div className={`absolute top-0 left-0 w-1 h-full ${bgColors[wIdx % bgColors.length]}`}></div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">పదం {wIdx + 1} (Pillar {wIdx + 1})</span>
                                <div className={`font-mono text-lg font-black text-white mt-1 ${textColors[wIdx % textColors.length]} transition-colors break-words`}>{wData.word}</div>
                                <div className="text-xs text-slate-300 mt-2 font-sans">గ్రహం: <strong className="text-white">{wData.planet.name}</strong></div>
                              </div>
                            );
                          })}
                        </div>
                        <div className={`mt-4 p-3.5 rounded-xl border text-xs sm:text-sm font-sans text-center ${report.multiWordAnalysis.hasEnmity ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
                          {report.multiWordAnalysis.hasEnmity 
                            ? <span><strong>⚠️ అంతర్గత శత్రుత్వం:</strong> మీ వ్యాపారంలోని పదాలైన ({report.multiWordAnalysis.enmityDetails.join(', ')}). ఒక పదం పైకి లాగుతుంటే, ఇంకో పదం కిందకు లాగుతుంది. దీన్ని సరిచేయడానికి పైనున్న 'పరిహారాలు' బాక్స్‌లోని సూచనలు పాటించండి.</span>
                            : <span><strong>🌟 అద్భుతమైన సమన్వయం! (100% Synergy):</strong> మీ వ్యాపార నామంలోని అన్ని పదాల గ్రహాలు అత్యంత సన్నిహిత మిత్రులు! ఈ గ్రహాలన్నీ 'డబుల్/ట్రిపుల్ ఇంజిన్' లాగా కలిసి మీ వ్యాపారాన్ని మార్కెట్లో వేగంగా పైకి తీసుకెళ్తాయి.</span>
                          }
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs sm:text-sm font-sans flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                        <span>మీరు వ్యాపారానికి కేవలం ఒకే పదాన్ని (Single Word) ఎంచుకున్నారు. జ్యోతిష్య సంఖ్యాశాస్త్రం ప్రకారం, వ్యాపార నామానికి రెండు లేదా అంతకంటే ఎక్కువ పదాలు ఉంటే అది <strong>బహుళ గ్రహ బలాన్ని (Multi-Planetary Power)</strong> పొందుతుంది. కాబట్టి మీ పేరు పక్కన "Group, Enterprises, Global" వంటి సపోర్టింగ్ పదాన్ని చేర్చడం ద్వారా అదనపు అదృష్టాన్ని ఆకర్షించవచ్చు.</span>
                      </div>
                    )}
                  </div>

                  {/* Multi-Category Power Block */}
                  <div className="bg-gradient-to-r from-blue-900/30 to-[#030514] p-5 sm:p-6 rounded-2xl border border-blue-500/30 space-y-4 shadow-[0_0_20px_rgba(59,130,246,0.05)]">
                    <h4 className="font-extrabold text-blue-400 text-xs sm:text-sm flex items-center gap-2 font-sans uppercase tracking-wide">
                      <Target className="w-5 h-5 text-blue-500" /> బహుళ వ్యాపార రంగాల గ్రహ బలం (Multi-Category Power):
                    </h4>
                    <div className="bg-[#020411] p-4 rounded-xl border border-blue-500/20">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans mb-4">
                        మీరు ఎంచుకున్న {report.selectedCatObjs.length} విభాగాలకు మరియు మీ ప్రస్తుత వ్యాపార నామ గ్రహానికి (<strong className="text-amber-400">{report.businessPlanet.name}</strong>) మధ్య గల పంచధా మైత్రి విశ్లేషణ:
                      </p>
                      <div className="space-y-3">
                        {report.categoryMatches.map((catMatch, idx) => (
                          <div key={idx} className={`p-3 rounded-lg border text-xs sm:text-sm font-sans flex items-start gap-2.5 ${
                            catMatch.isMatch ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
                            catMatch.isEnemy ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                            'bg-blue-500/10 border-blue-500/30 text-blue-300'
                          }`}>
                            {catMatch.isMatch ? <Award className="w-5 h-5 shrink-0" /> : catMatch.isEnemy ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                            <div>
                              <strong className="block text-white mb-0.5">{catMatch.catName} (అధిపతి: {catMatch.planetNum})</strong>
                              <p className="opacity-90 leading-relaxed text-xs mt-1 border-t border-slate-700/50 pt-1">
                                {catMatch.isMatch ? `అద్భుతం! ఈ రంగానికి ఖచ్చితమైన గ్రహ బలం (${catMatch.planetName}) మీ పేరులో ఉంది.` :
                                 catMatch.isEnemy ? `ప్రమాదకరం! ఈ రంగానికి మీ పేరులోని గ్రహానికి ${catMatch.relationText} ఉంది.` :
                                 `మంచి మైత్రి! ఈ రంగంలో మంచి లాభాలను ఆర్జిస్తారు (${catMatch.relationText}).`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {report.selectedCatObjs.length > 1 && (
                        <div className="mt-4 p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-[11px] text-slate-400 font-sans">
                          💡 <strong>బహుళ వ్యాపారాల ఆస్ట్రో సీక్రెట్:</strong> ఒకటి కంటే ఎక్కువ రంగాలు నడుపుతున్నప్పుడు.. ఆ అన్ని రంగాల అధిపతి గ్రహాలకు శత్రుత్వం లేని ఉమ్మడి (Common) మిత్ర సంఖ్యను వ్యాపార నామంగా ఎంచుకుంటే, అన్ని వ్యాపారాలూ సమతుల్యంగా అభివృద్ధి చెందుతాయి.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {report.finalRatingOutOf10 < 10 && report.remedyList && report.remedyList.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-900/20 to-[#030514] p-5 sm:p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                    <h4 className="font-extrabold text-amber-400 text-sm flex items-center gap-2">
                      <Wrench className="w-5 h-5" /> 10/10 పర్ఫెక్ట్ స్కోర్ సాధించడానికి ఆస్ట్రో-పరిహారాలు:
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      మీరు ఎంచుకున్న వ్యాపార నామానికి ఉన్న జాతక దోషాలను తొలగించి, దానిని 100% అదృష్ట పేరుగా మార్చడానికి కింద సూచించిన చిన్నపాటి స్పెల్లింగ్ లేదా పదాల మార్పులు చేయండి:
                    </p>
                    <div className="space-y-3 mt-3">
                      {report.remedyList.map((remedy, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-amber-500/20">
                          <span className="text-xs font-bold text-amber-400 block mb-1">{remedy.type}:</span>
                          <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">{remedy.solution}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LOGO & FIELDS */}
            {activeTab === 'logo_fields' && (
              <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-3xl space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">బ్రాండ్ లోగో డిజైన్ & మీకు సరిపోయే వ్యాపార రంగాలు</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#030514] p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="font-extrabold text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                      🎨 అదృష్ట లోగో & వర్ణ సమన్వయం (Lucky Logo & Branding):
                    </h4>
                    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                        <div className="w-40 h-40 rounded-full border border-dashed border-amber-500 animate-spin" style={{ animationDuration: '20s' }}></div>
                      </div>
                      <div className="w-24 h-24 flex items-center justify-center z-10">
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          <circle cx="50" cy="50" r="45" fill="none" stroke={report.recommendedLogoPalette.colors[0]} strokeWidth="3" opacity="0.4" />
                          <circle cx="50" cy="50" r="41" fill="none" stroke={report.recommendedLogoPalette.colors[1] || report.recommendedLogoPalette.colors[0]} strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
                          {report.chaldeanSingle === 1 && (
                            <g>
                              <circle cx="50" cy="50" r="20" fill="none" stroke="#F59E0B" strokeWidth="4" />
                              <line x1="50" y1="15" x2="50" y2="25" stroke="#F59E0B" strokeWidth="3" />
                              <line x1="50" y1="75" x2="50" y2="85" stroke="#F59E0B" strokeWidth="3" />
                              <line x1="15" y1="50" x2="25" y2="50" stroke="#F59E0B" strokeWidth="3" />
                              <line x1="75" y1="50" x2="85" y2="50" stroke="#F59E0B" strokeWidth="3" />
                            </g>
                          )}
                          {report.chaldeanSingle === 2 && (
                            <path d="M30,50 Q50,20 70,50 Q50,80 30,50 Z" fill="none" stroke="#38BDF8" strokeWidth="4" />
                          )}
                          {report.chaldeanSingle === 3 && (
                            <polygon points="50,18 80,75 20,75" fill="none" stroke="#F59E0B" strokeWidth="4" />
                          )}
                          {report.chaldeanSingle === 4 && (
                            <g>
                              <rect x="30" y="30" width="40" height="40" fill="none" stroke="#3B82F6" strokeWidth="3" transform="rotate(45 50 50)" />
                              <circle cx="50" cy="50" r="8" fill="#3B82F6" />
                            </g>
                          )}
                          {report.chaldeanSingle === 5 && (
                            <g>
                              <ellipse cx="50" cy="50" rx="30" ry="15" fill="none" stroke="#10B981" strokeWidth="4" />
                              <ellipse cx="50" cy="50" rx="15" ry="30" fill="none" stroke="#10B981" strokeWidth="2" />
                            </g>
                          )}
                          {report.chaldeanSingle === 6 && (
                            <polygon points="50,15 62,38 85,50 62,62 50,85 38,62 15,50 38,38" fill="none" stroke="#EC4899" strokeWidth="3.5" />
                          )}
                          {report.chaldeanSingle === 7 && (
                            <path d="M50,15 C75,15 75,50 50,50 C25,50 25,85 50,85" fill="none" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
                          )}
                          {report.chaldeanSingle === 8 && (
                            <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="none" stroke="#1E3A8A" strokeWidth="4" />
                          )}
                          {report.chaldeanSingle === 9 && (
                            <g>
                              <line x1="20" y1="80" x2="80" y2="20" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" />
                              <polygon points="80,20 60,20 80,40" fill="#DC2626" />
                            </g>
                          )}
                        </svg>
                      </div>
                      <div className="text-center">
                        <span className="text-[11px] text-slate-400 font-bold tracking-widest block uppercase">లోగో డిజైన్ స్కెచ్ సూచన</span>
                        <span className="text-xs text-amber-400 font-mono mt-0.5 inline-block bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">{report.recommendedLogoPalette.name}</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between p-2.5 bg-slate-950/40 rounded-lg border border-slate-850">
                        <span className="text-slate-400 font-medium">కలిసివచ్చే అదృష్ట రంగు (Lucky Color):</span>
                        <strong className="text-white font-bold">{report.luckyColorName}</strong>
                      </div>
                      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1.5">
                        <span className="text-slate-400 font-medium">లోగో ఆకారం (Recommended Shape):</span>
                        <p className="text-white font-bold text-[11px] leading-relaxed">{report.recommendedLogoPalette.shape}</p>
                      </div>
                      <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1.5">
                        <span className="text-slate-400 font-medium">వాడాల్సిన సింబల్స్ / చిహ్నాలు (Astro Symbols):</span>
                        <p className="text-amber-400 font-bold text-[11px] leading-relaxed">{report.recommendedLogoPalette.symbol}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#030514] p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-amber-400 text-xs sm:text-sm flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-amber-400" /> మీ జాతకానికి వందశాతం సరిపోయే వ్యాపార రంగాలు:
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-2 font-sans">
                        మీ జన్మరాశి (<strong className="text-blue-400">{report.ownerRashi}</strong>), మీ లగ్నం (<strong className="text-amber-400">{report.activeLagna}</strong>) మరియు అధిపతి గ్రహాల సహజ బలాల ప్రకారం మీకు గరిష్ట లాభాలను, తిరుగులేని ఆర్థిక విజయాన్ని ఇచ్చే వ్యాపార రంగాలు ఇవే:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                        {report.recommendedFields.map((field, idx) => (
                          <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center gap-2 hover:border-amber-500/20 transition-all">
                            <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">{idx + 1}</span>
                            <span className="text-xs text-white font-bold">{field}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10 text-[11px] text-slate-350 leading-relaxed font-sans mt-4">
                      💡 <strong>ఆస్ట్రో చిట్కా:</strong> ఒకవేళ మీరు అనుకుంటున్న వ్యాపార విభాగం పైన పేర్కొన్న లిస్ట్‌లో లేకపోయినా.. వ్యాపార బోర్డు రంగులను, వాస్తు దిశలను మీ అదృష్ట మిత్ర రాశుల ప్రకారం అమర్చుకోవడం ద్వారా నెగటివ్ గ్రహ ప్రభావాల నుండి పూర్తి రక్షణ పొందవచ్చు.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TRANSIT SHIELD */}
            {activeTab === 'transit_shield' && (
              <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-3xl space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">గ్రహాతీత వజ్ర కవచం (Planetary Transit Shield Engine)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 flex flex-col items-center text-center bg-[#030514] p-5 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-500 block uppercase font-bold tracking-widest">ట్రాన్సిట్ ఇమ్యూనిటీ రేట్</span>
                    <span className="text-5xl font-black text-emerald-400 mt-2">{report.transitImmunityScore}%</span>
                    <div className="text-xs text-slate-400 mt-2 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">{report.shieldType}</div>
                  </div>
                  <div className="md:col-span-8 space-y-3 text-xs sm:text-sm">
                    <h4 className="font-extrabold text-amber-400 flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-400" /> శత్రు గ్రహాల నెగటివ్ సంచారాల నుండి సంరక్షణ:
                    </h4>
                    <p className="text-slate-300 leading-relaxed font-sans">{report.shieldDesc}</p>
                    <p className="text-slate-350 leading-relaxed font-sans text-xs">
                      జ్యోతిషశాస్త్ర నియమాల ప్రకారం.. ఏల్నాటి శని, అష్టమ శని, లేదా రాహు-కేతు సంచారాలు మన సొంత నక్షత్రాన్ని తాకినప్పుడు వ్యాపారంలో నష్టాలు రావడం సహజం. కానీ, <strong>ఈ వ్యాపార నామ సయుక్త సంఖ్యా బలం ({report.chaldeanTotal}) ఆటంకాలను తట్టుకునే దైవిక కవచ తరంగాలతో అనుసంధానం చేయబడినది.</strong> దీనివల్ల గోచారంలో ఏ నెగటివ్ గ్రహాలున్నా, వ్యాపార ప్రగతి ఆగకుండా నిరంతరం ముందుకు సాగుతుంది.
                    </p>
                  </div>
                </div>
                <div className="bg-[#030514] p-5 rounded-2xl border border-slate-800 space-y-3 text-xs leading-relaxed">
                  <h4 className="font-bold text-yellow-400 text-sm">🛡️ నిరంతర పాజిటివ్ ఎనర్జీని పెంచే 'ఆస్ట్రో-వాస్తు లోగో' సూచనలు:</h4>
                  <ul className="space-y-2 list-disc list-inside text-slate-355">
                    <li><strong>లోగో ఆకారం (Logo Shape):</strong> మీ వ్యాపార బోర్డుపై లోగోను గుండ్రంగా (Circular) లేదా షట్కోణ (Hexagonal) ఆకారంలో నిర్మించండి. ఇది నెగటివ్ శక్తులను ఆకర్షించకుండా బయటకు నెట్టివేస్తుంది (Deflector).</li>
                    <li><strong>బోర్డు రంగులు (Sign Board Colors):</strong> బోర్డు బ్యాక్‌గ్రౌండ్ లో <strong className="text-white font-bold">తెలుపు, లేత పసుపు, లేదా సిల్వర్</strong> రంగులను ఎక్కువగా వాడండి. ఇవి శాంతి మరియు లక్ష్మీ కటాక్షాన్ని ఇస్తాయి.</li>
                    <li><strong>బోర్డు దిశ (Vastu Placement):</strong> వ్యాపార నామ బోర్డును మీ సంస్థ ప్రవేశ ద్వారం పై భాగంలో తూర్పు లేదా ఉత్తరం దిశ ముఖంగా బిగించడం శుభకరం.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: MITRA SHIELD */}
            {activeTab === 'mitra_shield' && (
              <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-3xl space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">మిత్ర రాశి రక్షణ కవచ సిద్ధాంతం (Friendly Rashi Booster)</h3>
                </div>
                <div className="bg-[#030514] p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="font-bold text-yellow-400 text-xs sm:text-sm flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-yellow-400" /> ఈ సిద్ధాంతం ఎలా పని చేస్తుంది? (Zodiac Swap Theory)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-355 leading-relaxed font-sans">
                    జ్యోతిషశాస్త్రం ప్రకారం, ప్రతి వ్యక్తికి కొన్ని అదృష్ట <strong>మిత్ర రాశులు (Friendly Rashis)</strong> ఉంటాయి. ఎప్పుడైతే మన స్వంత జన్మ రాశి బలహీనంగా ఉండి (ఉదా: ఏల్నాటి శని, అర్ధాష్టమ శని, లేదా చెడు గ్రహాల దశా కాలాలు), మనం సొంత రాశి అక్షరంతో వ్యాపారం పెడితే నష్టాలు రావచ్చు. <br />
                    కానీ, మనకు అత్యంత మిత్రులైన రాశుల అక్షరాలతో వ్యాపార నామాన్ని ఎంపిక చేయడం వల్ల, ఆ పేరు <strong>మిత్ర రాశి యొక్క సానుకూల తరంగాలను మాత్రమే ఆకర్షించి, మీ జాతక దోషాల నుండి వ్యాపారానికి ఒక రక్షణ కవచం (Zodiac Shield) లాగా పనిచేస్తుంది.</strong> దీనివల్ల ఎటువంటి జాతక దోషాలు ఉన్నా సరే, వ్యాపారం నష్టపోకుండా వేగంగా పుంజుకుంటుంది!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-xs block">మీ జన్మ రాశి:</span>
                      <strong className="text-white text-sm">{report.ownerRashi}</strong>
                    </div>
                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-xs block">మీ అదృష్ట మిత్ర రాశులు (Friendly Rashis):</span>
                      <strong className="text-amber-400 text-sm">{report.friendlyRashiList.map(r => r.name.split(' ')[0]).join(', ')}</strong>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide font-sans">🛡️ మిత్ర రాశి తరంగాల ఆధారిత అదృష్ట వ్యాపార నామాలు:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {report.mitraRashiSuggestions.map((item, i) => (
                      <div key={i} className="bg-[#030514] border border-slate-800 p-4 rounded-xl hover:border-emerald-500/30 transition-all space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-base font-black text-white">{item.name}</span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-black uppercase">SHIELD MATCH</span>
                        </div>
                        <div className="text-xs text-slate-400 font-sans">
                          మిత్ర రాశి: <strong className="text-emerald-400">{item.mitraRashiName}</strong> | lord: <strong className="text-white">{item.lord}</strong> <br />
                          Chaldean సంఖ్య: <strong className="text-white">{item.singleNum}</strong> (విలువ: {item.totalVal})
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pt-1.5 border-t border-slate-900 font-sans">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: YOGAS & TIMELINE */}
            {activeTab === 'yogas_timeline' && (
              <div className="space-y-6 animate-fadeIn font-sans">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8 bg-[#080b20]/60 border border-slate-850 p-6 rounded-3xl space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wide flex items-center gap-1.5">
                        <Award className="w-5 h-5 text-amber-500" /> జన్మతః మీ జాతకంలో ఉన్న అదృష్ట యోగాలు (Birth Yogas)
                      </h3>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full font-bold border border-indigo-500/20">100+ Yogas Scanned</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                      {report.birthYogas.map((yoga, i) => (
                        <div key={i} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
                          <div className={`absolute top-0 right-0 text-[9px] px-2 py-0.5 rounded-bl-lg font-black uppercase ${yoga.type === 'రాజయోగం' ? 'bg-amber-500 text-slate-900' : yoga.type === 'ధనయోగం' ? 'bg-emerald-500 text-slate-900' : 'bg-blue-500 text-white'}`}>
                            {yoga.type}
                          </div>
                          <div className="text-amber-400 font-extrabold text-xs sm:text-sm pt-2">{yoga.name}</div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{yoga.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-4 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-[#100720] to-[#040615] p-5 rounded-3xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] h-full flex flex-col">
                      <h4 className="font-extrabold text-purple-400 text-xs sm:text-sm flex items-center gap-1.5 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-400" /> యోగాల ఫైనల్ రిజల్ట్ (Verdict):
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-purple-500/10 flex-1">{report.yogasSummary}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-3xl space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center gap-1.5">
                    <Clock className="w-5 h-5 text-emerald-500" /> 
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">ప్రస్తుత దశ & గోచార యోగాలు (Present Mahadasha & Active Yogas)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ప్రస్తుత నడుస్తున్న దశ:</div>
                          <div className="text-lg font-black text-white">{report.currentDashaName} మహాదశ</div>
                        </div>
                      </div>
                      <div className="bg-[#03040c] p-3 rounded-xl border border-slate-800 mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">ప్రారంభం: <strong className="text-white">{report.dashaStartYear}</strong></span>
                          <span className="text-slate-400">ముగింపు: <strong className="text-white">{report.dashaEndYear}</strong></span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div></div>
                        <div className="text-[11px] text-slate-500 mt-2">
                          దశా అధిపతి: <strong className="text-white">{(report.currentDashaPlanet && report.currentDashaPlanet.name) || "బుధుడు"}</strong> <br />
                          వ్యాపార రంగానికి లభించే సహాయం: <strong className={report.dashaRelationToBiz === "friendly" ? "text-emerald-400" : "text-yellow-500"}>{report.dashaRelationToBiz === "friendly" ? "అనుకూలం (ధనలాభం కలిగించే దశ)" : "మధ్యమం (పోరాట దశ)"}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Zap className="w-4 h-4" /> ప్రస్తుతం పనిచేస్తున్న ఆక్టివ్ దశా యోగాలు:
                      </h4>
                      {report.presentYogas.map((yoga, i) => (
                        <div key={i} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 border-l-4 border-l-emerald-500">
                          <div className="text-sm font-extrabold text-white">{yoga.name}</div>
                          <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{yoga.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-3xl space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">వ్యాపార అభివృద్ధి & లైఫ్ పాత్ టైమ్‌లైన్</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-sans">లగ్నం, నక్షత్ర మైత్రి మరియు ప్రస్తుత దశా బలం ఆధారంగా రాబోయే 5 సంవత్సరాలలో మీ వ్యాపార అభివృద్ధి ఈ క్రింది విధంగా సాగబోతోంది:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    {report.growthTimeline.map((item, i) => (
                      <div key={i} className="bg-[#030514] border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between hover:border-amber-500/20 transition-all font-sans">
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-amber-400 block font-mono">{item.year}</span>
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 text-[10px] font-black rounded inline-block uppercase">{item.status}</span>
                          <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-900 font-sans">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: CLASHES (5-FOLD RELATIONSHIPS) */}
            {activeTab === 'clashes' && (
              <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-2xl space-y-4 animate-fadeIn">
                <div className="border-b border-slate-800 pb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide font-sans">పంచధా మైత్రి & శత్రుత్వ విశ్లేషణ (5-Fold Astro Clashes)</h3>
                </div>
                <div className="space-y-4 font-sans">
                  <div className={`p-4 rounded-xl border ${report.isRashiLordEnemy ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'}`}>
                    <h4 className="font-bold text-xs sm:text-sm flex items-center gap-2">
                      {report.isRashiLordEnemy ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      జన్మ రాశి vs వ్యాపార నామ రాశి పొంతన:
                    </h4>
                    <div className="text-xs text-slate-300 space-y-1.5 mt-2 leading-relaxed">
                      <p>మీ జన్మ రాశి: <strong className="text-white">{report.ownerRashi}</strong> (అధిపతి: <strong className="text-amber-400">{report.ownerRashiLord}</strong>)</p>
                      <p>వ్యాపార నామ రాశి (మొదటి అక్షరం): <strong className="text-white">{report.bizRashi}</strong> (అధిపతి: <strong className="text-blue-400">{report.bizRashiLord}</strong>)</p>
                      <p>పంచధా సంబంధం: <strong>{report.rashiRelation.text}</strong></p>
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                        {report.isRashiLordEnemy ? (
                          <p className="text-red-400 font-medium text-xs sm:text-sm">⚠️ జ్యోతిష్య రీత్యా శత్రుత్వం ఉన్నది! ఈ వైరుధ్యం వల్ల వ్యాపార నిర్ణయాలలో తీవ్ర అలసత్వం, అభద్రతాభావం మరియు వ్యాపార భాగస్వాములతో గొడవలు రావచ్చు.</p>
                        ) : (
                          <p className="text-emerald-400 font-medium text-xs sm:text-sm">✓ మైత్రి బాగుంది! ఇది మీకు మానసిక ఉల్లాసాన్ని, వ్యాపార ప్రగతిని కలిగిస్తుంది.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${report.isEnemeyVibe ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'}`}>
                    <h4 className="font-bold text-xs sm:text-sm flex items-center gap-2">
                      {report.isEnemeyVibe ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      గ్రహ మైత్రి: యజమాని సంఖ్య అధిపతి ({report.ownerPlanet ? report.ownerPlanet.name : "బుధుడు"}) vs వ్యాపార నామ సంఖ్య అధిపతి ({report.businessPlanet ? report.businessPlanet.name : "శుక్రుడు"})
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans mb-2">
                      పంచధా సంబంధం: <strong>{report.ownerBizRelation.text}</strong>
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800/80 pt-2">
                      {report.isEnemeyVibe ? `గ్రహాల మధ్య శత్రుత్వం కలదు! ఈ కారణంగా వ్యాపారంలో అకస్మాత్తుగా తీవ్ర నష్టాలు లేదా ఆటంకాలు ఎదురవుతాయి.` : "అద్భుతమైన గ్రహ మైత్రి! యజమాని సంఖ్యకు మరియు వ్యాపార సంఖ్యకు మధ్య ఉన్న స్నేహపూర్వక బంధం నిరంతర ధనలాభాన్ని కలిగిస్తుంది."}
                    </p>
                  </div>

                  {report.processedPartners && report.processedPartners.length > 0 && report.processedPartners.map((p, idx) => (
                    <div key={`partner_clash_${idx}`} className="space-y-4 pt-4 border-t border-slate-800">
                      <h4 className="text-sm font-extrabold text-indigo-400 flex items-center gap-2">
                        <Users className="w-5 h-5" /> పార్టనర్ {idx + 1}: {p.name} విశ్లేషణ
                      </h4>
                      <div className={`p-4 rounded-xl border ${p.isPartnerOwnerEnemy ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-300'}`}>
                        <h5 className="font-bold text-xs sm:text-sm flex items-center gap-2">
                          {p.isPartnerOwnerEnemy ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-indigo-400" />} యజమాని vs {p.name} (Owner vs Partner):
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                          సంబంధం: <strong>{p.ownerRelText}</strong> <br/>
                          {p.isPartnerOwnerEnemy ? `మీ ఇద్దరి మధ్య సహజ శత్రుత్వం ఉంది. మీ వ్యాపార నామం మీ అందరికీ కామన్ మిత్రుడైన గ్రహ సంఖ్యలో ఉండాలి.` : `అద్భుతం! మీ ఇద్దరి గ్రహాల మధ్య అద్భుతమైన స్నేహం ఉంది. ఈ భాగస్వామ్యం వ్యాపారాన్ని చాలా వేగంగా ముందుకు తీసుకెళ్తుంది.`}
                        </p>
                      </div>
                      {p.isPartnerBizEnemy && (
                        <div className="p-4 rounded-xl border bg-orange-500/5 border-orange-500/20 text-orange-300">
                          <h5 className="font-bold text-xs sm:text-sm flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-orange-400" /> {p.name} vs వ్యాపార నామం (Partner vs Business Name):</h5>
                          <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">
                            సంబంధం: <strong>{p.bizRelText}</strong> <br/>
                            ప్రస్తుత వ్యాపార నామ గ్రహం (${report.businessPlanet.name}) భాగస్వామి జాతక గ్రహానికి (${p.partnerPlanet.name}) వ్యతిరేకంగా పని చేస్తోంది. ఇది భాగస్వామి వైపు నుండి నిర్ణయాలు తప్పు దారి పట్టేలా చేయవచ్చు.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {report.isDriverConductorEnemy && (
                    <div className="p-4 rounded-xl border bg-red-500/5 border-red-500/20 text-red-300">
                      <h4 className="font-bold text-xs sm:text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /> యజమాని జాతకంలో డ్రైవర్ vs కండక్టర్ శత్రుత్వం:</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1.5 font-sans">మీ జన్మ సంఖ్యకు (డ్రైవర్ - {report.mulank}) మరియు పూర్తి పుట్టిన తేదీ సంఖ్యకు (కండక్టర్ - {report.lifePathNumber}) మధ్య సహజ సిద్ధమైన శత్రుత్వం ఉంది. దీనివల్ల మీ వ్యక్తిగత నిర్ణయాలు తరచూ తప్పు దారి పట్టే అవకాశం ఉంటుంది. దీనికి పరిహారంగా మీ వ్యాపార పేరు బుధుని 5వ సంఖ్యలో ఉండేలా చూసుకోవడం తప్పనిసరి.</p>
                    </div>
                  )}

                  <div className={`p-4 rounded-xl border ${report.ganaMatchStatus.includes("తీవ్ర") ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'}`}>
                    <h4 className="font-bold text-xs sm:text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-purple-400" /> వేద గణ బలం: యజమాని ({report.ownerGana}) vs వ్యాపార పేరు మొదటి అక్షరం ({report.bizGana})</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">గణాల అనుకూలత: <strong className="text-white">{report.ganaMatchStatus}</strong>. {report.ganaMatchStatus.includes("తీవ్ర") ? " మీ జాతక గణం మరియు వ్యాపార పేరు మొదటి అక్షర గణం పరస్పర విరుద్ధమైనవి. దేవ మరియు రాక్షస గణాల క్లాష్ వల్ల వ్యాపార బోర్డులు అమర్చిన తర్వాత తరచూ కస్టమర్లతో లేదా ప్రభుత్వ అధికారులతో గొడవలు జరిగే ప్రమాదం ఉంది." : " గణ మైత్రి బాగుంది. ఇది మీ వ్యాపారంలో ప్రశాంతమైన వాతావరణాన్ని కలిగిస్తుంది."}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${report.isYoniClash ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'}`}>
                    <h4 className="font-bold text-xs sm:text-sm flex items-center gap-2">{report.isYoniClash ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />} వేద జాతక యోని క్లాష్: {report.ownerYoni} vs {report.bizYoni} (వ్యాపార మొదటి అక్షరం)</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-2 font-sans">{report.isYoniClash ? `మీ జన్మ నక్షత్రం యొక్క యోని జంతువు మరియు వ్యాపార మొదటి అక్షరం యొక్క యోని జంతువు పరస్పరం 'మహా వైరం' (Absolute Enmity) కలిగి ఉన్నాయి. దీనివల్ల వ్యాపారంలో తీవ్ర అస్థిరత ఏర్పడవచ్చు.` : "ఎటువంటి యోని క్లాష్ లేదు! వేద జ్యోతిషశాస్త్రం ప్రకారం పేరు యొక్క మొదటి అక్షరంలో ప్రాకృతిక సమతుల్యత ఉన్నది."}</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${report.taraResult.type === 'bad' ? 'bg-red-500/5 border-red-500/20 text-red-300' : report.taraResult.type === 'good' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-300'}`}>
                    <h4 className="font-bold text-xs sm:text-sm flex items-center gap-2"><Sparkles className="w-4 h-4" /> తారా బల విశ్లేషణ (Tara Bala) & పంచభూత తత్వాలు:</h4>
                    <div className="text-xs text-slate-300 space-y-2 mt-2 leading-relaxed font-sans">
                      <p>మీ జన్మ నక్షత్రం నుండి వ్యాపార నామ నక్షత్రం వరకు లెక్కిస్తే... మీ పేరు <strong className={report.taraResult.type === 'bad' ? 'text-red-400' : 'text-emerald-400'}>"{report.taraResult.name}"</strong> గా నిర్ధారించబడింది.</p>
                      <p><strong>తారా ఫలితం:</strong> {report.taraResult.desc}</p>
                      <div className="mt-2 pt-2 border-t border-slate-800/80">
                        <p><strong>పంచభూత తత్వ మైత్రి:</strong> యజమాని గ్రహ తత్వం (<span className="text-amber-400">{report.ownerElement}</span>) vs వ్యాపార నామ గ్రహ తత్వం (<span className="text-blue-400">{report.bizElement}</span>). <br/>స్థితి: <strong className={report.tatvaStatus.includes("శత్రుత్వం") ? "text-red-400" : "text-emerald-400"}>{report.tatvaStatus}</strong>.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: LAGNA TIMELINE */}
            {activeTab === 'lagna_timeline' && (
              <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-2xl space-y-4 animate-fadeIn">
                <div className="border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide flex items-center gap-2 font-sans"><Clock className="w-5 h-5 text-amber-500" /> ఆరోజు సమయాల వారీ లగ్న చక్రం (Time-to-Time Lagna Timeline)</h3>
                  <p className="text-xs text-slate-400 mt-1 font-sans">మీ పుట్టిన రోజున ప్రతి 2 గంటలకు లగ్నాలు ఎలా మారాయో కింద పట్టికలో చూడవచ్చు. మీ పుట్టిన సమయానికి సరిపడే లగ్న గడియను <strong className="text-amber-400">బంగారు బోర్డర్‌తో</strong> హైలైట్ చేసాము:</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 font-sans">
                  {report.lagnaTimeline.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border text-center transition-all ${item.isUserSlot ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 scale-102 ring-1 ring-amber-500/30' : 'bg-slate-950/60 border-slate-900 opacity-60 hover:opacity-100'}`}>
                      <div className="text-[10px] text-slate-500 font-bold font-mono">{item.slotTime}</div>
                      <div className="text-sm font-black text-white mt-1">{item.rashi.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">అధిపతి: {PLANETS[item.rashi.lordNum] ? PLANETS[item.rashi.lordNum].name : "శుక్రుడు"}</div>
                      {item.isUserSlot && (<span className="inline-block mt-2 px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-wider animate-pulse">మీ జన్మ లగ్నం</span>)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: GLOBAL LOCATIONS */}
            {activeTab === 'global_locations' && (
              <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-2xl space-y-6 animate-fadeIn">
                {report.typedCityReport && (
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-amber-500/30 space-y-3 font-sans">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h4 className="font-extrabold text-amber-400 flex items-center gap-1.5 text-sm sm:text-base animate-pulse"><Globe className="w-5 h-5" /> లొకేషన్ విశ్లేషణ: "{report.typedCityReport.name}"</h4>
                      <span className="text-xs bg-amber-500 text-slate-950 px-2.5 py-1 rounded font-black">యోగ స్కోరు: {report.typedCityReport.score}%</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-2">
                      <p>నగర నామ సంఖ్యా బలం: <strong className="text-white">{report.typedCityReport.single}</strong> (సయుక్త విలువ: {report.typedCityReport.total}) | అధిపతి గ్రహం: <strong className="text-amber-300">{report.typedCityReport.planet}</strong></p>
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1 text-[11px] text-slate-400 font-sans">
                        {report.typedCityReport.reasons.map((r, idx) => (<div key={idx} className="flex items-start gap-1"><span className="text-red-500 font-bold">•</span><span>{r}</span></div>))}
                      </div>
                    </div>
                    <div className="mt-3 p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs sm:text-sm font-sans">
                      <strong className="text-indigo-400 flex items-center gap-1.5 mb-1.5"><Wrench className="w-4 h-4"/> 100% స్కోర్ సాధించడానికి ఆస్ట్రో-చిట్కా:</strong>
                      <span className="text-indigo-200 leading-relaxed">{report.typedCityReport.remedy}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-3 font-sans">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wide flex items-center gap-2"><Globe className="w-5 h-5 text-amber-500" /> 15 గ్లోబల్ దేశాల జాతక నివేదిక (Astro-Locality Guide)</h3>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mb-4 text-xs sm:text-sm font-sans flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-emerald-200 leading-relaxed"><strong>గ్లోబల్ మార్కెట్‌లో 100% స్కోర్ సాధించాలంటే:</strong> ఏ దేశానికి వెళ్లినా మీ పేరు 100% సక్సెస్ అవ్వాలంటే, మీ వ్యాపార పేరు సంఖ్యను <strong>'బుధుడు (5)'</strong> లేదా <strong>'శుక్రుడు (6)'</strong> కు వచ్చేలా సెట్ చేసుకోండి. ఇవి సార్వత్రిక మిత్ర గ్రహాలు కాబట్టి ప్రపంచంలో ఎక్కడైనా అఖండ విజయాన్ని ఇస్తాయి.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-[#030514] text-slate-400 uppercase tracking-wider">
                        <tr><th className="p-3">దేశం (Global Country)</th><th className="p-3 text-center">అనుకూలత బలం</th><th className="p-3">యోగ స్థితి</th><th className="p-3">ग्रहం & వివరణ</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {report.locationSuitabilityList.map((city, i) => (
                          <tr key={i} className="hover:bg-slate-900/30">
                            <td className="p-3 font-semibold text-white">{city.name}</td>
                            <td className="p-3 text-center"><span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${city.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : city.score >= 60 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>{city.score}%</span></td>
                            <td className="p-3 font-bold">{city.status}</td>
                            <td className="p-3 space-y-1">
                              <div className="text-amber-500 font-semibold text-xs">{city.significance}</div>
                              <div className="text-[11px] text-slate-400 leading-relaxed">{city.reasons.join(" ")}</div>
                              <div className="text-[10px] text-slate-500 font-serif italic">{city.details}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: NUMEROLOGY (LOSHU & COMPOUND) */}
            {activeTab === 'numerology' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-2xl space-y-4 font-sans">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wide flex items-center gap-2"><Compass className="w-5 h-5 text-indigo-400" /> ప్రపంచ సంఖ్యాశాస్త్ర పద్ధతుల విశ్లేషణ</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl relative overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">Primary Astro Engine</div>
                      <span className="text-[11px] text-amber-400 font-bold uppercase block mb-1">చాల్డియన్ (Chaldean)</span>
                      <div className="text-2xl font-black text-white">{report.chaldeanSingle} <span className="text-sm text-slate-400 font-medium">({report.chaldeanTotal})</span></div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">వ్యాపార నామానికి ప్రపంచవ్యాప్తంగా 90% ఆస్ట్రాలజర్లు వాడే అత్యంత ప్రామాణికమైన విధానం. ఈ యాప్ పూర్తి ఫలితాలు 100% దీనిపైనే ఆధారపడి ఉన్నాయి.</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                      <span className="text-[11px] text-blue-400 font-bold uppercase block mb-1">పైథాగరియన్ (Pythagorean)</span>
                      <div className="text-2xl font-black text-white">{report.pythagoreanSingle} <span className="text-sm text-slate-400 font-medium">({report.pythagoreanTotal})</span></div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">ఆధునిక పాశ్చాత్య దేశాలలో ఎక్కువగా ఉపయోగించే సంఖ్యా పద్ధతి. అక్షరాల వరుస క్రమాన్ని బట్టి దీనిని లెక్కిస్తారు.</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                      <span className="text-[11px] text-purple-400 font-bold uppercase block mb-1">కబ్బాలా (Kabbalah)</span>
                      <div className="text-2xl font-black text-white">{report.kabbalahSingle} <span className="text-sm text-slate-400 font-medium">({report.kabbalahTotal})</span></div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">హిబ్రూ శబ్ద తరంగాల ఆధారంగా పనిచేసే ప్రాచీన విధానం. వైబ్రేషన్స్ విశ్లేషణకు అదనంగా వాడతారు.</p>
                    </div>
                  </div>
                </div>

                {COMPOUND_NUMBERS[report.chaldeanTotal] && (
                  <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-2xl space-y-3 font-sans">
                    <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wide flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" /> చీరో సయుక్త సంఖ్యా విశ్లేషణ: నెంబర్ {report.chaldeanTotal}
                      </h3>
                      <span className={`px-2.5 py-1 rounded text-xs font-black ${COMPOUND_NUMBERS[report.chaldeanTotal].status.includes("Auspicious") || COMPOUND_NUMBERS[report.chaldeanTotal].status.includes("శుభప్రదం") || COMPOUND_NUMBERS[report.chaldeanTotal].status.includes("శక్తి") ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {COMPOUND_NUMBERS[report.chaldeanTotal].status}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif animate-fadeIn">{COMPOUND_NUMBERS[report.chaldeanTotal].desc}</p>
                  </div>
                )}

                <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-2xl space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wide font-sans">మీ జన్మ తేదీ ఆధారిత చైనీస్ లోషు గ్రిడ్ (Loshu Grid)</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center font-sans">
                    <div className="md:col-span-5 flex justify-center">
                      <div className="grid grid-cols-3 w-48 h-48 bg-slate-950/80 border-2 border-slate-800 rounded-xl overflow-hidden text-center font-black text-lg">
                        {[
                          { val: "4", show: report.loshuMap[4] }, { val: "9", show: report.loshuMap[9] }, { val: "2", show: report.loshuMap[2] },
                          { val: "3", show: report.loshuMap[3] }, { val: "5", show: report.loshuMap[5] }, { val: "7", show: report.loshuMap[7] },
                          { val: "8", show: report.loshuMap[8] }, { val: "1", show: report.loshuMap[1] }, { val: "6", show: report.loshuMap[6] }
                        ].map((cell, i) => (
                          <div key={i} className="border border-slate-850 flex flex-col justify-center items-center min-h-[64px]">
                            {cell.show ? <span className="text-amber-400 font-extrabold">{cell.show}</span> : <span className="text-slate-800 opacity-20">{cell.val}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-7 space-y-3 text-xs leading-relaxed">
                      <h4 className="font-bold text-yellow-400 text-sm">లోషు గ్రిడ్ విశ్లేషణ:</h4>
                      <p className="text-slate-300 font-sans">మీ గ్రిడ్‌లో <strong className="text-white">5వ సంఖ్య (బుధుడు)</strong>{report.loshuMap[5] ? " బలంగా ఉంది! ఇది మీ వ్యాపార నిర్ణయాత్మక శక్తిని, చాతుర్యాన్ని మరియు మార్కెట్ లో స్థిరమైన నిలకడను ఇస్తుంది." : " లోపించినది. వ్యాపార నిర్ణయాలలో తరచూ గందరగోళం రాకుండా ఉండడానికి బుధవారం ఆకుపచ్చని వస్త్రాలు లేదా పచ్చల ఉంగరాన్ని ధరించండి."}</p>
                      <p className="text-slate-300 font-sans">మీ గ్రిడ్‌లో <strong className="text-white">6వ సంఖ్య (శుక్రుడు)</strong>{report.loshuMap[6] ? " ఉన్నది. ఇది అపార కీర్తిని, బ్రాండ్ గ్లామర్ ని ఇస్తుంది." : " లోపించినది. కస్టమర్ల ఆకర్షణను పెంచేందుకు వ్యాపార లోగోను గుండ్రంగా మరియు వైట్/సిల్వర్ రంగులతో డిజైన్ చేయండి."}</p>
                    </div>
                  </div>
                </div>

                {report.finalUniversalSuggestions.length > 0 && (
                  <div className="bg-[#080b20]/60 border border-slate-850 p-6 rounded-2xl space-y-4 animate-fadeIn font-sans">
                    <div className="border-b border-slate-800 pb-2">
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wide flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> సర్వవ్యాప్త ఏకీకృత నామ సూచనలు (Universal Brand Names)</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">మీ వ్యాపారం భవిష్యత్తులో ఎన్ని బ్రాంచ్‌లుగా విస్తరించినా, ఏ దేశానికి తరలించినా ఎటువంటి గ్రహ శత్రుత్వం లేకుండా ఐశ్వర్యాన్ని ఇచ్చే ఏకీకృత నామ సూచనలు:</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {report.finalUniversalSuggestions.map((item, i) => (
                        <div key={i} className="bg-[#030514] border border-slate-800 p-4 rounded-xl hover:border-amber-500/40 transition-all font-sans">
                          <div className="font-mono text-sm font-black text-white">{item.name}</div>
                          <div className="text-[11px] text-amber-500 mt-1">సంఖ్య: {item.singleNumber} | అధిపతి: {item.planetName}</div>
                          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center pt-4 animate-fadeIn">
              <button onClick={() => setReport(null)} className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> వేరొక వ్యాపార పేరు పరీక్షించండి
              </button>
            </div>

          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-900/60 pt-8 pb-8 text-center text-[10px] sm:text-xs text-slate-600 px-4">
        <p>© 2026 Vyapaara Jaathakam Global Pro. సాంప్రదాయ చాల్డియన్, వేద ఆస్ట్రో మరియు లోషు గ్రిడ్ సిద్ధాంతాల ప్రకారం లెక్కించబడింది.</p>
      </footer>
    </div>
  );
}