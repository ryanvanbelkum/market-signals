import Link from "next/link";

import type { MarketSignal } from "@/lib/market-signals/types";

const statusLabel: Record<MarketSignal["promotion_status"], string> = {
  feed_only: "Feed only",
  watch: "Watch",
  lead_queue: "Lead queue",
};

function formatBuyerFit(signal: MarketSignal) {
  if (!signal.buyer_personas.length) {
    return "Unassigned";
  }

  return signal.buyer_personas.slice(0, 2).join(", ");
}

export function SignalCard({
  signal,
  variant = "feed",
}: {
  signal: MarketSignal;
  variant?: "feed" | "queue" | "digest";
}) {
  const isQueue = variant === "queue";
  const isDigest = variant === "digest";

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
          {!isQueue ? <p className="muted">{signal.description}</p> : null}
        </div>

        {isQueue ? (
          <dl className="signal-stats signal-stats-compact">
            <div>
              <dt>Lead score</dt>
              <dd>{signal.lead_score}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{Math.round(signal.confidence_score * 100)}%</dd>
            </div>
            <div>
              <dt>Buyer fit</dt>
              <dd>{formatBuyerFit(signal)}</dd>
            </div>
          </dl>
        ) : isDigest ? (
          <p className="signal-summary muted">
            {statusLabel[signal.promotion_status]} · Lead score {signal.lead_score} ·{" "}
            {formatBuyerFit(signal)}
          </p>
        ) : (
          <p className="signal-summary muted">
            Lead score {signal.lead_score} · {Math.round(signal.confidence_score * 100)}%
            confidence · {formatBuyerFit(signal)}
          </p>
        )}
      </div>

      <div className="signal-footer">
        <span className="signal-date">{signal.signal_date}</span>
        <Link href={`/signals/${signal.id}`}>
          {isDigest ? "Open signal" : isQueue ? "Prepare outreach" : "Open detail"}
        </Link>
      </div>
    </article>
  );
}
