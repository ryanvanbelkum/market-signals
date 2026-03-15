import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketSignalsShell } from "@/components/market-signals-shell";
import { SignalCard } from "@/components/signal-card";
import { getDigest, getDigestSignals } from "@/lib/market-signals/repository";

function formatDigestDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function DigestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const digest = await getDigest(id);

  if (!digest) {
    notFound();
  }

  const digestSignals = await getDigestSignals(digest);

  return (
    <MarketSignalsShell
      eyebrow="Weekly Brief"
      title={digest.title}
      description={digest.summary}
      statusLabel="Digest review"
      statusDetail={formatDigestDate(digest.generated_at)}
    >
      <section className="panel">
        <div className="panel-header">
          <h3>Trend summary</h3>
          <span className="digest-date">{formatDigestDate(digest.generated_at)}</span>
        </div>
        <div className="trend-row">
          {digest.trend_summary.map((trend) => (
            <div key={trend.label} className="trend-chip">
              <span>{trend.label}</span>
              <strong>{trend.value}</strong>
            </div>
          ))}
        </div>
        <div className="signal-footer">
          <span className="muted">{digestSignals.length} featured records</span>
          <Link href="/digests">Back to archive</Link>
        </div>
      </section>

      <section className="signal-list">
        {digestSignals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} variant="digest" />
        ))}
      </section>
    </MarketSignalsShell>
  );
}
