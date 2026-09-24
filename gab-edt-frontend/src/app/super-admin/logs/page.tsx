"use client";

import React, { useState, useEffect, useRef } from "react";

const INITIAL_LOGS = [
  { level: "INFO",  time: "20:46:28", msg: "BUILD SUCCESS — GAB-EDT Backend v2.5.0 déployé", src: "DeployService" },
  { level: "INFO",  time: "20:45:01", msg: "84 tests unitaires exécutés, 0 échec", src: "JUnit5Runner" },
  { level: "INFO",  time: "20:40:12", msg: "Utilisateur doyen@uob.ga connecté depuis 192.168.1.21", src: "AuthService" },
  { level: "WARN",  time: "20:31:44", msg: "Redis cache à 87% de capacité (seuil: 80%)", src: "CacheMonitor" },
  { level: "ERROR", time: "20:18:30", msg: "Échec SMTP vers student@uob.ga : Connection timeout après 30s", src: "MailService" },
  { level: "INFO",  time: "20:00:01", msg: "Tâche planifiée CleanupTempFiles exécutée en 14ms", src: "Scheduler" },
  { level: "INFO",  time: "19:55:00", msg: "HikariPool-1 — 8/20 connexions actives", src: "DBPool" },
  { level: "WARN",  time: "19:42:10", msg: "Tentative de connexion échouée pour user@fake.ga (IP: 41.222.5.8)", src: "SecurityFilter" },
];

const LIVE_LOGS = [
  { level: "INFO",  msg: "Nouvel accès API GET /api/v1/institutions", src: "AccessLog" },
  { level: "INFO",  msg: "Scheduling event créé pour ENS Libreville", src: "EventService" },
  { level: "WARN",  msg: "Temps de réponse élevé : GET /api/v1/stats 2340ms", src: "PerfMonitor" },
];

const LEVEL_CFG: Record<string, { color: string; bg: string; textColor: string }> = {
  INFO:  { color: "#38BDF8", bg: "#082f49", textColor: "#E0F2FE" },
  WARN:  { color: "#FBBF24", bg: "#422006", textColor: "#FEF3C7" },
  ERROR: { color: "#F87171", bg: "#450a0a", textColor: "#FEE2E2" },
};

export default function LogsPage() {
  const [logs, setLogs]         = useState(INITIAL_LOGS);
  const [filter, setFilter]     = useState("ALL");
  const [search, setSearch]     = useState("");
  const [streaming, setStreaming] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const liveIdx   = useRef(0);

  useEffect(() => {
    if (!streaming) return;
    const iv = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}:${now.getSeconds().toString().padStart(2,"0")}`;
      const entry = { ...LIVE_LOGS[liveIdx.current % LIVE_LOGS.length], time: timeStr };
      liveIdx.current++;
      setLogs(prev => [entry, ...prev].slice(0, 80));
    }, 3500);
    return () => clearInterval(iv);
  }, [streaming]);

  const filtered = logs.filter(l =>
    (filter === "ALL" || l.level === filter) &&
    (l.msg.toLowerCase().includes(search.toLowerCase()) || l.src.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "var(--space-3xl)", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <header style={{ marginBottom: "var(--space-lg)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>Console des Journaux Système</h1>
          <p style={{ color: "var(--text-secondary)" }}>Supervisez les événements applicatifs en temps réel.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setStreaming(s => !s)} className={streaming ? "btn btn-primary" : "btn btn-outline"} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>{streaming ? "pause" : "play_arrow"}</span>
            {streaming ? "Pause" : "Live"}
          </button>
          <button onClick={() => setLogs([])} className="btn btn-outline" style={{ color: "#DC2626", borderColor: "#DC2626" }}>
            Clear
          </button>
          <button className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>download</span>
            Export
          </button>
        </div>
      </header>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "var(--space-md)", flexShrink: 0 }}>
        {["ALL","INFO","WARN","ERROR"].map(level => (
          <button key={level} onClick={() => setFilter(level)} style={{
            padding: "5px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", border: "1px solid",
            background: filter === level ? (level === "ERROR" ? "#FEF2F2" : level === "WARN" ? "#FFFBEB" : level === "INFO" ? "#EFF6FF" : "var(--primary-light)") : "var(--background)",
            color: filter === level ? (level === "ERROR" ? "#DC2626" : level === "WARN" ? "#B45309" : level === "INFO" ? "#2563EB" : "var(--primary)") : "var(--text-muted)",
            borderColor: filter === level ? "currentColor" : "var(--border)",
          }}>
            {level} {level !== "ALL" && <span>({logs.filter(l => l.level === level).length})</span>}
          </button>
        ))}
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrer les messages..."
          style={{ flex: 1, padding: "5px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.85rem", outline: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: streaming ? "#16A34A" : "var(--text-muted)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: streaming ? "#16A34A" : "#94A3B8", animation: streaming ? "pulse 2s infinite" : "none" }} />
          {streaming ? "LIVE" : "PAUSED"}
        </div>
      </div>

      {/* Console */}
      <div style={{ flex: 1, background: "#0F172A", borderRadius: "12px", fontFamily: "'Courier New', monospace", padding: "16px", overflowY: "auto", minHeight: 0 }}>
        {filtered.length === 0 ? (
          <div style={{ color: "#64748B", textAlign: "center", paddingTop: "40px" }}>Aucun log correspondant au filtre.</div>
        ) : (
          filtered.map((log, i) => {
            const cfg = LEVEL_CFG[log.level] || LEVEL_CFG.INFO;
            return (
              <div key={i} style={{ display: "flex", gap: "12px", padding: "4px 0", borderBottom: "1px solid #1E293B", lineHeight: 1.5, fontSize: "0.83rem" }}>
                <span style={{ color: "#64748B", flexShrink: 0, minWidth: "60px" }}>{log.time}</span>
                <span style={{ background: cfg.bg, color: cfg.color, padding: "0 6px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700, flexShrink: 0, alignSelf: "center", minWidth: "44px", textAlign: "center" }}>
                  {log.level}
                </span>
                <span style={{ color: "#94A3B8", flexShrink: 0, minWidth: "120px", fontSize: "0.78rem" }}>[{log.src}]</span>
                <span style={{ color: cfg.textColor, flex: 1, wordBreak: "break-word" }}>{log.msg}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
        {streaming && (
          <div style={{ color: "#475569", marginTop: "8px", fontSize: "0.8rem" }}>
            <span style={{ animation: "pulse 1.5s infinite" }}>▌</span> En attente de nouveaux événements...
          </div>
        )}
      </div>
    </div>
  );
}
