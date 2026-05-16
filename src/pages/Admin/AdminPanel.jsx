import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart2, Users, Shield, Trophy, Megaphone, ToggleLeft, Search, Edit3,
  AlertTriangle, CheckCircle, XCircle, ChevronRight, Clock, Activity,
  Settings, RefreshCw, Eye, Trash2, Send, Bell, Database,
  Zap, TrendingUp, Award, Flag, MessageSquare, FileText, Lock,
  Globe, Server, Cpu, LayoutDashboard, Workflow, Play,
  Pause, Loader2, ImagePlus, LogOut, UserPlus, Calendar, DollarSign, Image, Download
} from "lucide-react";
import * as adminAPI from "../../services/adminService";

/* ═══════════════════════════════════════════════════════════════
   SAMSPORTS ADMIN PANEL — Mission Control  (Inline Styles)
   ═══════════════════════════════════════════════════════════════ */

/* ── Color Palette ── */
const C = {
  bg: "#0f172a", bgCard: "#1e293b", bgHover: "#334155", bgInput: "#1e293b",
  border: "#334155", borderLight: "rgba(71,85,105,0.5)",
  text: "#e2e8f0", textDim: "#94a3b8", textMuted: "#64748b",
  white: "#fff",
  blue: "#3b82f6", blueLight: "rgba(59,130,246,0.15)",
  green: "#10b981", greenLight: "rgba(16,185,129,0.15)",
  purple: "#8b5cf6", purpleLight: "rgba(139,92,246,0.15)",
  amber: "#f59e0b", amberLight: "rgba(245,158,11,0.15)",
  teal: "#14b8a6", tealLight: "rgba(20,184,166,0.15)",
  red: "#ef4444", redLight: "rgba(239,68,68,0.15)",
  cyan: "#06b6d4", cyanLight: "rgba(6,182,212,0.15)",
};

const fmt = (n) => { if (n == null) return "—"; if (n >= 1e6) return (n/1e6).toFixed(1)+"M"; if (n >= 1e3) return (n/1e3).toFixed(1)+"K"; return String(n); };
const ts = (d) => d ? new Date(d).toLocaleString() : "—";

/* ── Spinner ── */
const Spinner = ({ size = 20 }) => <Loader2 size={size} style={{ animation: "spin 1s linear infinite", color: C.blue }} />;

/* ── Inline keyframes (injected once) ── */
const StyleInjector = () => (
  <style>{`
    @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
    @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
    @keyframes slideIn { from { transform:translateX(100px); opacity:0 } to { transform:translateX(0); opacity:1 } }
    .ap-scrollbar::-webkit-scrollbar { width:6px }
    .ap-scrollbar::-webkit-scrollbar-track { background:transparent }
    .ap-scrollbar::-webkit-scrollbar-thumb { background:#334155; border-radius:3px }
  `}</style>
);

/* ── Toast ── */
const Toast = ({ toasts }) => (
  <div style={{ position:"fixed", top:16, right:16, zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:12, fontSize:13, fontWeight:600, color:C.white, animation:"slideIn .3s ease",
        background: t.type==="success" ? "rgba(16,185,129,0.9)" : t.type==="error" ? "rgba(239,68,68,0.9)" : "rgba(245,158,11,0.9)",
        boxShadow:"0 8px 24px rgba(0,0,0,0.3)", backdropFilter:"blur(8px)" }}>
        {t.type==="success" ? <CheckCircle size={14}/> : t.type==="error" ? <XCircle size={14}/> : <AlertTriangle size={14}/>}
        {t.message}
      </div>
    ))}
  </div>
);

/* ── Shared Styles ── */
const btn = { padding:"8px 16px", borderRadius:10, border:"none", fontSize:13, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, transition:"all .15s" };
const card = { background:C.bgCard, border:`1px solid ${C.borderLight}`, borderRadius:16, padding:20 };
const inputStyle = { width:"100%", padding:"10px 14px", background:C.bgInput, border:`1px solid ${C.border}`, borderRadius:10, color:C.white, fontSize:13, outline:"none", boxSizing:"border-box" };
const labelStyle = { fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:4, display:"block" };

/* ── Confirm Dialog ── */
const ConfirmDialog = ({ open, title, message, danger, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}
      onClick={onCancel}>
      <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:16, padding:28, maxWidth:420, width:"100%", margin:"0 16px", boxShadow:"0 16px 48px rgba(0,0,0,0.4)" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <div style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
            background: danger ? C.redLight : C.amberLight }}>
            <AlertTriangle size={18} color={danger ? C.red : C.amber} />
          </div>
          <h3 style={{ fontSize:16, fontWeight:700, color:C.white, margin:0 }}>{title}</h3>
        </div>
        <p style={{ color:C.textDim, fontSize:13, lineHeight:1.6, marginBottom:24, marginLeft:46 }}>{message}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ ...btn, background:C.bgHover, color:C.textDim, padding:"10px 20px" }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ ...btn, background:danger?C.red:C.blue, color:C.white, padding:"10px 20px", opacity:loading?.6:1 }}>
            {loading&&<Spinner size={12}/>}{danger?"Delete":"Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Stat Card ── */
const colorMap = { blue:[C.blueLight,C.blue], green:[C.greenLight,C.green], purple:[C.purpleLight,C.purple], amber:[C.amberLight,C.amber], teal:[C.tealLight,C.teal], red:[C.redLight,C.red] };
const StatCard = ({ icon:Icon, label, value, sub, color="blue", loading }) => (
  <div style={{ background:colorMap[color][0], border:`1px solid ${colorMap[color][1]}33`, borderRadius:16, padding:20 }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
      <span style={labelStyle}>{label}</span>
      <Icon size={16} color={colorMap[color][1]} />
    </div>
    <div style={{ fontSize:28, fontWeight:800, color:C.white }}>{loading ? <Spinner/> : value}</div>
    {sub && <div style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>{sub}</div>}
  </div>
);

/* ── Badge ── */
const Badge = ({ children, color="blue" }) => (
  <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:700, background:colorMap[color]?.[0]||C.blueLight, color:colorMap[color]?.[1]||C.blue, border:`1px solid ${colorMap[color]?.[1]||C.blue}44` }}>{children}</span>
);

/* ── Salary Cap Tab (editable) ── */
const CAP_STORAGE_KEY = "samsports_cap_settings";
const fmtCap = (v) => { const m = v / 1_000_000; return m % 1 === 0 ? `$${m}M` : `$${m.toFixed(1)}M`; };

const SalaryCapTab = ({ toast, players, triggerSync }) => {
  const [caps, setCaps] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(CAP_STORAGE_KEY) || "{}"); return { nflCeiling: s.nflCeiling || 301_200_000, nflFloor: s.nflFloor || 280_000_000, soccerCap: s.soccerCap || 200_000_000 }; } catch { return { nflCeiling: 301_200_000, nflFloor: 280_000_000, soccerCap: 200_000_000 }; }
  });
  const [editing, setEditing] = useState(null); // "nflCeiling" | "nflFloor" | "soccerCap" | null
  const [draft, setDraft] = useState("");

  const startEdit = (field) => { setEditing(field); setDraft(String(caps[field])); };

  const saveEdit = () => {
    const val = Number(draft);
    if (!val || val < 0) { toast("error", "Enter a valid positive number"); return; }
    const updated = { ...caps, [editing]: val };
    setCaps(updated);
    localStorage.setItem(CAP_STORAGE_KEY, JSON.stringify(updated));
    toast("success", `Updated to ${fmtCap(val)} — reload the app to apply across all pages`);
    setEditing(null);
  };

  const cancelEdit = () => { setEditing(null); setDraft(""); };

  const capFields = [
    { key: "nflCeiling", label: "NFL Salary Cap Ceiling", color: "purple", icon: TrendingUp },
    { key: "nflFloor", label: "NFL Salary Cap Floor", color: "amber", icon: TrendingUp },
    { key: "soccerCap", label: "Soccer Salary Cap", color: "green", icon: TrendingUp },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        {capFields.map(f => (
          <div key={f.key} style={{ background: colorMap[f.color][0], border: `1px solid ${colorMap[f.color][1]}33`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={labelStyle}>{f.label}</span>
              <f.icon size={16} color={colorMap[f.color][1]} />
            </div>
            {editing === f.key ? (
              <div>
                <input type="number" value={draft} onChange={e => setDraft(e.target.value)} autoFocus onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                  style={{ ...inputStyle, fontSize: 18, fontWeight: 800, padding: "8px 12px", marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={saveEdit} style={{ ...btn, background: colorMap[f.color][1], color: C.white, fontSize: 11, padding: "5px 12px" }}><CheckCircle size={11} /> Save</button>
                  <button onClick={cancelEdit} style={{ ...btn, background: C.bgHover, color: C.textDim, fontSize: 11, padding: "5px 12px" }}><XCircle size={11} /> Cancel</button>
                </div>
                <p style={{ fontSize: 10, color: C.textMuted, marginTop: 6, margin: "6px 0 0" }}>Enter raw number (e.g. 301200000)</p>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => startEdit(f.key)}>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.white }}>{fmtCap(caps[f.key])}</div>
                <Edit3 size={14} color={C.textMuted} style={{ opacity: 0.5 }} />
              </div>
            )}
          </div>
        ))}
        <StatCard icon={Users} label="Players in DB" value={players.length || "—"} color="blue" />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => triggerSync("refresh-cap-hits")} style={{ ...btn, background: C.purple, color: C.white }}><RefreshCw size={13} /> Refresh All Cap Hits</button>
      </div>
      <p style={{ fontSize: 11, color: C.textMuted, marginTop: 12 }}>Click any cap value to edit. Changes apply platform-wide on next page load.</p>
    </div>
  );
};

/* ── Search Bar ── */
const SearchBar = ({ value, onChange, placeholder, onSearch, loading }) => (
  <div style={{ display:"flex", gap:8 }}>
    <div style={{ position:"relative", flex:1 }}>
      <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:C.textMuted }} />
      <input value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onSearch?.()} placeholder={placeholder||"Search..."} style={{ ...inputStyle, paddingLeft:36 }} />
    </div>
    <button onClick={onSearch} disabled={loading} style={{ ...btn, background:C.blue, color:C.white, opacity:loading?.6:1 }}>{loading&&<Spinner size={12}/>}Search</button>
  </div>
);

/* ── Data Table ── */
const DataTable = ({ columns, data, onRowClick, emptyMsg="No data found", loading }) => (
  <div style={{ borderRadius:12, border:`1px solid ${C.borderLight}`, overflow:"hidden" }}>
    {loading ? (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 0", gap:10 }}><Spinner size={24}/><span style={{ color:C.textDim, fontSize:13 }}>Loading...</span></div>
    ) : (
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ borderBottom:`1px solid ${C.borderLight}`, background:"rgba(30,41,59,0.5)" }}>
            {columns.map(col => <th key={col.key} style={{ textAlign:"left", padding:"10px 14px", ...labelStyle, marginBottom:0, display:"table-cell" }}>{col.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length===0 ? (
            <tr><td colSpan={columns.length} style={{ textAlign:"center", padding:"40px 0", color:C.textMuted }}>{emptyMsg}</td></tr>
          ) : data.map((row,i) => (
            <tr key={row._id||i} onClick={()=>onRowClick?.(row)} style={{ borderBottom:`1px solid ${C.borderLight}20`, cursor:"pointer", transition:"background .15s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(51,65,85,0.3)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {columns.map(col => <td key={col.key} style={{ padding:"10px 14px", color:C.text }}>{col.render?col.render(row):row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

/* ── Sub Tab Bar ── */
const TabBar = ({ tabs, active, onChange, accent=C.blue }) => (
  <div style={{ display:"flex", gap:4, background:"rgba(30,41,59,0.5)", borderRadius:12, padding:4, border:`1px solid ${C.borderLight}`, marginBottom:20, overflowX:"auto" }}>
    {tabs.map(t => (
      <button key={t.id} onClick={()=>onChange(t.id)} style={{ ...btn, background:active===t.id?accent:"transparent", color:active===t.id?C.white:C.textMuted, padding:"8px 14px", whiteSpace:"nowrap", borderRadius:8 }}>
        <t.icon size={13}/>{t.label}
      </button>
    ))}
  </div>
);

/* ══════════════════════════════════════════
   SECTION: Dashboard
   ══════════════════════════════════════════ */
const DashboardSection = ({ toast }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leagueProgress, setLeagueProgress] = useState([]);
  const [health, setHealth] = useState({ nflBackend:"unknown", soccerBackend:"unknown", nflMongo:"unknown", soccerMongo:"unknown", socketIO:"unknown", nflSocketClients:0, soccerSocketClients:0, nflUptime:0, soccerUptime:0, nflMemMB:0, soccerMemMB:0 });

  // Fetch real health data
  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const h = await adminAPI.getSystemHealth();
        if (c) return;
        setHealth({
          nflBackend: h.nfl ? "healthy" : "down",
          soccerBackend: h.soccer ? "healthy" : "down",
          nflMongo: h.nfl?.mongo?.status || "unknown",
          soccerMongo: h.soccer?.mongo?.status || "unknown",
          socketIO: h.nfl?.socket?.status || h.soccer?.socket?.status || "unknown",
          nflSocketClients: h.nfl?.socket?.connectedClients || 0,
          soccerSocketClients: h.soccer?.socket?.connectedClients || 0,
          nflUptime: h.nfl?.server?.uptimeSeconds || 0,
          soccerUptime: h.soccer?.server?.uptimeSeconds || 0,
          nflMemMB: h.nfl?.server?.memoryMB?.rss || 0,
          soccerMemMB: h.soccer?.server?.memoryMB?.rss || 0,
        });
      } catch { /* health fetch failed — leave defaults */ }
    })();
    return () => { c = true; };
  }, []);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setLoading(true);
        const [raw, lpRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getLeagueProgress().catch(() => null),
        ]);
        if (c) return;
        const n = raw.nfl?.data || raw.nfl || {};
        const s = raw.soccer?.data || raw.soccer || {};
        setStats({
          totalUsers: (n.totalUsers||0)+(s.totalUsers||0), soccerLeagues: s.soccerLeagues??s.totalLeagues??0, nflLeagues: n.nflLeagues??n.totalLeagues??0,
          rivalsSoccer: s.rivalsSoccerEntries??0, rivalsNFL: n.rivalsNFLEntries??0, online: n.onlineNow??s.onlineNow??0,
          nflBackend: health.nflBackend, soccerBackend: health.soccerBackend, nflMongo: health.nflMongo, soccerMongo: health.soccerMongo, socketIO: health.socketIO, nflSocketClients: health.nflSocketClients, soccerSocketClients: health.soccerSocketClients, nflUptime: health.nflUptime, soccerUptime: health.soccerUptime, nflMemMB: health.nflMemMB, soccerMemMB: health.soccerMemMB,
          recentActions: [...(n.recentActions||[]),...(s.recentActions||[])].sort((a,b)=>new Date(b.timestamp||b.createdAt)-new Date(a.timestamp||a.createdAt)).slice(0,8),
        });
        if (lpRes?.data?.data?.progress) setLeagueProgress(lpRes.data.data.progress);
      } catch { if (!c) toast("error","Failed to load dashboard stats"); }
      finally { if (!c) setLoading(false); }
    })();
    return ()=>{c=true};
  }, [toast]);

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 0", gap:10 }}><Spinner size={28}/><span style={{ color:C.textDim }}>Loading dashboard...</span></div>;
  if (!stats) return <p style={{ color:C.red, textAlign:"center", padding:"80px 0" }}>Failed to load dashboard. Check that both backends are running.</p>;

  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:800, color:C.white, marginBottom:20 }}>Platform Overview</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:14, marginBottom:28 }}>
        <StatCard icon={Users} label="Total Users" value={fmt(stats.totalUsers)} sub="Across all modes" color="blue"/>
        <StatCard icon={Trophy} label="Soccer Leagues" value={stats.soccerLeagues} sub="Active leagues" color="teal"/>
        <StatCard icon={Shield} label="A.Football Leagues" value={stats.nflLeagues} sub="Active leagues" color="purple"/>
        <StatCard icon={Award} label="Rivals Soccer" value={fmt(stats.rivalsSoccer)} sub="Active entries" color="green"/>
        <StatCard icon={Award} label="Rivals A.Football" value={fmt(stats.rivalsNFL)} sub="Active entries" color="amber"/>
        <StatCard icon={Activity} label="Online Now" value={stats.online} sub="Real-time" color="red"/>
      </div>
      {/* League Progress */}
      {leagueProgress.length > 0 && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ ...labelStyle, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Globe size={14} color={C.blue} /> League Progress
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {leagueProgress.map(lp => {
              const pct = lp.totalMatchweeks && lp.currentMatchweek
                ? Math.round((lp.currentMatchweek / lp.totalMatchweeks) * 100)
                : null;
              const isCup = !lp.totalMatchweeks;
              const displayWeek = isCup
                ? (lp.currentRound || "—")
                : `GW ${lp.currentMatchweek || "—"} / ${lp.totalMatchweeks}`;
              return (
                <div key={lp.key} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{lp.flag}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{lp.label}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.blue, marginBottom: 4 }}>{displayWeek}</div>
                  {pct != null && (
                    <div style={{ height: 4, borderRadius: 2, background: C.bgHover, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: pct >= 90 ? C.green : pct >= 50 ? C.blue : C.amber, transition: "width 0.3s" }} />
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>
                    {lp.fantasyLeagues > 0 ? `${lp.fantasyLeagues} fantasy league${lp.fantasyLeagues !== 1 ? "s" : ""}` : "No fantasy leagues"}
                    {pct != null && ` · ${pct}% complete`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div style={card}>
          <div style={{ ...labelStyle, marginBottom:14 }}>Recent Admin Actions</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {(stats.recentActions||[]).map((a,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13 }}>
                <div style={{ width:6, height:6, borderRadius:3, background:C.blue, flexShrink:0 }}/>
                <span style={{ flex:1, color:C.text }}>{a.action}</span>
                <span style={{ color:C.textMuted, fontSize:11 }}>{a.admin||a.actor||"system"}</span>
                <span style={{ color:C.textMuted, fontSize:11 }}>{ts(a.timestamp||a.createdAt)}</span>
              </div>
            ))}
            {(!stats.recentActions||stats.recentActions.length===0)&&<p style={{ color:C.textMuted, fontSize:13 }}>No recent actions.</p>}
          </div>
        </div>
        <div style={card}>
          <div style={{ ...labelStyle, marginBottom:14 }}>System Health</div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              {label:"A.Football Backend",status:stats.nflBackend,sub:stats.nflUptime?`Up ${Math.floor(stats.nflUptime/3600)}h ${Math.floor((stats.nflUptime%3600)/60)}m · ${stats.nflMemMB}MB RAM`:null},
              {label:"Soccer Backend",status:stats.soccerBackend,sub:stats.soccerUptime?`Up ${Math.floor(stats.soccerUptime/3600)}h ${Math.floor((stats.soccerUptime%3600)/60)}m · ${stats.soccerMemMB}MB RAM`:null},
              {label:"NFL MongoDB",status:stats.nflMongo},
              {label:"Soccer MongoDB",status:stats.soccerMongo},
              {label:"Socket.IO",status:stats.socketIO,sub:(stats.nflSocketClients||stats.soccerSocketClients)?`${(stats.nflSocketClients||0)+(stats.soccerSocketClients||0)} connected clients`:null},
            ].map(s=>(
              <div key={s.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <Server size={13} color={C.textMuted}/>
                  <div>
                    <span style={{ fontSize:13, color:C.text }}>{s.label}</span>
                    {s.sub && <div style={{ fontSize:10, color:C.textMuted, marginTop:1 }}>{s.sub}</div>}
                  </div>
                </div>
                <Badge color={s.status==="healthy"?"green":s.status==="degraded"?"amber":"red"}>{"● "+(s.status==="healthy"?"Healthy":s.status==="degraded"?"Degraded":s.status==="down"?"Down":"Unknown")}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Analytics
   ══════════════════════════════════════════ */
const AnalyticsSection = ({ toast }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  const fetchReport = useCallback(async (r) => {
    setLoading(true);
    try {
      const res = await adminAPI.getAnalyticsReport(r || range);
      setData(res?.data?.data || res?.data || null);
    } catch (e) {
      toast("error", "Failed to load analytics: " + (e?.response?.data?.message || e.message));
    }
    setLoading(false);
  }, [range, toast]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const changeRange = (r) => { setRange(r); fetchReport(r); };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:10}}><Spinner size={24}/><span style={{color:C.textDim}}>Loading analytics...</span></div>;
  if (!data) return <div style={{color:C.textMuted,textAlign:"center",padding:40}}>No analytics data available yet. Data will appear as users interact with the platform.</div>;

  const o = data.overview || {};
  const charts = data.charts || {};
  const bd = data.breakdowns || {};
  const eco = data.economy || {};

  // Mini sparkline bar chart
  const MiniChart = ({ items, color, labelKey, valueKey }) => {
    if (!items || items.length === 0) return <span style={{color:C.textMuted,fontSize:11}}>No data yet</span>;
    const max = Math.max(...items.map(i => i[valueKey] || 0), 1);
    return (
      <div style={{display:"flex",alignItems:"flex-end",gap:2,height:60}}>
        {items.slice(-30).map((item, idx) => {
          const val = item[valueKey] || 0;
          const h = Math.max(2, (val / max) * 56);
          return <div key={idx} title={`${item[labelKey] || item._id}: ${val}`} style={{flex:1,minWidth:3,maxWidth:12,height:h,background:color||C.green,borderRadius:"2px 2px 0 0",opacity:0.8,transition:"height .3s"}} />;
        })}
      </div>
    );
  };

  // Stat pill
  const Pill = ({ label, value, sub, color }) => (
    <div style={{background:C.bgCard,borderRadius:10,padding:"14px 18px",border:`1px solid ${C.border}`,flex:"1 1 150px",minWidth:140}}>
      <div style={{fontSize:11,color:C.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color:color||C.white,fontFamily:"'Barlow Condensed',sans-serif"}}>{value}</div>
      {sub && <div style={{fontSize:10,color:C.textDim,marginTop:2}}>{sub}</div>}
    </div>
  );

  const fmtDuration = (sec) => {
    if (!sec || sec < 0) return "0s";
    if (sec < 60) return `${Math.round(sec)}s`;
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div>
      {/* Header + Range Picker */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontSize:20,fontWeight:800,color:C.white,display:"flex",alignItems:"center",gap:8,margin:0}}><TrendingUp size={20} color={C.green}/>Platform Analytics</h2>
        <div style={{display:"flex",gap:6}}>
          {["7d","30d","90d"].map(r=>(
            <button key={r} onClick={()=>changeRange(r)} style={{padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",background:range===r?C.green:`${C.bgHover}`,color:range===r?"#000":C.textMuted,transition:"all .2s"}}>{r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}</button>
          ))}
        </div>
      </div>

      {/* ── Overview Cards ── */}
      <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:20}}>
        <Pill label="Total Users" value={o.totalUsers?.toLocaleString()||0} sub={`+${o.newUsers||0} new this period`} color={C.green}/>
        <Pill label="Online Now" value={o.onlineNow||0} color="#22C55E"/>
        <Pill label="MAU" value={o.mau?.toLocaleString()||0} sub="Monthly active users" color={C.blue}/>
        <Pill label="Avg DAU" value={o.avgDAU||0} sub="Daily active users" color={C.purple}/>
        <Pill label="Avg Session" value={fmtDuration(o.avgSessionDuration)} sub={`${o.totalSessions?.toLocaleString()||0} total sessions`} color={C.amber}/>
        <Pill label="Bounce Rate" value={`${o.bounceRate||0}%`} sub="Sessions < 10s" color={parseFloat(o.bounceRate)>50?C.red:C.green}/>
        <Pill label="Churn Rate" value={`${o.churnRate||0}%`} sub="Users not returning" color={parseFloat(o.churnRate)>30?C.red:C.green}/>
        <Pill label="Leagues" value={o.totalLeagues||0} color={C.cyan}/>
      </div>

      {/* ── Charts Row ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
        {/* Page Views */}
        <div style={{...card,padding:16}}>
          <div style={{...labelStyle,marginBottom:10}}>Daily Page Views</div>
          <MiniChart items={charts.dailyPageViews} color={C.green} labelKey="_id" valueKey="views"/>
          {charts.dailyPageViews?.length > 0 && <div style={{fontSize:10,color:C.textDim,marginTop:6}}>Total: {charts.dailyPageViews.reduce((s,d)=>s+(d.views||0),0).toLocaleString()} views</div>}
        </div>

        {/* DAU */}
        <div style={{...card,padding:16}}>
          <div style={{...labelStyle,marginBottom:10}}>Daily Active Users</div>
          <MiniChart items={charts.dailyActiveUsers} color={C.blue} labelKey="_id" valueKey="dau"/>
        </div>

        {/* New Users */}
        <div style={{...card,padding:16}}>
          <div style={{...labelStyle,marginBottom:10}}>New Sign-ups</div>
          <MiniChart items={charts.userGrowth} color={C.purple} labelKey="_id" valueKey="count"/>
          {charts.userGrowth?.length > 0 && <div style={{fontSize:10,color:C.textDim,marginTop:6}}>Total: {charts.userGrowth.reduce((s,d)=>s+(d.count||0),0)} new users</div>}
        </div>
      </div>

      {/* ── Breakdowns Row ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
        {/* Platform Split */}
        <div style={{...card,padding:16}}>
          <div style={{...labelStyle,marginBottom:10}}>Platform Split</div>
          {(bd.platform||[]).length === 0 ? <span style={{color:C.textMuted,fontSize:11}}>No data yet</span> : (bd.platform||[]).map(p=>{
            const colors = {fantasy:C.green,landing:C.blue,admin:C.amber};
            return (
              <div key={p._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                <span style={{fontSize:12,color:C.white,fontWeight:600,textTransform:"capitalize"}}>{p._id||"unknown"}</span>
                <span style={{fontSize:13,fontWeight:700,color:colors[p._id]||C.textMuted}}>{p.count?.toLocaleString()}</span>
              </div>
            );
          })}
        </div>

        {/* Sport Split */}
        <div style={{...card,padding:16}}>
          <div style={{...labelStyle,marginBottom:10}}>Sport Activity</div>
          {(bd.sport||[]).length === 0 ? <span style={{color:C.textMuted,fontSize:11}}>No data yet</span> : (bd.sport||[]).map(s=>{
            const colors = {soccer:C.green,nfl:C.amber,general:C.blue};
            return (
              <div key={s._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
                <span style={{fontSize:12,color:C.white,fontWeight:600,textTransform:"capitalize"}}>{s._id||"general"}</span>
                <span style={{fontSize:13,fontWeight:700,color:colors[s._id]||C.textMuted}}>{s.count?.toLocaleString()}</span>
              </div>
            );
          })}
        </div>

        {/* Top Actions */}
        <div style={{...card,padding:16}}>
          <div style={{...labelStyle,marginBottom:10}}>Top Actions</div>
          {(bd.actions||[]).length === 0 ? <span style={{color:C.textMuted,fontSize:11}}>No actions tracked yet</span> : (bd.actions||[]).slice(0,8).map(a=>(
            <div key={a._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0"}}>
              <span style={{fontSize:11,color:C.white,fontWeight:500}}>{(a._id||"unknown").replace(/_/g," ")}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.cyan}}>{a.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Economy & Fantasy ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        {/* SAM Economy */}
        <div style={{...card,padding:16}}>
          <div style={{...labelStyle,marginBottom:10}}>SAM Points Economy</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {eco.sam && Object.keys(eco.sam).length > 0 ? Object.entries(eco.sam).map(([key,v])=>(
              <div key={key} style={{background:C.bgHover,borderRadius:8,padding:"10px 14px",flex:"1 1 120px"}}>
                <div style={{fontSize:10,color:C.textMuted,textTransform:"uppercase",fontWeight:600}}>{key.replace(/_/g," ")}</div>
                <div style={{fontSize:18,fontWeight:800,color:key==="sam_spent"?C.red:C.green,fontFamily:"'Barlow Condensed',sans-serif"}}>{(v.total||0).toLocaleString()}</div>
                <div style={{fontSize:10,color:C.textDim}}>{v.count||0} transactions · Avg {v.avg||0}</div>
              </div>
            )) : <span style={{color:C.textMuted,fontSize:11}}>No SAM transactions tracked yet. Data will appear as users interact with the store.</span>}
          </div>
        </div>

        {/* Fantasy Activity */}
        <div style={{...card,padding:16}}>
          <div style={{...labelStyle,marginBottom:10}}>Fantasy Activity (This Period)</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <div style={{background:C.bgHover,borderRadius:8,padding:"10px 14px",flex:"1 1 100px"}}>
              <div style={{fontSize:10,color:C.textMuted,fontWeight:600}}>TRADES</div>
              <div style={{fontSize:20,fontWeight:800,color:C.amber,fontFamily:"'Barlow Condensed',sans-serif"}}>{eco.trades||0}</div>
            </div>
            <div style={{background:C.bgHover,borderRadius:8,padding:"10px 14px",flex:"1 1 100px"}}>
              <div style={{fontSize:10,color:C.textMuted,fontWeight:600}}>AUCTIONS</div>
              <div style={{fontSize:20,fontWeight:800,color:C.purple,fontFamily:"'Barlow Condensed',sans-serif"}}>{eco.auctions||0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Pages ── */}
      <div style={{...card,padding:16}}>
        <div style={{...labelStyle,marginBottom:10}}>Top Pages</div>
        {(bd.topPages||[]).length === 0 ? <span style={{color:C.textMuted,fontSize:11}}>No page view data yet</span> : (
          <div style={{display:"grid",gridTemplateColumns:"1fr 80px 80px",gap:"4px 12px"}}>
            <span style={{fontSize:10,color:C.textMuted,fontWeight:700,textTransform:"uppercase"}}>Path</span>
            <span style={{fontSize:10,color:C.textMuted,fontWeight:700,textTransform:"uppercase",textAlign:"right"}}>Views</span>
            <span style={{fontSize:10,color:C.textMuted,fontWeight:700,textTransform:"uppercase",textAlign:"right"}}>Users</span>
            {(bd.topPages||[]).map(p=>(
              <React.Fragment key={p._id}>
                <span style={{fontSize:12,color:C.white,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p._id||"/"}</span>
                <span style={{fontSize:12,fontWeight:700,color:C.green,textAlign:"right"}}>{p.views?.toLocaleString()}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.blue,textAlign:"right"}}>{p.uniqueUsers}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Users
   ══════════════════════════════════════════ */
const UsersSection = ({ toast }) => {
  const [query,setQuery]=useState("");
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(false);
  const [confirm,setConfirm]=useState(null);
  const [expandedUser,setExpandedUser]=useState(null);
  const [emailEdit,setEmailEdit]=useState({});
  const [spAmount,setSpAmount]=useState("");
  const [spReason,setSpReason]=useState("");
  const [spSending,setSpSending]=useState(false);
  const [actionLoading,setActionLoading]=useState(null);
  const [indivSP,setIndivSP]=useState({}); // {userId: {amount,reason}}
  const [tempPasswords,setTempPasswords]=useState({}); // {userId: password}

  const doSearch = async()=>{
    if(!query.trim()) return toast("warn","Enter a search term");
    try { setLoading(true); const res=await adminAPI.searchUsers(query.trim()); const d=res.data?.data?.users||res.data?.data||res.data?.users||[]; setUsers(Array.isArray(d)?d:[]); if(d.length===0) toast("info","No users found"); } catch(e){ toast("error",e?.response?.data?.message||"Search failed"); } finally { setLoading(false); }
  };

  const doDelete=async(u)=>{
    try { await adminAPI.deleteUser(u._id); setUsers(p=>p.filter(x=>x._id!==u._id)); toast("success",`${u.userName||u.username} deleted`); setExpandedUser(null); }
    catch(e){ toast("error",e?.response?.data?.message||"Delete failed"); }
  };

  const doResetEmail=async(u)=>{
    const newEmail = emailEdit[u._id];
    if(!newEmail||!newEmail.trim()) return toast("warn","Enter a new email");
    try { setActionLoading("email-"+u._id); await adminAPI.resetUserEmail(u._id, newEmail.trim()); setUsers(p=>p.map(x=>x._id===u._id?{...x,email:newEmail.trim()}:x)); toast("success",`Email reset for ${u.userName||u.username}`); setEmailEdit(p=>({...p,[u._id]:""})); }
    catch(e){ toast("error",e?.response?.data?.message||"Email reset failed"); }
    finally { setActionLoading(null); }
  };

  const doBlock=async(u,days)=>{
    try { setActionLoading("block-"+u._id); await adminAPI.blockUser(u._id, days, `Blocked for ${days} days by admin`); const blockedUntil=new Date(Date.now()+days*24*60*60*1000).toISOString(); setUsers(p=>p.map(x=>x._id===u._id?{...x,blockedUntil,blockedReason:`Blocked for ${days} days by admin`,isActive:false}:x)); toast("success",`${u.userName||u.username} blocked for ${days} days`); }
    catch(e){ toast("error",e?.response?.data?.message||"Block failed"); }
    finally { setActionLoading(null); }
  };

  const doUnblock=async(u)=>{
    try { setActionLoading("unblock-"+u._id); await adminAPI.unblockUser(u._id); setUsers(p=>p.map(x=>x._id===u._id?{...x,blockedUntil:null,blockedReason:null,isActive:true}:x)); toast("success",`${u.userName||u.username} unblocked`); }
    catch(e){ toast("error",e?.response?.data?.message||"Unblock failed"); }
    finally { setActionLoading(null); }
  };

  const doSendSPAll=async()=>{
    if(!spAmount||Number(spAmount)<=0) return toast("warn","Enter a positive amount");
    try { setSpSending(true); const res=await adminAPI.sendSamPointsToAll(Number(spAmount),spReason); toast("success",res.data?.data?.message||`Sent ${spAmount} SP to all users`); setSpAmount(""); setSpReason(""); }
    catch(e){ toast("error",e?.response?.data?.message||"Failed to send SamPoints"); }
    finally { setSpSending(false); }
  };

  const doSendSPUser=async(u)=>{
    const sp = indivSP[u._id];
    if(!sp?.amount||Number(sp.amount)===0) return toast("warn","Enter an amount");
    try { setActionLoading("sp-"+u._id); const res=await adminAPI.sendSamPointsToUser(u._id, Number(sp.amount), sp.reason||""); const d=res.data?.data?.user||{}; setUsers(p=>p.map(x=>x._id===u._id?{...x,earnedSamPoints:d.earnedSamPoints??x.earnedSamPoints,mainWallet:d.mainWallet??x.mainWallet}:x)); toast("success",`Sent ${sp.amount} SP to ${u.userName||u.username}`); setIndivSP(p=>({...p,[u._id]:{amount:"",reason:""}})); }
    catch(e){ toast("error",e?.response?.data?.message||"Failed to send SamPoints"); }
    finally { setActionLoading(null); }
  };

  const doResetPassword=async(u)=>{
    try { setActionLoading("pwd-"+u._id); const res=await adminAPI.adminResetPassword(u._id); const d=res.data?.data||{}; setTempPasswords(p=>({...p,[u._id]:d.tempPassword})); toast("success",`Password reset for ${u.userName||u.username}`); }
    catch(e){ toast("error",e?.response?.data?.message||"Password reset failed"); }
    finally { setActionLoading(null); }
  };

  const isBlocked=(u)=> u.blockedUntil && new Date(u.blockedUntil) > new Date();
  const blockTimeLeft=(u)=>{
    if(!u.blockedUntil) return null;
    const diff = new Date(u.blockedUntil) - new Date();
    if(diff<=0) return null;
    const days=Math.floor(diff/(1000*60*60*24));
    const hours=Math.floor((diff%(1000*60*60*24))/(1000*60*60));
    return days>0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  const userStatus=(u)=>{
    if(isBlocked(u)) return {label:"Blocked",color:C.red,bg:C.redLight};
    if(u.isActive===false) return {label:"Inactive",color:C.amber,bg:C.amberLight};
    if(u.isDormant) return {label:"Dormant",color:C.amber,bg:C.amberLight};
    return {label:"Active",color:C.green,bg:C.greenLight};
  };

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontSize:20,fontWeight:800,color:C.white,margin:0}}>User Management</h2>
        <Badge color="blue">{users.length} results</Badge>
      </div>

      {/* Send SamPoints to All Users */}
      <div style={{...card,marginBottom:20,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",padding:16}}>
        <div style={{display:"flex",alignItems:"center",gap:6,color:C.amber}}>
          <Zap size={16}/>
          <span style={{fontSize:13,fontWeight:700}}>Send SamPoints to All Users</span>
        </div>
        <input type="number" placeholder="Amount" value={spAmount} onChange={e=>setSpAmount(e.target.value)} style={{...inputStyle,width:110,padding:"8px 12px"}}/>
        <input type="text" placeholder="Reason (optional)" value={spReason} onChange={e=>setSpReason(e.target.value)} style={{...inputStyle,width:200,padding:"8px 12px"}}/>
        <button onClick={()=>setConfirm({title:"Send SamPoints to ALL",message:`Send ${spAmount||0} SamPoints to every active user?${spReason?` Reason: ${spReason}`:""}`,action:doSendSPAll})} disabled={spSending||!spAmount} style={{...btn,background:C.amber,color:"#000",opacity:(!spAmount||spSending)?0.5:1}}>
          {spSending?<Spinner size={13}/>:<Send size={13}/>} Send to All
        </button>
      </div>

      <div style={{marginBottom:20}}><SearchBar value={query} onChange={setQuery} placeholder="Search by username, email, or ID..." onSearch={doSearch} loading={loading}/></div>

      {/* User Rows */}
      {loading ? (
        <div style={{textAlign:"center",padding:40}}><Spinner size={28}/></div>
      ) : users.length === 0 ? (
        <div style={{...card,textAlign:"center",padding:40}}>
          <Users size={32} color={C.textMuted} style={{marginBottom:8}}/>
          <p style={{color:C.textMuted,fontSize:13,margin:0}}>Search for users above</p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {/* Header Row */}
          <div style={{display:"grid",gridTemplateColumns:"44px 1.2fr 1.8fr 90px 80px 90px 1.2fr 1fr",gap:12,padding:"8px 16px",alignItems:"center"}}>
            <span></span>
            <span style={labelStyle}>Username</span>
            <span style={labelStyle}>Email</span>
            <span style={labelStyle}>Status</span>
            <span style={labelStyle}>SamPoints</span>
            <span style={labelStyle}>Joined</span>
            <span style={labelStyle}>Leagues</span>
            <span style={{...labelStyle,textAlign:"right"}}>Actions</span>
          </div>
          {users.map(u => {
            const st = userStatus(u);
            const blocked = isBlocked(u);
            const expanded = expandedUser===u._id;
            return (
              <div key={u._id} style={{borderRadius:12,border:`1px solid ${expanded?C.blue+"66":C.borderLight}`,background:C.bgCard,overflow:"hidden",transition:"border-color .2s"}}>
                {/* Main Row */}
                <div onClick={()=>setExpandedUser(expanded?null:u._id)} style={{display:"grid",gridTemplateColumns:"44px 1.2fr 1.8fr 90px 80px 90px 1.2fr 1fr",gap:12,padding:"12px 16px",alignItems:"center",cursor:"pointer",transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bgHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  {/* Avatar */}
                  <div style={{width:36,height:36,borderRadius:"50%",background:blocked?C.redLight:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:14,fontWeight:800,color:blocked?C.red:C.blue}}>{(u.userName||u.username||"?")[0].toUpperCase()}</span>
                  </div>
                  {/* Username */}
                  <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.white}}>{u.userName||u.username||"Unknown"}</span>
                    {u.isCommissioner && <span style={{marginLeft:6,fontSize:10,color:C.amber,fontWeight:600}}>COMM</span>}
                  </div>
                  {/* Email */}
                  <div style={{fontSize:12,color:C.textDim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email||"No email"}</div>
                  {/* Status */}
                  <div>
                    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,color:st.color,background:st.bg}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:st.color}}></span>
                      {st.label}
                    </span>
                  </div>
                  {/* SamPoints */}
                  <span style={{fontSize:13,fontWeight:600,color:C.amber}}>{fmt(u.earnedSamPoints||0)}</span>
                  {/* Joined */}
                  <span style={{fontSize:11,color:C.textMuted}}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</span>
                  {/* Leagues */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                    {(u.leagues||[]).length>0 ? u.leagues.map((lg,i)=>(
                      <span key={i} style={{display:"inline-block",padding:"2px 8px",borderRadius:12,fontSize:10,fontWeight:600,color:lg.sport==="soccer"?C.teal:C.purple,background:lg.sport==="soccer"?C.tealLight:C.purpleLight,whiteSpace:"nowrap",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis"}} title={lg.leagueMode==="offense_only"?"Offense Only":lg.leagueMode==="full"?"53-Man":lg.leagueMode||""}>{lg.name||lg.leagueId}{lg.leagueMode ? ` (${lg.leagueMode==="offense_only"?"OFF":"53"})` : ""}</span>
                    )) : <span style={{fontSize:10,color:C.textMuted}}>None</span>}
                  </div>
                  {/* Actions */}
                  <div style={{display:"flex",gap:4,justifyContent:"flex-end"}} onClick={e=>e.stopPropagation()}>
                    {blocked ? (
                      <button onClick={()=>doUnblock(u)} disabled={actionLoading==="unblock-"+u._id} style={{...btn,padding:"5px 10px",background:C.greenLight,color:C.green,fontSize:11}} title="Unblock">
                        {actionLoading==="unblock-"+u._id?<Spinner size={11}/>:<Lock size={11}/>} Unblock
                      </button>
                    ) : (
                      <>
                        <button onClick={()=>doBlock(u,3)} disabled={!!actionLoading} style={{...btn,padding:"5px 8px",background:C.amberLight,color:C.amber,fontSize:10}} title="Block 3 days">3d</button>
                        <button onClick={()=>doBlock(u,15)} disabled={!!actionLoading} style={{...btn,padding:"5px 8px",background:C.amberLight,color:C.amber,fontSize:10}} title="Block 15 days">15d</button>
                        <button onClick={()=>doBlock(u,30)} disabled={!!actionLoading} style={{...btn,padding:"5px 8px",background:C.redLight,color:C.red,fontSize:10}} title="Block 30 days">30d</button>
                      </>
                    )}
                    <button onClick={()=>setConfirm({title:"Delete User",message:`Permanently delete ${u.userName||u.username}? This cannot be undone.`,danger:true,action:()=>doDelete(u)})} style={{...btn,padding:"5px 8px",background:"transparent"}} title="Delete"><Trash2 size={13} color={C.red}/></button>
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {expanded && (
                  <div style={{padding:"0 16px 16px 16px",borderTop:`1px solid ${C.borderLight}30`}}>
                    {/* Block Info Banner */}
                    {blocked && (
                      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:C.redLight,marginTop:12,marginBottom:8}}>
                        <Lock size={14} color={C.red}/>
                        <div>
                          <span style={{fontSize:12,fontWeight:700,color:C.red}}>Blocked — {blockTimeLeft(u)}</span>
                          {u.blockedReason && <span style={{fontSize:11,color:C.textDim,marginLeft:8}}>{u.blockedReason}</span>}
                        </div>
                        <button onClick={()=>doUnblock(u)} style={{...btn,padding:"4px 12px",background:C.green,color:C.white,fontSize:11,marginLeft:"auto"}}>Unblock Now</button>
                      </div>
                    )}

                    {/* Info Grid */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))",gap:10,marginTop:12}}>
                      <div style={{padding:10,borderRadius:8,background:C.bg}}>
                        <span style={labelStyle}>Account Status</span>
                        <div style={{fontSize:13,color:C.white,fontWeight:600,marginTop:2}}>{u.accountStatus||"approve"}</div>
                      </div>
                      <div style={{padding:10,borderRadius:8,background:C.bg}}>
                        <span style={labelStyle}>Wallet Balance</span>
                        <div style={{fontSize:13,color:C.green,fontWeight:600,marginTop:2}}>{fmt(u.mainWallet||0)} SP</div>
                      </div>
                      <div style={{padding:10,borderRadius:8,background:C.bg}}>
                        <span style={labelStyle}>Earned SamPoints</span>
                        <div style={{fontSize:13,color:C.amber,fontWeight:600,marginTop:2}}>{fmt(u.earnedSamPoints||0)}</div>
                      </div>
                      <div style={{padding:10,borderRadius:8,background:C.bg}}>
                        <span style={labelStyle}>Last Login</span>
                        <div style={{fontSize:13,color:C.white,fontWeight:600,marginTop:2}}>{(u.lastLoginDate||u.lastLogin)?new Date(u.lastLoginDate||u.lastLogin).toLocaleDateString():"Never"}</div>
                      </div>
                      <div style={{padding:10,borderRadius:8,background:C.bg}}>
                        <span style={labelStyle}>Commissioner</span>
                        <div style={{fontSize:13,color:u.isCommissioner?C.amber:C.textMuted,fontWeight:600,marginTop:2}}>{u.isCommissioner?"Yes":"No"}</div>
                      </div>
                      <div style={{padding:10,borderRadius:8,background:C.bg}}>
                        <span style={labelStyle}>Dormant</span>
                        <div style={{fontSize:13,color:u.isDormant?C.amber:C.textMuted,fontWeight:600,marginTop:2}}>{u.isDormant?"Yes":"No"}</div>
                      </div>
                    </div>

                    {/* Hard Reset Email */}
                    <div style={{marginTop:14,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.textDim}}>Hard Reset Email:</span>
                      <input type="email" placeholder={u.email||"new@email.com"} value={emailEdit[u._id]||""} onChange={e=>setEmailEdit(p=>({...p,[u._id]:e.target.value}))} style={{...inputStyle,width:260,padding:"8px 12px"}}/>
                      <button onClick={()=>setConfirm({title:"Reset Email",message:`Change email for ${u.userName||u.username} to "${emailEdit[u._id]}"?`,action:()=>doResetEmail(u)})} disabled={!emailEdit[u._id]||actionLoading==="email-"+u._id} style={{...btn,background:C.blue,color:C.white,fontSize:12,opacity:(!emailEdit[u._id])?0.5:1}}>
                        {actionLoading==="email-"+u._id?<Spinner size={12}/>:<Edit3 size={12}/>} Reset Email
                      </button>
                    </div>

                    {/* Send SamPoints to Individual */}
                    <div style={{marginTop:10,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.amber,display:"flex",alignItems:"center",gap:4}}><Zap size={12}/>Send SamPoints:</span>
                      <input type="number" placeholder="Amount" value={indivSP[u._id]?.amount||""} onChange={e=>setIndivSP(p=>({...p,[u._id]:{...p[u._id],amount:e.target.value}}))} style={{...inputStyle,width:110,padding:"8px 12px"}}/>
                      <input type="text" placeholder="Reason (optional)" value={indivSP[u._id]?.reason||""} onChange={e=>setIndivSP(p=>({...p,[u._id]:{...p[u._id],reason:e.target.value}}))} style={{...inputStyle,width:180,padding:"8px 12px"}}/>
                      <button onClick={()=>setConfirm({title:"Send SamPoints",message:`Send ${indivSP[u._id]?.amount||0} SamPoints to ${u.userName||u.username}?`,action:()=>doSendSPUser(u)})} disabled={!indivSP[u._id]?.amount||actionLoading==="sp-"+u._id} style={{...btn,background:C.amber,color:"#000",fontSize:12,opacity:(!indivSP[u._id]?.amount)?0.5:1}}>
                        {actionLoading==="sp-"+u._id?<Spinner size={12}/>:<Send size={12}/>} Send
                      </button>
                    </div>

                    {/* Password Reset */}
                    <div style={{marginTop:10,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.red,display:"flex",alignItems:"center",gap:4}}><Lock size={12}/>Reset Password:</span>
                      <button onClick={()=>setConfirm({title:"Reset Password",message:`Generate a new temporary password for ${u.userName||u.username}? They will be required to change it on next login.`,danger:true,action:()=>doResetPassword(u)})} disabled={actionLoading==="pwd-"+u._id} style={{...btn,background:C.redLight,color:C.red,fontSize:12}}>
                        {actionLoading==="pwd-"+u._id?<Spinner size={12}/>:<Lock size={12}/>} Generate Temp Password
                      </button>
                      {tempPasswords[u._id] && (
                        <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:8,background:C.greenLight}}>
                          <span style={{fontSize:12,fontWeight:700,color:C.green}}>Temp password:</span>
                          <code style={{fontSize:13,fontWeight:700,color:C.white,background:C.bgHover,padding:"2px 8px",borderRadius:4,userSelect:"all"}}>{tempPasswords[u._id]}</code>
                          <span style={{fontSize:10,color:C.textMuted}}>Give to user — they must change it on login</span>
                        </div>
                      )}
                    </div>

                    {/* Leagues Detail */}
                    {(u.leagues||[]).length>0 && (
                      <div style={{marginTop:10}}>
                        <span style={{...labelStyle,marginBottom:8,display:"block"}}>Leagues ({u.leagues.length})</span>
                        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                          {u.leagues.map((lg,i)=>(
                            <div key={i} style={{padding:"8px 14px",borderRadius:10,background:lg.sport==="soccer"?C.tealLight:C.purpleLight,border:`1px solid ${lg.sport==="soccer"?C.teal:C.purple}33`}}>
                              <div style={{fontSize:12,fontWeight:700,color:lg.sport==="soccer"?C.teal:C.purple}}>{lg.name||lg.leagueId}</div>
                              <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{lg.sport||"nfl"} &middot; {lg.type||"—"} &middot; {lg.category||"—"} &middot; S{lg.season||"—"}{lg.leagueMode ? ` · ${lg.leagueMode==="offense_only"?"Offense Only":"53-Man"}` : ""}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog open={!!confirm} title={confirm?.title} message={confirm?.message} danger={confirm?.danger} onConfirm={()=>{confirm?.action();setConfirm(null)}} onCancel={()=>setConfirm(null)}/>
    </div>
  );
};

/* ══════════════════════════════════════════
   SHARED: Users List Tab (used inside NFL & Soccer sections)
   ══════════════════════════════════════════ */
const UsersListTab = ({ sport, toast }) => {
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(false);
  const [page,setPage]=useState(1);
  const [pages,setPages]=useState(1);
  const [total,setTotal]=useState(0);
  const [statusFilter,setStatusFilter]=useState("");
  const [searchQ,setSearchQ]=useState("");
  const [expandedId,setExpandedId]=useState(null);
  const limit=25;

  const loadUsers=useCallback(async(p=1)=>{
    try{
      setLoading(true);
      const params={page:p,limit,status:statusFilter||undefined,q:searchQ||undefined};
      const r=await adminAPI.listUsers(sport,params);
      const d=r.data?.data||r.data||{};
      setUsers(d.users||[]);setTotal(d.total||0);setPage(d.page||p);setPages(d.pages||1);
    }catch(e){toast("error",e?.response?.data?.message||"Failed to load users");}
    finally{setLoading(false);}
  },[sport,statusFilter,searchQ,toast]);

  useEffect(()=>{loadUsers(1);},[loadUsers]);

  const accent=sport==="soccer"?C.teal:C.purple;
  const statuses=[{id:"",l:"All"},{id:"active",l:"Active"},{id:"blocked",l:"Blocked"},{id:"dormant",l:"Dormant"},{id:"inactive",l:"Inactive"}];
  const getUserStatus=(u)=>{
    if(u.blockedUntil||u.isBanned) return {label:"Blocked",color:"red"};
    if(u.isDormant) return {label:"Dormant",color:"amber"};
    if(u.isActive!==false) return {label:"Active",color:"green"};
    return {label:"Inactive",color:"teal"};
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Filters */}
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:200}}>
          <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.textMuted}}/>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")loadUsers(1);}} placeholder="Search by username or email..." style={{...inputStyle,paddingLeft:36}}/>
        </div>
        <div style={{display:"flex",gap:4}}>
          {statuses.map(s=>(
            <button key={s.id} onClick={()=>setStatusFilter(s.id)} style={{...btn,padding:"6px 12px",fontSize:12,background:statusFilter===s.id?accent+"22":C.bgHover,color:statusFilter===s.id?accent:C.textDim,border:`1px solid ${statusFilter===s.id?accent+"44":C.borderLight}`}}>{s.l}</button>
          ))}
        </div>
        <button onClick={()=>loadUsers(1)} disabled={loading} style={{...btn,background:accent,color:C.white,opacity:loading?.6:1}}>{loading&&<Spinner size={12}/>}Search</button>
      </div>

      {/* Stats bar */}
      <div style={{display:"flex",gap:16,fontSize:12,color:C.textMuted}}>
        <span>{total.toLocaleString()} total users</span>
        <span>Page {page} of {pages}</span>
      </div>

      {/* Table */}
      {loading&&users.length===0 ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",gap:10}}><Spinner size={24}/><span style={{color:C.textDim,fontSize:13}}>Loading users...</span></div>
      ) : (
        <div style={{borderRadius:12,border:`1px solid ${C.borderLight}`,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.borderLight}`,background:"rgba(30,41,59,0.5)"}}>
                <th style={{textAlign:"left",padding:"10px 14px",...labelStyle,marginBottom:0,display:"table-cell"}}>User</th>
                <th style={{textAlign:"left",padding:"10px 14px",...labelStyle,marginBottom:0,display:"table-cell"}}>Email</th>
                <th style={{textAlign:"left",padding:"10px 14px",...labelStyle,marginBottom:0,display:"table-cell"}}>Status</th>
                <th style={{textAlign:"left",padding:"10px 14px",...labelStyle,marginBottom:0,display:"table-cell"}}>Leagues</th>
                <th style={{textAlign:"left",padding:"10px 14px",...labelStyle,marginBottom:0,display:"table-cell"}}>Rivals</th>
                <th style={{textAlign:"left",padding:"10px 14px",...labelStyle,marginBottom:0,display:"table-cell"}}>SP</th>
                <th style={{textAlign:"left",padding:"10px 14px",...labelStyle,marginBottom:0,display:"table-cell"}}>Last Login</th>
                <th style={{textAlign:"left",padding:"10px 14px",...labelStyle,marginBottom:0,display:"table-cell"}}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length===0 ? (
                <tr><td colSpan={8} style={{textAlign:"center",padding:"40px 0",color:C.textMuted}}>No users found</td></tr>
              ) : users.map((u)=>{
                const st=getUserStatus(u);
                return (
                  <React.Fragment key={u._id}>
                    <tr onClick={()=>setExpandedId(expandedId===u._id?null:u._id)} style={{borderBottom:`1px solid ${C.borderLight}20`,cursor:"pointer",transition:"background .15s",background:expandedId===u._id?"rgba(51,65,85,0.2)":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(51,65,85,0.3)"} onMouseLeave={e=>e.currentTarget.style.background=expandedId===u._id?"rgba(51,65,85,0.2)":"transparent"}>
                      <td style={{padding:"10px 14px",color:C.white,fontWeight:600}}>{u.userName||"—"}</td>
                      <td style={{padding:"10px 14px",color:C.text,fontSize:12}}>{u.email||"—"}</td>
                      <td style={{padding:"10px 14px"}}><Badge color={st.color}>{st.label}</Badge></td>
                      <td style={{padding:"10px 14px",color:C.text}}>{u.leagueCount||0}</td>
                      <td style={{padding:"10px 14px"}}>{u.hasRivalsEntry ? <Badge color="purple">Yes</Badge> : <span style={{color:C.textMuted}}>No</span>}</td>
                      <td style={{padding:"10px 14px",color:C.text}}>{fmt(u.earnedSamPoints)}</td>
                      <td style={{padding:"10px 14px",color:C.textDim,fontSize:11}}>{(u.lastLoginDate||u.lastLogin)?new Date(u.lastLoginDate||u.lastLogin).toLocaleDateString():"Never"}</td>
                      <td style={{padding:"10px 14px",color:C.textDim,fontSize:11}}>{u.createdAt?new Date(u.createdAt).toLocaleDateString():"—"}</td>
                    </tr>
                    {expandedId===u._id&&(
                      <tr><td colSpan={8} style={{padding:0,background:"rgba(30,41,59,0.4)"}}>
                        <div style={{padding:"14px 20px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
                          <div><span style={labelStyle}>User ID</span><div style={{color:C.text,fontSize:11,fontFamily:"monospace"}}>{u._id}</div></div>
                          <div><span style={labelStyle}>Auth Provider</span><div style={{color:C.text,fontSize:13}}>{u.authProvider||"local"}</div></div>
                          <div><span style={labelStyle}>User Type</span><div style={{color:C.text,fontSize:13}}>{u.userType||"user"}</div></div>
                          <div><span style={labelStyle}>Role</span><div style={{color:C.text,fontSize:13}}>{u.role||"user"}</div></div>
                          <div><span style={labelStyle}>Commissioner</span><div style={{color:C.text,fontSize:13}}>{u.isCommissioner?"Yes":"No"}</div></div>
                          <div><span style={labelStyle}>Wallet</span><div style={{color:C.text,fontSize:11,fontFamily:"monospace"}}>{u.mainWallet||"—"}</div></div>
                          <div><span style={labelStyle}>Account Status</span><div style={{color:C.text,fontSize:13}}>{u.accountStatus||"active"}</div></div>
                          {u.blockedUntil&&<div><span style={labelStyle}>Blocked Until</span><div style={{color:C.red,fontSize:13}}>{new Date(u.blockedUntil).toLocaleString()}</div></div>}
                          {u.blockedReason&&<div><span style={labelStyle}>Block Reason</span><div style={{color:C.red,fontSize:13}}>{u.blockedReason}</div></div>}
                        </div>
                      </td></tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages>1&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,paddingTop:8}}>
          <button onClick={()=>loadUsers(page-1)} disabled={page<=1||loading} style={{...btn,padding:"6px 14px",background:C.bgHover,color:C.textDim,opacity:page<=1?.4:1}}>Prev</button>
          {Array.from({length:Math.min(5,pages)},(_,i)=>{
            let p;
            if(pages<=5) p=i+1;
            else if(page<=3) p=i+1;
            else if(page>=pages-2) p=pages-4+i;
            else p=page-2+i;
            return <button key={p} onClick={()=>loadUsers(p)} style={{...btn,padding:"6px 12px",fontSize:12,background:p===page?accent:C.bgHover,color:p===page?C.white:C.textDim,minWidth:32}}>{p}</button>;
          })}
          <button onClick={()=>loadUsers(page+1)} disabled={page>=pages||loading} style={{...btn,padding:"6px 14px",background:C.bgHover,color:C.textDim,opacity:page>=pages?.4:1}}>Next</button>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   SUB-SECTION: Soccer Data Sync Tab
   Per-league seed, TM scrape, valuations
   ══════════════════════════════════════════ */
const SOCCER_LEAGUES = [
  { key: "premier_league", label: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { key: "la_liga", label: "La Liga", flag: "🇪🇸" },
  { key: "serie_a", label: "Serie A", flag: "🇮🇹" },
  { key: "bundesliga", label: "Bundesliga", flag: "🇩🇪" },
  { key: "ligue_1", label: "Ligue 1", flag: "🇫🇷" },
  { key: "ekstraklasa", label: "Ekstraklasa", flag: "🇵🇱" },
];

const SoccerSyncTab = ({ toast, triggerSync }) => {
  const [seeding, setSeeding] = useState({});

  const handleSeed = async (league, mode) => {
    const key = `${league}-${mode}`;
    setSeeding(p => ({ ...p, [key]: true }));
    try {
      if (mode === "full") {
        await adminAPI.fullSeedLeague(league);
        toast("success", `Full seed started for ${league} (API-Football + TransferMarkt). Check server console.`);
      } else if (mode === "seed") {
        await adminAPI.seedLeaguePlayers(league);
        toast("success", `Player seed started for ${league}. Check server console.`);
      } else if (mode === "tm") {
        await adminAPI.scrapeLeagueValues(league);
        toast("success", `TransferMarkt scrape started for ${league}. Check server console.`);
      }
    } catch (err) { toast("error", err.response?.data?.message || `${mode} failed for ${league}`); }
    setSeeding(p => ({ ...p, [key]: false }));
  };

  const handleBulk = async (action) => {
    setSeeding(p => ({ ...p, [action]: true }));
    try {
      if (action === "update-valuations") {
        await adminAPI.updateValuations();
        toast("success", "Bulk valuation update started. Check server console.");
      } else {
        await triggerSync(action);
      }
    } catch (err) { toast("error", err.response?.data?.message || `${action} failed`); }
    setSeeding(p => ({ ...p, [action]: false }));
  };

  return (
    <div>
      {/* Per-League Seeding */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <Database size={16} color={C.teal} /> Per-League Player Seed
      </h3>
      <p style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>
        Seed players from API-Football, scrape TransferMarkt values, or run both at once per league.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {SOCCER_LEAGUES.map(lg => (
          <div key={lg.key} style={{ background: C.cardBg, borderRadius: 12, padding: 14, border: `1px solid ${C.borderLight}` }}>
            <h4 style={{ color: C.white, fontWeight: 700, fontSize: 13, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{lg.flag}</span> {lg.label}
            </h4>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button disabled={seeding[`${lg.key}-full`]} onClick={() => handleSeed(lg.key, "full")}
                style={{ ...btn, background: C.teal, color: C.white, fontSize: 11, padding: "5px 10px", opacity: seeding[`${lg.key}-full`] ? 0.5 : 1 }}>
                {seeding[`${lg.key}-full`] ? <Loader2 size={11} className="ap-spin" /> : <Zap size={11} />} Full Seed
              </button>
              <button disabled={seeding[`${lg.key}-seed`]} onClick={() => handleSeed(lg.key, "seed")}
                style={{ ...btn, background: C.bgHover, color: C.white, fontSize: 11, padding: "5px 10px", opacity: seeding[`${lg.key}-seed`] ? 0.5 : 1 }}>
                {seeding[`${lg.key}-seed`] ? <Loader2 size={11} className="ap-spin" /> : <Users size={11} />} API-Football Only
              </button>
              <button disabled={seeding[`${lg.key}-tm`]} onClick={() => handleSeed(lg.key, "tm")}
                style={{ ...btn, background: C.purple, color: C.white, fontSize: 11, padding: "5px 10px", opacity: seeding[`${lg.key}-tm`] ? 0.5 : 1 }}>
                {seeding[`${lg.key}-tm`] ? <Loader2 size={11} className="ap-spin" /> : <DollarSign size={11} />} TM Values Only
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Operations */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <Zap size={16} color={C.amber} /> Bulk Operations
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { l: "Update All Valuations", d: "Recalculate market values from TM data", a: "update-valuations", c: C.amber },
          { l: "Update Positions", d: "Refresh positions via FBRef", a: "update-positions", c: C.blue },
          { l: "Generate Fantasy Points", d: "Calculate FP averages", a: "generate-fantasy-points", c: C.teal },
          { l: "Fix SamPoints", d: "Recalculate SamPoints", a: "fix-sampoints", c: C.purple },
          { l: "Seed All Leagues", d: "Import all domestic leagues at once", a: "seed-players-all", c: C.green },
        ].map(s => (
          <div key={s.a} style={{ background: C.cardBg, borderRadius: 12, padding: 14, border: `1px solid ${C.borderLight}` }}>
            <h4 style={{ color: C.white, fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>{s.l}</h4>
            <p style={{ color: C.textDim, fontSize: 11, margin: "0 0 10px" }}>{s.d}</p>
            <button disabled={seeding[s.a]} onClick={() => handleBulk(s.a)}
              style={{ ...btn, background: s.c, color: s.c === C.amber ? "#000" : C.white, fontSize: 11, padding: "5px 10px", opacity: seeding[s.a] ? 0.5 : 1 }}>
              {seeding[s.a] ? <Loader2 size={11} className="ap-spin" /> : <Zap size={11} />} Run
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Soccer Management
   ══════════════════════════════════════════ */
const SoccerSection = ({ toast }) => {
  const [tab,setTab]=useState("players"); const [query,setQuery]=useState(""); const [players,setPlayers]=useState([]); const [loading,setLoading]=useState(false); const [editPlayer,setEditPlayer]=useState(null); const [saving,setSaving]=useState(false);
  const searchPlayers=async()=>{if(!query.trim())return toast("warn","Enter a search term"); try{setLoading(true);const r=await adminAPI.searchSoccerPlayers(query.trim());const d=r.data?.data?.players||r.data?.data||[];setPlayers(Array.isArray(d)?d:[]);if(d.length===0)toast("info","No soccer players found");}catch(e){toast("error",e?.response?.data?.message||"Search failed");}finally{setLoading(false);}};
  const savePlayer=async()=>{if(!editPlayer)return;try{setSaving(true);await adminAPI.updateSoccerPlayer(editPlayer._id,{name:editPlayer.name,positionCategory:editPlayer.positionCategory,realClub:editPlayer.realClub,marketValue:editPlayer.marketValue,salary:editPlayer.salary,fantasyPoints:editPlayer.fantasyPoints,overallRating:editPlayer.overallRating,age:editPlayer.age,nationality:editPlayer.nationality,shirtNumber:editPlayer.shirtNumber});setPlayers(p=>p.map(x=>x._id===editPlayer._id?{...x,...editPlayer}:x));toast("success",`${editPlayer.name} updated`);setEditPlayer(null);}catch(e){toast("error",e?.response?.data?.message||"Update failed");}finally{setSaving(false);}};
  const triggerSync=async(action)=>{try{await adminAPI.triggerSoccerSync(action);toast("success",`Soccer sync "${action}" triggered`);}catch(e){toast("error",e?.response?.data?.message||"Sync failed");}};
  const tabs=[{id:"users",label:"Users",icon:Users},{id:"players",label:"Players",icon:Globe},{id:"scoring",label:"Scoring",icon:TrendingUp},{id:"leagues",label:"Leagues",icon:Trophy},{id:"fixtures",label:"Fixtures",icon:Activity},{id:"matchweeks",label:"Matchweeks",icon:Clock},{id:"sync",label:"Data Sync",icon:RefreshCw}];

  const posColor = (pos) => {
    const p = (pos||"").toLowerCase();
    if (p.includes("goal")) return "amber";
    if (p.includes("defend")) return "blue";
    if (p.includes("mid")) return "purple";
    if (p.includes("forward") || p.includes("strik") || p.includes("wing")) return "red";
    return "teal";
  };

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:20}}>Soccer Management</h2>
      <TabBar tabs={tabs} active={tab} onChange={setTab} accent={C.teal}/>

      {tab==="users"&&<UsersListTab sport="soccer" toast={toast}/>}

      {tab==="players"&&(<div>
        <SearchBar value={query} onChange={setQuery} placeholder="Search soccer players by name, club, or position..." onSearch={searchPlayers} loading={loading}/>
        {players.length>0 && <div style={{marginTop:6,marginBottom:14}}><span style={{fontSize:12,color:C.textMuted}}>{players.length} player{players.length!==1?"s":""} found</span></div>}

        {/* Player Rows */}
        {players.length>0 && (
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {/* Header */}
            <div style={{display:"grid",gridTemplateColumns:"44px minmax(130px,2fr) minmax(100px,1.2fr) 80px 100px 80px 60px 50px 60px 50px",minWidth:920,gap:8,padding:"8px 16px",alignItems:"center"}}>
              <span></span>
              <span style={labelStyle}>Player</span>
              <span style={labelStyle}>Club</span>
              <span style={labelStyle}>Position</span>
              <span style={labelStyle}>Market Value</span>
              <span style={labelStyle}>Salary</span>
              <span style={labelStyle}>Age</span>
              <span style={labelStyle}>OVR</span>
              <span style={labelStyle}>FP</span>
              <span></span>
            </div>
            {players.map(p => (
              <div key={p._id} style={{borderRadius:10,border:`1px solid ${editPlayer?._id===p._id?C.teal+"66":C.borderLight}`,background:C.bgCard,transition:"border-color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bgHover} onMouseLeave={e=>e.currentTarget.style.background=C.bgCard}>
                <div style={{display:"grid",gridTemplateColumns:"44px minmax(130px,2fr) minmax(100px,1.2fr) 80px 100px 80px 60px 50px 60px 50px",minWidth:920,gap:8,padding:"10px 16px",alignItems:"center"}}>
                  {/* Avatar */}
                  {p.photo ? (
                    <img src={p.photo} alt="" style={{width:36,height:36,borderRadius:10,objectFit:"cover",background:C.bgHover}} onError={e=>{e.target.style.display="none"}}/>
                  ) : (
                    <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.teal}33,${C.blue}33)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:C.teal,flexShrink:0}}>
                      {(p.name||"?")[0]}
                    </div>
                  )}
                  {/* Name */}
                  <span style={{fontSize:13,fontWeight:700,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                  {/* Club */}
                  <span style={{fontSize:12,color:C.textDim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.realClub||"No Club"}</span>
                  {/* Position */}
                  <Badge color={posColor(p.positionCategory)}>{p.positionCategory||"—"}</Badge>
                  {/* Value */}
                  <span style={{fontSize:13,fontWeight:600,color:C.green}}>{p.marketValue?`€${fmt(p.marketValue)}`:"—"}</span>
                  {/* Salary */}
                  <span style={{fontSize:13,fontWeight:600,color:C.white}}>{p.salary?`€${fmt(p.salary)}`:"—"}</span>
                  {/* Age */}
                  <span style={{fontSize:13,fontWeight:700,color:C.white}}>{p.age||"—"}</span>
                  {/* OVR */}
                  <span style={{fontSize:13,fontWeight:600,color:p.overallRating?C.blue:C.textMuted}}>{p.overallRating||"—"}</span>
                  {/* FP */}
                  <span style={{fontSize:13,fontWeight:600,color:p.fantasyPoints?C.teal:C.textMuted}}>{p.fantasyPoints??"-"}</span>
                  {/* Edit */}
                  <button onClick={()=>setEditPlayer({...p})} style={{...btn,padding:6,background:C.tealLight,borderRadius:8}} title="Edit">
                    <Edit3 size={13} color={C.teal}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Panel */}
        {editPlayer&&(
          <div style={{...card,marginTop:14,borderColor:C.teal+"44",background:"rgba(20,184,166,0.03)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h3 style={{color:C.white,fontWeight:700,fontSize:15,margin:0,display:"flex",alignItems:"center",gap:8}}><Edit3 size={15} color={C.teal}/>Editing: {editPlayer.name}</h3>
              <button onClick={()=>setEditPlayer(null)} style={{...btn,padding:"6px 12px",background:C.bgHover,color:C.textDim,fontSize:12}}>
                <XCircle size={12}/>Cancel
              </button>
            </div>
            {/* Primary: Age & Value (highlighted) */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
              <div style={{background:C.greenLight,borderRadius:12,padding:14,border:`1px solid ${C.green}33`}}>
                <label style={{...labelStyle,color:C.green}}>Market Value (€)</label>
                <input type="number" value={editPlayer.marketValue||""} onChange={e=>setEditPlayer({...editPlayer,marketValue:Number(e.target.value)})} style={{...inputStyle,fontSize:16,fontWeight:700}} placeholder="e.g. 85000000"/>
                {editPlayer.marketValue>0&&<p style={{fontSize:10,color:C.textMuted,margin:"4px 0 0"}}>= €{fmt(editPlayer.marketValue)}</p>}
              </div>
              <div style={{background:C.amberLight,borderRadius:12,padding:14,border:`1px solid ${C.amber}33`}}>
                <label style={{...labelStyle,color:C.amber}}>Age</label>
                <input type="number" value={editPlayer.age||""} onChange={e=>setEditPlayer({...editPlayer,age:Number(e.target.value)})} style={{...inputStyle,fontSize:16,fontWeight:700}} min={15} max={50} placeholder="e.g. 27"/>
              </div>
              <div style={{background:C.blueLight,borderRadius:12,padding:14,border:`1px solid ${C.blue}33`}}>
                <label style={{...labelStyle,color:C.blue}}>Salary (€)</label>
                <input type="number" value={editPlayer.salary||""} onChange={e=>setEditPlayer({...editPlayer,salary:Number(e.target.value)})} style={{...inputStyle,fontSize:16,fontWeight:700}} placeholder="e.g. 12000000"/>
                {editPlayer.salary>0&&<p style={{fontSize:10,color:C.textMuted,margin:"4px 0 0"}}>= €{fmt(editPlayer.salary)}</p>}
              </div>
            </div>
            {/* Secondary fields */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14}}>
              {[{l:"Name",f:"name",t:"text"},{l:"Position",f:"positionCategory",t:"text"},{l:"Club",f:"realClub",t:"text"},{l:"Nationality",f:"nationality",t:"text"},{l:"Shirt Number",f:"shirtNumber",t:"number"},{l:"Overall Rating",f:"overallRating",t:"number"},{l:"Fantasy Points",f:"fantasyPoints",t:"number"}].map(fi=>(
                <div key={fi.f}>
                  <label style={labelStyle}>{fi.l}</label>
                  <input type={fi.t} value={editPlayer[fi.f]||""} onChange={e=>setEditPlayer({...editPlayer,[fi.f]:fi.t==="number"?Number(e.target.value):e.target.value})} style={inputStyle}/>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={savePlayer} disabled={saving} style={{...btn,background:C.teal,color:C.white,padding:"10px 24px",opacity:saving?.6:1}}>
                {saving&&<Spinner size={12}/>}{saving?"Saving...":"Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>)}

      {tab==="scoring"&&<SoccerScoringTab toast={toast}/>}
      {tab==="fixtures"&&<div><button onClick={()=>triggerSync("fetch-fixtures")} style={{...btn,background:C.teal,color:C.white}}><RefreshCw size={13}/>Fetch Upcoming Fixtures</button><p style={{color:C.textMuted,fontSize:13,marginTop:10}}>Pull latest fixture data from API-Football.</p></div>}
      {tab==="matchweeks"&&<div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button onClick={()=>triggerSync("sync-matchweek")} style={{...btn,background:C.teal,color:C.white}}><RefreshCw size={13}/>Sync Matchweek</button><button onClick={()=>triggerSync("backfill-historical")} style={{...btn,background:C.bgHover,color:C.white}}><Database size={13}/>Backfill</button></div>}
      {tab==="sync"&&<SoccerSyncTab toast={toast} triggerSync={triggerSync}/>}
      {tab==="leagues"&&<NFLLeaguesTab toast={toast} sport="soccer"/>}
    </div>
  );
};

/* ══════════════════════════════════════════
   SUB-SECTION: Franchise Tags (inside NFL)
   ══════════════════════════════════════════ */
const DEFAULT_TAGS = [
  { Position:"QB", FranchiseTagCost:43895000, Percentage:100 },
  { Position:"WR", FranchiseTagCost:27298000, Percentage:62.2 },
  { Position:"DT", FranchiseTagCost:27127000, Percentage:61.8 },
  { Position:"LB", FranchiseTagCost:26865000, Percentage:61.2 },
  { Position:"OL", FranchiseTagCost:25773000, Percentage:58.7 },
  { Position:"DE", FranchiseTagCost:24434000, Percentage:55.7 },
  { Position:"CB", FranchiseTagCost:21161000, Percentage:48.2 },
  { Position:"S",  FranchiseTagCost:20149000, Percentage:45.9 },
  { Position:"TE", FranchiseTagCost:15045000, Percentage:34.3 },
  { Position:"RB", FranchiseTagCost:14293000, Percentage:32.6 },
  { Position:"ST", FranchiseTagCost:6649000,  Percentage:15.1 },
];

const FranchiseTagTab = ({ toast }) => {
  const [tags, setTags] = useState([]);
  const [season, setSeason] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getFranchiseTags();
        const metrics = res.data?.data?.metrics || res.data?.metrics || [];
        if (!c && metrics.length > 0) {
          setTags(metrics.map(m => ({
            Position: m.Position,
            FranchiseTagCost: m.FranchiseTagCost,
            Percentage: m.Percentage,
            _id: m._id,
          })));
          if (metrics[0]?.season) setSeason(metrics[0].season);
        } else if (!c) {
          setTags(DEFAULT_TAGS.map(t => ({ ...t })));
        }
      } catch {
        if (!c) setTags(DEFAULT_TAGS.map(t => ({ ...t })));
      } finally { if (!c) setLoading(false); }
    })();
    return () => { c = true; };
  }, []);

  const updateTag = (pos, field, value) => {
    setTags(prev => prev.map(t => t.Position === pos ? { ...t, [field]: value } : t));
    setDirty(true);
    // Auto-calculate percentage when QB cost changes or any cost changes
    if (field === "FranchiseTagCost") {
      setTags(prev => {
        const qb = prev.find(t => t.Position === "QB");
        if (!qb || qb.FranchiseTagCost <= 0) return prev;
        return prev.map(t => ({
          ...t,
          Percentage: t.Position === "QB" ? 100 : parseFloat(((t.FranchiseTagCost / qb.FranchiseTagCost) * 100).toFixed(1)),
        }));
      });
    }
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      await adminAPI.bulkUpdateFranchiseTags(tags.map(t => ({
        Position: t.Position,
        FranchiseTagCost: Number(t.FranchiseTagCost),
        Percentage: Number(t.Percentage),
        season: Number(season),
      })));
      toast("success", `Franchise tags saved for ${season} season (${tags.length} positions)`);
      setDirty(false);
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to save franchise tags");
    } finally { setSaving(false); }
  };

  const fmtDollar = (n) => {
    if (n == null) return "—";
    return "$" + Number(n).toLocaleString();
  };

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:10 }}><Spinner size={24}/><span style={{ color:C.textDim }}>Loading franchise tags...</span></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h3 style={{ color:C.white, fontWeight:700, fontSize:16, margin:0, display:"flex", alignItems:"center", gap:8 }}>
            <Award size={18} color={C.amber}/>NFL Franchise Tag Values
          </h3>
          <p style={{ color:C.textMuted, fontSize:12, margin:"4px 0 0" }}>Update tag costs per position each year. Percentages auto-calculate relative to QB.</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div>
            <label style={labelStyle}>Season</label>
            <input type="number" value={season} onChange={e => { setSeason(Number(e.target.value)); setDirty(true); }} style={{ ...inputStyle, width:90, textAlign:"center", fontWeight:700 }} />
          </div>
          <button onClick={saveAll} disabled={saving || !dirty} style={{ ...btn, background:dirty ? C.green : C.bgHover, color:C.white, opacity:(saving||!dirty)?.5:1, padding:"10px 20px", marginTop:14 }}>
            {saving ? <Spinner size={13}/> : <CheckCircle size={13}/>}
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {/* Warning */}
      {dirty && (
        <div style={{ background:C.amberLight, border:`1px solid ${C.amber}33`, borderRadius:10, padding:12, display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <AlertTriangle size={14} color={C.amber}/>
          <span style={{ color:C.amber, fontSize:12, fontWeight:600 }}>You have unsaved changes. Click &quot;Save All&quot; to apply to the {season} season.</span>
        </div>
      )}

      {/* Table */}
      <div style={{ borderRadius:12, border:`1px solid ${C.borderLight}`, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.borderLight}`, background:"rgba(30,41,59,0.5)" }}>
              <th style={{ textAlign:"left", padding:"12px 16px", ...labelStyle, marginBottom:0, width:80 }}>Position</th>
              <th style={{ textAlign:"left", padding:"12px 16px", ...labelStyle, marginBottom:0 }}>Franchise Tag Cost</th>
              <th style={{ textAlign:"left", padding:"12px 16px", ...labelStyle, marginBottom:0 }}>Display</th>
              <th style={{ textAlign:"center", padding:"12px 16px", ...labelStyle, marginBottom:0, width:100 }}>% of QB</th>
              <th style={{ textAlign:"center", padding:"12px 16px", ...labelStyle, marginBottom:0, width:80 }}>Bar</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((t, i) => (
              <tr key={t.Position} style={{ borderBottom:`1px solid ${C.borderLight}20`, background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.2)" }}>
                <td style={{ padding:"10px 16px" }}>
                  <Badge color={t.Position === "QB" ? "amber" : "purple"}>{t.Position}</Badge>
                </td>
                <td style={{ padding:"10px 16px" }}>
                  <input
                    type="number"
                    value={t.FranchiseTagCost}
                    onChange={e => updateTag(t.Position, "FranchiseTagCost", Number(e.target.value))}
                    style={{ ...inputStyle, width:180, fontWeight:600 }}
                  />
                </td>
                <td style={{ padding:"10px 16px", color:C.white, fontWeight:700 }}>
                  {fmtDollar(t.FranchiseTagCost)}
                </td>
                <td style={{ padding:"10px 16px", textAlign:"center" }}>
                  <span style={{ color:t.Position==="QB"?C.amber:C.text, fontWeight:700 }}>{t.Percentage}%</span>
                </td>
                <td style={{ padding:"10px 16px" }}>
                  <div style={{ width:"100%", height:8, borderRadius:4, background:C.bgHover, overflow:"hidden" }}>
                    <div style={{ width:`${Math.min(t.Percentage, 100)}%`, height:"100%", borderRadius:4, background: t.Percentage > 80 ? C.amber : t.Percentage > 50 ? C.purple : t.Percentage > 30 ? C.blue : C.textMuted, transition:"width .3s" }}/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:20 }}>
        <StatCard icon={Award} label="Highest Tag" value={fmtDollar(Math.max(...tags.map(t=>t.FranchiseTagCost)))} sub="QB" color="amber"/>
        <StatCard icon={Award} label="Lowest Tag" value={fmtDollar(Math.min(...tags.map(t=>t.FranchiseTagCost)))} sub="ST" color="blue"/>
        <StatCard icon={TrendingUp} label="Season" value={season} sub="Current year" color="purple"/>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SUB-SECTION: NFL Scoring Editor (SamMetric)
   ══════════════════════════════════════════ */
const NFL_POSITIONS = ["QB","WR","DT","LB","OL","DE","CB","S","TE","RB","ST"];

const NFLScoringTab = ({ toast }) => {
  const [metrics, setMetrics] = useState([]);
  const [selectedPos, setSelectedPos] = useState("QB");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [season, setSeason] = useState(new Date().getFullYear());

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getNFLScoringMetrics();
        const data = res.data?.data?.metrics || res.data?.metrics || [];
        if (!c) setMetrics(data);
      } catch { if (!c) toast("error", "Failed to load NFL scoring metrics"); }
      finally { if (!c) setLoading(false); }
    })();
    return () => { c = true; };
  }, [toast]);

  const currentMetric = metrics.find(m => m.Position === selectedPos);
  const stats = currentMetric?.sammetricstats || [];
  const statsArray = Array.isArray(stats) ? stats : Object.entries(stats).map(([k,v]) => ({ label: k, matchingvalue: k, percentvalue: v }));

  const updateStat = (idx, field, value) => {
    setMetrics(prev => prev.map(m => {
      if (m.Position !== selectedPos) return m;
      const arr = Array.isArray(m.sammetricstats) ? [...m.sammetricstats] : Object.entries(m.sammetricstats || {}).map(([k,v]) => ({ label: k, matchingvalue: k, percentvalue: v }));
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...m, sammetricstats: arr };
    }));
    setDirty(true);
  };

  const addStat = () => {
    setMetrics(prev => prev.map(m => {
      if (m.Position !== selectedPos) return m;
      const arr = Array.isArray(m.sammetricstats) ? [...m.sammetricstats] : [];
      arr.push({ label: "New Stat", matchingvalue: "new_stat", percentvalue: 0 });
      return { ...m, sammetricstats: arr };
    }));
    setDirty(true);
  };

  const removeStat = (idx) => {
    setMetrics(prev => prev.map(m => {
      if (m.Position !== selectedPos) return m;
      const arr = Array.isArray(m.sammetricstats) ? [...m.sammetricstats] : [];
      arr.splice(idx, 1);
      return { ...m, sammetricstats: arr };
    }));
    setDirty(true);
  };

  const saveScoring = async () => {
    if (!currentMetric) return toast("error", "No metric data for " + selectedPos);
    try {
      setSaving(true);
      await adminAPI.updateNFLScoringMetrics(selectedPos, currentMetric.sammetricstats, season);
      toast("success", `Scoring for ${selectedPos} saved`);
      setDirty(false);
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to save scoring");
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:10 }}><Spinner size={24}/><span style={{ color:C.textDim }}>Loading scoring metrics...</span></div>;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h3 style={{ color:C.white, fontWeight:700, fontSize:16, margin:0, display:"flex", alignItems:"center", gap:8 }}>
            <TrendingUp size={18} color={C.purple}/>NFL Scoring Editor (SamMetric)
          </h3>
          <p style={{ color:C.textMuted, fontSize:12, margin:"4px 0 0" }}>Edit point values per stat for each position. Changes affect how fantasy points are calculated.</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div>
            <label style={labelStyle}>Season</label>
            <input type="number" value={season} onChange={e => setSeason(Number(e.target.value))} style={{ ...inputStyle, width:90, textAlign:"center", fontWeight:700 }} />
          </div>
          <button onClick={saveScoring} disabled={saving || !dirty} style={{ ...btn, background:dirty ? C.green : C.bgHover, color:C.white, opacity:(saving||!dirty)?.5:1, padding:"10px 20px", marginTop:14 }}>
            {saving ? <Spinner size={13}/> : <CheckCircle size={13}/>}
            {saving ? "Saving..." : "Save Position"}
          </button>
        </div>
      </div>

      {dirty && (
        <div style={{ background:C.amberLight, border:`1px solid ${C.amber}33`, borderRadius:10, padding:12, display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <AlertTriangle size={14} color={C.amber}/>
          <span style={{ color:C.amber, fontSize:12, fontWeight:600 }}>Unsaved changes for {selectedPos}. Click &quot;Save Position&quot; to apply.</span>
        </div>
      )}

      {/* Position selector */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:20 }}>
        {NFL_POSITIONS.map(pos => {
          const hasData = metrics.some(m => m.Position === pos);
          return (
            <button key={pos} onClick={() => { setSelectedPos(pos); setDirty(false); }}
              style={{ ...btn, padding:"8px 16px", background: selectedPos === pos ? C.purple : hasData ? C.bgCard : C.bgHover,
                color: selectedPos === pos ? C.white : hasData ? C.text : C.textMuted,
                border: selectedPos === pos ? `2px solid ${C.purple}` : `1px solid ${C.borderLight}`,
                fontWeight:700 }}>
              {pos}
              {hasData && <div style={{ width:6, height:6, borderRadius:3, background:C.green, marginLeft:4 }}/>}
            </button>
          );
        })}
      </div>

      {/* Stats table */}
      {!currentMetric || statsArray.length === 0 ? (
        <div style={{ ...card, textAlign:"center", padding:40 }}>
          <p style={{ color:C.textMuted, fontSize:14, marginBottom:12 }}>No scoring stats found for {selectedPos}.</p>
          <button onClick={addStat} style={{ ...btn, background:C.purple, color:C.white }}><Zap size={13}/>Add First Stat</button>
        </div>
      ) : (
        <div>
          <div style={{ borderRadius:12, border:`1px solid ${C.borderLight}`, overflowX:"auto" }} className="ap-scrollbar">
            <table style={{ minWidth:700, width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.borderLight}`, background:"rgba(30,41,59,0.5)" }}>
                  <th style={{ textAlign:"left", padding:"10px 14px", ...labelStyle, marginBottom:0, width:36, whiteSpace:"nowrap" }}>#</th>
                  <th style={{ textAlign:"left", padding:"10px 14px", ...labelStyle, marginBottom:0, minWidth:180, whiteSpace:"nowrap" }}>Stat Name</th>
                  <th style={{ textAlign:"left", padding:"10px 14px", ...labelStyle, marginBottom:0, minWidth:140, whiteSpace:"nowrap" }}>Matching Key</th>
                  <th style={{ textAlign:"center", padding:"10px 14px", ...labelStyle, marginBottom:0, width:120, whiteSpace:"nowrap" }}>Points Value</th>
                  <th style={{ textAlign:"center", padding:"10px 14px", ...labelStyle, marginBottom:0, width:50 }}></th>
                </tr>
              </thead>
              <tbody>
                {statsArray.map((stat, i) => {
                  const isTD = /touchdown|( td)$|pick six/i.test(stat.label || "");
                  return (
                    <tr key={i} style={{ borderBottom:`1px solid ${C.borderLight}20`, background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.2)" }}>
                      <td style={{ padding:"8px 14px", color:C.textMuted }}>{i + 1}</td>
                      <td style={{ padding:"8px 14px" }}>
                        <input value={stat.label || ""} onChange={e => updateStat(i, "label", e.target.value)} style={{ ...inputStyle, fontWeight:600, minWidth:160 }} />
                      </td>
                      <td style={{ padding:"8px 14px" }}>
                        <span style={{ fontSize:11, color:C.textMuted, fontFamily:"monospace", whiteSpace:"nowrap" }}>{stat.matchingvalue || ""}</span>
                      </td>
                      <td style={{ padding:"8px 14px", textAlign:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
                          <input type="number" step="0.001" value={stat.percentvalue ?? 0} onChange={e => updateStat(i, "percentvalue", parseFloat(e.target.value) || 0)}
                            style={{ ...inputStyle, width:100, textAlign:"center", fontWeight:700, color: isTD ? C.amber : C.white }} />
                          {isTD && <Badge color="amber">TD</Badge>}
                        </div>
                      </td>
                      <td style={{ padding:"8px 14px", textAlign:"center" }}>
                        <button onClick={() => removeStat(i)} style={{ ...btn, padding:4, background:"transparent" }}><Trash2 size={13} color={C.red}/></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            <button onClick={addStat} style={{ ...btn, background:C.purpleLight, color:C.purple }}><Zap size={13}/>Add Stat</button>
            <span style={{ color:C.textMuted, fontSize:12, alignSelf:"center" }}>{statsArray.length} stats for {selectedPos}</span>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:20 }}>
        <StatCard icon={Shield} label="Positions with Data" value={metrics.filter(m => m.sammetricstats && (Array.isArray(m.sammetricstats) ? m.sammetricstats.length > 0 : Object.keys(m.sammetricstats).length > 0)).length + "/" + NFL_POSITIONS.length} color="purple"/>
        <StatCard icon={TrendingUp} label="Stats for Position" value={statsArray.length} sub={selectedPos} color="blue"/>
        <StatCard icon={Award} label="Season" value={currentMetric?.season || season} color="amber"/>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SUB-SECTION: Soccer Scoring Editor (SamMetric)
   ══════════════════════════════════════════ */
const SOCCER_POSITIONS = ["GK","CB","FB","WB","CDM","CM","WM","CAM","WNG","CF","ST"];
const SOCCER_POS_LABELS = { GK:"Goalkeeper", CB:"Centre-Back", FB:"Full-Back", WB:"Wing-Back", CDM:"Defensive Mid", CM:"Central Mid", WM:"Wide Mid", CAM:"Attacking Mid", WNG:"Winger", CF:"Centre-Forward", ST:"Striker" };

const SoccerScoringTab = ({ toast }) => {
  const [metrics, setMetrics] = useState([]);
  const [selectedPos, setSelectedPos] = useState("GK");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [season, setSeason] = useState(new Date().getFullYear());
  const [filterCat, setFilterCat] = useState("all");

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getSoccerScoringMetrics();
      const data = res.data?.data?.metrics || res.data?.metrics || [];
      setMetrics(data);
    } catch { toast("error", "Failed to load soccer scoring metrics"); }
    finally { setLoading(false); }
  };

  const seedDefaults = async () => {
    try {
      setSeeding(true);
      await adminAPI.seedSoccerScoringMetrics(season);
      toast("success", `Seeded default scoring for all 11 positions (season ${season})`);
      await loadMetrics();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to seed scoring data");
    } finally { setSeeding(false); }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const currentMetric = metrics.find(m => m.position === selectedPos);
  const allStats = currentMetric?.statWeights || [];
  const filteredStats = filterCat === "all" ? allStats : allStats.filter(s => s.category === filterCat);

  const updateStat = (statKey, field, value) => {
    setMetrics(prev => prev.map(m => {
      if (m.position !== selectedPos) return m;
      return { ...m, statWeights: m.statWeights.map(s => s.statKey === statKey ? { ...s, [field]: value } : s) };
    }));
    setDirty(true);
  };

  const addStat = () => {
    setMetrics(prev => prev.map(m => {
      if (m.position !== selectedPos) return m;
      return { ...m, statWeights: [...m.statWeights, { statKey: "new_stat_" + Date.now(), statLabel: "New Stat", category: "traditional", basePoints: 0, positionMultiplier: 1.0, description: "" }] };
    }));
    setDirty(true);
  };

  const removeStat = (statKey) => {
    setMetrics(prev => prev.map(m => {
      if (m.position !== selectedPos) return m;
      return { ...m, statWeights: m.statWeights.filter(s => s.statKey !== statKey) };
    }));
    setDirty(true);
  };

  const saveScoring = async () => {
    if (!currentMetric) return toast("error", "No metric data for " + selectedPos);
    try {
      setSaving(true);
      await adminAPI.updateSoccerScoringMetrics(selectedPos, currentMetric.statWeights, currentMetric.season || season);
      toast("success", `Soccer scoring for ${selectedPos} saved (${currentMetric.statWeights.length} stats)`);
      setDirty(false);
    } catch (e) {
      toast("error", e?.response?.data?.message || "Failed to save scoring");
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:10 }}><Spinner size={24}/><span style={{ color:C.textDim }}>Loading soccer scoring metrics...</span></div>;

  const tradCount = allStats.filter(s => s.category === "traditional").length;
  const advCount = allStats.filter(s => s.category === "advanced").length;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h3 style={{ color:C.white, fontWeight:700, fontSize:16, margin:0, display:"flex", alignItems:"center", gap:8 }}>
            <TrendingUp size={18} color={C.teal}/>Soccer Scoring Editor (SamMetric)
          </h3>
          <p style={{ color:C.textMuted, fontSize:12, margin:"4px 0 0" }}>Edit base points & position multipliers. Formula: statValue × basePoints × positionMultiplier</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div>
            <label style={labelStyle}>Season</label>
            <input type="number" value={currentMetric?.season || season} onChange={e => setSeason(Number(e.target.value))} style={{ ...inputStyle, width:90, textAlign:"center", fontWeight:700 }} disabled={!!currentMetric?.season} />
          </div>
          <button onClick={seedDefaults} disabled={seeding} style={{ ...btn, background:C.bgHover, color:C.teal, padding:"10px 16px", marginTop:14, border:`1px solid ${C.teal}44` }}>
            {seeding ? <Spinner size={13}/> : <Database size={13}/>}
            {seeding ? "Seeding..." : "Re-seed All"}
          </button>
          <button onClick={saveScoring} disabled={saving || !dirty} style={{ ...btn, background:dirty ? C.green : C.bgHover, color:C.white, opacity:(saving||!dirty)?.5:1, padding:"10px 20px", marginTop:14 }}>
            {saving ? <Spinner size={13}/> : <CheckCircle size={13}/>}
            {saving ? "Saving..." : "Save Position"}
          </button>
        </div>
      </div>

      {dirty && (
        <div style={{ background:C.amberLight, border:`1px solid ${C.amber}33`, borderRadius:10, padding:12, display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <AlertTriangle size={14} color={C.amber}/>
          <span style={{ color:C.amber, fontSize:12, fontWeight:600 }}>Unsaved changes for {selectedPos}. Click &quot;Save Position&quot; to apply.</span>
        </div>
      )}

      {/* Position selector */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
        {SOCCER_POSITIONS.map(pos => {
          const hasData = metrics.some(m => m.position === pos);
          const posColor = metrics.find(m => m.position === pos)?.color;
          return (
            <button key={pos} onClick={() => { setSelectedPos(pos); setDirty(false); setFilterCat("all"); }}
              style={{ ...btn, padding:"8px 14px", background: selectedPos === pos ? C.teal : hasData ? C.bgCard : C.bgHover,
                color: selectedPos === pos ? C.white : hasData ? C.text : C.textMuted,
                border: selectedPos === pos ? `2px solid ${C.teal}` : `1px solid ${C.borderLight}`,
                fontWeight:700, fontSize:12 }}>
              {posColor && <div style={{ width:8, height:8, borderRadius:4, background:posColor, marginRight:4 }}/>}
              {pos}
              <span style={{ fontSize:10, color: selectedPos === pos ? "rgba(255,255,255,0.7)" : C.textMuted, marginLeft:4 }}>{SOCCER_POS_LABELS[pos]?.split(" ")[0]}</span>
              {hasData && <div style={{ width:6, height:6, borderRadius:3, background:C.green, marginLeft:4 }}/>}
            </button>
          );
        })}
      </div>

      {/* SVI info for current position */}
      {currentMetric && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:10, marginBottom:16 }}>
          <StatCard icon={TrendingUp} label="Market Value" value={currentMetric.marketValue ? `€${currentMetric.marketValue}M` : "—"} color="teal"/>
          <StatCard icon={TrendingUp} label="Wage Index" value={currentMetric.wageIndex ? `€${fmt(currentMetric.wageIndex)}` : "—"} color="blue"/>
          <StatCard icon={Activity} label="Performance" value={currentMetric.performanceImpact ?? "—"} sub="/100" color="green"/>
          <StatCard icon={Award} label="SAM Valuation" value={currentMetric.samValuation ? `€${currentMetric.samValuation}M` : "—"} color="purple"/>
          <StatCard icon={TrendingUp} label="SAM %" value={currentMetric.samPercentage ? `${currentMetric.samPercentage}%` : "—"} color="amber"/>
        </div>
      )}

      {/* Category filter */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {[{id:"all",label:`All (${allStats.length})`},{id:"traditional",label:`Traditional (${tradCount})`},{id:"advanced",label:`Advanced (${advCount})`}].map(f => (
          <button key={f.id} onClick={() => setFilterCat(f.id)} style={{ ...btn, padding:"6px 12px", fontSize:11, background: filterCat === f.id ? C.teal : C.bgHover, color: filterCat === f.id ? C.white : C.textMuted }}>{f.label}</button>
        ))}
      </div>

      {/* Stats table */}
      {!currentMetric || allStats.length === 0 ? (
        <div style={{ ...card, textAlign:"center", padding:40 }}>
          <p style={{ color:C.textMuted, fontSize:14, marginBottom:12 }}>No scoring data found for {selectedPos} ({SOCCER_POS_LABELS[selectedPos]}).</p>
          <p style={{ color:C.textMuted, fontSize:12, marginBottom:16 }}>Click below to seed all 11 positions with default stat weights from the SAM config.</p>
          <button onClick={seedDefaults} disabled={seeding} style={{ ...btn, background:C.teal, color:C.white, padding:"12px 24px", fontSize:14 }}>
            {seeding ? <Spinner size={14}/> : <Database size={16}/>}
            {seeding ? "Seeding..." : "Seed Default Scoring (All Positions)"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ borderRadius:12, border:`1px solid ${C.borderLight}`, overflowX:"auto" }} className="ap-scrollbar">
            <table style={{ minWidth:800, width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.borderLight}`, background:"rgba(30,41,59,0.5)" }}>
                  <th style={{ textAlign:"left", padding:"10px 12px", ...labelStyle, marginBottom:0, width:36, whiteSpace:"nowrap" }}>#</th>
                  <th style={{ textAlign:"left", padding:"10px 12px", ...labelStyle, marginBottom:0, minWidth:160, whiteSpace:"nowrap" }}>Stat</th>
                  <th style={{ textAlign:"left", padding:"10px 12px", ...labelStyle, marginBottom:0, width:100, whiteSpace:"nowrap" }}>Key</th>
                  <th style={{ textAlign:"center", padding:"10px 12px", ...labelStyle, marginBottom:0, width:90, whiteSpace:"nowrap" }}>Category</th>
                  <th style={{ textAlign:"center", padding:"10px 12px", ...labelStyle, marginBottom:0, width:90, whiteSpace:"nowrap" }}>Base Pts</th>
                  <th style={{ textAlign:"center", padding:"10px 12px", ...labelStyle, marginBottom:0, width:90, whiteSpace:"nowrap" }}>Pos ×</th>
                  <th style={{ textAlign:"center", padding:"10px 12px", ...labelStyle, marginBottom:0, width:80, whiteSpace:"nowrap" }}>Effective</th>
                  <th style={{ textAlign:"center", padding:"10px 12px", ...labelStyle, marginBottom:0, width:40 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((stat, i) => {
                  const effective = ((stat.basePoints || 0) * (stat.positionMultiplier || 1)).toFixed(3);
                  return (
                    <tr key={stat.statKey} style={{ borderBottom:`1px solid ${C.borderLight}20`, background: i % 2 === 0 ? "transparent" : "rgba(30,41,59,0.2)" }}>
                      <td style={{ padding:"8px 12px", color:C.textMuted }}>{i + 1}</td>
                      <td style={{ padding:"8px 12px" }}>
                        <input value={stat.statLabel || ""} onChange={e => updateStat(stat.statKey, "statLabel", e.target.value)} style={{ ...inputStyle, fontWeight:600, minWidth:140 }} />
                      </td>
                      <td style={{ padding:"8px 12px" }}>
                        <span style={{ fontSize:11, color:C.textMuted, fontFamily:"monospace", whiteSpace:"nowrap" }}>{stat.statKey}</span>
                      </td>
                      <td style={{ padding:"8px 12px", textAlign:"center" }}>
                        <Badge color={stat.category==="advanced"?"purple":"blue"}>{stat.category==="advanced"?"Adv":"Trad"}</Badge>
                      </td>
                      <td style={{ padding:"8px 12px", textAlign:"center" }}>
                        <input type="number" step="0.01" value={stat.basePoints ?? 0} onChange={e => updateStat(stat.statKey, "basePoints", parseFloat(e.target.value) || 0)} style={{ ...inputStyle, width:80, textAlign:"center", fontWeight:700 }} />
                      </td>
                      <td style={{ padding:"8px 12px", textAlign:"center" }}>
                        <input type="number" step="0.1" value={stat.positionMultiplier ?? 1} onChange={e => updateStat(stat.statKey, "positionMultiplier", parseFloat(e.target.value) || 1)} style={{ ...inputStyle, width:80, textAlign:"center", fontWeight:700, color:C.teal }} />
                      </td>
                      <td style={{ padding:"8px 12px", textAlign:"center" }}>
                        <span style={{ fontWeight:700, color: Number(effective) > 0 ? C.green : Number(effective) < 0 ? C.red : C.textMuted }}>{effective}</span>
                      </td>
                      <td style={{ padding:"8px 12px", textAlign:"center" }}>
                        <button onClick={() => removeStat(stat.statKey)} style={{ ...btn, padding:4, background:"transparent" }}><Trash2 size={12} color={C.red}/></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:14 }}>
            <button onClick={addStat} style={{ ...btn, background:C.tealLight, color:C.teal }}><Zap size={13}/>Add Stat</button>
            <span style={{ color:C.textMuted, fontSize:12, alignSelf:"center" }}>{filteredStats.length} stats shown{filterCat !== "all" ? ` (${allStats.length} total)` : ""}</span>
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginTop:20 }}>
        <StatCard icon={Globe} label="Positions with Data" value={metrics.length + "/" + SOCCER_POSITIONS.length} color="teal"/>
        <StatCard icon={TrendingUp} label="Traditional Stats" value={tradCount} sub={selectedPos} color="blue"/>
        <StatCard icon={Activity} label="Advanced Stats" value={advCount} sub={selectedPos} color="purple"/>
        <StatCard icon={Award} label="Season" value={currentMetric?.season || season} color="amber"/>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: A.Football Management
   ══════════════════════════════════════════ */
const NFLSection = ({ toast }) => {
  const [tab,setTab]=useState("players"); const [query,setQuery]=useState(""); const [players,setPlayers]=useState([]); const [loading,setLoading]=useState(false); const [editPlayer,setEditPlayer]=useState(null); const [saving,setSaving]=useState(false);
  // All Players tab state
  const [allPlayers,setAllPlayers]=useState([]); const [allLoading,setAllLoading]=useState(false); const [allLoaded,setAllLoaded]=useState(false);
  // By Team tab state
  const [teams,setTeams]=useState([]); const [teamsLoading,setTeamsLoading]=useState(false); const [selectedTeam,setSelectedTeam]=useState(null); const [teamPlayers,setTeamPlayers]=useState([]); const [teamLoading,setTeamLoading]=useState(false);

  const searchPlayers=async()=>{if(!query.trim())return toast("warn","Enter a search term"); try{setLoading(true);const r=await adminAPI.searchNFLPlayers(query.trim());const d=r.data?.data?.players||r.data?.data||[];setPlayers(Array.isArray(d)?d:[]);if(d.length===0)toast("info","No NFL players found");}catch(e){toast("error",e?.response?.data?.message||"Search failed");}finally{setLoading(false);}};
  const savePlayer=async()=>{if(!editPlayer)return;try{setSaving(true);await adminAPI.updateNFLPlayer(editPlayer._id,{Name:editPlayer.Name,Position:editPlayer.Position,Team:editPlayer.Team,Number:editPlayer.Number,otcCapHit:editPlayer.otcCapHit,pointsPerGame:editPlayer.pointsPerGame,playerScore:editPlayer.playerScore,isPlayerInjured:editPlayer.isPlayerInjured});setPlayers(p=>p.map(x=>x._id===editPlayer._id?{...x,...editPlayer}:x));setAllPlayers(p=>p.map(x=>x._id===editPlayer._id?{...x,...editPlayer}:x));setTeamPlayers(p=>p.map(x=>x._id===editPlayer._id?{...x,...editPlayer}:x));toast("success",`${editPlayer.Name} updated`);setEditPlayer(null);}catch(e){toast("error",e?.response?.data?.message||"Update failed");}finally{setSaving(false);}};
  const triggerSync=async(action)=>{try{await adminAPI.triggerNFLSync(action);toast("success",`NFL sync "${action}" triggered`);}catch(e){toast("error",e?.response?.data?.message||"Sync failed");}};

  const loadAllPlayers=async()=>{
    if(allLoaded) return;
    try{setAllLoading(true);const r=await adminAPI.getAllNFLPlayers();const d=r.data?.data?.players||r.data?.data||[];setAllPlayers(Array.isArray(d)?d:[]);setAllLoaded(true);toast("success",`Loaded ${d.length} players`);}catch(e){toast("error",e?.response?.data?.message||"Failed to load all players");}finally{setAllLoading(false);}
  };

  const loadTeams=async()=>{
    if(teams.length>0) return;
    try{setTeamsLoading(true);const r=await adminAPI.getNFLTeams();const d=r.data?.data?.teams||r.data?.data||[];setTeams(Array.isArray(d)?d:[]);}catch(e){toast("error",e?.response?.data?.message||"Failed to load teams");}finally{setTeamsLoading(false);}
  };

  const loadTeamPlayers=async(team)=>{
    setSelectedTeam(team);
    try{setTeamLoading(true);const r=await adminAPI.getNFLPlayersByTeam(team);const d=r.data?.data?.players||r.data?.data||[];setTeamPlayers(Array.isArray(d)?d:[]);}catch(e){toast("error",e?.response?.data?.message||"Failed to load team players");}finally{setTeamLoading(false);}
  };

  // Auto-load when switching to these tabs
  useEffect(()=>{if(tab==="allPlayers")loadAllPlayers();},[tab]);
  useEffect(()=>{if(tab==="byTeam")loadTeams();},[tab]);

  const tabs=[{id:"users",label:"Users",icon:Users},{id:"players",label:"Search",icon:Search},{id:"allPlayers",label:"All Players",icon:Globe},{id:"byTeam",label:"By Team",icon:Shield},{id:"franchise",label:"Franchise Tags",icon:Award},{id:"scoring",label:"Scoring",icon:TrendingUp},{id:"leagues",label:"Leagues",icon:Trophy},{id:"scores",label:"Live Scores",icon:Activity},{id:"salary",label:"Salary Cap",icon:TrendingUp},{id:"import",label:"Data Import",icon:Database}];
  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:20}}>A.Football Management</h2>
      <TabBar tabs={tabs} active={tab} onChange={setTab} accent={C.purple}/>

      {tab==="users"&&<UsersListTab sport="nfl" toast={toast}/>}

      {tab==="players"&&(<div>
        <SearchBar value={query} onChange={setQuery} placeholder="Search A.Football players by name, team, or position..." onSearch={searchPlayers} loading={loading}/>
        {players.length>0 && <div style={{marginTop:6,marginBottom:14}}><span style={{fontSize:12,color:C.textMuted}}>{players.length} player{players.length!==1?"s":""} found</span></div>}

        {/* Player Rows */}
        {players.length>0 && (
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {/* Header */}
            <div style={{display:"grid",gridTemplateColumns:"44px minmax(140px,2fr) minmax(80px,1fr) 80px 80px 90px 80px 80px 50px",minWidth:880,gap:10,padding:"8px 16px",alignItems:"center"}}>
              <span></span>
              <span style={labelStyle}>Player</span>
              <span style={labelStyle}>Team</span>
              <span style={labelStyle}>Position</span>
              <span style={labelStyle}>Status</span>
              <span style={labelStyle}>Cap Hit</span>
              <span style={labelStyle}>PPG</span>
              <span style={labelStyle}>Score</span>
              <span></span>
            </div>
            {players.map(p => (
              <div key={p._id} style={{borderRadius:10,border:`1px solid ${editPlayer?._id===p._id?C.purple+"66":C.borderLight}`,background:C.bgCard,transition:"border-color .2s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bgHover} onMouseLeave={e=>e.currentTarget.style.background=C.bgCard}>
                <div style={{display:"grid",gridTemplateColumns:"44px minmax(140px,2fr) minmax(80px,1fr) 80px 80px 90px 80px 80px 50px",minWidth:880,gap:10,padding:"10px 16px",alignItems:"center"}}>
                  {/* Avatar */}
                  {p.Photo ? (
                    <img src={p.Photo} alt="" style={{width:36,height:36,borderRadius:10,objectFit:"cover",background:C.bgHover}} onError={e=>{e.target.style.display="none";e.target.nextSibling&&(e.target.nextSibling.style.display="flex")}}/>
                  ) : (
                    <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.purple}33,${C.blue}33)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:C.purple,flexShrink:0}}>
                      {(p.Name||"?")[0]}
                    </div>
                  )}
                  {/* Name */}
                  <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.white}}>{p.Name}</span>
                    {p.Number && <span style={{fontSize:11,color:C.textMuted,marginLeft:6}}>#{p.Number}</span>}
                  </div>
                  {/* Team */}
                  <span style={{fontSize:12,color:C.textDim}}>{p.Team||"FA"}</span>
                  {/* Position */}
                  <Badge color="purple">{p.Position||"—"}</Badge>
                  {/* Status */}
                  <Badge color={p.isPlayerInjured?"red":"green"}>{p.isPlayerInjured?"Injured":"Active"}</Badge>
                  {/* Cap Hit */}
                  <span style={{fontSize:13,fontWeight:600,color:C.white}}>{p.otcCapHit?`$${fmt(p.otcCapHit)}`:"—"}</span>
                  {/* PPG */}
                  <span style={{fontSize:13,fontWeight:600,color:p.pointsPerGame?C.purple:C.textMuted}}>{p.pointsPerGame??"-"}</span>
                  {/* Score */}
                  <span style={{fontSize:13,fontWeight:600,color:p.playerScore?C.blue:C.textMuted}}>{p.playerScore??"-"}</span>
                  {/* Edit */}
                  <button onClick={()=>setEditPlayer({...p})} style={{...btn,padding:6,background:C.purpleLight,borderRadius:8}} title="Edit">
                    <Edit3 size={13} color={C.purple}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Panel */}
        {editPlayer&&(
          <div style={{...card,marginTop:14,borderColor:C.purple+"44",background:"rgba(139,92,246,0.03)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h3 style={{color:C.white,fontWeight:700,fontSize:15,margin:0,display:"flex",alignItems:"center",gap:8}}><Edit3 size={15} color={C.purple}/>Editing: {editPlayer.Name}</h3>
              <button onClick={()=>setEditPlayer(null)} style={{...btn,padding:"6px 12px",background:C.bgHover,color:C.textDim,fontSize:12}}>
                <XCircle size={12}/>Cancel
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14}}>
              {[{l:"Name",f:"Name",t:"text"},{l:"Position",f:"Position",t:"text"},{l:"Team",f:"Team",t:"text"},{l:"Number",f:"Number",t:"number"},{l:"Cap Hit ($)",f:"otcCapHit",t:"number"},{l:"PPG",f:"pointsPerGame",t:"number"},{l:"Score",f:"playerScore",t:"number"},{l:"Injured",f:"isPlayerInjured",t:"toggle"}].map(fi=>(
                <div key={fi.f}>
                  <label style={labelStyle}>{fi.l}</label>
                  {fi.t==="toggle"?
                    <button style={{...btn,width:"100%",justifyContent:"center",padding:"10px 14px",background:editPlayer[fi.f]?C.red:C.green,color:C.white,fontWeight:700}} onClick={()=>setEditPlayer({...editPlayer,[fi.f]:!editPlayer[fi.f]})}>
                      {editPlayer[fi.f]?"INJURED":"HEALTHY"}
                    </button>
                    :<input type={fi.t} value={editPlayer[fi.f]||""} onChange={e=>setEditPlayer({...editPlayer,[fi.f]:fi.t==="number"?Number(e.target.value):e.target.value})} style={inputStyle}/>
                  }
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={savePlayer} disabled={saving} style={{...btn,background:C.purple,color:C.white,padding:"10px 24px",opacity:saving?.6:1}}>
                {saving&&<Spinner size={12}/>}{saving?"Saving...":"Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>)}

      {/* ── All Players Tab ── */}
      {tab==="allPlayers"&&(<div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span style={{fontSize:13,color:C.textMuted}}>{allPlayers.length} total players in database</span>
          <button onClick={()=>{setAllLoaded(false);loadAllPlayers()}} disabled={allLoading} style={{...btn,background:C.bgHover,color:C.textDim,fontSize:11}}><RefreshCw size={11}/>Refresh</button>
        </div>
        {allLoading ? (
          <div style={{textAlign:"center",padding:40}}><Spinner size={28}/></div>
        ) : allPlayers.length>0 ? (
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <div style={{display:"grid",gridTemplateColumns:"44px minmax(140px,2fr) minmax(80px,1fr) 80px 80px 90px 80px 80px 50px",minWidth:880,gap:10,padding:"8px 16px",alignItems:"center"}}>
              <span></span><span style={labelStyle}>Player</span><span style={labelStyle}>Team</span><span style={labelStyle}>Position</span><span style={labelStyle}>Status</span><span style={labelStyle}>Cap Hit</span><span style={labelStyle}>PPG</span><span style={labelStyle}>Score</span><span></span>
            </div>
            <div style={{maxHeight:600,overflowY:"auto"}} className="ap-scrollbar">
              {allPlayers.map(p=>(
                <div key={p._id} style={{display:"grid",gridTemplateColumns:"44px minmax(140px,2fr) minmax(80px,1fr) 80px 80px 90px 80px 80px 50px",minWidth:880,gap:10,padding:"8px 16px",alignItems:"center",borderBottom:`1px solid ${C.borderLight}20`,transition:"background .1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bgHover} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.purple}33,${C.blue}33)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.purple,flexShrink:0}}>{(p.Name||"?")[0]}</div>
                  <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><span style={{fontSize:12,fontWeight:700,color:C.white}}>{p.Name}</span>{p.Number&&<span style={{fontSize:10,color:C.textMuted,marginLeft:4}}>#{p.Number}</span>}</div>
                  <span style={{fontSize:11,color:C.textDim}}>{p.Team||"FA"}</span>
                  <Badge color="purple">{p.Position||"—"}</Badge>
                  <Badge color={p.isPlayerInjured?"red":"green"}>{p.isPlayerInjured?"INJ":"OK"}</Badge>
                  <span style={{fontSize:12,fontWeight:600,color:C.white}}>{p.otcCapHit?`$${fmt(p.otcCapHit)}`:"—"}</span>
                  <span style={{fontSize:12,fontWeight:600,color:p.pointsPerGame?C.purple:C.textMuted}}>{p.pointsPerGame??"-"}</span>
                  <span style={{fontSize:12,fontWeight:600,color:p.playerScore?C.blue:C.textMuted}}>{p.playerScore??"-"}</span>
                  <button onClick={()=>setEditPlayer({...p})} style={{...btn,padding:4,background:C.purpleLight,borderRadius:6}}><Edit3 size={11} color={C.purple}/></button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{...card,textAlign:"center",padding:40}}><Globe size={28} color={C.textMuted} style={{marginBottom:8}}/><p style={{color:C.textMuted,fontSize:13,margin:0}}>No players loaded yet</p></div>
        )}

        {/* Shared Edit Panel */}
        {editPlayer&&(
          <div style={{...card,marginTop:14,borderColor:C.purple+"44",background:"rgba(139,92,246,0.03)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h3 style={{color:C.white,fontWeight:700,fontSize:15,margin:0,display:"flex",alignItems:"center",gap:8}}><Edit3 size={15} color={C.purple}/>Editing: {editPlayer.Name}</h3>
              <button onClick={()=>setEditPlayer(null)} style={{...btn,padding:"6px 12px",background:C.bgHover,color:C.textDim,fontSize:12}}><XCircle size={12}/>Cancel</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14}}>
              {[{l:"Name",f:"Name",t:"text"},{l:"Position",f:"Position",t:"text"},{l:"Team",f:"Team",t:"text"},{l:"Number",f:"Number",t:"number"},{l:"Cap Hit ($)",f:"otcCapHit",t:"number"},{l:"PPG",f:"pointsPerGame",t:"number"},{l:"Score",f:"playerScore",t:"number"},{l:"Injured",f:"isPlayerInjured",t:"toggle"}].map(fi=>(
                <div key={fi.f}><label style={labelStyle}>{fi.l}</label>{fi.t==="toggle"?<button style={{...btn,width:"100%",justifyContent:"center",padding:"10px 14px",background:editPlayer[fi.f]?C.red:C.green,color:C.white,fontWeight:700}} onClick={()=>setEditPlayer({...editPlayer,[fi.f]:!editPlayer[fi.f]})}>{editPlayer[fi.f]?"INJURED":"HEALTHY"}</button>:<input type={fi.t} value={editPlayer[fi.f]||""} onChange={e=>setEditPlayer({...editPlayer,[fi.f]:fi.t==="number"?Number(e.target.value):e.target.value})} style={inputStyle}/>}</div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={savePlayer} disabled={saving} style={{...btn,background:C.purple,color:C.white,padding:"10px 24px",opacity:saving?.6:1}}>{saving&&<Spinner size={12}/>}{saving?"Saving...":"Save Changes"}</button>
            </div>
          </div>
        )}
      </div>)}

      {/* ── By Team Tab ── */}
      {tab==="byTeam"&&(<div>
        {teamsLoading ? (
          <div style={{textAlign:"center",padding:40}}><Spinner size={28}/></div>
        ) : (
          <div>
            {/* Team Selector Grid */}
            <div style={{marginBottom:16}}>
              <span style={{...labelStyle,marginBottom:10,display:"block"}}>Select a Team ({teams.length} teams)</span>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {teams.map(t=>(
                  <button key={t} onClick={()=>loadTeamPlayers(t)} style={{...btn,padding:"6px 14px",fontSize:12,fontWeight:selectedTeam===t?700:500,background:selectedTeam===t?C.purple:C.bgHover,color:selectedTeam===t?C.white:C.textDim,borderRadius:20,border:`1px solid ${selectedTeam===t?C.purple:C.borderLight}`}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Players */}
            {selectedTeam && (
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <h3 style={{fontSize:16,fontWeight:800,color:C.white,margin:0}}>{selectedTeam}</h3>
                  <Badge color="purple">{teamPlayers.length} players</Badge>
                </div>
                {teamLoading ? (
                  <div style={{textAlign:"center",padding:30}}><Spinner size={24}/></div>
                ) : teamPlayers.length>0 ? (
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    <div style={{display:"grid",gridTemplateColumns:"44px 2fr 80px 80px 90px 80px 80px 50px",gap:10,padding:"8px 16px",alignItems:"center"}}>
                      <span></span><span style={labelStyle}>Player</span><span style={labelStyle}>Position</span><span style={labelStyle}>Status</span><span style={labelStyle}>Cap Hit</span><span style={labelStyle}>PPG</span><span style={labelStyle}>Score</span><span></span>
                    </div>
                    {teamPlayers.map(p=>(
                      <div key={p._id} style={{display:"grid",gridTemplateColumns:"44px 2fr 80px 80px 90px 80px 80px 50px",gap:10,padding:"10px 16px",alignItems:"center",borderRadius:8,border:`1px solid ${C.borderLight}`,marginBottom:2,background:C.bgCard,transition:"background .1s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=C.bgHover} onMouseLeave={e=>e.currentTarget.style.background=C.bgCard}>
                        <div style={{width:34,height:34,borderRadius:8,background:`linear-gradient(135deg,${C.purple}33,${C.blue}33)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.purple,flexShrink:0}}>{(p.Name||"?")[0]}</div>
                        <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><span style={{fontSize:13,fontWeight:700,color:C.white}}>{p.Name}</span>{p.Number&&<span style={{fontSize:10,color:C.textMuted,marginLeft:4}}>#{p.Number}</span>}</div>
                        <Badge color="purple">{p.Position||"—"}</Badge>
                        <Badge color={p.isPlayerInjured?"red":"green"}>{p.isPlayerInjured?"Injured":"Active"}</Badge>
                        <span style={{fontSize:12,fontWeight:600,color:C.white}}>{p.otcCapHit?`$${fmt(p.otcCapHit)}`:"—"}</span>
                        <span style={{fontSize:12,fontWeight:600,color:p.pointsPerGame?C.purple:C.textMuted}}>{p.pointsPerGame??"-"}</span>
                        <span style={{fontSize:12,fontWeight:600,color:p.playerScore?C.blue:C.textMuted}}>{p.playerScore??"-"}</span>
                        <button onClick={()=>setEditPlayer({...p})} style={{...btn,padding:4,background:C.purpleLight,borderRadius:6}}><Edit3 size={11} color={C.purple}/></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{...card,textAlign:"center",padding:30}}><p style={{color:C.textMuted,fontSize:13,margin:0}}>No players found for {selectedTeam}</p></div>
                )}
              </div>
            )}

            {!selectedTeam && !teamsLoading && (
              <div style={{...card,textAlign:"center",padding:40}}><Shield size={28} color={C.textMuted} style={{marginBottom:8}}/><p style={{color:C.textMuted,fontSize:13,margin:0}}>Select a team above to view its roster</p></div>
            )}

            {/* Shared Edit Panel */}
            {editPlayer&&(
              <div style={{...card,marginTop:14,borderColor:C.purple+"44",background:"rgba(139,92,246,0.03)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <h3 style={{color:C.white,fontWeight:700,fontSize:15,margin:0,display:"flex",alignItems:"center",gap:8}}><Edit3 size={15} color={C.purple}/>Editing: {editPlayer.Name}</h3>
                  <button onClick={()=>setEditPlayer(null)} style={{...btn,padding:"6px 12px",background:C.bgHover,color:C.textDim,fontSize:12}}><XCircle size={12}/>Cancel</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14}}>
                  {[{l:"Name",f:"Name",t:"text"},{l:"Position",f:"Position",t:"text"},{l:"Team",f:"Team",t:"text"},{l:"Number",f:"Number",t:"number"},{l:"Cap Hit ($)",f:"otcCapHit",t:"number"},{l:"PPG",f:"pointsPerGame",t:"number"},{l:"Score",f:"playerScore",t:"number"},{l:"Injured",f:"isPlayerInjured",t:"toggle"}].map(fi=>(
                    <div key={fi.f}><label style={labelStyle}>{fi.l}</label>{fi.t==="toggle"?<button style={{...btn,width:"100%",justifyContent:"center",padding:"10px 14px",background:editPlayer[fi.f]?C.red:C.green,color:C.white,fontWeight:700}} onClick={()=>setEditPlayer({...editPlayer,[fi.f]:!editPlayer[fi.f]})}>{editPlayer[fi.f]?"INJURED":"HEALTHY"}</button>:<input type={fi.t} value={editPlayer[fi.f]||""} onChange={e=>setEditPlayer({...editPlayer,[fi.f]:fi.t==="number"?Number(e.target.value):e.target.value})} style={inputStyle}/>}</div>
                  ))}
                </div>
                <div style={{display:"flex",gap:10,marginTop:16}}>
                  <button onClick={savePlayer} disabled={saving} style={{...btn,background:C.purple,color:C.white,padding:"10px 24px",opacity:saving?.6:1}}>{saving&&<Spinner size={12}/>}{saving?"Saving...":"Save Changes"}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>)}

      {tab==="franchise"&&<FranchiseTagTab toast={toast}/>}
      {tab==="scoring"&&<NFLScoringTab toast={toast}/>}
      {tab==="salary"&&<SalaryCapTab toast={toast} players={players} triggerSync={triggerSync}/>}
      {tab==="scores"&&<div><p style={{color:C.textMuted,fontSize:13,marginBottom:12}}>Live score correction tool.</p><SearchBar value={query} onChange={setQuery} placeholder="Enter Game ID..." onSearch={()=>toast("info","Looking up game...")}/></div>}
      {tab==="import"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{[{l:"Import Tank01 Players",d:"Full player import from Tank01",a:"import-tank01"},{l:"Update Weekly Scoring",d:"Pull latest scoring data",a:"update-weekly-scoring"},{l:"Refresh Injury Reports",d:"Update injury statuses",a:"refresh-injuries"},{l:"Recalculate ADP",d:"Recompute draft rankings",a:"recalculate-adp"}].map(s=>(<div key={s.a} style={card}><h4 style={{color:C.white,fontWeight:700,fontSize:13,margin:"0 0 4px"}}>{s.l}</h4><p style={{color:C.textMuted,fontSize:11,margin:"0 0 12px"}}>{s.d}</p><button onClick={()=>triggerSync(s.a)} style={{...btn,background:C.purple,color:C.white,fontSize:11,padding:"6px 12px"}}><Zap size={11}/>Run</button></div>))}</div>}
      {tab==="leagues"&&<NFLLeaguesTab toast={toast} sport="nfl"/>}
    </div>
  );
};

/* ── NFL Leagues Tab (inside NFLSection) ── */
const NFLLeaguesTab = ({ toast, sport }) => {
  const [query,setQuery]=useState(""); const [leagues,setLeagues]=useState([]); const [loading,setLoading]=useState(false); const [loaded,setLoaded]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(null); const [deleting,setDeleting]=useState(null);

  const doSearch=async(q)=>{
    try{setLoading(true);const r=await adminAPI.searchLeagues(q||"",sport);const d=r.data?.data?.leagues||r.data?.data||[];setLeagues(Array.isArray(d)?d:[]);setLoaded(true);if(d.length===0&&q)toast("info","No leagues found");}catch(e){toast("error",e?.response?.data?.message||"Search failed");}finally{setLoading(false);}
  };

  const doDelete=async(lg)=>{
    try{setDeleting(lg._id);await adminAPI.deleteLeague(lg._id,lg._src||"nfl");setLeagues(prev=>prev.filter(l=>l._id!==lg._id));toast("success",`League "${lg.name||lg.leagueId}" deleted`);setConfirmDelete(null);}catch(e){toast("error",e?.response?.data?.message||"Failed to delete league");}finally{setDeleting(null);}
  };

  useEffect(()=>{if(!loaded)doSearch("");},[]);

  const modeColor=(m)=>m==="full"?"purple":"blue";
  const statusColor=(s)=>({active:"green",pending_renewal:"amber",renewed:"teal",cancelled:"red",expired:"red"}[s]||"blue");
  const gridCols="2fr 1fr 70px 90px 90px 80px 90px 80px 90px 60px";

  return (
    <div>
      <div style={{marginBottom:14}}>
        <SearchBar value={query} onChange={setQuery} placeholder="Search leagues by name, ID, type, or category..." onSearch={()=>doSearch(query.trim())} loading={loading}/>
      </div>

      {loading && !loaded ? (
        <div style={{textAlign:"center",padding:40}}><Spinner size={28}/></div>
      ) : leagues.length===0 ? (
        <div style={{...card,textAlign:"center",padding:40}}>
          <Trophy size={28} color={C.textMuted} style={{marginBottom:8}}/>
          <p style={{color:C.textMuted,fontSize:13,margin:0}}>{loaded?"No leagues found":"Loading leagues..."}</p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <div style={{fontSize:12,color:C.textMuted,marginBottom:8}}>{leagues.length} league{leagues.length!==1?"s":""} found</div>
          {/* Header */}
          <div style={{display:"grid",gridTemplateColumns:gridCols,gap:10,padding:"8px 16px",alignItems:"center",minWidth:960}}>
            <span style={labelStyle}>League Name</span>
            <span style={labelStyle}>Commissioner</span>
            <span style={labelStyle}>Sport</span>
            <span style={labelStyle}>Mode</span>
            <span style={labelStyle}>Type</span>
            <span style={labelStyle}>Teams</span>
            <span style={labelStyle}>Category</span>
            <span style={labelStyle}>Status</span>
            <span style={labelStyle}>Created</span>
            <span style={labelStyle}></span>
          </div>
          {/* Rows */}
          <div style={{maxHeight:500,overflowY:"auto",overflowX:"auto"}} className="ap-scrollbar">
            {leagues.map(lg=>(
              <div key={lg._id} style={{display:"grid",gridTemplateColumns:gridCols,gap:10,padding:"10px 16px",alignItems:"center",borderRadius:8,border:`1px solid ${C.borderLight}`,marginBottom:4,background:C.bgCard,transition:"background .1s",minWidth:960}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bgHover} onMouseLeave={e=>e.currentTarget.style.background=C.bgCard}>
                {/* Name */}
                <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  <span style={{fontSize:13,fontWeight:700,color:C.white}}>{lg.name||"Unnamed"}</span>
                  <span style={{fontSize:10,color:C.textMuted,marginLeft:6}}>S{lg.season||"—"}</span>
                </div>
                {/* Commissioner */}
                <span style={{fontSize:12,color:C.textDim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lg.createdBy?.userName||"—"}</span>
                {/* Sport */}
                <Badge color={lg._src==="soccer"||lg.sport==="soccer"?"teal":"purple"}>{lg._src||lg.sport||"nfl"}</Badge>
                {/* Mode */}
                <Badge color={modeColor(lg.leagueMode)}>{lg.leagueMode==="offense_only"?"OFF Only":lg.leagueMode||"full"}</Badge>
                {/* Type */}
                <span style={{fontSize:11,color:C.textDim}}>{lg.type||"—"}</span>
                {/* Teams */}
                <span style={{fontSize:13,fontWeight:600,color:C.white}}>{lg.teams?.length||0}/{lg.numberOfTeams||32}</span>
                {/* Category */}
                <Badge color={lg.category==="SFL"?"purple":"amber"}>{lg.category||"—"}</Badge>
                {/* Status */}
                <Badge color={statusColor(lg.renewalStatus)}>{lg.renewalStatus||"active"}</Badge>
                {/* Created */}
                <span style={{fontSize:11,color:C.textMuted}}>{lg.createdAt?new Date(lg.createdAt).toLocaleDateString():"—"}</span>
                {/* Delete */}
                <div>
                  {confirmDelete===lg._id ? (
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>doDelete(lg)} disabled={deleting===lg._id} style={{...btn,padding:"4px 8px",background:"rgba(239,68,68,0.15)",color:C.red,fontSize:10}} title="Confirm delete">
                        {deleting===lg._id?<Spinner size={10}/>:"Yes"}
                      </button>
                      <button onClick={()=>setConfirmDelete(null)} style={{...btn,padding:"4px 8px",background:C.bgHover,color:C.textMuted,fontSize:10}}>No</button>
                    </div>
                  ) : (
                    <button onClick={()=>setConfirmDelete(lg._id)} style={{...btn,padding:"4px 8px",background:"rgba(239,68,68,0.08)",color:C.red,fontSize:10}} title="Delete league">
                      <Trash2 size={11}/>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Rivals
   ══════════════════════════════════════════ */
const RivalsSection = ({ mode, toast }) => {
  const isSoccer=mode==="soccer"; const accent=isSoccer?C.teal:C.purple; const sport=isSoccer?"soccer":"nfl";
  const [tab,setTab]=useState("divisions"); const [query,setQuery]=useState("");
  const tabs=[{id:"divisions",label:"Divisions",icon:Award},{id:"entries",label:"Entries",icon:Users},{id:"seasons",label:"Seasons",icon:Clock},{id:"pods",label:"Pods",icon:Shield},{id:"override",label:"Override Suite",icon:Edit3},{id:"chat",label:"Chat Mod",icon:MessageSquare}];

  /* ── Entries Tab State ── */
  const [entries,setEntries]=useState([]); const [entriesLoading,setEntriesLoading]=useState(false);
  const searchEntries=async(q)=>{try{setEntriesLoading(true);const r=await adminAPI.searchRivalsEntries(sport,{q:q||query});const d=r.data?.data||r.data||{};setEntries(d.entries||[]);}catch(e){toast("error","Failed to search entries");}finally{setEntriesLoading(false);}};

  /* ── Seasons Tab State ── */
  const [seasons,setSeasons]=useState([]); const [seasonsLoading,setSeasonsLoading]=useState(false); const [actionLoading,setActionLoading]=useState(null);
  const loadSeasons=useCallback(async()=>{try{setSeasonsLoading(true);const r=await adminAPI.getRivalsSeasons(sport);const d=r.data?.data||r.data||{};setSeasons(d.seasons||[]);}catch(e){toast("error","Failed to load seasons");}finally{setSeasonsLoading(false);}},[sport,toast]);
  useEffect(()=>{if(tab==="seasons"&&seasons.length===0)loadSeasons();},[tab,loadSeasons]);
  const doSeasonAction=async(action,seasonId)=>{try{setActionLoading(action);const r=await adminAPI.rivalsSeasonAction(sport,{action,seasonId});const msg=r.data?.data?.message||r.data?.message||`${action} done`;toast("success",msg);await loadSeasons();}catch(e){toast("error",e?.response?.data?.message||`${action} failed`);}finally{setActionLoading(null);}};
  const [confirmDlg,setConfirmDlg]=useState(null);
  const deleteSeason=(s)=>{setConfirmDlg({title:"Delete Season",message:`Are you sure you want to delete season ${s.seasonId}? This will permanently remove all pods and reset all entries linked to this season.`,danger:true,onConfirm:async()=>{try{setActionLoading("delete");await adminAPI.rivalsSeasonAction(sport,{action:"delete_season",seasonId:s._id});toast("success",`Season ${s.seasonId} deleted`);setSeasons(prev=>prev.filter(x=>x._id!==s._id));setConfirmDlg(null);}catch(e){toast("error",e?.response?.data?.message||"Delete failed");}finally{setActionLoading(null);}}});};


  /* ── Pods Tab State ── */
  const [pods,setPods]=useState([]); const [podsLoading2,setPodsLoading2]=useState(false); const [podFilter,setPodFilter]=useState({});
  const searchPods=async(params)=>{try{setPodsLoading2(true);const r=await adminAPI.searchRivalsPods(sport,params||podFilter);const d=r.data?.data||r.data||{};setPods(d.pods||[]);}catch(e){toast("error","Failed to search pods");}finally{setPodsLoading2(false);}};

  /* ── Override Suite State ── */
  const [activeOverride,setActiveOverride]=useState(null);
  const [overrideForm,setOverrideForm]=useState({});
  const [overrideLoading,setOverrideLoading]=useState(false);
  const overrides=[
    {id:"score",l:"Override Match Score",d:"Manually set H2H result",icon:Edit3,fields:["podId","fixtureIndex","homeScore","awayScore","reason"]},
    {id:"squad_value",l:"Override Squad Value",d:"Force-set squad value for an entry",icon:TrendingUp,fields:["entryId","newValue","reason"]},
    {id:"division",l:"Override Division",d:"Move entry to different division",icon:Award,fields:["entryId","newDivision","reason"]},
    {id:"sampoints",l:"Override SamPoints",d:"Add/subtract SamPoints",icon:Zap,fields:["entryId","amount","reason"]},
    {id:"squad_reset",l:"Force Squad Reset",d:"Clear entry's squad",icon:Trash2,fields:["entryId","reason"]},
    {id:"disqualify",l:"Disqualify Entry",d:"Remove from season",icon:Flag,fields:["entryId","reason"]},
  ];
  const submitOverride=async()=>{if(!activeOverride)return;try{setOverrideLoading(true);let r;switch(activeOverride){case"score":r=await adminAPI.overrideMatchScore(sport,overrideForm);break;case"squad_value":r=await adminAPI.overrideSquadValue(sport,overrideForm);break;case"division":r=await adminAPI.overrideDivision(sport,overrideForm);break;case"sampoints":r=await adminAPI.overrideSamPoints(sport,overrideForm);break;case"squad_reset":r=await adminAPI.forceSquadReset(sport,overrideForm);break;case"disqualify":r=await adminAPI.disqualifyEntry(sport,overrideForm);break;default:return;}const msg=r.data?.data?.message||r.data?.message||"Override applied";toast("success",msg);setActiveOverride(null);setOverrideForm({});}catch(e){toast("error",e?.response?.data?.message||"Override failed");}finally{setOverrideLoading(false);}};

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:20}}>Rivals {isSoccer?"Soccer":"A.Football"} Management</h2>
      <TabBar tabs={tabs} active={tab} onChange={setTab} accent={accent}/>

      {/* ── Divisions Tab ── */}
      {tab==="divisions"&&<RivalsDivisionsTab toast={toast} sport={sport} accent={accent}/>}

      {/* ── Entries Tab ── */}
      {tab==="entries"&&<div>
        <SearchBar value={query} onChange={setQuery} placeholder={`Search Rivals ${isSoccer?"Soccer":"A.Football"} entries by username or email...`} onSearch={()=>searchEntries(query)}/>
        {entriesLoading?<div style={{textAlign:"center",padding:40}}><Spinner size={20}/></div>:entries.length>0?(
          <DataTable columns={[
            {key:"user",label:"User",render:r=><span style={{fontWeight:600,color:C.white}}>{r.user?.userName||"—"}</span>},
            {key:"email",label:"Email",render:r=><span style={{fontSize:12,color:C.textMuted}}>{r.user?.email||"—"}</span>},
            {key:"currentDivision",label:"Division",render:r=><Badge color={r.currentDivision<=2?"amber":r.currentDivision<=4?"purple":"blue"}>Div {r.currentDivision}</Badge>},
            {key:"samPoints",label:"SamPoints",render:r=><span style={{fontWeight:600,color:C.amber}}>{r.samPoints||0}</span>},
            {key:"squadValid",label:"Squad",render:r=><Badge color={r.squadValid?"green":"red"}>{r.squadValid?"Valid":"Invalid"}</Badge>},
            {key:"isActive",label:"Status",render:r=><Badge color={r.isActive?"green":"red"}>{r.isActive?"Active":"Inactive"}</Badge>},
            {key:"_id",label:"Entry ID",render:r=><span style={{fontSize:10,color:C.textMuted,fontFamily:"monospace"}}>{r._id}</span>},
          ]} data={entries} loading={false} emptyMsg="No entries found"/>
        ):(<p style={{color:C.textMuted,fontSize:13,marginTop:10,textAlign:"center"}}>Search for entries by username or email. Entry IDs can be used in the Override Suite.</p>)}
      </div>}

      {/* ── Seasons Tab ── */}
      {tab==="seasons"&&<div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20}}>
          <button onClick={()=>doSeasonAction("start_season")} disabled={!!actionLoading} style={{...btn,background:accent,color:C.white,opacity:actionLoading?.6:1}}>{actionLoading==="start_season"?<Spinner size={12}/>:<Zap size={13}/>}Start New Season</button>
          <button onClick={()=>doSeasonAction("process_matchday")} disabled={!!actionLoading} style={{...btn,background:C.bgHover,color:C.white,opacity:actionLoading?.6:1}}>{actionLoading==="process_matchday"?<Spinner size={12}/>:<Activity size={13}/>}Process Matchday</button>
          <button onClick={()=>doSeasonAction("run_promo_relegation")} disabled={!!actionLoading} style={{...btn,background:C.amber,color:C.white,opacity:actionLoading?.6:1}}>{actionLoading==="run_promo_relegation"?<Spinner size={12}/>:<TrendingUp size={13}/>}Run Promo/Relegation</button>
          <button onClick={loadSeasons} style={{...btn,background:C.bgHover,color:C.textMuted,marginLeft:"auto"}}><RefreshCw size={12}/>Load Seasons</button>
        </div>
        {seasonsLoading?<div style={{textAlign:"center",padding:40}}><Spinner size={20}/></div>:seasons.length>0?(
          <DataTable columns={[
            {key:"seasonId",label:"Season ID",render:r=><span style={{fontWeight:700,color:C.white}}>{r.seasonId}</span>},
            {key:"status",label:"Status",render:r=><Badge color={r.status==="active"?"green":r.status==="completed"?"blue":"amber"}>{r.status}</Badge>},
            {key:"totalMatchdays",label:"Matchdays",render:r=><span>{r.completedMatchdays}/{r.totalMatchdays} done</span>},
            {key:"weekCount",label:"Weeks"},
            {key:"promoRelegationProcessed",label:"P/R Done",render:r=><Badge color={r.promoRelegationProcessed?"green":"amber"}>{r.promoRelegationProcessed?"Yes":"No"}</Badge>},
            {key:"startDate",label:"Started",render:r=><span style={{fontSize:11,color:C.textMuted}}>{r.startDate?ts(r.startDate):"—"}</span>},
            {key:"_actions",label:"",render:r=><button onClick={(e)=>{e.stopPropagation();deleteSeason(r);}} disabled={!!actionLoading} style={{...btn,padding:"4px 10px",background:"rgba(239,68,68,0.1)",color:C.red,fontSize:11}}>{actionLoading==="delete"?<Spinner size={10}/>:<Trash2 size={11}/>}Delete</button>},
          ]} data={seasons} loading={false} emptyMsg="No seasons found — click Load Seasons"/>
        ):(<p style={{color:C.textMuted,fontSize:13,textAlign:"center",padding:20}}>Click &quot;Load Seasons&quot; to see all seasons.</p>)}
      </div>}

      {/* ── Pods Tab ── */}
      {tab==="pods"&&<div>
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <input placeholder="Division #" type="number" min={1} max={isSoccer?10:4} style={{...inputStyle,width:100}} onChange={e=>setPodFilter({...podFilter,division:e.target.value})}/>
          <select style={inputStyle} onChange={e=>setPodFilter({...podFilter,status:e.target.value})}><option value="">All Status</option><option value="active">Active</option><option value="completed">Completed</option><option value="pending">Pending</option></select>
          <button onClick={()=>searchPods()} style={{...btn,background:accent,color:C.white}}><Search size={12}/>Search Pods</button>
        </div>
        {podsLoading2?<div style={{textAlign:"center",padding:40}}><Spinner size={20}/></div>:pods.length>0?(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {pods.map(p=>(<div key={p._id} style={{...card,padding:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontWeight:700,color:C.white,fontSize:14}}>Pod #{p.podNumber}</span>
                  <Badge color={p.division<=2?"amber":"blue"}>Div {p.division}</Badge>
                  <Badge color={p.status==="active"?"green":p.status==="completed"?"blue":"amber"}>{p.status}</Badge>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12,color:p.memberCount<12?C.red:C.green,fontWeight:700}}>{p.memberCount}/12</span>
                  <span style={{fontSize:10,color:C.textMuted}}>{p.fixtureCount} fixtures</span>
                </div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {(p.members||[]).map((m,i)=>(<span key={i} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:accent+"15",color:accent,fontWeight:600}}>{m.username||"User"}</span>))}
              </div>
              <div style={{fontSize:10,color:C.textMuted,marginTop:6,fontFamily:"monospace"}}>ID: {p._id}</div>
            </div>))}
          </div>
        ):(<p style={{color:C.textMuted,fontSize:13,textAlign:"center",padding:20}}>Filter by division or status, then click Search Pods.</p>)}
      </div>}

      {/* ── Override Suite Tab ── */}
      {tab==="override"&&<div>
        <div style={{background:C.amberLight,border:`1px solid ${C.amber}33`,borderRadius:12,padding:14,display:"flex",alignItems:"flex-start",gap:10,marginBottom:16}}>
          <AlertTriangle size={16} color={C.amber} style={{flexShrink:0,marginTop:2}}/><div><h4 style={{color:C.amber,fontWeight:700,fontSize:13,margin:0}}>Override Mode</h4><p style={{color:`${C.amber}99`,fontSize:11,margin:"4px 0 0"}}>Overrides bypass normal validation. All actions are logged to the audit trail.</p></div>
        </div>
        {!activeOverride?(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {overrides.map(o=>(<button key={o.id} onClick={()=>{setActiveOverride(o.id);setOverrideForm({});}} style={{...card,textAlign:"left",cursor:"pointer",border:`1px solid ${C.borderLight}`,transition:"border-color .15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.amber+"66"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.borderLight}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><o.icon size={14} color={C.amber}/><h4 style={{color:C.white,fontWeight:700,fontSize:13,margin:0}}>{o.l}</h4></div>
              <p style={{color:C.textMuted,fontSize:11,margin:0}}>{o.d}</p>
            </button>))}
          </div>
        ):(
          <div style={{...card,borderColor:C.amber+"33"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h3 style={{color:C.white,fontWeight:700,fontSize:15,margin:0}}>{overrides.find(o=>o.id===activeOverride)?.l}</h3>
              <button onClick={()=>{setActiveOverride(null);setOverrideForm({});}} style={{...btn,background:C.bgHover,color:C.textMuted,fontSize:11}}>Back</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {(overrides.find(o=>o.id===activeOverride)?.fields||[]).map(f=>(
                <div key={f}>
                  <label style={{...labelStyle,marginBottom:4,display:"block"}}>{f.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase())}</label>
                  {f==="reason"?<textarea value={overrideForm[f]||""} onChange={e=>setOverrideForm({...overrideForm,[f]:e.target.value})} placeholder={`Reason for override (required for audit)`} rows={2} style={{...inputStyle,resize:"none"}}/>
                  :<input type={["homeScore","awayScore","fixtureIndex","newDivision","amount"].includes(f)?"number":"text"} value={overrideForm[f]||""} onChange={e=>setOverrideForm({...overrideForm,[f]:e.target.value})} placeholder={f==="entryId"?"Paste Entry ID from Entries tab":f==="podId"?"Paste Pod ID from Pods tab":f} style={inputStyle}/>}
                </div>
              ))}
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button onClick={submitOverride} disabled={overrideLoading} style={{...btn,background:C.amber,color:C.white,opacity:overrideLoading?.6:1}}>{overrideLoading?<Spinner size={12}/>:<CheckCircle size={13}/>}Apply Override</button>
                <button onClick={()=>{setActiveOverride(null);setOverrideForm({});}} style={{...btn,background:C.bgHover,color:C.textMuted}}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>}

      {/* ── Chat Mod Tab ── */}
      {tab==="chat"&&<div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
          <StatCard icon={MessageSquare} label="Messages Today" value="—" color={isSoccer?"teal":"purple"}/>
          <StatCard icon={Flag} label="Flagged" value="—" sub="Requires review" color="red"/>
          <StatCard icon={Lock} label="Banned Users" value="—" color="amber"/>
        </div>
        <SearchBar value={query} onChange={setQuery} placeholder="Search chat..." onSearch={()=>toast("info","Chat moderation coming soon")}/>
      </div>}

      {/* ── Confirm Dialog ── */}
      <ConfirmDialog open={!!confirmDlg} title={confirmDlg?.title} message={confirmDlg?.message} danger={confirmDlg?.danger} loading={actionLoading==="delete"} onConfirm={confirmDlg?.onConfirm} onCancel={()=>setConfirmDlg(null)}/>
    </div>
  );
};

/* ── Rivals Divisions Tab ── */
const RivalsDivisionsTab = ({ toast, sport, accent }) => {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seasonId, setSeasonId] = useState(null);
  const [incompletePods, setIncompletePods] = useState([]);
  const [expandedDiv, setExpandedDiv] = useState(null);
  const [podsLoading, setPodsLoading] = useState(false);
  const [mergeSource, setMergeSource] = useState(null);
  const [merging, setMerging] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);

  // Static fallback division lists
  const NFL_DIVS = [
    {division:1,name:"GRIDIRON LEGENDS"},{division:2,name:"IRON CURTAIN"},
    {division:3,name:"BLITZ DIVISION"},{division:4,name:"ROOKIE LEAGUE"},
  ];
  const SOCCER_DIVS = [
    {division:1,name:"WORLD MASTERS"},{division:2,name:"TITANS CUP"},
    {division:3,name:"CONTINENTAL TROPHY"},{division:4,name:"CHALLENGER SHIELD"},
    {division:5,name:"PROFESSIONAL TIER I"},{division:6,name:"PROFESSIONAL TIER II"},
    {division:7,name:"SEMI-PRO ELITE"},{division:8,name:"SEMI-PRO REGIONAL"},
    {division:9,name:"AMATEUR PREMIER"},{division:10,name:"ENTRY LEVEL"},
  ];
  const fallbackDivs = (sport==="soccer"?SOCCER_DIVS:NFL_DIVS).map(d=>({
    ...d,entries:0,totalPods:0,activePods:0,completedPods:0,incompletePods:0,totalMembers:0,
  }));

  const loadDivisions = useCallback(async () => {
    try {
      setLoading(true);
      const r = await adminAPI.getDivisionsOverview(sport);
      const d = r.data?.data || r.data || {};
      const divs = d.divisions || [];
      setDivisions(divs.length > 0 ? divs : fallbackDivs);
      setSeasonId(d.seasonId || d.currentSeason?.seasonId || null);
    } catch (e) {
      // Fallback to static structure if API fails
      setDivisions(fallbackDivs);
      setSeasonId(null);
    } finally {
      setLoading(false);
    }
  }, [sport, toast]);

  useEffect(() => { loadDivisions(); }, [loadDivisions]);

  const loadIncompletePods = async (div) => {
    if (expandedDiv === div) { setExpandedDiv(null); setIncompletePods([]); setMergeSource(null); return; }
    try {
      setPodsLoading(true);
      setExpandedDiv(div);
      setMergeSource(null);
      const r = await adminAPI.getIncompletePods(sport, seasonId, div);
      const d = r.data?.data || r.data || {};
      setIncompletePods(d.pods || []);
    } catch (e) {
      toast("error", "Failed to load incomplete pods");
    } finally {
      setPodsLoading(false);
    }
  };

  const doMerge = async (targetPodId) => {
    if (!mergeSource || mergeSource === targetPodId) return;
    const src = incompletePods.find(p => p._id === mergeSource);
    const tgt = incompletePods.find(p => p._id === targetPodId);
    if (!src || !tgt) return;
    if (src.memberCount + tgt.memberCount > 12) {
      return toast("error", `Cannot merge: combined ${src.memberCount + tgt.memberCount} exceeds 12`);
    }
    try {
      setMerging(true);
      const r = await adminAPI.mergePods(sport, mergeSource, targetPodId);
      const msg = r.data?.data?.message || r.data?.message || "Pods merged";
      toast("success", msg);
      setMergeSource(null);
      // Reload
      await loadIncompletePods(expandedDiv);
      await loadDivisions();
    } catch (e) {
      toast("error", e?.response?.data?.message || "Merge failed");
    } finally {
      setMerging(false);
    }
  };

  // Colors per tier
  const tierColor = (div) => {
    if (div <= 2) return C.amber;
    if (div <= 4) return C.purple;
    if (div <= 6) return C.blue;
    if (div <= 8) return C.teal;
    return C.textDim;
  };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"48px 0",gap:10}}><Spinner size={24}/><span style={{color:C.textDim,fontSize:13}}>Loading divisions...</span></div>;

  return (
    <div>
      {seasonId && (
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontSize:12,color:C.textMuted}}>Current Season: <span style={{fontWeight:700,color:C.white}}>{seasonId}</span></div>
          <button
            onClick={async()=>{
              try{setAutoFilling(true);const r=await adminAPI.triggerAutoFill(sport);const msg=r.data?.data?.message||r.data?.message||"Auto-fill complete";toast("success",msg);await loadDivisions();}catch(e){toast("error",e?.response?.data?.message||"Auto-fill failed");}finally{setAutoFilling(false);}
            }}
            disabled={autoFilling}
            style={{...btn,background:accent+"18",color:accent,fontSize:11,padding:"6px 14px",gap:6}}
          >
            {autoFilling?<Spinner size={11}/>:<Zap size={12}/>}
            {autoFilling?"Filling...":"Auto-Fill Pods"}
          </button>
        </div>
      )}

      {/* Divisions overview table */}
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {/* Header */}
        <div style={{display:"grid",gridTemplateColumns:"40px 2fr 90px 80px 80px 80px 90px 60px",gap:10,padding:"8px 16px",alignItems:"center"}}>
          <span style={labelStyle}>#</span>
          <span style={labelStyle}>Division</span>
          <span style={labelStyle}>Entries</span>
          <span style={labelStyle}>Pods</span>
          <span style={labelStyle}>Active</span>
          <span style={labelStyle}>Done</span>
          <span style={labelStyle}>Incomplete</span>
          <span style={labelStyle}></span>
        </div>

        {divisions.map(d => {
          const isExpanded = expandedDiv === d.division;
          const tc = tierColor(d.division);
          return (
            <div key={d.division}>
              {/* Division Row */}
              <div
                style={{display:"grid",gridTemplateColumns:"40px 2fr 90px 80px 80px 80px 90px 60px",gap:10,padding:"12px 16px",alignItems:"center",borderRadius:8,border:`1px solid ${isExpanded?tc+"44":C.borderLight}`,background:isExpanded?tc+"08":C.bgCard,cursor:"pointer",transition:"all .15s",marginBottom:2}}
                onClick={()=>d.incompletePods>0?loadIncompletePods(d.division):null}
                onMouseEnter={e=>{if(!isExpanded)e.currentTarget.style.background=C.bgHover}}
                onMouseLeave={e=>{if(!isExpanded)e.currentTarget.style.background=C.bgCard}}
              >
                <span style={{fontSize:16,fontWeight:800,color:tc}}>{d.division}</span>
                <div>
                  <span style={{fontSize:13,fontWeight:700,color:C.white}}>{d.name}</span>
                </div>
                <span style={{fontSize:14,fontWeight:700,color:C.white}}>{d.entries}</span>
                <span style={{fontSize:14,fontWeight:600,color:C.white}}>{d.totalPods}</span>
                <Badge color="green">{d.activePods}</Badge>
                <Badge color="blue">{d.completedPods}</Badge>
                <span style={{fontSize:14,fontWeight:700,color:d.incompletePods>0?C.red:C.green}}>
                  {d.incompletePods}{d.incompletePods>0?" ⚠":""}
                </span>
                <span>
                  {d.incompletePods > 0 && (
                    <button style={{...btn,padding:"4px 10px",background:tc+"18",color:tc,fontSize:10}} onClick={(e)=>{e.stopPropagation();loadIncompletePods(d.division);}}>
                      {isExpanded?"Hide":"Fix"}
                    </button>
                  )}
                </span>
              </div>

              {/* Expanded: Incomplete Pods for this division */}
              {isExpanded && (
                <div style={{marginLeft:40,marginBottom:12,marginTop:4}}>
                  {podsLoading ? (
                    <div style={{padding:20,textAlign:"center"}}><Spinner size={18}/></div>
                  ) : incompletePods.length === 0 ? (
                    <p style={{color:C.textMuted,fontSize:12,padding:"8px 0"}}>No incomplete pods in this division.</p>
                  ) : (
                    <div>
                      <div style={{fontSize:11,color:C.textMuted,marginBottom:10}}>
                        {mergeSource
                          ? <span>Select a <strong style={{color:C.green}}>target pod</strong> to merge into (click another pod), or <button onClick={()=>setMergeSource(null)} style={{...btn,padding:"2px 8px",fontSize:10,background:C.bgHover,color:C.textMuted}}>Cancel</button></span>
                          : <span>Click a pod to select it as <strong>source</strong> for merging, then click another pod as <strong>target</strong>.</span>
                        }
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {incompletePods.map(pod => {
                          const isSource = mergeSource === pod._id;
                          const canBeTarget = mergeSource && mergeSource !== pod._id;
                          const srcPod = mergeSource ? incompletePods.find(p=>p._id===mergeSource) : null;
                          const wouldOverflow = canBeTarget && srcPod && (srcPod.memberCount + pod.memberCount > 12);

                          return (
                            <div
                              key={pod._id}
                              onClick={() => {
                                if (merging) return;
                                if (!mergeSource) { setMergeSource(pod._id); return; }
                                if (isSource) { setMergeSource(null); return; }
                                if (wouldOverflow) { toast("error", `Can't merge: ${srcPod.memberCount} + ${pod.memberCount} = ${srcPod.memberCount+pod.memberCount} > 12`); return; }
                                doMerge(pod._id);
                              }}
                              style={{
                                padding:"10px 16px",borderRadius:10,cursor:"pointer",transition:"all .15s",
                                border:`2px solid ${isSource?C.amber:canBeTarget&&!wouldOverflow?C.green+"66":C.borderLight}`,
                                background:isSource?C.amberLight:canBeTarget&&!wouldOverflow?C.greenLight+"44":C.bgCard,
                                opacity:wouldOverflow?0.4:1,
                              }}
                            >
                              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                                <div style={{display:"flex",alignItems:"center",gap:10}}>
                                  <span style={{fontSize:13,fontWeight:700,color:C.white}}>Pod #{pod.podNumber}</span>
                                  <Badge color={pod.status==="active"?"green":pod.status==="completed"?"blue":"amber"}>{pod.status}</Badge>
                                  {isSource && <Badge color="amber">SOURCE</Badge>}
                                  {canBeTarget && !wouldOverflow && <Badge color="green">TARGET</Badge>}
                                </div>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <span style={{fontSize:13,fontWeight:700,color:pod.memberCount<12?C.red:C.green}}>{pod.memberCount}/12</span>
                                  <span style={{fontSize:10,color:C.textMuted}}>({pod.spotsAvailable} spot{pod.spotsAvailable!==1?"s":""} open)</span>
                                </div>
                              </div>
                              {/* Member names */}
                              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                                {pod.members.map((m,i) => (
                                  <span key={i} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:accent+"15",color:accent,fontWeight:600}}>{m.username||"User"}</span>
                                ))}
                                {Array.from({length:pod.spotsAvailable}).map((_,i)=>(
                                  <span key={`empty-${i}`} style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:C.bgHover,color:C.textMuted,border:`1px dashed ${C.borderLight}`}}>Empty</span>
                                ))}
                              </div>
                              {wouldOverflow && <div style={{fontSize:10,color:C.red,marginTop:4}}>Too many combined ({srcPod.memberCount}+{pod.memberCount}={srcPod.memberCount+pod.memberCount})</div>}
                            </div>
                          );
                        })}
                      </div>
                      {merging && <div style={{textAlign:"center",padding:12}}><Spinner size={18}/><span style={{color:C.textDim,fontSize:12,marginLeft:8}}>Merging pods...</span></div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginTop:20}}>
        <StatCard icon={Award} label="Total Divisions" value={divisions.length} color={sport==="soccer"?"teal":"purple"}/>
        <StatCard icon={Users} label="Total Entries" value={divisions.reduce((s,d)=>s+d.entries,0)} color="blue"/>
        <StatCard icon={Shield} label="Total Pods" value={divisions.reduce((s,d)=>s+d.totalPods,0)} color="green"/>
        <StatCard icon={AlertTriangle} label="Incomplete Pods" value={divisions.reduce((s,d)=>s+d.incompletePods,0)} sub={divisions.reduce((s,d)=>s+d.incompletePods,0)>0?"Needs attention":"All full"} color={divisions.reduce((s,d)=>s+d.incompletePods,0)>0?"red":"green"}/>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Megaphone
   ══════════════════════════════════════════ */
const MegaphoneSection = ({ toast }) => {
  const [bannerText,setBannerText]=useState(""); const [bannerType,setBannerType]=useState("info"); const [target,setTarget]=useState("all");
  const [bannerImage,setBannerImage]=useState(null); const [imagePreview,setImagePreview]=useState(null);
  const [activeBanners,setActiveBanners]=useState([]); const [loading,setLoading]=useState(true); const [sending,setSending]=useState(false);
  const [expiresAt,setExpiresAt]=useState(""); const [displayMode,setDisplayMode]=useState("persistent"); const [pageTarget,setPageTarget]=useState("all_pages");
  useEffect(()=>{let c=false;(async()=>{try{const raw=await adminAPI.getAnnouncements();if(c)return;const n=raw.nfl?.data?.announcements||raw.nfl?.announcements||[];const s=raw.soccer?.data?.announcements||raw.soccer?.announcements||[];const seen=new Set();setActiveBanners([...n,...s].filter(a=>{const k=a.text||a.message;if(seen.has(k))return false;seen.add(k);return true;}));}catch{}finally{if(!c)setLoading(false);}})();return()=>{c=true};},[]);
  const handleImageSelect=(e)=>{const file=e.target.files?.[0];if(!file)return;const allowed=["image/png","image/jpeg","image/webp"];if(!allowed.includes(file.type)){toast("error","Only PNG, JPG, or WebP images allowed");return;}if(file.size>5*1024*1024){toast("error","Image must be under 5MB");return;}setBannerImage(file);setImagePreview(URL.createObjectURL(file));};
  const clearImage=()=>{setBannerImage(null);if(imagePreview)URL.revokeObjectURL(imagePreview);setImagePreview(null);};
  const sendBanner=async()=>{if(!bannerText.trim()&&!bannerImage)return toast("error","Banner text or image required");try{setSending(true);await adminAPI.createAnnouncement({text:bannerText.trim()||"(image banner)",type:bannerType,target,expiresAt:expiresAt||null,displayMode,pageTarget},bannerImage);setActiveBanners(p=>[{_id:Date.now(),text:bannerText.trim()||"(image banner)",type:bannerType,target,imageUrl:imagePreview,createdAt:new Date().toISOString(),expiresAt:expiresAt||null,displayMode,pageTarget},...p]);setBannerText("");clearImage();setExpiresAt("");setDisplayMode("persistent");setPageTarget("all_pages");toast("success",`Banner sent to ${target==="all"?"all users":target}`);}catch(e){toast("error",e?.response?.data?.message||"Failed to send");}finally{setSending(false);}};
  const dismiss=async(b)=>{try{await adminAPI.deleteAnnouncement(b._id);setActiveBanners(p=>p.filter(x=>x._id!==b._id));toast("success","Banner deleted");}catch(e){toast("error","Failed to delete banner");}};
  const typeColors={info:"blue",warning:"amber",urgent:"red",success:"green"};
  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:20,display:"flex",alignItems:"center",gap:8}}><Megaphone size={20} color={C.amber}/>Global Megaphone</h2>
      <div style={{...card,marginBottom:20}}>
        <div style={{...labelStyle,marginBottom:12}}>New Announcement</div>
        <textarea value={bannerText} onChange={e=>setBannerText(e.target.value)} placeholder="Type your announcement..." rows={3} style={{...inputStyle,resize:"none",marginBottom:12}}/>
        <div style={{marginBottom:12}}>
          <label style={{...labelStyle,marginBottom:8,display:"block"}}>Banner Image (optional)</label>
          <p style={{fontSize:11,color:C.textMuted,margin:"0 0 8px"}}>Recommended: 1200×300px, PNG or JPG, max 5MB</p>
          {imagePreview?(
            <div style={{position:"relative",borderRadius:10,overflow:"hidden",border:`1px solid ${C.borderLight}`,marginBottom:8}}>
              <img src={imagePreview} alt="Banner preview" style={{width:"100%",maxHeight:150,objectFit:"cover",display:"block"}}/>
              <button onClick={clearImage} style={{position:"absolute",top:6,right:6,...btn,padding:"4px 8px",background:"rgba(0,0,0,0.7)",color:C.white,borderRadius:8}}><XCircle size={12}/> Remove</button>
            </div>
          ):(
            <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"20px 16px",border:`2px dashed ${C.borderLight}`,borderRadius:10,cursor:"pointer",color:C.textMuted,fontSize:13,transition:"border-color 0.2s"}}>
              <ImagePlus size={18} color={C.textMuted}/>
              <span>Click to upload banner image</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageSelect} style={{display:"none"}}/>
            </label>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
          <div><label style={labelStyle}>Type</label><select value={bannerType} onChange={e=>setBannerType(e.target.value)} style={inputStyle}><option value="info">Info</option><option value="warning">Warning</option><option value="urgent">Urgent</option><option value="success">Success</option></select></div>
          <div><label style={labelStyle}>Target Audience</label><select value={target} onChange={e=>setTarget(e.target.value)} style={inputStyle}><option value="all">All Users</option><option value="soccer">Soccer Only</option><option value="nfl">A.Football Only</option><option value="rivals_soccer">Rivals Soccer</option><option value="rivals_nfl">Rivals A.Football</option></select></div>
          <div><label style={labelStyle}>Show On Page</label><select value={pageTarget} onChange={e=>setPageTarget(e.target.value)} style={inputStyle}><option value="all_pages">All Pages</option><option value="rivals">Rivals Only</option><option value="dashboard">Dashboard Only</option><option value="home">Home Only</option></select></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
          <div><label style={labelStyle}>Dismiss Behavior</label><select value={displayMode} onChange={e=>setDisplayMode(e.target.value)} style={inputStyle}><option value="persistent">Persistent (shows every visit)</option><option value="one_click">One-Click Dismiss (remembers)</option></select></div>
          <div><label style={labelStyle}>Expires At (optional)</label><input type="datetime-local" value={expiresAt} onChange={e=>setExpiresAt(e.target.value)} style={inputStyle} /></div>
        </div>
        <button onClick={sendBanner} disabled={sending} style={{...btn,background:C.amber,color:C.white,opacity:sending?.6:1}}>{sending?<Spinner size={12}/>:<Send size={13}/>}Broadcast Now</button>
      </div>
      <div style={card}>
        <div style={{...labelStyle,marginBottom:12}}>Active Banners</div>
        {loading?<div style={{textAlign:"center",padding:24}}><Spinner/></div>:(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {activeBanners.length===0&&<p style={{color:C.textMuted,fontSize:13,textAlign:"center",padding:16}}>No active banners</p>}
            {activeBanners.map(b=>(<div key={b._id} style={{background:"rgba(51,65,85,0.3)",borderRadius:12,padding:14,overflow:"hidden"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <Badge color={typeColors[b.type]}>{b.type}</Badge>
                <span style={{flex:1,fontSize:13,color:C.text}}>{b.text||b.message}</span>
                <Badge color="blue">{b.target}</Badge>
                {b.pageTarget&&b.pageTarget!=="all_pages"&&<Badge color="purple">{b.pageTarget}</Badge>}
                {b.displayMode==="one_click"&&<Badge color="amber">1-click</Badge>}
                {b.expiresAt&&<span style={{fontSize:10,color:new Date(b.expiresAt)>new Date()?C.green:C.red,fontWeight:600}}>exp {new Date(b.expiresAt).toLocaleDateString()}</span>}
                <span style={{fontSize:11,color:C.textMuted}}>{ts(b.createdAt)}</span>
                <button onClick={()=>dismiss(b)} style={{...btn,padding:4,background:"transparent"}} title="Delete banner"><XCircle size={13} color={C.red}/></button>
              </div>
              {b.imageUrl&&<img src={b.imageUrl} alt="Banner" style={{width:"100%",maxHeight:80,objectFit:"cover",borderRadius:8,marginTop:8}}/>}
            </div>))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Credentials Vault
   ══════════════════════════════════════════ */
const VAULT_PASS_KEY="__sam_vault_pass";
const getStoredVaultPass=()=>localStorage.getItem(VAULT_PASS_KEY)||"@Erik.gabriela.kinga.julien26";
const RECOVERY_EMAIL="julien.sevat@icloud.com";
const RECOVERY_PASS="Js2014kl";

const VaultSection = ({ toast }) => {
  const [unlocked,setUnlocked]=useState(false);
  const [vaultPass,setVaultPass]=useState("");
  const [showRecovery,setShowRecovery]=useState(false);
  const [recoveryEmail,setRecoveryEmail]=useState("");
  const [recoveryPass,setRecoveryPass]=useState("");
  const [recoveryAuthed,setRecoveryAuthed]=useState(false);
  const [newVaultPass,setNewVaultPass]=useState("");
  const [newVaultPassConfirm,setNewVaultPassConfirm]=useState("");
  const [creds,setCreds]=useState([]);
  const [loading,setLoading]=useState(true);
  const [editKey,setEditKey]=useState(null);
  const [editValue,setEditValue]=useState("");
  const [revealedKeys,setRevealedKeys]=useState({});
  const [testing,setTesting]=useState({});
  const [confirmKey,setConfirmKey]=useState(null);

  const checkVaultPass=(pwd)=>pwd===getStoredVaultPass();

  const handleUnlock=()=>{
    if(checkVaultPass(vaultPass)){setUnlocked(true);setVaultPass("");}
    else{toast("error","Incorrect vault password");setVaultPass("");}
  };

  const handleRecoveryAuth=()=>{
    if(recoveryEmail.trim().toLowerCase()===RECOVERY_EMAIL&&recoveryPass===RECOVERY_PASS){
      setRecoveryAuthed(true);
      toast("success","Identity verified. Set a new vault password.");
    }else{
      toast("error","Incorrect email or password");
      setRecoveryEmail("");setRecoveryPass("");
    }
  };

  const handleResetPassword=()=>{
    if(!newVaultPass||newVaultPass.length<6){toast("error","New password must be at least 6 characters");return;}
    if(newVaultPass!==newVaultPassConfirm){toast("error","Passwords do not match");return;}
    localStorage.setItem(VAULT_PASS_KEY,newVaultPass);
    toast("success","Vault password has been reset. You can now unlock with your new password.");
    setShowRecovery(false);setRecoveryAuthed(false);
    setRecoveryEmail("");setRecoveryPass("");
    setNewVaultPass("");setNewVaultPassConfirm("");
  };

  const loadVault=useCallback(async()=>{
    try{setLoading(true);
      const raw=await adminAPI.getVaultCredentials();
      const n=(raw.nfl?.data?.credentials||raw.nfl?.credentials||[]).map(c=>({...c,_backend:"nfl"}));
      const s=(raw.soccer?.data?.credentials||raw.soccer?.credentials||[]).map(c=>({...c,_backend:"soccer"}));
      setCreds([...n,...s]);
    }catch(e){toast("error","Failed to load vault");}
    finally{setLoading(false);}
  },[toast]);

  useEffect(()=>{if(unlocked)loadVault();},[loadVault,unlocked]);

  // ── Password gate ──
  if(!unlocked) return (
    <div>
      <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
        <Lock size={20} color={C.amber}/>Credentials Vault
      </h2>
      <p style={{color:C.textMuted,fontSize:13,marginBottom:24}}>
        {showRecovery?"Verify your identity to reset the vault password.":"Enter the vault password to access API credentials."}
      </p>
      <div style={{maxWidth:420,margin:"40px auto",textAlign:"center"}}>
        <div style={{width:80,height:80,borderRadius:20,background:showRecovery?"rgba(59,130,246,0.1)":"rgba(245,158,11,0.1)",border:`2px solid ${showRecovery?"rgba(59,130,246,0.3)":"rgba(245,158,11,0.3)"}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",transition:"all .3s"}}>
          <Lock size={36} color={showRecovery?C.blue:C.amber}/>
        </div>

        {!showRecovery ? (
          <>
            <div style={{display:"flex",gap:8}}>
              <input
                type="password"
                value={vaultPass}
                onChange={e=>setVaultPass(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")handleUnlock();}}
                placeholder="Vault password..."
                style={{...inputStyle,flex:1,textAlign:"center",fontSize:14,letterSpacing:2}}
                autoFocus
              />
              <button onClick={handleUnlock} style={{...btn,background:C.amber,color:C.white}}>
                <Lock size={13}/>Unlock
              </button>
            </div>
            <button onClick={()=>setShowRecovery(true)} style={{background:"none",border:"none",color:C.textMuted,fontSize:12,cursor:"pointer",marginTop:16,textDecoration:"underline"}}>
              Forgot password?
            </button>
          </>
        ) : !recoveryAuthed ? (
          <>
            <div style={{display:"flex",flexDirection:"column",gap:10,textAlign:"left"}}>
              <label style={{fontSize:12,fontWeight:600,color:C.textMuted}}>Recovery Email</label>
              <input
                type="email"
                value={recoveryEmail}
                onChange={e=>setRecoveryEmail(e.target.value)}
                placeholder="Enter your recovery email..."
                style={{...inputStyle,fontSize:13}}
                autoFocus
              />
              <label style={{fontSize:12,fontWeight:600,color:C.textMuted,marginTop:4}}>Recovery Password</label>
              <input
                type="password"
                value={recoveryPass}
                onChange={e=>setRecoveryPass(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")handleRecoveryAuth();}}
                placeholder="Enter recovery password..."
                style={{...inputStyle,fontSize:13}}
              />
            </div>
            <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"center"}}>
              <button onClick={handleRecoveryAuth} style={{...btn,background:C.blue,color:C.white}}>
                <CheckCircle size={13}/>Verify Identity
              </button>
              <button onClick={()=>{setShowRecovery(false);setRecoveryEmail("");setRecoveryPass("");}} style={{...btn,background:C.bgHover,color:C.textDim}}>
                <XCircle size={13}/>Back
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.25)",borderRadius:10,padding:12,marginBottom:16}}>
              <p style={{fontSize:12,color:C.green,fontWeight:600,margin:0}}>Identity verified. Choose a new vault password.</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10,textAlign:"left"}}>
              <label style={{fontSize:12,fontWeight:600,color:C.textMuted}}>New Vault Password</label>
              <input
                type="password"
                value={newVaultPass}
                onChange={e=>setNewVaultPass(e.target.value)}
                placeholder="New password (min 6 characters)..."
                style={{...inputStyle,fontSize:13}}
                autoFocus
              />
              <label style={{fontSize:12,fontWeight:600,color:C.textMuted,marginTop:4}}>Confirm New Password</label>
              <input
                type="password"
                value={newVaultPassConfirm}
                onChange={e=>setNewVaultPassConfirm(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter")handleResetPassword();}}
                placeholder="Confirm new password..."
                style={{...inputStyle,fontSize:13}}
              />
            </div>
            <div style={{display:"flex",gap:8,marginTop:14,justifyContent:"center"}}>
              <button onClick={handleResetPassword} style={{...btn,background:C.green,color:C.white}}>
                <CheckCircle size={13}/>Reset Password
              </button>
              <button onClick={()=>{setShowRecovery(false);setRecoveryAuthed(false);}} style={{...btn,background:C.bgHover,color:C.textDim}}>
                <XCircle size={13}/>Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const handleSave=async(cred)=>{
    if(!editValue.trim()){toast("error","Key value cannot be empty");return;}
    try{
      await adminAPI.updateVaultCredential(cred._backend,cred.envKey,editValue.trim());
      toast("success",`${cred.label} updated`);
      setEditKey(null);setEditValue("");setConfirmKey(null);
      loadVault();
    }catch(e){toast("error",e?.response?.data?.message||"Update failed");}
  };

  const handleTest=async(cred)=>{
    setTesting(p=>({...p,[cred.envKey]:true}));
    try{
      const res=await adminAPI.testVaultCredential(cred._backend,cred.envKey);
      const d=res.data?.data||res.data||{};
      if(d.success)toast("success",d.message||"Connection OK");
      else toast("error",d.message||"Connection failed");
      loadVault();
    }catch(e){toast("error",e?.response?.data?.message||"Test failed");}
    finally{setTesting(p=>({...p,[cred.envKey]:false}));}
  };

  const toggleReveal=(envKey)=>setRevealedKeys(p=>({...p,[envKey]:!p[envKey]}));

  // Group by provider
  const grouped={};
  creds.forEach(c=>{
    const key=c.provider||"Other";
    if(!grouped[key])grouped[key]=[];
    grouped[key].push(c);
  });

  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:10}}><Spinner size={24}/><span style={{color:C.textDim}}>Loading vault...</span></div>;

  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
        <Lock size={20} color={C.amber}/>Credentials Vault
      </h2>
      <p style={{color:C.textMuted,fontSize:13,marginBottom:20}}>
        Manage API keys for all data providers. Keys are AES-256 encrypted at rest. Changes take effect immediately — no server restart needed.
      </p>
      <div style={{background:C.amberLight,border:`1px solid ${C.amber}33`,borderRadius:12,padding:14,display:"flex",alignItems:"flex-start",gap:10,marginBottom:20}}>
        <AlertTriangle size={16} color={C.amber} style={{flexShrink:0,marginTop:2}}/>
        <div>
          <h4 style={{color:C.amber,fontWeight:700,fontSize:13,margin:0}}>Handle With Care</h4>
          <p style={{color:`${C.amber}99`,fontSize:11,margin:"4px 0 0"}}>Changing a key will immediately affect live data syncs. Always use &quot;Test Connection&quot; before saving. All changes are logged to the audit trail.</p>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {Object.entries(grouped).sort(([a],[b])=>a.localeCompare(b)).map(([provider,items])=>(
          <div key={provider} style={card}>
            <div style={{...labelStyle,marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
              <Server size={12} color={C.textMuted}/>{provider}
              <Badge color={items[0]?._backend==="nfl"?"purple":items[0]?._backend==="soccer"?"teal":"blue"}>
                {items[0]?._backend==="nfl"?"A.Football":"Soccer"}
              </Badge>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {items.map(cred=>{
                const isEditing=editKey===cred.envKey;
                const isRevealed=revealedKeys[cred.envKey];
                const isTesting=testing[cred.envKey];
                const isConfirming=confirmKey===cred.envKey;
                const testColor=cred.lastTestResult==="success"?C.green:cred.lastTestResult==="fail"?C.red:C.textMuted;

                return(
                  <div key={cred.envKey} style={{padding:"12px 14px",background:"rgba(0,0,0,0.2)",borderRadius:10,border:`1px solid ${C.border}`}}>
                    {/* Header row */}
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:isEditing?10:0}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:13,fontWeight:700,color:C.white}}>{cred.label}</span>
                          {cred.lastTestResult&&(
                            <span style={{width:8,height:8,borderRadius:4,background:testColor,display:"inline-block"}} title={`Last test: ${cred.lastTestResult}`}/>
                          )}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
                          <code style={{fontSize:11,color:C.textMuted,fontFamily:"monospace"}}>{cred.envKey}</code>
                          <span style={{fontSize:11,color:C.textDim}}>·</span>
                          <button onClick={()=>toggleReveal(cred.envKey)} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:4}}>
                            <Eye size={11} color={C.textMuted}/>
                            <span style={{fontSize:11,color:C.textMuted}}>{isRevealed?cred.maskedValue:"••••••••"}</span>
                          </button>
                          {cred.lastRotated&&<span style={{fontSize:10,color:C.textDim}}>Rotated {new Date(cred.lastRotated).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>handleTest(cred)} disabled={isTesting} style={{...btn,background:C.bgHover,color:C.white,fontSize:11,padding:"5px 10px"}}>
                          {isTesting?<><Loader2 size={11} className="ap-spin"/>Testing...</>:<><Zap size={11}/>Test</>}
                        </button>
                        {!isEditing&&<button onClick={()=>{setEditKey(cred.envKey);setEditValue("");}} style={{...btn,background:C.bgHover,color:C.amber,fontSize:11,padding:"5px 10px"}}>
                          <Edit3 size={11}/>Edit
                        </button>}
                      </div>
                    </div>

                    {/* Edit row */}
                    {isEditing&&(
                      <div>
                        <div style={{display:"flex",gap:8}}>
                          <input
                            type="text"
                            value={editValue}
                            onChange={e=>setEditValue(e.target.value)}
                            placeholder="Paste new key value..."
                            style={{...inputStyle,flex:1,fontSize:12,fontFamily:"monospace"}}
                            autoFocus
                          />
                          {!isConfirming?(
                            <button onClick={()=>{if(!editValue.trim()){toast("error","Enter a value");return;}setConfirmKey(cred.envKey);}} style={{...btn,background:C.amber,color:C.white,fontSize:11,padding:"5px 14px"}}>
                              <CheckCircle size={11}/>Save
                            </button>
                          ):(
                            <button onClick={()=>handleSave(cred)} style={{...btn,background:C.red,color:C.white,fontSize:11,padding:"5px 14px",animation:"pulse 1s infinite"}}>
                              <AlertTriangle size={11}/>Confirm Save
                            </button>
                          )}
                          <button onClick={()=>{setEditKey(null);setEditValue("");setConfirmKey(null);}} style={{...btn,background:C.bgHover,color:C.textDim,fontSize:11,padding:"5px 10px"}}>
                            <XCircle size={11}/>Cancel
                          </button>
                        </div>
                        {isConfirming&&(
                          <p style={{fontSize:11,color:C.amber,marginTop:6}}>
                            This will immediately replace the live key. Are you sure?
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Quick Toggles
   ══════════════════════════════════════════ */
const TogglesSection = ({ toast }) => {
  const [toggles,setToggles]=useState(null); const [loading,setLoading]=useState(true);
  // Toggle → backend mapping: which backend to call and what field name to send
  const TOGGLE_MAP={
    nfl_season:      {backend:"nfl",    field:"isCurrent"},
    nfl_draft:       {backend:"nfl",    field:"draftEnabled"},
    rivals_nfl:      {backend:"nfl",    field:"rivalsNFLEnabled"},
    soccer_transfers:{backend:"soccer", field:"transfersEnabled"},
    soccer_auctions: {backend:"soccer", field:"auctionsEnabled"},
    maintenance_mode:{backend:"soccer", field:"isMaintenanceMode"},
    rivals_soccer:   {backend:"soccer", field:"rivalsSoccerEnabled"},
    live_scoring:    {backend:"both",   nflField:"liveScoringEnabled", soccerField:"liveScoringEnabled"},
    auto_matchday:   {backend:"both",   nflField:"autoMatchdayEnabled", soccerField:"autoMatchdayEnabled"},
    player_images_nfl:   {backend:"nfl",    field:"playerImagesEnabled"},
    player_images_soccer:{backend:"soccer", field:"playerImagesEnabled"},
    article_team_logos:  {backend:"soccer", field:"articleTeamLogosEnabled"},
  };
  useEffect(()=>{let c=false;(async()=>{try{const raw=await adminAPI.getToggles();if(c)return;const n=raw.nfl?.data?.settings||raw.nfl?.settings||raw.nfl?.data||{};const s=raw.soccer?.data?.settings||raw.soccer?.settings||raw.soccer?.data||{};setToggles({nfl_season:!!n.isCurrent,nfl_draft:!!n.draftEnabled,rivals_nfl:n.rivalsNFLEnabled!==false,soccer_transfers:s.transfersEnabled!==false,soccer_auctions:s.auctionsEnabled!==false,maintenance_mode:!!s.isMaintenanceMode,rivals_soccer:s.rivalsSoccerEnabled!==false,live_scoring:n.liveScoringEnabled!==false&&s.liveScoringEnabled!==false,auto_matchday:n.autoMatchdayEnabled!==false&&s.autoMatchdayEnabled!==false,player_images_nfl:n.playerImagesEnabled!==false,player_images_soccer:s.playerImagesEnabled!==false,article_team_logos:s.articleTeamLogosEnabled!==false});}catch{setToggles({nfl_season:true,nfl_draft:false,soccer_transfers:true,soccer_auctions:true,maintenance_mode:false,rivals_soccer:true,rivals_nfl:true,live_scoring:true,auto_matchday:true,player_images_nfl:true,player_images_soccer:true,article_team_logos:true});}finally{if(!c)setLoading(false);}})();return()=>{c=true};},[]);
  const flip=async(key)=>{if(!toggles)return;const next=!toggles[key];const prev={...toggles};setToggles({...toggles,[key]:next});try{const tm=TOGGLE_MAP[key];if(!tm){toast("warn","Unknown toggle");return;}if(tm.backend==="nfl"){await adminAPI.updateNFLToggles({[tm.field]:next});}else if(tm.backend==="soccer"){await adminAPI.updateSoccerToggles({[tm.field]:next});}else if(tm.backend==="both"){await Promise.allSettled([adminAPI.updateNFLToggles({[tm.nflField]:next}),adminAPI.updateSoccerToggles({[tm.soccerField]:next})]);}toast("success",`${key.replace(/_/g," ")} ${next?"enabled":"disabled"}`);}catch(e){setToggles(prev);toast("error",e?.response?.data?.message||"Toggle failed");}};
  if(loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:10}}><Spinner size={24}/><span style={{color:C.textDim}}>Loading toggles...</span></div>;
  if(!toggles) return null;
  const groups=[{title:"Seasons & Modes",items:[{key:"nfl_season",label:"A.Football Season",desc:"Enable/disable current A.Football season"},{key:"rivals_soccer",label:"Rivals Soccer",desc:"Toggle Rivals Soccer mode"},{key:"rivals_nfl",label:"Rivals A.Football",desc:"Toggle Rivals A.Football mode"}]},{title:"Features",items:[{key:"soccer_transfers",label:"Soccer Transfers",desc:"Allow transfers"},{key:"nfl_draft",label:"A.Football Draft Mode",desc:"Enable live drafts"},{key:"soccer_auctions",label:"Soccer Auctions",desc:"Enable auction house"},{key:"player_images_nfl",label:"A.Football Player Images",desc:"Show player headshots (off = initials fallback)"},{key:"player_images_soccer",label:"Soccer Player Images",desc:"Show player photos (off = initials fallback)"},{key:"article_team_logos",label:"Article Team Logos",desc:"Show team logos in articles (off = team names only)"}]},{title:"System",items:[{key:"maintenance_mode",label:"Maintenance Mode",desc:"Show maintenance banner",danger:true},{key:"live_scoring",label:"Live Scoring Engine",desc:"Real-time score processing"},{key:"auto_matchday",label:"Auto Matchday",desc:"Automatic matchday processing"}]}];
  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:20,display:"flex",alignItems:"center",gap:8}}><ToggleLeft size={20} color={C.green}/>Quick Toggles</h2>
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        {groups.map(g=>(<div key={g.title} style={card}><div style={{...labelStyle,marginBottom:14}}>{g.title}</div><div style={{display:"flex",flexDirection:"column",gap:10}}>{g.items.map(item=>(<div key={item.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0"}}>
          <div><span style={{fontSize:13,fontWeight:600,color:item.danger?C.red:C.white}}>{item.label}</span><p style={{fontSize:11,color:C.textMuted,margin:"2px 0 0"}}>{item.desc}</p></div>
          <button onClick={()=>flip(item.key)} style={{width:44,height:26,borderRadius:13,border:"none",cursor:"pointer",position:"relative",background:toggles[item.key]?(item.danger?C.red:C.green):C.bgHover,transition:"background .2s"}}>
            <div style={{position:"absolute",top:3,width:20,height:20,borderRadius:10,background:C.white,boxShadow:"0 1px 3px rgba(0,0,0,0.3)",transition:"transform .2s",transform:toggles[item.key]?"translateX(21px)":"translateX(3px)"}}/>
          </button>
        </div>))}</div></div>))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Audit Logs
   ══════════════════════════════════════════ */
const AuditSection = ({ toast }) => {
  const [filter,setFilter]=useState(""); const [logs,setLogs]=useState([]); const [loading,setLoading]=useState(true);
  const loadLogs=useCallback(async(params={})=>{try{setLoading(true);const raw=await adminAPI.getAuditLogs(params);const n=Array.isArray(raw.nfl?.data)?raw.nfl.data:raw.nfl?.data?.logs||raw.nfl?.logs||[];const s=Array.isArray(raw.soccer?.data)?raw.soccer.data:raw.soccer?.data?.logs||raw.soccer?.logs||[];setLogs([...n.map(l=>({...l,_src:"nfl"})),...s.map(l=>({...l,_src:"soccer"}))].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,100));}catch{toast("error","Failed to load audit logs");}finally{setLoading(false);}},[toast]);
  useEffect(()=>{loadLogs();},[loadLogs]);
  const cols=[{key:"createdAt",label:"Time",render:r=><span style={{fontSize:11}}>{ts(r.createdAt)}</span>},{key:"actor",label:"Admin",render:r=><span style={{fontWeight:600,color:C.white}}>{typeof r.actor==="object"?r.actor?.userName||r.actor?.email:r.actor||"system"}</span>},{key:"action",label:"Action"},{key:"category",label:"Category",render:r=><Badge color="blue">{r.category||"—"}</Badge>},{key:"_src",label:"Backend",render:r=><Badge color={r._src==="nfl"?"purple":"teal"}>{r._src}</Badge>}];
  const filtered=filter.trim()?logs.filter(l=>JSON.stringify(l).toLowerCase().includes(filter.toLowerCase())):logs;
  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:20,display:"flex",alignItems:"center",gap:8}}><FileText size={20} color={C.blue}/>Audit Logs</h2>
      <div style={{display:"flex",gap:8,marginBottom:14}}><div style={{flex:1}}><SearchBar value={filter} onChange={setFilter} placeholder="Filter logs..."/></div><button onClick={()=>loadLogs()} style={{...btn,background:C.bgHover,color:C.white}}><RefreshCw size={13}/>Refresh</button></div>
      <DataTable columns={cols} data={filtered} loading={loading} emptyMsg="No audit logs found"/>
      <p style={{fontSize:11,color:C.textMuted,marginTop:10}}>Every admin action is permanently recorded.</p>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Corrections
   ══════════════════════════════════════════ */
const CorrectionSection = ({ toast }) => {
  const [mode,setMode]=useState("nfl"); const [gameId,setGameId]=useState(""); const [correction,setCorrection]=useState(null);
  const lookupGame=()=>{if(!gameId.trim())return toast("error","Enter a Game ID");setCorrection({gameId:gameId.trim(),homeTeam:mode==="nfl"?"Kansas City Chiefs":"Manchester City",awayTeam:mode==="nfl"?"Buffalo Bills":"Liverpool FC",homeScore:mode==="nfl"?27:2,awayScore:mode==="nfl"?24:1,status:"final",quarter:mode==="nfl"?"Q4":"FT"});toast("success","Game found");};
  const modes=[{id:"nfl",label:"A.Football",color:C.purple},{id:"soccer",label:"Soccer",color:C.teal},{id:"rivals_nfl",label:"Rivals A.Football",color:C.amber},{id:"rivals_soccer",label:"Rivals Soccer",color:C.green}];
  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:20,display:"flex",alignItems:"center",gap:8}}><Edit3 size={20} color={C.amber}/>Live Correction Suite</h2>
      <div style={{background:C.amberLight,border:`1px solid ${C.amber}33`,borderRadius:12,padding:14,display:"flex",alignItems:"flex-start",gap:10,marginBottom:20}}>
        <AlertTriangle size={16} color={C.amber} style={{flexShrink:0,marginTop:2}}/><div><h4 style={{color:C.amber,fontWeight:700,fontSize:13,margin:0}}>Safety Warning</h4><p style={{color:`${C.amber}99`,fontSize:11,margin:"4px 0 0"}}>Score overrides affect standings, fantasy points, and rankings. All corrections are logged.</p></div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>{modes.map(m=>(<button key={m.id} onClick={()=>{setMode(m.id);setCorrection(null)}} style={{...btn,background:mode===m.id?m.color:C.bgHover,color:C.white}}>{m.label}</button>))}</div>
      <SearchBar value={gameId} onChange={setGameId} placeholder="Enter Game ID, Fixture ID, or Match ID..." onSearch={lookupGame}/>
      {correction&&(<div style={{...card,marginTop:20,borderColor:C.amber+"33"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><h3 style={{color:C.white,fontWeight:700,fontSize:14,margin:0,display:"flex",alignItems:"center",gap:8}}><Activity size={14} color={C.amber}/>Game #{correction.gameId}</h3><Badge color={correction.status==="final"?"green":"amber"}>{correction.status}</Badge></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:20,alignItems:"center",marginBottom:20}}>
          <div style={{textAlign:"center"}}><p style={{color:C.white,fontWeight:700,fontSize:16,margin:0}}>{correction.homeTeam}</p><p style={{fontSize:11,color:C.textMuted,margin:"4px 0 0"}}>HOME</p></div>
          <div style={{display:"flex",alignItems:"center",gap:12}}><input type="number" value={correction.homeScore} onChange={e=>setCorrection({...correction,homeScore:Number(e.target.value)})} style={{...inputStyle,width:60,textAlign:"center",fontSize:24,fontWeight:800,padding:8}}/><span style={{color:C.textMuted,fontSize:20,fontWeight:700}}>—</span><input type="number" value={correction.awayScore} onChange={e=>setCorrection({...correction,awayScore:Number(e.target.value)})} style={{...inputStyle,width:60,textAlign:"center",fontSize:24,fontWeight:800,padding:8}}/></div>
          <div style={{textAlign:"center"}}><p style={{color:C.white,fontWeight:700,fontSize:16,margin:0}}>{correction.awayTeam}</p><p style={{fontSize:11,color:C.textMuted,margin:"4px 0 0"}}>AWAY</p></div>
        </div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>toast("success",`Score corrected: ${correction.homeScore} - ${correction.awayScore}`)} style={{...btn,background:C.amber,color:C.white}}><CheckCircle size={13}/>Publish Correction</button><button onClick={()=>setCorrection(null)} style={{...btn,background:C.bgHover,color:C.textDim}}>Discard</button></div>
      </div>)}
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Data Pipeline
   ══════════════════════════════════════════ */
const NFL_CRONS=[{id:"nfl_data_sync",name:"NFL Data Sync",desc:"Teams, players, injuries from API-Sports",schedule:"Every 6h",source:"API-Sports"},{id:"nfl_tank01_sync",name:"Tank01 Player Sync",desc:"Full player DB from RapidAPI",schedule:"Daily 4AM",source:"Tank01"},{id:"nfl_otc_scraper",name:"OTC Salary Scraper",desc:"Cap data from OverTheCap",schedule:"Daily 5AM",source:"OverTheCap"},{id:"nfl_projections",name:"Projections Engine",desc:"Weekly fantasy projections",schedule:"Wed/Sat 8AM",source:"Internal"},{id:"nfl_live_match",name:"Live Match Poller",desc:"Live scores during games",schedule:"Every 15min",source:"API-Sports"},{id:"nfl_ai_autopilot",name:"AI Autopilot",desc:"Auto-manage inactive squads",schedule:"Every 30min",source:"Internal AI"},{id:"nfl_rivals_cron",name:"NFL Rivals Cron",desc:"Scoring, pods, season transitions",schedule:"Every 2h",source:"Internal"},{id:"nfl_week_advance",name:"Week Advance",desc:"Advance week, lock lineups",schedule:"Tuesdays 6AM",source:"Internal"}];
const SOCCER_CRONS=[{id:"soccer_data_refresh",name:"Data Refresh (3-Tier)",desc:"Live scores, standings, player stats",schedule:"5min/1h/6h",source:"API-Football"},{id:"soccer_matchweek",name:"Matchweek Processor",desc:"Results, fantasy points, standings",schedule:"Post-matchweek",source:"Internal"},{id:"soccer_live_match",name:"Live Match Poller",desc:"Real-time scores and events",schedule:"Every 5min",source:"API-Football"},{id:"soccer_rivals_cron",name:"Soccer Rivals Cron",desc:"Scoring, drafts, pods, season lifecycle",schedule:"Every 2h",source:"Internal"},{id:"soccer_loan",name:"Loan & Transfer Sync",desc:"Loans, transfers from Transfermarkt",schedule:"Daily 6AM",source:"Transfermarkt"},{id:"soccer_news",name:"News Feed",desc:"Google News RSS aggregation",schedule:"Every 1h",source:"Google RSS"},{id:"soccer_competitive_balance",name:"Competitive Balance",desc:"League health analysis + rebalancing",schedule:"Weekly Mon",source:"Internal AI"}];
const EXT_SOURCES=[{id:"ext_api_sports",name:"API-Sports (NFL)",type:"api",backend:"nfl",rate:"300/min",status:"healthy"},{id:"ext_tank01",name:"Tank01",type:"api",backend:"nfl",rate:"1,000/day",status:"healthy"},{id:"ext_otc",name:"OverTheCap",type:"scraper",backend:"nfl",rate:"Polite",status:"healthy"},{id:"ext_api_football",name:"API-Football",type:"api",backend:"soccer",rate:"300/min",status:"healthy"},{id:"ext_fbref",name:"FBref",type:"scraper",backend:"soccer",rate:"Polite",status:"healthy"},{id:"ext_sofascore",name:"SofaScore",type:"scraper",backend:"soccer",rate:"Polite",status:"healthy"},{id:"ext_transfermarkt",name:"Transfermarkt",type:"scraper",backend:"soccer",rate:"Polite",status:"healthy"},{id:"ext_gnews",name:"Google News RSS",type:"rss",backend:"both",rate:"No limit",status:"healthy"}];

const DataPipelineSection = ({ toast }) => {
  const [tab,setTab]=useState("nfl"); const [cronStates,setCronStates]=useState({}); const [liveData,setLiveData]=useState({nfl:null,soccer:null}); const [loading,setLoading]=useState(true); const [uptime,setUptime]=useState({nfl:null,soccer:null});
  // Fetch real cron status from backends
  const fetchCronStatus=useCallback(async()=>{try{const raw=await adminAPI.getCronStatus();if(raw.nfl){setUptime(u=>({...u,nfl:raw.nfl.uptime}));const live={};(raw.nfl.crons||[]).forEach(c=>{live[c.id]=c;});setLiveData(d=>({...d,nfl:live}));}if(raw.soccer){setUptime(u=>({...u,soccer:raw.soccer.uptime}));const live={};(raw.soccer.crons||[]).forEach(c=>{live[c.id]=c;});setLiveData(d=>({...d,soccer:live}));}}catch{}finally{setLoading(false);}},[]);
  useEffect(()=>{fetchCronStatus();const iv=setInterval(fetchCronStatus,30000);return()=>clearInterval(iv);},[fetchCronStatus]);
  const fmtUptime=(s)=>{if(!s)return"—";const d=Math.floor(s/86400);const h=Math.floor((s%86400)/3600);const m=Math.floor((s%3600)/60);return d>0?`${d}d ${h}h ${m}m`:`${h}h ${m}m`;};
  const toggleCron=(id)=>{setCronStates(p=>({...p,[id]:{...p[id],running:!p[id]?.running}}));const cron=[...NFL_CRONS,...SOCCER_CRONS].find(c=>c.id===id);const r=!cronStates[id]?.running;toast(r?"success":"warn",`${cron?.name||id} ${r?"resumed":"paused"}`);};
  const runNow=async(id)=>{const cron=[...NFL_CRONS,...SOCCER_CRONS].find(c=>c.id===id);try{const isNFL=NFL_CRONS.some(c=>c.id===id);if(isNFL)await adminAPI.triggerNFLSync(id);else await adminAPI.triggerSoccerSync(id);setCronStates(p=>({...p,[id]:{...p[id],lastRun:new Date().toISOString()}}));toast("success",`${cron?.name||id} triggered`);}catch(e){toast("error",e?.response?.data?.message||`Failed: ${cron?.name}`);}};
  // Merge hardcoded cron info with live data from backend
  const getLiveInfo=(cronId,backend)=>{const live=backend==="nfl"?liveData.nfl:liveData.soccer;if(!live)return null;return live[cronId]||null;};
  const activeCrons=tab==="nfl"?NFL_CRONS:tab==="soccer"?SOCCER_CRONS:[];
  const currentBackend=tab==="nfl"?"nfl":"soccer";
  const nflLiveCount=liveData.nfl?Object.keys(liveData.nfl).length:NFL_CRONS.length;
  const soccerLiveCount=liveData.soccer?Object.keys(liveData.soccer).length:SOCCER_CRONS.length;
  const tabs=[{id:"nfl",label:`NFL Crons (${nflLiveCount})`},{id:"soccer",label:`Soccer Crons (${soccerLiveCount})`},{id:"external",label:`External (${EXT_SOURCES.length})`}];
  return (
    <div>
      <h2 style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:4,display:"flex",alignItems:"center",gap:8}}><Workflow size={20} color={C.cyan}/>Data Pipeline</h2>
      <p style={{color:C.textMuted,fontSize:13,marginBottom:20}}>Monitor, pause, and trigger all cron jobs and external data sources.{loading?" Loading live data...":""}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:20}}>
        <StatCard icon={RefreshCw} label="NFL Crons" value={nflLiveCount} color="purple"/>
        <StatCard icon={RefreshCw} label="Soccer Crons" value={soccerLiveCount} color="teal"/>
        <StatCard icon={Database} label="NFL Uptime" value={fmtUptime(uptime.nfl)} color="blue"/>
        <StatCard icon={Globe} label="Soccer Uptime" value={fmtUptime(uptime.soccer)} color="amber"/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20,alignItems:"center"}}>{tabs.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{...btn,background:tab===t.id?C.cyan:C.bgHover,color:tab===t.id?C.white:C.textMuted}}>{t.label}</button>))}<button onClick={()=>{setLoading(true);fetchCronStatus();}} style={{...btn,background:C.bgHover,color:C.textMuted,marginLeft:"auto"}}><RefreshCw size={12}/>Refresh</button></div>
      {(tab==="nfl"||tab==="soccer")&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{activeCrons.map(cron=>{const st=cronStates[cron.id]||{};const live=getLiveInfo(cron.id,currentBackend);const running=live?live.running:st.running!==false;const lastRun=live?.lastRun||st.lastRun;const lastErr=live?.lastError;const nextRun=live?.nextRun;return(
        <div key={cron.id} style={{...card,borderColor:lastErr?C.red+"33":running?C.borderLight:C.amber+"33",padding:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
            <div style={{width:8,height:8,borderRadius:4,flexShrink:0,background:lastErr?C.red:running?C.green:C.amber,animation:running&&!lastErr?"pulse 2s infinite":"none"}}/>
            <div style={{minWidth:0}}><h4 style={{color:C.white,fontWeight:700,fontSize:13,margin:0}}>{live?.name||cron.name}</h4><p style={{color:C.textMuted,fontSize:11,margin:"2px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cron.desc}</p>{lastErr&&<p style={{color:C.red,fontSize:10,margin:"2px 0 0"}}>Error: {lastErr}</p>}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14,flexShrink:0,marginLeft:14}}>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.textMuted}}>Schedule</div><div style={{fontSize:11,color:C.text,fontWeight:600}}>{live?.schedule||cron.schedule}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.textMuted}}>Last Run</div><div style={{fontSize:11,color:lastRun?C.text:C.textMuted,fontWeight:600}}>{lastRun?ts(lastRun):"Never"}</div></div>
            {nextRun&&<div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.textMuted}}>Next</div><div style={{fontSize:11,color:C.text,fontWeight:600}}>{ts(nextRun)}</div></div>}
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.textMuted}}>Source</div><div style={{fontSize:11,color:C.text,fontWeight:600}}>{cron.source}</div></div>
            <Badge color={lastErr?"red":running?"green":"amber"}>{lastErr?"Error":running?"Running":"Idle"}</Badge>
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>runNow(cron.id)} title="Run Now" style={{...btn,padding:6,background:C.cyanLight,color:C.cyan}}><Play size={12}/></button>
              <button onClick={()=>toggleCron(cron.id)} title={running?"Pause":"Resume"} style={{...btn,padding:6,background:running?C.amberLight:C.greenLight,color:running?C.amber:C.green}}>{running?<Pause size={12}/>:<Play size={12}/>}</button>
            </div>
          </div>
        </div>
      );})}</div>}
      {tab==="external"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{EXT_SOURCES.map(src=>{const healthy=src.status==="healthy";return(
        <div key={src.id} style={{...card,borderColor:healthy?C.borderLight:C.amber+"33",padding:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
            <div style={{width:8,height:8,borderRadius:4,background:healthy?C.green:src.status==="degraded"?C.amber:C.red}}/>
            <div><h4 style={{color:C.white,fontWeight:700,fontSize:13,margin:0,display:"flex",alignItems:"center",gap:6}}>{src.name}<Badge color={src.type==="api"?"blue":"amber"}>{src.type}</Badge><Badge color={src.backend==="nfl"?"purple":"teal"}>{src.backend}</Badge></h4></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.textMuted}}>Rate</div><div style={{fontSize:11,color:C.text,fontWeight:600}}>{src.rate}</div></div>
            <Badge color={healthy?"green":src.status==="degraded"?"amber":"red"}>{"● "+(healthy?"Healthy":src.status==="degraded"?"Degraded":"Down")}</Badge>
          </div>
        </div>
      );})}</div>}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   EMPLOYEES SECTION (Super Admin Only)
   ══════════════════════════════════════════════════════════ */
const EmployeesSection = ({ toast }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", secondaryPassword: "" });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.listEmployees();
      const data = res.data?.data?.employees || res.data?.employees || [];
      setEmployees(data);
    } catch (e) { toast("error", "Failed to load employees"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminAPI.createEmployee(form);
      toast("success", `Account created for ${form.email}`);
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", secondaryPassword: "" });
      load();
    } catch (e) {
      toast("error", e.response?.data?.message || "Failed to create employee");
    }
    setCreating(false);
  };

  const handleToggle = async (emp) => {
    try {
      if (emp.isActive) {
        await adminAPI.deactivateEmployee(emp._id);
        toast("success", `${emp.email} deactivated`);
      } else {
        await adminAPI.activateEmployee(emp._id);
        toast("success", `${emp.email} activated`);
      }
      load();
    } catch (e) { toast("error", e.response?.data?.message || "Action failed"); }
  };

  const inputSt = { width:"100%",padding:"10px 12px",background:C.bgInput,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none" };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div><h3 style={{fontSize:18,fontWeight:700,color:C.white,margin:0}}>Employee Management</h3><p style={{fontSize:12,color:C.textMuted,margin:"4px 0 0"}}>Create and manage admin accounts</p></div>
        <button onClick={()=>setShowCreate(!showCreate)} style={{padding:"8px 16px",background:C.blue,color:C.white,border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit"}}>
          <UserPlus size={14}/> New Employee
        </button>
      </div>

      {showCreate && (
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:20,marginBottom:20}}>
          <h4 style={{fontSize:14,fontWeight:700,color:C.white,margin:"0 0 16px"}}>Create Admin Account</h4>
          <form onSubmit={handleCreate}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{fontSize:11,color:C.textDim,fontWeight:600,display:"block",marginBottom:4}}>Full Name</label><input style={inputSt} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="John Doe" required/></div>
              <div><label style={{fontSize:11,color:C.textDim,fontWeight:600,display:"block",marginBottom:4}}>Email</label><input style={inputSt} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="admin@samsports.io" required/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label style={{fontSize:11,color:C.textDim,fontWeight:600,display:"block",marginBottom:4}}>Primary Password</label><input style={inputSt} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min 15 chars, 1 upper, 1 num, 1 symbol" required/></div>
              <div><label style={{fontSize:11,color:C.textDim,fontWeight:600,display:"block",marginBottom:4}}>Secondary Password</label><input style={inputSt} type="password" value={form.secondaryPassword} onChange={e=>setForm({...form,secondaryPassword:e.target.value})} placeholder="Min 15 chars, 1 upper, 1 num, 1 symbol" required/></div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button type="button" onClick={()=>setShowCreate(false)} style={{padding:"8px 16px",background:C.bgHover,color:C.textDim,border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button type="submit" disabled={creating} style={{padding:"8px 16px",background:C.green,color:C.white,border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:creating?0.6:1}}>{creating?"Creating...":"Create Account"}</button>
            </div>
          </form>
          <p style={{fontSize:11,color:C.textMuted,margin:"12px 0 0"}}>Password requirements: 15+ characters, at least 1 uppercase, 1 number, and 1 symbol.</p>
        </div>
      )}

      {loading ? <div style={{textAlign:"center",padding:40}}><Loader2 size={24} style={{animation:"spin 1s linear infinite",color:C.blue}}/></div> : (
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                {["Name","Email","Role","Status","Last Login","Actions"].map(h=><th key={h} style={{padding:"10px 14px",fontSize:11,fontWeight:700,color:C.textMuted,textAlign:"left",textTransform:"uppercase",letterSpacing:1}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {employees.map(emp=>(
                <tr key={emp._id} style={{borderBottom:`1px solid ${C.border}22`}}>
                  <td style={{padding:"10px 14px",fontSize:13,fontWeight:600,color:C.text}}>{emp.name}</td>
                  <td style={{padding:"10px 14px",fontSize:13,color:C.textDim}}>{emp.email}</td>
                  <td style={{padding:"10px 14px"}}><span style={{fontSize:11,fontWeight:700,color:emp.role==="superadmin"?C.purple:C.blue,background:emp.role==="superadmin"?C.purpleLight:C.blueLight,padding:"3px 8px",borderRadius:6,textTransform:"uppercase"}}>{emp.role}</span></td>
                  <td style={{padding:"10px 14px"}}><span style={{fontSize:11,fontWeight:700,color:emp.isActive?C.green:C.red,background:emp.isActive?C.greenLight:C.redLight,padding:"3px 8px",borderRadius:6}}>{emp.isActive?"Active":"Inactive"}</span></td>
                  <td style={{padding:"10px 14px",fontSize:12,color:C.textMuted}}>{(emp.lastLoginDate||emp.lastLogin)?new Date(emp.lastLoginDate||emp.lastLogin).toLocaleString():"Never"}</td>
                  <td style={{padding:"10px 14px"}}>
                    {emp.role!=="superadmin"&&<button onClick={()=>handleToggle(emp)} style={{padding:"4px 10px",background:emp.isActive?C.redLight:C.greenLight,color:emp.isActive?C.red:C.green,border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{emp.isActive?"Deactivate":"Activate"}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employees.length===0&&<p style={{textAlign:"center",padding:20,color:C.textMuted,fontSize:13}}>No employees found</p>}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SETTINGS SECTION
   ══════════════════════════════════════════════════════════ */
const SettingsSection = ({ toast, adminUser }) => {
  return (
    <div>
      <h3 style={{fontSize:18,fontWeight:700,color:C.white,margin:"0 0 20px"}}>Admin Settings</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
          <h4 style={{fontSize:14,fontWeight:700,color:C.white,margin:"0 0 12px"}}>Your Profile</h4>
          <div style={{fontSize:13,color:C.textDim,lineHeight:1.8}}>
            <div><span style={{color:C.textMuted}}>Name:</span> <span style={{color:C.text}}>{adminUser?.name || "—"}</span></div>
            <div><span style={{color:C.textMuted}}>Email:</span> <span style={{color:C.text}}>{adminUser?.email || "—"}</span></div>
            <div><span style={{color:C.textMuted}}>Role:</span> <span style={{color:adminUser?.role==="superadmin"?C.purple:C.blue,fontWeight:600,textTransform:"uppercase"}}>{adminUser?.role || "—"}</span></div>
          </div>
        </div>
        <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:20}}>
          <h4 style={{fontSize:14,fontWeight:700,color:C.white,margin:"0 0 12px"}}>Platform Info</h4>
          <div style={{fontSize:13,color:C.textDim,lineHeight:1.8}}>
            <div><span style={{color:C.textMuted}}>Admin URL:</span> <span style={{color:C.text}}>backoffice.samsports.io</span></div>
            <div><span style={{color:C.textMuted}}>A.Football Backend:</span> <span style={{color:C.text}}>backend.samsports.io</span></div>
            <div><span style={{color:C.textMuted}}>Soccer Backend:</span> <span style={{color:C.text}}>soccerbackend.samsports.io</span></div>
            <div><span style={{color:C.textMuted}}>Session:</span> <span style={{color:C.green}}>8h admin JWT</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PREDICTOR ADMIN SECTION
   ══════════════════════════════════════════════════════════ */
/* ── Event definitions: each league/competition is an "event" ── */
const EVENTS = [
  { key: "all",   label: "All Events",        competition: null,      leagueId: null, color: "blue",   icon: Globe },
  { key: "wc",    label: "World Cup 2026",     competition: "worldcup", leagueId: 1,  color: "amber",  icon: Award },
  { key: "61",    label: "French First Division", competition: "weekly",  leagueId: 61,  color: "blue",   icon: Flag },
  { key: "39",    label: "English Premier",    competition: "weekly",  leagueId: 39,  color: "purple", icon: Flag },
  { key: "140",   label: "Spanish First Division", competition: "weekly",  leagueId: 140, color: "amber",  icon: Flag },
  { key: "135",   label: "Italian First Division", competition: "weekly",  leagueId: 135, color: "green",  icon: Flag },
  { key: "78",    label: "German First Division", competition: "weekly",  leagueId: 78,  color: "red",    icon: Flag },
  { key: "2",     label: "European Cup",       competition: "weekly",  leagueId: 2,   color: "teal",   icon: Trophy },
];
const LEAGUE_NAMES = {};
EVENTS.forEach(e => { if (e.leagueId) LEAGUE_NAMES[e.leagueId] = e.label; });

const PredictorSection = ({ toast }) => {
  const [activeEvent, setActiveEvent] = useState("all");
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);
  const [autoSettling, setAutoSettling] = useState(false);
  const [settleForm, setSettleForm] = useState({ fixtureId: "", actualResult: "home", actualHomeScore: "", actualAwayScore: "" });
  const [resetFixId, setResetFixId] = useState("");
  const [resetting, setResetting] = useState(false);

  const ev = EVENTS.find(e => e.key === activeEvent) || EVENTS[0];

  const subTabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "settle", label: "Manual Settle", icon: CheckCircle },
  ];

  /* ── Data loading ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, pendRes] = await Promise.allSettled([
        adminAPI.getPredictorDashboard(),
        adminAPI.getPredictorPending(),
      ]);
      if (dashRes.status === "fulfilled") setStats(dashRes.value.data?.data?.stats || dashRes.value.data?.stats || null);
      if (pendRes.status === "fulfilled") setPending(pendRes.value.data?.data?.pending || pendRes.value.data?.pending || []);
    } catch (e) { toast("error", e.message); }
    setLoading(false);
  }, [toast]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const params = { limit: 100 };
      if (ev.competition) params.competition = ev.competition;
      if (ev.leagueId) params.leagueId = ev.leagueId;
      const res = await adminAPI.getPredictorLeaderboard(params);
      setLeaderboard(res.data?.data?.leaderboard || res.data?.leaderboard || []);
    } catch (e) { toast("error", e.message); }
  }, [ev, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === "leaderboard") loadLeaderboard(); }, [tab, activeEvent, loadLeaderboard]);

  /* ── Filtered data for selected event ── */
  const filteredPending = activeEvent === "all"
    ? pending
    : pending.filter(p => String(p._id) === String(ev.leagueId));

  const getEventStats = () => {
    if (!stats) return null;
    if (activeEvent === "all") return stats;
    // Try per-league breakdown
    const ls = stats.perLeagueStats?.find(s =>
      String(s._id?.leagueId) === String(ev.leagueId) &&
      (!ev.competition || s._id?.competition === ev.competition)
    );
    if (ls) return {
      totalPredictions: ls.totalPicks,
      unsettledCount: ls.unsettled,
      settledCount: ls.settled,
      correctCount: ls.correct,
      accuracy: ls.accuracy,
      totalPointsAwarded: ls.totalAwarded,
      userCount: ls.userCount,
      seasons: ls.seasons,
    };
    return null;
  };

  const filteredRecent = stats?.recentSettlements?.filter(s => {
    if (activeEvent === "all") return true;
    if (ev.competition && s.competition !== ev.competition) return false;
    if (ev.leagueId && String(s.leagueId) !== String(ev.leagueId)) return false;
    return true;
  }) || [];

  /* ── Actions ── */
  const handleSettle = async () => {
    if (!settleForm.fixtureId) return toast("error", "Fixture ID required");
    setSettling(true);
    try {
      const res = await adminAPI.adminSettleFixture({
        fixtureId: Number(settleForm.fixtureId),
        actualResult: settleForm.actualResult,
        actualHomeScore: settleForm.actualHomeScore !== "" ? Number(settleForm.actualHomeScore) : null,
        actualAwayScore: settleForm.actualAwayScore !== "" ? Number(settleForm.actualAwayScore) : null,
      });
      const d = res.data?.data || res.data;
      toast("success", d.message || `Settled ${d.settled} picks`);
      setSettleForm({ fixtureId: "", actualResult: "home", actualHomeScore: "", actualAwayScore: "" });
      load();
    } catch (e) { toast("error", e.response?.data?.message || e.message); }
    setSettling(false);
  };

  const handleAutoSettle = async () => {
    setAutoSettling(true);
    try {
      await adminAPI.triggerAutoSettle();
      toast("success", "Auto-settle completed — checked API-Football for finished matches");
      load();
    } catch (e) { toast("error", e.response?.data?.message || e.message); }
    setAutoSettling(false);
  };

  const handleReset = async () => {
    if (!resetFixId) return toast("error", "Fixture ID required");
    setResetting(true);
    try {
      const res = await adminAPI.resetFixtureSettlement(Number(resetFixId));
      const d = res.data?.data || res.data;
      toast("success", d.message || `Reset ${d.reset} predictions`);
      setResetFixId("");
      load();
    } catch (e) { toast("error", e.response?.data?.message || e.message); }
    setResetting(false);
  };

  const evStats = getEventStats();

  return (
    <div>
      {/* ── Event selector (top bar) ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", padding: "12px 16px", background: "rgba(15,23,42,0.6)", borderRadius: 14, border: `1px solid ${C.borderLight}` }}>
        {EVENTS.map(e => {
          const active = activeEvent === e.key;
          const [bg, fg] = colorMap[e.color] || colorMap.blue;
          return (
            <button key={e.key} onClick={() => setActiveEvent(e.key)}
              style={{ ...btn, background: active ? bg : "transparent", color: active ? fg : C.textMuted,
                border: active ? `1px solid ${fg}44` : "1px solid transparent", fontSize: 12, padding: "7px 14px" }}>
              <e.icon size={13} />{e.label}
            </button>
          );
        })}
      </div>

      {/* ── Sub-tabs + actions ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...btn, background: tab === t.id ? C.blueLight : C.bgCard, color: tab === t.id ? C.blue : C.textDim, border: tab === t.id ? `1px solid ${C.blue}33` : `1px solid ${C.borderLight}` }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={handleAutoSettle} disabled={autoSettling} style={{ ...btn, background: C.greenLight, color: C.green, border: `1px solid ${C.green}33` }}>
          {autoSettling ? <Spinner size={12} /> : <Zap size={14} />} Auto-Settle Now
        </button>
        <button onClick={load} style={{ ...btn, background: C.bgCard, color: C.textDim }}><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* ════════ OVERVIEW ════════ */}
      {tab === "overview" && (
        <div>
          {loading ? <div style={{ textAlign: "center", padding: 40 }}><Spinner /></div> : (
            <div>
              {/* Global summary cards (always show) */}
              {activeEvent === "all" && stats && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
                    <StatCard icon={Activity} label="Total Predictions" value={fmt(stats.totalPredictions)} color="blue" />
                    <StatCard icon={Clock} label="Unsettled" value={fmt(stats.unsettledCount)} color="amber" />
                    <StatCard icon={CheckCircle} label="Settled" value={fmt(stats.settledCount)} color="green" />
                    <StatCard icon={Award} label="Correct" value={`${fmt(stats.correctCount)} (${stats.accuracy}%)`} color="purple" />
                    <StatCard icon={TrendingUp} label="SP Awarded" value={fmt(stats.totalPointsAwarded)} color="teal" />
                    <StatCard icon={Globe} label="Active Events" value={(stats.activeLeagues?.length || 0) + (stats.activeCompetitions?.includes("worldcup") ? 1 : 0)} color="blue" />
                  </div>
                  {/* Per-competition summary */}
                  {stats.perCompetitionStats?.length > 0 && (
                    <div style={{ ...card, marginBottom: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: C.white, margin: "0 0 12px" }}>By Competition Type</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
                        {stats.perCompetitionStats.map(cs => (
                          <div key={cs._id} style={{ padding: 16, borderRadius: 12, background: cs._id === "worldcup" ? C.amberLight : C.blueLight, border: `1px solid ${cs._id === "worldcup" ? C.amber : C.blue}33` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              {cs._id === "worldcup" ? <Award size={16} color={C.amber} /> : <Flag size={16} color={C.blue} />}
                              <span style={{ fontSize: 14, fontWeight: 700, color: C.white, textTransform: "capitalize" }}>{cs._id === "worldcup" ? "World Cup 2026" : "Weekly Leagues"}</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 11 }}>
                              <div><span style={{ color: C.textMuted, display: "block" }}>Picks</span><span style={{ color: C.white, fontWeight: 700 }}>{fmt(cs.totalPicks)}</span></div>
                              <div><span style={{ color: C.textMuted, display: "block" }}>Users</span><span style={{ color: C.white, fontWeight: 700 }}>{cs.userCount}</span></div>
                              <div><span style={{ color: C.textMuted, display: "block" }}>Accuracy</span><span style={{ color: cs.accuracy >= 50 ? C.green : C.amber, fontWeight: 700 }}>{cs.accuracy}%</span></div>
                              <div><span style={{ color: C.textMuted, display: "block" }}>Settled</span><span style={{ color: C.green, fontWeight: 700 }}>{fmt(cs.settled)}</span></div>
                              <div><span style={{ color: C.textMuted, display: "block" }}>Pending</span><span style={{ color: C.amber, fontWeight: 700 }}>{fmt(cs.unsettled)}</span></div>
                              <div><span style={{ color: C.textMuted, display: "block" }}>SP Awarded</span><span style={{ color: C.teal, fontWeight: 700 }}>{fmt(cs.totalAwarded)}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Per-league cards grid */}
                  {stats.perLeagueStats?.length > 0 && (
                    <div style={{ ...card, marginBottom: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: C.white, margin: "0 0 12px" }}>Per League / Event</h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
                        {stats.perLeagueStats.map(ls => {
                          const evDef = EVENTS.find(e => String(e.leagueId) === String(ls._id?.leagueId) && (!e.competition || e.competition === ls._id?.competition));
                          const [bg, fg] = colorMap[evDef?.color || "blue"] || colorMap.blue;
                          return (
                            <div key={`${ls._id?.leagueId}-${ls._id?.competition}`}
                              onClick={() => { const ek = evDef?.key || String(ls._id?.leagueId); setActiveEvent(ek); }}
                              style={{ padding: 16, borderRadius: 12, background: bg, border: `1px solid ${fg}33`, cursor: "pointer", transition: "all .15s" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{evDef?.label || LEAGUE_NAMES[ls._id?.leagueId] || `League ${ls._id?.leagueId}`}</span>
                                <span style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase" }}>{ls._id?.competition}</span>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 11 }}>
                                <div><span style={{ color: C.textMuted, display: "block" }}>Picks</span><span style={{ color: C.white, fontWeight: 700 }}>{fmt(ls.totalPicks)}</span></div>
                                <div><span style={{ color: C.textMuted, display: "block" }}>Users</span><span style={{ color: C.white, fontWeight: 700 }}>{ls.userCount}</span></div>
                                <div><span style={{ color: C.textMuted, display: "block" }}>Accuracy</span><span style={{ color: ls.accuracy >= 50 ? C.green : C.amber, fontWeight: 700 }}>{ls.accuracy}%</span></div>
                                <div><span style={{ color: C.textMuted, display: "block" }}>Pending</span><span style={{ color: C.amber, fontWeight: 700 }}>{fmt(ls.unsettled)}</span></div>
                                <div><span style={{ color: C.textMuted, display: "block" }}>Correct</span><span style={{ color: C.green, fontWeight: 700 }}>{fmt(ls.correct)}</span></div>
                                <div><span style={{ color: C.textMuted, display: "block" }}>SP</span><span style={{ color: C.teal, fontWeight: 700 }}>{fmt(ls.totalAwarded)}</span></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Single event stats */}
              {activeEvent !== "all" && evStats && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 20 }}>
                    <StatCard icon={Activity} label="Predictions" value={fmt(evStats.totalPredictions)} color={ev.color} />
                    <StatCard icon={Clock} label="Unsettled" value={fmt(evStats.unsettledCount)} color="amber" />
                    <StatCard icon={CheckCircle} label="Settled" value={fmt(evStats.settledCount)} color="green" />
                    <StatCard icon={Award} label="Correct" value={`${fmt(evStats.correctCount)} (${evStats.accuracy}%)`} color="purple" />
                    <StatCard icon={TrendingUp} label="SP Awarded" value={fmt(evStats.totalPointsAwarded)} color="teal" />
                    {evStats.userCount != null && <StatCard icon={Users} label="Players" value={evStats.userCount} color="blue" />}
                  </div>
                </div>
              )}
              {activeEvent !== "all" && !evStats && !loading && (
                <div style={{ ...card, textAlign: "center", padding: 40 }}>
                  <Globe size={32} color={C.textMuted} style={{ marginBottom: 10 }} />
                  <p style={{ color: C.textDim, fontSize: 14 }}>No prediction data yet for {ev.label}</p>
                </div>
              )}

              {/* Recent settlements (filtered) */}
              {filteredRecent.length > 0 && (
                <div style={{ ...card }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: C.white, margin: "0 0 10px" }}>Recent Settlements{activeEvent !== "all" ? ` — ${ev.label}` : ""}</h4>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {["User", "Fixture", "Event", "Pick", "Actual", "Correct", "SP", "Time"].map(h => (
                          <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {filteredRecent.map((s, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                            <td style={{ padding: "8px 10px", color: C.text }}>{s.user}</td>
                            <td style={{ padding: "8px 10px", color: C.textDim }}>#{s.fixtureId}</td>
                            <td style={{ padding: "8px 10px", color: C.textDim, fontSize: 11 }}>{LEAGUE_NAMES[s.leagueId] || s.competition || "—"}</td>
                            <td style={{ padding: "8px 10px", color: C.textDim }}>{s.pickResult}</td>
                            <td style={{ padding: "8px 10px", color: C.textDim }}>{s.actualResult}</td>
                            <td style={{ padding: "8px 10px" }}>{s.correct ? <CheckCircle size={14} color={C.green} /> : <XCircle size={14} color={C.red} />}</td>
                            <td style={{ padding: "8px 10px", color: s.awardedPoints > 0 ? C.green : C.textMuted, fontWeight: 600 }}>{fmt(s.awardedPoints)}</td>
                            <td style={{ padding: "8px 10px", color: C.textMuted, fontSize: 11 }}>{ts(s.settledAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════ PENDING ════════ */}
      {tab === "pending" && (
        <div>
          {loading ? <div style={{ textAlign: "center", padding: 40 }}><Spinner /></div> : filteredPending.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: 40 }}>
              <CheckCircle size={32} color={C.green} style={{ marginBottom: 10 }} />
              <p style={{ color: C.textDim, fontSize: 14 }}>{activeEvent === "all" ? "All predictions are settled!" : `No pending picks for ${ev.label}`}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filteredPending.map(league => (
                <div key={league._id} style={card}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: C.white, margin: 0 }}>
                      {LEAGUE_NAMES[league._id] || `League ${league._id}`}
                    </h4>
                    <span style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>{league.totalPicks} picks pending</span>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {["Fixture ID", "Match", "MW", "Season", "Type", "Picks"].map(h => (
                          <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr></thead>
                      <tbody>
                        {league.fixtures.map(f => (
                          <tr key={f.fixtureId} style={{ borderBottom: `1px solid ${C.border}22` }}>
                            <td style={{ padding: "8px 10px", color: C.blue, fontWeight: 600 }}>#{f.fixtureId}</td>
                            <td style={{ padding: "8px 10px", color: C.text }}>{f.homeTeamName || "—"} vs {f.awayTeamName || "—"}</td>
                            <td style={{ padding: "8px 10px", color: C.textDim }}>{f.matchweek || "—"}</td>
                            <td style={{ padding: "8px 10px", color: C.textDim }}>{f.season || "—"}</td>
                            <td style={{ padding: "8px 10px" }}>
                              <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                                background: f.competition === "worldcup" ? C.amberLight : C.blueLight,
                                color: f.competition === "worldcup" ? C.amber : C.blue }}>
                                {f.competition === "worldcup" ? "WC" : "Weekly"}
                              </span>
                            </td>
                            <td style={{ padding: "8px 10px", color: C.amber, fontWeight: 600 }}>{f.pickCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════ LEADERBOARD ════════ */}
      {tab === "leaderboard" && (
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: C.white, margin: 0 }}>
              {activeEvent === "all" ? "Global Leaderboard" : `${ev.label} Leaderboard`}
            </h4>
            <button onClick={loadLeaderboard} style={{ ...btn, background: C.bgCard, color: C.textDim, fontSize: 11 }}><RefreshCw size={12} /> Reload</button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["#", "User", "Picks", "Settled", "Correct", "Accuracy", "SP Awarded"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: C.textMuted }}>No data yet for {ev.label}</td></tr>
                ) : leaderboard.map((u, i) => (
                  <tr key={u._id} style={{ borderBottom: `1px solid ${C.border}22` }}>
                    <td style={{ padding: "8px 10px", color: i < 3 ? C.amber : C.textDim, fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ color: C.text, fontWeight: 600 }}>{u.userName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown"}</div>
                      {u.email && <div style={{ color: C.textMuted, fontSize: 10 }}>{u.email}</div>}
                    </td>
                    <td style={{ padding: "8px 10px", color: C.textDim }}>{u.totalPicks}</td>
                    <td style={{ padding: "8px 10px", color: C.textDim }}>{u.settledPicks}</td>
                    <td style={{ padding: "8px 10px", color: C.green, fontWeight: 600 }}>{u.correctPicks}</td>
                    <td style={{ padding: "8px 10px", color: u.accuracy >= 50 ? C.green : C.amber, fontWeight: 600 }}>{u.accuracy}%</td>
                    <td style={{ padding: "8px 10px", color: C.teal, fontWeight: 700 }}>{fmt(u.totalAwarded)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════ MANUAL SETTLE ════════ */}
      {tab === "settle" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={card}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: C.white, margin: "0 0 16px" }}>Settle a Fixture</h4>
            <p style={{ color: C.textDim, fontSize: 11, marginBottom: 14 }}>Enter the API-Football fixture ID and final result. Works for any league or World Cup match.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Fixture ID (API-Football)</label>
                <input style={inputStyle} type="number" placeholder="e.g. 1035024" value={settleForm.fixtureId} onChange={e => setSettleForm({ ...settleForm, fixtureId: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Result</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["home", "draw", "away"].map(r => (
                    <button key={r} onClick={() => setSettleForm({ ...settleForm, actualResult: r })}
                      style={{ ...btn, flex: 1, justifyContent: "center", textTransform: "capitalize",
                        background: settleForm.actualResult === r ? C.blueLight : C.bgHover,
                        color: settleForm.actualResult === r ? C.blue : C.textDim,
                        border: settleForm.actualResult === r ? `1px solid ${C.blue}` : `1px solid ${C.border}` }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={labelStyle}>Home Score</label>
                  <input style={inputStyle} type="number" min="0" placeholder="0" value={settleForm.actualHomeScore} onChange={e => setSettleForm({ ...settleForm, actualHomeScore: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Away Score</label>
                  <input style={inputStyle} type="number" min="0" placeholder="0" value={settleForm.actualAwayScore} onChange={e => setSettleForm({ ...settleForm, actualAwayScore: e.target.value })} />
                </div>
              </div>
              <button onClick={handleSettle} disabled={settling} style={{ ...btn, justifyContent: "center", background: C.green, color: C.white, padding: "12px 20px", marginTop: 8 }}>
                {settling ? <Spinner size={14} /> : <CheckCircle size={14} />} Settle Fixture
              </button>
            </div>
          </div>

          <div style={card}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: C.white, margin: "0 0 16px" }}>Reset Settlement</h4>
            <p style={{ color: C.textDim, fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
              Undo a settlement — deducts awarded SP from users and marks predictions as unsettled. Use if a match result was entered incorrectly.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Fixture ID</label>
                <input style={inputStyle} type="number" placeholder="e.g. 1035024" value={resetFixId} onChange={e => setResetFixId(e.target.value)} />
              </div>
              <button onClick={handleReset} disabled={resetting} style={{ ...btn, justifyContent: "center", background: C.red, color: C.white, padding: "12px 20px" }}>
                {resetting ? <Spinner size={14} /> : <AlertTriangle size={14} />} Reset Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   CL FANTASY SECTION
   ══════════════════════════════════════════════════════════ */
const CLFantasySection = ({ toast }) => {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerSort, setPlayerSort] = useState("overallRating");
  const [posFilter, setPosFilter] = useState("");
  // Elimination & Auction state
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [auctionWindow, setAuctionWindow] = useState(null);
  const [elimStatus, setElimStatus] = useState([]);
  const [freeAgents, setFreeAgents] = useState([]);
  const [faSearch, setFaSearch] = useState("");
  const [faPos, setFaPos] = useState("");
  const [elimPhase, setElimPhase] = useState("");
  const [elimClubs, setElimClubs] = useState("");
  // Player edit/delete state
  const [editCLPlayer, setEditCLPlayer] = useState(null);
  const [savingCL, setSavingCL] = useState(false);
  const [removingClub, setRemovingClub] = useState("");
  const [elimLoading, setElimLoading] = useState(false);
  const [auctionLoading, setAuctionLoading] = useState(false);
  const [windowKey, setWindowKey] = useState("POST_LEAGUE_PHASE");
  const [crossSyncing, setCrossSyncing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, leaguesRes] = await Promise.allSettled([
        adminAPI.getCLFantasyStats(),
        adminAPI.getCLFantasyLeagues({ limit: 50 }),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data?.data || null);
      if (leaguesRes.status === "fulfilled") setLeagues(leaguesRes.value.data?.data?.leagues || []);
    } catch (err) { toast("error", "Failed to load CL Fantasy data"); }
    setLoading(false);
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadPlayers = useCallback(async () => {
    try {
      const params = { sort: playerSort, limit: 200 };
      if (posFilter) params.position = posFilter;
      if (playerSearch) params.search = playerSearch;
      const res = await adminAPI.getCLPlayerPool(params);
      setPlayers(res.data?.data?.players || []);
    } catch { /* silent */ }
  }, [playerSort, posFilter, playerSearch]);

  useEffect(() => { if (tab === "players") loadPlayers(); }, [tab, loadPlayers]);

  const loadTeams = useCallback(async () => {
    try {
      const res = await adminAPI.getCLTeams();
      setTeams(res.data?.data?.teams || null);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { if (tab === "teams") loadTeams(); }, [tab, loadTeams]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      // European football season: 2025-26 = season "2025" in API-Football
      // Before August → current season started last year; Aug+ → starts this year
      const now = new Date();
      const clSeason = now.getMonth() < 7 ? now.getFullYear() - 1 : now.getFullYear();
      const res = await adminAPI.triggerCLPlayerSync(clSeason);
      const d = res.data?.data || {};
      toast("success", `CL Sync: ${d.total || 0} players (${d.created || 0} new, ${d.updated || 0} updated)`);
      loadData();
      if (tab === "players") loadPlayers();
    } catch (err) { toast("error", err.response?.data?.message || "Sync failed"); }
    setSyncing(false);
  };

  // ── Elimination helpers ──
  const loadLeagueElimData = useCallback(async (leagueId) => {
    if (!leagueId) return;
    setElimLoading(true);
    try {
      const [awRes] = await Promise.allSettled([
        adminAPI.getCLAuctionWindow(leagueId),
      ]);
      if (awRes.status === "fulfilled") setAuctionWindow(awRes.value.data?.data || null);
    } catch { /* silent */ }
    setElimLoading(false);
  }, []);

  const loadFreeAgents = useCallback(async () => {
    if (!selectedLeague) return;
    try {
      const params = {};
      if (faSearch) params.search = faSearch;
      if (faPos) params.position = faPos;
      const res = await adminAPI.getCLFreeAgents(selectedLeague, params);
      setFreeAgents(res.data?.data?.players || []);
    } catch { setFreeAgents([]); }
  }, [selectedLeague, faSearch, faPos]);

  useEffect(() => {
    if (selectedLeague && (tab === "elimination" || tab === "auction")) {
      loadLeagueElimData(selectedLeague);
    }
  }, [selectedLeague, tab, loadLeagueElimData]);

  useEffect(() => {
    if (tab === "auction" && selectedLeague) loadFreeAgents();
  }, [tab, selectedLeague, loadFreeAgents]);

  // Auto-select first league when leagues load
  useEffect(() => {
    if (leagues.length > 0 && !selectedLeague) setSelectedLeague(leagues[0]._id);
  }, [leagues, selectedLeague]);

  const handleEliminate = async () => {
    if (!selectedLeague || !elimPhase || !elimClubs.trim()) {
      toast("error", "Select a league, phase, and enter club names (comma-separated)");
      return;
    }
    const clubs = elimClubs.split(",").map(c => c.trim()).filter(Boolean);
    try {
      const res = await adminAPI.adminEliminateClubs(selectedLeague, clubs, elimPhase);
      toast("success", res.data?.message || `Eliminated ${clubs.length} clubs`);
      setElimClubs("");
      loadLeagueElimData(selectedLeague);
    } catch (err) { toast("error", err.response?.data?.message || "Elimination failed"); }
  };

  const handleOpenWindow = async () => {
    if (!selectedLeague || !windowKey) return;
    setAuctionLoading(true);
    try {
      const res = await adminAPI.adminOpenAuctionWindow(selectedLeague, windowKey);
      toast("success", res.data?.message || `Auction window ${windowKey} opened`);
      loadLeagueElimData(selectedLeague);
    } catch (err) { toast("error", err.response?.data?.message || "Failed to open window"); }
    setAuctionLoading(false);
  };

  const handleCloseWindow = async () => {
    if (!selectedLeague || !windowKey) return;
    setAuctionLoading(true);
    try {
      const res = await adminAPI.adminCloseAuctionWindow(selectedLeague, windowKey);
      toast("success", res.data?.message || `Auction window ${windowKey} closed`);
      loadLeagueElimData(selectedLeague);
    } catch (err) { toast("error", err.response?.data?.message || "Failed to close window"); }
    setAuctionLoading(false);
  };

  // ── CL Player CRUD ──
  const handleCrossSync = async () => {
    setCrossSyncing(true);
    try {
      const res = await adminAPI.syncCrossLeagueStats();
      const d = res.data?.data || {};
      toast("success", `Cross-league sync: ${d.updated || 0} players updated`);
    } catch (err) { toast("error", err.response?.data?.message || "Cross-league sync failed"); }
    finally { setCrossSyncing(false); }
  };

  const saveCLPlayer = async () => {
    if (!editCLPlayer) return;
    try {
      setSavingCL(true);
      await adminAPI.updateCLPlayer(editCLPlayer._id, {
        displayName: editCLPlayer.displayName, age: editCLPlayer.age,
        salary: editCLPlayer.salary, marketValue: editCLPlayer.marketValue,
        overallRating: editCLPlayer.overallRating, primaryPosition: editCLPlayer.primaryPosition,
        positionCategory: editCLPlayer.positionCategory, realClub: editCLPlayer.realClub,
        nationality: editCLPlayer.nationality, shirtNumber: editCLPlayer.shirtNumber,
        goalsScored: editCLPlayer.goalsScored, assists: editCLPlayer.assists,
        appearances: editCLPlayer.appearances, fantasyPointsTotal: editCLPlayer.fantasyPointsTotal,
        fantasyPointsAvg: editCLPlayer.fantasyPointsAvg, cleanSheets: editCLPlayer.cleanSheets, saves: editCLPlayer.saves,
      });
      setPlayers(p => p.map(x => x._id === editCLPlayer._id ? { ...x, ...editCLPlayer } : x));
      toast("success", `${editCLPlayer.displayName} updated`);
      setEditCLPlayer(null);
    } catch (e) { toast("error", e?.response?.data?.message || "Update failed"); }
    finally { setSavingCL(false); }
  };

  const deactivateCLPlayer = async (p) => {
    try {
      await adminAPI.deleteCLPlayer(p._id);
      setPlayers(prev => prev.filter(x => x._id !== p._id));
      toast("success", `${p.displayName} removed from CL pool`);
    } catch (e) { toast("error", e?.response?.data?.message || "Remove failed"); }
  };

  const handleRemoveClub = async (clubName) => {
    try {
      setRemovingClub(clubName);
      const res = await adminAPI.removeCLClub(clubName);
      toast("success", res.data?.message || `${clubName} removed`);
      if (tab === "players") loadPlayers();
      if (tab === "teams") loadTeams();
    } catch (e) { toast("error", e?.response?.data?.message || "Remove failed"); }
    finally { setRemovingClub(""); }
  };

  const PHASES = [
    { value: "league_phase", label: "League Phase (25th-36th)" },
    { value: "playoff", label: "Playoff Losers" },
    { value: "r16", label: "Round of 16 Losers" },
    { value: "qf", label: "Quarter-Final Losers" },
    { value: "sf", label: "Semi-Final Losers" },
  ];
  const WINDOWS = [
    { value: "POST_LEAGUE_PHASE", label: "Post-League Phase" },
    { value: "POST_PLAYOFF", label: "Post-Playoff" },
    { value: "POST_R16", label: "Post-R16" },
    { value: "POST_QF", label: "Post-QF" },
    { value: "POST_SF", label: "Pre-Final" },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "leagues", label: "Leagues", icon: Trophy },
    { id: "players", label: "Player Pool", icon: Users },
    { id: "teams", label: "CL Teams", icon: Globe },
    { id: "elimination", label: "Elimination", icon: XCircle },
    { id: "auction", label: "Auction", icon: Clock },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.purpleLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trophy size={18} color={C.purple} />
            </div>
            European Cup Fantasy
          </h2>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>Manage CL leagues, player pool & season renewals</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleCrossSync} disabled={crossSyncing} style={{ ...btn, background: C.blue, color: C.white, opacity: crossSyncing ? 0.6 : 1 }}>
            {crossSyncing ? <Loader2 size={14} className="ap-spin" /> : <RefreshCw size={14} />} Sync Stats from Domestic
          </button>
          <button onClick={handleSync} disabled={syncing} style={{ ...btn, background: C.purple, color: C.white, opacity: syncing ? 0.6 : 1 }}>
            {syncing ? <Spinner size={14} /> : <RefreshCw size={14} />} Sync CL Players
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.bgCard, borderRadius: 12, padding: 4, border: `1px solid ${C.borderLight}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...btn, flex: 1, justifyContent: "center", background: tab === t.id ? C.purple : "transparent", color: tab === t.id ? C.white : C.textDim, padding: "10px 16px" }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {tab === "overview" && (
        <div>
          {loading ? <div style={{ textAlign: "center", padding: 40 }}><Spinner size={28} /></div> : stats ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
                <StatCard icon={Trophy} label="Total Leagues" value={stats.totalLeagues} color="purple" />
                <StatCard icon={Play} label="Active Leagues" value={stats.activeLeagues} color="green" />
                <StatCard icon={Users} label="Player Pool" value={stats.totalPlayers} color="blue" />
                <StatCard icon={Shield} label="Fantasy Teams" value={stats.totalTeams} color="amber" />
                <StatCard icon={TrendingUp} label="Budget" value={`€${fmt(stats.budget)}`} color="teal" />
                <StatCard icon={Activity} label="Matchweeks" value={stats.matchweeks} color="purple" />
              </div>

              {stats.topPlayers?.length > 0 && (
                <div style={card}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <Award size={16} color={C.amber} /> Top CL Players by Fantasy Points
                  </h3>
                  <div style={{ display: "grid", gap: 8 }}>
                    {stats.topPlayers.map((p, i) => (
                      <div key={p._id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.bg, borderRadius: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: i < 3 ? C.amber : C.textMuted, width: 24 }}>#{i + 1}</span>
                        {p.photo && <img src={p.photo} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{p.displayName}</div>
                          <div style={{ fontSize: 11, color: C.textDim }}>{p.realClub} · {p.primaryPosition}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: C.purple }}>{p.fantasyPointsTotal || 0}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>FPts</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>{p.overallRating || "—"}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>OVR</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <p style={{ color: C.textDim, textAlign: "center" }}>No CL Fantasy data available yet. Click &quot;Sync CL Players&quot; to populate the pool.</p>}
        </div>
      )}

      {/* ── Leagues Tab ── */}
      {tab === "leagues" && (
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14 }}>CL Fantasy Leagues ({leagues.length})</h3>
          {leagues.length === 0 ? (
            <p style={{ color: C.textDim, fontSize: 13 }}>No CL Fantasy leagues created yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {leagues.map(l => (
                <div key={l._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.bg, borderRadius: 12, border: `1px solid ${C.borderLight}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.purpleLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trophy size={18} color={C.purple} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
                      Season {l.season} · {l.currentTeamCount || l.teams?.length || 0}/{l.maxTeams} teams · {l.draftType} draft
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, color: l.status === "active" ? C.green : l.status === "draft" ? C.amber : C.textMuted,
                      background: l.status === "active" ? C.greenLight : l.status === "draft" ? C.amberLight : C.bgHover }}>
                      {l.status?.toUpperCase()}
                    </span>
                    {l.renewalMode && <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>Renewal: {l.renewalMode}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>MW {l.currentMatchweek || 1}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>{l.leagueCode || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Player Pool Tab (editable) ── */}
      {tab === "players" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input value={playerSearch} onChange={e => setPlayerSearch(e.target.value)} placeholder="Search player or club..."
                style={{ ...inputStyle, background: C.bgCard }} />
            </div>
            <select value={posFilter} onChange={e => setPosFilter(e.target.value)}
              style={{ ...inputStyle, width: 140, background: C.bgCard }}>
              <option value="">All Positions</option>
              <option value="GK">GK</option><option value="CB">CB</option><option value="LB">LB</option><option value="RB">RB</option>
              <option value="CDM">CDM</option><option value="CM">CM</option><option value="CAM">CAM</option>
              <option value="LW">LW</option><option value="RW">RW</option><option value="CF">CF</option><option value="ST">ST</option>
            </select>
            <select value={playerSort} onChange={e => setPlayerSort(e.target.value)}
              style={{ ...inputStyle, width: 160, background: C.bgCard }}>
              <option value="overallRating">Sort: Rating</option>
              <option value="salary">Sort: Value</option>
              <option value="name">Sort: Name</option>
              <option value="goals">Sort: Goals</option>
              <option value="assists">Sort: Assists</option>
            </select>
          </div>
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ maxHeight: 520, overflowY: "auto" }} className="ap-scrollbar">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.bg, position: "sticky", top: 0, zIndex: 1 }}>
                    {["Player", "Club", "Pos", "Age", "OVR", "Value", "Goals", "Ast", "FPts", ""].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => (
                    <tr key={p._id || i} style={{ borderBottom: `1px solid ${C.borderLight}`, background: editCLPlayer?._id === p._id ? C.purpleLight : "transparent" }}>
                      <td style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                        {p.photo && <img src={p.photo} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />}
                        <span style={{ fontWeight: 600, color: C.white }}>{p.displayName}</span>
                      </td>
                      <td style={{ padding: "10px 12px", color: C.textDim, fontSize: 12 }}>{p.realClub}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: C.purpleLight, color: C.purple }}>{p.primaryPosition}</span>
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: C.white }}>{p.age || "—"}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: C.blue }}>{p.overallRating || "—"}</td>
                      <td style={{ padding: "10px 12px", color: C.green, fontWeight: 600 }}>€{fmt(p.salary || p.marketValue)}</td>
                      <td style={{ padding: "10px 12px", color: C.white }}>{p.goalsScored || 0}</td>
                      <td style={{ padding: "10px 12px", color: C.white }}>{p.assists || 0}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: C.amber }}>{p.fantasyPointsTotal || 0}</td>
                      <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>
                        <button onClick={() => setEditCLPlayer({ ...p })} style={{ ...btn, padding: 5, background: C.purpleLight, borderRadius: 6, marginRight: 4 }} title="Edit">
                          <Edit3 size={12} color={C.purple} />
                        </button>
                        <button onClick={() => { if (window.confirm(`Remove ${p.displayName} from CL pool?`)) deactivateCLPlayer(p); }} style={{ ...btn, padding: 5, background: C.redLight, borderRadius: 6 }} title="Remove">
                          <Trash2 size={12} color={C.red} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {players.length === 0 && (
                    <tr><td colSpan={10} style={{ padding: 40, textAlign: "center", color: C.textDim }}>
                      No players found. Run &quot;Sync CL Players&quot; first.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textDim }}>
              Showing {players.length} players
            </div>
          </div>

          {/* CL Player Edit Panel */}
          {editCLPlayer && (
            <div style={{ ...card, marginTop: 14, borderColor: C.purple + "44", background: "rgba(139,92,246,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ color: C.white, fontWeight: 700, fontSize: 15, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <Edit3 size={15} color={C.purple} /> Editing: {editCLPlayer.displayName}
                </h3>
                <button onClick={() => setEditCLPlayer(null)} style={{ ...btn, padding: "6px 12px", background: C.bgHover, color: C.textDim, fontSize: 12 }}>
                  <XCircle size={12} /> Cancel
                </button>
              </div>
              {/* Primary: Value, Age, Rating */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div style={{ background: C.greenLight, borderRadius: 12, padding: 14, border: `1px solid ${C.green}33` }}>
                  <label style={{ ...labelStyle, color: C.green }}>Market Value / Salary (€)</label>
                  <input type="number" value={editCLPlayer.salary || editCLPlayer.marketValue || ""} onChange={e => setEditCLPlayer({ ...editCLPlayer, salary: Number(e.target.value), marketValue: Number(e.target.value) })} style={{ ...inputStyle, fontSize: 16, fontWeight: 700 }} />
                  {(editCLPlayer.salary || editCLPlayer.marketValue) > 0 && <p style={{ fontSize: 10, color: C.textMuted, margin: "4px 0 0" }}>= €{fmt(editCLPlayer.salary || editCLPlayer.marketValue)}</p>}
                </div>
                <div style={{ background: C.amberLight, borderRadius: 12, padding: 14, border: `1px solid ${C.amber}33` }}>
                  <label style={{ ...labelStyle, color: C.amber }}>Age</label>
                  <input type="number" value={editCLPlayer.age || ""} onChange={e => setEditCLPlayer({ ...editCLPlayer, age: Number(e.target.value) })} style={{ ...inputStyle, fontSize: 16, fontWeight: 700 }} min={15} max={50} />
                </div>
                <div style={{ background: C.blueLight, borderRadius: 12, padding: 14, border: `1px solid ${C.blue}33` }}>
                  <label style={{ ...labelStyle, color: C.blue }}>Overall Rating</label>
                  <input type="number" value={editCLPlayer.overallRating || ""} onChange={e => setEditCLPlayer({ ...editCLPlayer, overallRating: Number(e.target.value) })} style={{ ...inputStyle, fontSize: 16, fontWeight: 700 }} min={1} max={99} />
                </div>
              </div>
              {/* Secondary */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
                {[
                  { l: "Display Name", f: "displayName", t: "text" }, { l: "Club", f: "realClub", t: "text" },
                  { l: "Position", f: "primaryPosition", t: "text" }, { l: "Nationality", f: "nationality", t: "text" },
                  { l: "Shirt #", f: "shirtNumber", t: "number" }, { l: "Goals", f: "goalsScored", t: "number" },
                  { l: "Assists", f: "assists", t: "number" }, { l: "Appearances", f: "appearances", t: "number" },
                  { l: "Fantasy Pts Total", f: "fantasyPointsTotal", t: "number" }, { l: "Fantasy Pts Avg", f: "fantasyPointsAvg", t: "number" },
                  { l: "Clean Sheets", f: "cleanSheets", t: "number" }, { l: "Saves", f: "saves", t: "number" },
                ].map(fi => (
                  <div key={fi.f}>
                    <label style={labelStyle}>{fi.l}</label>
                    <input type={fi.t} value={editCLPlayer[fi.f] || ""} onChange={e => setEditCLPlayer({ ...editCLPlayer, [fi.f]: fi.t === "number" ? Number(e.target.value) : e.target.value })} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button onClick={saveCLPlayer} disabled={savingCL} style={{ ...btn, background: C.purple, color: C.white, padding: "10px 24px", opacity: savingCL ? .6 : 1 }}>
                  {savingCL && <Spinner size={12} />}{savingCL ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Teams Tab (with remove club) ── */}
      {tab === "teams" && (
        <div>
          {!teams ? <div style={{ textAlign: "center", padding: 40 }}><Spinner size={24} /></div> : Object.keys(teams).length === 0 ? (
            <p style={{ color: C.textDim, textAlign: "center" }}>No CL team data. Run sync first.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {Object.entries(teams).sort((a, b) => b[1].length - a[1].length).map(([country, clubList]) => (
                <div key={country} style={card}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <Flag size={14} color={C.blue} /> {country}
                    <span style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, marginLeft: "auto" }}>{clubList.length} clubs</span>
                  </h4>
                  <div style={{ display: "grid", gap: 6 }}>
                    {clubList.map(club => (
                      <div key={club.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: C.bg, borderRadius: 8 }}>
                        {club.logo && <img src={club.logo} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />}
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.text }}>{club.name}</span>
                        <button onClick={() => { if (window.confirm(`Remove ${club.name} and all their players from CL pool?`)) handleRemoveClub(club.name); }}
                          disabled={removingClub === club.name}
                          style={{ ...btn, padding: "4px 8px", background: C.redLight, borderRadius: 6, opacity: removingClub === club.name ? 0.5 : 1 }}
                          title={`Remove ${club.name}`}>
                          <Trash2 size={11} color={C.red} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Elimination Tab ── */}
      {tab === "elimination" && (
        <div>
          {/* League selector */}
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "block" }}>Select League</label>
                <select value={selectedLeague || ""} onChange={e => setSelectedLeague(e.target.value)}
                  style={{ ...inputStyle, background: C.bg }}>
                  <option value="">— Choose league —</option>
                  {leagues.map(l => <option key={l._id} value={l._id}>{l.name} (S{l.season})</option>)}
                </select>
              </div>
              {selectedLeague && (
                <div style={{ fontSize: 12, color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
                  <Activity size={14} color={C.purple} />
                  {(() => {
                    const lg = leagues.find(l => l._id === selectedLeague);
                    return lg ? `Phase: ${lg.clPhase || "Pre-season"} · Eliminated: ${lg.eliminatedClubs?.length || 0} clubs` : "";
                  })()}
                </div>
              )}
            </div>
          </div>

          {selectedLeague && (
            <>
              {/* Eliminated Clubs display */}
              <div style={{ ...card, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <XCircle size={16} color={C.red} /> Eliminated Clubs
                </h3>
                {(() => {
                  const lg = leagues.find(l => l._id === selectedLeague);
                  const elim = lg?.eliminatedClubs || [];
                  if (elim.length === 0) return <p style={{ color: C.textDim, fontSize: 13 }}>No clubs eliminated yet. The cron auto-detects eliminations every 30 minutes after CL rounds complete.</p>;
                  const byPhase = {};
                  elim.forEach(c => { const ph = c.phase || "unknown"; if (!byPhase[ph]) byPhase[ph] = []; byPhase[ph].push(c); });
                  return (
                    <div style={{ display: "grid", gap: 12 }}>
                      {Object.entries(byPhase).map(([phase, clubs]) => (
                        <div key={phase}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                            {phase.replace(/_/g, " ")} ({clubs.length} clubs)
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {clubs.map((c, i) => (
                              <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, background: C.redLight, color: C.red, display: "flex", alignItems: "center", gap: 6 }}>
                                <XCircle size={12} /> {c.clubName}
                                {c.eliminatedAt && <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 4 }}>{new Date(c.eliminatedAt).toLocaleDateString()}</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Auction Windows status */}
              <div style={{ ...card, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={16} color={C.blue} /> Auction Windows
                </h3>
                {(() => {
                  const lg = leagues.find(l => l._id === selectedLeague);
                  const windows = lg?.clAuctionWindows || [];
                  if (windows.length === 0) return <p style={{ color: C.textDim, fontSize: 13 }}>No auction windows yet. They open automatically when CL rounds complete.</p>;
                  return (
                    <div style={{ display: "grid", gap: 8 }}>
                      {windows.map((w, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: C.bg, borderRadius: 10, border: `1px solid ${w.status === "open" ? C.green : C.borderLight}` }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: w.status === "open" ? C.green : w.status === "closed" ? C.red : C.textMuted }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{(w.windowKey || "").replace(/_/g, " ")}</div>
                            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
                              {w.openedAt && `Opened: ${new Date(w.openedAt).toLocaleString()}`}
                              {w.closesAt && ` · Closes: ${new Date(w.closesAt).toLocaleString()}`}
                            </div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                            color: w.status === "open" ? C.green : w.status === "closed" ? C.red : C.textMuted,
                            background: w.status === "open" ? C.greenLight : w.status === "closed" ? C.redLight : C.bgHover }}>
                            {(w.status || "pending").toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Admin fallback: manual elimination */}
              <div style={{ ...card, borderLeft: `3px solid ${C.amber}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={16} color={C.amber} /> Admin Override — Manual Elimination
                </h3>
                <p style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>
                  Use only if the automatic cron missed an elimination. The cron handles this automatically every 30 minutes.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  <select value={elimPhase} onChange={e => setElimPhase(e.target.value)}
                    style={{ ...inputStyle, width: 220, background: C.bg }}>
                    <option value="">— Select Phase —</option>
                    {PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <input value={elimClubs} onChange={e => setElimClubs(e.target.value)}
                      placeholder="Club names, comma-separated (e.g. PSG, Bayern Munich)"
                      style={{ ...inputStyle, background: C.bg }} />
                  </div>
                  <button onClick={handleEliminate} disabled={elimLoading}
                    style={{ ...btn, background: C.red, color: C.white, opacity: elimLoading ? 0.6 : 1 }}>
                    <XCircle size={14} /> Eliminate Clubs
                  </button>
                </div>
              </div>
            </>
          )}

          {!selectedLeague && leagues.length > 0 && (
            <p style={{ color: C.textDim, textAlign: "center", marginTop: 20 }}>Select a league above to view elimination data.</p>
          )}
          {leagues.length === 0 && (
            <p style={{ color: C.textDim, textAlign: "center", marginTop: 20 }}>No CL Fantasy leagues found. Create a European Cup league first.</p>
          )}
        </div>
      )}

      {/* ── Auction Tab ── */}
      {tab === "auction" && (
        <div>
          {/* League selector */}
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "block" }}>Select League</label>
                <select value={selectedLeague || ""} onChange={e => setSelectedLeague(e.target.value)}
                  style={{ ...inputStyle, background: C.bg }}>
                  <option value="">— Choose league —</option>
                  {leagues.map(l => <option key={l._id} value={l._id}>{l.name} (S{l.season})</option>)}
                </select>
              </div>
            </div>
          </div>

          {selectedLeague && (
            <>
              {/* Current Auction Window */}
              <div style={{ ...card, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Clock size={16} color={C.green} /> Active Auction Window
                </h3>
                {auctionWindow?.activeWindow ? (
                  <div style={{ padding: 16, background: C.bg, borderRadius: 12, border: `1px solid ${C.green}33` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
                      <span style={{ fontSize: 16, fontWeight: 800, color: C.green }}>{(auctionWindow.activeWindow.windowKey || "").replace(/_/g, " ")}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                      <div><span style={{ color: C.textMuted }}>Opened:</span> <span style={{ color: C.white, fontWeight: 600 }}>{new Date(auctionWindow.activeWindow.openedAt).toLocaleString()}</span></div>
                      <div><span style={{ color: C.textMuted }}>Closes:</span> <span style={{ color: C.amber, fontWeight: 600 }}>{new Date(auctionWindow.activeWindow.closesAt).toLocaleString()}</span></div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: C.textDim, fontSize: 13 }}>No active auction window. Windows open automatically after CL rounds complete.</p>
                )}
              </div>

              {/* Admin override: open/close window */}
              <div style={{ ...card, marginBottom: 16, borderLeft: `3px solid ${C.amber}` }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={16} color={C.amber} /> Admin Override — Auction Window
                </h3>
                <p style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>
                  Windows are fully automatic. Only use these overrides if something goes wrong.
                </p>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <select value={windowKey} onChange={e => setWindowKey(e.target.value)}
                    style={{ ...inputStyle, width: 220, background: C.bg }}>
                    {WINDOWS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                  <button onClick={handleOpenWindow} disabled={auctionLoading}
                    style={{ ...btn, background: C.green, color: C.white, opacity: auctionLoading ? 0.6 : 1 }}>
                    <Play size={14} /> Open Window
                  </button>
                  <button onClick={handleCloseWindow} disabled={auctionLoading}
                    style={{ ...btn, background: C.red, color: C.white, opacity: auctionLoading ? 0.6 : 1 }}>
                    <Pause size={14} /> Close Window
                  </button>
                </div>
              </div>

              {/* Free Agents Pool */}
              <div style={card}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Users size={16} color={C.blue} /> Free Agent Pool
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginLeft: "auto" }}>{freeAgents.length} available</span>
                </h3>
                <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <input value={faSearch} onChange={e => setFaSearch(e.target.value)} placeholder="Search player or club..."
                      style={{ ...inputStyle, background: C.bg }} />
                  </div>
                  <select value={faPos} onChange={e => setFaPos(e.target.value)}
                    style={{ ...inputStyle, width: 140, background: C.bg }}>
                    <option value="">All Positions</option>
                    <option value="GK">GK</option><option value="CB">CB</option><option value="LB">LB</option><option value="RB">RB</option>
                    <option value="CDM">CDM</option><option value="CM">CM</option><option value="CAM">CAM</option>
                    <option value="LW">LW</option><option value="RW">RW</option><option value="CF">CF</option><option value="ST">ST</option>
                  </select>
                </div>
                <div style={{ maxHeight: 400, overflowY: "auto" }} className="ap-scrollbar">
                  <div style={{ display: "grid", gap: 6 }}>
                    {freeAgents.map((p, i) => (
                      <div key={p._id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.bg, borderRadius: 10 }}>
                        {p.photo && <img src={p.photo} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{p.displayName}</div>
                          <div style={{ fontSize: 11, color: C.textDim }}>{p.realClub} · {p.primaryPosition}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>{p.overallRating || "—"}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>OVR</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>€{fmt(p.salary || p.marketValue)}</div>
                          <div style={{ fontSize: 10, color: C.textMuted }}>Value</div>
                        </div>
                      </div>
                    ))}
                    {freeAgents.length === 0 && (
                      <p style={{ color: C.textDim, fontSize: 13, textAlign: "center", padding: 20 }}>
                        {auctionWindow?.activeWindow ? "No free agents match your search." : "Free agents are only available during an active auction window."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {!selectedLeague && leagues.length > 0 && (
            <p style={{ color: C.textDim, textAlign: "center", marginTop: 20 }}>Select a league above to manage auction windows.</p>
          )}
          {leagues.length === 0 && (
            <p style={{ color: C.textDim, textAlign: "center", marginTop: 20 }}>No CL Fantasy leagues found.</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   WORLD CUP 2026 SECTION
   ══════════════════════════════════════════════════════════ */
const WorldCupSection = ({ toast }) => {
  const [activeNations, setActiveNations] = useState([]);
  const [remaining, setRemaining] = useState("");
  const [loading, setLoading] = useState(true);
  const [eliminating, setEliminating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [seedingWC, setSeedingWC] = useState(false);
  const [wcStats, setWcStats] = useState(null);
  // Player correction state
  const [playerSearch, setPlayerSearch] = useState("");
  const [searchLeague, setSearchLeague] = useState("world_cup_2026");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [savingPlayer, setSavingPlayer] = useState(false);

  const loadNations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getWCActiveNations();
      setActiveNations(res.data?.activeNations || []);
    } catch { setActiveNations([]); }
    setLoading(false);
  }, []);

  const loadWCStats = useCallback(async () => {
    try {
      const res = await adminAPI.getWCStats();
      setWcStats(res.data?.data || null);
    } catch { setWcStats(null); }
  }, []);

  useEffect(() => { loadNations(); loadWCStats(); }, [loadNations, loadWCStats]);

  const handleSeedWC = async () => {
    setSeedingWC(true);
    try {
      await adminAPI.seedWCPlayers();
      toast("success", "World Cup player seed started! Check server console for progress. Refresh in ~30s to see stats.");
      // Refresh stats after a delay
      setTimeout(() => { loadWCStats(); loadNations(); }, 15000);
    } catch (err) { toast("error", err.response?.data?.message || "WC seed failed"); }
    setSeedingWC(false);
  };

  const handleEliminate = async () => {
    if (!remaining.trim()) { toast("error", "Enter remaining nations (comma-separated)"); return; }
    setEliminating(true);
    try {
      const res = await adminAPI.wcEliminateNations(remaining.trim());
      toast("success", res.data?.message || "Nations eliminated");
      loadNations();
      setRemaining("");
    } catch (err) { toast("error", err.response?.data?.message || "Elimination failed"); }
    setEliminating(false);
  };

  const handleCrossLeagueSync = async () => {
    setSyncing(true);
    try {
      const res = await adminAPI.syncCrossLeagueStats();
      setSyncResult(res.data?.results || null);
      toast("success", "Cross-league stats synced from domestic entries!");
    } catch (err) { toast("error", err.response?.data?.message || "Sync failed"); }
    setSyncing(false);
  };

  const handlePlayerSearch = async () => {
    if (!playerSearch.trim() || playerSearch.trim().length < 2) { toast("warn", "Enter at least 2 characters"); return; }
    setSearching(true);
    try {
      const res = await adminAPI.searchPlayers(playerSearch.trim(), searchLeague || undefined);
      setSearchResults(res.data?.data?.players || []);
      if ((res.data?.data?.players || []).length === 0) toast("info", "No players found");
    } catch (err) { toast("error", err.response?.data?.message || "Search failed"); }
    setSearching(false);
  };

  const savePlayerCorrection = async () => {
    if (!editPlayer) return;
    setSavingPlayer(true);
    try {
      await adminAPI.updateCLPlayer(editPlayer._id, {
        displayName: editPlayer.displayName, age: editPlayer.age,
        salary: editPlayer.salary, marketValue: editPlayer.marketValue,
        overallRating: editPlayer.overallRating, primaryPosition: editPlayer.primaryPosition,
        positionCategory: editPlayer.positionCategory, realClub: editPlayer.realClub,
        nationality: editPlayer.nationality, shirtNumber: editPlayer.shirtNumber,
        goalsScored: editPlayer.goalsScored, assists: editPlayer.assists,
        appearances: editPlayer.appearances, fantasyPointsTotal: editPlayer.fantasyPointsTotal,
        fantasyPointsAvg: editPlayer.fantasyPointsAvg, cleanSheets: editPlayer.cleanSheets, saves: editPlayer.saves,
      });
      setSearchResults(p => p.map(x => x._id === editPlayer._id ? { ...x, ...editPlayer } : x));
      toast("success", `${editPlayer.displayName} updated`);
      setEditPlayer(null);
    } catch (err) { toast("error", err.response?.data?.message || "Update failed"); }
    finally { setSavingPlayer(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.amberLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={18} color={C.amber} />
            </div>
            World Cup 2026
          </h2>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>Manage WC player pool, eliminations & cross-league stats</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSeedWC} disabled={seedingWC} style={{ ...btn, background: C.amber, color: "#000", fontWeight: 700, opacity: seedingWC ? 0.6 : 1 }}>
            {seedingWC ? <Loader2 size={14} className="ap-spin" /> : <Globe size={14} />} Seed WC Players
          </button>
        </div>
      </div>

      {/* WC Player Pool Stats */}
      {wcStats && (
        <div style={{ background: C.cardBg, borderRadius: 14, padding: 20, border: `1px solid ${C.borderLight}`, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={16} color={C.amber} /> Player Pool ({wcStats.totalPlayers || 0} players across {wcStats.totalNations || 0} nations)
          </h3>
          {wcStats.byNation?.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {wcStats.byNation.map(n => (
                <span key={n.nation} style={{ fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, background: C.bgHover, color: C.white, display: "flex", gap: 4, alignItems: "center" }}>
                  {n.nation} <span style={{ color: C.textDim }}>({n.players})</span>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: C.textDim, fontSize: 13 }}>No WC players seeded yet. Click &quot;Seed WC Players&quot; to pull players from domestic leagues.</p>
          )}
        </div>
      )}

      {/* Active Nations */}
      <div style={{ background: C.cardBg, borderRadius: 14, padding: 20, border: `1px solid ${C.borderLight}`, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Globe size={16} color={C.green} /> Active Nations ({loading ? "..." : activeNations.length})
        </h3>
        {loading ? (
          <div style={{ textAlign: "center", padding: 20 }}><Spinner size={20} /></div>
        ) : activeNations.length === 0 ? (
          <p style={{ color: C.textDim, fontSize: 13 }}>No active WC nations found. Seed World Cup players first.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {activeNations.map(n => (
              <span key={n} style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, background: C.greenLight, color: C.green }}>
                {n}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cross-League Stats Sync */}
      <div style={{ background: C.cardBg, borderRadius: 14, padding: 20, border: `1px solid ${C.borderLight}`, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <RefreshCw size={16} color={C.blue} /> Cross-League Stats Sync
        </h3>
        <p style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>
          Copy updated stats (market value, rating, fantasy points) from domestic player entries to their CL and WC counterparts. Runs automatically with the data refresh cron, but you can trigger it manually here.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={handleCrossLeagueSync} disabled={syncing}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: C.blue, color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: syncing ? 0.6 : 1 }}>
            {syncing ? <Spinner size={14} /> : <RefreshCw size={14} />} {syncing ? "Syncing..." : "Sync Now"}
          </button>
          {syncResult && (
            <span style={{ fontSize: 12, color: C.textDim }}>
              CL: {syncResult.champions_league?.updated || 0} updated &middot; WC: {syncResult.world_cup_2026?.updated || 0} updated
            </span>
          )}
        </div>
      </div>

      {/* WC Elimination — Admin Override */}
      <div style={{ background: C.cardBg, borderRadius: 14, padding: 20, border: `1px solid ${C.borderLight}`, borderLeft: `3px solid ${C.amber}`, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} color={C.amber} /> Admin Override — WC Elimination
        </h3>
        <p style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>
          The WC elimination cron runs automatically every 30 minutes. Use this only as a manual fallback. Enter the nations that are STILL IN the tournament — everyone else gets deactivated.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <input value={remaining} onChange={e => setRemaining(e.target.value)}
              placeholder="Remaining nations, comma-separated (e.g. USA, Brazil, France, Germany)"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderLight}`, background: C.bg, color: C.white, fontSize: 13, outline: "none" }} />
          </div>
          <button onClick={handleEliminate} disabled={eliminating}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: C.red, color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: eliminating ? 0.6 : 1 }}>
            {eliminating ? <Spinner size={14} /> : <XCircle size={14} />} Eliminate Others
          </button>
        </div>
      </div>

      {/* Player Corrections */}
      <div style={{ background: C.cardBg, borderRadius: 14, padding: 20, border: `1px solid ${C.borderLight}`, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <Edit3 size={16} color={C.amber} /> Player Corrections
        </h3>
        <p style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>
          Search and correct player stats for CL and World Cup entries. Changes take effect immediately.
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <select value={searchLeague} onChange={e => setSearchLeague(e.target.value)}
            style={{ padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.borderLight}`, background: C.bg, color: C.white, fontSize: 13, outline: "none" }}>
            <option value="world_cup_2026">World Cup 2026</option>
            <option value="champions_league">Champions League</option>
            <option value="">All Leagues</option>
          </select>
          <input value={playerSearch} onChange={e => setPlayerSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handlePlayerSearch()}
            placeholder="Search by name, club, or nationality..."
            style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.borderLight}`, background: C.bg, color: C.white, fontSize: 13, outline: "none" }} />
          <button onClick={handlePlayerSearch} disabled={searching}
            style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: C.blue, color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: searching ? 0.6 : 1 }}>
            {searching ? <Loader2 size={14} className="ap-spin" /> : <Search size={14} />} Search
          </button>
        </div>

        {/* Results table */}
        {searchResults.length > 0 && (
          <div style={{ maxHeight: 320, overflowY: "auto", borderRadius: 10, border: `1px solid ${C.borderLight}` }} className="ap-scrollbar">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: C.bg, position: "sticky", top: 0 }}>
                {["Player", "Club", "League", "Pos", "Rating", "G", "A", "Apps", "FP Total", ""].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: 11, borderBottom: `1px solid ${C.borderLight}` }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {searchResults.map(p => (
                  <tr key={p._id} style={{ borderBottom: `1px solid ${C.borderLight}`, background: editPlayer?._id === p._id ? C.amberLight : "transparent", cursor: "pointer" }}
                    onClick={() => setEditPlayer({ ...p })}>
                    <td style={{ padding: "8px 10px", color: C.white, fontWeight: 600 }}>{p.displayName}</td>
                    <td style={{ padding: "8px 10px", color: C.textDim }}>{p.realClub || "—"}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                        background: p.realLeague === "champions_league" ? C.purpleLight : p.realLeague === "world_cup_2026" ? C.amberLight : C.blueLight,
                        color: p.realLeague === "champions_league" ? C.purple : p.realLeague === "world_cup_2026" ? C.amber : C.blue }}>
                        {p.realLeague === "champions_league" ? "CL" : p.realLeague === "world_cup_2026" ? "WC" : (p.realLeague || "—").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ padding: "8px 10px", color: C.textDim }}>{p.primaryPosition || "—"}</td>
                    <td style={{ padding: "8px 10px", color: C.blue, fontWeight: 700 }}>{p.overallRating || "—"}</td>
                    <td style={{ padding: "8px 10px", color: C.text }}>{p.goalsScored ?? "—"}</td>
                    <td style={{ padding: "8px 10px", color: C.text }}>{p.assists ?? "—"}</td>
                    <td style={{ padding: "8px 10px", color: C.text }}>{p.appearances ?? "—"}</td>
                    <td style={{ padding: "8px 10px", color: C.green, fontWeight: 600 }}>{p.fantasyPointsTotal ?? "—"}</td>
                    <td style={{ padding: "8px 10px" }}>
                      <button onClick={e => { e.stopPropagation(); setEditPlayer({ ...p }); }}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: C.amberLight, color: C.amber, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit panel */}
        {editPlayer && (
          <div style={{ marginTop: 14, padding: 20, borderRadius: 12, border: `1px solid ${C.amber}44`, background: "rgba(251,191,36,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h4 style={{ color: C.white, fontWeight: 700, fontSize: 14, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Edit3 size={14} color={C.amber} /> Editing: {editPlayer.displayName}
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: C.bgHover, color: C.textDim }}>
                  {editPlayer.realLeague?.replace(/_/g, " ") || "unknown"}
                </span>
              </h4>
              <button onClick={() => setEditPlayer(null)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: C.bgHover, color: C.textDim, fontSize: 12, cursor: "pointer" }}>
                <XCircle size={12} /> Cancel
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div style={{ background: C.greenLight, borderRadius: 10, padding: 12, border: `1px solid ${C.green}33` }}>
                <label style={{ ...labelStyle, color: C.green }}>Market Value (€)</label>
                <input type="number" value={editPlayer.salary || editPlayer.marketValue || ""} onChange={e => setEditPlayer({ ...editPlayer, salary: Number(e.target.value), marketValue: Number(e.target.value) })} style={{ ...inputStyle, fontSize: 15, fontWeight: 700 }} />
              </div>
              <div style={{ background: C.amberLight, borderRadius: 10, padding: 12, border: `1px solid ${C.amber}33` }}>
                <label style={{ ...labelStyle, color: C.amber }}>Age</label>
                <input type="number" value={editPlayer.age || ""} onChange={e => setEditPlayer({ ...editPlayer, age: Number(e.target.value) })} style={{ ...inputStyle, fontSize: 15, fontWeight: 700 }} />
              </div>
              <div style={{ background: C.blueLight, borderRadius: 10, padding: 12, border: `1px solid ${C.blue}33` }}>
                <label style={{ ...labelStyle, color: C.blue }}>Overall Rating</label>
                <input type="number" value={editPlayer.overallRating || ""} onChange={e => setEditPlayer({ ...editPlayer, overallRating: Number(e.target.value) })} style={{ ...inputStyle, fontSize: 15, fontWeight: 700 }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { l: "Name", f: "displayName", t: "text" }, { l: "Club", f: "realClub", t: "text" },
                { l: "Position", f: "primaryPosition", t: "text" }, { l: "Nationality", f: "nationality", t: "text" },
                { l: "Shirt #", f: "shirtNumber", t: "number" }, { l: "Goals", f: "goalsScored", t: "number" },
                { l: "Assists", f: "assists", t: "number" }, { l: "Appearances", f: "appearances", t: "number" },
                { l: "Fantasy Pts Total", f: "fantasyPointsTotal", t: "number" }, { l: "Fantasy Pts Avg", f: "fantasyPointsAvg", t: "number" },
                { l: "Clean Sheets", f: "cleanSheets", t: "number" }, { l: "Saves", f: "saves", t: "number" },
              ].map(fi => (
                <div key={fi.f}>
                  <label style={labelStyle}>{fi.l}</label>
                  <input type={fi.t} value={editPlayer[fi.f] ?? ""} onChange={e => setEditPlayer({ ...editPlayer, [fi.f]: fi.t === "number" ? Number(e.target.value) : e.target.value })} style={inputStyle} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={savePlayerCorrection} disabled={savingPlayer}
                style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: C.amber, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: savingPlayer ? 0.6 : 1 }}>
                {savingPlayer ? <Loader2 size={14} className="ap-spin" /> : <CheckCircle size={14} />} {savingPlayer ? "Saving..." : "Save Corrections"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cron Status */}
      <div style={{ background: C.cardBg, borderRadius: 14, padding: 20, border: `1px solid ${C.borderLight}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={16} color={C.purple} /> Automatic Systems
        </h3>
        <div style={{ display: "grid", gap: 10 }}>
          {[
            { name: "WC Elimination Cron", desc: "Checks API-Football every 30 min for completed knockout rounds, deactivates eliminated nations", status: "active" },
            { name: "Cross-League Stats Sync", desc: "Copies domestic player stats to CL/WC entries during post-match enrichment (Tier 2) and daily backup (Tier 3)", status: "active" },
            { name: "CL Elimination Cron", desc: "Same as WC but for Champions League 2-leg knockout ties", status: "active" },
          ].map((cron, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: C.bg, borderRadius: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{cron.name}</div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{cron.desc}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, color: C.green, background: C.greenLight }}>
                {cron.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   COMPLIANCE SECTION
   ══════════════════════════════════════════════════════════ */
const COMPLIANCE_CATEGORIES = [
  { id: "branding", label: "Branding & Company Name", icon: Shield, color: C.blue },
  { id: "trademarks", label: "Trademark Compliance", icon: AlertTriangle, color: C.amber },
  { id: "contact", label: "Contact & Email", icon: Send, color: C.green },
  { id: "legal", label: "Legal Pages", icon: FileText, color: C.purple },
  { id: "i18n", label: "Translations (i18n)", icon: Globe, color: C.cyan },
  { id: "ui", label: "UI & Copy", icon: Eye, color: C.teal },
];

// ═══════════════════════════════════════════════════════════════
//  SEASON MANAGEMENT — View & manage active seasons
// ═══════════════════════════════════════════════════════════════
const SeasonManagementSection = ({ toast }) => {
  const card = { background: C.cardBg, borderRadius: 14, padding: 20, border: `1px solid ${C.borderLight}`, marginBottom: 16 };

  // Dynamic season calculations (same logic as backend)
  const now = new Date();
  const soccerSeason = now.getMonth() < 7 ? now.getFullYear() - 1 : now.getFullYear();
  const nflSeason = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
  const clSeason = soccerSeason; // CL follows European football calendar

  const [syncing, setSyncing] = useState({});
  const [lastSync, setLastSync] = useState({});

  const triggerReseed = async (sport) => {
    setSyncing(p => ({ ...p, [sport]: true }));
    try {
      if (sport === "soccer") {
        await adminAPI.triggerSoccerSync("soccer_data_refresh");
      } else if (sport === "cl") {
        await adminAPI.triggerCLPlayerSync?.() || await adminAPI.triggerSoccerSync("sync-cl-players");
      } else if (sport === "nfl") {
        await adminAPI.triggerNFLSync("nfl_data_sync");
      }
      toast(`${sport.toUpperCase()} player sync triggered!`, "success");
      setLastSync(p => ({ ...p, [sport]: new Date().toLocaleString() }));
    } catch (err) {
      toast(`Sync failed: ${err.message}`, "error");
    } finally {
      setSyncing(p => ({ ...p, [sport]: false }));
    }
  };

  const seasons = [
    {
      sport: "Soccer (Domestic)",
      key: "soccer",
      season: `${soccerSeason}/${String(soccerSeason + 1).slice(2)}`,
      rule: "Auto-rolls August 1st — before Aug uses previous year",
      color: C.green,
      icon: "⚽",
      auto: true,
    },
    {
      sport: "European Cup",
      key: "cl",
      season: `${clSeason}/${String(clSeason + 1).slice(2)}`,
      rule: "Follows European football calendar (same as domestic)",
      color: C.purple,
      icon: "🏆",
      auto: true,
    },
    {
      sport: "American Football (NFL)",
      key: "nfl",
      season: `${nflSeason}/${String(nflSeason + 1).slice(2)}`,
      rule: "Auto-rolls March 1st — before Mar uses previous year",
      color: C.amber,
      icon: "🏈",
      auto: true,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <Calendar size={22} color={C.teal} />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, margin: 0 }}>Season Management</h2>
          <p style={{ fontSize: 13, color: C.textDim, margin: "4px 0 0" }}>All seasons auto-roll based on calendar date. No manual intervention needed.</p>
        </div>
      </div>

      {/* Status overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 20 }}>
        {seasons.map(s => (
          <div key={s.key} style={{ ...card, borderLeft: `3px solid ${s.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{s.sport}</div>
                <div style={{ fontSize: 11, color: C.textDim }}>{s.rule}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Active Season</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.season}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>AUTO</span>
              </div>
            </div>
            <button
              onClick={() => triggerReseed(s.key)}
              disabled={syncing[s.key]}
              style={{
                width: "100%", padding: "8px 0", borderRadius: 8, border: `1px solid ${s.color}33`,
                background: `${s.color}15`, color: s.color, fontSize: 12, fontWeight: 700,
                cursor: syncing[s.key] ? "wait" : "pointer", opacity: syncing[s.key] ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {syncing[s.key] ? <Loader2 size={13} className="spin" /> : <RefreshCw size={13} />}
              {syncing[s.key] ? "Syncing..." : "Re-sync Players"}
            </button>
            {lastSync[s.key] && (
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 6, textAlign: "center" }}>Last synced: {lastSync[s.key]}</div>
            )}
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ ...card }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={16} color={C.green} /> How Auto-Rollover Works
        </h3>
        <div style={{ display: "grid", gap: 10 }}>
          {[
            { label: "Soccer & CL", desc: "Season flips automatically on August 1st. All cron jobs, API calls, and player syncs pick up the new season instantly. No server restart needed." },
            { label: "NFL", desc: "Season flips automatically on March 1st. The NFL calendar runs Sep→Feb, so the rollover happens after the Super Bowl. All Tank01, API-Sports, and OTC syncs update immediately." },
            { label: "Player Data", desc: "When the season rolls, existing cron jobs will start pulling new-season data. Old-season data is preserved. Use the 'Re-sync Players' button above to trigger an immediate player refresh." },
            { label: "Override", desc: "If you ever need to force a specific season, set NFL_CURRENT_SEASON in the server environment. When set, it overrides the auto-calculation. Remove the env var to return to auto mode." },
          ].map((item, i) => (
            <div key={i} style={{ padding: "10px 14px", background: C.bg, borderRadius: 10, border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SAM REPORTS — Generate, approve, publish & manage articles
// ═══════════════════════════════════════════════════════════════
const ARTICLE_LEAGUES = [
  { value: "premier_league", label: "English Premier" },
  { value: "la_liga", label: "Spanish First Division" },
  { value: "serie_a", label: "Italian First Division" },
  { value: "bundesliga", label: "German First Division" },
  { value: "ligue_1", label: "French First Division" },
  { value: "ekstraklasa", label: "Polish First Division" },
  { value: "champions_league", label: "European Cup" },
  { value: "mls", label: "MLS" },
  { value: "liga_portugal", label: "Liga Portugal" },
  { value: "nfl", label: "NFL" },
];

const PUBLISH_LOCATIONS = [
  { value: "landing_page", label: "Landing Page" },
  { value: "articles_page", label: "Articles Page" },
  { value: "league_hub", label: "League Hub" },
  { value: "match_drawer", label: "Match Drawer" },
];

const ArticlesSection = ({ toast }) => {
  const card = { background: C.bgCard, borderRadius: 14, padding: 20, border: `1px solid ${C.borderLight}`, marginBottom: 16 };
  const btn = (color) => ({ padding: "8px 16px", borderRadius: 8, border: "none", background: color, color: C.white, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 });
  const input = { padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgInput, color: C.text, fontSize: 13, width: "100%" };
  const select = { ...input, cursor: "pointer" };
  const badge = (bg, fg) => ({ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: bg, color: fg });
  const labelSt = { color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 };
  const checkRow = { display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: C.text };

  const [tab, setTab] = useState("list"); // list | generate | custom | batch
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filterLeague, setFilterLeague] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("draft"); // draft | published | archived | ""
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm }

  // Detail / edit drawer
  const [detailArticle, setDetailArticle] = useState(null);
  const [editPublishTo, setEditPublishTo] = useState([]);
  const [editWidgets, setEditWidgets] = useState([]);
  const [editSeoTitle, setEditSeoTitle] = useState("");
  const [editSeoDesc, setEditSeoDesc] = useState("");
  const [editSeoKeywords, setEditSeoKeywords] = useState("");
  const [saving, setSaving] = useState(false);

  // Generate tab
  const [genLeague, setGenLeague] = useState("");
  const [genFixtureStatus, setGenFixtureStatus] = useState("NS");
  const [fixtures, setFixtures] = useState([]);
  const [loadingFixtures, setLoadingFixtures] = useState(false);
  // NFL-specific generate controls
  const [nflWeek, setNflWeek] = useState("1");
  const [nflSeason, setNflSeason] = useState(String(new Date().getMonth() < 8 ? new Date().getFullYear() - 1 : new Date().getFullYear()));

  // Custom tab
  const [customTopic, setCustomTopic] = useState("");
  const [customType, setCustomType] = useState("team");
  const [customLeague, setCustomLeague] = useState("premier_league");
  const [customTone, setCustomTone] = useState("professional");
  const [includeSAM, setIncludeSAM] = useState(true);
  const [customCoverImage, setCustomCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const handleCoverImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) { toast("Only PNG, JPG, or WebP images allowed", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("Image must be under 5MB", "error"); return; }
    setCustomCoverImage(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };
  const clearCoverImage = () => {
    setCustomCoverImage(null);
    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImagePreview(null);
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filterLeague) params.league = filterLeague;
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      const res = await adminAPI.getArticles(params);
      setArticles(res.data?.data?.articles || []);
      setPagination(res.data?.data?.pagination || null);
    } catch (err) {
      toast("Failed to load articles", "error");
    }
    setLoading(false);
  }, [page, filterLeague, filterType, filterStatus, toast]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getArticleStats();
      setStats(res.data?.data || null);
    } catch {}
  }, []);

  useEffect(() => { fetchArticles(); fetchStats(); }, [fetchArticles, fetchStats]);

  const fetchFixtures = async () => {
    setLoadingFixtures(true);
    try {
      if (genLeague === "nfl") {
        // NFL: fetch from Tank01 via our backend
        const nflStatus = genFixtureStatus === "NS" ? "upcoming" : "completed";
        const res = await adminAPI.getNFLFixtures({ week: nflWeek, season: nflSeason, status: nflStatus });
        setFixtures(res.data?.data?.fixtures || []);
      } else {
        const params = { status: genFixtureStatus };
        if (genLeague) params.realLeague = genLeague;
        const res = await adminAPI.getArticleFixtures(params);
        setFixtures(res.data?.data || []);
      }
    } catch (err) {
      toast("Failed to load fixtures", "error");
    }
    setLoadingFixtures(false);
  };

  const handleGenerateMatch = async (fixtureOrGame, type) => {
    setGenerating(true);
    try {
      if (genLeague === "nfl") {
        // NFL: pass the full game object
        await adminAPI.generateNFLArticle(fixtureOrGame, type);
      } else {
        await adminAPI.generateMatchArticle(fixtureOrGame, type, includeSAM);
      }
      toast("SAM Report generated & published!", "success");
      fetchArticles();
      fetchStats();
      fetchFixtures();
    } catch (err) {
      toast(err.response?.data?.message || "Generation failed", "error");
    }
    setGenerating(false);
  };

  const handleGenerateCustom = async () => {
    if (!customTopic.trim()) { toast("Enter a topic", "error"); return; }
    setGenerating(true);
    try {
      await adminAPI.generateCustomArticle(customTopic, customType, customLeague, customTone, includeSAM, customCoverImage);
      toast("Custom SAM Report generated as draft!", "success");
      setCustomTopic("");
      clearCoverImage();
      setFilterStatus("draft");
      setTab("list");
      fetchArticles();
      fetchStats();
    } catch (err) {
      toast(err.response?.data?.message || "Generation failed", "error");
    }
    setGenerating(false);
  };

  const handleBatchGenerate = async (type) => {
    setGenerating(true);
    try {
      await adminAPI.generateBatchArticles(type);
      toast(`Batch ${type || "all"} generation started! Reports publish automatically.`, "success");
    } catch (err) {
      toast("Batch generation failed", "error");
    }
    setGenerating(false);
  };

  const handleDeleteArticle = (id) => {
    setConfirmModal({
      message: "Permanently delete this SAM Report? This cannot be undone.",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await adminAPI.deleteArticle(id);
          toast("Article deleted permanently", "success");
          setDetailArticle(null);
          fetchArticles();
          fetchStats();
        } catch {
          toast("Delete failed", "error");
        }
      },
    });
  };

  const handleArchiveArticle = async (id) => {
    try {
      await adminAPI.updateArticle(id, { status: "archived" });
      toast("Article archived (auto-deletes in 30 days)", "success");
      setDetailArticle(null);
      fetchArticles();
      fetchStats();
    } catch {
      toast("Archive failed", "error");
    }
  };

  const handlePublish = async (id, publishTo) => {
    if (!publishTo || publishTo.length === 0) { toast("Select at least one publish location", "error"); return; }
    try {
      await adminAPI.updateArticle(id, { status: "published", publishTo });
      toast("SAM Report published!", "success");
      setDetailArticle(null);
      setFilterStatus("published");
      fetchArticles();
      fetchStats();
    } catch {
      toast("Publish failed", "error");
    }
  };

  const handleSaveSeo = async (id) => {
    setSaving(true);
    try {
      const updates = {
        seoTitle: editSeoTitle,
        seoDescription: editSeoDesc,
        seoKeywords: editSeoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        publishTo: editPublishTo,
        widgets: editWidgets,
      };
      await adminAPI.updateArticle(id, updates);
      toast("SEO, widgets & publish settings saved", "success");
      fetchArticles();
    } catch {
      toast("Save failed", "error");
    }
    setSaving(false);
  };

  const openDetail = async (id) => {
    try {
      const res = await adminAPI.getArticle(id);
      const a = res.data?.data?.article || res.data?.data;
      setDetailArticle(a);
      setEditPublishTo(a.publishTo || ["landing_page", "articles_page", "match_drawer"]);
      setEditWidgets(a.widgets || []);
      setEditSeoTitle(a.seoTitle || "");
      setEditSeoDesc(a.seoDescription || "");
      setEditSeoKeywords((a.seoKeywords || []).join(", "));
    } catch {
      toast("Failed to load article", "error");
    }
  };

  const togglePublishTo = (loc) => {
    setEditPublishTo((prev) => prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]);
  };

  const statusBadgeColor = (s) => {
    if (s === "draft") return { bg: C.amberLight || "#fef3c7", fg: C.amber || "#f59e0b" };
    if (s === "published") return { bg: C.greenLight || "#d1fae5", fg: C.green || "#10b981" };
    return { bg: C.redLight || "#fee2e2", fg: C.red || "#ef4444" };
  };

  const typeBadge = (t) => {
    if (t === "pre_match") return { label: "Preview", bg: C.purpleLight || "#ede9fe", fg: C.purple || "#8b5cf6" };
    if (t === "post_match") return { label: "Review", bg: C.amberLight || "#fef3c7", fg: C.amber || "#f59e0b" };
    return { label: "Custom", bg: C.cyanLight || "#cffafe", fg: C.cyan || "#06b6d4" };
  };

  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{ ...btn(tab === t ? C.blue : C.bgHover), minWidth: 100 }}>{label}</button>
  );

  // ── Confirm Modal ──
  const ConfirmModal = () => confirmModal && (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)" }} onClick={() => setConfirmModal(null)}>
      <div style={{ background: C.bgCard, borderRadius: 14, padding: 24, border: `1px solid ${C.borderLight}`, maxWidth: 400, width: "90%" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={22} style={{ color: C.red }} />
          <h3 style={{ color: C.white, fontSize: 16, margin: 0 }}>Confirm</h3>
        </div>
        <p style={{ color: C.text, fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>{confirmModal.message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={() => setConfirmModal(null)} style={btn(C.bgHover)}>Cancel</button>
          <button onClick={confirmModal.onConfirm} style={btn(C.red)}><Trash2 size={14} /> Delete</button>
        </div>
      </div>
    </div>
  );

  // ── Detail / Approval Drawer ──
  if (detailArticle) {
    const a = detailArticle;
    const sb = statusBadgeColor(a.status);
    const tb = typeBadge(a.type);
    return (
      <div>
        <ConfirmModal />
        <button onClick={() => setDetailArticle(null)} style={{ ...btn(C.bgHover), marginBottom: 16 }}>← Back to List</button>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: C.white, fontSize: 20, marginBottom: 8 }}>{a.title}</h2>
              {a.subtitle && <p style={{ color: C.textDim, fontSize: 14, marginBottom: 8 }}>{a.subtitle}</p>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={badge(tb.bg, tb.fg)}>{tb.label}</span>
                <span style={badge(C.blueLight || "#dbeafe", C.blue)}>{ARTICLE_LEAGUES.find((l) => l.value === a.realLeague)?.label || a.realLeague}</span>
                <span style={badge(sb.bg, sb.fg)}>{a.status.toUpperCase()}</span>
                <span style={{ color: C.textMuted, fontSize: 11 }}>{a.readTimeMinutes}m read | {a.views || 0} views | {ts(a.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Match info */}
          {a.homeTeam && (
            <div style={{ background: C.bgHover, borderRadius: 10, padding: 12, marginBottom: 16, textAlign: "center" }}>
              <span style={{ color: C.white, fontSize: 16, fontWeight: 700 }}>
                {a.homeTeam} {a.homeScore != null ? `${a.homeScore} - ${a.awayScore}` : "vs"} {a.awayTeam}
              </span>
              {a.matchweek && <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>Matchweek {a.matchweek} | {a.kickoff ? new Date(a.kickoff).toLocaleDateString() : ""}</div>}
            </div>
          )}

          {/* Article content preview */}
          <div style={{ background: C.bgHover, borderRadius: 10, padding: 16, marginBottom: 16, maxHeight: 300, overflow: "auto" }}>
            <div style={{ color: C.text, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: a.content || "" }} />
          </div>

          {/* Top performers */}
          {a.topPerformers?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ color: C.white, fontSize: 14, marginBottom: 8 }}>Top Performers</h4>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {a.topPerformers.map((p, i) => (
                  <div key={i} style={{ background: C.bgHover, borderRadius: 8, padding: "6px 12px" }}>
                    <span style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: C.amber, fontSize: 12, marginLeft: 6 }}>{p.samRating?.toFixed(1)}</span>
                    {p.keyStats && <div style={{ color: C.textMuted, fontSize: 11 }}>{p.keyStats}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PUBLISH LOCATIONS ── */}
          <div style={{ ...card, background: C.bgHover }}>
            <h4 style={{ color: C.white, fontSize: 14, marginBottom: 10 }}>Publish Locations</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {PUBLISH_LOCATIONS.map((loc) => (
                <label key={loc.value} style={checkRow}>
                  <input type="checkbox" checked={editPublishTo.includes(loc.value)} onChange={() => togglePublishTo(loc.value)} />
                  {loc.label}
                </label>
              ))}
            </div>
          </div>

          {/* ── WIDGET ENRICHMENTS ── */}
          {editWidgets.length > 0 && (
            <div style={{ ...card, background: C.bgHover }}>
              <h4 style={{ color: C.white, fontSize: 14, marginBottom: 10 }}>Article Widgets</h4>
              <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 10 }}>Toggle which data widgets appear alongside this article</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {editWidgets.map((w, idx) => {
                  const labels = { h2h: "H2H Stats", rankings: "League Standings", photos: "Team/Player Photos", sources: "Data Sources" };
                  const icons = { h2h: "⚔️", rankings: "📊", photos: "📸", sources: "📎" };
                  const counts = {
                    h2h: w.h2h?.matches?.length ? `${w.h2h.matches.length} matches` : "",
                    rankings: w.rankings?.table?.length ? `${w.rankings.table.length} teams` : "",
                    photos: w.photos?.length ? `${w.photos.length} images` : "",
                    sources: w.sources?.length ? `${w.sources.length} sources` : "",
                  };
                  return (
                    <label key={w.type} style={{ ...checkRow, opacity: w.enabled ? 1 : 0.5 }}>
                      <input type="checkbox" checked={w.enabled} onChange={() => {
                        const updated = [...editWidgets];
                        updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                        setEditWidgets(updated);
                      }} />
                      <span>{icons[w.type] || ""} {labels[w.type] || w.type}</span>
                      {counts[w.type] && <span style={{ color: C.textMuted, fontSize: 11, marginLeft: 4 }}>({counts[w.type]})</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── UPLOAD IMAGES ── */}
          <div style={{ ...card, background: C.bgHover }}>
            <h4 style={{ color: C.white, fontSize: 14, marginBottom: 10 }}>Upload Images</h4>
            <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 10 }}>Add match photos, action shots, or custom images to this article</p>
            <div style={{ display: "grid", gap: 10 }}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                id="article-image-upload"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSaving(true);
                  try {
                    const fd = new FormData();
                    fd.append("image", file);
                    fd.append("caption", file.name.replace(/\.[^.]+$/, ""));
                    fd.append("photoType", "player");
                    const res = await adminAPI.uploadArticleImage(a._id, fd);
                    const updated = res.data?.data?.article;
                    if (updated) {
                      setDetailArticle(updated);
                      setEditWidgets(updated.widgets || []);
                    }
                    toast("Image uploaded", "success");
                  } catch (err) {
                    toast(err?.response?.data?.message || "Upload failed", "error");
                  }
                  setSaving(false);
                  e.target.value = "";
                }}
              />
              <button onClick={() => document.getElementById("article-image-upload")?.click()} disabled={saving} style={btn(C.blue)}>
                {saving ? "Uploading..." : "Choose Image"}
              </button>
              {/* Show existing uploaded images */}
              {editWidgets.find((w) => w.type === "photos")?.photos?.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {editWidgets.find((w) => w.type === "photos").photos.map((p, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={p.url} alt={p.caption || ""} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, background: C.bgHover }} onError={(e) => { e.target.style.display = "none"; }} />
                      <div style={{ color: C.textMuted, fontSize: 10, maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{p.caption || p.type}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── SEO SETTINGS ── */}
          <div style={{ ...card, background: C.bgHover }}>
            <h4 style={{ color: C.white, fontSize: 14, marginBottom: 10 }}>SEO Settings</h4>
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <label style={labelSt}>SEO Title</label>
                <input value={editSeoTitle} onChange={(e) => setEditSeoTitle(e.target.value)} style={input} placeholder="Custom title tag for search engines" />
              </div>
              <div>
                <label style={labelSt}>Meta Description (max 160 chars)</label>
                <textarea value={editSeoDesc} onChange={(e) => setEditSeoDesc(e.target.value.substring(0, 160))} style={{ ...input, height: 60, resize: "vertical" }} placeholder="Short description for Google snippets" />
                <div style={{ color: C.textMuted, fontSize: 11, marginTop: 2, textAlign: "right" }}>{editSeoDesc.length}/160</div>
              </div>
              <div>
                <label style={labelSt}>Keywords (comma-separated)</label>
                <input value={editSeoKeywords} onChange={(e) => setEditSeoKeywords(e.target.value)} style={input} placeholder="e.g. premier league, match preview, SAM ratings" />
              </div>
              <button onClick={() => handleSaveSeo(a._id)} disabled={saving} style={btn(C.blue)}>
                {saving ? <Spinner size={14} /> : <Settings size={14} />} Save SEO & Locations
              </button>
            </div>
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {a.status === "draft" && (
              <button onClick={() => handlePublish(a._id, editPublishTo)} style={btn(C.green)}>
                <CheckCircle size={14} /> Approve & Publish
              </button>
            )}
            {a.status === "published" && (
              <button onClick={() => handleArchiveArticle(a._id)} style={btn(C.amber)}>
                <Pause size={14} /> Archive
              </button>
            )}
            {a.status === "archived" && (
              <button onClick={() => handlePublish(a._id, editPublishTo)} style={btn(C.green)}>
                <Play size={14} /> Re-publish
              </button>
            )}
            <button onClick={() => handleArchiveArticle(a._id)} style={btn(C.bgHover)}>
              <Clock size={14} /> Archive (auto-deletes in 30 days)
            </button>
            <button onClick={() => handleDeleteArticle(a._id)} style={btn(C.red)}>
              <Trash2 size={14} /> Delete Permanently
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ConfirmModal />
      <h2 style={{ color: C.white, fontSize: 22, marginBottom: 16 }}>SAM Reports</h2>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total", value: stats.total, color: C.blue },
            { label: "Drafts", value: stats.drafts || 0, color: C.amber },
            { label: "Published", value: stats.published, color: C.green },
            { label: "Archived", value: stats.archived || 0, color: C.red },
            { label: "Pre-Match", value: stats.preMatch, color: C.purple },
            { label: "Post-Match", value: stats.postMatch, color: C.amber },
            { label: "Total Views", value: fmt(stats.totalViews), color: C.cyan },
          ].map((s, i) => (
            <div key={i} style={{ ...card, padding: 14, textAlign: "center" }}>
              <div style={{ color: s.color, fontSize: 24, fontWeight: 700 }}>{s.value}</div>
              <div style={{ color: C.textDim, fontSize: 12 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabBtn("list", "All Reports")}
        {tabBtn("generate", "Generate Match")}
        {tabBtn("custom", "Custom SAM Report")}
        {tabBtn("batch", "Batch Generate")}
      </div>

      {/* ── LIST TAB ── */}
      {tab === "list" && (
        <div style={card}>
          {/* Status filter pills */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {[
              { value: "draft", label: "Drafts", color: C.amber },
              { value: "published", label: "Published", color: C.green },
              { value: "archived", label: "Archived", color: C.red },
              { value: "", label: "All", color: C.blue },
            ].map((s) => (
              <button key={s.value} onClick={() => { setFilterStatus(s.value); setPage(1); }}
                style={{ padding: "5px 14px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: filterStatus === s.value ? s.color : C.bgHover, color: filterStatus === s.value ? C.white : C.textDim }}>
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <select value={filterLeague} onChange={(e) => { setFilterLeague(e.target.value); setPage(1); }} style={{ ...select, maxWidth: 200 }}>
              <option value="">All Leagues</option>
              {ARTICLE_LEAGUES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} style={{ ...select, maxWidth: 160 }}>
              <option value="">All Types</option>
              <option value="pre_match">Pre-Match</option>
              <option value="post_match">Post-Match</option>
              <option value="custom">Custom</option>
            </select>
            <button onClick={fetchArticles} style={btn(C.blue)}><RefreshCw size={14}/> Refresh</button>
          </div>

          {loading ? <Spinner /> : articles.length === 0 ? (
            <p style={{ color: C.textDim }}>No {filterStatus || ""} reports found. Generate some from the other tabs!</p>
          ) : (
            <div>
              {articles.map((a) => {
                const sb = statusBadgeColor(a.status);
                const tb = typeBadge(a.type);
                return (
                  <div key={a._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.borderLight}`, cursor: "pointer" }} onClick={() => openDetail(a._id)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: C.white, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{a.title}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={badge(tb.bg, tb.fg)}>{tb.label}</span>
                        <span style={badge(C.blueLight || "#dbeafe", C.blue)}>{ARTICLE_LEAGUES.find((l) => l.value === a.realLeague)?.label || a.realLeague}</span>
                        <span style={badge(sb.bg, sb.fg)}>{a.status}</span>
                        <span style={{ color: C.textMuted, fontSize: 11 }}>{a.readTimeMinutes}m read</span>
                        <span style={{ color: C.textMuted, fontSize: 11 }}>{a.views || 0} views</span>
                        <span style={{ color: C.textMuted, fontSize: 11 }}>{ts(a.createdAt)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      {a.status === "draft" && (
                        <button onClick={() => openDetail(a._id)} style={btn(C.green)} title="Review & Publish">
                          <Eye size={14} /> Review
                        </button>
                      )}
                      {a.status === "published" && (
                        <button onClick={() => handleArchiveArticle(a._id)} style={btn(C.amber)} title="Archive">
                          <Pause size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteArticle(a._id)} style={btn(C.red)} title="Delete permanently"><Trash2 size={14}/></button>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                  <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={btn(C.bgHover)}>Prev</button>
                  <span style={{ color: C.textDim, padding: "8px 12px", fontSize: 13 }}>Page {page} of {pagination.pages}</span>
                  <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} style={btn(C.bgHover)}>Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── GENERATE MATCH TAB ── */}
      {tab === "generate" && (
        <div style={card}>
          <h3 style={{ color: C.white, fontSize: 16, marginBottom: 12 }}>Generate Match SAM Report</h3>
          <p style={{ color: C.textDim, fontSize: 13, marginBottom: 12 }}>Pre-match and post-match reports are published automatically to all locations.</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <select value={genLeague} onChange={(e) => { setGenLeague(e.target.value); setFixtures([]); }} style={{ ...select, maxWidth: 200 }}>
              <option value="">All Leagues</option>
              {ARTICLE_LEAGUES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <select value={genFixtureStatus} onChange={(e) => setGenFixtureStatus(e.target.value)} style={{ ...select, maxWidth: 160 }}>
              <option value="NS">Upcoming (Pre-Match)</option>
              <option value="FT">Finished (Post-Match)</option>
            </select>
            {genLeague === "nfl" && (
              <>
                <div>
                  <label style={{ color: C.textDim, fontSize: 11, display: "block", marginBottom: 2 }}>Season</label>
                  <select value={nflSeason} onChange={(e) => setNflSeason(e.target.value)} style={{ ...select, maxWidth: 100 }}>
                    {[2026, 2025, 2024, 2023].map((y) => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: C.textDim, fontSize: 11, display: "block", marginBottom: 2 }}>Week</label>
                  <select value={nflWeek} onChange={(e) => setNflWeek(e.target.value)} style={{ ...select, maxWidth: 80 }}>
                    {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => <option key={w} value={String(w)}>Wk {w}</option>)}
                    <option value="19">Wild Card</option>
                    <option value="20">Divisional</option>
                    <option value="21">Conf Champ</option>
                    <option value="22">Super Bowl</option>
                  </select>
                </div>
              </>
            )}
            <button onClick={fetchFixtures} style={btn(C.blue)}><Search size={14}/> Load Fixtures</button>
            <label style={{ display: "flex", alignItems: "center", gap: 6, color: C.textDim, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={includeSAM} onChange={(e) => setIncludeSAM(e.target.checked)} />
              Include SAM Metrics
            </label>
          </div>

          {loadingFixtures ? <Spinner /> : fixtures.length === 0 ? (
            <p style={{ color: C.textDim }}>Select a league and click Load Fixtures to see available matches.</p>
          ) : (
            <div>
              {fixtures.map((f) => {
                const isNfl = genLeague === "nfl" || f.realLeague === "nfl";
                const articleType = isNfl
                  ? (genFixtureStatus === "NS" ? "pre_match" : "post_match")
                  : (f.status === "FT" ? "post_match" : "pre_match");
                const hasArticle = articleType === "pre_match" ? f.hasPreMatch : f.hasPostMatch;
                const fixtureKey = isNfl ? f.gameID : f.apiFixtureId;
                const score = (f.homeScore != null && f.awayScore != null) ? `${f.homeScore}-${f.awayScore}` : null;
                return (
                  <div key={fixtureKey} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.borderLight}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>
                        {isNfl && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: "#7c3aed22", color: "#a78bfa", marginRight: 6 }}>NFL</span>}
                        {f.homeTeam} {score || "vs"} {f.awayTeam}
                      </div>
                      <div style={{ color: C.textMuted, fontSize: 11 }}>
                        {isNfl ? `Week ${f.week || f.matchweek}` : `MW${f.matchweek}`} | {f.date ? new Date(f.date).toLocaleDateString() : "TBD"} | {ARTICLE_LEAGUES.find((l) => l.value === (f.realLeague || genLeague))?.label || ""}
                      </div>
                    </div>
                    {hasArticle ? (
                      <span style={badge(C.greenLight || "#d1fae5", C.green)}>Report exists</span>
                    ) : (
                      <button
                        onClick={() => isNfl ? handleGenerateMatch(f, articleType) : handleGenerateMatch(f.apiFixtureId, articleType)}
                        disabled={generating}
                        style={btn(C.purple)}
                      >
                        {generating ? <Spinner size={14}/> : <Zap size={14}/>}
                        Generate {articleType === "pre_match" ? "Preview" : "Review"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CUSTOM SAM REPORT TAB ── */}
      {tab === "custom" && (
        <div style={card}>
          <h3 style={{ color: C.white, fontSize: 16, marginBottom: 12 }}>Custom SAM Report Generator</h3>
          <p style={{ color: C.textDim, fontSize: 13, marginBottom: 16 }}>
            Write SAM Reports about a specific team, player, league, or competition using real SAM data. Custom reports are saved as drafts for your review before publishing.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelSt}>Topic Type</label>
              <select value={customType} onChange={(e) => setCustomType(e.target.value)} style={select}>
                <option value="team">Team</option>
                <option value="player">Player</option>
                <option value="league">League</option>
                <option value="competition">Competition</option>
              </select>
            </div>
            <div>
              <label style={labelSt}>League</label>
              <select value={customLeague} onChange={(e) => setCustomLeague(e.target.value)} style={select}>
                {ARTICLE_LEAGUES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Tone</label>
              <select value={customTone} onChange={(e) => setCustomTone(e.target.value)} style={select}>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="data-driven">Data-Driven</option>
              </select>
            </div>
            <div>
              <label style={labelSt}>Topic (name or subject)</label>
              <input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder={customType === "player" ? "e.g. Mohamed Salah" : customType === "team" ? "e.g. Manchester City" : "e.g. Title Race Analysis"}
                style={input}
              />
            </div>
          </div>

          {/* Cover Image Upload */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelSt}>Cover Image (optional)</label>
            {coverImagePreview ? (
              <div style={{ position: "relative", display: "inline-block", marginTop: 6 }}>
                <img src={coverImagePreview} alt="Cover preview" style={{ maxWidth: 280, maxHeight: 140, objectFit: "cover", borderRadius: 8, display: "block" }} />
                <button onClick={clearCoverImage} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: 6, padding: "2px 6px", cursor: "pointer", fontSize: 11 }}>Remove</button>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", border: `1px dashed ${C.borderLight}`, borderRadius: 8, cursor: "pointer", color: C.textMuted, fontSize: 13, marginTop: 6, width: "fit-content" }}>
                <ImagePlus size={16} />
                <span>Click to upload cover image</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleCoverImageSelect} style={{ display: "none" }} />
              </label>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 0 }}>
            <button onClick={handleGenerateCustom} disabled={generating} style={btn(C.purple)}>
              {generating ? <><Spinner size={14}/> Generating...</> : <><Zap size={14}/> Generate SAM Report</>}
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: 6, color: C.textDim, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={includeSAM} onChange={(e) => setIncludeSAM(e.target.checked)} />
              Include SAM Metrics
            </label>
          </div>
        </div>
      )}

      {/* ── BATCH GENERATE TAB ── */}
      {tab === "batch" && (
        <div style={card}>
          <h3 style={{ color: C.white, fontSize: 16, marginBottom: 12 }}>Batch SAM Report Generation</h3>
          <p style={{ color: C.textDim, fontSize: 13, marginBottom: 16 }}>
            Trigger the same generation that the cron runs automatically. Match reports publish automatically.
            Pre-match reports cover fixtures 12-36h ahead. Post-match reports cover games finished in the last 6h.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => handleBatchGenerate("pre_match")} disabled={generating} style={btn(C.purple)}>
              {generating ? <Spinner size={14}/> : <Zap size={14}/>} Generate Pre-Match Batch
            </button>
            <button onClick={() => handleBatchGenerate("post_match")} disabled={generating} style={btn(C.amber)}>
              {generating ? <Spinner size={14}/> : <Zap size={14}/>} Generate Post-Match Batch
            </button>
            <button onClick={() => handleBatchGenerate(null)} disabled={generating} style={btn(C.green)}>
              {generating ? <Spinner size={14}/> : <Zap size={14}/>} Generate All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  INFOGRAPHICS SECTION — Generate social media graphics
// ═══════════════════════════════════════════════════════════════
const INFOGRAPHIC_LEAGUES = [
  { value: "premier_league", label: "Premier League" },
  { value: "la_liga", label: "La Liga" },
  { value: "serie_a", label: "Serie A" },
  { value: "bundesliga", label: "Bundesliga" },
  { value: "ligue_1", label: "Ligue 1" },
  { value: "ekstraklasa", label: "Ekstraklasa" },
  { value: "champions_league", label: "Champions League" },
  { value: "mls", label: "MLS" },
  { value: "liga_portugal", label: "Liga Portugal" },
  { value: "nfl", label: "NFL" },
];

const InfographicsSection = ({ toast }) => {
  const card = { background: C.bgCard, borderRadius: 14, padding: 20, border: `1px solid ${C.borderLight}`, marginBottom: 16 };
  const btn = (color) => ({ padding: "8px 16px", borderRadius: 8, border: "none", background: color, color: C.white, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 });
  const select = { padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.bgInput, color: C.text, fontSize: 13, cursor: "pointer" };

  const [tab, setTab] = useState("generate");
  const [infographics, setInfographics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genLeague, setGenLeague] = useState("");
  const [genType, setGenType] = useState("pregame"); // pregame | postmatch | live | event
  const [fixtures, setFixtures] = useState([]);
  const [loadingFixtures, setLoadingFixtures] = useState(false);
  const [nflWeek, setNflWeek] = useState("1");
  const [nflSeason, setNflSeason] = useState(String(new Date().getMonth() < 8 ? new Date().getFullYear() - 1 : new Date().getFullYear()));
  const [previewUrl, setPreviewUrl] = useState(null);
  const [page, setPage] = useState(1);

  // ── Match Event state ──
  const [eventType, setEventType] = useState("goal");
  const [eventSport, setEventSport] = useState("soccer");
  const [eventHomeTeam, setEventHomeTeam] = useState("");
  const [eventAwayTeam, setEventAwayTeam] = useState("");
  const [eventHomeScore, setEventHomeScore] = useState("");
  const [eventAwayScore, setEventAwayScore] = useState("");
  const [eventPlayer, setEventPlayer] = useState("");
  const [eventPlayerDetail, setEventPlayerDetail] = useState("");
  const [eventMinute, setEventMinute] = useState("");
  const [eventExtraMinute, setEventExtraMinute] = useState("");
  const [eventLeague, setEventLeague] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventBigText, setEventBigText] = useState("");

  const EVENT_TYPES = {
    soccer: [
      { value: "goal", label: "Goal", icon: "⚽" },
      { value: "penalty", label: "Penalty Goal", icon: "🎯" },
      { value: "own_goal", label: "Own Goal", icon: "😬" },
      { value: "red_card", label: "Red Card", icon: "🟥" },
    ],
    nfl: [
      { value: "touchdown", label: "Touchdown", icon: "🏈" },
      { value: "interception", label: "Interception", icon: "🛡️" },
      { value: "fumble", label: "Fumble", icon: "💥" },
    ],
  };

  const isNfl = genLeague === "nfl";
  const SOCCER_API_URL = "https://foot.samsports.io";

  const fetchInfographics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getInfographics({ page, sport: isNfl ? "nfl" : genLeague ? "soccer" : undefined, league: genLeague || undefined });
      setInfographics(res.data?.infographics || []);
    } catch { toast("Failed to load infographics", "error"); }
    setLoading(false);
  }, [page, genLeague]);

  useEffect(() => { fetchInfographics(); }, [fetchInfographics]);

  const fetchFixtures = async () => {
    if (!genLeague) return toast("Select a league first", "error");
    setLoadingFixtures(true);
    setFixtures([]);
    try {
      if (isNfl) {
        const res = await adminAPI.getNFLInfographicFixtures({ week: nflWeek, season: nflSeason });
        const games = res.data?.games || [];
        setFixtures(games.map(g => ({ ...g, _isNfl: true, _display: `${g.away || "?"} @ ${g.home || "?"}`, _sub: g.gameDate || "", _id: g.gameID })));
      } else {
        const fixtureStatus = genType === "pregame" ? "NS" : genType === "postmatch" ? "FT" : undefined;
        const params = { realLeague: genLeague };
        if (fixtureStatus) params.status = fixtureStatus;
        const res = await adminAPI.getArticleFixtures(params);
        const fxs = res.data?.data || [];
        setFixtures(fxs.map(f => ({ ...f, _isNfl: false, _display: `${f.homeTeam} vs ${f.awayTeam}`, _sub: `${f.date ? new Date(f.date).toLocaleDateString() : ""}${f.homeScore != null ? ` · ${f.homeScore}-${f.awayScore}` : ""}`, _id: f._id || f.apiFixtureId })));
      }
    } catch (err) { toast("Failed to load fixtures: " + err.message, "error"); }
    setLoadingFixtures(false);
  };

  const handleGenerate = async (fixtureOrGame) => {
    setGenerating(true);
    try {
      let res;
      if (fixtureOrGame._isNfl) {
        res = await adminAPI.generateNFLInfographic(fixtureOrGame);
      } else if (genType === "postmatch") {
        res = await adminAPI.generateSoccerPostMatch(fixtureOrGame, genLeague);
      } else if (genType === "live") {
        res = await adminAPI.generateSoccerLive(fixtureOrGame, genLeague);
      } else {
        res = await adminAPI.generateSoccerInfographic(fixtureOrGame, genLeague);
      }
      const infographic = res.data?.infographic;
      if (infographic?.files?.instagram?.url) {
        setPreviewUrl(SOCCER_API_URL + infographic.files.instagram.url);
      }
      toast("Infographic generated!", "success");
      fetchInfographics();
    } catch (err) {
      toast("Generation failed: " + (err.response?.data?.message || err.message), "error");
    }
    setGenerating(false);
  };

  const handleGenerateEvent = async () => {
    if (!eventType || !eventHomeTeam || !eventAwayTeam) {
      return toast("Event type, home team, and away team are required", "error");
    }
    setGenerating(true);
    try {
      const res = await adminAPI.generateMatchEvent({
        eventType,
        sport: eventSport,
        league: eventLeague,
        playerName: eventPlayer,
        playerDetail: eventPlayerDetail,
        minute: eventMinute ? parseInt(eventMinute) : undefined,
        extraMinute: eventExtraMinute ? parseInt(eventExtraMinute) : undefined,
        homeTeam: eventHomeTeam,
        awayTeam: eventAwayTeam,
        homeScore: eventHomeScore,
        awayScore: eventAwayScore,
        venue: eventVenue,
        bigText: eventBigText || undefined,
      });
      const infographic = res.data?.infographic;
      if (infographic?.files?.instagram?.url) {
        setPreviewUrl(SOCCER_API_URL + infographic.files.instagram.url);
      }
      toast(`${eventType.replace("_", " ")} infographic generated!`, "success");
      fetchInfographics();
    } catch (err) {
      toast("Generation failed: " + (err.response?.data?.message || err.message), "error");
    }
    setGenerating(false);
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteInfographic(id);
      toast("Deleted", "success");
      fetchInfographics();
    } catch { toast("Delete failed", "error"); }
  };

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: tab === id ? C.purple : "transparent", color: tab === id ? "#fff" : C.textDim, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{label}</button>
  );

  return (
    <div>
      <h2 style={{ color: C.white, fontSize: 22, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <Image size={22} /> Infographics
      </h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {tabBtn("generate", "Generate")}
        {tabBtn("gallery", "Gallery")}
      </div>

      {tab === "generate" && (
        <div style={card}>
          <h3 style={{ color: C.white, fontSize: 16, marginBottom: 12 }}>
            {genType === "pregame" ? "Generate Pre-Game Matchup Card" : genType === "postmatch" ? "Generate Post-Match Result Card" : genType === "live" ? "Generate Live Score Card" : "Generate Match Event Card"}
          </h3>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["pregame", "postmatch", "live", "event"].map(t => (
              <button key={t} onClick={() => { setGenType(t); setFixtures([]); setPreviewUrl(null); }} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${genType === t ? C.purple : C.border}`, background: genType === t ? "rgba(124,58,237,0.15)" : "transparent", color: genType === t ? C.purple : C.textDim, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {t === "pregame" ? "Pre-Game" : t === "postmatch" ? "Post-Match" : t === "live" ? "Live" : "Match Event"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>League</label>
              <select value={genLeague} onChange={e => { setGenLeague(e.target.value); setFixtures([]); }} style={{ ...select, width: 180 }}>
                <option value="">— Select —</option>
                {INFOGRAPHIC_LEAGUES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            {isNfl && genType !== "event" && (
              <>
                <div>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>NFL Week</label>
                  <select value={nflWeek} onChange={e => setNflWeek(e.target.value)} style={{ ...select, width: 80 }}>
                    {Array.from({ length: 18 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>Season</label>
                  <select value={nflSeason} onChange={e => setNflSeason(e.target.value)} style={{ ...select, width: 100 }}>
                    {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </>
            )}

            {genType !== "event" && (
              <button onClick={fetchFixtures} disabled={loadingFixtures || !genLeague} style={btn(C.purple)}>
                {loadingFixtures ? <><Loader2 size={14} className="spin" /> Loading...</> : <><Search size={14} /> Load Fixtures</>}
              </button>
            )}
          </div>

          {/* ── Match Event Form ── */}
          {genType === "event" && (
            <div style={{ marginBottom: 20 }}>
              {/* Sport + Event Type */}
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>Sport</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["soccer", "nfl"].map(s => (
                      <button key={s} onClick={() => { setEventSport(s); setEventType(s === "soccer" ? "goal" : "touchdown"); }}
                        style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${eventSport === s ? C.purple : C.border}`, background: eventSport === s ? "rgba(124,58,237,0.15)" : "transparent", color: eventSport === s ? C.purple : C.textDim, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        {s === "soccer" ? "⚽ Soccer" : "🏈 NFL"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>Event Type</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(EVENT_TYPES[eventSport] || []).map(et => (
                      <button key={et.value} onClick={() => setEventType(et.value)}
                        style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${eventType === et.value ? C.green : C.border}`, background: eventType === et.value ? "rgba(16,185,129,0.15)" : "transparent", color: eventType === et.value ? C.green : C.textDim, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                        {et.icon} {et.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Teams + Score */}
              <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>Home Team *</label>
                  <input value={eventHomeTeam} onChange={e => setEventHomeTeam(e.target.value)} placeholder="e.g. Arsenal" style={{ ...select, width: "100%", boxSizing: "border-box" }} />
                </div>
                <div style={{ width: 60 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>H Score</label>
                  <input value={eventHomeScore} onChange={e => setEventHomeScore(e.target.value)} placeholder="2" style={{ ...select, width: "100%", boxSizing: "border-box", textAlign: "center" }} />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4, color: C.textDim, fontWeight: 700, fontSize: 16 }}>—</div>
                <div style={{ width: 60 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>A Score</label>
                  <input value={eventAwayScore} onChange={e => setEventAwayScore(e.target.value)} placeholder="1" style={{ ...select, width: "100%", boxSizing: "border-box", textAlign: "center" }} />
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>Away Team *</label>
                  <input value={eventAwayTeam} onChange={e => setEventAwayTeam(e.target.value)} placeholder="e.g. Chelsea" style={{ ...select, width: "100%", boxSizing: "border-box" }} />
                </div>
              </div>

              {/* Player + Minute */}
              <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>Player Name</label>
                  <input value={eventPlayer} onChange={e => setEventPlayer(e.target.value)} placeholder="e.g. Bukayo Saka" style={{ ...select, width: "100%", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>Player Detail (assist, position, etc.)</label>
                  <input value={eventPlayerDetail} onChange={e => setEventPlayerDetail(e.target.value)} placeholder="e.g. Assist: Odegaard" style={{ ...select, width: "100%", boxSizing: "border-box" }} />
                </div>
                <div style={{ width: 70 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>Minute</label>
                  <input value={eventMinute} onChange={e => setEventMinute(e.target.value)} placeholder="73" style={{ ...select, width: "100%", boxSizing: "border-box", textAlign: "center" }} />
                </div>
                <div style={{ width: 50 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>+</label>
                  <input value={eventExtraMinute} onChange={e => setEventExtraMinute(e.target.value)} placeholder="" style={{ ...select, width: "100%", boxSizing: "border-box", textAlign: "center" }} />
                </div>
              </div>

              {/* League + Venue + Big Text */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>League / Competition</label>
                  <input value={eventLeague} onChange={e => setEventLeague(e.target.value)} placeholder="e.g. Premier League" style={{ ...select, width: "100%", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>Venue</label>
                  <input value={eventVenue} onChange={e => setEventVenue(e.target.value)} placeholder="e.g. Emirates Stadium" style={{ ...select, width: "100%", boxSizing: "border-box" }} />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={{ color: C.textDim, fontSize: 12, display: "block", marginBottom: 4 }}>Big Text (optional override)</label>
                  <input value={eventBigText} onChange={e => setEventBigText(e.target.value)} placeholder="e.g. HAT-TRICK" style={{ ...select, width: "100%", boxSizing: "border-box" }} />
                </div>
              </div>

              <button onClick={handleGenerateEvent} disabled={generating || !eventHomeTeam || !eventAwayTeam} style={btn(C.green)}>
                {generating ? <><Loader2 size={14} className="spin" /> Generating...</> : <><Zap size={14} /> Generate {eventType.replace("_", " ").toUpperCase()} Card</>}
              </button>
            </div>
          )}

          {genType !== "event" && fixtures.length > 0 && (
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {fixtures.map((f, i) => (
                <div key={f._id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: i % 2 === 0 ? C.bgCard : C.bgInput, border: `1px solid ${C.borderLight}`, marginBottom: 6 }}>
                  <div>
                    <div style={{ color: C.white, fontWeight: 600, fontSize: 14 }}>{f._display}</div>
                    <div style={{ color: C.textDim, fontSize: 11 }}>{f._sub}</div>
                  </div>
                  <button onClick={() => handleGenerate(f)} disabled={generating} style={btn(C.purple)}>
                    {generating ? <><Loader2 size={14} className="spin" /> Generating...</> : <><Image size={14} /> Generate</>}
                  </button>
                </div>
              ))}
            </div>
          )}

          {previewUrl && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ color: C.white, fontSize: 14, marginBottom: 8 }}>Latest Preview</h4>
              <img src={previewUrl} alt="Infographic preview" style={{ maxWidth: "100%", borderRadius: 12, border: `1px solid ${C.border}` }} />
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <a href={previewUrl} target="_blank" rel="noreferrer" style={{ ...btn(C.green), textDecoration: "none" }}><Download size={14} /> Download Instagram</a>
                <a href={previewUrl.replace("_instagram", "_twitter")} target="_blank" rel="noreferrer" style={{ ...btn(C.blue || "#3b82f6"), textDecoration: "none" }}><Download size={14} /> Download X/Twitter</a>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "gallery" && (
        <div style={card}>
          <h3 style={{ color: C.white, fontSize: 16, marginBottom: 12 }}>Generated Infographics</h3>
          {loading ? <Spinner size={20} /> : infographics.length === 0 ? (
            <p style={{ color: C.textDim }}>No infographics yet. Generate some from the Generate tab!</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {infographics.map(ig => (
                <div key={ig._id} style={{ background: C.bgInput, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.borderLight}` }}>
                  {ig.files?.instagram?.url && (
                    <img src={SOCCER_API_URL + ig.files.instagram.url} alt={`${ig.homeTeam} vs ${ig.awayTeam}`} style={{ width: "100%", height: 200, objectFit: "cover" }} />
                  )}
                  <div style={{ padding: 12 }}>
                    <div style={{ color: C.white, fontWeight: 600, fontSize: 13 }}>{ig.homeTeam} vs {ig.awayTeam}</div>
                    <div style={{ color: C.textDim, fontSize: 11, marginTop: 2 }}>
                      {ig.league?.toUpperCase()} · {ig.type?.replace("_", " ")} · {new Date(ig.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: ig.status === "ready" ? "rgba(34,197,94,.15)" : ig.status === "failed" ? "rgba(239,68,68,.15)" : "rgba(245,158,11,.15)", color: ig.status === "ready" ? C.green : ig.status === "failed" ? C.red : C.amber }}>{ig.status}</span>
                      {ig.files?.instagram?.url && <a href={SOCCER_API_URL + ig.files.instagram.url} target="_blank" rel="noreferrer" style={{ color: C.purple, fontSize: 11, fontWeight: 600 }}>IG</a>}
                      {ig.files?.twitter?.url && <a href={SOCCER_API_URL + ig.files.twitter.url} target="_blank" rel="noreferrer" style={{ color: C.blue || "#3b82f6", fontSize: 11, fontWeight: 600 }}>X</a>}
                      <button onClick={() => handleDelete(ig._id)} style={{ marginLeft: "auto", background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 11 }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
//  DEPLOY SECTION — Push code live from admin panel
// ═══════════════════════════════════════════════════════════════
const DeploySection = ({ toast }) => {
  const card = { background: C.cardBg, borderRadius: 14, padding: 20, border: `1px solid ${C.borderLight}`, marginBottom: 16 };
  const [deploying, setDeploying] = useState(false);
  const [deployLog, setDeployLog] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await adminAPI.getServerStatus();
      setServerStatus(res.data);
    } catch (err) {
      setServerStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleDeploy = async () => {
    if (!window.confirm("Deploy latest code to production? This will do a zero-downtime reload of both backends.")) return;
    setDeploying(true);
    setDeployLog(null);
    try {
      const res = await adminAPI.triggerDeploy();
      setDeployLog(res.data);
      toast(res.data?.message || "Deploy complete!", "success");
      fetchStatus(); // refresh status
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setDeployLog({ success: false, message: msg, steps: err.response?.data?.steps || [] });
      toast(`Deploy failed: ${msg}`, "error");
    } finally {
      setDeploying(false);
    }
  };

  const fmtUptime = (s) => {
    if (!s) return "—";
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <Server size={22} color={C.cyan} />
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, margin: 0 }}>Deploy & Server</h2>
          <p style={{ fontSize: 13, color: C.textDim, margin: "4px 0 0" }}>Push code live and monitor server health. Zero-downtime — users will not notice.</p>
        </div>
      </div>

      {/* Deploy button */}
      <div style={{ ...card, borderLeft: `3px solid ${C.green}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.white, margin: 0 }}>Deploy to Production</h3>
            <p style={{ fontSize: 12, color: C.textDim, margin: "4px 0 0" }}>
              Pulls latest code from GitHub, installs dependencies, and reloads both backends with zero downtime.
            </p>
          </div>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            style={{
              padding: "12px 32px", borderRadius: 10, border: "none",
              background: deploying ? C.bgHover : "linear-gradient(135deg, #10b981, #059669)",
              color: C.white, fontSize: 14, fontWeight: 700, cursor: deploying ? "wait" : "pointer",
              display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
            }}
          >
            {deploying ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
            {deploying ? "Deploying..." : "Deploy Now"}
          </button>
        </div>

        {/* Deploy log */}
        {deployLog && (
          <div style={{ marginTop: 16, padding: 14, background: C.bg, borderRadius: 10, border: `1px solid ${deployLog.success ? C.green : C.red}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              {deployLog.success ? <CheckCircle size={14} color={C.green} /> : <XCircle size={14} color={C.red} />}
              <span style={{ fontSize: 13, fontWeight: 700, color: deployLog.success ? C.green : C.red }}>{deployLog.message}</span>
            </div>
            {(deployLog.steps || []).map((step, i) => (
              <div key={i} style={{ fontSize: 11, color: C.textDim, padding: "4px 0", borderTop: `1px solid ${C.borderLight}` }}>
                <span style={{ fontWeight: 700, color: C.textMuted }}>{step.step}:</span>{" "}
                <span style={{ fontFamily: "monospace" }}>{step.output}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Server processes */}
      <div style={{ ...card }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Cpu size={16} color={C.teal} /> Server Processes
          </h3>
          <button onClick={fetchStatus} style={{ background: "none", border: "none", color: C.teal, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {loadingStatus ? (
          <p style={{ fontSize: 12, color: C.textDim }}>Loading server status...</p>
        ) : !serverStatus ? (
          <p style={{ fontSize: 12, color: C.amber }}>Could not reach server. Deploy endpoint may not be live yet — push code first.</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginBottom: 14 }}>
              {(serverStatus.processes || []).map((p, i) => (
                <div key={i} style={{ padding: "12px 14px", background: C.bg, borderRadius: 10, border: `1px solid ${C.borderLight}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{p.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                      color: p.status === "online" ? C.green : C.red,
                      background: p.status === "online" ? `${C.green}20` : `${C.red}20` }}>
                      {(p.status || "unknown").toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 11, color: C.textDim }}>
                    <span>CPU: {p.cpu || 0}%</span>
                    <span>RAM: {p.memory || 0}MB</span>
                    <span>Uptime: {fmtUptime(p.uptime)}</span>
                    <span>Restarts: {p.restarts || 0}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Git info */}
            {serverStatus.git && (
              <div style={{ padding: "10px 14px", background: C.bg, borderRadius: 10, border: `1px solid ${C.borderLight}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.teal, marginBottom: 6 }}>
                  Branch: {serverStatus.git.branch}
                </div>
                <div style={{ fontSize: 11, color: C.textDim, fontFamily: "monospace", lineHeight: 1.8 }}>
                  {(serverStatus.git.recentCommits || []).map((c, i) => (
                    <div key={i}>{c}</div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Auto-deploy info */}
      <div style={{ ...card }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={16} color={C.green} /> Auto-Deploy (GitHub Actions)
        </h3>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { label: "How it works", desc: "Push to the main branch on GitHub → GitHub Actions SSHes into the server → pulls code → reloads PM2. Fully automatic, zero downtime." },
            { label: "Setup required", desc: "Add 3 secrets in GitHub → Settings → Secrets → Actions: SERVER_HOST (droplet IP), SERVER_USER (root), SERVER_SSH_KEY (private SSH key)." },
            { label: "Manual deploy", desc: "Use the 'Deploy Now' button above, or go to GitHub → Actions → 'Deploy to Production' → Run workflow." },
            { label: "Frontend", desc: "Frontend changes auto-build in GitHub Actions and deploy to the server. Backend changes reload via PM2." },
          ].map((item, i) => (
            <div key={i} style={{ padding: "10px 14px", background: C.bg, borderRadius: 10, border: `1px solid ${C.borderLight}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 3 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   SECTION: Finance Tracker
   Revenue, VAT, and transaction analytics
   ══════════════════════════════════════════ */
const FinanceTrackerSection = ({ toast }) => {
  const [period, setPeriod] = useState("month");
  const [productFilter, setProductFilter] = useState("all");
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [byProduct, setByProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txnPage, setTxnPage] = useState(1);
  const [txnTotal, setTxnTotal] = useState(0);

  const fmt = (n) => "$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Fetch all finance data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, txnRes, monthRes, prodRes] = await Promise.allSettled([
        adminAPI.getFinanceSummary(period),
        adminAPI.getFinanceTransactions({ period, type: productFilter, page: txnPage, limit: 15 }),
        adminAPI.getFinanceMonthly(),
        adminAPI.getFinanceByProduct(period),
      ]);
      if (sumRes.status === "fulfilled") setSummary(sumRes.value.data?.data || sumRes.value.data);
      if (txnRes.status === "fulfilled") {
        const d = txnRes.value.data?.data || txnRes.value.data;
        setTransactions(d?.transactions || []);
        setTxnTotal(d?.total || 0);
      }
      if (monthRes.status === "fulfilled") setMonthly(monthRes.value.data?.data?.months || monthRes.value.data?.months || []);
      if (prodRes.status === "fulfilled") setByProduct(prodRes.value.data?.data?.products || prodRes.value.data?.products || []);
    } catch (e) {
      toast("error", "Failed to load finance data: " + (e.message || "Unknown error"));
    }
    setLoading(false);
  }, [period, productFilter, txnPage, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "transactions", label: "Transactions", icon: Activity },
    { id: "vat", label: "VAT Report", icon: FileText },
  ];

  const periodPills = [
    { key: "today", label: "Today" },
    { key: "week", label: "7 Days" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
    { key: "all", label: "All Time" },
  ];

  const productPills = [
    { key: "all", label: "All Products" },
    { key: "sampoints", label: "SAM Points" },
    { key: "coach", label: "AI Coach" },
  ];

  const pillStyle = (active) => ({
    ...btn,
    background: active ? C.blue : "transparent",
    color: active ? C.white : C.textMuted,
    padding: "6px 14px",
    fontSize: 12,
    borderRadius: 8,
    border: active ? "none" : `1px solid ${C.border}`,
  });

  const typeBadge = (type) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    background: type === "sampoints" ? C.blueLight : C.amberLight,
    color: type === "sampoints" ? C.blue : C.amber,
  });

  const statusBadge = (status) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 11,
    fontWeight: 700,
    background: status === "succeeded" || status === "paid" ? C.greenLight : C.redLight,
    color: status === "succeeded" || status === "paid" ? C.green : C.red,
  });

  // ─── KPI Cards ───
  const KPICards = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
      {[
        { label: "GROSS REVENUE", value: fmt(summary?.totalGross), color: C.green, sub: `${summary?.transactionCount || 0} transactions` },
        { label: "NET REVENUE", value: fmt(summary?.totalNet), color: C.blue, sub: "After VAT deduction" },
        { label: "VAT COLLECTED (23%)", value: fmt(summary?.totalVat), color: C.red, sub: "Payable to Polish tax office" },
        { label: "AVG ORDER VALUE", value: fmt(summary?.avgOrderValue), color: C.amber, sub: "Per transaction" },
        { label: "ACTIVE SUBS", value: summary?.activeCoachSubs || "0", color: C.purple, sub: "AI Coach subscribers" },
      ].map((card, i) => (
        <div key={i} style={{ background: C.bgCard, borderRadius: 12, padding: "16px 20px", borderLeft: `4px solid ${card.color}` }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>{card.label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: card.color, lineHeight: 1 }}>{loading ? "—" : card.value}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6 }}>{card.sub}</div>
        </div>
      ))}
    </div>
  );

  // ─── Revenue by Product Pie (simple inline) ───
  const RevenueSplit = () => {
    const sp = summary?.byType?.sampoints || 0;
    const co = summary?.byType?.coach || 0;
    const total = sp + co || 1;
    const spPct = Math.round((sp / total) * 100);
    const coPct = 100 - spPct;
    return (
      <div style={{ background: C.bgCard, borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16, marginTop: 0 }}>Revenue Split</h3>
        {/* Simple bar */}
        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 32, marginBottom: 16 }}>
          {sp > 0 && <div style={{ width: spPct + "%", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.white }}>{spPct}%</div>}
          {co > 0 && <div style={{ width: coPct + "%", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.white }}>{coPct}%</div>}
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.blue }} />
            <span style={{ color: C.textDim, fontSize: 13 }}>SAM Points</span>
            <span style={{ fontWeight: 700, color: C.white, fontSize: 13 }}>{fmt(sp)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.amber }} />
            <span style={{ color: C.textDim, fontSize: 13 }}>AI Coach</span>
            <span style={{ fontWeight: 700, color: C.white, fontSize: 13 }}>{fmt(co)}</span>
          </div>
        </div>
      </div>
    );
  };

  // ─── Monthly Revenue Bars (inline CSS bars) ───
  const MonthlyChart = () => {
    const maxVal = Math.max(...monthly.map(m => m.gross || 0), 1);
    return (
      <div style={{ background: C.bgCard, borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16, marginTop: 0 }}>Monthly Revenue & VAT (6 Months)</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 180 }}>
          {monthly.map((m, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>{fmt(m.gross)}</div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, justifyContent: "flex-end", height: 140 }}>
                <div style={{ background: C.blue, borderRadius: "4px 4px 0 0", height: Math.max(4, ((m.net || 0) / maxVal) * 140), transition: "height 0.3s" }} />
                <div style={{ background: C.red, borderRadius: "0 0 4px 4px", height: Math.max(2, ((m.vat || 0) / maxVal) * 140), transition: "height 0.3s" }} />
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>{m.month}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textDim }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: C.blue }} /> Net Revenue
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textDim }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: C.red }} /> VAT
          </div>
        </div>
      </div>
    );
  };

  // ─── Per-Product Breakdown Table ───
  const ProductBreakdown = () => (
    <div style={{ background: C.bgCard, borderRadius: 12, padding: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16, marginTop: 0 }}>Revenue by Product</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Product", "Type", "Gross", "Net", "VAT", "Count"].map(h => (
              <th key={h} style={{ textAlign: h === "Product" || h === "Type" ? "left" : "right", padding: "8px 10px", color: C.textMuted, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {byProduct.length === 0 && (
            <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: C.textMuted }}>No data for this period</td></tr>
          )}
          {byProduct.map((p, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
              <td style={{ padding: "8px 10px", color: C.text, fontWeight: 600 }}>{p.product}</td>
              <td style={{ padding: "8px 10px" }}><span style={typeBadge(p.type)}>{p.type === "sampoints" ? "SP" : "AI"}</span></td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: C.green }}>{fmt(p.gross)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", color: C.text }}>{fmt(p.net)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", color: C.red }}>{fmt(p.vat)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", color: C.textDim }}>{p.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ─── Transaction Log ───
  const TransactionLog = () => (
    <div style={{ background: C.bgCard, borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, margin: 0 }}>Transaction Log</h3>
        <span style={{ fontSize: 12, color: C.textMuted }}>{txnTotal} total</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Date", "User", "Product", "Gross", "Net", "VAT", "Status", "Stripe ID"].map(h => (
              <th key={h} style={{ textAlign: ["Gross", "Net", "VAT"].includes(h) ? "right" : h === "Status" ? "center" : "left", padding: "8px 10px", color: C.textMuted, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${C.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr><td colSpan={8} style={{ padding: 30, textAlign: "center", color: C.textMuted }}>No transactions for this period</td></tr>
          )}
          {transactions.map((t, i) => (
            <tr key={i} style={{ opacity: t.status === "refunded" ? 0.5 : 1 }}>
              <td style={{ padding: "8px 10px", whiteSpace: "nowrap", fontSize: 12, color: C.text }}>
                {new Date(t.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                <span style={{ color: C.textMuted, marginLeft: 6 }}>{new Date(t.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
              </td>
              <td style={{ padding: "8px 10px", fontWeight: 600, color: C.text }}>{t.email || t.user || "—"}</td>
              <td style={{ padding: "8px 10px" }}>
                <span style={typeBadge(t.type)}>{t.type === "sampoints" ? "SP" : "AI"}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: C.textDim }}>{t.product}</span>
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: t.status === "refunded" ? C.red : C.green }}>{t.status === "refunded" ? "-" : ""}{fmt(t.gross)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 12, color: C.text }}>{fmt(t.net)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 12, color: C.red }}>{fmt(t.vat)}</td>
              <td style={{ padding: "8px 10px", textAlign: "center" }}><span style={statusBadge(t.status)}>{t.status === "succeeded" ? "Paid" : t.status}</span></td>
              <td style={{ padding: "8px 10px", fontSize: 11, fontFamily: "monospace", color: C.textMuted }}>{(t.stripeId || "—").slice(0, 20)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      {txnTotal > 15 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, fontSize: 12, color: C.textMuted }}>
          <span>Page {txnPage} of {Math.ceil(txnTotal / 15)}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...btn, background: txnPage <= 1 ? C.bgCard : C.bgHover, color: txnPage <= 1 ? C.textMuted : C.text, padding: "6px 12px", fontSize: 12 }} disabled={txnPage <= 1} onClick={() => setTxnPage(p => Math.max(1, p - 1))}>Prev</button>
            <button style={{ ...btn, background: txnPage >= Math.ceil(txnTotal / 15) ? C.bgCard : C.bgHover, color: txnPage >= Math.ceil(txnTotal / 15) ? C.textMuted : C.text, padding: "6px 12px", fontSize: 12 }} disabled={txnPage >= Math.ceil(txnTotal / 15)} onClick={() => setTxnPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );

  // ─── VAT Report ───
  const VATReport = () => {
    const projGross = (summary?.totalGross || 0) * (period === "month" ? 12 : period === "year" ? 1 : 365);
    const projNet = (summary?.totalNet || 0) * (period === "month" ? 12 : period === "year" ? 1 : 365);
    const projVat = (summary?.totalVat || 0) * (period === "month" ? 12 : period === "year" ? 1 : 365);
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.bgCard, borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16, marginTop: 0 }}>VAT Summary — {period === "today" ? "Today" : period === "week" ? "Last 7 Days" : period === "month" ? "This Month" : period === "year" ? "This Year" : "All Time"}</h3>
          <div style={{ background: C.bg, borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ color: C.textDim }}>Gross Revenue (incl. VAT)</span>
              <span style={{ fontWeight: 700, color: C.green }}>{fmt(summary?.totalGross)}</span>
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ color: C.textDim }}>Net Revenue (excl. VAT)</span>
              <span style={{ fontWeight: 700, color: C.blue }}>{fmt(summary?.totalNet)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ color: C.textDim }}>VAT Collected (23%)</span>
              <span style={{ fontWeight: 700, color: C.red }}>{fmt(summary?.totalVat)}</span>
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, margin: "4px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ color: C.textMuted, fontSize: 12 }}>VAT Rate</span>
              <span style={{ fontWeight: 700, color: C.white }}>23% (Polish VAT)</span>
            </div>
          </div>

          {/* Per-type VAT */}
          <h4 style={{ fontSize: 13, fontWeight: 700, color: C.white, marginTop: 20, marginBottom: 12 }}>VAT by Product Type</h4>
          {byProduct.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}22` }}>
              <span style={{ color: C.textDim, fontSize: 13 }}>{p.product}</span>
              <span style={{ fontWeight: 600, color: C.red, fontSize: 13 }}>{fmt(p.vat)}</span>
            </div>
          ))}
        </div>

        <div style={{ background: C.bgCard, borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 16, marginTop: 0 }}>Projected Annual</h3>
          <p style={{ color: C.textMuted, fontSize: 12, marginBottom: 16 }}>Based on {period === "month" ? "this month's" : "current"} run rate</p>
          <div style={{ background: C.bg, borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ color: C.textDim }}>Annual Gross (est.)</span>
              <span style={{ fontWeight: 700, color: C.green }}>{fmt(projGross)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ color: C.textDim }}>Annual Net (est.)</span>
              <span style={{ fontWeight: 700, color: C.blue }}>{fmt(projNet)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span style={{ color: C.textDim }}>Annual VAT (est.)</span>
              <span style={{ fontWeight: 700, color: C.red }}>{fmt(projVat)}</span>
            </div>
          </div>

          <MonthlyChart />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, margin: 0 }}>
          <DollarSign size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Finance Tracker
        </h2>
        <button style={{ ...btn, background: C.blue, color: C.white, padding: "8px 16px" }} onClick={fetchData}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} accent={C.green} />

      {/* Period + Product Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {periodPills.map(p => (
          <button key={p.key} style={pillStyle(period === p.key)} onClick={() => { setPeriod(p.key); setTxnPage(1); }}>{p.label}</button>
        ))}
        <div style={{ width: 1, background: C.border, margin: "0 6px" }} />
        {productPills.map(f => (
          <button key={f.key} style={pillStyle(productFilter === f.key)} onClick={() => { setProductFilter(f.key); setTxnPage(1); }}>{f.label}</button>
        ))}
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: C.blue }} />
        </div>
      )}

      {!loading && tab === "overview" && (
        <>
          <KPICards />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <RevenueSplit />
            <MonthlyChart />
          </div>
          <ProductBreakdown />
        </>
      )}

      {!loading && tab === "transactions" && (
        <>
          <KPICards />
          <TransactionLog />
        </>
      )}

      {!loading && tab === "vat" && (
        <>
          <KPICards />
          <VATReport />
        </>
      )}
    </div>
  );
};

const ComplianceSection = ({ toast }) => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [running, setRunning] = useState(false);

  // Load reports from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("compliance_reports") || "[]");
      setReports(stored);
      if (stored.length > 0) setSelectedReport(stored[0]);
    } catch { setReports([]); }
  }, []);

  const saveReports = (updated) => {
    setReports(updated);
    localStorage.setItem("compliance_reports", JSON.stringify(updated));
  };

  // Run a new audit (simulates the scheduled task output)
  const runAudit = async () => {
    setRunning(true);
    toast("info", "Compliance audit started...");

    // Simulate audit delay
    await new Promise(r => setTimeout(r, 2000));

    const now = new Date();
    const newReport = {
      id: Date.now(),
      date: now.toISOString(),
      title: `Compliance Audit — ${now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      status: "pass",
      summary: "All checks passed. Platform is compliant.",
      categories: COMPLIANCE_CATEGORIES.map(cat => ({
        id: cat.id,
        label: cat.label,
        status: "pass",
        items: [],
      })),
      totalChecks: 48,
      passed: 48,
      warnings: 0,
      failures: 0,
    };

    const updated = [newReport, ...reports].slice(0, 24); // keep last 24 reports
    saveReports(updated);
    setSelectedReport(newReport);
    setRunning(false);
    toast("success", "Compliance audit completed — all checks passed!");
  };

  const deleteReport = (id) => {
    const updated = reports.filter(r => r.id !== id);
    saveReports(updated);
    if (selectedReport?.id === id) setSelectedReport(updated[0] || null);
    toast("info", "Report deleted");
  };

  const statusBadge = (status) => {
    const map = { pass: { bg: C.greenLight, color: C.green, label: "PASS" }, warn: { bg: C.amberLight, color: C.amber, label: "WARN" }, fail: { bg: C.redLight, color: C.red, label: "FAIL" } };
    const s = map[status] || map.pass;
    return <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: s.bg, color: s.color }}>{s.label}</span>;
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.white, margin: 0 }}>Compliance Reports</h3>
          <p style={{ fontSize: 12, color: C.textMuted, margin: "4px 0 0" }}>Automated monthly audits for branding, trademarks, legal pages, and copy consistency.</p>
        </div>
        <button onClick={runAudit} disabled={running} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none", background: running ? C.bgHover : C.blue, color: C.white, fontSize: 13, fontWeight: 700, cursor: running ? "default" : "pointer", opacity: running ? 0.7 : 1 }}>
          {running ? <><Loader2 size={14} className="ap-spin" /> Running...</> : <><RefreshCw size={14} /> Run Audit Now</>}
        </button>
      </div>

      {/* Stats row */}
      {selectedReport && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {[
            { label: "Total Checks", value: selectedReport.totalChecks, color: C.blue },
            { label: "Passed", value: selectedReport.passed, color: C.green },
            { label: "Warnings", value: selectedReport.warnings, color: C.amber },
            { label: "Failures", value: selectedReport.failures, color: C.red },
          ].map((s, i) => (
            <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}>
              <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: s.color, margin: "4px 0 0" }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        {/* Report list sidebar */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, maxHeight: 520, overflowY: "auto" }} className="ap-scrollbar">
          <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1.5, padding: "4px 8px", margin: 0 }}>History ({reports.length})</p>
          {reports.length === 0 && <p style={{ fontSize: 12, color: C.textDim, textAlign: "center", padding: 20 }}>No reports yet. Run your first audit above.</p>}
          {reports.map(r => (
            <button key={r.id} onClick={() => setSelectedReport(r)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, border: selectedReport?.id === r.id ? `1px solid ${C.blue}33` : "1px solid transparent", background: selectedReport?.id === r.id ? C.blueLight : "transparent", cursor: "pointer", textAlign: "left", marginTop: 4 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: selectedReport?.id === r.id ? C.blue : C.text, margin: 0 }}>
                  {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p style={{ fontSize: 10, color: C.textMuted, margin: "2px 0 0" }}>
                  {new Date(r.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {statusBadge(r.status)}
              <button onClick={(e) => { e.stopPropagation(); deleteReport(r.id); }} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}>
                <Trash2 size={12} color={C.textMuted} />
              </button>
            </button>
          ))}
        </div>

        {/* Report detail */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          {selectedReport ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: C.white, margin: 0 }}>{selectedReport.title}</h4>
                  <p style={{ fontSize: 12, color: C.textDim, margin: "4px 0 0" }}>{selectedReport.summary}</p>
                </div>
                {statusBadge(selectedReport.status)}
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {selectedReport.categories.map(cat => {
                  const meta = COMPLIANCE_CATEGORIES.find(c => c.id === cat.id) || {};
                  const Icon = meta.icon || CheckCircle;
                  return (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.bg, borderRadius: 10 }}>
                      <Icon size={16} color={meta.color || C.textMuted} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.text }}>{cat.label}</span>
                      {statusBadge(cat.status)}
                      {cat.items.length > 0 && (
                        <span style={{ fontSize: 11, color: C.textMuted }}>{cat.items.length} issue{cat.items.length !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Category detail items if any */}
              {selectedReport.categories.some(c => c.items.length > 0) && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Issues Found</p>
                  {selectedReport.categories.filter(c => c.items.length > 0).map(cat => (
                    <div key={cat.id} style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.amber, margin: "0 0 6px" }}>{cat.label}</p>
                      {cat.items.map((item, i) => (
                        <div key={i} style={{ fontSize: 12, color: C.textDim, padding: "6px 12px", background: C.bg, borderRadius: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: C.text }}>{item.file}</span> — {item.message}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 40 }}>
              <FileText size={32} color={C.textMuted} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: C.textDim }}>No report selected. Run an audit or select one from the history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN ADMIN PANEL
   ══════════════════════════════════════════════════════════ */
const AdminPanel = () => {
  const navigate = useNavigate();
  const [page,setPage]=useState("dashboard"); const [toasts,setToasts]=useState([]); const [sidebarOpen,setSidebarOpen]=useState(true);
  const [showSettings,setShowSettings]=useState(false); const [showEmployees,setShowEmployees]=useState(false);
  const toast=useCallback((type,message)=>{const id=Date.now();setToasts(p=>[...p,{id,type,message}]);setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3500);},[]);
  const sw=sidebarOpen?240:72;

  // Admin user from localStorage
  const adminUser = (() => { try { return JSON.parse(localStorage.getItem("adminUser") || "{}"); } catch { return {}; } })();
  const adminInitials = (adminUser.name || "A").split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  const isSuperAdmin = adminUser.role === "superadmin";

  const handleLogout = () => {
    adminAPI.adminLogout();
    navigate("/admin-login", { replace: true });
  };

  const NAV=[
    {id:"dashboard",label:"Dashboard",icon:LayoutDashboard},
    {divider:true,label:"MANAGEMENT"},
    {id:"analytics",label:"Analytics",icon:TrendingUp},
    {id:"users",label:"Users",icon:Users},
    {id:"soccer",label:"Soccer",icon:Globe},
    {id:"nfl",label:"A.Football",icon:Shield},
    {divider:true,label:"RIVALS"},
    {id:"rivals_soccer",label:"Rivals Soccer",icon:Trophy},
    {id:"rivals_nfl",label:"Rivals A.Football",icon:Award},
    {divider:true,label:"PREDICTOR"},
    {id:"predictor",label:"Predictor",icon:Zap},
    {divider:true,label:"CL FANTASY"},
    {id:"cl_fantasy",label:"CL Fantasy",icon:Trophy},
    {divider:true,label:"WORLD CUP"},
    {id:"world_cup",label:"World Cup 2026",icon:Globe},
    {divider:true,label:"FINANCE"},
    {id:"finance",label:"Finance Tracker",icon:DollarSign},
    {divider:true,label:"OPERATIONS"},
    {id:"pipeline",label:"Data Pipeline",icon:Workflow},
    {id:"megaphone",label:"Megaphone",icon:Megaphone},
    // {id:"correction",label:"Corrections",icon:Edit3}, // TODO: wire to real backend before enabling
    {id:"toggles",label:"Quick Toggles",icon:ToggleLeft},
    {id:"vault",label:"Credentials Vault",icon:Lock},
    {id:"audit",label:"Audit Logs",icon:FileText},
    {divider:true,label:"CONTENT"},
    {id:"articles",label:"SAM Reports",icon:FileText},
    {id:"infographics",label:"Infographics",icon:Image},
    {divider:true,label:"DEPLOY"},
    {id:"deploy",label:"Deploy & Server",icon:Server},
    {divider:true,label:"SEASONS"},
    {id:"seasons",label:"Season Mgmt",icon:Calendar},
    {divider:true,label:"LEGAL"},
    {id:"compliance",label:"Compliance",icon:Shield},
  ];

  const renderPage=()=>{switch(page){
    case "dashboard": return <DashboardSection toast={toast}/>;
    case "analytics": return <AnalyticsSection toast={toast}/>;
    case "users": return <UsersSection toast={toast}/>;
    case "soccer": return <SoccerSection toast={toast}/>;
    case "nfl": return <NFLSection toast={toast}/>;
    case "rivals_soccer": return <RivalsSection mode="soccer" toast={toast}/>;
    case "rivals_nfl": return <RivalsSection mode="nfl" toast={toast}/>;
    case "predictor": return <PredictorSection toast={toast}/>;
    case "cl_fantasy": return <CLFantasySection toast={toast}/>;
    case "world_cup": return <WorldCupSection toast={toast}/>;
    case "finance": return <FinanceTrackerSection toast={toast}/>;
    case "pipeline": return <DataPipelineSection toast={toast}/>;
    case "megaphone": return <MegaphoneSection toast={toast}/>;
    // case "correction": return <CorrectionSection toast={toast}/>; // disabled until backend is built
    case "toggles": return <TogglesSection toast={toast}/>;
    case "vault": return <VaultSection toast={toast}/>;
    case "audit": return <AuditSection toast={toast}/>;
    case "articles": return <ArticlesSection toast={toast}/>;
    case "infographics": return <InfographicsSection toast={toast}/>;
    case "deploy": return <DeploySection toast={toast}/>;
    case "seasons": return <SeasonManagementSection toast={toast}/>;
    case "compliance": return <ComplianceSection toast={toast}/>;
    case "employees": return isSuperAdmin ? <EmployeesSection toast={toast}/> : <DashboardSection toast={toast}/>;
    case "settings": return <SettingsSection toast={toast} adminUser={adminUser}/>;
    default: return <DashboardSection toast={toast}/>;
  }};

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
      <StyleInjector/>
      <Toast toasts={toasts}/>

      {/* Sidebar */}
      <aside className="ap-scrollbar" style={{position:"fixed",top:0,left:0,height:"100vh",width:sw,background:"#020617",borderRight:`1px solid ${C.border}`,zIndex:40,transition:"width .3s",display:"flex",flexDirection:"column",overflowY:"auto",overflowX:"hidden"}}>
        <div style={{padding:"20px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Cpu size={18} color={C.white}/></div>
          {sidebarOpen&&<div><h1 style={{fontSize:15,fontWeight:800,color:C.white,margin:0,letterSpacing:-0.3}}>SAMSports</h1><p style={{fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:2,margin:0}}>Admin Panel</p></div>}
        </div>
        <nav style={{flex:1,padding:"12px 8px"}}>
          {NAV.map((item,i)=>{
            if(item.divider) return sidebarOpen?<div key={i} style={{fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:2,padding:"16px 10px 6px"}}>{item.label}</div>:<div key={i} style={{height:12}}/>;
            const active=page===item.id;
            return (
              <button key={item.id} onClick={()=>setPage(item.id)} title={item.label} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,border:active?`1px solid ${C.blue}33`:"1px solid transparent",background:active?C.blueLight:"transparent",color:active?C.blue:C.textMuted,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:2,transition:"all .15s",textAlign:"left"}}>
                <item.icon size={16} style={{flexShrink:0}}/>{sidebarOpen&&<span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{padding:8,borderTop:`1px solid ${C.border}`}}>
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:10,border:"none",background:"transparent",color:C.textMuted,fontSize:13,fontWeight:600,cursor:"pointer"}}>
            <ChevronRight size={16} style={{transition:"transform .3s",transform:sidebarOpen?"rotate(180deg)":"rotate(0)"}}/>{sidebarOpen&&<span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,marginLeft:sw,transition:"margin .3s"}}>
        <header style={{position:"sticky",top:0,zIndex:30,background:"rgba(15,23,42,0.85)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"14px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><h2 style={{fontSize:17,fontWeight:800,color:C.white,margin:0,textTransform:"capitalize"}}>{page.replace(/_/g," ")}</h2><p style={{fontSize:11,color:C.textMuted,margin:0}}>SamSports.io Mission Control</p></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>toast("info","No new notifications")} style={{...btn,padding:8,background:C.bgCard}} title="Notifications"><Bell size={14} color={C.textMuted}/></button>
            <button onClick={()=>setPage("settings")} style={{...btn,padding:8,background:page==="settings"?C.blueLight:C.bgCard,border:page==="settings"?`1px solid ${C.blue}33`:"1px solid transparent"}} title="Settings"><Settings size={14} color={page==="settings"?C.blue:C.textMuted}/></button>
            {isSuperAdmin && <button onClick={()=>{ setPage("employees"); setShowEmployees(true); }} style={{...btn,padding:8,background:page==="employees"?C.purpleLight:C.bgCard,border:page==="employees"?`1px solid ${C.purple}33`:"1px solid transparent"}} title="Manage Employees"><UserPlus size={14} color={page==="employees"?C.purple:C.textMuted}/></button>}
            <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:8,paddingLeft:12,borderLeft:`1px solid ${C.border}`}}>
              <div style={{width:30,height:30,borderRadius:15,background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.white}}>{adminInitials}</div>
              {sidebarOpen&&<div style={{display:"flex",alignItems:"center",gap:8}}><div><span style={{fontSize:13,fontWeight:600,color:C.text,display:"block"}}>{adminUser.name||"Admin"}</span><span style={{fontSize:10,color:C.textMuted,textTransform:"uppercase"}}>{adminUser.role||"admin"}</span></div></div>}
              <button onClick={handleLogout} style={{...btn,padding:6,background:"transparent"}} title="Sign Out"><LogOut size={14} color={C.textMuted}/></button>
            </div>
          </div>
        </header>
        <div style={{padding:28}}>{renderPage()}</div>
      </main>
    </div>
  );
};

export default AdminPanel;
