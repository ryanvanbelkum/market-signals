import Link from "next/link";
import { PropsWithChildren } from "react";

export function MarketSignalsShell({
  children,
  title,
  eyebrow,
  description,
}: PropsWithChildren<{
  title: string;
  eyebrow: string;
  description: string;
}>) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <p className="brand-kicker">Market Signals</p>
          <h1>Local market movement for local sellers.</h1>
          <p className="muted">
            Kansas City and St. Joseph intelligence for teams selling into new
            businesses, commercial activity, and demand spikes.
          </p>
        </div>

        <nav className="sidebar-nav">
          <Link href="/">Feed</Link>
          <Link href="/lead-queue">Lead Queue</Link>
          <Link href="/digests/digest-2026-w11">Digest Archive</Link>
        </nav>

        <div className="sidebar-note">
          <span>Cadence</span>
          <strong>Daily ingestion, weekly digest</strong>
        </div>
      </aside>

      <main className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p className="page-description">{description}</p>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
