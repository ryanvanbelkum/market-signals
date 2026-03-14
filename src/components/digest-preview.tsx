import Link from "next/link";

import type { DigestRun } from "@/lib/market-signals/types";

export function DigestPreview({ digest }: { digest: DigestRun }) {
  return (
    <article className="panel digest-preview">
      <div className="panel-header">
        <h3>{digest.title}</h3>
        <Link href={`/digests/${digest.id}`}>Open digest</Link>
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
    </article>
  );
}
