"use client";

import React, { useState, useEffect } from 'react';

const MOCK_LOGS = [
  "[INFO] 2026-09-20 19:42:10 - HikariPool-1 - Start completed.",
  "[INFO] 2026-09-20 19:42:11 - Tomcat initialized with port(s): 8080 (http)",
  "[INFO] 2026-09-20 19:42:15 - Started GabEdtApplication in 4.123 seconds (process running for 4.5)",
  "[INFO] 2026-09-20 19:45:00 - User 'proviseur@leonmba.ga' logged in successfully. IP: 192.168.1.45",
  "[WARN] 2026-09-20 19:50:12 - High memory usage detected in Redis cache (85%)",
  "[ERROR] 2026-09-20 19:51:30 - Failed to send SMTP email to 'student@uob.ga'. Connection timeout.",
  "[INFO] 2026-09-20 19:55:01 - Scheduled task 'CleanupTempFiles' executed in 14ms.",
];

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Simulate streaming logs
    let currentIndex = 0;
    setLogs([MOCK_LOGS[0]]);
    
    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < MOCK_LOGS.length) {
        setLogs(prev => [...prev, MOCK_LOGS[currentIndex]]);
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 'var(--space-3xl)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
            Console des Journaux (Live)
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Supervisez les événements systèmes et applicatifs en temps réel.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" style={{ background: 'var(--surface)' }}>Exporter .log</button>
          <button className="btn btn-outline" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setLogs([])}>
            Clear
          </button>
        </div>
      </header>

      <div className="card" style={{ 
        flex: 1, 
        background: '#0F172A', 
        color: '#E2E8F0', 
        fontFamily: 'monospace', 
        padding: 'var(--space-lg)', 
        overflowY: 'auto',
        border: 'none',
        boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.2)'
      }}>
        {logs.map((log, i) => {
          let color = '#E2E8F0';
          if (log.includes('[ERROR]')) color = '#F87171'; // Red
          if (log.includes('[WARN]')) color = '#FBBF24'; // Yellow
          if (log.includes('[INFO]')) color = '#38BDF8'; // Blue

          return (
            <div key={i} style={{ marginBottom: '4px', lineHeight: 1.5, wordBreak: 'break-all' }}>
              <span style={{ color }}>{log.substring(0, 7)}</span>
              <span>{log.substring(7)}</span>
            </div>
          );
        })}
        <div className="animate-pulse" style={{ marginTop: '8px', color: '#94A3B8' }}>
          _ Attente de nouveaux logs...
        </div>
      </div>
    </div>
  );
}
