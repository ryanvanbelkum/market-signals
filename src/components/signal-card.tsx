import Link from "next/link";

import type { MarketSignal } from "@/lib/market-signals/types";

const statusLabel: Record<MarketSignal["promotion_status"], string> = {
  feed_only: "Feed only",
  watch: "Watch",
  lead_queue: "Lead queue",
};

export function SignalCard({ signal }: { signal: MarketSignal }) {
  return (
    <article className="signal-card">
      <div className="signal-meta">
        <span className="pill">{signal.city}</span>
        <span className="pill subtle">{signal.signal_family.replace("_", " ")}</span>
        <span className="pill highlight">{statusLabel[signal.promotion_status]}</span>
      </div>

      <div className="signal-body">
        <div>
          <h3>{signal.headline}</h3>
          <p className="signal-entity">
            {signal.entity_name} · {signal.neighborhood}
          </p>
          <p className="muted">{signal.description}</p>
        </div>

        <dl className="signal-stats">
          <div>
            <dt>Confidence</dt>
            <dd>{Math.round(signal.confidence_score * 100)}%</dd>
          </div>
          <div>
            <dt>Lead score</dt>
            <dd>{signal.lead_score}</dd>
          </div>
          <div>
            <dt>Buyer fit</dt>
            <dd>{signal.buyer_personas.join(", ")}</dd>
          </div>
        </dl>
      </div>

      <div className="signal-footer">
        <span>{signal.signal_date}</span>
        <Link href={`/signals/${signal.id}`}>Open detail</Link>
      </div>
    </article>
  );
}
