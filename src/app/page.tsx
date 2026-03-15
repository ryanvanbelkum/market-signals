import { DigestPreview } from "@/components/digest-preview";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { MapPanel } from "@/components/map-panel";
import { MarketSignalsShell } from "@/components/market-signals-shell";
import { SignalCard } from "@/components/signal-card";
import {
  getNeighborhoodActivity,
  getTrendCards,
  listDigests,
  listSavedViews,
  listSignals,
} from "@/lib/market-signals/repository";
import type { SignalFilters } from "@/lib/market-signals/types";

function getFilters(searchParams: Record<string, string | string[] | undefined>): SignalFilters {
  const value = (key: string) => {
    const item = searchParams[key];
    return Array.isArray(item) ? item[0] : item;
  };

  return {
    city: value("city"),
    signal_family: value("signal_family") as SignalFilters["signal_family"],
    buyer_persona: value("buyer_persona") as SignalFilters["buyer_persona"],
    promotion_status: value("promotion_status") as SignalFilters["promotion_status"],
    q: value("q"),
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = getFilters(resolvedSearchParams);
  const [filteredSignals, trendCards, neighborhoods, savedViews, digests] =
    await Promise.all([
      listSignals(filters),
      getTrendCards(),
      getNeighborhoodActivity(),
      listSavedViews(),
      listDigests(),
    ]);

  return (
    <MarketSignalsShell
      eyebrow="Daily Intelligence Brief"
      title="Feed"
      description="Track local business openings, commercial activity, and demand spikes before competitors react."
      statusLabel={`${filteredSignals.length} active signals`}
      statusDetail="Discovery view for triage and pattern spotting"
    >
      <section className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow">Market pulse</p>
          <h3>Scan what changed, then move only the strongest records forward.</h3>
          <p className="muted">
            Use the feed to spot new activity, apply saved views, and decide what
            deserves watch status or promotion.
          </p>
          <div className="hero-ribbon hero-ribbon-compact">
            <span>Discovery first</span>
            <span>Database-backed signals</span>
          </div>
        </div>
        <div className="hero-metrics">
          {trendCards.slice(0, 3).map((card) => (
            <div key={card.label} className={`metric-card ${card.tone}`}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <FilterBar filters={filters} savedViews={savedViews} />

      <section className="panel relationship-note">
        <div>
          <p className="eyebrow">How to read this</p>
          <h3>Feed includes the full working set.</h3>
        </div>
        <p className="muted">
          This list shows every tracked signal across feed-only, watch, and lead-ready
          statuses. Records promoted to Lead Queue still appear here because the feed is
          the upstream discovery view.
        </p>
      </section>

      <div className="content-grid">
        <section className="signal-list">
          {filteredSignals.length ? (
            filteredSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} variant="feed" />
            ))
          ) : (
            <EmptyState
              title="No signals yet"
              description="Your Supabase tables are live, but no market signals have been ingested yet."
            />
          )}
        </section>

        <div className="sidebar-stack">
          <MapPanel neighborhoods={neighborhoods} />
          {digests[0] ? (
            <DigestPreview digest={digests[0]} />
          ) : (
            <EmptyState
              title="No digests yet"
              description="Run a digest after signals exist in the database to populate this archive."
            />
          )}
        </div>
      </div>
    </MarketSignalsShell>
  );
}
