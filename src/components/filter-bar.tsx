import Link from "next/link";

import type { SavedView, SignalFilters } from "@/lib/market-signals/types";

export function FilterBar({
  filters,
  savedViews,
}: {
  filters: SignalFilters;
  savedViews: SavedView[];
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Saved views and filters</h3>
        <p className="muted">Quick pivots for the most valuable daily workflows.</p>
      </div>

      <div className="saved-view-list">
        {savedViews.map((view) => (
          <Link key={view.id} href={buildViewHref(view.filters)} className="saved-view">
            <strong>{view.name}</strong>
            <span>{view.description}</span>
          </Link>
        ))}
      </div>

      <div className="filter-summary">
        <span>City: {filters.city ?? "All"}</span>
        <span>Family: {filters.signal_family ?? "All"}</span>
        <span>Persona: {filters.buyer_persona ?? "All"}</span>
        <span>Status: {filters.promotion_status ?? "All"}</span>
      </div>
    </section>
  );
}

function buildViewHref(filters: SavedView["filters"]) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `/?${query}` : "/";
}
