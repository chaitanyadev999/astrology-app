import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown, ChevronUp, Save, Download, Trash2, Plus,
  Star, CheckCircle, XCircle, MinusCircle, FileText, History,
  TrendingUp, BarChart3, BookOpen
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
type ScoreVal = 0 | 1 | 2 | 3 | 4 | 5;
type ScoreLabel = 'అనుకూలం' | 'తటస్థం' | 'ప్రతికూలం' | '';

interface CheckItem {
  id: string;
  label: string;
  score: ScoreVal;
  scoreLabel: ScoreLabel;
  note: string;
}

interface Section {
  id: string;
  title: string;
  emoji: string;
  color: string;
  items: CheckItem[];
  sectionNote: string;
}

interface Attempt {
  id: string;
  date: string;
  time: string;
  company: string;
  drawDate: string;
  totalScore: number;
  maxScore: number;
  sections: Section[];
  finalNumbers: string;
  result: 'hit' | 'near' | 'miss' | '';
  resultNote: string;
}

// ─── Section Definitions ─────────────────────────────────
const makeItem = (id: string, label: string): CheckItem => ({
  id, label, score: 0, scoreLabel: '', note: ''
});

const SECTION_DEFS: Omit<Section, 'items' | 'sectionNote'>[] = [
  { id: 's1', title: 'వ్యక్తిగత జన్మ జాతక ప్రాథమికాలు', emoji: '🪐', color: 'yellow' },
  { id: 's2', title: 'భావాలు, యోగాలు, ఆర్థిక సూచనలు', emoji: '💰', color: 'emerald' },
  { id: 's3', title: 'దశ, అంతర్దశ, గోచార సమయ నిర్ధారణ', emoji: '⏳', color: 'blue' },
  { id: 's4', title: 'హోరా, క్షణ, దిశ, స్థల ప్రభావాలు', emoji: '🧭', color: 'purple' },
  { id: 's5', title: 'ఊరు, కంపెనీ, బ్రాండ్, డ్రా వ్యవస్థ పోలికలు', emoji: '🏢', color: 'cyan' },
  { id: 's6', title: 'నక్షత్ర, తారా బలం, పంచాంగ అనుసంధానం', emoji: '⭐', color: 'amber' },
  { id: 's7', title: 'న్యూమరాలజీ వ్యక్తిగత పోలికలు', emoji: '🔢', color: 'pink' },
  { id: 's8', title: 'టికెట్ సంఖ్య ఎంపిక విధానాలు', emoji: '🎫', color: 'indigo' },
  { id: 's9', title: 'గత ఫలితాల గణాంక పరిశీలన', emoji: '📊', color: 'teal' },
  { id: 's10', title: 'గణిత, లాజిక్, ప్యాటర్న్ మోడలింగ్', emoji: '🧮', color: 'violet' },
  { id: 's11', title: 'విస్తరిత పరిశీలన: అదనపు సంకేతాలు', emoji: '🔭', color: 'rose' },
  { id: 's12', title: 'రికార్డింగ్ ఫార్మాట్ మరియు తుది చెక్లిస్ట్', emoji: '📋', color: 'slate' },
];

const ITEMS_BY_SECTION: Record<string, string[]> = {
  s1: [
    'సరైన పుట్టిన తేదీ నిర్ధారణ','సరైన పుట్టిన సమయం నిర్ధారణ','పుట్టిన స్థలం ఖచ్చిత నిర్ధారణ',
    'లగ్నం ఖచ్చితంగా స్థిరపరచడం','జన్మ రాశి నిర్ధారణ','జన్మ నక్షత్రం నిర్ధారణ',
    'చంద్ర స్థానం డిగ్రీ స్థాయి పరిశీలన','లగ్నాధిపతి బలం','చంద్రుని బలం','గురు బలం',
    'శుక్ర బలం','బుధుని బలం','శనిగ్రహ ప్రభావ స్థాయి','రాహు-కేతు అక్ష ప్రాధాన్యం',
    'జన్మ జాతకంలో ధన యోగాల ఉనికి','ఆకస్మిక ధనప్రాప్తి సూచనలు ఉన్నాయా',
    'పంచమ భావ బలం','అష్టమ భావ బలం','నవమ భావ బలం','ఏకాదశ భావ బలం','ద్వితీయ భావ బలం',
    'లగ్నం నుండి లాభస్థానం పరిశీలన','చంద్రరాశి నుండి లాభస్థానం పరిశీలన',
    'జన్మ జాతకంలో శుభగ్రహాల దృష్టులు లాభస్థానంపై ఉన్నాయా',
  ],
  s2: [
    'ద్వితీయాధిపతి స్థానం','ద్వితీయాధిపతిపై శుభ దృష్టి','పంచమాధిపతి స్థానం','పంచమాధిపతి బలం',
    'అష్టమాధిపతి స్థానం','అష్టమాధిపతిపై శుభ/పాప ప్రభావం','నవమాధిపతి స్థానం',
    'నవమాధిపతి గురుతో సంబంధం','ఏకాదశాధిపతి స్థానం','ఏకాదశాధిపతి లాభదాయక సంయోగం',
    'ధనస్థానం మీద గురు దృష్టి','ధనస్థానం మీద శుక్ర దృష్టి','పంచమ-ఏకాదశ సంబంధం',
    'ద్వితీయ-ఏకాదశ సంబంధం','నవమ-ఏకాదశ సంబంధం','పంచమ-నవమ-ఏకాదశ త్రికోణ అనుసంధానం',
    'చంద్రుడు ధన భావాలను స్పర్శిస్తున్నాడా','రాహు ఆకస్మిక లాభ కారకత్వం ఎలా పనిచేస్తోంది',
    'గురు విస్తరణ ప్రభావం ధనస్థానాల్లో ఉందా','శుక్రుడు సుఖ-సంపద కారకుడిగా సహకరిస్తున్నాడా',
    'బుధుడు సంఖ్యలు/వాణిజ్య ధోరణికి అనుకూలంగా ఉన్నాడా','శని ఆలస్యం లేదా క్రమశిక్షణగా పనిచేస్తున్నాడా',
    'మారక/వ్యయ/రుణ ప్రభావాలు అధికమై ఉన్నాయా','యోగం ఉన్నా భంగం కలిగించే స్థితులు ఉన్నాయా',
  ],
  s3: [
    'ప్రస్తుత మహాదశ ఏ గ్రహం','ప్రస్తుత అంతర్దశ ఏ గ్రహం','ప్రత్యంతర్దశ స్థాయి వరకు సమయం కుదిస్తే',
    'దశాధిపతి ధన/లాభ భావాలకు అనుసంధానమై ఉందా','అంతర్దశాధిపతి పంచమ/అష్టమ/ఏకాదశ భావాలతో అనుసంధానం',
    'గోచార గురు లాభ/ధన సంబంధ భావాలపై ప్రభావం','గోచార శుక్రుడు అనుకూలత',
    'గోచార చంద్రుడు మానసిక స్థిరత్వం/టైమింగ్కు సహాయపడుతుందా','గోచార బుధుడు సంఖ్యాధారిత నిర్ణయాలకు అనుకూలమా',
    'గోచార శని అడ్డంకి ఇస్తుందా','గోచార రాహు అనూహ్యత్వాన్ని పెంచుతోందా',
    'గోచార కేతు విరక్తి/అసంబద్ధ ఎంపికకు దారి తీస్తుందా','చంద్రబలం ఉన్న రోజు ఎంపిక',
    'తిథి అనుకూలత','వార ప్రాధాన్యం','ఆ రోజు యోగం పరిశీలన','ఆ రోజు కరణం పరిశీలన',
    'పాపకర్తరి లేదా కఠిన గోచార పరిస్థితుల నివారణ','వక్రీ గ్రహ ప్రభావం',
    'అస్తంగత గ్రహ ప్రభావం','గ్రహణ సమీపం ఉంటే జాగ్రత్త',
    'రోజు మొత్తం కంటే గంట వారీ గోచార-మూడ్ మార్పులు','టికెట్ కొనుగోలు సమయం స్కోర్',
    'డ్రా సమయం స్కోర్ (వేరుగా)','దశ బలంగా ఉన్నా గోచారం బలహీనమైతే తగ్గింపు స్కోర్',
  ],
  s4: [
    'టికెట్ కొనుగోలు హోరా నిర్ణయించడం','కొనుగోలు హోరాధిపతి జన్మ జాతకానికి అనుకూలమా',
    'కొనుగోలు క్షణంలో లగ్నం ఏమిటి','ఆ క్షణ లగ్నం నుండి ధన/లాభ భావాలు',
    'డ్రా ప్రకటించే క్షణ హోరా','కొనుగోలు స్థల దిశ','కొనుగోలు చేసేటప్పుడు వ్యక్తి ముఖదిశ',
    'కౌంటర్ దిశ వ్యక్తి జాతకానికి అనుకూలమా','రాహుకాలం/యమగండం/గులిక నివారణ',
    'అభిజిత్ లేదా శుభ ముహూర్తానికి దగ్గరలో ఉందా','టికెట్ కొనుగోలు ముందు ముఖ్య గ్రహ గంట మార్పు ఉందా',
    'అదే రోజు బహుళ హోరాల్లో ఏది బలంగా ఉందో పోల్చడం','కొనుగోలు క్షణం మరియు డ్రా క్షణం మధ్య గ్రహాధిపత్య మార్పు',
    'రాత్రి/పగలు హోరా భేదం','సూర్యోదయ ఆధారిత హోరా గణన సరిచూడడం',
    'స్థలం మారితే హోరా అంచనా మారుతోందా','వేదిక లేదా కౌంటర్ ఎక్కడ ఉందో మ్యాప్ చేయడం',
    'కొనుగోలు స్థానిక కాలమానం సరియైనదేనా','క్షణిక లగ్న మార్పు కారణంగా 2-3 నిమిషాల జారీ ప్రభావం',
    'చివరి ఎంపికను హోరా-లగ్నం కలిపి నిర్ణయించడం',
  ],
  s5: [
    'వ్యక్తి నివసించే ఊరి స్థాపన తేదీ తెలిసితే','వ్యక్తి నివసించే ఊరి ప్రాథమిక జాతక సూచిక',
    'టికెట్ కొనుగోలు చేసే ఊరి స్థితి వేరు అయితే వేరు స్కోర్','డ్రా జరిగే సంస్థ నమోదు తేదీ',
    'కంపెనీ పేరు న్యూమరాలజీ సంఖ్య','బ్రాండ్ పేరు అక్షర-సంఖ్య అనుసంధానం',
    'కంపెనీ పేరుకు అనుకూల గ్రహాధిపత్యం','వ్యక్తి పేరు సంఖ్య vs కంపెనీ పేరు సంఖ్య పోలిక',
    'వ్యక్తి జన్మ సంఖ్య vs టికెట్ సిరీస్ సంఖ్య','వ్యక్తి డెస్టినీ సంఖ్య vs డ్రా తేదీ సంఖ్య',
    'కొనుగోలు ఊరి సంఖ్యాత్మక విలువ','నివాస ఊరి సంఖ్యాత్మక విలువ',
    'డ్రా నిర్వహించే సంస్థ పేరు మొత్తం విలువ','కంపెనీ స్థాపన రోజు వారాధిపతి',
    'కంపెనీ జన్మ నక్షత్రం తెలిసే పరిస్థితిలో పోలిక','వ్యక్తి జన్మ నక్షత్రంతో సంస్థ నక్షత్ర అనుకూలత',
    'కొనుగోలు ఊరు నక్షత్ర/రాశి సంకేతీకరణ','వ్యక్తి నివాస ప్రాంతం మారిన తర్వాత ఫలిత ధోరణి',
    'ఒకే కంపెనీ టికెట్లలో బెటర్ ప్యాటర్న్ ఉందా','వేర్వేరు బ్రాండ్లలో వ్యక్తికి అనుకూల సిరీస్',
    'ఒకే నగరంలోని వేర్వేరు కౌంటర్ల ఫలిత ప్రవర్తన','నిర్దిష్ట స్థలం-బ్రాండ్ కాంబినేషన్ పునరావృత బలం',
    'టికెట్ జారీ కేంద్రం కోడ్ పునరావృతం','స్థాన మార్పుతో హోరా-లగ్నం ఫలిత పునర్మూల్యాంకనం',
  ],
  s6: [
    'వ్యక్తి జన్మ నక్షత్రం నమోదు','టికెట్ కొనుగోలు రోజు నక్షత్రం నమోదు','డ్రా రోజు నక్షత్రం నమోదు',
    'జన్మ నక్షత్రం నుండి కొనుగోలు రోజు నక్షత్రానికి తారాబలం','జన్మ నక్షత్రం నుండి డ్రా రోజు నక్షత్రానికి తారాబలం',
    'కొనుగోలు రోజు నక్షత్రం & డ్రా రోజు నక్షత్రం పరస్పర అనుకూలత','జన్మ పాదం vs రోజు నక్షత్ర పాదం',
    'చంద్రుడు ఆ రోజు ఏ నక్షత్రంలో ఉన్నాడో','కొనుగోలు క్షణ నక్షత్రాధిపతి అనుకూలమా',
    'డ్రా క్షణ నక్షత్రాధిపతి అనుకూలమా','శుభ తార/మిత్ర తార/సమ తార/విపత్ తార వర్గీకరణ',
    'చంద్రాష్టమ దినం నివారణ','జన్మ రాశికి అనుకూల గోచార చంద్ర స్థానం',
    'తిథి-వార-నక్షత్ర సంయుక్త స్కోరింగ్','అమావాస్య/పౌర్ణమి సమీపంలో మానసిక ఉత్సాహం ప్రభావం',
    'శుభ యోగం ఉన్న రోజుల్లో మాత్రమే ఎంపిక','జన్మ నక్షత్ర దినంలో ఫలిత రికార్డు వేరు',
    'అనూరాధ/పుష్య/రోహిణి వంటి శుభ నక్షత్రాల్లో రికార్డు','అసౌకర్య నక్షత్రాల్లో ఫలితాలు వేరుగా లాగ్',
    'నక్షత్రాధిపతి-దశాధిపతి సంబంధం',
  ],
  s7: [
    'జన్మ సంఖ్య (తేదీ) గణన','జీవన మార్గ సంఖ్య / మొత్తం పుట్టిన తేదీ సంఖ్య','పేరు సంఖ్య గణన',
    'సంతకం సంఖ్య లేదా సంక్షిప్త పేరు సంఖ్య','పుట్టిన సమయం గంటలను సంఖ్యాత్మక కోడు',
    'నిమిషాలను కూడా సంఖ్యాత్మక కోడు','టికెట్ కొనుగోలు రోజు తేదీ సంఖ్య','డ్రా రోజు తేదీ సంఖ్య',
    'కొనుగోలు సమయ సంఖ్య','డ్రా సమయ సంఖ్య','జన్మ సంఖ్య vs కొనుగోలు తేదీ సంఖ్య',
    'జన్మ సంఖ్య vs డ్రా తేదీ సంఖ్య','పేరు సంఖ్య vs కంపెనీ పేరు సంఖ్య',
    'జన్మ సంఖ్య vs టికెట్ సిరీస్ మొత్తం సంఖ్య','డెస్టినీ సంఖ్య vs లాటరీ నెంబర్ మొత్త విలువ',
    'ఒక అంకెలకు కుదించిన రూట్ సంఖ్య అనుకూలత','9-గ్రహాలకు కేటాయించిన సంఖ్యా పద్ధతి',
    'వ్యక్తికి తరచూ కనిపించే పునరావృత సంఖ్యల రికార్డు','మొబైల్ నెంబర్ చివరి అంకెలతో సంబంధం',
    'వాహన నెంబర్, ఇంటి నెంబర్ అనుసంధానం','కొనుగోలు రోజు మొత్తం సంఖ్య + హోరా సంఖ్య',
    'న్యూమరాలజీ అనుకూలం ఉన్నా జ్యోతిష్య విరుద్ధత ఉంటే తగ్గింపు','జ్యోతిష్యం & న్యూమరాలజీ రెండూ అనుకూలం అయితే బోనస్',
    '3-స్థాయి స్కోర్: తేదీ, సమయం, టికెట్ సంఖ్య',
  ],
  s8: [
    'పూర్తిగా యాదృచ్ఛిక సంఖ్య','జన్మ సంఖ్య ఆధారిత సంఖ్య','పేరు సంఖ్య ఆధారిత సంఖ్య',
    'హోరా అధిపతి సంఖ్య ఆధారిత ఎంపిక','నక్షత్రాధిపతి సంఖ్య ఆధారిత ఎంపిక',
    'దశాధిపతి సంఖ్య ఆధారిత ఎంపిక','గోచార చంద్రుడు సూచించే సంఖ్య',
    'వ్యక్తి కలలో/మనసులో కనిపించిన సంఖ్యల నోట్','గత వారం వచ్చిన సంఖ్యల నుంచి పూర్తిగా దూరంగా',
    'గత వారం వచ్చిన సంఖ్యలలో కొన్ని పునరావృత అవకాశాలు','సమ/బేసి సంఖ్యల నిష్పత్తి',
    'చిన్న-పెద్ద సంఖ్యల విభజన','వరుస సంఖ్యలు నివారించే పద్ధతి','వరుస సంఖ్యలు అనుమతించే పద్ధతి',
    'మధ్య శ్రేణి సంఖ్యలకు ప్రాధాన్యం','చివరి అంకె ప్యాటర్న్ల పరిశీలన',
    'జతలుగా ఎక్కువసార్లు వచ్చిన సంఖ్యా జంటలు','త్రయాలుగా కనిపించే సంఖ్యా సమూహాలు',
    'సీరియల్ అంతరాల ప్యాటర్న్లు','గ్రహాలకు కేటాయించిన అంకెలు vs టికెట్ మొత్తం',
    'పేరు అక్షరాల సంఖ్యతో సరిపడే అంకెల ఎంపిక','1-9 వరకు అధిక బలం ఉన్న సంఖ్యను ప్రధానంగా',
    'ఒకే మూల సంఖ్యకు తగ్గే కాంబినేషన్లు','ఎంపికలో పునరావృత అంకెను ఉంచాలా వద్దా',
  ],
  s9: [
    'గత వారం వచ్చిన నంబర్ల డేటా సేకరణ','గత నెల వచ్చిన నంబర్ల డేటా సేకరణ',
    'గెలిచిన తేదీల జాబితా','ఆ తేదీల వారాలు నమోదు','ఆ తేదీల నక్షత్రాలు నమోదు',
    'ఆ తేదీల తిథులు నమోదు','ఆ తేదీల గోచార చంద్ర స్థానం','ఆ తేదీల గోచార గురు స్థానం',
    'ఆ తేదీల గోచార శుక్ర స్థానం','ఆ తేదీల గోచార శని ప్రభావం','గత ఫలితాల తేదీ సంఖ్యలు',
    'గత ఫలితాల మొత్తం అంకెల సగటు','ఎక్కువగా కనిపించిన చివరి అంకెలు',
    'ఎక్కువగా దూరంగా ఉన్న సంఖ్యా ప్రాంతాలు','హాట్ నంబర్లు గుర్తించడం','కోల్డ్ నంబర్లు గుర్తించడం',
    'ఒకసారి వచ్చిన తర్వాత ఎన్ని డ్రాల తర్వాత తిరిగి వస్తుందో','జంట పునరావృత్తి మధ్య అంతరాలు',
    'తేదీ-వారం-నక్షత్రం కలయికలో పునరావృత్తి','ఒకే సంస్థలో ప్రత్యేక దినాల్లో ప్యాటర్న్లు',
    'గ్రహస్థితి పోలికతో గత విజేత డ్రా రోజులను ట్యాగ్','చంద్ర స్థితి సమీప పునరావృత్తులపై గమనిక',
    'గురు/శుక్ర అనుకూల గోచార దినాల్లో ఫలిత సాంద్రత','గెలిచిన మరియు గెలవని రోజులకు స్కోర్ మ్యాట్రిక్స్',
  ],
  s10: [
    'బేస్ స్కోర్: జ్యోతిష్య స్కోర్','బేస్ స్కోర్: న్యూమరాలజీ స్కోర్','బేస్ స్కోర్: హోరా స్కోర్',
    'బేస్ స్కోర్: నక్షత్ర స్కోర్','బేస్ స్కోర్: గత ప్యాటర్న్ స్కోర్','మొత్తం ఐదు స్కోర్లకు బరువులు కేటాయించడం',
    'వ్యక్తిగత జాతకానికి ఎక్కువ వెయిటేజ్','టైమింగ్కు ప్రత్యేక వెయిటేజ్',
    'కంపెనీ/స్థలం ఫ్యాక్టర్కు తగ్గిన వెయిటేజ్','గత ఫలితాల గణాంకాలకు స్వతంత్ర వెయిటేజ్',
    'నెగటివ్ గ్రహ ప్రభావానికి పెనాల్టీ పాయింట్లు','విరుద్ధ సంకేతాలకు తగ్గింపు ఫార్ములా',
    'అన్ని సూచనలు కలిసే సందర్భాలకు బోనస్','టాప్ 5 సంభావ్య సంఖ్యా కాంబినేషన్లు',
    'టాప్ 10 బ్యాకప్ కాంబినేషన్లు','ప్రతి కాంబినేషన్కు కారణాల పట్టిక',
    'ఒకే మూల సంఖ్యకు గుంపులుగా విభజించడం','గ్రహ-సంఖ్య మ్యాట్రిక్స్','నక్షత్ర-సంఖ్య మ్యాట్రిక్స్',
    'వారం-సంఖ్య మ్యాట్రిక్స్','తేదీ-సంఖ్య మ్యాట్రిక్స్','హోరా-సంఖ్య మ్యాట్రిక్స్',
    'వ్యక్తి-కంపెనీ అనుకూలత మ్యాట్రిక్స్','"నిషేధిత సంఖ్యలు" జాబితా','"ప్రాధాన్య సంఖ్యలు" జాబితా',
    'స్కోర్ సమీపంగా ఉంటే యాదృచ్ఛిక టైబ్రేకర్','మూడు వేర్వేరు మోడళ్లలో ఒకే సంఖ్య వస్తే ప్రత్యేక గుర్తింపు',
    'మోడల్ ఓవర్ఫిట్టింగ్ జరుగుతోందా','పరీక్షా కాలం, పరిశీలన కాలం వేరు',
    'confirmation bias తగ్గించేందుకు బ్లైండ్ లాగింగ్','నష్ట పరిమితి నియమం',
    'ఫలితాలపై భావోద్వేగ నిర్ణయాలు తగ్గించే నియమం',
  ],
  s11: [
    'వ్యక్తి నివసిస్తున్న ఇంటి నెంబర్ ప్రభావం','కొనుగోలు చేసిన దుకాణం పేరు సంఖ్య',
    'దుకాణం ప్రారంభ సమయం మరియు టికెట్ కొనుగోలు సమయ దూరం','ఇష్ట అంకెల పునరావృత్తి',
    'ఇంట్యూషన్ vs లాజిక్తో ఎంచుకున్న సంఖ్య పోలిక','పుట్టిన తేదీని నేరుగా విభజించి వచ్చిన అంకెల వినియోగం',
    'జన్మ నక్షత్రాధిపతి & రోజు నక్షత్రాధిపతి మధ్య సంబంధం','జన్మ లగ్నాధిపతి & హోరాధిపతి మధ్య సంబంధం',
    'చంద్రరాశి నుండి అష్టమ ప్రభావం అధికమైందా','లాభస్థానంలో గోచార పాపగ్రహాల నివారణ',
    'లాభాధిపతి దశలో మాత్రమే పెద్ద టికెట్ బడ్జెట్','చంద్రబలం తక్కువ రోజుల్లో పూర్తిగా మానేయడం',
    'ఒక్క రోజు బదులు 3 అనుకూల రోజుల విండో','ఒకే రోజు బహుళ క్షణాల్లో ఎంపిక చేసి ప్యాటర్న్',
    'పునరావృతంగా వస్తున్న సబ్టోటల్ సంఖ్యలు','డ్రా నెంబర్ మొత్తం అంకెల చరిత్ర',
    'జాతకంలోని బలమైన గ్రహాల సంఖ్యలు అధికంగా','బలహీన గ్రహాలకు కేటాయించిన సంఖ్యలను తగ్గించడం',
    'కుటుంబ సభ్యుల పేర్ల సంఖ్యల అనుకోని ప్రభావం','ఫోన్లో సేవ్ చేసిన పేరులోని అక్షరసంఖ్య',
    'టికెట్ కొనుగోలు తర్వాత మానసిక నిశ్చింత/ఉత్కంఠ రేటింగ్','నిర్ణయ సమయంలో తొందరపాటు ఉన్నదా',
    'అదే హోరాలో గతంలో గెలిచిన/దగ్గరపడ్డ డ్రాల జాబితా','27 నక్షత్రాలపై ఫలిత పంపిణి',
    '12 రాశులపై ఫలిత పంపిణి','వారాల వారీ ఫలిత పంపిణి','నెలల వారీ ఫలిత పంపిణి',
    'పౌర్ణమి/అమావాస్య విండోల వారీ పోలిక','వక్రీ గురు లేదా వక్రీ శని సమయంలో తీసుకున్న టికెట్ల విశ్లేషణ',
    'డ్రా సమయానికి ముందు/తర్వాత 30 నిమిషాల గ్రహస్థితి','కౌంటర్ ఎంచుకున్న క్షణం కూడా రికార్డు',
    'టికెట్ ఎంపిక క్షణం మరియు చెల్లింపు క్షణం వేరు అయితే',
  ],
  s12: [
    'ప్రతి ప్రయత్నానికి ఒక యూనిక్ ఐడి ఇవ్వడం','తేదీ, సమయం, స్థలం, కౌంటర్, హోరా నమోదు',
    'రోజు నక్షత్రం, తిథి, వారం నమోదు','ప్రస్తుత దశ, అంతర్దశ నమోదు',
    'ప్రధాన 5 అనుకూల గ్రహాలు/వ్యతిరేక గ్రహాలు నమోదు','వ్యక్తిగత స్కోర్, టైమింగ్ స్కోర్, సంఖ్యా స్కోర్ నమోదు',
    'ఎంచుకున్న ఫైనల్ నంబర్లకు కారణాలు 3 పాయింట్లలో','ఫలితం: హిట్/మిస్/నియర్ హిట్ వర్గీకరణ',
    'సమీప సంఖ్యలు వచ్చినా వేరు ట్యాగ్','30 ప్రయత్నాల తర్వాత మాత్రమే మోడల్ సమీక్ష',
    'ప్రతి 90 రోజులకు వెయిటేజ్లను సవరించడం','పనిచేయని 20 సంకేతాలను తొలగించడం',
    'నిరంతరం ఉపయోగపడే 20 సంకేతాలకు అధిక ప్రాధాన్యం','ముందుగా అంచనా రాయడం (confirmation bias తగ్గించేందుకు)',
    'ఫలితం తర్వాత లెక్కలు మార్చకూడదు అనే నియమం','బడ్జెట్ పరిమితి, ప్రమాద నియంత్రణ తుది చెక్పాయింట్',
  ],
};

const buildSection = (def: typeof SECTION_DEFS[0]): Section => ({
  ...def,
  items: (ITEMS_BY_SECTION[def.id] || []).map((label, i) => makeItem(`${def.id}_i${i}`, label)),
  sectionNote: '',
});

const buildFreshSections = (): Section[] => SECTION_DEFS.map(buildSection);

// ─── Score helpers ────────────────────────────────────────
const SCORE_COLORS: Record<number, string> = {
  0: 'bg-slate-800 text-slate-500',
  1: 'bg-red-900/60 text-red-400',
  2: 'bg-orange-900/60 text-orange-400',
  3: 'bg-amber-900/60 text-amber-300',
  4: 'bg-blue-900/60 text-blue-300',
  5: 'bg-emerald-900/60 text-emerald-300',
};
const SCORE_LABELS_SHORT = ['—', '❌1', '⚠️2', '🟡3', '🔵4', '🟢5'];
const SCORE_LABELS_FULL = ['未入力', 'ప్రతికూలం (1)', 'కొంచెం ప్రతికూలం (2)', 'తటస్థం (3)', 'కొంచెం అనుకూలం (4)', 'అనుకూలం (5)'];

const sectionColorClass = (color: string) => ({
  yellow: 'border-yellow-500/40 bg-yellow-500/5',
  emerald: 'border-emerald-500/40 bg-emerald-500/5',
  blue: 'border-blue-500/40 bg-blue-500/5',
  purple: 'border-purple-500/40 bg-purple-500/5',
  cyan: 'border-cyan-500/40 bg-cyan-500/5',
  amber: 'border-amber-500/40 bg-amber-500/5',
  pink: 'border-pink-500/40 bg-pink-500/5',
  indigo: 'border-indigo-500/40 bg-indigo-500/5',
  teal: 'border-teal-500/40 bg-teal-500/5',
  violet: 'border-violet-500/40 bg-violet-500/5',
  rose: 'border-rose-500/40 bg-rose-500/5',
  slate: 'border-slate-500/40 bg-slate-800/40',
}[color] || 'border-slate-500/40 bg-slate-800/40');

const sectionTitleColor = (color: string) => ({
  yellow: 'text-yellow-400', emerald: 'text-emerald-400', blue: 'text-blue-400',
  purple: 'text-purple-400', cyan: 'text-cyan-400', amber: 'text-amber-400',
  pink: 'text-pink-400', indigo: 'text-indigo-400', teal: 'text-teal-400',
  violet: 'text-violet-400', rose: 'text-rose-400', slate: 'text-slate-300',
}[color] || 'text-slate-300');

const LS_KEY = 'lotteryChecklist_v2';

const loadData = (): { sections: Section[]; attempts: Attempt[] } => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { sections: buildFreshSections(), attempts: [] };
    const parsed = JSON.parse(raw);
    // Merge saved items with any new items added to definitions
    const savedSections: Section[] = parsed.sections || [];
    const merged = SECTION_DEFS.map(def => {
      const saved = savedSections.find(s => s.id === def.id);
      if (!saved) return buildSection(def);
      const freshItems = (ITEMS_BY_SECTION[def.id] || []).map((label, i) => {
        const savedItem = saved.items.find((si: CheckItem) => si.id === `${def.id}_i${i}`);
        return savedItem ? savedItem : makeItem(`${def.id}_i${i}`, label);
      });
      return { ...saved, items: freshItems };
    });
    return { sections: merged, attempts: parsed.attempts || [] };
  } catch { return { sections: buildFreshSections(), attempts: [] }; }
};

const getTotalScore = (sections: Section[]) => {
  let total = 0; let max = 0;
  sections.forEach(s => s.items.forEach(it => { total += it.score; max += 5; }));
  return { total, max, pct: max ? Math.round((total / max) * 100) : 0 };
};

const getSectionScore = (s: Section) => {
  const total = s.items.reduce((a, it) => a + it.score, 0);
  const max = s.items.length * 5;
  return { total, max, pct: max ? Math.round((total / max) * 100) : 0 };
};

// ─── Main Component ───────────────────────────────────────
export default function LotteryChecklist() {
  const [data, setData] = useState<{ sections: Section[]; attempts: Attempt[] }>(loadData);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [tab, setTab] = useState<'checklist' | 'history' | 'stats'>('checklist');
  const [attemptMeta, setAttemptMeta] = useState({ company: '', drawDate: '', finalNumbers: '' });
  const [showNotes, setShowNotes] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scored' | 'unscored'>('all');

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [data]);

  const updateItem = useCallback((secId: string, itemId: string, field: 'score' | 'note' | 'scoreLabel', val: any) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id !== secId ? s : {
          ...s,
          items: s.items.map(it => it.id !== itemId ? it : { ...it, [field]: val })
        }
      )
    }));
  }, []);

  const updateSectionNote = useCallback((secId: string, note: string) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id !== secId ? s : { ...s, sectionNote: note })
    }));
  }, []);

  const saveAttempt = () => {
    const { total, max, pct } = getTotalScore(data.sections);
    const attempt: Attempt = {
      id: `A${Date.now()}`,
      date: new Date().toLocaleDateString('te-IN'),
      time: new Date().toLocaleTimeString('te-IN', { hour: '2-digit', minute: '2-digit' }),
      company: attemptMeta.company,
      drawDate: attemptMeta.drawDate,
      totalScore: total,
      maxScore: max,
      sections: JSON.parse(JSON.stringify(data.sections)),
      finalNumbers: attemptMeta.finalNumbers,
      result: '',
      resultNote: '',
    };
    setData(prev => ({ ...prev, attempts: [attempt, ...prev.attempts] }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateAttemptResult = (id: string, result: Attempt['result'], note: string) => {
    setData(prev => ({
      ...prev,
      attempts: prev.attempts.map(a => a.id !== id ? a : { ...a, result, resultNote: note })
    }));
  };

  const resetCurrent = () => {
    if (!confirm('ప్రస్తుత స్కోర్లు reset చేయాలా? (History లో save అవుతుంది)')) return;
    saveAttempt();
    setData(prev => ({ ...prev, sections: buildFreshSections() }));
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `lottery_checklist_${new Date().toISOString().slice(0, 10)}.json`; a.click();
  };

  const { total, max, pct } = getTotalScore(data.sections);
  const overallGrade = pct >= 80 ? '🟢 అత్యుత్తమం' : pct >= 60 ? '🔵 మంచిది' : pct >= 40 ? '🟡 తటస్థం' : '🔴 ప్రతికూలం';

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-400"/>📋 లాటరీ సమగ్ర పరిశీలన చెక్లిస్ట్
            </h2>
            <p className="text-xs text-slate-400 mt-1">12 Categories • 300+ Items • స్కోర్ 0–5 • Auto-save • History</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={saveAttempt} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${saved ? 'bg-emerald-500 text-black' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
              <Save className="w-3 h-3"/>{saved ? '✅ Saved!' : 'Save Attempt'}
            </button>
            <button onClick={resetCurrent} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center gap-1.5">
              <Plus className="w-3 h-3"/>New Attempt
            </button>
            <button onClick={exportData} className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 flex items-center gap-1.5">
              <Download className="w-3 h-3"/>Export JSON
            </button>
          </div>
        </div>

        {/* Overall Score */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-purple-500/20">
            <p className="text-xs text-slate-400">మొత్తం స్కోర్</p>
            <p className="text-2xl font-black text-purple-300">{total}/{max}</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-purple-500/20">
            <p className="text-xs text-slate-400">శాతం</p>
            <p className="text-2xl font-black text-white">{pct}%</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-purple-500/20">
            <p className="text-xs text-slate-400">గ్రేడ్</p>
            <p className="text-sm font-black">{overallGrade}</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-purple-500/20">
            <p className="text-xs text-slate-400">చరిత్ర</p>
            <p className="text-2xl font-black text-blue-300">{data.attempts.length}</p>
          </div>
        </div>
        <div className="mt-3 bg-slate-800 rounded-full h-2">
          <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'checklist', label: '📋 చెక్లిస్ట్', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'history', label: `📜 చరిత్ర (${data.attempts.length})`, icon: <History className="w-4 h-4" /> },
          { id: 'stats', label: '📊 గణాంకాలు', icon: <BarChart3 className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${tab === t.id ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ═══ CHECKLIST TAB ═══ */}
      {tab === 'checklist' && (
        <div className="space-y-3">
          {/* Attempt Meta */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">🏢 కంపెనీ / లాటరీ పేరు</label>
              <input value={attemptMeta.company} onChange={e => setAttemptMeta(p => ({ ...p, company: e.target.value }))}
                placeholder="Kerala Lottery / Mega Millions..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">🎫 Draw తేదీ</label>
              <input type="date" value={attemptMeta.drawDate} onChange={e => setAttemptMeta(p => ({ ...p, drawDate: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">🏆 ఎంచుకున్న Final Numbers</label>
              <input value={attemptMeta.finalNumbers} onChange={e => setAttemptMeta(p => ({ ...p, finalNumbers: e.target.value }))}
                placeholder="7, 14, 23, 36, 42, 49" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-slate-500 self-center">Filter:</span>
            {['all', 'scored', 'unscored'].map(f => (
              <button key={f} onClick={() => setFilter(f as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {f === 'all' ? 'అన్నీ' : f === 'scored' ? 'స్కోర్ చేసినవి' : 'స్కోర్ చేయనివి'}
              </button>
            ))}
          </div>

          {/* Sections */}
          {data.sections.map(section => {
            const sc = getSectionScore(section);
            const filteredItems = section.items.filter(it =>
              filter === 'all' ? true : filter === 'scored' ? it.score > 0 : it.score === 0
            );
            const isOpen = openSection === section.id;

            return (
              <div key={section.id} className={`border ${sectionColorClass(section.color)} rounded-2xl overflow-hidden`}>
                {/* Section Header */}
                <button onClick={() => setOpenSection(isOpen ? null : section.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{section.emoji}</span>
                    <div className="text-left">
                      <p className={`font-black text-sm ${sectionTitleColor(section.color)}`}>{section.title}</p>
                      <p className="text-[10px] text-slate-500">{section.items.length} items • Score: {sc.total}/{sc.max} ({sc.pct}%)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-slate-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${sc.pct}%` }} />
                    </div>
                    <span className={`text-sm font-black ${sc.pct >= 70 ? 'text-emerald-400' : sc.pct >= 40 ? 'text-amber-400' : 'text-slate-500'}`}>{sc.pct}%</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* Section Body */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-1.5 border-t border-white/5">
                    {/* Section Note */}
                    <div className="my-2">
                      <textarea
                        value={section.sectionNote}
                        onChange={e => updateSectionNote(section.id, e.target.value)}
                        placeholder={`${section.title} పై మీ పరిశీలన గమనికలు (old data delete అవదు — auto-save)...`}
                        rows={2}
                        className="w-full bg-slate-950/80 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
                      />
                    </div>

                    {filteredItems.map(item => (
                      <div key={item.id} className={`rounded-xl px-3 py-2 border transition-colors ${item.score === 5 ? 'bg-emerald-900/10 border-emerald-500/20' : item.score >= 4 ? 'bg-blue-900/10 border-blue-500/15' : item.score <= 1 && item.score > 0 ? 'bg-red-900/10 border-red-500/15' : 'bg-slate-900/40 border-slate-800/50'}`}>
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-200 leading-snug">{item.label}</p>
                          </div>
                          {/* Score Buttons */}
                          <div className="flex gap-1 shrink-0">
                            {([1, 2, 3, 4, 5] as ScoreVal[]).map(s => (
                              <button key={s}
                                onClick={() => updateItem(section.id, item.id, 'score', item.score === s ? 0 : s)}
                                title={SCORE_LABELS_FULL[s]}
                                className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${item.score === s ? SCORE_COLORS[s] + ' ring-2 ring-white/20' : 'bg-slate-800 text-slate-600 hover:bg-slate-700'}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                          {/* Note toggle */}
                          <button
                            onClick={() => setShowNotes(p => ({ ...p, [item.id]: !p[item.id] }))}
                            className="text-slate-600 hover:text-slate-400 transition-colors shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Score label */}
                        {item.score > 0 && (
                          <div className="flex gap-2 mt-1">
                            {(['అనుకూలం', 'తటస్థం', 'ప్రతికూలం'] as ScoreLabel[]).map(l => (
                              <button key={l}
                                onClick={() => updateItem(section.id, item.id, 'scoreLabel', item.scoreLabel === l ? '' : l)}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition-colors ${item.scoreLabel === l
                                  ? l === 'అనుకూలం' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                    : l === 'తటస్థం' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                      : 'bg-red-500/20 border-red-500/50 text-red-300'
                                  : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
                                {l === 'అనుకూలం' ? '✅ ' : l === 'తటస్థం' ? '⚖️ ' : '❌ '}{l}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Note input */}
                        {showNotes[item.id] && (
                          <input
                            value={item.note}
                            onChange={e => updateItem(section.id, item.id, 'note', e.target.value)}
                            placeholder="గమనిక..."
                            className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                          />
                        )}
                      </div>
                    ))}

                    {filteredItems.length === 0 && (
                      <p className="text-xs text-slate-600 text-center py-4">
                        {filter === 'scored' ? 'ఇంకా స్కోర్ చేయనివి లేవు' : 'అన్నీ స్కోర్ అయ్యాయి!'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ HISTORY TAB ═══ */}
      {tab === 'history' && (
        <div className="space-y-3">
          {data.attempts.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>ఇంకా చరిత్ర లేదు. "Save Attempt" click చేయండి.</p>
            </div>
          )}
          {data.attempts.map(attempt => {
            const pctA = Math.round((attempt.totalScore / attempt.maxScore) * 100);
            return (
              <div key={attempt.id} className={`border rounded-2xl p-4 ${attempt.result === 'hit' ? 'border-yellow-500/50 bg-yellow-500/5' : attempt.result === 'near' ? 'border-blue-500/30 bg-blue-500/5' : attempt.result === 'miss' ? 'border-red-500/20 bg-red-500/5' : 'border-slate-700 bg-slate-900/40'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-sm text-white flex items-center gap-2">
                      {attempt.result === 'hit' ? '🏆' : attempt.result === 'near' ? '🎯' : attempt.result === 'miss' ? '❌' : '📋'}
                      {attempt.company || 'Lottery'} — {attempt.drawDate || attempt.date}
                    </p>
                    <p className="text-xs text-slate-500">{attempt.id} • {attempt.date} {attempt.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-black ${pctA >= 70 ? 'text-emerald-400' : pctA >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{pctA}%</span>
                    <span className="text-xs text-slate-500">{attempt.totalScore}/{attempt.maxScore}</span>
                  </div>
                </div>
                {attempt.finalNumbers && <p className="text-xs text-yellow-300 mb-2">🏆 Numbers: {attempt.finalNumbers}</p>}
                {/* Result Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { v: 'hit' as const, label: '🏆 Hit/Win', cls: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300' },
                    { v: 'near' as const, label: '🎯 Near Hit', cls: 'bg-blue-500/20 border-blue-500/50 text-blue-300' },
                    { v: 'miss' as const, label: '❌ Miss', cls: 'bg-red-500/20 border-red-500/50 text-red-300' },
                  ].map(opt => (
                    <button key={opt.v}
                      onClick={() => updateAttemptResult(attempt.id, attempt.result === opt.v ? '' : opt.v, attempt.resultNote)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${attempt.result === opt.v ? opt.cls : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                      {opt.label}
                    </button>
                  ))}
                  <input
                    value={attempt.resultNote}
                    onChange={e => updateAttemptResult(attempt.id, attempt.result, e.target.value)}
                    placeholder="ఫలిత గమనిక..."
                    className="flex-1 min-w-32 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                  />
                </div>
                {/* Section scores mini */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {attempt.sections.map(s => {
                    const sc2 = getSectionScore(s);
                    return (
                      <span key={s.id} className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                        {s.emoji} {sc2.pct}%
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {data.attempts.length > 0 && (
            <button
              onClick={() => {
                if (confirm('చరిత్ర అన్నీ delete చేయాలా?'))
                  setData(prev => ({ ...prev, attempts: [] }));
              }}
              className="w-full text-xs text-red-500/60 hover:text-red-400 py-2 flex items-center justify-center gap-1">
              <Trash2 className="w-3 h-3" />అన్ని చరిత్ర delete (జాగ్రత్తగా!)
            </button>
          )}
        </div>
      )}

      {/* ═══ STATS TAB ═══ */}
      {tab === 'stats' && (
        <div className="space-y-4">
          {/* Per-section scores */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4"/>Category-wise స్కోర్లు</h3>
            <div className="space-y-2">
              {data.sections.map(s => {
                const sc = getSectionScore(s);
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="w-5 text-center">{s.emoji}</span>
                    <p className={`text-xs w-48 truncate ${sectionTitleColor(s.color)}`}>{s.title.split(',')[0].substring(0, 30)}</p>
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${sc.pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-300 w-16 text-right font-bold">{sc.total}/{sc.max}</span>
                    <span className={`text-xs font-black w-12 text-right ${sc.pct >= 70 ? 'text-emerald-400' : sc.pct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{sc.pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* History stats */}
          {data.attempts.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4"/>చరిత్ర గణాంకాలు</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'మొత్తం Attempts', val: data.attempts.length, col: 'text-white' },
                  { label: '🏆 Hits', val: data.attempts.filter(a => a.result === 'hit').length, col: 'text-yellow-400' },
                  { label: '🎯 Near Hits', val: data.attempts.filter(a => a.result === 'near').length, col: 'text-blue-400' },
                  { label: '❌ Misses', val: data.attempts.filter(a => a.result === 'miss').length, col: 'text-red-400' },
                  { label: 'సగటు స్కోర్', val: Math.round(data.attempts.reduce((a, b) => a + Math.round((b.totalScore / b.maxScore) * 100), 0) / data.attempts.length) + '%', col: 'text-purple-400' },
                  { label: 'అత్యధిక స్కోర్', val: Math.max(...data.attempts.map(a => Math.round((a.totalScore / a.maxScore) * 100))) + '%', col: 'text-emerald-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-slate-800/60 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 mb-1">{s.label}</p>
                    <p className={`text-xl font-black ${s.col}`}>{s.val}</p>
                  </div>
                ))}
              </div>
              {/* Score timeline */}
              <div className="mt-4">
                <p className="text-xs text-slate-400 mb-2">స్కోర్ Trend:</p>
                <div className="flex items-end gap-1 h-16">
                  {data.attempts.slice(0, 20).reverse().map(a => {
                    const h = Math.round((a.totalScore / a.maxScore) * 100);
                    return (
                      <div key={a.id} title={`${a.date}: ${h}%`} className="flex-1 flex flex-col justify-end">
                        <div className={`rounded-t ${a.result === 'hit' ? 'bg-yellow-500' : a.result === 'near' ? 'bg-blue-500' : a.result === 'miss' ? 'bg-red-500' : 'bg-purple-500'}`}
                          style={{ height: `${h}%` }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                  <span>పాత →</span><span>← కొత్త</span>
                </div>
              </div>
            </div>
          )}

          {/* Score distribution */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-amber-400 mb-3">స్కోర్ పంపిణి (Score Distribution)</h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(s => {
                const cnt = data.sections.flatMap(sec => sec.items).filter(it => it.score === s).length;
                const total2 = data.sections.flatMap(sec => sec.items).length;
                return (
                  <div key={s} className={`rounded-xl p-3 text-center border ${SCORE_COLORS[s].replace('bg-', 'border-').replace('/60', '/30')} ${SCORE_COLORS[s]}`}>
                    <p className="text-lg font-black">{cnt}</p>
                    <p className="text-[9px]">Score {s}</p>
                    <p className="text-[9px] opacity-70">{total2 > 0 ? Math.round((cnt / total2) * 100) : 0}%</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              స్కోర్ చేయనివి: {data.sections.flatMap(s => s.items).filter(it => it.score === 0).length} items
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
        <p className="text-[10px] text-slate-400 font-bold mb-2">📖 స్కోర్ అర్థం:</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map(s => (
            <span key={s} className={`px-2 py-1 rounded-lg text-[9px] font-bold ${SCORE_COLORS[s]}`}>
              {s} = {SCORE_LABELS_FULL[s]}
            </span>
          ))}
          <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-slate-800 text-slate-500">0 = స్కోర్ చేయలేదు</span>
        </div>
        <p className="text-[9px] text-slate-600 mt-1">⚠️ అన్ని data auto-save అవుతుంది — పాత data delete అవదు. "New Attempt" click చేసినప్పుడు పాత version history లో save అవుతుంది.</p>
      </div>
    </div>
  );
}
