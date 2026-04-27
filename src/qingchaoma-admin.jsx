import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://uijfszekpvgrykatozii.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpamZzemVrcHZncnlrYXRvemlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNzc3MjQsImV4cCI6MjA5MjY1MzcyNH0.7oZRNEIa3dzVE675q_Dn8BX_ys-zSXbMSdV1fisbOlo"
);

function transformOrder(row) {
  return {
    id:         row.id,
    orderNo:    row.order_no,
    items:      Array.isArray(row.items) ? row.items : [],
    total:      row.total_price,
    note:       row.note || "",
    status:     row.status,
    createdAt:  new Date(row.created_at),
    notifiedAt: row.notified_at ? new Date(row.notified_at) : null,
  };
}

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#08100a",
  card:     "#0f1c12",
  card2:    "#142018",
  header:   "#060e08",
  border:   "#1e3824",
  border2:  "#2a4a32",
  green1:   "#0a1a0e",
  green2:   "#142a1a",
  green3:   "#1e3e26",
  gold:     "#c9a84c",
  goldL:    "#dfc472",
  goldD:    "#9a7828",
  goldGlow: "rgba(201,168,76,0.2)",
  white:    "#ffffff",
  cream:    "#fdfaf0",
  dim:      "#6a9a72",
  dimmer:   "#344e3a",
  red:      "#c84028",
  redL:     "#e05030",
  redBg:    "rgba(200,64,40,0.15)",
  orange:   "#d08030",
  orangeBg: "rgba(208,128,48,0.15)",
  teal:     "#38b090",
  tealBg:   "rgba(56,176,144,0.15)",
};

// ─── MOCK DATA GENERATOR ───────────────────────────────────────────────────────
let _idCounter = 0;
const ITEM_POOL = [
  { name:"臭豆腐", series:"1.0", detail:"小麻", price:80 },
  { name:"鴨血",   series:"1.0", detail:"大麻", price:80 },
  { name:"臭豆腐", series:"2.0", detail:"小麻 · 加購王子麵", price:110 },
  { name:"鴨血",   series:"2.0", detail:"大麻 · 加購寬冬粉", price:110 },
  { name:"招牌綜合",series:"2.0", detail:"小麻 · 不加蔥花", price:100 },
  { name:"臭豆腐", series:"3.0", detail:"大麻 · 白飯 · 加大腸", price:175 },
  { name:"招牌綜合",series:"3.0", detail:"小麻 · 王子麵 · 升級湯頭：爆乳奶球", price:185 },
  { name:"綜合臭皮匠",series:"3.0", detail:"大麻 · 蒸煮麵 · 換全鴨血", price:180 },
  { name:"豆皮", series:"single", detail:"", price:20 },
  { name:"米血糕", series:"single", detail:"", price:20 },
];
const SERIES_COLOR = {
  "1.0": C.gold, "2.0": C.goldL, "3.0": "#f5e898",
  "single": "#68c878", "staple": "#58aac8",
};

function genOrder() {
  const count = Math.floor(Math.random() * 3) + 1;
  const items = Array.from({ length: count }, () => ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)]);
  const total = items.reduce((s, i) => s + i.price, 0);
  // complexity score for wait time calc
  const score = items.reduce((s, i) => {
    if (i.series === "3.0") return s + 2;
    if (i.series === "2.0") return s + 1.5;
    if (i.series === "1.0") return s + 1;
    return s + 0.5;
  }, 0);
  _idCounter++;
  return {
    id: _idCounter,
    orderNo: `A-${String(_idCounter).padStart(3,"0")}`,
    items,
    total,
    score,
    note: Math.random() > 0.7 ? "不加蔥花" : "",
    status: "pending",   // pending | cooking | done | notified
    createdAt: new Date(),
    notifiedAt: null,
  };
}

// seed some initial orders
const SEED = [
  { ...genOrder(), status:"cooking", createdAt: new Date(Date.now()-7*60000) },
  { ...genOrder(), status:"pending", createdAt: new Date(Date.now()-3*60000) },
  { ...genOrder(), status:"pending", createdAt: new Date(Date.now()-1*60000) },
  { ...genOrder(), status:"done",    createdAt: new Date(Date.now()-15*60000), notifiedAt: new Date(Date.now()-12*60000) },
  { ...genOrder(), status:"done",    createdAt: new Date(Date.now()-25*60000), notifiedAt: new Date(Date.now()-21*60000) },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function elapsed(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60) return `${s}秒前`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}分鐘前`;
  return `${Math.floor(m/60)}小時前`;
}

function useTimer() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);
}


// ─── AUDIO BEEP — 持續響 8 秒 ──────────────────────────────────────────────────
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 8;       // 總持續秒數
    const interval = 0.6;     // 每組提示音間隔
    const groups   = Math.floor(duration / interval);

    for (let i = 0; i < groups; i++) {
      const t0 = ctx.currentTime + i * interval;
      // 雙音提示（ding-dong 感）
      [[880, 0], [1100, 0.15]].forEach(([freq, offset]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq;
        o.type = "sine";
        g.gain.setValueAtTime(0, t0 + offset);
        g.gain.linearRampToValueAtTime(0.45, t0 + offset + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + offset + 0.25);
        o.start(t0 + offset);
        o.stop(t0 + offset + 0.3);
      });
    }
  } catch {}
}

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────
const STATUS = {
  pending:  { label:"待處理", color: C.red,    bg: C.redBg,    dot:"🔴" },
  cooking:  { label:"製作中", color: C.orange, bg: C.orangeBg, dot:"🟡" },
  done:     { label:"已完成", color: C.teal,   bg: C.tealBg,   dot:"🟢" },
  notified: { label:"已通知", color: C.dim,    bg: C.green2,   dot:"✅" },
};

// ─── ORDER CARD ────────────────────────────────────────────────────────────────
function OrderCard({ order, onCook, onNotify, onDone }) {
  useTimer();
  const st = STATUS[order.status];
  const isNew = (Date.now() - order.createdAt) < 30000 && order.status === "pending";

  return (
    <div style={{
      background: C.card, borderRadius:16, marginBottom:10,
      border:`1px solid ${order.status==="pending" ? C.red+"55" : order.status==="cooking" ? C.orange+"55" : C.border}`,
      overflow:"hidden", position:"relative",
      animation: isNew ? "slideIn 0.35s ease" : "none",
    }}>
      {/* Top accent line */}
      <div style={{ height:3, background:
        order.status==="pending" ? `linear-gradient(90deg,${C.red},${C.redL})` :
        order.status==="cooking" ? `linear-gradient(90deg,${C.orange},#e8a840)` :
        `linear-gradient(90deg,${C.teal},#50d8a8)`,
      }}/>

      <div style={{ padding:"12px 14px" }}>
        {/* Header row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:22, fontWeight:900, color:C.gold, letterSpacing:1 }}>{order.orderNo}</span>
            <span style={{ fontSize:10, padding:"3px 8px", borderRadius:6, background:st.bg, color:st.color, fontWeight:700 }}>
              {st.dot} {st.label}
            </span>
            {isNew && <span style={{ fontSize:10, background:"rgba(200,64,40,0.2)", color:C.redL, padding:"2px 7px", borderRadius:6, fontWeight:700, animation:"pulse 1s ease infinite" }}>NEW</span>}
          </div>
          <span style={{ fontSize:11, color:C.dimmer }}>{elapsed(order.createdAt)}</span>
        </div>

        {/* Items */}
        <div style={{ marginBottom:10, display:"flex", flexDirection:"column", gap:6 }}>
          {order.items.map((item, i) => {
            const accent = SERIES_COLOR[item.series] || C.gold;
            const seriesLabel = item.series === "single" ? "單點"
              : item.series === "staple" ? "主食"
              : item.series; // "1.0" / "2.0" / "3.0"
            return (
              <div key={i} style={{
                background: C.green1,
                border: `1px solid ${accent}33`,
                borderLeft: `3px solid ${accent}`,
                borderRadius: "0 10px 10px 0",
                padding: "8px 10px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                {/* Series badge */}
                <div style={{
                  flexShrink: 0,
                  background: accent + "22",
                  border: `1px solid ${accent}55`,
                  borderRadius: 6,
                  padding: "3px 7px",
                  minWidth: 38,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: accent, letterSpacing: 0.5 }}>
                    {seriesLabel}
                  </div>
                </div>

                {/* Name + detail */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: C.white, lineHeight: 1.2 }}>
                    {item.name}
                  </div>
                  {item.detail && (
                    <div style={{ fontSize: 11, color: C.dim, marginTop: 2, lineHeight: 1.4 }}>
                      {item.detail}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div style={{ fontSize: 13, fontWeight: 700, color: accent, flexShrink: 0 }}>
                  ${item.price}
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        {order.note && (
          <div style={{ background:C.green2, borderRadius:7, padding:"5px 10px", marginBottom:10, fontSize:12, color:C.goldL }}>
            📝 {order.note}
          </div>
        )}

        {/* Total + actions */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:15, fontWeight:800, color:C.gold }}>NT$ {order.total}</span>
          <div style={{ display:"flex", gap:6 }}>
            {order.status === "pending" && (
              <ActionBtn label="製作中" color={C.orange} onClick={onCook}/>
            )}
            {order.status === "cooking" && (
              <ActionBtn label="✓ 完成" color={C.teal} onClick={onDone}/>
            )}
            {order.status === "done" && (
              <ActionBtn label="📱 通知取餐" color={C.gold} bold onClick={onNotify}/>
            )}
            {order.status === "notified" && (
              <span style={{ fontSize:12, color:C.dim }}>已通知 {order.notifiedAt ? elapsed(order.notifiedAt) : ""}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ActionBtn = ({ label, color, onClick, bold }) => (
  <button onClick={onClick} style={{
    padding:"8px 14px", borderRadius:9,
    background: bold ? `linear-gradient(135deg,${C.goldD},${C.gold})` : color+"22",
    border:`1.5px solid ${color}55`,
    color: bold ? C.bg : color,
    fontSize:13, fontWeight:700, cursor:"pointer",
    whiteSpace:"nowrap",
  }}>{label}</button>
);

// ─── WAIT TIME PANEL (inline, for header) ──────────────────────────────────────
function WaitBar({ waitTime, setWaitTime, isPaused, setIsPaused }) {
  const presets = [5,10,15,20,30,45];
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:"flex", alignItems:"center", gap:6,
        background: isPaused ? "rgba(200,64,40,0.2)" : C.green2,
        border:`1px solid ${isPaused ? C.red+"55" : C.border}`,
        borderRadius:10, padding:"7px 12px", cursor:"pointer",
        color: isPaused ? C.redL : C.gold, fontSize:13, fontWeight:700,
      }}>
        {isPaused ? "⏸ 暫停中" : `⏱ ${waitTime}分鐘`}
        <span style={{ fontSize:10, color:C.dimmer }}>▾</span>
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 8px)", right:0,
          background:C.card2, borderRadius:14, padding:16,
          border:`1px solid ${C.border}`, zIndex:200,
          width:260, boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize:12, color:C.dim, marginBottom:10 }}>⏱ 等候時間</div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
            <button onClick={()=>setWaitTime(t=>Math.max(5,t-5))} style={adjBtn}>－</button>
            <div style={{ flex:1, textAlign:"center", fontSize:28, fontWeight:900, color:C.gold }}>{waitTime}<span style={{ fontSize:13, color:C.dim }}>分</span></div>
            <button onClick={()=>setWaitTime(t=>Math.min(90,t+5))} style={{...adjBtn, background:`linear-gradient(135deg,${C.goldD},${C.gold})`, color:C.bg, border:"none"}}>＋</button>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
            {presets.map(p=>(
              <button key={p} onClick={()=>setWaitTime(p)} style={{
                flex:1, minWidth:38, padding:"6px 4px", borderRadius:8, fontSize:12,
                background: waitTime===p ? C.gold+"28" : C.green1,
                border:`1px solid ${waitTime===p ? C.gold : C.border}`,
                color: waitTime===p ? C.gold : C.dim,
                cursor:"pointer", fontWeight: waitTime===p?700:400,
              }}>{p}</button>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
            <div style={{ fontSize:12, color:C.dim, marginBottom:8 }}>接單狀態</div>
            <button onClick={()=>setIsPaused(p=>!p)} style={{
              width:"100%", padding:"9px", borderRadius:9, border:"none",
              background: isPaused ? `linear-gradient(135deg,${C.goldD},${C.gold})` : "rgba(200,64,40,0.2)",
              color: isPaused ? C.bg : C.redL,
              fontSize:13, fontWeight:800, cursor:"pointer",
              outline: isPaused ? "none" : `1.5px solid ${C.red}55`,
            }}>
              {isPaused ? "▶ 恢復接單" : "⏸ 暫停接單"}
            </button>
          </div>
          <button onClick={()=>setOpen(false)} style={{ width:"100%", marginTop:8, padding:"7px", borderRadius:8, background:"transparent", border:`1px solid ${C.border}`, color:C.dimmer, fontSize:12, cursor:"pointer" }}>關閉</button>
        </div>
      )}
    </div>
  );
}

const adjBtn = {
  width:36, height:36, borderRadius:8,
  background:C.green2, border:`1px solid ${C.border}`,
  color:C.gold, fontSize:20, fontWeight:700, cursor:"pointer",
  display:"flex", alignItems:"center", justifyContent:"center",
};

// ─── STATS TAB ─────────────────────────────────────────────────────────────────
function StatsTab({ orders }) {
  const done = orders.filter(o=>o.status==="done"||o.status==="notified");
  const totalRevenue = done.reduce((s,o)=>s+o.total,0);
  const totalOrders  = done.length;
  const allItems     = done.flatMap(o=>o.items);
  const itemCounts   = {};
  allItems.forEach(i=>{ itemCounts[i.name]=(itemCounts[i.name]||0)+1; });
  const topItems = Object.entries(itemCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const avgOrder = totalOrders ? Math.round(totalRevenue/totalOrders) : 0;

  // hourly breakdown (mock based on createdAt)
  const hourly = {};
  done.forEach(o=>{
    const h = o.createdAt.getHours();
    hourly[h]=(hourly[h]||0)+o.total;
  });
  const hours = Object.keys(hourly).sort((a,b)=>a-b);
  const maxHourly = Math.max(...Object.values(hourly),1);

  return (
    <div style={{ padding:"12px 14px 32px" }}>
      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {[
          ["今日訂單", `${totalOrders} 張`, C.gold],
          ["今日營收", `NT$ ${totalRevenue.toLocaleString()}`, C.goldL],
          ["平均客單", `NT$ ${avgOrder}`, C.teal],
          ["待處理", `${orders.filter(o=>o.status==="pending").length} 張`, C.red],
        ].map(([label,val,color])=>(
          <div key={label} style={{ background:C.card, borderRadius:12, padding:"14px 14px", border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11, color:C.dim, marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:900, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Hourly bar chart */}
      {hours.length > 0 && (
        <div style={{ background:C.card, borderRadius:14, padding:"14px", border:`1px solid ${C.border}`, marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.cream, marginBottom:12 }}>各時段營收</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:80 }}>
            {hours.map(h=>(
              <div key={h} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{
                  width:"100%", borderRadius:"4px 4px 0 0",
                  background:`linear-gradient(180deg,${C.gold},${C.goldD})`,
                  height:`${(hourly[h]/maxHourly)*72}px`, minHeight:4,
                  transition:"height 0.3s",
                }}/>
                <span style={{ fontSize:9, color:C.dimmer }}>{h}時</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top items */}
      {topItems.length > 0 && (
        <div style={{ background:C.card, borderRadius:14, padding:"14px", border:`1px solid ${C.border}`, marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.cream, marginBottom:12 }}>熱銷品項</div>
          {topItems.map(([name,count],i)=>(
            <div key={name} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <span style={{ fontSize:12, color:C.dimmer, minWidth:16 }}>#{i+1}</span>
              <span style={{ flex:1, fontSize:13, color:C.white }}>{name}</span>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ height:6, borderRadius:3, background:C.gold, width:`${(count/topItems[0][1])*80}px`, minWidth:4 }}/>
                <span style={{ fontSize:12, color:C.gold, fontWeight:700, minWidth:24 }}>{count}份</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Menu management teaser */}
      <div style={{ background:C.green2, borderRadius:14, padding:"14px", border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.cream, marginBottom:4 }}>🗂 菜單管理</div>
        <div style={{ fontSize:12, color:C.dim, lineHeight:1.7 }}>
          菜單編輯、品項上下架、價格調整<br/>
          <span style={{ color:C.gold }}>── 即將開放（串接 Supabase 後啟用）</span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
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
  const [orders,    setOrders]    = useState([]);
  const [tab,       setTab]       = useState("orders");
  const [waitTime,  setWaitTime]  = useState(15);
  const [isPaused,  setIsPaused]  = useState(false);
  const [newCount,  setNewCount]  = useState(0);
  const [loading,   setLoading]   = useState(true);

  // ── 初始載入今日訂單 + 店家設定 ──────────────────────────────
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 今日訂單
    supabase.from("orders").select("*")
      .gte("created_at", today + "T00:00:00+08:00")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setOrders(data.map(transformOrder));
        setLoading(false);
      });

    // 店家設定
    supabase.from("store_settings").select("*")
      .then(({ data }) => {
        if (!data) return;
        data.forEach(({ key, value }) => {
          if (key === "wait_time") setWaitTime(Number(value));
          if (key === "is_paused") setIsPaused(value === "true");
        });
      });

    // ── Realtime：新訂單進來 ─────────────────────────────────
    const ch = supabase.channel("admin_realtime")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        ({ new: row }) => {
          setOrders(prev => [...prev, transformOrder(row)]);
          setNewCount(n => n + 1);
          playBeep();
        }
      )
      // 訂單狀態更新（另一個視窗或未來 LINE webhook 更新）
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        ({ new: row }) => {
          setOrders(prev => prev.map(o => o.id === row.id ? transformOrder(row) : o));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, []);

  // 自動清除新單提示
  useEffect(() => {
    if (newCount > 0) {
      const t = setTimeout(() => setNewCount(0), 5000);
      return () => clearTimeout(t);
    }
  }, [newCount]);

  // ── 更新訂單狀態 → 寫入 Supabase ──────────────────────────
  const updateStatus = useCallback(async (id, status) => {
    const patch = {
      status,
      ...(status === "notified" ? { notified_at: new Date().toISOString() } : {}),
    };
    await supabase.from("orders").update(patch).eq("id", id);
    // Realtime UPDATE 事件會自動更新 state，不需要手動 setOrders
  }, []);

  // ── 店家設定同步到 Supabase ────────────────────────────────
  const handleSetWaitTime = useCallback(async (val) => {
    setWaitTime(val);
    await supabase.from("store_settings").update({ value: String(val) }).eq("key", "wait_time");
  }, []);

  const handleSetPaused = useCallback(async (val) => {
    const next = typeof val === "function" ? val(isPaused) : val;
    setIsPaused(next);
    await supabase.from("store_settings").update({ value: String(next) }).eq("key", "is_paused");
  }, [isPaused]);

  const pending  = orders
    .filter(o=>o.status==="pending"||o.status==="cooking")
    .sort((a,b)=>a.createdAt - b.createdAt);   // 最舊的在最上面（優先出單）
  const done     = orders.filter(o=>o.status==="done"||o.status==="notified");

  const TABS = [
    { key:"orders", label:"待處理", badge: pending.filter(o=>o.status==="pending").length },
    { key:"done",   label:"已完成", badge: done.filter(o=>o.status==="done").length },
    { key:"stats",  label:"今日統計", badge: 0 },
  ];

  if (loading) return (
    <div style={{ background:C.bg, height:"100dvh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'PingFang TC','Noto Sans TC',sans-serif" }}>
      <div style={{ fontSize:36, marginBottom:16 }}>🍜</div>
      <div style={{ fontSize:14, color:C.dim }}>載入訂單中...</div>
    </div>
  );

  return (
    <div style={{ background:C.bg, height:"100dvh", maxWidth: isLandscape ? "100%" : 480, margin:"0 auto", fontFamily:"'PingFang TC','Noto Sans TC',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { display:none; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background:C.header, borderBottom:`1px solid ${C.border}`, flexShrink:0, zIndex:100 }}>
        {/* Top bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px 12px" }}>
          <div>
            <div style={{ fontSize:9, color:C.gold, letterSpacing:4, marginBottom:3, opacity:0.8 }}>STORE DASHBOARD</div>
            <div style={{ fontSize:20, fontWeight:900, color:C.white, letterSpacing:2 }}>青朝麻 東湖店</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {/* New order flash */}
            {newCount>0 && (
              <div style={{ background:C.redBg, border:`1px solid ${C.red}55`, borderRadius:8, padding:"5px 10px", animation:"pulse 0.8s ease infinite" }}>
                <span style={{ fontSize:12, color:C.redL, fontWeight:800 }}>+{newCount} 新單！</span>
              </div>
            )}
            <WaitBar waitTime={waitTime} setWaitTime={handleSetWaitTime} isPaused={isPaused} setIsPaused={handleSetPaused}/>
          </div>
        </div>

        {/* Pause banner */}
        {isPaused && (
          <div style={{ background:"rgba(200,64,40,0.18)", padding:"7px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:`1px solid ${C.red}33` }}>
            <span style={{ fontSize:12, color:C.redL, fontWeight:700 }}>⏸ 已暫停接單</span>
            <button onClick={()=>handleSetPaused(false)} style={{ background:C.redBg, border:`1px solid ${C.red}55`, borderRadius:6, color:C.redL, fontSize:11, padding:"3px 10px", cursor:"pointer" }}>恢復接單</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:"flex", borderTop:`1px solid ${C.border}` }}>
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{
              flex:1, padding:"10px 4px", background:"none", border:"none",
              borderBottom: tab===t.key ? `2px solid ${C.gold}` : "2px solid transparent",
              color: tab===t.key ? C.gold : C.dimmer,
              fontSize:12, fontWeight: tab===t.key?700:400,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5,
            }}>
              {t.label}
              {t.badge>0&&(
                <span style={{ background: t.key==="orders"?C.red:C.teal, color:"#fff", borderRadius:20, fontSize:10, padding:"1px 6px", fontWeight:800 }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:70 }}>

      {/* ── ORDER WALL ── */}
      {tab==="orders" && (
        <div style={{ padding:"10px 12px" }}>
          {pending.length===0 ? (
            <EmptyState icon="✅" msg="目前沒有待處理訂單" sub="新訂單會在這裡即時顯示"/>
          ) : (
            pending.map(o=>(
              <OrderCard key={o.id} order={o}
                onCook={()=>updateStatus(o.id,"cooking")}
                onDone={()=>updateStatus(o.id,"done")}
                onNotify={()=>updateStatus(o.id,"notified")}
              />
            ))
          )}
        </div>
      )}

      {/* ── DONE WALL ── */}
      {tab==="done" && (
        <div style={{ padding:"10px 12px" }}>
          {/* Quick action: notify all done */}
          {done.filter(o=>o.status==="done").length>0&&(
            <button onClick={()=>done.filter(o=>o.status==="done").forEach(o=>updateStatus(o.id,"notified"))}
              style={{
                width:"100%", marginBottom:12, padding:"12px",
                background:`linear-gradient(135deg,${C.goldD},${C.gold})`,
                border:"none", borderRadius:12, color:C.bg,
                fontSize:13, fontWeight:800, cursor:"pointer",
              }}>
              📱 一鍵通知所有已完成訂單（{done.filter(o=>o.status==="done").length}張）
            </button>
          )}
          {done.length===0 ? (
            <EmptyState icon="🍜" msg="尚無完成訂單" sub="完成製作後點擊「✓ 完成」即可移至此處"/>
          ) : (
            done.map(o=>(
              <OrderCard key={o.id} order={o}
                onCook={()=>{}}
                onDone={()=>updateStatus(o.id,"done")}
                onNotify={()=>updateStatus(o.id,"notified")}
              />
            ))
          )}
        </div>
      )}

      {/* ── STATS ── */}
      {tab==="stats" && <StatsTab orders={orders}/>}

      </div>{/* end scrollable */}

      {/* ── BOTTOM SUMMARY BAR ── */}
      <div style={{ flexShrink:0, background:"rgba(8,16,10,0.98)", borderTop:`1px solid ${C.border}`, padding:"10px 16px", zIndex:50 }}>
        <div style={{ display:"flex", justifyContent:"space-around", alignItems:"center" }}>
          {[
            ["🔴 待處理", pending.filter(o=>o.status==="pending").length, C.red],
            ["🟡 製作中", pending.filter(o=>o.status==="cooking").length, C.orange],
            ["🟢 完成待領", done.filter(o=>o.status==="done").length, C.teal],
            ["✅ 已通知", done.filter(o=>o.status==="notified").length, C.dim],
          ].map(([label,count,color])=>(
            <div key={label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:900, color }}>{count}</div>
              <div style={{ fontSize:9, color:C.dimmer, marginTop:2, whiteSpace:"nowrap" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, msg, sub }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>{icon}</div>
      <div style={{ fontSize:16, fontWeight:700, color:C.dim, marginBottom:6 }}>{msg}</div>
      <div style={{ fontSize:12, color:C.dimmer }}>{sub}</div>
    </div>
  );
}
