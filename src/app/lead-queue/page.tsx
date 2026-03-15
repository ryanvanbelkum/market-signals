import { EmptyState } from "@/components/empty-state";
import { MarketSignalsShell } from "@/components/market-signals-shell";
import { SignalCard } from "@/components/signal-card";
import { listLeadQueue } from "@/lib/market-signals/repository";

export default async function LeadQueuePage() {
  const signals = await listLeadQueue();
  const topSignal = signals[0];

  return (
    <MarketSignalsShell
      eyebrow="Promoted Opportunities"
      title="Lead Queue"
      description="High-confidence records promoted out of the intelligence feed for immediate sales action."
      statusLabel={`${signals.length} lead-ready records`}
      statusDetail={
        topSignal
          ? `${topSignal.entity_name} currently leads the queue`
          : "No promoted records yet"
      }
    >
      <section className="panel queue-summary">
        <div className="queue-summary-copy">
          <p className="eyebrow">Action view</p>
          <h3>Priority outreach list</h3>
          <p className="muted">
            Only the strongest promoted records stay here. Everything shown should
            be ready for packaging, routing, or outbound action.
          </p>
        </div>
        {topSignal ? (
          <div className="queue-summary-stat">
            <span>Top lead</span>
            <strong>{topSignal.lead_score}</strong>
            <p>{topSignal.entity_name}</p>
          </div>
        ) : null}
      </section>

      <section className="panel relationship-note">
        <div>
          <p className="eyebrow">How it differs from feed</p>
          <h3>Lead Queue is a promoted subset of the feed.</h3>
        </div>
        <p className="muted">
          Every record here also exists in Feed, but only signals promoted to
          <span className="note-inline-highlight"> lead-ready </span>
          status appear in this list. Feed is for triage; Lead Queue is for action.
        </p>
      </section>

      <section className="signal-list">
        {signals.length ? (
          signals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} variant="queue" />
          ))
        ) : (
          <EmptyState
            title="Lead queue is empty"
            description="Signals will appear here after ingestion and promotion rules mark them as lead-ready."
          />
        )}
      </section>
    </MarketSignalsShell>
  );
}
