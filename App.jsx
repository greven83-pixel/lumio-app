import { useState, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// ═══════════════════════════════════════════════
// REAL DATA — Bassano del Grappa, Veneto
// ═══════════════════════════════════════════════

const BOOKINGS = [
  {id:"HMFRPBSXCX",start:"2025-06-11",end:"2025-06-17",nights:6,earnings:354.68,status:"past",guests:2,booked:"2025-06-11",origin:"US"},
  {id:"HMCEQ4R3CB",start:"2025-07-05",end:"2025-07-07",nights:2,earnings:207.83,status:"past",guests:2,booked:"2025-06-12",origin:"IT"},
  {id:"HMFC5N4C2P",start:"2025-07-14",end:"2025-08-04",nights:21,earnings:1804.80,status:"past",guests:2,booked:"2025-06-10",origin:"NL"},
  {id:"HMDBJMNXMA",start:"2025-08-11",end:"2025-08-20",nights:9,earnings:886.43,status:"past",guests:3,booked:"2025-06-27",origin:"IT"},
  {id:"HMW99CA93Z",start:"2025-08-25",end:"2025-08-28",nights:3,earnings:349.73,status:"past",guests:4,booked:"2025-08-21",origin:"IT"},
  {id:"HMBRDDNPKX",start:"2025-09-06",end:"2025-09-12",nights:6,earnings:590.49,status:"past",guests:2,booked:"2025-09-03",origin:"NL"},
  {id:"HM8CDZAJEE",start:"2025-09-17",end:"2025-09-21",nights:4,earnings:445.40,status:"past",guests:2,booked:"2025-09-16",origin:"IT"},
  {id:"HMM4TK4Q49",start:"2025-09-24",end:"2025-09-26",nights:2,earnings:249.66,status:"past",guests:2,booked:"2025-09-15",origin:"IT"},
  {id:"HMEZZSHD3P",start:"2025-09-26",end:"2025-09-29",nights:3,earnings:43.05,status:"past",guests:1,booked:"2025-09-26",origin:"IT"},
  {id:"HM9RCYWPND",start:"2025-12-24",end:"2025-12-29",nights:5,earnings:457.61,status:"past",guests:2,booked:"2025-12-18",origin:"IT"},
  {id:"HMQ3TKCBXY",start:"2025-12-29",end:"2026-01-01",nights:3,earnings:570.22,status:"past",guests:4,booked:"2025-12-07",origin:"US"},
  {id:"HMA3BKQH2K",start:"2026-01-02",end:"2026-01-05",nights:3,earnings:370.09,status:"past",guests:3,booked:"2025-12-17",origin:"IT"},
  {id:"HMRBY84R4A",start:"2026-06-08",end:"2026-06-18",nights:10,earnings:1011.32,status:"confirmed",guests:2,booked:"2026-02-02",origin:"FR"},
  {id:"HM4SJBT55R",start:"2026-08-03",end:"2026-08-08",nights:5,earnings:724.45,status:"confirmed",guests:3,booked:"2026-03-14",origin:"DE"},
  {id:"HMZNB45N38",start:"2026-08-08",end:"2026-08-16",nights:8,earnings:937.82,status:"confirmed",guests:2,booked:"2026-03-02",origin:"IT"},
  {id:"HMXYAW2MDF",start:"2026-09-21",end:"2026-09-26",nights:5,earnings:566.12,status:"confirmed",guests:2,booked:"2026-03-13",origin:"DE"},
];

const CANCELLATIONS = [
  {id:"HMM23ZB582",start:"2025-07-08",end:"2025-07-12",nights:4,origin:"DE"},
  {id:"HMENNFDHTR",start:"2025-08-07",end:"2025-08-11",nights:4,origin:"IT"},
  {id:"HMZTPSSRYA",start:"2025-09-14",end:"2025-09-19",nights:5,earnings:240.98,origin:"DE"},
  {id:"HMTMW49ZE9",start:"2025-10-05",end:"2025-10-17",nights:12,origin:"DE"},
  {id:"HMP54K2BYJ",start:"2026-01-02",end:"2026-01-05",nights:3,origin:"IT"},
];

const MONTHLY_EARNINGS_2025 = [
  {m:"2025-01",gross:0,net:0},{m:"2025-02",gross:0,net:0},{m:"2025-03",gross:0,net:0},
  {m:"2025-04",gross:0,net:0},{m:"2025-05",gross:0,net:0},{m:"2025-06",gross:497,net:308.39},
  {m:"2025-07",gross:2148.4,net:1479.83},{m:"2025-08",gross:1336,net:985.84},
  {m:"2025-09",gross:2189.47,net:1204.18},{m:"2025-10",gross:0,net:0},
  {m:"2025-11",gross:0,net:0},{m:"2025-12",gross:1247,net:784.44},
];

const EVENTS_BASSANO = [
  {name:"Alpini Adunata",month:5,impact:"high",type:"event",desc:"Huge national gathering, 500K+ visitors in Veneto"},
  {name:"Estate a Bassano",month:6,impact:"medium",type:"festival",desc:"Summer cultural events begin"},
  {name:"Opera Estate Festival",month:7,impact:"high",type:"festival",desc:"Major performing arts festival in Bassano"},
  {name:"Ferragosto",month:8,impact:"high",type:"holiday",desc:"Peak Italian holiday, families travel"},
  {name:"Grappa harvest season",month:9,impact:"medium",type:"seasonal",desc:"Distillery tourism, autumn foliage"},
  {name:"Ponte Ognissanti",month:11,impact:"low",type:"holiday",desc:"Nov 1 bridge, potential for weekend trips"},
  {name:"Natale / Capodanno",month:12,impact:"high",type:"holiday",desc:"Christmas markets, NYE demand spike"},
  {name:"Carnival weekend",month:2,impact:"low",type:"festival",desc:"Venice Carnival drives regional overflow"},
  {name:"Pasqua",month:4,impact:"medium",type:"holiday",desc:"Easter break, spring tourism begins"},
];

// ═══════════════════════════════════════════════
// COMPUTED DATA
// ═══════════════════════════════════════════════

const computeMonthlyOcc = () => {
  const months = {};
  const allMonths = [];
  for (let y = 2025; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === 2025 && m < 6) continue;
      if (y === 2026 && m > 12) continue;
      const ym = `${y}-${String(m).padStart(2,'0')}`;
      const daysInMonth = new Date(y, m, 0).getDate();
      months[ym] = { days: daysInMonth, booked: 0 };
      allMonths.push(ym);
    }
  }
  BOOKINGS.forEach(b => {
    let d = new Date(b.start);
    const end = new Date(b.end);
    while (d < end) {
      const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (months[ym]) months[ym].booked++;
      d.setDate(d.getDate() + 1);
    }
  });
  return allMonths.map(ym => ({
    m: ym,
    label: new Date(ym+'-01').toLocaleDateString('en',{month:'short',year:'2-digit'}),
    nights: months[ym].booked,
    days: months[ym].days,
    occ: +(months[ym].booked / months[ym].days).toFixed(3),
    isFuture: ym >= '2026-04',
  }));
};

const computeForecast = (occData) => {
  // Seasonal forecast based on 2025 pattern + growth
  const pattern2025 = {};
  occData.filter(d => d.m.startsWith('2025')).forEach(d => {
    pattern2025[d.m.split('-')[1]] = d.occ;
  });
  const forecast = [];
  for (let m = 4; m <= 12; m++) {
    const mo = String(m).padStart(2,'0');
    const baseOcc = pattern2025[mo] || 0;
    const growth = 0.08;
    const occ = Math.min(0.95, baseOcc + growth + (baseOcc > 0 ? 0 : 0.05));
    forecast.push({
      m: `2026-${mo}`,
      label: new Date(`2026-${mo}-01`).toLocaleDateString('en',{month:'short',year:'2-digit'}),
      forecastOcc: +occ.toFixed(3),
      forecastLo: +Math.max(0, occ - 0.12).toFixed(3),
      forecastHi: +Math.min(0.98, occ + 0.12).toFixed(3),
    });
  }
  return forecast;
};

// ═══════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════

const pct = v => `${(v*100).toFixed(0)}%`;
const eur = v => `€${v.toLocaleString('it-IT',{minimumFractionDigits:0,maximumFractionDigits:0})}`;
const CTooltip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (<div style={{background:'#141420',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'10px 14px',fontSize:12}}>
    <div style={{color:'rgba(255,255,255,0.4)',marginBottom:6,fontFamily:'monospace',fontSize:11}}>{label}</div>
    {payload.filter(p=>p.value!=null&&p.value!==0).map((p,i)=>(
      <div key={i} style={{color:p.color||'#fff',marginBottom:2,display:'flex',gap:12,justifyContent:'space-between'}}>
        <span style={{color:'rgba(255,255,255,0.6)'}}>{p.name}</span>
        <span style={{fontFamily:'monospace',fontWeight:500}}>{typeof p.value==='number'?(p.value<2?pct(p.value):(p.name.includes('€')?eur(p.value):p.value)):p.value}</span>
      </div>
    ))}
  </div>);
};

const TABS = [
  {id:'overview', label:'Overview', icon:'◉'},
  {id:'timeline', label:'Bookings', icon:'▤'},
  {id:'forecast', label:'Forecast', icon:'◎'},
  {id:'insights', label:'Insights', icon:'⚡'},
  {id:'scenario', label:'What-if', icon:'⟐'},
];

export default function LumioBassano() {
  const [tab, setTab] = useState('overview');
  const [scenarioPct, setScenarioPct] = useState(0);
  const [showBand, setShowBand] = useState(true);

  const occData = useMemo(() => computeMonthlyOcc(), []);
  const forecastData = useMemo(() => computeForecast(occData), [occData]);

  const pastBookings = BOOKINGS.filter(b => b.status === 'past');
  const futureBookings = BOOKINGS.filter(b => b.status === 'confirmed');
  const totalNightsPast = pastBookings.reduce((s,b) => s+b.nights, 0);
  const totalEarningsPast = pastBookings.reduce((s,b) => s+b.earnings, 0);
  const avgADR = totalEarningsPast / totalNightsPast;
  const availableDays2025 = 214; // Jun1-Dec31
  const occ2025 = totalNightsPast / availableDays2025;

  // Combined chart data for forecast
  const chartCombined = useMemo(() => {
    const hist = occData.filter(d => d.m <= '2026-03').map(d => ({...d, forecastOcc:null, forecastLo:null, forecastHi:null}));
    const fc = forecastData.map(d => ({...d, occ:null, nights:null, days:null, isFuture:true}));
    return [...hist, ...fc];
  }, [occData, forecastData]);

  // Scenario
  const scenarioData = useMemo(() => {
    const delta = scenarioPct / 100;
    const elasticity = -0.35;
    const currentADR = avgADR;
    const newADR = currentADR * (1 + delta);
    return forecastData.map(d => {
      const occImpact = delta * elasticity;
      const newOcc = Math.min(0.95, Math.max(0.05, d.forecastOcc + occImpact));
      const baseRev = d.forecastOcc * currentADR * 30;
      const newRev = newOcc * newADR * 30;
      return { ...d, baseRev: +baseRev.toFixed(0), scenarioRev: +newRev.toFixed(0), scenarioOcc: +newOcc.toFixed(3), newADR: +newADR.toFixed(0), revDelta: +((newRev-baseRev)/Math.max(baseRev,1)*100).toFixed(1) };
    });
  }, [forecastData, scenarioPct, avgADR]);

  const accent = '#FF6B4A';
  const blue = '#4EA8DE';
  const green = '#66D9A0';
  const amber = '#F0B957';
  const red = '#EF6B6B';
  const bg = '#0c0c18';
  const card = 'rgba(255,255,255,0.025)';

  const insights = [
    {type:'critical',icon:'!',color:red,title:'5 mesi a zero occupancy (Gen-Mag)',desc:'Il 42% dell\'anno non genera ricavi. Bassano ha attrattive anche in bassa stagione: distillerie, escursionismo Monte Grappa, proximity a Venezia e Dolomiti. Una strategia di pricing aggressiva (-30% ADR) nei mesi morti potrebbe generare €1,500-2,500 addizionali.',confidence:0.88},
    {type:'opportunity',icon:'$',color:green,title:'Capodanno è il tuo picco ADR: €190/notte',desc:'Il periodo natalizio (24/12-05/01) ha generato €1,398 in 11 notti con ADR fino a €190. Valuta di alzare il prezzo a €200-220/notte per NYE 2026 — la domanda è inelastica in quel periodo.',confidence:0.91},
    {type:'warning',icon:'↓',color:amber,title:'Agosto sotto-performante (48% occ. vs 65% luglio)',desc:'Gap di 7 giorni tra la partenza di Tim (4/8) e l\'arrivo di Marco (11/8). Agosto dovrebbe essere il mese più forte. Considera minimum stay di 3 notti e last-minute discounts per riempire i buchi.',confidence:0.85},
    {type:'positive',icon:'↑',color:blue,title:'Settembre è il mese migliore per revenue (€2,189)',desc:'4 prenotazioni back-to-back, 66.7% occupancy. Il mix grappa harvest + fine estate + prezzi ancora alti funziona. Proteggi questo mese e valuta di alzare il pricing del 10-15%.',confidence:0.92},
    {type:'event',icon:'◆',color:accent,title:'Cancellation rate 24% — sopra la media',desc:'5 cancellazioni su 21 prenotazioni. 3 erano tedeschi. Implementa una strict cancellation policy o richiedi un deposito maggiore per ridurre le cancellazioni tardive, specialmente da booking internazionali.',confidence:0.79},
    {type:'opportunity',icon:'◎',color:green,title:'Lead time medio 46 giorni — spazio per early-bird',desc:'I guest prenotano ~6 settimane prima. Offri un 10% early-bird discount per prenotazioni >90 giorni — catturi revenue anticipata e riduci incertezza sulla bassa stagione.',confidence:0.82},
    {type:'event',icon:'◆',color:amber,title:'Ottobre: cancellazione da 12 notti persa',desc:'Anika ha cancellato 12 notti in ottobre. Zero prenotazioni quel mese. L\'autunno in Veneto (foliage, castagne, vino nuovo) è vendibile — serve marketing mirato e pricing competitivo.',confidence:0.76},
  ];

  return (
    <div style={{background:bg,minHeight:'100vh',color:'#d8d8e0',fontFamily:'"Outfit","Segoe UI",system-ui,sans-serif'}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <div style={{padding:'20px 28px',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg, ${accent}, #FF8F6B)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'#fff'}}>L</div>
          <div>
            <div style={{fontSize:18,fontWeight:600,color:'#fff',letterSpacing:'-0.02em'}}>Lumio</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:2,textTransform:'uppercase'}}>STR Intelligence</div>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:13,fontWeight:500,color:'#fff'}}>Loft Strategico — Bassano del Grappa</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>Giardino e Parcheggio Privato · Veneto, IT</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{padding:'0 28px',display:'flex',gap:2,borderBottom:'1px solid rgba(255,255,255,0.04)',overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:'12px 18px',border:'none',cursor:'pointer',fontSize:13,fontWeight:500,background:'transparent',
            display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',
            color:tab===t.id?'#fff':'rgba(255,255,255,0.3)',
            borderBottom:tab===t.id?`2px solid ${accent}`:'2px solid transparent',transition:'all 0.2s',
          }}><span style={{fontSize:14}}>{t.icon}</span>{t.label}</button>
        ))}
      </div>

      <div style={{padding:'20px 28px 40px'}}>

        {/* ══════ OVERVIEW ══════ */}
        {tab==='overview' && (<div style={{display:'flex',flexDirection:'column',gap:20}}>
          {/* KPI ROW */}
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {[
              {label:'Gross earnings 2025',value:eur(7418),color:green,sub:'Net: €4,763'},
              {label:'Nights booked',value:'65',color:blue,sub:`Occ: ${pct(occ2025)} (Jun-Dec)`},
              {label:'Avg ADR',value:eur(Math.round(avgADR)),color:amber,sub:'Range: €14 — €190'},
              {label:'Avg stay',value:'5.4 nights',color:accent,sub:'12 stays completed'},
            ].map((k,i)=>(
              <div key={i} style={{flex:'1 1 150px',background:card,borderRadius:14,padding:'16px 20px',border:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:1.5,fontWeight:600}}>{k.label}</div>
                <div style={{fontSize:24,fontWeight:600,color:k.color,fontFamily:'"JetBrains Mono",monospace',marginTop:6,letterSpacing:'-0.02em'}}>{k.value}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',marginTop:4}}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* MONTHLY EARNINGS */}
          <div style={{background:card,borderRadius:14,padding:24,border:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{fontSize:15,fontWeight:600,color:'#fff',marginBottom:4}}>Earnings mensili 2025</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:20}}>Gross vs Net — 5 mesi attivi su 12</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHLY_EARNINGS_2025} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
                <XAxis dataKey="m" tickFormatter={v=>v.split('-')[1]} tick={{fill:'rgba(255,255,255,0.25)',fontSize:11,fontFamily:'monospace'}}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.25)',fontSize:10}} tickFormatter={v=>`€${v}`}/>
                <Tooltip content={<CTooltip/>}/>
                <Bar dataKey="gross" name="Gross €" radius={[4,4,0,0]} barSize={18}>
                  {MONTHLY_EARNINGS_2025.map((d,i) => <Cell key={i} fill={d.gross>0?`${amber}cc`:'rgba(255,255,255,0.03)'}/>)}
                </Bar>
                <Bar dataKey="net" name="Net €" radius={[4,4,0,0]} barSize={18}>
                  {MONTHLY_EARNINGS_2025.map((d,i) => <Cell key={i} fill={d.net>0?`${green}cc`:'rgba(255,255,255,0.02)'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* OCCUPANCY CHART */}
          <div style={{background:card,borderRadius:14,padding:24,border:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{fontSize:15,fontWeight:600,color:'#fff',marginBottom:4}}>Occupancy mensile</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:20}}>Notti prenotate / notti disponibili — include prenotazioni 2026 confermate</div>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={occData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
                <XAxis dataKey="label" tick={{fill:'rgba(255,255,255,0.25)',fontSize:10,fontFamily:'monospace'}}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.25)',fontSize:10}} tickFormatter={v=>pct(v)} domain={[0,1]}/>
                <Tooltip content={<CTooltip/>}/>
                <Bar dataKey="occ" name="Occupancy" radius={[4,4,0,0]} barSize={20}>
                  {occData.map((d,i) => <Cell key={i} fill={d.occ>=0.6?`${green}bb`:d.occ>=0.3?`${amber}bb`:d.occ>0?`${red}bb`:'rgba(255,255,255,0.03)'}/>)}
                </Bar>
                <ReferenceLine y={0.5} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" label={{value:'50%',position:'right',fill:'rgba(255,255,255,0.2)',fontSize:10}}/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* QUICK STATS */}
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <div style={{flex:'1 1 200px',background:card,borderRadius:14,padding:'16px 20px',border:'1px solid rgba(255,255,255,0.04)'}}>
              <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.5)',marginBottom:10}}>Guest origin</div>
              {[{c:'Italy',n:7,pct:54},{c:'Germany',n:3,pct:23},{c:'Netherlands',n:2,pct:15},{c:'France',n:1,pct:8}].map(g=>(
                <div key={g.c} style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                  <div style={{width:60,height:5,borderRadius:3,background:'rgba(255,255,255,0.06)',overflow:'hidden',flex:'none'}}>
                    <div style={{width:`${g.pct}%`,height:'100%',borderRadius:3,background:blue}}/>
                  </div>
                  <span style={{fontSize:12,color:'rgba(255,255,255,0.5)',flex:1}}>{g.c}</span>
                  <span style={{fontSize:12,fontFamily:'monospace',color:'rgba(255,255,255,0.35)'}}>{g.pct}%</span>
                </div>
              ))}
            </div>
            <div style={{flex:'1 1 200px',background:card,borderRadius:14,padding:'16px 20px',border:'1px solid rgba(255,255,255,0.04)'}}>
              <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.5)',marginBottom:10}}>Performance ratios</div>
              {[
                {l:'Revenue retention',v:'64%',d:'Net/Gross',c:amber},
                {l:'Cancellation rate',v:'24%',d:'5/21 bookings',c:red},
                {l:'Lead time',v:'46 days',d:'Avg booking advance',c:blue},
                {l:'Peak ADR',v:'€190',d:'NYE 29/12-01/01',c:green},
              ].map(r=>(
                <div key={r.l} style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}>
                  <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{r.l}</span>
                  <span style={{fontSize:13,fontFamily:'monospace',fontWeight:500,color:r.c}}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>)}

        {/* ══════ BOOKINGS TIMELINE ══════ */}
        {tab==='timeline' && (<div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{fontSize:15,fontWeight:600,color:'#fff'}}>Storico prenotazioni</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:4}}>Tutte le prenotazioni ordinate per data di check-in — earnings sono net payout</div>
          <div style={{background:card,borderRadius:14,border:'1px solid rgba(255,255,255,0.04)',overflow:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead>
                <tr style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                  {['Check-in','Check-out','Nights','ADR','Earnings','Status','Lead'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',color:'rgba(255,255,255,0.35)',fontWeight:600,fontSize:10,textTransform:'uppercase',letterSpacing:1}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BOOKINGS.map((b,i)=>{
                  const adr = b.earnings/b.nights;
                  const lead = Math.round((new Date(b.start)-new Date(b.booked))/(1000*60*60*24));
                  return (
                    <tr key={b.id} style={{borderBottom:'1px solid rgba(255,255,255,0.02)'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:11}}>{b.start}</td>
                      <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,0.4)'}}>{b.end}</td>
                      <td style={{padding:'10px 14px',fontWeight:500}}>{b.nights}</td>
                      <td style={{padding:'10px 14px',fontFamily:'monospace',color:adr>=100?green:adr>=80?amber:red}}>{eur(Math.round(adr))}</td>
                      <td style={{padding:'10px 14px',fontFamily:'monospace',fontWeight:600}}>{eur(Math.round(b.earnings))}</td>
                      <td style={{padding:'10px 14px'}}>
                        <span style={{padding:'2px 8px',borderRadius:12,fontSize:10,fontWeight:600,
                          background:b.status==='past'?`${green}15`:`${blue}15`,
                          color:b.status==='past'?green:blue,
                        }}>{b.status==='past'?'completed':'confirmed'}</span>
                      </td>
                      <td style={{padding:'10px 14px',fontFamily:'monospace',fontSize:11,color:'rgba(255,255,255,0.4)'}}>{lead}d</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.5)',marginTop:8}}>Cancellazioni ({CANCELLATIONS.length})</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {CANCELLATIONS.map(c=>(
              <div key={c.id} style={{padding:'8px 14px',borderRadius:10,background:'rgba(239,107,107,0.06)',border:'1px solid rgba(239,107,107,0.1)',fontSize:11}}>
                <span style={{color:red}}>{c.start.slice(5)}</span>
                <span style={{color:'rgba(255,255,255,0.3)'}}> · {c.nights}n · {c.origin}</span>
                {c.earnings && <span style={{color:amber}}> · €{c.earnings} penalty</span>}
              </div>
            ))}
          </div>
        </div>)}

        {/* ══════ FORECAST ══════ */}
        {tab==='forecast' && (<div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:'#fff'}}>Occupancy forecast — Apr-Dec 2026</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:2}}>Seasonal pattern 2025 + YoY growth trend + event calendar correlation</div>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'rgba(255,255,255,0.35)',cursor:'pointer'}}>
            <input type="checkbox" checked={showBand} onChange={e=>setShowBand(e.target.checked)} style={{accentColor:accent}}/> Confidence band
          </label>
          <div style={{background:card,borderRadius:14,padding:24,border:'1px solid rgba(255,255,255,0.04)'}}>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartCombined}>
                <defs>
                  <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={blue} stopOpacity={0.15}/><stop offset="100%" stopColor={blue} stopOpacity={0.01}/></linearGradient>
                  <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity={0.12}/><stop offset="100%" stopColor={accent} stopOpacity={0.01}/></linearGradient>
                  <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity={0.06}/><stop offset="100%" stopColor={accent} stopOpacity={0.01}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
                <XAxis dataKey="label" tick={{fill:'rgba(255,255,255,0.25)',fontSize:10,fontFamily:'monospace'}} interval={0}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.25)',fontSize:10}} tickFormatter={v=>pct(v)} domain={[0,1]}/>
                <Tooltip content={<CTooltip/>}/>
                <ReferenceLine x="Mar 26" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4"/>
                {showBand && <Area type="monotone" dataKey="forecastHi" stroke="none" fill="url(#gB)" connectNulls={false}/>}
                {showBand && <Area type="monotone" dataKey="forecastLo" stroke="none" fill={bg} connectNulls={false}/>}
                <Area type="monotone" dataKey="occ" name="Historical" stroke={blue} fill="url(#gH)" strokeWidth={2} dot={{r:3,fill:blue}} connectNulls={false}/>
                <Area type="monotone" dataKey="forecastOcc" name="Forecast" stroke={accent} fill="url(#gF)" strokeWidth={2} strokeDasharray="6 3" dot={{r:3,fill:accent,strokeDasharray:''}} connectNulls={false}/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {/* EVENT CALENDAR */}
          <div style={{background:card,borderRadius:14,padding:20,border:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{fontSize:13,fontWeight:600,color:'#fff',marginBottom:12}}>Eventi Bassano / Veneto che influenzano la domanda</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:8}}>
              {EVENTS_BASSANO.map((e,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:8,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.04)'}}>
                  <div style={{width:8,height:8,borderRadius:4,flexShrink:0,background:{high:accent,medium:amber,low:'rgba(255,255,255,0.15)'}[e.impact]}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600}}>{e.name} <span style={{fontWeight:400,color:'rgba(255,255,255,0.25)'}}>· {['','Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'][e.month]}</span></div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>{e.desc}</div>
                  </div>
                  <span style={{padding:'2px 8px',borderRadius:12,fontSize:9,fontWeight:600,textTransform:'uppercase',
                    background:{high:`${accent}15`,medium:`${amber}15`,low:'rgba(255,255,255,0.04)'}[e.impact],
                    color:{high:accent,medium:amber,low:'rgba(255,255,255,0.3)'}[e.impact],
                  }}>{e.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>)}

        {/* ══════ INSIGHTS ══════ */}
        {tab==='insights' && (<div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:'#fff'}}>AI insights — basati sui tuoi dati reali</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:2}}>Pattern detection, anomaly analysis, e raccomandazioni actionable</div>
          </div>
          {insights.map((ins,i)=>(
            <div key={i} style={{background:card,borderRadius:14,padding:'18px 22px',border:'1px solid rgba(255,255,255,0.04)',borderLeft:`3px solid ${ins.color}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16}}>
                <div style={{display:'flex',gap:12,alignItems:'flex-start',flex:1}}>
                  <div style={{width:30,height:30,borderRadius:8,background:`${ins.color}18`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:ins.color,flexShrink:0}}>{ins.icon}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:'#fff',lineHeight:1.4}}>{ins.title}</div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:6,lineHeight:1.6}}>{ins.desc}</div>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.2)',textTransform:'uppercase',letterSpacing:1}}>Confidence</div>
                  <div style={{fontSize:15,fontWeight:600,color:ins.color,fontFamily:'monospace',marginTop:2}}>{(ins.confidence*100).toFixed(0)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>)}

        {/* ══════ WHAT-IF ══════ */}
        {tab==='scenario' && (<div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:'#fff'}}>What-if scenario planner</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:2}}>Simula variazioni di prezzo e vedi l'impatto su revenue e occupancy (Apr-Dec 2026)</div>
          </div>
          <div style={{background:card,borderRadius:14,padding:'20px 24px',border:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
              <span style={{fontSize:13,color:'rgba(255,255,255,0.5)',minWidth:120}}>Variazione ADR</span>
              <input type="range" min={-40} max={40} value={scenarioPct} onChange={e=>setScenarioPct(+e.target.value)} style={{flex:1,accentColor:accent}}/>
              <span style={{fontFamily:'monospace',fontSize:18,fontWeight:600,minWidth:60,textAlign:'right',
                color:scenarioPct>0?green:scenarioPct<0?red:'rgba(255,255,255,0.4)'
              }}>{scenarioPct>0?'+':''}{scenarioPct}%</span>
            </div>
            <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
              {[
                {label:'Nuovo ADR',value:eur(Math.round(avgADR*(1+scenarioPct/100))),sub:`Base: ${eur(Math.round(avgADR))}`},
                {label:'Occ. media prevista',value:pct(scenarioData.reduce((s,d)=>s+d.scenarioOcc,0)/scenarioData.length),sub:`Base: ${pct(scenarioData.reduce((s,d)=>s+d.forecastOcc,0)/scenarioData.length)}`},
                {label:'Impatto revenue',value:`${scenarioData.reduce((s,d)=>s+d.revDelta,0)/scenarioData.length>0?'+':''}${(scenarioData.reduce((s,d)=>s+d.revDelta,0)/scenarioData.length).toFixed(1)}%`,
                  color:scenarioData.reduce((s,d)=>s+d.revDelta,0)>0?green:red},
              ].map((k,i)=>(
                <div key={i} style={{flex:'1 1 140px',background:'rgba(255,255,255,0.02)',borderRadius:10,padding:'12px 16px'}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:1}}>{k.label}</div>
                  <div style={{fontSize:22,fontWeight:600,color:k.color||'#fff',fontFamily:'monospace',marginTop:4}}>{k.value}</div>
                  {k.sub&&<div style={{fontSize:10,color:'rgba(255,255,255,0.2)',marginTop:2}}>{k.sub}</div>}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scenarioData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
                <XAxis dataKey="label" tick={{fill:'rgba(255,255,255,0.25)',fontSize:10,fontFamily:'monospace'}}/>
                <YAxis tick={{fill:'rgba(255,255,255,0.25)',fontSize:10}} tickFormatter={v=>`€${v}`}/>
                <Tooltip content={<CTooltip/>}/>
                <Bar dataKey="baseRev" name="Base €" fill="rgba(255,255,255,0.06)" radius={[4,4,0,0]} barSize={14}/>
                <Bar dataKey="scenarioRev" name="Scenario €" radius={[4,4,0,0]} barSize={14}>
                  {scenarioData.map((d,i)=>(<Cell key={i} fill={d.scenarioRev>=d.baseRev?`${green}99`:`${red}99`}/>))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{background:`${amber}08`,borderRadius:14,padding:'14px 18px',border:`1px dashed ${amber}22`,fontSize:12,color:'rgba(255,255,255,0.35)',lineHeight:1.7}}>
            Modello di elasticità: -0.35 (ogni +10% di prezzo riduce l'occupancy del ~3.5%). Basato su medie di mercato STR per proprietà simili in area turistica secondaria. L'elasticità reale per il tuo loft potrebbe differire — i periodi di alta domanda (luglio, NYE) sono tipicamente più inelastici.
          </div>
        </div>)}

      </div>
    </div>
  );
}
