import type {
  DigestRun,
  Entity,
  MarketSignal,
  PromotionEvent,
  SavedView,
  SignalFilters,
  SourceConnector,
} from "@/lib/market-signals/types";

const now = "2026-03-14T09:00:00.000Z";

export const sourceConnectors: SourceConnector[] = [
  {
    id: "src-kc-license",
    name: "Kansas City Business License Feed",
    source_type: "business_license",
    region: "Kansas City, MO",
    cadence: "daily",
    checkpoint: "2026-03-14T06:00:00.000Z",
    status: "healthy",
  },
  {
    id: "src-kc-permits",
    name: "Kansas City Permit Activity",
    source_type: "building_permit",
    region: "Kansas City, MO",
    cadence: "daily",
    checkpoint: "2026-03-14T05:30:00.000Z",
    status: "healthy",
  },
  {
    id: "src-stj-license",
    name: "St. Joseph Business Openings",
    source_type: "business_license",
    region: "St. Joseph, MO",
    cadence: "daily",
    checkpoint: "2026-03-13T23:00:00.000Z",
    status: "healthy",
  },
  {
    id: "src-hiring",
    name: "Regional Hiring Signals",
    source_type: "hiring_signal",
    region: "Kansas City + St. Joseph",
    cadence: "daily",
    checkpoint: "2026-03-14T04:45:00.000Z",
    status: "delayed",
  },
];

export const entities: Entity[] = [
  {
    id: "ent-maple",
    entity_name: "Maple & Rye Hospitality LLC",
    canonical_name: "Maple & Rye Hospitality",
    city: "Kansas City",
    neighborhood: "Crossroads",
    address_line: "1812 Walnut St",
  },
  {
    id: "ent-showme",
    entity_name: "Show-Me Cold Storage Inc.",
    canonical_name: "Show-Me Cold Storage",
    city: "Kansas City",
    neighborhood: "West Bottoms",
    address_line: "1311 Hickory St",
  },
  {
    id: "ent-riverfront",
    entity_name: "Riverfront Bento LLC",
    canonical_name: "Riverfront Bento",
    city: "St. Joseph",
    neighborhood: "Downtown",
    address_line: "402 Felix St",
  },
];

export const signals: MarketSignal[] = [
  {
    id: "sig-001",
    source_id: "src-kc-license",
    source_type: "business_license",
    source_record_key: "KC-2026-0314-001",
    entity_name: "Maple & Rye Hospitality LLC",
    entity_type: "restaurant",
    address_line: "1812 Walnut St",
    city: "Kansas City",
    state: "MO",
    postal_code: "64108",
    lat: 39.0912,
    lng: -94.5821,
    neighborhood: "Crossroads",
    signal_family: "new_business",
    signal_type: "restaurant_license_issued",
    signal_date: "2026-03-13",
    headline: "New restaurant license issued in Crossroads",
    description:
      "Maple & Rye Hospitality secured a city business license tied to a new full-service restaurant concept.",
    source_url: "https://data.kcmo.org/",
    raw_status: "issued",
    buyer_personas: ["pos", "merchant_services", "uniforms", "food_distribution"],
    confidence_score: 0.96,
    lead_score: 94,
    promotion_status: "lead_queue",
    dedupe_group_id: "grp-maple-rye",
    created_at: now,
    updated_at: now,
  },
  {
    id: "sig-002",
    source_id: "src-kc-permits",
    source_type: "building_permit",
    source_record_key: "PERMIT-2026-8842",
    entity_name: "Show-Me Cold Storage Inc.",
    entity_type: "commercial_property",
    address_line: "1311 Hickory St",
    city: "Kansas City",
    state: "MO",
    postal_code: "64102",
    lat: 39.1043,
    lng: -94.5995,
    neighborhood: "West Bottoms",
    signal_family: "commercial_activity",
    signal_type: "tenant_improvement_permit",
    signal_date: "2026-03-12",
    headline: "Warehouse tenant improvement permit filed in West Bottoms",
    description:
      "A $420K tenant improvement permit suggests a logistics expansion and likely vendor evaluation cycle.",
    source_url: "https://compasskc.kcmo.org/",
    raw_status: "active",
    buyer_personas: ["merchant_services", "janitorial", "uniforms", "payroll"],
    confidence_score: 0.89,
    lead_score: 82,
    promotion_status: "lead_queue",
    dedupe_group_id: "grp-showme-storage",
    created_at: now,
    updated_at: now,
  },
  {
    id: "sig-003",
    source_id: "src-stj-license",
    source_type: "business_license",
    source_record_key: "STJ-2026-221",
    entity_name: "Riverfront Bento LLC",
    entity_type: "restaurant",
    address_line: "402 Felix St",
    city: "St. Joseph",
    state: "MO",
    postal_code: "64501",
    lat: 39.7674,
    lng: -94.8467,
    neighborhood: "Downtown",
    signal_family: "new_business",
    signal_type: "restaurant_opening",
    signal_date: "2026-03-11",
    headline: "New fast-casual concept appears in downtown St. Joseph",
    description:
      "A newly registered restaurant entity with inspection scheduling indicates an opening timeline within 30 days.",
    source_url: "https://www.stjosephmo.gov/",
    raw_status: "pending",
    buyer_personas: ["pos", "food_distribution", "merchant_services"],
    confidence_score: 0.84,
    lead_score: 77,
    promotion_status: "watch",
    dedupe_group_id: "grp-riverfront-bento",
    created_at: now,
    updated_at: now,
  },
  {
    id: "sig-004",
    source_id: "src-hiring",
    source_type: "hiring_signal",
    source_record_key: "HIRING-2026-950",
    entity_name: "Northland Dental Group",
    entity_type: "corporation",
    address_line: "7211 NW 83rd St",
    city: "Kansas City",
    state: "MO",
    postal_code: "64152",
    lat: 39.2489,
    lng: -94.6648,
    neighborhood: "Northland",
    signal_family: "demand_signal",
    signal_type: "hiring_spike",
    signal_date: "2026-03-10",
    headline: "Dental group posts 6 frontline roles across two weeks",
    description:
      "Accelerating hiring usually precedes payroll, uniforms, cleaning, and merchant-services vendor reviews.",
    source_url: "https://example.com/hiring-signal",
    raw_status: "active",
    buyer_personas: ["payroll", "uniforms", "janitorial", "merchant_services"],
    confidence_score: 0.73,
    lead_score: 65,
    promotion_status: "watch",
    dedupe_group_id: "grp-northland-dental",
    created_at: now,
    updated_at: now,
  },
  {
    id: "sig-005",
    source_id: "src-kc-permits",
    source_type: "building_permit",
    source_record_key: "PERMIT-2026-8871",
    entity_name: "Briarcliff Office Suites",
    entity_type: "commercial_property",
    address_line: "4151 N Mulberry Dr",
    city: "Kansas City",
    state: "MO",
    postal_code: "64116",
    lat: 39.1701,
    lng: -94.5998,
    neighborhood: "Briarcliff",
    signal_family: "commercial_activity",
    signal_type: "interior_build_out",
    signal_date: "2026-03-09",
    headline: "Office build-out activity rises in Briarcliff",
    description:
      "Interior work and occupancy changes indicate a likely move-in window and downstream service buying.",
    source_url: "https://compasskc.kcmo.org/",
    raw_status: "active",
    buyer_personas: ["janitorial", "merchant_services", "payroll"],
    confidence_score: 0.67,
    lead_score: 54,
    promotion_status: "feed_only",
    dedupe_group_id: "grp-briarcliff-office",
    created_at: now,
    updated_at: now,
  },
  {
    id: "sig-006",
    source_id: "src-kc-license",
    source_type: "health_inspection",
    source_record_key: "HEALTH-2026-114",
    entity_name: "Maple & Rye Hospitality LLC",
    entity_type: "restaurant",
    address_line: "1812 Walnut St",
    city: "Kansas City",
    state: "MO",
    postal_code: "64108",
    lat: 39.0912,
    lng: -94.5821,
    neighborhood: "Crossroads",
    signal_family: "commercial_activity",
    signal_type: "preopening_inspection",
    signal_date: "2026-03-14",
    headline: "Pre-opening health inspection scheduled for Maple & Rye",
    description:
      "The inspection event reinforces the restaurant launch timeline and raises buyer urgency for vendors.",
    source_url: "https://data.kcmo.org/",
    raw_status: "pending",
    buyer_personas: ["pos", "merchant_services", "food_distribution"],
    confidence_score: 0.91,
    lead_score: 86,
    promotion_status: "lead_queue",
    dedupe_group_id: "grp-maple-rye",
    created_at: now,
    updated_at: now,
  },
];

export const savedViews: SavedView[] = [
  {
    id: "view-restaurants",
    name: "New restaurants",
    description: "Openings and pre-opening signals that need vendor outreach first.",
    filters: { signal_family: "new_business", buyer_persona: "pos" },
  },
  {
    id: "view-buildouts",
    name: "Commercial build-outs",
    description: "Permits and occupancy changes tied to local expansion.",
    filters: { signal_family: "commercial_activity" },
  },
  {
    id: "view-high-confidence",
    name: "High-confidence local sales triggers",
    description: "Signals already promoted into the lead queue.",
    filters: { promotion_status: "lead_queue" },
  },
];

export const promotionEvents: PromotionEvent[] = [
  {
    id: "pe-1",
    signal_id: "sig-001",
    previous_status: "watch",
    next_status: "lead_queue",
    reason: "License issuance plus restaurant persona match pushed score above threshold.",
    created_at: now,
  },
  {
    id: "pe-2",
    signal_id: "sig-002",
    previous_status: "watch",
    next_status: "lead_queue",
    reason: "Permit valuation and category fit triggered commercial expansion promotion.",
    created_at: now,
  },
];

export const digests: DigestRun[] = [
  {
    id: "digest-2026-w11",
    title: "Market Signals Weekly Brief",
    generated_at: "2026-03-14T07:00:00.000Z",
    summary:
      "Restaurant openings and warehouse build-outs drove the highest-confidence vendor triggers this week, with Crossroads and West Bottoms leading activity.",
    top_signal_ids: ["sig-001", "sig-002", "sig-006"],
    trend_summary: [
      { label: "New business signals", value: "+18% WoW" },
      { label: "Commercial activity", value: "+11% WoW" },
      { label: "Lead queue promotions", value: "3 this week" },
    ],
  },
  {
    id: "digest-2026-w10",
    title: "Market Signals Weekly Brief",
    generated_at: "2026-03-07T07:00:00.000Z",
    summary:
      "St. Joseph restaurant activity started to wake up, while Kansas City remained strongest in commercial permit volume.",
    top_signal_ids: ["sig-003", "sig-004"],
    trend_summary: [
      { label: "New business signals", value: "+7% WoW" },
      { label: "Commercial activity", value: "+4% WoW" },
      { label: "Lead queue promotions", value: "1 this week" },
    ],
  },
];

export function filterSignals(filters: SignalFilters = {}) {
  return signals.filter((signal) => {
    if (filters.city && signal.city !== filters.city) {
      return false;
    }

    if (filters.signal_family && signal.signal_family !== filters.signal_family) {
      return false;
    }

    if (
      filters.buyer_persona &&
      !signal.buyer_personas.includes(filters.buyer_persona)
    ) {
      return false;
    }

    if (
      filters.promotion_status &&
      signal.promotion_status !== filters.promotion_status
    ) {
      return false;
    }

    if (filters.q) {
      const query = filters.q.toLowerCase();
      const haystack = [
        signal.entity_name,
        signal.headline,
        signal.description,
        signal.neighborhood,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

export function getSignalById(id: string) {
  return signals.find((signal) => signal.id === id);
}

export function getLeadQueue() {
  return signals
    .filter((signal) => signal.promotion_status === "lead_queue")
    .sort((a, b) => b.lead_score - a.lead_score);
}

export function getDigestById(id: string) {
  return digests.find((digest) => digest.id === id);
}

export function getDigestSignals(digest: DigestRun) {
  return digest.top_signal_ids
    .map((signalId) => getSignalById(signalId))
    .filter((signal): signal is MarketSignal => Boolean(signal));
}

export function getTrendCards() {
  const leadQueueCount = getLeadQueue().length;
  const kcCount = signals.filter((signal) => signal.city === "Kansas City").length;
  const stjCount = signals.filter((signal) => signal.city === "St. Joseph").length;

  return [
    { label: "Tracked signals", value: String(signals.length), tone: "strong" },
    { label: "Lead queue", value: String(leadQueueCount), tone: "warm" },
    { label: "Kansas City", value: String(kcCount), tone: "cool" },
    { label: "St. Joseph", value: String(stjCount), tone: "cool" },
  ] as const;
}

export function getNeighborhoodActivity() {
  const tally = new Map<string, number>();

  for (const signal of signals) {
    tally.set(signal.neighborhood, (tally.get(signal.neighborhood) ?? 0) + 1);
  }

  return [...tally.entries()]
    .map(([neighborhood, count]) => ({ neighborhood, count }))
    .sort((a, b) => b.count - a.count);
}
