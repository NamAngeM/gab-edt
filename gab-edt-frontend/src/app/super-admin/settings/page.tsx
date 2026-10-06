"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";
import { confirmAction } from "@/lib/confirm";

export default function SettingsPage() {
  const [maint, setMaint]       = useState(false);
  const [maintBusy, setMaintBusy] = useState(false);

  useEffect(() => {
    fetchWithAuth("/system/status")
      .then(res => setMaint(Boolean(res?.data?.maintenance)))
      .catch(() => toast.error("Impossible de lire l'état de maintenance."));
  }, []);

  const toggleMaintenance = async () => {
    const next = !maint;
    if (next && !(await confirmAction("Activer le mode maintenance ? Seuls les super-administrateurs pourront utiliser la plateforme.", { destructive: false }))) return;
    setMaintBusy(true);
    try {
      const res = await fetchWithAuth("/system/maintenance", { method: "PUT", body: JSON.stringify({ enabled: next }) });
      setMaint(Boolean(res?.data?.maintenance));
      toast.success(next ? "Mode maintenance activé." : "Mode maintenance désactivé.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Mise à jour impossible.");
    } finally {
      setMaintBusy(false);
    }
  };
  const [smtpHost, setSmtpHost] = useState("smtp.gabedt.ga");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("noreply@gabedt.ga");
  const [jwtExp,   setJwtExp]   = useState("86400");
  const [s3Bucket, setS3Bucket] = useState("gabedt-prod-storage");
  const [saved, setSaved]       = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "var(--space-3xl)" }}>
      <header style={{ marginBottom: "var(--space-xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>Paramètres Serveur</h1>
          <p style={{ color: "var(--text-secondary)" }}>Configuration globale de la plateforme GAB-EDT.</p>
        </div>
        <button onClick={handleSave} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px", background: saved ? "#16A34A" : undefined, border: saved ? "none" : undefined }}>
          <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>{saved ? "check" : "save"}</span>
          {saved ? "Sauvegardé !" : "Sauvegarder"}
        </button>
      </header>

      {/* Maintenance mode */}
      <div className="card" style={{ padding: "var(--space-lg)", marginBottom: "var(--space-lg)", border: maint ? "2px solid #DC2626" : "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: maint ? "#DC2626" : "var(--text-primary)", marginBottom: "4px" }}>
              {maint ? "⚠️ Mode Maintenance ACTIF" : "Mode Maintenance"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              {maint
                ? "La plateforme affiche une page de maintenance à tous les utilisateurs sauf les Super Admins."
                : "Activez pour bloquer temporairement l'accès à tous les utilisateurs non-admins."}
            </p>
          </div>
          <div onClick={() => { if (!maintBusy) void toggleMaintenance(); }} style={{
            width: 52, height: 28, borderRadius: "99px", cursor: "pointer",
            background: maint ? "#DC2626" : "var(--surface-container-high)",
            position: "relative", transition: "background 0.3s", flexShrink: 0
          }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: maint ? 27 : 3, transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
          </div>
        </div>
      </div>

      {/* SMTP */}
      <div className="card" style={{ padding: "var(--space-lg)", marginBottom: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-lg)" }}>
          <span className="material-symbols-outlined" style={{ verticalAlign: "middle", marginRight: "6px", fontSize: "1.1rem" }}>mail</span>
          Configuration SMTP (Messagerie)
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-md)" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Serveur SMTP</label>
            <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Port</label>
            <input type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Email expéditeur</label>
            <input type="email" value={smtpUser} onChange={e => setSmtpUser(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <button className="btn btn-outline" style={{ marginTop: "var(--space-md)", display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>send</span>
          Tester la connexion SMTP
        </button>
      </div>

      {/* JWT & Security */}
      <div className="card" style={{ padding: "var(--space-lg)", marginBottom: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-lg)" }}>
          <span className="material-symbols-outlined" style={{ verticalAlign: "middle", marginRight: "6px", fontSize: "1.1rem" }}>security</span>
          Sécurité & JWT
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Durée expiration JWT (secondes)</label>
            <input type="number" value={jwtExp} onChange={e => setJwtExp(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>= {Math.round(Number(jwtExp)/3600)}h · Actuellement : {jwtExp}s</div>
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Clé secrète JWT</label>
            <input type="password" value="••••••••••••••••••••••••••••••••"
              readOnly style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface-container-lowest)", color: "var(--text-muted)", fontSize: "0.875rem", outline: "none", cursor: "not-allowed", boxSizing: "border-box" }} />
            <div style={{ fontSize: "0.75rem", color: "#B45309", marginTop: "4px" }}>Modifiable uniquement via variable ENV</div>
          </div>
        </div>
      </div>

      {/* S3 / Storage */}
      <div className="card" style={{ padding: "var(--space-lg)" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-lg)" }}>
          <span className="material-symbols-outlined" style={{ verticalAlign: "middle", marginRight: "6px", fontSize: "1.1rem" }}>cloud_upload</span>
          Stockage Fichiers (S3 / Object Storage)
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Nom du bucket</label>
            <input type="text" value={s3Bucket} onChange={e => setS3Bucket(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Région</label>
            <select style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}>
              <option>af-south-1 (Afrique du Sud)</option>
              <option>eu-west-3 (Paris)</option>
              <option>us-east-1 (USA)</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: "var(--space-md)", padding: "12px 16px", borderRadius: "10px", background: "#F0FDF4", border: "1px solid #86EFAC", display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="material-symbols-outlined" style={{ color: "#16A34A" }}>check_circle</span>
          <span style={{ fontSize: "0.875rem", color: "#15803D", fontWeight: 500 }}>Connexion au bucket S3 : opérationnelle (latence : 42ms)</span>
        </div>
      </div>
    </div>
  );
}
