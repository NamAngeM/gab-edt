"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "Inter, system-ui, sans-serif", background: "#F8FAFC", color: "#0F172A" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", color: "#64748B" }}>ERREUR CRITIQUE</p>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0" }}>GAB-EDT est momentanément indisponible</h1>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>Réessayez dans quelques instants.</p>
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 24, padding: "10px 20px", borderRadius: 8, border: "none", background: "#007A4B", color: "white", fontWeight: 600, cursor: "pointer" }}
            >
              Réessayer
            </button>
            <div style={{ display: "flex", height: 4, width: 96, margin: "32px auto 0", borderRadius: 4, overflow: "hidden" }}>
              <span style={{ flex: 1, background: "#009E60" }} />
              <span style={{ flex: 1, background: "#FCD116" }} />
              <span style={{ flex: 1, background: "#3A75C4" }} />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
