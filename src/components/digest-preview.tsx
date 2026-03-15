import Link from "next/link";

import type { DigestRun } from "@/lib/market-signals/types";

function formatDigestDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function DigestPreview({ digest }: { digest: DigestRun }) {
  return (
    <article className="panel digest-preview">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Latest digest</p>
          <h3>{digest.title}</h3>
        </div>
        <span className="digest-date">{formatDigestDate(digest.generated_at)}</span>
      </div>
      <p className="muted">{digest.summary}</p>
      <div className="signal-footer">
        <span className="muted">{digest.top_signal_ids.length} featured signals</span>
        <Link href="/digests">View archive</Link>
      </div>
    </article>
  );
}
