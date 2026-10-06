import React from "react";
import Link from "next/link";

type Props = {
  code: string;
  title: string;
  description: string;
  icon: string;
  onRetry?: () => void;
};

export function ErrorScreen({ code, title, description, icon, onRetry }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
          <span className="material-symbols-outlined" style={{ fontSize: 32 }}>{icon}</span>
        </div>
        <p className="text-sm font-bold tracking-[0.2em] text-[var(--text-muted)]">{code}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[var(--text-primary)]">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn btn-primary">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
              Réessayer
            </button>
          )}
          <Link href="/" className="btn btn-outline" style={{ textDecoration: "none" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>home</span>
            Retour à l&apos;accueil
          </Link>
        </div>

        <div className="mx-auto mt-10 flex h-1 w-24 overflow-hidden rounded-full">
          <span className="flex-1 bg-[#009E60]" />
          <span className="flex-1 bg-[#FCD116]" />
          <span className="flex-1 bg-[#3A75C4]" />
        </div>
      </div>
    </div>
  );
}
