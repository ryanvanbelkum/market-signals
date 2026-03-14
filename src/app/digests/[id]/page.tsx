import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketSignalsShell } from "@/components/market-signals-shell";
import { getDigestById, getDigestSignals } from "@/lib/market-signals/data";

export default async function DigestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const digest = getDigestById(id);

  if (!digest) {
    notFound();
  }

  const digestSignals = getDigestSignals(digest);

  return (
    <MarketSignalsShell
      eyebrow="Weekly Brief"
      title={digest.title}
      description={digest.summary}
    >
      <section className="panel">
        <div className="panel-header">
          <h3>Trend summary</h3>
          <span>{digest.generated_at}</span>
        </div>
        <div className="trend-row">
          {digest.trend_summary.map((trend) => (
            <div key={trend.label} className="trend-chip">
              <span>{trend.label}</span>
              <strong>{trend.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="signal-list">
        {digestSignals.map((signal) => (
          <article key={signal.id} className="signal-card">
            <div className="signal-meta">
              <span className="pill">{signal.city}</span>
              <span className="pill highlight">{signal.promotion_status}</span>
            </div>
            <h3>{signal.headline}</h3>
            <p className="muted">{signal.description}</p>
            <div className="signal-footer">
              <span>{signal.signal_date}</span>
              <Link href={`/signals/${signal.id}`}>Open signal</Link>
            </div>
          </article>
        ))}
      </section>
    </MarketSignalsShell>
  );
}
