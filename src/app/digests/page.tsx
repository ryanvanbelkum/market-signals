import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { MarketSignalsShell } from "@/components/market-signals-shell";
import { listDigests } from "@/lib/market-signals/repository";

function formatDigestDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function DigestArchivePage() {
  const digests = await listDigests();
  const latestDigest = digests[0];

  return (
    <MarketSignalsShell
      eyebrow="Weekly Review"
      title="Digest Archive"
      description="A clean archive of generated market briefings for quick review and handoff."
      statusLabel="Archive ready"
      statusDetail={
        latestDigest
          ? `Latest run ${formatDigestDate(latestDigest.generated_at)}`
          : "Waiting for the first digest run"
      }
    >
      {latestDigest ? (
        <section className="panel archive-hero">
          <div className="archive-hero-copy">
            <p className="eyebrow">Latest digest</p>
            <h3>{latestDigest.title}</h3>
            <p className="muted">{latestDigest.summary}</p>
          </div>
          <div className="archive-hero-meta">
            <span>{formatDigestDate(latestDigest.generated_at)}</span>
            <Link href={`/digests/${latestDigest.id}`}>Open latest</Link>
          </div>
        </section>
      ) : null}

      <section className="digest-archive">
        {digests.length ? (
          digests.map((digest) => (
            <article key={digest.id} className="panel digest-archive-card">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Digest run</p>
                  <h3>{digest.title}</h3>
                </div>
                <span className="digest-date">{formatDigestDate(digest.generated_at)}</span>
              </div>
              <p className="muted">{digest.summary}</p>
              <div className="trend-row">
                {digest.trend_summary.map((trend) => (
                  <div key={trend.label} className="trend-chip">
                    <span>{trend.label}</span>
                    <strong>{trend.value}</strong>
                  </div>
                ))}
              </div>
              <div className="signal-footer">
                <span className="muted">{digest.top_signal_ids.length} featured signals</span>
                <Link href={`/digests/${digest.id}`}>Review digest</Link>
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            title="No digests yet"
            description="Run a digest after signals exist in the database to start building the archive."
          />
        )}
      </section>
    </MarketSignalsShell>
  );
}
