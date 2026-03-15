import Link from "next/link";

import type { SavedView, SignalFilters } from "@/lib/market-signals/types";

const filterLabels = {
  city: "City",
  signal_family: "Family",
  buyer_persona: "Persona",
  promotion_status: "Status",
  q: "Search",
} satisfies Record<keyof SignalFilters, string>;

export function FilterBar({
  filters,
  savedViews,
}: {
  filters: SignalFilters;
  savedViews: SavedView[];
}) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h3>Saved views and filters</h3>
          <p className="muted">Quick pivots for the most valuable daily workflows.</p>
        </div>
        {hasActiveFilters ? (
          <Link href="/" className="filter-reset">
            Reset filters
          </Link>
        ) : null}
      </div>

      {savedViews.length ? (
        <div className="saved-view-list">
          {savedViews.map((view) => (
            <Link
              key={view.id}
              href={buildViewHref(view.filters)}
              className={`saved-view ${isSavedViewActive(view.filters, filters) ? "is-active" : ""}`}
              aria-current={isSavedViewActive(view.filters, filters) ? "page" : undefined}
            >
              <strong>{view.name}</strong>
              <span>{view.description}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="muted">No saved views in the database yet.</p>
      )}

      <div className="filter-summary">
        {(
          Object.entries(filterLabels) as [keyof SignalFilters, string][]
        ).map(([key, label]) => (
          <span
            key={key}
            className={filters[key] ? "is-active" : undefined}
          >{`${label}: ${filters[key] ?? "All"}`}</span>
        ))}
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

function isSavedViewActive(viewFilters: SavedView["filters"], filters: SignalFilters) {
  const savedViewEntries = Object.entries(viewFilters) as [
    keyof SavedView["filters"],
    string | undefined,
  ][];

  if (!savedViewEntries.length) {
    return !Object.values(filters).some(Boolean);
  }

  return savedViewEntries.every(([key, value]) => filters[key] === value);
}
