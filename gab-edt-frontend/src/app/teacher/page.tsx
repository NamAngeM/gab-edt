"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth, extractArray , formatDateLocal} from "@/lib/api";
import { TeachingHours } from "@/components/TeachingHours";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
  const [userName, setUserName] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user_data") || "{}");
      setUserName(user.firstName || "Enseignant");
    } catch {
      setUserName("Enseignant");
    }

    const loadTodayEvents = async () => {
      setLoading(true);
      try {
        const today = formatDateLocal(new Date());
        const res = await fetchWithAuth(
          `/schedule-events?startDate=${today}&endDate=${today}`
        );
        const allEvents = extractArray(res);
        allEvents.sort(
          (a: any, b: any) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
        );
        setEvents(allEvents);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadTodayEvents();
  }, []);

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const now = new Date();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>

      {/* ── WELCOME BANNER ── */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-xl)",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>
            Bonjour, {userName} 👋
          </h1>
          <p style={{ opacity: 0.85, fontSize: "0.95rem" }}>
            Bienvenue sur votre espace enseignant. Voici un aperçu de vos activités du jour.
          </p>
        </div>
        <Link href="/teacher/timetable" style={{ textDecoration: "none" }}>
          <button style={{
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.35)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "var(--radius)",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.9rem",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>calendar_month</span>
            Mon planning complet
          </button>
        </Link>
      </div>

      {/* ── QUICK CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-lg)" }}>

        <Link href="/teacher/timetable" style={{ textDecoration: "none" }}>
          <div className="card" style={{ padding: "var(--space-lg)", cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
            <div style={{ width: 44, height: 44, background: "var(--primary-light)", color: "var(--primary)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Mon Planning</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>
              Consultez votre emploi du temps et les salles de vos prochains cours.
            </p>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4 }}>
              Voir le planning <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>arrow_forward</span>
            </span>
          </div>
        </Link>


      </div>

      <TeachingHours />

      {/* ── TODAY'S COURSES ── */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "var(--radius)", background: "var(--warning-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--warning)" }}>schedule</span>
            </div>
            <h2 className="card-title" style={{ margin: 0 }}>Vos cours aujourd&apos;hui</h2>
          </div>
          <Link href="/teacher/timetable" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}>
            Gérer le planning
          </Link>
        </div>

        <div style={{ padding: "4px 0" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 20px" }}>
              {[1, 2].map(i => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "16px", borderRadius: "var(--radius)", background: "var(--surface-container-lowest)", border: "1px solid var(--border)" }}>
                  <div style={{ width: 64, height: 48, background: "var(--surface-container-high)", borderRadius: "var(--radius)", animation: "pulse 1.5s infinite" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ height: 14, background: "var(--surface-container-high)", borderRadius: 4, width: "40%", animation: "pulse 1.5s infinite" }} />
                    <div style={{ height: 12, background: "var(--surface-container-high)", borderRadius: 4, width: "25%", animation: "pulse 1.5s infinite" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface-container)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
                <span className="material-symbols-outlined" style={{ color: "var(--text-muted)", fontSize: "1.5rem" }}>free_cancellation</span>
              </div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Aucun cours aujourd&apos;hui</div>
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Vous n&apos;avez pas de cours programmés pour cette journée.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {events.map((evt: any, idx: number) => {
                const isPassed = new Date(evt.endAt) < now;
                const isCurrent = new Date(evt.startAt) <= now && new Date(evt.endAt) >= now;

                return (
                  <div key={evt.id || idx} style={{
                    display: "flex",
                    gap: 16,
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border)",
                    alignItems: "center",
                    opacity: isPassed ? 0.55 : 1,
                    background: isCurrent ? "var(--warning-bg)" : "transparent",
                    transition: "background 0.15s",
                  }}>
                    {/* Time pill */}
                    <div style={{
                      minWidth: 80,
                      textAlign: "center",
                      background: isCurrent ? "var(--warning)" : "var(--surface-container)",
                      color: isCurrent ? "white" : "var(--text-secondary)",
                      borderRadius: "var(--radius)",
                      padding: "8px 10px",
                      flexShrink: 0,
                    }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{formatTime(evt.startAt)}</div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.75 }}>{formatTime(evt.endAt)}</div>
                    </div>

                    {/* Course info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                          {evt.subject?.name || evt.title || "Cours"}
                        </span>
                        {isCurrent && (
                          <span style={{ background: "var(--warning)", color: "white", padding: "2px 8px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 700 }}>
                            EN COURS
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "0.95rem" }}>meeting_room</span>
                          {evt.room?.name || "Salle à définir"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "0.95rem" }}>group</span>
                          {evt.group?.name || "Groupe non spécifié"}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => router.push(`/teacher/attendance/${evt.id}`)}
                      className="btn btn-primary"
                      style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, fontSize: "0.875rem" }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>checklist</span>
                      Faire l&apos;appel
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
