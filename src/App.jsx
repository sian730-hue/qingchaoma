import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://uijfszekpvgrykatozii.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpamZzemVrcHZncnlrYXRvemlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzc3MjQsImV4cCI6MjA5MjY1MzcyNH0.7oZRNEIa3dzVE675q_Dn8BX_ys-zSXbMSdV1fisbOlo"
);

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  pageBg:    "#0e2114",   // lifted: deep forest green (not pitch black)
  cardBg:    "#162d1c",   // medium forest green
  headerBg:  "#0b1a0f",
  modalBg:   "#122518",
  inputBg:   "#0e2014",
  border:    "#254d30",
  border2:   "#1c3a24",
  green1:    "#0f2415",
  green2:    "#1c3d24",
  green3:    "#2a5535",
  greenText: "#5cb870",
  gold:      "#c9a84c",
  goldLight: "#dfc472",
  goldDark:  "#a07830",
  goldPale:  "#f0dfa0",
  goldGlow:  "rgba(201,168,76,0.22)",
  white:     "#ffffff",
  cream:     "#fdfaf0",
  yellow:    "#f5e898",
  dim:       "#80b088",
  dimmer:    "#3e6848",
  s10:       "#c9a84c",
  s20:       "#dfc472",
  s30:       "#f5e898",
  single:    "#68c878",
  staple:    "#58aac8",
};

// ─── 青花椒 SVG BACKGROUND ──────────────────────────────────────────────────────
function PepperBg() {
  // Stylised 青花椒 (Sichuan peppercorn) branch clusters as subtle SVG decorations
  const cluster = (x, y, r = 1, op = 0.13) => (
    <g key={`${x}-${y}`} transform={`translate(${x},${y}) scale(${r})`} opacity={op}>
      {/* Branch */}
      <path d="M0,0 Q8,-18 18,-30 Q26,-40 32,-50" stroke={C.gold} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M8,-18 Q-4,-24 -10,-30" stroke={C.gold} strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M18,-30 Q28,-26 34,-32" stroke={C.gold} strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Berries */}
      {[[18,-30],[10,-23],[26,-42],[32,-50],[34,-32],[-10,-30],[0,-14],[22,-36]].map(([bx,by],i)=>(
        <g key={i}>
          <circle cx={bx} cy={by} r="4" fill={C.gold} opacity="0.6"/>
          <circle cx={bx} cy={by} r="2.5" fill={C.goldLight} opacity="0.5"/>
          <circle cx={bx-1} cy={by-1} r="0.8" fill={C.goldPale} opacity="0.6"/>
          {/* Texture dots on berry */}
          <circle cx={bx+1.5} cy={by-1} r="0.5" fill="none" stroke={C.goldDark} strokeWidth="0.4" opacity="0.5"/>
          <circle cx={bx-1.2} cy={by+1.2} r="0.5" fill="none" stroke={C.goldDark} strokeWidth="0.4" opacity="0.5"/>
        </g>
      ))}
      {/* Leaves */}
      <ellipse cx="14" cy="-22" rx="5" ry="2.5" fill={C.green3} opacity="0.5" transform="rotate(-40,14,-22)"/>
      <ellipse cx="28" cy="-46" rx="4" ry="2" fill={C.green3} opacity="0.4" transform="rotate(-20,28,-46)"/>
    </g>
  );

  return (
    <svg style={{ position:"fixed", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0, overflow:"hidden" }} preserveAspectRatio="xMidYMid slice">
      {/* Top-right large cluster */}
      {cluster(340, 120, 1.8, 0.12)}
      {/* Top-left small */}
      {cluster(20, 60, 1.1, 0.09)}
      {/* Mid-left */}
      {cluster(-10, 340, 1.4, 0.10)}
      {/* Bottom-right */}
      {cluster(360, 620, 1.6, 0.11)}
      {/* Bottom-left */}
      {cluster(30, 700, 1.2, 0.08)}
      {/* Centre-right faint */}
      {cluster(380, 400, 1.0, 0.07)}
      {/* Top-centre */}
      {cluster(180, 30, 0.9, 0.07)}

      {/* Scattered single berries */}
      {[[60,200],[310,300],[150,500],[280,180],[40,480],[340,520],[200,650]].map(([x,y],i)=>(
        <g key={i} opacity="0.10">
          <circle cx={x} cy={y} r="3.5" fill={C.gold}/>
          <circle cx={x} cy={y} r="2.2" fill={C.goldLight}/>
          <circle cx={x-0.8} cy={y-0.8} r="0.7" fill={C.cream} opacity="0.5"/>
        </g>
      ))}

      {/* Subtle radial glow top-right */}
      <radialGradient id="glow1" cx="85%" cy="10%" r="40%">
        <stop offset="0%" stopColor={C.green3} stopOpacity="0.25"/>
        <stop offset="100%" stopColor={C.pageBg} stopOpacity="0"/>
      </radialGradient>
      <rect width="100%" height="100%" fill="url(#glow1)"/>

      {/* Subtle radial glow bottom-left */}
      <radialGradient id="glow2" cx="10%" cy="90%" r="35%">
        <stop offset="0%" stopColor={C.green2} stopOpacity="0.2"/>
        <stop offset="100%" stopColor={C.pageBg} stopOpacity="0"/>
      </radialGradient>
      <rect width="100%" height="100%" fill="url(#glow2)"/>
    </svg>
  );
}

// ─── MENU DATA ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["1.0 嘗鮮小品","2.0 經典系列","3.0 大盛系列","單點","主食"];

const MENU = {
  "1.0 嘗鮮小品": [
    { id:"s1", name:"臭豆腐", sub:"2塊", price:80, series:"1.0",
      options:{ spicy:true, addStaple:false, staple:false, upgradeStaple:false, upgradeSoup:false, addOns:false, swap:false, removeToppings:true }},
    { id:"s2", name:"鴨血",   sub:"8塊", price:80, series:"1.0",
      options:{ spicy:true, addStaple:false, staple:false, upgradeStaple:false, upgradeSoup:false, addOns:false, swap:false, removeToppings:true }},
  ],
  "2.0 經典系列": [
    { id:"c1", name:"臭豆腐",   sub:"",             price:95,  series:"2.0",
      options:{ spicy:true, addStaple:true, staple:false, upgradeStaple:true, upgradeSoup:true, addOns:false, swap:false, removeToppings:true }},
    { id:"c2", name:"鴨血",     sub:"",             price:95,  series:"2.0",
      options:{ spicy:true, addStaple:true, staple:false, upgradeStaple:true, upgradeSoup:true, addOns:false, swap:false, removeToppings:true }},
    { id:"c3", name:"招牌綜合", sub:"臭豆腐＋鴨血", price:100, series:"2.0",
      options:{ spicy:true, addStaple:true, staple:false, upgradeStaple:true, upgradeSoup:true, addOns:false, swap:false, removeToppings:true }},
  ],
  "3.0 大盛系列": [
    { id:"b1", name:"臭豆腐",     sub:"",                  price:150, series:"3.0",
      options:{ spicy:true, staple:true, upgradeStaple:true, upgradeSoup:true, addOns:true, swap:false, removeToppings:true }},
    { id:"b2", name:"鴨血",       sub:"",                  price:150, series:"3.0",
      options:{ spicy:true, staple:true, upgradeStaple:true, upgradeSoup:true, addOns:true, swap:false, removeToppings:true }},
    { id:"b3", name:"招牌綜合",   sub:"",                  price:160, series:"3.0",
      options:{ spicy:true, staple:true, upgradeStaple:true, upgradeSoup:true, addOns:true, swap:false, removeToppings:true }},
    { id:"b4", name:"綜合臭皮匠", sub:"鴨血＋豆腐＋皮蛋", price:175, series:"3.0",
      options:{ spicy:true, staple:true, upgradeStaple:true, upgradeSoup:true, addOns:true, swap:true,  removeToppings:true }},
  ],
  "單點": [
    { id:"a1", name:"豆皮",     price:20, series:"single" },
    { id:"a2", name:"米血糕",   price:20, series:"single" },
    { id:"a3", name:"時令蔬菜", price:25, series:"single" },
    { id:"a4", name:"松花皮蛋", price:25, series:"single" },
    { id:"a5", name:"老油條",   price:40, series:"single" },
    { id:"a6", name:"豬肉片",   sub:"100g", price:50, series:"single" },
  ],
  "主食": [
    { id:"r1", name:"白飯",     price:20, series:"staple" },
    { id:"r2", name:"冬粉",     price:20, series:"staple" },
    { id:"r3", name:"王子麵",   price:20, series:"staple" },
    { id:"r4", name:"蒸煮麵",   price:25, series:"staple" },
    { id:"r5", name:"螺螄米粉", price:30, series:"staple" },
  ],
};

const STAPLE_OPTIONS  = ["王子麵","寬冬粉","白飯"];
const ADD_ONS         = [{name:"大腸",price:25},{name:"牛肚",price:25},{name:"豬肉片",price:25}];
const UPGRADE_SOUP    = [{name:"爆乳奶球",price:10},{name:"雙倍奶球",price:20}];
const UPGRADE_STAPLE  = [{name:"蒸煮麵",price:5},{name:"潮麻螺螄米粉",price:10}];
const TOPPINGS        = ["青辣椒","蔥花","椒麻醬"];

const SERIES_META = {
  "1.0":    { accent:C.s10,    bg:"#182a10", label:"1.0 嘗鮮" },
  "2.0":    { accent:C.s20,    bg:"#1e2c10", label:"2.0 經典" },
  "3.0":    { accent:C.s30,    bg:"#1e3014", label:"3.0 大盛" },
  "single": { accent:C.single, bg:"#122810", label:"單點"     },
  "staple": { accent:C.staple, bg:"#101e28", label:"主食"     },
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function calcPrice(item, {addStaple, upgradeSoup, upgradeStaple, addOns}) {
  let p = item.price;
  if (addStaple)     p += 15;
  if (upgradeSoup)   p += upgradeSoup.price;
  if (upgradeStaple) p += upgradeStaple.price;
  if (addOns)        p += addOns.reduce((s,a)=>s+a.price,0);
  return p;
}

function summarise(opts) {
  const parts = [];
  if (opts.spicy) parts.push(opts.spicy);

  // 升級主食時，只顯示升級後的主食名稱，不重複顯示原始主食
  if (opts.upgradeStaple) {
    if (opts.staple)    parts.push(`${opts.upgradeStaple.name}（升級主食）`);
    if (opts.addStaple) parts.push(`加購${opts.upgradeStaple.name}（升級）`);
  } else {
    if (opts.staple)    parts.push(opts.staple);
    if (opts.addStaple) parts.push(`加購${opts.addStaple} +$15`);
  }

  if (opts.swap)                  parts.push(`更換：${opts.swap}`);
  if (opts.addOns?.length)        parts.push(opts.addOns.map(a=>a.name).join("、"));
  if (opts.upgradeSoup)           parts.push(`升級湯頭：${opts.upgradeSoup.name}`);
  if (opts.removeTopping?.length) parts.push(`不加：${opts.removeTopping.join("、")}`);
  return parts.join(" · ") || "無特殊備註";
}

// ─── UI ATOMS ──────────────────────────────────────────────────────────────────
const Chip = ({label, selected, onClick, accent=C.gold, multi, icon}) => (
  <button onClick={onClick} style={{
    padding:"9px 15px", borderRadius:10,
    background: selected ? accent+"28" : C.cardBg,
    border:`1.5px solid ${selected ? accent : C.border}`,
    color: selected ? accent : C.dim,
    fontSize:13, fontWeight: selected?700:400,
    cursor:"pointer", transition:"all 0.15s",
    display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap",
  }}>
    {icon&&<span>{icon}</span>}
    {label}
    {multi&&selected&&<span style={{fontSize:10}}>✓</span>}
  </button>
);

const Sec = ({title, required, badge, error, children}) => (
  <div style={{marginTop:22}}>
    <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:10}}>
      <span style={{fontSize:14, fontWeight:700, color:C.cream}}>{title}</span>
      {required&&<span style={{fontSize:10, padding:"2px 7px", borderRadius:4,
        background: error?"#5a1a08":C.green2, color: error?"#ffb080":C.gold}}>
        {error?"← 請選擇":"必選"}
      </span>}
      {badge&&<span style={{fontSize:11, color:C.dimmer}}>{badge}</span>}
    </div>
    {children}
  </div>
);

const qSt = (primary) => ({
  width:30, height:30, borderRadius:8, border:"none",
  background: primary?C.gold:C.green2,
  color: primary?C.pageBg:C.gold,
  fontSize:18, fontWeight:700, cursor:"pointer",
  display:"flex", alignItems:"center", justifyContent:"center",
});

// ─── OPTION MODAL ──────────────────────────────────────────────────────────────
function OptionModal({item, onClose, onAddToCart}) {
  const opts = item.options||{};
  const meta = SERIES_META[item.series]||SERIES_META["1.0"];

  const [spicy,         setSpicy]         = useState("");
  const [staple,        setStaple]        = useState("");
  const [addStaple,     setAddStaple]     = useState("");
  const [swap,          setSwap]          = useState("");
  const [addOns,        setAddOns]        = useState([]);
  const [upgradeSoup,   setUpgradeSoup]   = useState(null);
  const [upgradeStaple, setUpgradeStaple] = useState(null);
  const [removeTopping, setRemoveTopping] = useState([]);
  const [qty,           setQty]           = useState(1);
  const [errors,        setErrors]        = useState({});

  const unitPrice  = calcPrice(item,{addStaple:addStaple?1:0, upgradeSoup, upgradeStaple, addOns});
  const totalPrice = unitPrice*qty;

  const toggleAddOn  = a => setAddOns(p=>p.some(x=>x.name===a.name)?p.filter(x=>x.name!==a.name):[...p,a]);
  const toggleRemove = t => setRemoveTopping(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t]);

  const handleAdd = () => {
    const e={};
    if (opts.spicy  && !spicy)  e.spicy=true;
    if (opts.staple && !staple) e.staple=true;
    if (Object.keys(e).length){setErrors(e);return;}
    onAddToCart({item, qty, unitPrice, opts:{spicy,staple,addStaple,swap,addOns,upgradeSoup,upgradeStaple,removeTopping}});
    onClose();
  };

  // 2.0 shows upgradeStaple when addStaple chosen; 3.0 shows when staple chosen
  const showUpgradeStaple = opts.upgradeStaple && (staple || addStaple);

  return (
    <div style={{position:"fixed",inset:0,zIndex:200}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.72)"}}/>
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        maxHeight:"91vh", background:C.modalBg,
        borderRadius:"22px 22px 0 0",
        border:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column",
        boxShadow:`0 -8px 40px rgba(0,0,0,0.5)`,
      }}>
        {/* Header */}
        <div style={{
          background:`linear-gradient(160deg,${meta.bg} 0%,${C.modalBg} 100%)`,
          padding:"20px 20px 16px",
          borderBottom:`1px solid ${C.border}`,
          borderRadius:"22px 22px 0 0", flexShrink:0,
        }}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:10,color:meta.accent,letterSpacing:4,marginBottom:5}}>{meta.label}</div>
              <div style={{fontSize:24,fontWeight:900,color:C.white}}>{item.name}</div>
              {item.sub&&<div style={{fontSize:12,color:C.dim,marginTop:3}}>{item.sub}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:22,fontWeight:900,color:meta.accent}}>${item.price}</div>
              <button onClick={onClose} style={{background:"none",border:"none",color:C.dimmer,fontSize:22,cursor:"pointer",marginTop:6,display:"block",marginLeft:"auto"}}>✕</button>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{flex:1,overflowY:"auto",padding:"4px 18px 120px"}}>

          {/* 辣度 */}
          {opts.spicy&&(
            <Sec title="辣度選擇" required error={errors.spicy}>
              <div style={{display:"flex",gap:10}}>
                <Chip label="小麻" icon="🌶️" selected={spicy==="小麻"} accent={C.gold}
                  onClick={()=>{setSpicy("小麻");setErrors(e=>({...e,spicy:false}));}}/>
                <Chip label="大麻" icon="🔥" selected={spicy==="大麻"} accent={C.goldLight}
                  onClick={()=>{setSpicy("大麻");setErrors(e=>({...e,spicy:false}));}}/>
              </div>
            </Sec>
          )}

          {/* 主食必選（3.0） */}
          {opts.staple&&(
            <Sec title="主食選擇" required error={errors.staple}>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {STAPLE_OPTIONS.map(s=>(
                  <Chip key={s} label={s} selected={staple===s} accent={C.gold}
                    onClick={()=>{setStaple(s);setErrors(e=>({...e,staple:false}));setUpgradeStaple(null);}}/>
                ))}
              </div>
            </Sec>
          )}

          {/* 加購主食（2.0） */}
          {opts.addStaple&&(
            <Sec title="加購主食" badge="+$15（省$5）">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <Chip label="不加購" selected={!addStaple} accent={C.dimmer} onClick={()=>{setAddStaple("");setUpgradeStaple(null);}}/>
                {STAPLE_OPTIONS.map(s=>(
                  <Chip key={s} label={s} selected={addStaple===s} accent={C.gold}
                    onClick={()=>{setAddStaple(s);setUpgradeStaple(null);}}/>
                ))}
              </div>
            </Sec>
          )}

          {/* 更換配料（僅 b4 綜合臭皮匠） */}
          {opts.swap&&(
            <Sec title="更換配料" badge="擇一（可選）">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <Chip label="不更換" selected={!swap} accent={C.dimmer} onClick={()=>setSwap("")}/>
                <Chip label="全豆腐" selected={swap==="全豆腐"} accent={C.yellow} onClick={()=>setSwap(swap==="全豆腐"?"":"全豆腐")}/>
                <Chip label="全鴨血" selected={swap==="全鴨血"} accent={C.yellow} onClick={()=>setSwap(swap==="全鴨血"?"":"全鴨血")}/>
              </div>
            </Sec>
          )}

          {/* 超值加購（3.0） */}
          {opts.addOns&&(
            <Sec title="超值加購" badge="可複選">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {ADD_ONS.map(a=>(
                  <Chip key={a.name} label={`${a.name} +$${a.price}`}
                    selected={addOns.some(x=>x.name===a.name)}
                    accent={C.gold} multi onClick={()=>toggleAddOn(a)}/>
                ))}
              </div>
            </Sec>
          )}

          {/* 升級湯頭（2.0 & 3.0） */}
          {opts.upgradeSoup&&(
            <Sec title="升級湯頭" badge="擇一">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <Chip label="不升級" selected={!upgradeSoup} accent={C.dimmer} onClick={()=>setUpgradeSoup(null)}/>
                {UPGRADE_SOUP.map(u=>(
                  <Chip key={u.name} label={`${u.name} +$${u.price}`}
                    selected={upgradeSoup?.name===u.name} accent={C.goldLight}
                    onClick={()=>setUpgradeSoup(upgradeSoup?.name===u.name?null:u)}/>
                ))}
              </div>
            </Sec>
          )}

          {/* 升級主食（2.0需先加購主食；3.0需先選主食） */}
          {showUpgradeStaple&&(
            <Sec title="升級主食" badge="擇一">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <Chip label="不升級" selected={!upgradeStaple} accent={C.dimmer} onClick={()=>setUpgradeStaple(null)}/>
                {UPGRADE_STAPLE.map(u=>(
                  <Chip key={u.name} label={`${u.name} +$${u.price}`}
                    selected={upgradeStaple?.name===u.name} accent={C.yellow}
                    onClick={()=>setUpgradeStaple(upgradeStaple?.name===u.name?null:u)}/>
                ))}
              </div>
            </Sec>
          )}

          {/* 不加配料（1.0 & 2.0 & 3.0） */}
          {opts.removeToppings&&(
            <Sec title="不加配料" badge="可複選">
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {TOPPINGS.map(t=>(
                  <Chip key={t} label={t} selected={removeTopping.includes(t)}
                    accent={C.greenText} multi onClick={()=>toggleRemove(t)}/>
                ))}
              </div>
              <div style={{fontSize:11,color:C.dimmer,marginTop:8}}>
                ※ 預設附青辣椒、蔥花、椒麻醬，勾選後不加
              </div>
            </Sec>
          )}
        </div>

        {/* Add bar */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          padding:"14px 18px", background:C.modalBg,
          borderTop:`1px solid ${C.border}`,
          display:"flex", gap:12, alignItems:"center",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:10,background:C.green2,borderRadius:10,padding:"8px 12px"}}>
            <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={qSt(false)}>－</button>
            <span style={{color:C.cream,fontWeight:800,fontSize:16,minWidth:20,textAlign:"center"}}>{qty}</span>
            <button onClick={()=>setQty(q=>q+1)} style={qSt(true)}>＋</button>
          </div>
          <button onClick={handleAdd} style={{
            flex:1, padding:"14px 18px",
            background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,
            border:"none", borderRadius:12, color:C.pageBg,
            fontSize:15, fontWeight:900, cursor:"pointer",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            boxShadow:`0 4px 20px ${C.goldGlow}`,
          }}>
            <span>加入購物車</span>
            <span>NT$ {totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CART SCREEN ───────────────────────────────────────────────────────────────
function CartScreen({cartItems, onBack, onUpdateQty, onRemove, onSubmit, isPaused}) {
  const [note,setNote]=useState("");
  const total=cartItems.reduce((s,ci)=>s+ci.unitPrice*ci.qty,0);
  return (
    <div style={{background:C.pageBg,minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"'PingFang TC','Noto Sans TC',sans-serif",position:"relative"}}>
      <PepperBg/>
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",flex:1}}>
        <div style={{background:C.headerBg,padding:"16px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${C.border}`}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,fontSize:22,cursor:"pointer"}}>←</button>
          <div style={{fontSize:18,fontWeight:800,color:C.white}}>確認訂單</div>
          <div style={{marginLeft:"auto",fontSize:12,color:C.dimmer}}>{cartItems.length} 項</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 16px",paddingBottom:120}}>
          {cartItems.map((ci,i)=>{
            const meta=SERIES_META[ci.item.series]||SERIES_META["1.0"];
            return(
              <div key={i} style={{background:C.cardBg,borderRadius:14,padding:14,marginBottom:10,border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div style={{flex:1}}>
                    <span style={{fontSize:10,color:meta.accent,background:meta.bg,padding:"2px 7px",borderRadius:4,display:"inline-block",marginBottom:6}}>{meta.label}</span>
                    <div style={{fontSize:15,fontWeight:700,color:C.white,marginBottom:4}}>{ci.item.name}</div>
                    <div style={{fontSize:12,color:C.dim,lineHeight:1.6}}>{summarise(ci.opts)}</div>
                  </div>
                  <button onClick={()=>onRemove(i)} style={{background:"none",border:"none",color:C.dimmer,fontSize:18,cursor:"pointer"}}>✕</button>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,background:C.green2,borderRadius:8,padding:"6px 10px"}}>
                    <button onClick={()=>onUpdateQty(i,ci.qty-1)} style={qSt(false)}>－</button>
                    <span style={{color:C.cream,fontWeight:700,minWidth:16,textAlign:"center"}}>{ci.qty}</span>
                    <button onClick={()=>onUpdateQty(i,ci.qty+1)} style={qSt(true)}>＋</button>
                  </div>
                  <div style={{fontSize:16,fontWeight:800,color:C.gold}}>NT$ {ci.unitPrice*ci.qty}</div>
                </div>
              </div>
            );
          })}
          <div style={{background:C.cardBg,borderRadius:14,padding:14,marginTop:4,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:C.cream,marginBottom:8}}>📝 整單備註</div>
            <textarea value={note} onChange={e=>setNote(e.target.value)}
              placeholder="例：全部不要蔥花..."
              style={{width:"100%",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:8,padding:10,color:C.cream,fontSize:13,resize:"none",height:70,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          </div>
          <div style={{background:C.cardBg,borderRadius:14,padding:14,marginTop:10,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",paddingBottom:8}}>
              <span style={{color:C.dim,fontSize:13}}>小計</span>
              <span style={{color:C.cream,fontSize:13}}>NT$ {total}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:`1px solid ${C.border}`}}>
              <span style={{color:C.white,fontSize:16,fontWeight:800}}>合計</span>
              <span style={{color:C.gold,fontSize:18,fontWeight:900}}>NT$ {total}</span>
            </div>
            <div style={{fontSize:11,color:C.dimmer,marginTop:6}}>※ 現場現金付款</div>
          </div>
        </div>
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"12px 16px",background:"rgba(14,33,20,0.97)",borderTop:`1px solid ${C.border}`}}>
          {isPaused && (
            <div style={{ background:"rgba(180,50,20,0.15)", borderRadius:10, padding:"8px 14px", marginBottom:10, border:"1px solid rgba(180,50,20,0.3)" }}>
              <div style={{ fontSize:12, color:"#e08060", textAlign:"center" }}>⏸ 目前暫停接單，無法送出訂單</div>
            </div>
          )}
          <button onClick={()=>{ if(!isPaused) onSubmit(note); }} style={{
            width:"100%",padding:"15px 20px",
            background: isPaused ? C.green2 : `linear-gradient(135deg,${C.goldDark},${C.gold})`,
            border: isPaused ? `1px solid ${C.border}` : "none",
            borderRadius:14, color: isPaused ? C.dimmer : C.pageBg,
            fontSize:16,fontWeight:900,
            cursor: isPaused ? "not-allowed" : "pointer",
            display:"flex",justifyContent:"space-between",alignItems:"center",
            boxShadow: isPaused ? "none" : `0 4px 24px ${C.goldGlow}`,
            opacity: isPaused ? 0.6 : 1,
          }}>
            <span>{isPaused ? "⏸ 暫停接單中" : "確認送出訂單"}</span>
            <span>NT$ {total}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SUCCESS SCREEN ────────────────────────────────────────────────────────────
function SuccessScreen({orderNo, waitMin, total, onNewOrder}) {
  return (
    <div style={{background:C.pageBg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:28,textAlign:"center",fontFamily:"'PingFang TC','Noto Sans TC',sans-serif",position:"relative"}}>
      <PepperBg/>
      <div style={{position:"relative",zIndex:1,width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{fontSize:72,marginBottom:16}}>✅</div>
        <div style={{fontSize:11,color:C.gold,letterSpacing:5,marginBottom:8}}>ORDER RECEIVED</div>
        <div style={{fontSize:26,fontWeight:900,color:C.white,marginBottom:4}}>訂單已送出！</div>
        <div style={{fontSize:14,color:C.dim,marginBottom:28}}>請稍候，我們盡快為您準備</div>
        <div style={{width:"100%",background:C.cardBg,borderRadius:16,padding:"20px",border:`1px solid ${C.border}`,marginBottom:14}}>
          <div style={{fontSize:12,color:C.dim,marginBottom:4}}>取餐號碼</div>
          <div style={{fontSize:60,fontWeight:900,color:C.gold,letterSpacing:4,lineHeight:1}}>{orderNo}</div>
        </div>
        <div style={{width:"100%",background:C.cardBg,borderRadius:16,padding:"16px",border:`1px solid ${C.border}`,marginBottom:20}}>
          {[["預計等待",`約 ${waitMin} 分鐘`],["付款方式","現場現金"],["合計金額",`NT$ ${total}`]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.dim,fontSize:13}}>{k}</span>
              <span style={{color:C.cream,fontSize:13,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.green2,borderRadius:12,padding:"12px 16px",marginBottom:22,width:"100%",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,color:C.goldLight,lineHeight:1.7}}>
            📱 餐點完成後將透過 LINE 通知您<br/>請保持 LINE 通知開啟，10 分鐘內取餐
          </div>
        </div>
        <button onClick={onNewOrder} style={{width:"100%",padding:"13px 0",background:"transparent",border:`1.5px solid ${C.gold}`,borderRadius:12,color:C.gold,fontSize:14,fontWeight:700,cursor:"pointer"}}>
          繼續加點
        </button>
      </div>
    </div>
  );
}

// ─── ITEM CARDS ────────────────────────────────────────────────────────────────
function MainCard({item, onClick, cartCount}) {
  const meta=SERIES_META[item.series]||SERIES_META["1.0"];
  return (
    <div onClick={onClick} style={{
      background:C.cardBg, borderRadius:14, padding:"14px 16px", marginBottom:8,
      border:`1px solid ${cartCount>0?meta.accent+"55":C.border}`,
      cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center",
      transition:"border-color 0.2s", position:"relative", overflow:"hidden",
    }}>
      {cartCount>0&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:meta.accent}}/>}
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
          <span style={{fontSize:15,fontWeight:800,color:C.white}}>{item.name}</span>
          {item.sub&&<span style={{fontSize:10,color:C.dimmer}}>{item.sub}</span>}
        </div>
        <div style={{fontSize:11,color:C.dimmer}}>小麻 / 大麻</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {cartCount>0&&(
          <div style={{background:meta.accent+"22",color:meta.accent,border:`1px solid ${meta.accent}44`,borderRadius:20,padding:"2px 8px",fontSize:12,fontWeight:700}}>×{cartCount}</div>
        )}
        <div style={{fontSize:17,fontWeight:900,color:meta.accent}}>${item.price}</div>
        <div style={{width:30,height:30,borderRadius:8,background:meta.accent+"22",border:`1px solid ${meta.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",color:meta.accent,fontSize:18,fontWeight:700,flexShrink:0}}>＋</div>
      </div>
    </div>
  );
}

function SimpleCard({item, onClick, cartCount}) {
  const meta=SERIES_META[item.series]||SERIES_META["single"];
  return (
    <div onClick={onClick} style={{
      background:C.cardBg, borderRadius:12, padding:"13px", cursor:"pointer",
      border:`1px solid ${cartCount>0?meta.accent+"55":C.border}`,
      transition:"border-color 0.2s",
    }}>
      <div style={{fontSize:14,fontWeight:700,color:C.white}}>{item.name}</div>
      {item.sub&&<div style={{fontSize:11,color:C.dimmer,marginTop:2}}>{item.sub}</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
        <span style={{fontSize:15,fontWeight:900,color:meta.accent}}>${item.price}</span>
        <div style={{
          width:26,height:26,borderRadius:7,
          background:cartCount>0?meta.accent+"22":C.green2,
          border:`1px solid ${cartCount>0?meta.accent+"55":C.border}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          color:cartCount>0?meta.accent:C.gold,fontSize:15,fontWeight:700,
        }}>{cartCount>0?cartCount:"＋"}</div>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({ waitTime, setWaitTime, isPaused, setIsPaused, onClose }) {
  const presets = [5, 10, 15, 20, 30, 45];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:300 }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.75)" }}/>
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        background:C.modalBg, borderRadius:"22px 22px 0 0",
        border:`1px solid ${C.border}`,
        boxShadow:"0 -8px 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 8px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.border }}/>
        </div>
        <div style={{ padding:"0 20px 16px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:10, color:C.gold, letterSpacing:4, marginBottom:4 }}>STORE CONTROL</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.white }}>店家控制面板</div>
        </div>
        <div style={{ padding:"16px 20px 32px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* Pause toggle */}
          <div style={{ background:C.cardBg, borderRadius:14, padding:"16px", border:`1px solid ${isPaused?"#a03818":C.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: isPaused?12:0 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:C.white }}>接單狀態</div>
                <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>
                  {isPaused ? "目前暫停中，顧客無法送出訂單" : "目前正常接單中"}
                </div>
              </div>
              <button onClick={()=>setIsPaused(p=>!p)} style={{
                padding:"9px 18px", borderRadius:10, border:"none",
                fontWeight:800, fontSize:13, cursor:"pointer",
                background: isPaused ? `linear-gradient(135deg,${C.goldDark},${C.gold})` : "rgba(180,50,20,0.2)",
                color: isPaused ? C.pageBg : "#e06040",
                outline: isPaused ? "none" : `1.5px solid #a03818`,
              }}>
                {isPaused ? "▶ 恢復接單" : "⏸ 暫停接單"}
              </button>
            </div>
            {isPaused && (
              <div style={{ background:"rgba(180,50,20,0.14)", borderRadius:8, padding:"8px 12px", border:"1px solid rgba(180,50,20,0.3)" }}>
                <div style={{ fontSize:11, color:"#e08060", lineHeight:1.7 }}>
                  ⚠️ 暫停期間顧客看到「暫停接單」提示<br/>無法送出新訂單，現有訂單不受影響
                </div>
              </div>
            )}
          </div>

          {/* Wait time */}
          <div style={{ background:C.cardBg, borderRadius:14, padding:"16px", border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.white, marginBottom:14 }}>等候時間設定</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20, marginBottom:16 }}>
              <button onClick={()=>setWaitTime(t=>Math.max(5,t-5))} style={{
                width:44, height:44, borderRadius:10,
                background:C.green2, border:`1.5px solid ${C.border}`,
                color:C.gold, fontSize:22, fontWeight:700, cursor:"pointer",
              }}>－</button>
              <div style={{ textAlign:"center", minWidth:80 }}>
                <div style={{ fontSize:48, fontWeight:900, color:C.gold, lineHeight:1 }}>{waitTime}</div>
                <div style={{ fontSize:12, color:C.dimmer, marginTop:2 }}>分鐘</div>
              </div>
              <button onClick={()=>setWaitTime(t=>Math.min(90,t+5))} style={{
                width:44, height:44, borderRadius:10, border:"none",
                background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,
                color:C.pageBg, fontSize:22, fontWeight:700, cursor:"pointer",
              }}>＋</button>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {presets.map(p=>(
                <button key={p} onClick={()=>setWaitTime(p)} style={{
                  flex:1, minWidth:44, padding:"8px 4px",
                  background: waitTime===p ? C.gold+"28" : C.green2,
                  border:`1.5px solid ${waitTime===p ? C.gold : C.border}`,
                  borderRadius:9, color: waitTime===p ? C.gold : C.dim,
                  fontSize:13, fontWeight: waitTime===p?700:400,
                  cursor:"pointer", transition:"all 0.15s",
                }}>{p}分</button>
              ))}
            </div>
            <div style={{ fontSize:11, color:C.dimmer, marginTop:10, textAlign:"center" }}>
              每次調整立即顯示給顧客
            </div>
          </div>

          <button onClick={onClose} style={{
            width:"100%", padding:"13px 0", background:"transparent",
            border:`1.5px solid ${C.border}`, borderRadius:12,
            color:C.dim, fontSize:14, cursor:"pointer",
          }}>關閉</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
function useLandscape() {
  const [landscape, setLandscape] = useState(
    typeof window !== "undefined" && window.innerWidth > window.innerHeight
  );
  useEffect(() => {
    const handler = () => setLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);
    return () => { window.removeEventListener("resize", handler); window.removeEventListener("orientationchange", handler); };
  }, []);
  return landscape;
}

export default function App() {
  const isLandscape = useLandscape();
  const [screen,         setScreen]         = useState("menu");
  const [activeCategory, setActiveCategory] = useState("1.0 嘗鮮小品");
  const [selectedItem,   setSelectedItem]   = useState(null);
  const [cart,           setCart]           = useState([]);
  const [lastOrder,      setLastOrder]      = useState(null);
  const [waitTime,       setWaitTime]       = useState(15);
  const [isPaused,       setIsPaused]       = useState(false);
  const [showAdmin,      setShowAdmin]      = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const catRefs = useRef({});

  // ── 讀取店家設定 + 即時監聽變更 ──────────────────────────────
  useEffect(() => {
    // 初始讀取
    supabase.from("store_settings").select("*").then(({ data }) => {
      if (!data) return;
      data.forEach(({ key, value }) => {
        if (key === "wait_time") setWaitTime(Number(value));
        if (key === "is_paused") setIsPaused(value === "true");
      });
    });

    // 即時監聽店家改動等待時間 / 暫停狀態
    const ch = supabase.channel("store_settings_ch")
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "store_settings" },
        ({ new: row }) => {
          if (row.key === "wait_time") setWaitTime(Number(row.value));
          if (row.key === "is_paused") setIsPaused(row.value === "true");
        }
      ).subscribe();

    return () => supabase.removeChannel(ch);
  }, []);

  const totalItems = cart.reduce((s,ci)=>s+ci.qty,0);
  const totalPrice = cart.reduce((s,ci)=>s+ci.unitPrice*ci.qty,0);

  const addToCart  = entry => setCart(p=>[...p,entry]);
  const updateQty  = (i,q)  => { if(q<1)removeItem(i); else setCart(p=>p.map((ci,idx)=>idx===i?{...ci,qty:q}:ci)); };
  const removeItem = i      => setCart(p=>p.filter((_,idx)=>idx!==i));

  const handleItemClick = item => {
    if(item.series==="single"||item.series==="staple")
      addToCart({item,qty:1,opts:{},unitPrice:item.price});
    else
      setSelectedItem(item);
  };

  // ── 送出訂單 → 寫入 Supabase ─────────────────────────────────
  const handleSubmit = async (note) => {
    if (submitting || isPaused) return;
    setSubmitting(true);
    try {
      // 取得流水號（A-001 起）
      const { data: orderNo, error: rpcErr } = await supabase.rpc("get_next_order_no");
      if (rpcErr) throw rpcErr;

      // 整理品項格式存入 jsonb
      const items = cart.flatMap(ci =>
        Array.from({ length: ci.qty }, () => ({
          name:   ci.item.name,
          series: ci.item.series,
          detail: summarise(ci.opts),
          price:  ci.unitPrice,
        }))
      );

      const { error: insertErr } = await supabase.from("orders").insert({
        order_no:    orderNo,
        items,
        total_price: totalPrice,
        note:        note || "",
        status:      "pending",
      });
      if (insertErr) throw insertErr;

      setLastOrder({ orderNo, waitMin: waitTime, total: totalPrice });
      setCart([]);
      setScreen("success");
    } catch (err) {
      alert("訂單送出失敗，請重試\n" + err.message);
    } finally {
      setSubmitting(false);
    }
  };


  if(screen==="success"&&lastOrder)
    return <SuccessScreen {...lastOrder} onNewOrder={()=>{setLastOrder(null);setScreen("menu");}}/>;
  if(screen==="cart")
    return <CartScreen cartItems={cart} onBack={()=>setScreen("menu")} onUpdateQty={updateQty} onRemove={removeItem} onSubmit={handleSubmit} isPaused={isPaused} submitting={submitting}/>;

  return (
    <div style={{background:C.pageBg,minHeight:"100vh",maxWidth: isLandscape ? "100%" : 480,margin:"0 auto",fontFamily:"'PingFang TC','Noto Sans TC',sans-serif",position:"relative"}}>
      <PepperBg/>

      {/* ── HEADER ── */}
      <div style={{background:C.headerBg,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:50}}>
        {/* Pause banner */}
        {isPaused && (
          <div style={{ background:"rgba(180,50,20,0.9)", padding:"8px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#ffe0d0" }}>⏸ 目前暫停接單中</span>
            <button onClick={()=>setShowAdmin(true)} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:6, color:"#ffe0d0", fontSize:11, padding:"4px 10px", cursor:"pointer" }}>調整</button>
          </div>
        )}
        <div style={{
          padding:"18px 20px 14px",
          background:`linear-gradient(135deg,${C.green1} 0%,${C.headerBg} 65%)`,
          display:"flex",justifyContent:"space-between",alignItems:"center",
        }}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
              <div style={{height:1,width:16,background:C.gold,opacity:0.5}}/>
              <div style={{fontSize:9,color:C.gold,letterSpacing:4,opacity:0.8}}>青花椒麻辣臭豆腐鴨血</div>
              <div style={{height:1,width:16,background:C.gold,opacity:0.5}}/>
            </div>
            <div style={{fontSize:27,fontWeight:900,color:C.white,letterSpacing:3,lineHeight:1}}>青朝麻</div>
            <div style={{fontSize:11,color:C.dim,marginTop:4,letterSpacing:2}}>東湖店</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:C.dimmer,marginBottom:2}}>目前等待</div>
              <div style={{fontSize:20,fontWeight:900,color: isPaused?"#e06040":C.gold}}>
                {isPaused ? "暫停接單" : `約${waitTime}分鐘`}
              </div>
              <div style={{fontSize:10,color:C.dimmer,marginTop:3}}>現場現金付款</div>
            </div>
            {/* Gear button */}
            <button onClick={()=>setShowAdmin(true)} style={{
              background:C.green2, border:`1px solid ${C.border}`, borderRadius:8,
              color:C.dim, fontSize:14, padding:"4px 8px", cursor:"pointer",
              display:"flex", alignItems:"center", gap:4,
            }}>
              <span>⚙️</span>
              <span style={{ fontSize:10 }}>店家</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none",paddingLeft:6}}>
          {CATEGORIES.map(cat=>(
            <button key={cat} onClick={()=>{
              setActiveCategory(cat);
              catRefs.current[cat]?.scrollIntoView({behavior:"smooth",block:"start"});
            }} style={{
              flexShrink:0,padding:"10px 14px",
              background:"none",border:"none",
              borderBottom:activeCategory===cat?`2px solid ${C.gold}`:"2px solid transparent",
              color:activeCategory===cat?C.gold:C.dimmer,
              fontSize:12,fontWeight:activeCategory===cat?700:400,
              cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s",
            }}>{cat}</button>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{position:"relative",zIndex:1,padding:"8px 14px",paddingBottom:totalItems>0?100:24}}>
        {CATEGORIES.map(cat=>(
          <div key={cat} ref={el=>catRefs.current[cat]=el}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"18px 0 10px"}}>
              <div style={{flex:1,height:1,background:C.border}}/>
              <span style={{fontSize:11,color:C.gold,letterSpacing:3,whiteSpace:"nowrap"}}>{cat}</span>
              <div style={{flex:1,height:1,background:C.border}}/>
            </div>

            {cat==="2.0 經典系列"&&(
              <div style={{background:C.green2,borderRadius:8,padding:"8px 12px",marginBottom:10,border:`1px solid ${C.border}`}}>
                <span style={{fontSize:11,color:C.dim}}>內含：時令蔬菜、金針菇、豆芽菜、豆皮</span>
              </div>
            )}
            {cat==="3.0 大盛系列"&&(
              <div style={{background:C.green2,borderRadius:8,padding:"8px 12px",marginBottom:10,border:`1px solid ${C.border}`}}>
                <span style={{fontSize:11,color:C.dim,lineHeight:1.7,display:"block"}}>
                  內含：時令蔬菜、金針菇、豆芽菜、豆皮、鴨肉丸、九層塔花枝、米血糕、豬肉片（加拿大）＋主食
                </span>
              </div>
            )}

            {(cat==="單點"||cat==="主食")?(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {MENU[cat].map(item=>(
                  <SimpleCard key={item.id} item={item}
                    cartCount={cart.filter(ci=>ci.item.id===item.id).reduce((s,ci)=>s+ci.qty,0)}
                    onClick={()=>handleItemClick(item)}/>
                ))}
              </div>
            ):(
              MENU[cat].map(item=>(
                <MainCard key={item.id} item={item}
                  cartCount={cart.filter(ci=>ci.item.id===item.id).reduce((s,ci)=>s+ci.qty,0)}
                  onClick={()=>handleItemClick(item)}/>
              ))
            )}
          </div>
        ))}

        <div style={{textAlign:"center",padding:"24px 0 8px"}}>
          <div style={{fontSize:11,color:C.dimmer,lineHeight:1.9,background:C.cardBg,borderRadius:10,padding:"12px 16px",border:`1px solid ${C.border}`}}>
            ⚠️ 本店湯頭帶有「勁麻、小辣、微酸」<br/>比例固定，不提供客製化調味
          </div>
        </div>
      </div>

      {/* ── CART BAR ── */}
      {totalItems>0&&(
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,padding:"12px 16px",background:"rgba(14,33,20,0.97)",borderTop:`1px solid ${C.border}`,backdropFilter:"blur(8px)",zIndex:40}}>
          <button onClick={()=>setScreen("cart")} style={{
            width:"100%",padding:"14px 20px",
            background:`linear-gradient(135deg,${C.goldDark},${C.gold})`,
            border:"none",borderRadius:14,color:C.pageBg,
            fontSize:15,fontWeight:900,cursor:"pointer",
            display:"flex",justifyContent:"space-between",alignItems:"center",
            boxShadow:`0 4px 24px ${C.goldGlow}`,
          }}>
            <span style={{background:"rgba(0,0,0,0.2)",borderRadius:20,padding:"3px 11px",fontSize:13}}>{totalItems} 項</span>
            <span>查看購物車</span>
            <span>NT$ {totalPrice}</span>
          </button>
        </div>
      )}

      {/* ── PAUSE OVERLAY ── */}
      {isPaused && (
        <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", zIndex:45, maxWidth:480, width:"100%", padding:"0 16px", pointerEvents:"none" }}>
          <div style={{ background:"rgba(120,30,10,0.92)", borderRadius:14, padding:"14px 18px", border:"1px solid rgba(200,60,20,0.4)", backdropFilter:"blur(6px)" }}>
            <div style={{ fontSize:15, fontWeight:800, color:"#ffd0b0", marginBottom:4 }}>⏸ 目前暫停接單</div>
            <div style={{ fontSize:12, color:"#e09070" }}>非常抱歉，目前單量較多，請稍後再試</div>
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      {selectedItem&&(
        <OptionModal item={selectedItem} onClose={()=>setSelectedItem(null)} onAddToCart={addToCart}/>
      )}

      {/* ── ADMIN PANEL ── */}
      {showAdmin&&(
        <AdminPanel
          waitTime={waitTime} setWaitTime={setWaitTime}
          isPaused={isPaused} setIsPaused={setIsPaused}
          onClose={()=>setShowAdmin(false)}
        />
      )}
    </div>
  );
}
