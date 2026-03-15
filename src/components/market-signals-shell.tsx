import Link from "next/link";
import { PropsWithChildren } from "react";

export function MarketSignalsSidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="brand-lockup">
          <div className="brand-mark">
            <span className="brand-dot" />
            <p className="brand-kicker">Market Signals</p>
          </div>
          <h1>Local market movement for local sellers.</h1>
          <p className="muted">
            Kansas City and St. Joseph intelligence for teams selling into new
            businesses, commercial activity, and demand spikes.
          </p>
        </div>

        <nav className="sidebar-nav">
          <Link href="/">Feed</Link>
          <Link href="/lead-queue">Lead Queue</Link>
          <Link href="/digests">Digest Archive</Link>
        </nav>

        <div className="sidebar-footer">
          <span>Region</span>
          <strong>Kansas City + St. Joseph</strong>
        </div>
      </div>
    </aside>
  );
}

export function MarketSignalsShell({
  children,
  title,
  eyebrow,
  description,
  statusLabel = "Live market workspace",
  statusDetail = "Supabase-backed signal inventory",
}: PropsWithChildren<{
  title: string;
  eyebrow: string;
  description: string;
  statusLabel?: string;
  statusDetail?: string;
}>) {
  return (
    <main className="content">
      <header className="page-header">
        <div className="page-header-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="page-description">{description}</p>
        </div>
      </header>
      {children}
    </main>
  );
}
