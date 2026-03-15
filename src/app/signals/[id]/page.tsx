import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketSignalsShell } from "@/components/market-signals-shell";
import { SignalLocationMap } from "@/components/signal-location-map";
import {
  getSignal,
  listPromotionEvents,
  listSourceConnectors,
} from "@/lib/market-signals/repository";

export default async function SignalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const signal = await getSignal(id);

  if (!signal) {
    notFound();
  }

  const [connectors, history] = await Promise.all([
    listSourceConnectors(),
    listPromotionEvents(signal.id),
  ]);
  const connector = connectors.find((item) => item.id === signal.source_id);

  return (
    <MarketSignalsShell
      eyebrow="Evidence-backed Detail"
      title={signal.entity_name}
      description={signal.headline}
    >
      <section className="detail-layout">
        <article className="panel detail-main">
          <div className="panel-header">
            <h3>Why this matters</h3>
            <Link href={signal.source_url} target="_blank" rel="noreferrer">
              Open source
            </Link>
          </div>
          <p className="detail-copy">{signal.description}</p>

          <dl className="detail-grid">
            <div>
              <dt>Address</dt>
              <dd>
                {signal.address_line}, {signal.city}, {signal.state} {signal.postal_code}
              </dd>
            </div>
            <div>
              <dt>Neighborhood</dt>
              <dd>{signal.neighborhood}</dd>
            </div>
            <div>
              <dt>Signal date</dt>
              <dd>{signal.signal_date}</dd>
            </div>
            <div>
              <dt>Buyer personas</dt>
              <dd>{signal.buyer_personas.join(", ")}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{Math.round(signal.confidence_score * 100)}%</dd>
            </div>
            <div>
              <dt>Lead score</dt>
              <dd>{signal.lead_score}</dd>
            </div>
          </dl>
        </article>

        <aside className="sidebar-stack">
          <SignalLocationMap
            addressLine={signal.address_line}
            city={signal.city}
            state={signal.state}
            postalCode={signal.postal_code}
            lat={signal.lat}
            lng={signal.lng}
            neighborhood={signal.neighborhood}
          />

          <article className="panel">
            <div className="panel-header">
              <h3>Connector state</h3>
            </div>
            <p className="muted">{connector?.name}</p>
            <div className="stacked-copy">
              <span>Status: {connector?.status ?? "unknown"}</span>
              <span>Checkpoint: {connector?.checkpoint ?? "n/a"}</span>
              <span>Dedupe group: {signal.dedupe_group_id}</span>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <h3>Promotion history</h3>
            </div>
            <div className="timeline">
              {history.length ? (
                history.map((event) => (
                  <div key={event.id} className="timeline-item">
                    <strong>
                      {event.previous_status} to {event.next_status}
                    </strong>
                    <p className="muted">{event.reason}</p>
                  </div>
                ))
              ) : (
                <p className="muted">No promotion changes recorded yet.</p>
              )}
            </div>
          </article>
        </aside>
      </section>
    </MarketSignalsShell>
  );
}
