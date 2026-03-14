import { DigestPreview } from "@/components/digest-preview";
import { FilterBar } from "@/components/filter-bar";
import { MapPanel } from "@/components/map-panel";
import { MarketSignalsShell } from "@/components/market-signals-shell";
import { SignalCard } from "@/components/signal-card";
import {
  digests,
  filterSignals,
  getNeighborhoodActivity,
  getTrendCards,
  savedViews,
} from "@/lib/market-signals/data";
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
  const filteredSignals = filterSignals(filters);
  const trendCards = getTrendCards();
  const neighborhoods = getNeighborhoodActivity();

  return (
    <MarketSignalsShell
      eyebrow="Daily Intelligence Brief"
      title="Feed"
      description="Track local business openings, commercial activity, and demand spikes before competitors react."
    >
      <section className="hero panel">
        <div>
          <p className="eyebrow">Market pulse</p>
          <h3>Market Signals</h3>
          <p className="muted">
            A local-market Bloomberg-style terminal for Kansas City and St. Joseph,
            optimized for B2B sellers who need the earliest believable signal.
          </p>
        </div>
        <div className="hero-metrics">
          {trendCards.map((card) => (
            <div key={card.label} className={`metric-card ${card.tone}`}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <FilterBar filters={filters} savedViews={savedViews} />

      <div className="content-grid">
        <section className="signal-list">
          {filteredSignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </section>

        <div className="sidebar-stack">
          <MapPanel neighborhoods={neighborhoods} />
          <DigestPreview digest={digests[0]} />
        </div>
      </div>
    </MarketSignalsShell>
  );
}
