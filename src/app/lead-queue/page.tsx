import { MarketSignalsShell } from "@/components/market-signals-shell";
import { SignalCard } from "@/components/signal-card";
import { getLeadQueue } from "@/lib/market-signals/data";

export default function LeadQueuePage() {
  const signals = getLeadQueue();

  return (
    <MarketSignalsShell
      eyebrow="Promoted Opportunities"
      title="Lead Queue"
      description="High-confidence records promoted out of the intelligence feed for immediate sales action."
    >
      <section className="panel">
        <div className="panel-header">
          <h3>Priority outreach list</h3>
          <p className="muted">
            These records crossed the deterministic score threshold and are ready
            for packaged delivery or outbound action.
          </p>
        </div>
      </section>

      <section className="signal-list">
        {signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </section>
    </MarketSignalsShell>
  );
}
