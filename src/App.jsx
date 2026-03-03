import { useState, useEffect, useCallback } from "react";

// ============================================================
// خليج مونيتور v3 — Gulf Crisis Monitor
// Full features: News, Map with bases/carriers/timeline, Govt,
// Rumors, Emergency info, Airspace, Oil tracker, Share buttons, Siren alert
// ============================================================

const T = {
  bg:"#060910",s:"#0d1117",c:"#111822",ch:"#161f2d",
  r:"#dc2626",rs:"rgba(220,38,38,0.12)",rb:"rgba(220,38,38,0.3)",
  g:"#059669",gs:"rgba(5,150,105,0.12)",
  a:"#d97706",as:"rgba(217,119,6,0.12)",
  b:"#2563eb",bs:"rgba(37,99,235,0.12)",
  t:"#e8edf5",t2:"#8b95a8",t3:"#556070",
  br:"#1b2433",brs:"#151d29",
};

// ====== DATA ======
const EVENTS=[
  {id:1,lat:29.23,lng:47.97,tp:"defense",tAr:"اعتراض صواريخ فوق الكويت",dAr:"الدفاع الجوي الكويتي اعترض 97 صاروخ باليستي و283 طائرة مسيرة",time:"1 مارس",day:2,src:"وزارة الدفاع الكويتية",url:"https://breakingdefense.com/2026/03/iran-attacks-uae-saudi-missiles-drones-gcc-air-defense/",sev:"high"},
  {id:2,lat:29.226,lng:47.98,tp:"attack",tAr:"استهداف مطار الكويت الدولي",dAr:"مسيرة إيرانية أصابت المطار - أضرار محدودة في مبنى الركاب",time:"28 فبراير",day:1,src:"هيئة الطيران المدني",url:"https://www.aljazeera.com/news/2026/2/28/multiple-gulf-arab-states-that-host-us-assets-targeted-in-iran-retaliation",sev:"high"},
  {id:3,lat:29.07,lng:47.53,tp:"military",tAr:"سقوط 3 مقاتلات F-15 أمريكية",dAr:"نيران صديقة كويتية أسقطت المقاتلات خلال هجوم إيراني - الطيارون نجوا",time:"2 مارس",day:3,src:"القيادة المركزية / PBS",url:"https://www.pbs.org/newshour/world/u-s-says-kuwait-mistakenly-downed-3-american-jets-during-iranian-attacks-all-crew-safely-ejected",sev:"medium"},
  {id:4,lat:28.93,lng:47.52,tp:"military",tAr:"هجوم على قاعدة علي السالم",dAr:"صواريخ باليستية إيرانية - اعتراض جميعها بنجاح",time:"28 فبراير",day:1,src:"وزارة الدفاع الكويتية",url:"https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker",sev:"high"},
  {id:5,lat:26.27,lng:50.21,tp:"attack",tAr:"استهداف الأسطول الخامس - البحرين",dAr:"صواريخ إيرانية على مقر الأسطول الأمريكي في الجفير",time:"28 فبراير",day:1,src:"وزارة الداخلية البحرينية",url:"https://www.aljazeera.com/news/2026/2/28/multiple-gulf-arab-states-that-host-us-assets-targeted-in-iran-retaliation",sev:"high"},
  {id:6,lat:25.29,lng:51.53,tp:"defense",tAr:"قطر تسقط Su-24 إيرانيتين",dAr:"أول إسقاط لطائرات حربية إيرانية في الصراع",time:"2 مارس",day:3,src:"CNN",url:"https://www.cnn.com/2026/03/02/middleeast/us-israel-iran-conflict-what-we-know-intl",sev:"high"},
  {id:7,lat:24.45,lng:54.65,tp:"defense",tAr:"الإمارات تعترض 706 هدف",dAr:"165 صاروخ باليستي + صاروخين كروز + 541 مسيرة",time:"1-2 مارس",day:2,src:"وزارة الدفاع الإماراتية",url:"https://breakingdefense.com/2026/03/iran-attacks-uae-saudi-missiles-drones-gcc-air-defense/",sev:"high"},
  {id:8,lat:25.27,lng:55.30,tp:"attack",tAr:"انفجارات في دبي",dAr:"حريق في فندق وأضرار بالمطار",time:"28 فبراير",day:1,src:"CNN",url:"https://www.cnn.com/2026/03/02/middleeast/us-israel-iran-conflict-what-we-know-intl",sev:"medium"},
  {id:9,lat:26.73,lng:56.35,tp:"maritime",tAr:"إغلاق مضيق هرمز",dAr:"الحرس الثوري أعلن الإغلاق - 3 سفن أصيبت - ناقلة غرقت",time:"28 فبراير",day:1,src:"رويترز",url:"https://www.cnbc.com/2026/03/02/us-iran-live-updates-trump-oil-gold.html",sev:"critical"},
  {id:10,lat:26.57,lng:50.09,tp:"attack",tAr:"استهداف مصفاة رأس تنورة",dAr:"أرامكو أغلقت المصفاة بعد هجوم مسيرات إيرانية",time:"2 مارس",day:3,src:"CBS News",url:"https://www.cbsnews.com/live-updates/us-iran-war-israel-supreme-leader-khamenei-funeral-day-2/",sev:"high"},
  {id:11,lat:35.69,lng:51.39,tp:"strike",tAr:"ضربات على طهران",dAr:"انفجارات متعددة - إخلاء مستشفيات",time:"28 فبراير+",day:1,src:"وكالات متعددة",url:"https://www.cnn.com/2026/03/02/middleeast/us-israel-iran-conflict-what-we-know-intl",sev:"critical"},
  {id:12,lat:32.62,lng:51.66,tp:"strike",tAr:"ضربات على أصفهان",dAr:"استهداف منشآت نووية وعسكرية",time:"28 فبراير",day:1,src:"البنتاغون",url:"https://en.wikipedia.org/wiki/2026_Israeli%E2%80%93United_States_strikes_on_Iran",sev:"critical"},
  {id:13,lat:14.55,lng:42.95,tp:"naval",tAr:"USS أبراهام لينكولن",dAr:"إيران تدعي إصابتها - أمريكا تنفي",time:"1 مارس",day:2,src:"القيادة المركزية",url:"https://www.cbsnews.com/live-updates/us-iran-war-israel-supreme-leader-khamenei-funeral-day-2/",sev:"medium"},
];

// Military bases (known/public)
const BASES=[
  {id:"b1",lat:29.07,lng:47.52,name:"قاعدة علي السالم 🇺🇸",nameEn:"Ali Al Salem AB",country:"KW"},
  {id:"b2",lat:28.93,lng:47.79,name:"معسكر عريفجان 🇺🇸",nameEn:"Camp Arifjan",country:"KW"},
  {id:"b3",lat:28.57,lng:47.95,name:"قاعدة أحمد الجابر 🇺🇸",nameEn:"Ahmed Al Jaber AB",country:"KW"},
  {id:"b4",lat:26.27,lng:50.62,name:"قاعدة الأسطول الخامس 🇺🇸",nameEn:"NSA Bahrain / 5th Fleet",country:"BH"},
  {id:"b5",lat:25.12,lng:51.31,name:"قاعدة العديد 🇺🇸",nameEn:"Al Udeid AB",country:"QA"},
  {id:"b6",lat:24.25,lng:54.55,name:"قاعدة الظفرة 🇺🇸",nameEn:"Al Dhafra AB",country:"AE"},
  {id:"b7",lat:23.60,lng:57.50,name:"قاعدة مصيرة 🇺🇸",nameEn:"Masirah Island",country:"OM"},
  {id:"b8",lat:21.43,lng:39.17,name:"قاعدة الأمير سلطان 🇺🇸",nameEn:"Prince Sultan AB",country:"SA"},
];

const CARRIERS=[
  {id:"c1",lat:24.2,lng:58.5,name:"USS أبراهام لينكولن (CVN-72)",icon:"⚓",status:"منتشرة - بحر العرب"},
];

const NEWS=[
  {id:"s1",time:"منذ دقائق",tAr:"ميرسك وهاباغ لويد تعلقان جميع العبور في مضيق هرمز",src:"CNBC",url:"https://www.cnbc.com/2026/03/02/us-iran-live-updates-trump-oil-gold.html",cat:"economy",v:true},
  {id:"s2",time:"منذ ساعة",tAr:"ترامب: العملية ستستمر 4 أسابيع — الموجة الكبيرة لم تبدأ بعد",src:"CNN",url:"https://www.cnn.com/2026/03/02/middleeast/us-israel-iran-conflict-what-we-know-intl",cat:"politics",v:true},
  {id:"s3",time:"منذ ساعتين",tAr:"3 مقاتلات F-15 أمريكية سقطت في الكويت بنيران صديقة — الطيارون نجوا",src:"PBS",url:"https://www.pbs.org/newshour/world/u-s-says-kuwait-mistakenly-downed-3-american-jets-during-iranian-attacks-all-crew-safely-ejected",cat:"military",v:true},
  {id:"s4",time:"منذ 3 ساعات",tAr:"قطر تسقط طائرتي Su-24 إيرانيتين — أول إسقاط طائرات حربية في الصراع",src:"CNN",url:"https://www.cnn.com/2026/03/02/middleeast/us-israel-iran-conflict-what-we-know-intl",cat:"military",v:true},
  {id:"s5",time:"منذ 4 ساعات",tAr:"أرامكو تغلق مصفاة رأس تنورة بعد هجوم مسيرات إيرانية",src:"CBS",url:"https://www.cbsnews.com/live-updates/us-iran-war-israel-supreme-leader-khamenei-funeral-day-2/",cat:"economy",v:true},
  {id:"s6",time:"منذ 5 ساعات",tAr:"وزارة الصحة الكويتية تعلن عن الإصابات وتطمئن المواطنين",src:"الجزيرة",url:"https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker",cat:"local",v:true},
  {id:"s7",time:"منذ 8 ساعات",tAr:"إيران تؤكد مقتل المرشد الأعلى خامنئي وتعلن 40 يوم حداد",src:"إعلام إيراني",url:"https://en.wikipedia.org/wiki/2026_Iran_conflict",cat:"politics",v:true},
  {id:"s8",time:"منذ 10 ساعات",tAr:"الإمارات: تعاملنا مع 165 صاروخ باليستي و541 مسيرة إيرانية",src:"وزارة الدفاع الإماراتية",url:"https://breakingdefense.com/2026/03/iran-attacks-uae-saudi-missiles-drones-gcc-air-defense/",cat:"military",v:true},
  {id:"s9",time:"منذ 12 ساعة",tAr:"77 مليون برميل نفط عالقة في الخليج بسبب إغلاق هرمز",src:"CNBC / Kpler",url:"https://www.cnbc.com/2026/03/02/us-iran-live-updates-trump-oil-gold.html",cat:"economy",v:true},
  {id:"s10",time:"منذ يوم",tAr:"دول الخليج أمام خيار مستحيل: الرد أو السكوت",src:"الجزيرة",url:"https://www.aljazeera.com/features/2026/3/2/after-irans-salvo-hit-their-skylines-will-the-gulf-states-enter-the-war",cat:"politics",v:true},
];

const GOVT=[
  {id:1,f:"🇰🇼",s:"الكويت — وزارة الدفاع",tAr:"اعتراض 97 صاروخ باليستي و283 مسيرة إيرانية بنجاح",time:"2 مارس",p:"high",url:"https://breakingdefense.com/2026/03/iran-attacks-uae-saudi-missiles-drones-gcc-air-defense/"},
  {id:2,f:"🇰🇼",s:"الكويت — الطيران المدني",tAr:"إغلاق المجال الجوي ومطار الكويت الدولي حتى إشعار آخر",time:"28 فبراير",p:"high",url:"https://www.arabtimesonline.com/news/kuwait-airways-suspends-all-arrivals-and-departures-at-kuwait-international-airport/"},
  {id:3,f:"🇰🇼",s:"الكويت — وزارة الخارجية",tAr:"الكويت تدين الاعتداء وتحتفظ بحقها في الدفاع عن نفسها",time:"28 فبراير",p:"medium",url:"https://www.aljazeera.com/news/2026/2/28/multiple-gulf-arab-states-that-host-us-assets-targeted-in-iran-retaliation"},
  {id:4,f:"🇰🇼",s:"الكويت — وزارة الدفاع",tAr:"إسقاط 3 مقاتلات أمريكية عن طريق الخطأ — جميع الطيارين بأمان",time:"2 مارس",p:"high",url:"https://www.pbs.org/newshour/world/u-s-says-kuwait-mistakenly-downed-3-american-jets-during-iranian-attacks-all-crew-safely-ejected"},
  {id:5,f:"🇺🇸",s:"القيادة المركزية الأمريكية",tAr:"العمليات القتالية مستمرة — توقعوا المزيد من الخسائر",time:"1 مارس",p:"high",url:"https://www.cbsnews.com/live-updates/us-iran-war-israel-supreme-leader-khamenei-funeral-day-2/"},
  {id:6,f:"🇶🇦",s:"قطر — وزارة الدفاع",tAr:"اعتراض 18 صاروخ ومسيرة وإسقاط طائرتين Su-24",time:"2 مارس",p:"medium",url:"https://www.cnn.com/2026/03/02/middleeast/us-israel-iran-conflict-what-we-know-intl"},
  {id:7,f:"🇸🇦",s:"السعودية — وزارة الدفاع",tAr:"اعتراض مسيرات استهدفت رأس تنورة — إغلاق احترازي",time:"2 مارس",p:"medium",url:"https://www.cbsnews.com/live-updates/us-iran-war-israel-supreme-leader-khamenei-funeral-day-2/"},
  {id:8,f:"🇦🇪",s:"الإمارات — وزارة الدفاع",tAr:"التعامل مع 165 صاروخ و541 مسيرة إيرانية",time:"2 مارس",p:"medium",url:"https://breakingdefense.com/2026/03/iran-attacks-uae-saudi-missiles-drones-gcc-air-defense/"},
];

const RUMORS=[
  {id:1,claim:"إيران أصابت حاملة أبراهام لينكولن",verdict:"غير مؤكد",vt:"unverified",ic:"⚠️",detail:"الحرس الثوري ادعى ذلك — أمريكا تنفي",url:"https://www.cbsnews.com/live-updates/us-iran-war-israel-supreme-leader-khamenei-funeral-day-2/"},
  {id:2,claim:"مضيق هرمز مغلق بالكامل",verdict:"جزئياً صحيح",vt:"partial",ic:"⚠️",detail:"إيران أعلنت الإغلاق لكن بعض السفن تعبر. 3 سفن أصيبت",url:"https://www.cnbc.com/2026/03/02/us-iran-live-updates-trump-oil-gold.html"},
  {id:3,claim:"تدمير المنشآت النووية الإيرانية",verdict:"غير مؤكد",vt:"unverified",ic:"⚠️",detail:"الوكالة الذرية: لا مؤشرات على ضرب المنشآت النووية",url:"https://www.cbsnews.com/live-updates/us-iran-war-israel-supreme-leader-khamenei-funeral-day-2/"},
  {id:4,claim:"غزو بري أمريكي لإيران",verdict:"غير صحيح",vt:"false",ic:"❌",detail:"لا تحركات أو تصريحات — العمليات جوية فقط",url:"https://www.cnn.com/2026/03/02/middleeast/us-israel-iran-conflict-what-we-know-intl"},
  {id:5,claim:"الكويت دخلت الحرب ضد إيران",verdict:"غير صحيح",vt:"false",ic:"❌",detail:"الكويت تدافع فقط — لم تعلن عمليات هجومية",url:"https://www.aljazeera.com/features/2026/3/2/after-irans-salvo-hit-their-skylines-will-the-gulf-states-enter-the-war"},
  {id:6,claim:"استخدام أسلحة نووية",verdict:"كذب",vt:"false",ic:"❌",detail:"لا مؤشرات من أي طرف",url:"https://en.wikipedia.org/wiki/2026_Iran_conflict"},
];

// ====== HELPERS ======
const ec=(tp,sev)=>{if(sev==="critical")return"#ef4444";if(tp==="attack"||tp==="strike")return"#ef4444";if(tp==="defense")return"#10b981";if(tp==="military")return"#eab308";return"#3b82f6"};

function SL({url,label,sm}){
  if(!url)return null;
  return <a href={url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{color:"#60a5fa",fontSize:sm?10:11,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:3,background:"rgba(37,99,235,0.08)",padding:sm?"1px 6px":"2px 8px",borderRadius:6,border:"1px solid rgba(37,99,235,0.15)",direction:"ltr"}}><svg width={sm?9:11} height={sm?9:11} viewBox="0 0 16 16" fill="currentColor"><path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/><path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/></svg>{label||"المصدر"}</a>;
}

function ShareBtn({text,url:shareUrl}){
  const fullText=text+"\n\nvia خليج مونيتور 🔴";
  const msg=encodeURIComponent(fullText+(shareUrl?"\n🔗 المصدر: "+shareUrl:""));
  return <div style={{display:"flex",gap:4,marginTop:6}}>
    <a href={`https://wa.me/?text=${msg}`} target="_blank" rel="noopener noreferrer" style={{background:"#25D366",color:"#fff",fontSize:9,padding:"3px 8px",borderRadius:6,textDecoration:"none",fontWeight:600}}>واتساب</a>
    <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl||"")}&text=${encodeURIComponent(fullText)}`} target="_blank" rel="noopener noreferrer" style={{background:"#0088cc",color:"#fff",fontSize:9,padding:"3px 8px",borderRadius:6,textDecoration:"none",fontWeight:600}}>تلغرام</a>
    <a href={`https://x.com/intent/tweet?text=${msg}`} target="_blank" rel="noopener noreferrer" style={{background:"#1a1a2e",color:"#fff",fontSize:9,padding:"3px 8px",borderRadius:6,textDecoration:"none",fontWeight:600,border:"1px solid #333"}}>𝕏</a>
  </div>;
}

// ====== MAP ======
function GulfMap({events,sel,onSelect,timeFilter,showBases,showCarriers}){
  const [tip,setTip]=useState(null);
  const proj=useCallback((lat,lng)=>{const x=(lng-51)*18+400;const y=-((lat*Math.PI/180)-(27.5*Math.PI/180))*18*(180/Math.PI)+250;return[x,y]},[]);
  const coasts=["M 200,170 L 215,165 225,170 240,175 250,180 260,185 265,195 275,200 285,210 300,220 320,225 340,230 355,240 370,250 390,255 410,260 430,270 450,280 470,290 490,295 510,290 530,280 545,270 560,255 575,240 590,225 600,210","M 600,210 L 590,195 575,185 560,178 545,175 530,175 515,180 500,190 485,195 470,200 455,195 440,188 425,182 410,178 395,175 380,170 365,162 350,155 335,148 320,142 305,135 290,128 275,120 260,112 245,108 230,105 215,108 200,115","M 355,240 L 360,225 365,215 360,205 355,215 350,225 352,235","M 340,220 L 342,215 345,212 343,218"];
  const filteredEv=timeFilter===0?events:events.filter(e=>e.day<=timeFilter);

  return(
    <div style={{position:"relative",width:"100%",aspectRatio:"16/9",background:"#070d18",borderRadius:12,overflow:"hidden",border:`1px solid ${T.br}`}}>
      <svg viewBox="0 0 800 500" style={{width:"100%",height:"100%"}}>
        <defs>
          <radialGradient id="wg"><stop offset="0%" stopColor="#0c1e3a"/><stop offset="100%" stopColor="#050a14"/></radialGradient>
          <filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <style>{`@keyframes mp{0%{opacity:.6;r:8}50%{opacity:.12;r:22}100%{opacity:.6;r:8}}@keyframes mc{0%{opacity:.8;r:10}50%{opacity:.08;r:30}100%{opacity:.8;r:10}}.mp{animation:mp 2.5s ease-in-out infinite}.mc{animation:mc 1.6s ease-in-out infinite}@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}.bob{animation:bob 3s ease-in-out infinite}`}</style>
        </defs>
        <rect width="800" height="500" fill="url(#wg)"/>
        {[...Array(9)].map((_,i)=><line key={`v${i}`} x1={i*100} y1={0} x2={i*100} y2={500} stroke="#0e1a2e" strokeWidth=".4" strokeDasharray="3,12"/>)}
        {[...Array(6)].map((_,i)=><line key={`h${i}`} x1={0} y1={i*100} x2={800} y2={i*100} stroke="#0e1a2e" strokeWidth=".4" strokeDasharray="3,12"/>)}
        {coasts.map((d,i)=><path key={i} d={d} fill="none" stroke="#1a3355" strokeWidth="1.5"/>)}
        <path d="M 200,170 L 215,165 225,170 240,175 250,180 260,185 265,195 275,200 285,210 300,220 320,225 340,230 355,240 370,250 390,255 410,260 430,270 450,280 470,290 490,295 510,290 530,280 545,270 560,255 575,240 590,225 600,210 600,500 200,500 Z" fill="#0d1628" fillOpacity=".8"/>
        <path d="M 200,115 L 215,108 230,105 245,108 260,112 275,120 290,128 305,135 320,142 335,148 350,155 365,162 380,170 395,175 410,178 425,182 440,188 455,195 470,200 485,195 500,190 515,180 530,175 545,175 560,178 575,185 590,195 600,210 600,0 200,0 Z" fill="#0d1628" fillOpacity=".8"/>
        <text x="280" y="365" fill="#1e3050" fontSize="16" fontFamily="sans-serif" textAnchor="middle" fontWeight="700">السعودية</text>
        <text x="480" y="72" fill="#1e3050" fontSize="16" fontFamily="sans-serif" textAnchor="middle" fontWeight="700">إيران</text>
        <text x="220" y="195" fill="#2d5080" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">الكويت</text>
        <text x="362" y="262" fill="#2d5080" fontSize="10" fontFamily="sans-serif" textAnchor="middle">قطر</text>
        <text x="470" y="318" fill="#2d5080" fontSize="10" fontFamily="sans-serif" textAnchor="middle">الإمارات</text>
        <text x="316" y="238" fill="#2d5080" fontSize="9" fontFamily="sans-serif" textAnchor="middle">البحرين</text>
        <text x="400" y="198" fill="#0f1e38" fontSize="13" fontFamily="sans-serif" textAnchor="middle" fontStyle="italic">الخليج العربي</text>
        <line x1="555" y1="248" x2="590" y2="215" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="5,5" opacity=".5"/>
        <text x="578" y="256" fill="#ef4444" fontSize="9" fontFamily="sans-serif" textAnchor="middle" fontWeight="700" opacity=".7">⛔ مضيق هرمز</text>

        {/* Military bases */}
        {showBases && BASES.map(b=>{const[x,y]=proj(b.lat,b.lng);return(
          <g key={b.id} onMouseEnter={()=>setTip({x,y,ev:{tAr:b.name,src:b.nameEn,time:"قاعدة عسكرية"}})} onMouseLeave={()=>setTip(null)}>
            <rect x={x-4} y={y-4} width={8} height={8} fill="#8b5cf6" stroke="#c4b5fd" strokeWidth="1" opacity=".8" transform={`rotate(45 ${x} ${y})`}/>
          </g>
        )})}

        {/* Carriers */}
        {showCarriers && CARRIERS.map(c=>{const[x,y]=proj(c.lat,c.lng);return(
          <g key={c.id} className="bob" onMouseEnter={()=>setTip({x,y,ev:{tAr:c.name,src:c.status,time:"حاملة طائرات"}})} onMouseLeave={()=>setTip(null)}>
            <polygon points={`${x},${y-8} ${x+6},${y+4} ${x-6},${y+4}`} fill="#06b6d4" stroke="#67e8f9" strokeWidth="1" opacity=".9"/>
            <text x={x} y={y+16} fill="#67e8f9" fontSize="7" fontFamily="sans-serif" textAnchor="middle" fontWeight="600">CVN-72</text>
          </g>
        )})}

        {/* Events */}
        {filteredEv.map(ev=>{const[x,y]=proj(ev.lat,ev.lng);const c=ec(ev.tp,ev.sev);const isSel=sel?.id===ev.id;return(
          <g key={ev.id} style={{cursor:"pointer"}} onClick={()=>onSelect(ev)} onMouseEnter={()=>setTip({x,y,ev})} onMouseLeave={()=>setTip(null)}>
            <circle cx={x} cy={y} r={ev.sev==="critical"?14:10} fill={c} className={ev.sev==="critical"?"mc":"mp"} opacity=".2"/>
            <circle cx={x} cy={y} r={isSel?7:5} fill={c} stroke={isSel?"#fff":"none"} strokeWidth={isSel?2.5:0} filter="url(#gl)"/>
            <circle cx={x} cy={y} r="1.8" fill="#fff" opacity=".8"/>
          </g>
        )})}
      </svg>

      {tip&&(<div style={{position:"absolute",left:tip.x>400?`${(tip.x/800)*100-22}%`:undefined,right:tip.x<=400?`${100-(tip.x/800)*100-3}%`:undefined,top:`${Math.max(5,(tip.y/500)*100-14)}%`,background:"rgba(10,14,22,0.97)",border:`1px solid ${T.br}`,borderRadius:10,padding:"10px 14px",color:T.t,fontSize:12,direction:"rtl",maxWidth:210,pointerEvents:"none",zIndex:20,backdropFilter:"blur(16px)",boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
        <div style={{fontWeight:700,marginBottom:4,lineHeight:1.5}}>{tip.ev.tAr}</div>
        <div style={{color:T.t3,fontSize:10}}>{tip.ev.src} · {tip.ev.time}</div>
      </div>)}

      {/* Legend */}
      <div style={{position:"absolute",bottom:8,left:8,background:"rgba(6,9,15,0.92)",borderRadius:8,padding:"5px 10px",display:"flex",gap:8,fontSize:8,color:T.t3,direction:"rtl",backdropFilter:"blur(8px)",border:`1px solid ${T.br}`,flexWrap:"wrap"}}>
        {[{c:"#ef4444",l:"هجوم",sh:"●"},{c:"#10b981",l:"اعتراض",sh:"●"},{c:"#eab308",l:"عسكري",sh:"●"},{c:"#3b82f6",l:"بحري",sh:"●"},{c:"#8b5cf6",l:"قاعدة",sh:"◆"},{c:"#06b6d4",l:"حاملة",sh:"▲"}].map(i=>(
          <span key={i.l} style={{display:"flex",alignItems:"center",gap:2}}><span style={{color:i.c,fontSize:9}}>{i.sh}</span>{i.l}</span>
        ))}
      </div>
    </div>
  );
}

// ====== LIVE FETCH ======
async function fetchLive(){
  try{
    const r=await fetch("/api/news",{method:"POST",headers:{"Content-Type":"application/json"}});
    const d=await r.json();
    const items=d.items||[];
    return items.filter(i=>i.titleAr&&i.sourceUrl).map((i,x)=>({id:`l${Date.now()}_${x}`,time:"🔴 الآن",tAr:i.titleAr,src:i.source||"",url:i.sourceUrl,cat:i.category||"military",v:false,isLive:true}));
  }catch{return[];}
}

// ============================================================
// MAIN APP
// ============================================================

const TABS=[
  {id:"news",ar:"الأخبار",ic:"📰"},
  {id:"map",ar:"الخريطة",ic:"🗺️"},
  {id:"govt",ar:"بيانات رسمية",ic:"🏛️"},
  {id:"rumors",ar:"كشف الشائعات",ic:"🔍"},
  {id:"emergency",ar:"طوارئ",ic:"🚨"},
  {id:"status",ar:"حالة الخليج",ic:"📊"},
];

const CATS={all:"الكل",local:"🇰🇼 الكويت",military:"⚔️ عسكري",politics:"🏛️ سياسي",economy:"💰 اقتصادي"};

export default function GulfMonitor(){
  const[tab,setTab]=useState("news");
  const[selEv,setSelEv]=useState(null);
  const[flt,setFlt]=useState("all");
  const[now,setNow]=useState(new Date());
  const[banner,setBanner]=useState(true);
  const[live,setLive]=useState([]);
  const[loading,setLoading]=useState(false);
  const[lastFetch,setLastFetch]=useState(null);
  const[timeSlider,setTimeSlider]=useState(0);
  const[showBases,setShowBases]=useState(true);
  const[showCarriers,setShowCarriers]=useState(true);
  const[sirenMode,setSirenMode]=useState(false);

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(t)},[]);

  // Conflict started Feb 28, 2026, ~08:00 Kuwait time (UTC+3)
  const conflictStart=new Date("2026-02-28T05:00:00Z");
  const elapsed=Math.max(0,now.getTime()-conflictStart.getTime());
  const eDays=Math.floor(elapsed/(86400000));
  const eHours=Math.floor((elapsed%(86400000))/(3600000));
  const eMins=Math.floor((elapsed%(3600000))/(60000));
  const eSecs=Math.floor((elapsed%(60000))/(1000));

  const doFetch=useCallback(async()=>{
    setLoading(true);
    const items=await fetchLive();
    if(items.length>0){setLive(items);setLastFetch(new Date());}
    setLoading(false);
  },[]);

  const allNews=[...live,...NEWS];
  const filtered=flt==="all"?allNews:allNews.filter(n=>n.cat===flt);
  const vs=vt=>vt==="false"?{bg:T.gs,c:T.g,b:`1px solid ${T.g}33`}:{bg:T.as,c:T.a,b:`1px solid ${T.a}33`};

  return(
    <div dir="rtl" style={{fontFamily:"'IBM Plex Sans Arabic','Noto Sans Arabic',Tahoma,sans-serif",background:T.bg,color:T.t,minHeight:"100vh",maxWidth:540,margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes marquee{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes sirenFlash{0%,100%{background:#450a0a}50%{background:#991b1b}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px}
        input[type=range]{-webkit-appearance:none;background:${T.br};height:4px;border-radius:2px;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:${T.r};border-radius:50%;cursor:pointer}
      `}</style>

      {/* SIREN OVERLAY — only shows when manually activated */}
      {sirenMode&&(<div style={{position:"fixed",inset:0,zIndex:999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"sirenFlash 1s infinite",direction:"rtl",padding:20}}>
        <div style={{position:"absolute",inset:0,background:"rgba(69,10,10,0.97)"}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:420}}>
          <div style={{fontSize:72,marginBottom:12}}>🚨</div>
          <h1 style={{fontSize:26,fontWeight:700,color:"#fca5a5",lineHeight:1.6,margin:"0 0 16px"}}>صافرات إنذار — التجأ الآن!</h1>
          <div style={{background:"rgba(0,0,0,0.5)",borderRadius:12,padding:20,textAlign:"right",lineHeight:2.2,fontSize:15,color:"#fef2f2",border:"1px solid #991b1b"}}>
            <p style={{margin:"0 0 8px",fontWeight:700,fontSize:16,textAlign:"center",color:"#fca5a5"}}>🏠 ماذا تفعل الآن:</p>
            <p style={{margin:"0 0 6px"}}>١. <strong>انزل فوراً</strong> لأقرب ملجأ أو طابق سفلي / بدروم</p>
            <p style={{margin:"0 0 6px"}}>٢. <strong>ابتعد</strong> عن النوافذ والأبواب الزجاجية</p>
            <p style={{margin:"0 0 6px"}}>٣. <strong>لا تستخدم المصاعد</strong> — الدرج فقط</p>
            <p style={{margin:"0 0 6px"}}>٤. <strong>تابع</strong> إذاعة الكويت أو حساب الدفاع المدني</p>
            <p style={{margin:"0 0 8px"}}>٥. <strong>لا تخرج</strong> حتى تسمع صافرة الأمان (نغمة متواصلة)</p>
            <div style={{borderTop:"1px solid #991b1b",paddingTop:10,marginTop:6,textAlign:"center"}}>
              <p style={{margin:0,fontWeight:700,fontSize:18,color:"#fca5a5"}}>📞 الطوارئ: 112</p>
              <p style={{margin:"4px 0 0",fontSize:14,color:"#fecaca"}}>الدفاع المدني: 1804000</p>
            </div>
          </div>
          <button onClick={()=>setSirenMode(false)} style={{marginTop:16,background:"#991b1b",border:"1px solid #fca5a5",borderRadius:10,padding:"10px 28px",color:"#fef2f2",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            ✓ فهمت — إغلاق التنبيه
          </button>
          <p style={{marginTop:8,fontSize:10,color:"#fca5a5",opacity:.5}}>ملاحظة: هذا التنبيه يُفعّل يدوياً — لا يعني بالضرورة وجود صافرات حالياً</p>
        </div>
      </div>)}

      {/* HEADER */}
      <header style={{background:`linear-gradient(180deg,${T.s} 0%,${T.bg} 100%)`,borderBottom:`1px solid ${T.br}`,padding:"12px 14px 6px",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:700,margin:0,letterSpacing:"-0.03em"}}>
              <span style={{color:T.r,fontSize:11}}>⬤</span> خليج <span style={{color:T.r}}>مونيتور</span>
            </h1>
            <p style={{fontSize:9,color:T.t3,margin:"2px 0 0"}}>متابعة مباشرة · مصادر موثقة · أزمة إيران</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setSirenMode(true)} style={{background:"#991b1b",border:"1px solid #7f1d1d",borderRadius:8,padding:"6px 10px",color:"#fca5a5",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
              <span>🚨</span> سمعت صافرة؟
            </button>
            <div style={{textAlign:"left",direction:"ltr"}}>
              <div style={{fontSize:9,color:T.t2}}>{now.toLocaleDateString("ar-KW",{weekday:"short",day:"numeric",month:"short"})}</div>
              <div style={{fontSize:9,color:T.r,display:"flex",alignItems:"center",gap:3,justifyContent:"flex-end"}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:T.r,animation:"pulse 1.5s ease-in-out infinite"}}/>مباشر
              </div>
            </div>
          </div>
        </div>
        <nav style={{display:"flex",gap:1,background:"#060910",borderRadius:10,padding:2,overflowX:"auto"}}>
          {TABS.map(t2=>(
            <button key={t2.id} onClick={()=>setTab(t2.id)} style={{
              flex:"0 0 auto",padding:"7px 8px",border:"none",borderRadius:8,
              background:tab===t2.id?T.c:"transparent",color:tab===t2.id?T.t:T.t3,
              fontFamily:"inherit",fontSize:10,fontWeight:tab===t2.id?600:400,cursor:"pointer",
              whiteSpace:"nowrap",transition:"all 0.15s",
            }}>
              <span style={{fontSize:11,marginLeft:2}}>{t2.ic}</span>{t2.ar}
            </button>
          ))}
        </nav>
      </header>

      {/* CONFLICT TIMER */}
      <div style={{background:"#0a0f18",borderBottom:`1px solid ${T.br}`,padding:"8px 14px",display:"flex",justifyContent:"center",alignItems:"center",gap:16,direction:"ltr"}}>
        <span style={{fontSize:9,color:T.t3,direction:"rtl"}}>منذ بدء الضربات:</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {[{v:eDays,l:"يوم"},{v:eHours,l:"ساعة"},{v:eMins,l:"دقيقة"},{v:eSecs,l:"ثانية"}].map((u,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:700,color:T.r,fontVariantNumeric:"tabular-nums",minWidth:28,fontFamily:"monospace"}}>{String(u.v).padStart(2,"0")}</div>
              <div style={{fontSize:7,color:T.t3}}>{u.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* BANNER */}
      {banner&&(<div style={{background:"linear-gradient(90deg,#450a0a,#7f1d1d,#450a0a)",padding:"8px 14px",display:"flex",alignItems:"center",gap:6,borderBottom:"1px solid #991b1b33"}}>
        <span style={{fontSize:12,flexShrink:0}}>🚨</span>
        <div style={{overflow:"hidden",flex:1}}><div style={{whiteSpace:"nowrap",animation:"marquee 22s linear infinite",fontSize:11,fontWeight:600}}>تحذير: المجال الجوي مغلق — اعتراضات مستمرة — ابقوا في ملاجئ — اتبعوا الدفاع المدني — لا تنشروا شائعات</div></div>
        <button onClick={()=>setBanner(false)} style={{background:"none",border:"none",color:"#fca5a5",cursor:"pointer",fontSize:12}}>✕</button>
      </div>)}

      {/* STATUS BAR (replaced death count) */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:T.br}}>
        {[
          {v:"380",l:"اعتراض ناجح 🛡️",c:T.g},
          {v:"مغلق",l:"المجال الجوي ✈️",c:T.r},
          {v:"مقيّد",l:"مضيق هرمز ⛽",c:T.a},
          {v:"أقصى",l:"مستوى التأهب 🚨",c:T.r},
        ].map((s,i)=>(
          <div key={i} style={{background:T.bg,padding:"9px 4px",textAlign:"center"}}>
            <div style={{fontSize:s.v.length>3?14:18,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontSize:7,color:T.t3,marginTop:2}}>🇰🇼 {s.l}</div>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <main style={{padding:"10px 12px"}}>

        {/* NEWS */}
        {tab==="news"&&(<div>
          <button onClick={doFetch} disabled={loading} style={{width:"100%",padding:"10px",marginBottom:10,borderRadius:10,border:`1px solid ${T.rb}`,background:T.rs,color:loading?T.t2:T.r,fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:loading?"wait":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {loading?<><span style={{display:"inline-block",width:12,height:12,border:"2px solid #dc262644",borderTopColor:T.r,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>جاري البحث...</>:<>🔄 تحديث مباشر{lastFetch?` · ${lastFetch.toLocaleTimeString("ar-KW",{hour:"2-digit",minute:"2-digit"})}`:""}</>}
          </button>
          <div style={{display:"flex",gap:4,marginBottom:10,overflowX:"auto",paddingBottom:3}}>
            {Object.entries(CATS).map(([k,l])=>(<button key={k} onClick={()=>setFlt(k)} style={{padding:"4px 10px",borderRadius:20,border:flt===k?`1px solid ${T.r}`:`1px solid ${T.br}`,background:flt===k?T.rs:"transparent",color:flt===k?T.r:T.t3,fontSize:10,fontFamily:"inherit",fontWeight:flt===k?600:400,cursor:"pointer",whiteSpace:"nowrap"}}>{l}</button>))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {filtered.map((item,idx)=>(<article key={item.id} style={{background:T.c,border:`1px solid ${item.isLive?T.rb:T.br}`,borderRadius:10,padding:"11px 13px",animation:`fadeUp .3s ease ${idx*.03}s both`}}>
              {item.isLive&&<div style={{fontSize:8,color:T.r,fontWeight:700,marginBottom:5,display:"flex",alignItems:"center",gap:3}}><span style={{width:4,height:4,borderRadius:"50%",background:T.r,animation:"pulse 1s infinite"}}/>خبر مباشر</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,marginBottom:6}}>
                <h3 style={{fontSize:13,fontWeight:600,margin:0,lineHeight:1.7,flex:1}}>{item.tAr}</h3>
                {item.v&&<span style={{background:T.gs,color:T.g,fontSize:8,padding:"2px 6px",borderRadius:8,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>✓ موثق</span>}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10,color:T.t3,flexWrap:"wrap",gap:3}}>
                <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                  <span style={{color:T.t2,fontWeight:500}}>{item.src}</span>
                  <SL url={item.url} label="المصدر ↗" sm/>
                </div>
                <span style={{fontSize:9}}>{item.time}</span>
              </div>
              <ShareBtn text={item.tAr+" — خليج مونيتور"} url={item.url}/>
            </article>))}
          </div>
        </div>)}

        {/* MAP */}
        {tab==="map"&&(<div>
          <GulfMap events={EVENTS} sel={selEv} onSelect={setSelEv} timeFilter={timeSlider} showBases={showBases} showCarriers={showCarriers}/>

          {/* Map controls */}
          <div style={{marginTop:10,background:T.c,borderRadius:10,padding:"10px 12px",border:`1px solid ${T.br}`}}>
            <div style={{fontSize:11,fontWeight:600,marginBottom:8,color:T.t2}}>⏱️ الجدول الزمني</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:9,color:T.t3,whiteSpace:"nowrap"}}>{timeSlider===0?"الكل":`يوم ${timeSlider}`}</span>
              <input type="range" min={0} max={3} value={timeSlider} onChange={e=>setTimeSlider(+e.target.value)} style={{flex:1}}/>
              <span style={{fontSize:9,color:T.t3,whiteSpace:"nowrap"}}>{["كل الأيام","28 فبراير","1 مارس","2 مارس"][timeSlider]}</span>
            </div>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <label style={{fontSize:10,color:T.t2,display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                <input type="checkbox" checked={showBases} onChange={e=>setShowBases(e.target.checked)}/> ◆ القواعد العسكرية
              </label>
              <label style={{fontSize:10,color:T.t2,display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                <input type="checkbox" checked={showCarriers} onChange={e=>setShowCarriers(e.target.checked)}/> ▲ حاملات الطائرات
              </label>
            </div>
          </div>

          {selEv&&(<div style={{marginTop:8,background:T.c,borderRadius:10,padding:12,border:`1px solid ${ec(selEv.tp,selEv.sev)}30`,animation:"fadeUp .2s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <h3 style={{fontSize:14,fontWeight:700,margin:0,lineHeight:1.5}}>{selEv.tAr}</h3>
              <button onClick={()=>setSelEv(null)} style={{background:"none",border:"none",color:T.t3,cursor:"pointer",fontSize:14}}>✕</button>
            </div>
            <p style={{fontSize:12,color:T.t2,margin:"6px 0",lineHeight:1.8}}>{selEv.dAr}</p>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10,color:T.t3,borderTop:`1px solid ${T.br}`,paddingTop:6}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>📍 {selEv.src} <SL url={selEv.url} sm/></div>
              <span>🕐 {selEv.time}</span>
            </div>
            <ShareBtn text={selEv.tAr+" — خليج مونيتور"} url={selEv.url}/>
          </div>)}

          <div style={{marginTop:10}}>
            <h3 style={{fontSize:11,fontWeight:600,color:T.t3,marginBottom:6}}>الأحداث ({(timeSlider===0?EVENTS:EVENTS.filter(e=>e.day<=timeSlider)).length})</h3>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {(timeSlider===0?EVENTS:EVENTS.filter(e=>e.day<=timeSlider)).map((ev,idx)=>(<button key={ev.id} onClick={()=>setSelEv(ev)} style={{background:selEv?.id===ev.id?T.ch:T.c,border:`1px solid ${selEv?.id===ev.id?"#334155":T.br}`,borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",textAlign:"right",fontFamily:"inherit",color:T.t,width:"100%",animation:`fadeUp .2s ease ${idx*.02}s both`}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:ec(ev.tp,ev.sev),flexShrink:0,boxShadow:`0 0 6px ${ec(ev.tp,ev.sev)}44`}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,lineHeight:1.4}}>{ev.tAr}</div>
                  <div style={{fontSize:9,color:T.t3,marginTop:1}}>{ev.src} · {ev.time}</div>
                </div>
                {ev.url&&<a href={ev.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{color:"#60a5fa",fontSize:11,textDecoration:"none",opacity:.7}}>↗</a>}
              </button>))}
            </div>
          </div>
        </div>)}

        {/* GOVT */}
        {tab==="govt"&&(<div>
          <p style={{fontSize:10,color:T.t3,margin:"0 0 8px",lineHeight:1.7}}>بيانات رسمية مرتبطة بمصادرها الأصلية</p>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {GOVT.map((g,idx)=>(<article key={g.id} style={{background:T.c,border:`1px solid ${T.br}`,borderRight:`3px solid ${g.p==="high"?T.r:T.b}`,borderRadius:10,padding:"11px 13px",animation:`fadeUp .3s ease ${idx*.04}s both`}}>
              <div style={{fontSize:10,fontWeight:600,marginBottom:5,display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:15}}>{g.f}</span><span style={{color:g.p==="high"?T.r:T.b}}>{g.s}</span>
              </div>
              <p style={{fontSize:13,fontWeight:600,margin:0,lineHeight:1.7}}>{g.tAr}</p>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6,fontSize:9,color:T.t3}}>
                <span>🕐 {g.time}</span><SL url={g.url} label="المصدر ↗" sm/>
              </div>
              <ShareBtn text={g.tAr+" — "+g.s} url={g.url}/>
            </article>))}
          </div>
        </div>)}

        {/* RUMORS */}
        {tab==="rumors"&&(<div>
          <div style={{background:T.as,border:`1px solid ${T.a}33`,borderRadius:10,padding:"10px 12px",marginBottom:10,fontSize:11,color:T.a,lineHeight:1.8}}>⚠️ تحقق من الشائعات — كل ادعاء مرفق بمصدره</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {RUMORS.map((r,idx)=>{const v=vs(r.vt);return(<article key={r.id} style={{background:T.c,border:`1px solid ${T.br}`,borderRadius:10,overflow:"hidden",animation:`fadeUp .3s ease ${idx*.04}s both`}}>
              <div style={{padding:"8px 12px",borderBottom:`1px solid ${T.brs}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,color:T.t3}}>❓ الادعاء</span>
                <span style={{fontSize:10,fontWeight:600,color:v.c,background:v.bg,padding:"2px 8px",borderRadius:10,border:v.b}}>{r.ic} {r.verdict}</span>
              </div>
              <div style={{padding:"10px 12px"}}>
                <p style={{fontSize:13,fontWeight:600,margin:"0 0 8px",lineHeight:1.7}}>{r.claim}</p>
                <div style={{fontSize:11,color:T.t2,lineHeight:1.8,background:T.s,borderRadius:8,padding:"8px 10px",border:`1px solid ${T.brs}`}}>
                  <span style={{color:T.a,fontWeight:600}}>💡</span> {r.detail}
                </div>
                <div style={{marginTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <ShareBtn text={"⚠️ "+r.claim+" — "+r.verdict+" | خليج مونيتور"} url={r.url}/>
                  <SL url={r.url} label="التحقق ↗"/>
                </div>
              </div>
            </article>)})}
          </div>
        </div>)}

        {/* EMERGENCY */}
        {tab==="emergency"&&(<div>
          {/* Siren guide */}
          <div style={{background:"#450a0a",border:"1px solid #991b1b",borderRadius:12,padding:14,marginBottom:10}}>
            <h3 style={{fontSize:15,fontWeight:700,color:"#fca5a5",margin:"0 0 10px",display:"flex",alignItems:"center",gap:6}}>🚨 عند سماع صافرات الإنذار</h3>
            <div style={{fontSize:13,color:"#fef2f2",lineHeight:2}}>
              <p style={{margin:"0 0 6px"}}>١. <strong>انزل فوراً</strong> لأقرب ملجأ أو طابق سفلي / بدروم</p>
              <p style={{margin:"0 0 6px"}}>٢. <strong>ابتعد</strong> عن النوافذ والأبواب الزجاجية</p>
              <p style={{margin:"0 0 6px"}}>٣. <strong>لا تستخدم</strong> المصاعد — استخدم الدرج فقط</p>
              <p style={{margin:"0 0 6px"}}>٤. <strong>تابع</strong> إذاعة الكويت أو حساب الدفاع المدني</p>
              <p style={{margin:0}}>٥. <strong>لا تخرج</strong> حتى تسمع صافرة الأمان (صوت متواصل)</p>
            </div>
          </div>

          {/* Emergency numbers */}
          <div style={{background:T.c,border:`1px solid ${T.br}`,borderRadius:12,padding:14,marginBottom:10}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 10px",color:T.r}}>📞 أرقام الطوارئ</h3>
            {[
              {num:"112",label:"الطوارئ العامة (شرطة/إسعاف/إطفاء)",urgent:true},
              {num:"1804000",label:"الدفاع المدني",urgent:true},
              {num:"151",label:"وزارة الصحة",urgent:false},
              {num:"171",label:"الخطوط الجوية الكويتية",urgent:false},
              {num:"+965-2259-1001",label:"السفارة الأمريكية — للمقيمين الأمريكيين",urgent:false},
            ].map((n,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<4?`1px solid ${T.brs}`:"none"}}>
                <span style={{fontSize:12,color:T.t2}}>{n.label}</span>
                <a href={`tel:${n.num}`} style={{color:n.urgent?T.r:"#60a5fa",fontSize:14,fontWeight:700,textDecoration:"none",fontVariantNumeric:"tabular-nums",direction:"ltr"}}>{n.num}</a>
              </div>
            ))}
          </div>

          {/* Shelters */}
          <div style={{background:T.c,border:`1px solid ${T.br}`,borderRadius:12,padding:14,marginBottom:10}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 8px"}}>🏠 الملاجئ</h3>
            <p style={{fontSize:12,color:T.t2,lineHeight:1.8,margin:"0 0 8px"}}>
              قائمة الملاجئ الرسمية متاحة على موقع وزارة الداخلية — الدفاع المدني. اختر محافظتك لعرض أقرب ملجأ.
            </p>
            <a href="https://www.moi.gov.kw/main/eservices/civildefence/shelters?culture=en" target="_blank" rel="noopener noreferrer" style={{display:"block",background:T.rs,border:`1px solid ${T.rb}`,borderRadius:8,padding:"10px",textAlign:"center",color:T.r,fontWeight:700,fontSize:13,textDecoration:"none"}}>
              🔗 فتح قائمة الملاجئ — وزارة الداخلية
            </a>
          </div>

          {/* Safety guide */}
          <div style={{background:T.c,border:`1px solid ${T.br}`,borderRadius:12,padding:14,marginBottom:10}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 8px"}}>📋 دليل السلامة الرسمي</h3>
            <p style={{fontSize:12,color:T.t2,lineHeight:1.8,margin:"0 0 8px"}}>
              دليل الدفاع المدني الكامل: الملاجئ، الإخلاء، الهجوم الكيميائي، الإسعافات الأولية
            </p>
            <a href="https://www.moi.gov.kw/main/content/docs/civildefence/en/safety-guide-for-emergency.pdf" target="_blank" rel="noopener noreferrer" style={{display:"block",background:T.bs,border:`1px solid ${T.b}33`,borderRadius:8,padding:"10px",textAlign:"center",color:"#60a5fa",fontWeight:700,fontSize:13,textDecoration:"none"}}>
              📄 تحميل دليل السلامة (PDF)
            </a>
          </div>

          {/* Government links */}
          <div style={{background:T.c,border:`1px solid ${T.br}`,borderRadius:12,padding:14}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 10px"}}>🇰🇼 مواقع حكومية مهمة</h3>
            {[
              {name:"وزارة الداخلية — الدفاع المدني",url:"https://www.moi.gov.kw/main/eservices/civildefence?culture=en",desc:"ملاجئ، إنذارات، تعليمات السلامة"},
              {name:"قائمة الملاجئ حسب المحافظة",url:"https://www.moi.gov.kw/main/eservices/civildefence/shelters?culture=en",desc:"اختر محافظتك لأقرب ملجأ"},
              {name:"وزارة الصحة",url:"https://www.moh.gov.kw/",desc:"مستشفيات، خدمات طبية، تحديثات صحية"},
              {name:"وكالة الأنباء الكويتية (كونا)",url:"https://www.kuna.net.kw/",desc:"المصدر الرسمي للأخبار الكويتية"},
              {name:"الخطوط الجوية الكويتية — حالة الرحلات",url:"https://kuwaitairways.com/en/flightstatus",desc:"استعلام عن حالة الرحلات والإلغاءات"},
              {name:"مطار الكويت الدولي",url:"https://www.kuwaitairport.gov.kw/en/flights-info/",desc:"معلومات الرحلات والوصول والمغادرة"},
              {name:"وزارة الداخلية",url:"https://www.moi.gov.kw/main?culture=en",desc:"خدمات إلكترونية، أخبار أمنية"},
              {name:"بوابة الكويت الإلكترونية — الطوارئ",url:"https://e.gov.kw/sites/kgoenglish/Pages/Visitors/TourismInKuwait/EssintialServicesEmergencies.aspx",desc:"جميع أرقام الطوارئ الحكومية"},
            ].map((link,i)=>(
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                display:"block",padding:"10px 0",borderBottom:i<7?`1px solid ${T.brs}`:"none",
                textDecoration:"none",color:T.t,
              }}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:2,display:"flex",alignItems:"center",gap:4}}>
                  {link.name}
                  <span style={{color:"#60a5fa",fontSize:10}}>↗</span>
                </div>
                <div style={{fontSize:10,color:T.t3}}>{link.desc}</div>
              </a>
            ))}
          </div>
        </div>)}

        {/* STATUS — Airspace + Oil */}
        {tab==="status"&&(<div>
          {/* Airspace */}
          <div style={{background:T.c,border:`1px solid ${T.br}`,borderRadius:12,padding:14,marginBottom:10}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 10px"}}>✈️ حالة المجال الجوي والمطارات</h3>
            {[
              {airport:"🇰🇼 مطار الكويت الدولي",status:"مغلق ❌",detail:"مغلق منذ 28 فبراير — لا رحلات تجارية حتى إشعار آخر",color:T.r,url:"https://sundayguardianlive.com/world/iran-israel-war-kuwait-international-airport-kwi-open-or-closed-check-diversions-flight-cancellations-helpline-numbers-more-173545/"},
              {airport:"🇰🇼 الخطوط الجوية الكويتية",status:"معلقة ❌",detail:"جميع الرحلات معلقة — للاستفسار: 171",color:T.r,url:"https://www.arabtimesonline.com/news/kuwait-airways-suspends-all-arrivals-and-departures-at-kuwait-international-airport/"},
              {airport:"🇦🇪 مطار دبي الدولي",status:"جزئي ⚠️",detail:"بعض رحلات الإجلاء — 80% من الرحلات ملغاة",color:T.a,url:"https://www.cnn.com/2026/03/02/travel/advice-middle-east-airspace-closures-flights-iran-intl-hnk"},
              {airport:"🇶🇦 مطار حمد الدولي",status:"مغلق ❌",detail:"الخطوط القطرية علقت جميع الرحلات",color:T.r,url:"https://www.euronews.com/2026/03/02/us-and-israeli-strikes-on-iran-disrupt-regional-and-international-flights"},
              {airport:"🇧🇭 مطار البحرين الدولي",status:"مغلق ❌",detail:"أضرار من طائرة مسيرة — مغلق",color:T.r,url:"https://www.aljazeera.com/news/2026/2/28/multiple-gulf-arab-states-that-host-us-assets-targeted-in-iran-retaliation"},
            ].map((a,i)=>(<div key={i} style={{padding:"10px 0",borderBottom:i<4?`1px solid ${T.brs}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:600}}>{a.airport}</span>
                <span style={{fontSize:10,fontWeight:700,color:a.color}}>{a.status}</span>
              </div>
              <div style={{fontSize:11,color:T.t3,lineHeight:1.6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span>{a.detail}</span>
                <SL url={a.url} sm/>
              </div>
            </div>))}
          </div>

          {/* Oil & Shipping */}
          <div style={{background:T.c,border:`1px solid ${T.br}`,borderRadius:12,padding:14,marginBottom:10}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 10px"}}>⛽ النفط والشحن البحري</h3>
            {[
              {label:"مضيق هرمز",value:"مقيّد ⚠️",detail:"إيران أعلنت الإغلاق — بعض السفن تعبر — 3 أصيبت",color:T.a},
              {label:"نفط عالق في الخليج",value:"77 مليون برميل",detail:"أعلى مستوى منذ 6 سنوات — Kpler",color:T.r},
              {label:"أسعار النفط",value:"~80$ / برميل",detail:"استقرار نسبي بعد ارتفاع أولي — لا ضرب مباشر للبنية التحتية",color:T.a},
              {label:"ميرسك / هاباغ لويد",value:"معلق ❌",detail:"تعليق جميع عمليات العبور في المضيق",color:T.r},
              {label:"مصفاة رأس تنورة",value:"مغلقة مؤقتاً",detail:"إغلاق احترازي بعد هجوم مسيرات — لا أضرار كبيرة",color:T.a},
            ].map((item,i)=>(<div key={i} style={{padding:"10px 0",borderBottom:i<4?`1px solid ${T.brs}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <span style={{fontSize:12,fontWeight:600}}>{item.label}</span>
                <span style={{fontSize:11,fontWeight:700,color:item.color}}>{item.value}</span>
              </div>
              <div style={{fontSize:10,color:T.t3}}>{item.detail}</div>
            </div>))}
            <div style={{marginTop:8}}><SL url="https://www.cnbc.com/2026/03/02/us-iran-live-updates-trump-oil-gold.html" label="CNBC — تحديثات النفط ↗"/></div>
          </div>

          {/* Airlines */}
          <div style={{background:T.c,border:`1px solid ${T.br}`,borderRadius:12,padding:14}}>
            <h3 style={{fontSize:14,fontWeight:700,margin:"0 0 10px"}}>🌍 شركات الطيران الدولية</h3>
            <div style={{fontSize:11,color:T.t2,lineHeight:1.9}}>
              <p style={{margin:"0 0 4px"}}><strong>لوفتهانزا:</strong> تعليق رحلات دبي حتى 4 مارس</p>
              <p style={{margin:"0 0 4px"}}><strong>الخطوط البريطانية:</strong> إلغاء تل أبيب والبحرين حتى الأربعاء</p>
              <p style={{margin:"0 0 4px"}}><strong>ويز إير:</strong> تعليق جميع رحلات الشرق الأوسط حتى 7 مارس</p>
              <p style={{margin:"0 0 4px"}}><strong>التركية:</strong> إلغاء رحلات لعدة دول خليجية</p>
              <p style={{margin:0}}><strong>عمان إير:</strong> إلغاء رحلات الكويت ودبي والدوحة ليوم 3 مارس</p>
            </div>
            <div style={{marginTop:8}}><SL url="https://www.euronews.com/2026/03/02/us-and-israeli-strikes-on-iran-disrupt-regional-and-international-flights" label="Euronews — تحديثات الطيران ↗"/></div>
          </div>
        </div>)}

      </main>

      {/* FOOTER */}
      <footer style={{padding:"16px 14px",borderTop:`1px solid ${T.br}`,textAlign:"center",fontSize:9,color:T.t3,lineHeight:2.2}}>
        <div><span style={{color:T.r,fontWeight:700}}>خليج مونيتور</span> — مصادر موثقة فقط</div>
        <div>⚖️ كل خبر وبيان مرفق برابط مصدره الأصلي</div>
        <div style={{color:"#1e293b",marginTop:2}}>لا نتحمل مسؤولية المحتوى المنشور في المصادر الخارجية</div>
      </footer>
    </div>
  );
}
