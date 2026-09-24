"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth, extractArray , formatDateLocal} from "@/lib/api";

interface CourseEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  room?: { name: string };
  subject?: { name: string };
  group?: { name: string };
}

export default function AttendancePage() {
  const [events, setEvents] = useState<CourseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"today" | "week">("today");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const start = formatDateLocal(now);
        let end = start;
        if (filter === "week") {
          const endDate = new Date(now);
          endDate.setDate(now.getDate() + 6);
          end = formatDateLocal(endDate);
        }
        const res = await fetchWithAuth(
          `/schedule-events?startDate=${start}&endDate=${end}`
        );
        const all: CourseEvent[] = extractArray(res);
        all.sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
        );
        setEvents(all);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const now = new Date();

  const groupedByDate = events.reduce<Record<string, CourseEvent[]>>(
    (acc, evt) => {
      const day = evt.startAt.split("T")[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(evt);
      return acc;
    },
    {}
  );

  return (
    <div
      className="animate-fade-in"
      style={{ paddingBottom: "var(--space-3xl)" }}
    >
      {/* Header */}
      <header
        style={{
          marginBottom: "var(--space-xl)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Appel & Présences
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Sélectionnez un cours pour faire l&apos;appel ou consulter les
            présences.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            background: "var(--surface-container)",
            padding: 4,
            borderRadius: "var(--radius)",
          }}
        >
          {(["today", "week"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 16px",
                borderRadius: "calc(var(--radius) - 2px)",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                background:
                  filter === f ? "var(--primary)" : "transparent",
                color: filter === f ? "white" : "var(--text-secondary)",
                transition: "all 0.15s",
              }}
            >
              {f === "today" ? "Aujourd'hui" : "Cette semaine"}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: "var(--space-lg)",
                display: "flex",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 50,
                  borderRadius: "var(--radius)",
                  background: "var(--surface-container-high)",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    height: 14,
                    width: "40%",
                    background: "var(--surface-container-high)",
                    borderRadius: 4,
                    animation: "pulse 1.5s infinite",
                  }}
                />
                <div
                  style={{
                    height: 12,
                    width: "25%",
                    background: "var(--surface-container-high)",
                    borderRadius: 4,
                    animation: "pulse 1.5s infinite",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <div
          className="card"
          style={{ padding: "60px 20px", textAlign: "center" }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--surface-container)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--text-muted)", fontSize: "1.75rem" }}
            >
              free_cancellation
            </span>
          </div>
          <div
            style={{
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 6,
            }}
          >
            Aucun cours{" "}
            {filter === "today" ? "aujourd'hui" : "cette semaine"}
          </div>
          <div
            style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}
          >
            Vérifiez votre planning pour les prochaines séances.
          </div>
          <Link href="/teacher/timetable" style={{ textDecoration: "none" }}>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
            >
              Voir mon planning
            </button>
          </Link>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}
        >
          {Object.entries(groupedByDate).map(([date, dayEvents]) => (
            <div key={date}>
              {/* Day separator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: "var(--space-md)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "capitalize",
                    color: "var(--text-muted)",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDate(date + "T00:00:00")}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "var(--border)",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {dayEvents.map((evt) => {
                  const isPassed = new Date(evt.endAt) < now;
                  const isCurrent =
                    new Date(evt.startAt) <= now &&
                    new Date(evt.endAt) >= now;

                  return (
                    <div
                      key={evt.id}
                      className="card"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "var(--space-md) var(--space-lg)",
                        opacity: isPassed ? 0.6 : 1,
                        borderLeft: isCurrent
                          ? "4px solid var(--primary)"
                          : "4px solid transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      {/* Time */}
                      <div
                        style={{
                          minWidth: 72,
                          textAlign: "center",
                          background: isCurrent
                            ? "var(--primary-light)"
                            : "var(--surface-container)",
                          borderRadius: "var(--radius)",
                          padding: "8px 10px",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            color: isCurrent
                              ? "var(--primary)"
                              : "var(--text-primary)",
                          }}
                        >
                          {formatTime(evt.startAt)}
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {formatTime(evt.endAt)}
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              color: "var(--text-primary)",
                            }}
                          >
                            {evt.subject?.name || evt.title || "Cours"}
                          </span>
                          {isCurrent && (
                            <span
                              style={{
                                background: "var(--primary)",
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: "99px",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                              }}
                            >
                              EN COURS
                            </span>
                          )}
                          {isPassed && (
                            <span
                              style={{
                                background: "var(--surface-container)",
                                color: "var(--text-muted)",
                                padding: "2px 8px",
                                borderRadius: "99px",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            >
                              Terminé
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 14,
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "0.95rem" }}
                            >
                              meeting_room
                            </span>
                            {evt.room?.name || "Salle à définir"}
                          </span>
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "0.95rem" }}
                            >
                              group
                            </span>
                            {evt.group?.name || "Groupe non spécifié"}
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <Link
                        href={`/teacher/attendance/${evt.id}`}
                        style={{ textDecoration: "none", flexShrink: 0 }}
                      >
                        <button
                          className={`btn ${isCurrent ? "btn-primary" : "btn-outline"}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: "0.875rem",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1rem" }}
                          >
                            checklist
                          </span>
                          {isPassed ? "Voir l'appel" : "Faire l'appel"}
                        </button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
