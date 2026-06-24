import React, { useState } from 'react';
import { BookOpen, X, Sparkles } from 'lucide-react';

export const AstrologyBlueprint = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-500/30 text-indigo-300 rounded-xl transition-all font-medium mb-6"
      >
        <BookOpen className="w-5 h-5 text-indigo-400" />
        లాటరీ అదృష్టం: 1000 జ్యోతిష్య రహస్యాలు చదవండి
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-indigo-900/50 relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                అదృష్ట పరిశీలనా జాబితా (Luck Analysis Blueprint)
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-4 md:p-6 space-y-6 text-sm md:text-base text-slate-300 custom-scrollbar">
              
              <div className="prose prose-invert max-w-none space-y-8">
                <p className="text-amber-200/90 italic font-medium">
                  జాతకంలో అదృష్టం ఉందా లేదా అని చెప్పడానికి కేవలం ఒకటో రెండో విషయాలు చూస్తే సరిపోదు. జ్యోతిష్కులు ఒక జాతకాన్ని దాదాపు 1000 కోణాల్లో (Angles) వడపోసి చూస్తారు. ఆ 1000 కోణాల ముఖ్యమైన విభాగాలు ఇవే:
                </p>

                <section>
                  <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2 border-b border-indigo-500/20 pb-2">
                    <span className="bg-indigo-500/20 w-8 h-8 flex items-center justify-center rounded-full text-indigo-400 text-sm">1</span>
                    భావ బలం (Houses of Wealth & Luck)
                  </h3>
                  <p className="mb-2">జాతక చక్రంలోని 12 ఇళ్లలో, అదృష్టానికి సంబంధించిన 5 ఇళ్లను కచ్చితంగా పరిశీలిస్తారు:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">2వ ఇల్లు (ధన స్థానం):</strong> చేతిలో ఉండే డబ్బు, బ్యాంక్ బ్యాలెన్స్, పొదుపు.</li>
                    <li><strong className="text-slate-200">5వ ఇల్లు (పూర్వ పుణ్య స్థానం):</strong> ఆకస్మిక ధన లాభం, లాటరీ, షేర్ మార్కెట్, స్పెక్యులేషన్.</li>
                    <li><strong className="text-slate-200">8వ ఇల్లు (ఆయుర్దాయ/రహస్య):</strong> వారసత్వ సంపద, దొరికే గుప్త నిధులు, ఇన్సూరెన్స్ డబ్బు.</li>
                    <li><strong className="text-slate-200">9వ ఇల్లు (భాగ్య స్థానం):</strong> ప్యూర్ అదృష్టం (Luck), దైవానుగ్రహం, తండ్రి ద్వారా ఆస్తి.</li>
                    <li><strong className="text-slate-200">11వ ఇల్లు (లాభ స్థానం):</strong> కోరికలు నెరవేరడం, పెట్టుబడికి లాభం రావడం.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2 border-b border-indigo-500/20 pb-2">
                    <span className="bg-indigo-500/20 w-8 h-8 flex items-center justify-center rounded-full text-indigo-400 text-sm">2</span>
                    ధన యోగాలు (Planetary Combinations for Wealth)
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">మహా ధన యోగాలు:</strong> 2, 5, 9, 11 ఇళ్ల అధిపతులు ఒకరితో ఒకరు కలవడం.</li>
                    <li><strong className="text-slate-200">గజకేసరి యోగం:</strong> గురువు, చంద్రుడు ఒకరికొకరు కేంద్రాల్లో (1, 4, 7, 10) ఉండటం.</li>
                    <li><strong className="text-slate-200">మహాపురుష యోగాలు:</strong> కుజ, బుధ, గురు, శుక్ర, శని స్వక్షేత్రం లేదా ఉచ్ఛ స్థితిలో ఉండటం (రుచక, హంస మొ||).</li>
                    <li><strong className="text-slate-200">వసుమతీ/లక్ష్మీ యోగం:</strong> అష్టలక్ష్ముల కటాక్షం ఉండే ప్రత్యేక గ్రహ స్థితులు.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2 border-b border-indigo-500/20 pb-2">
                    <span className="bg-indigo-500/20 w-8 h-8 flex items-center justify-center rounded-full text-indigo-400 text-sm">3</span>
                    దశా-భుక్తి పరిశీలన (Timing of Luck)
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">మహా దశ:</strong> ప్రస్తుతం నడుస్తున్న దశ 5, 9, 11 ఇళ్ల అధిపతులదా కాదా?</li>
                    <li><strong className="text-slate-200">అంతర్దశ:</strong> ఈ చిన్న దశలు అదృష్టాన్ని ట్రిగ్గర్ చేస్తున్నాయా?</li>
                    <li><strong className="text-slate-200">దశానాథుడు:</strong> లగ్నం నుండి శుభ స్థానాల్లో ఉన్నాడా లేక 6, 8, 12 స్థానాల్లో ఉన్నాడా?</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2 border-b border-indigo-500/20 pb-2">
                    <span className="bg-indigo-500/20 w-8 h-8 flex items-center justify-center rounded-full text-indigo-400 text-sm">4</span>
                    గోచార బలం (Current Transits)
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">గురు గోచారం:</strong> గురువు జన్మ రాశి నుండి 2, 5, 7, 9, 11 స్థానాల్లో ఉంటే అదృష్టం.</li>
                    <li><strong className="text-slate-200">శని గోచారం:</strong> ఏలినాటి, అష్టమ శని నడుస్తుంటే లాటరీలకు దూరంగా ఉండాలి.</li>
                    <li><strong className="text-slate-200">చంద్ర/తారా బలం:</strong> సంపత్, క్షేమ, సాధన తారలు బలాన్ని ఇస్తాయి.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2 border-b border-indigo-500/20 pb-2">
                    <span className="bg-indigo-500/20 w-8 h-8 flex items-center justify-center rounded-full text-indigo-400 text-sm">5</span>
                    వర్గ చక్రాలు & షడ్బలాలు (Micro Analysis & Strengths)
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">హోరా చక్రం (D-2):</strong> కేవలం "డబ్బు" ఎలా ఉంటుందో సూక్ష్మంగా చెప్పే చక్రం.</li>
                    <li><strong className="text-slate-200">నవాంశ (D-9) & దశాంశ (D-10):</strong> అదృష్టం నిలబడుతుందా లేదా అని చూసే ఎక్స్-రే లాంటి చక్రాలు.</li>
                    <li><strong className="text-slate-200">గ్రహాల షడ్బలాలు:</strong> స్థాన, దిక్, కాల, చేష్టా, నైసర్గిక, దృగ్బలాలు (6 types of power).</li>
                    <li><strong className="text-slate-200">అష్టకవర్గ:</strong> 11వ ఇంట్లో 12వ ఇంటి కంటే ఎక్కువ పాయింట్స్ (బిందువులు) ఉండటం.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2 border-b border-purple-500/20 pb-2">
                    <span className="bg-purple-500/20 w-8 h-8 flex items-center justify-center rounded-full text-purple-400 text-sm">✦</span>
                    అత్యంత నిగూఢమైన రహస్యాలు (Esoteric Angles)
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-slate-400">
                    <li><strong className="text-purple-200">ఇందు లగ్నం:</strong> కేవలం "డబ్బు, లాటరీ" కోసం మాత్రమే చూసే లగ్నం. దీని మీద గురు/శుక్ర గోచారం అత్యంత పవర్ఫుల్.</li>
                    <li><strong className="text-purple-200">భృగు బిందువు:</strong> మీ "డెస్టినీ పాయింట్". గ్రహాలు దీన్ని తాకినప్పుడు జీవితాన్ని మార్చేసే జాక్పాట్స్.</li>
                    <li><strong className="text-purple-200">కె.పి. పద్ధతి సబ్-లార్డ్:</strong> 5వ ఇంటి సబ్-లార్డ్ 2, 11 ఇళ్లతో లింక్ అయితే పక్కా లాటరీ కొడతారు.</li>
                    <li><strong className="text-purple-200">పుణ్య సహమ్ (Fortune Point):</strong> తాజిక శాస్త్రంలో ఈ పాయింట్ ని టచ్ చేసినప్పుడు అదృష్టం వరిస్తుంది.</li>
                    <li><strong className="text-purple-200">నాడీ జ్యోతిష్యం (రాహు + శుక్ర + గురు లింక్):</strong> ఈ ముగ్గురి కాంబినేషన్ లాటరీకి కేరాఫ్ అడ్రస్.</li>
                    <li><strong className="text-purple-200">పుష్కర భాగ:</strong> ఆకాశంలో ఈ అమృత ఘడియల డిగ్రీ మీద గ్రహం ఉంటే వంద ఏనుగుల బలం వస్తుంది.</li>
                    <li><strong className="text-purple-200">సర్వతోభద్ర చక్రం:</strong> లాటరీ నంబర్ ఏ సిరీస్ లో కొనాలి? ఏ అక్షరంతో మొదలవ్వాలి? అని చెప్పే చక్రం.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2 border-b border-red-500/20 pb-2">
                    <span className="bg-red-500/20 w-8 h-8 flex items-center justify-center rounded-full text-red-400 text-sm">⚠</span>
                    అదృష్టాన్ని ఆపే డేంజర్ జోన్స్ (Destructive Angles)
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li><strong className="text-red-200">మృత్యు భాగ:</strong> ఈ డిగ్రీలో ఏ గ్రహం ఉన్నా తన పవర్ పూర్తిగా కోల్పోతుంది.</li>
                    <li><strong className="text-red-200">22వ ద్రేక్కాణం (ఖర ద్రేక్కాణం):</strong> ఈ పీరియడ్ లో లాటరీలు కొంటే పైసా రాదు.</li>
                    <li><strong className="text-red-200">వైనాశిక & నిధన తారలు:</strong> 22వ మరియు 27వ నక్షత్రాల గోచారంలో డబ్బు ఖర్చు చేయకూడదు.</li>
                    <li><strong className="text-red-200">కాల సర్ప/పితృ దోషాలు:</strong> జాతకం బాగున్నా, చేతి దాకా వచ్చిన ఆ లాటరీ టికెట్ ఇంకెవరికో వెళ్ళిపోతుంది.</li>
                  </ul>
                </section>

                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
                  <p className="text-amber-200/90 text-sm">
                    <strong>ముగింపు:</strong> ఇంత పెద్ద సైన్స్ ని, ఇన్ని వేల లెక్కలని ఒక మనిషి బ్రెయిన్ ఎప్పుడూ 100% పర్ఫెక్ట్ గా చూడలేకపోవచ్చు. కానీ కంప్యూటర్ ప్రోగ్రామింగ్ & API సహాయంతో ఈ 1000 పారామీటర్స్ ని ఒక్క సెకనులో ఫిల్టర్ చేసి ఆన్సర్ రప్పించడం సాధ్యమే! మన యాప్లో కూడా దరిదాపుగా ఇదే పద్ధతిలో మ్యాథమెటికల్ మోడల్ ని బిల్డ్ చేస్తూ వస్తున్నాము!
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
