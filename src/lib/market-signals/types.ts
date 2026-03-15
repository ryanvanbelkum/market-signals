export type SourceType =
  | "business_license"
  | "building_permit"
  | "health_inspection"
  | "hiring_signal";

export type SignalFamily =
  | "new_business"
  | "commercial_activity"
  | "demand_signal";

export type PromotionStatus = "feed_only" | "watch" | "lead_queue";

export type BuyerPersona =
  | "payroll"
  | "pos"
  | "merchant_services"
  | "uniforms"
  | "janitorial"
  | "food_distribution";

export interface MarketSignal {
  id: string;
  source_id: string;
  source_type: SourceType;
  source_record_key: string;
  entity_name: string;
  entity_type: "llc" | "corporation" | "restaurant" | "commercial_property";
  address_line: string;
  city: "Kansas City" | "St. Joseph";
  state: "MO";
  postal_code: string;
  lat: number;
  lng: number;
  neighborhood: string;
  signal_family: SignalFamily;
  signal_type: string;
  signal_date: string;
  headline: string;
  description: string;
  source_url: string;
  raw_status: "active" | "pending" | "issued";
  buyer_personas: BuyerPersona[];
  confidence_score: number;
  lead_score: number;
  promotion_status: PromotionStatus;
  dedupe_group_id: string;
  created_at: string;
  updated_at: string;
}

export interface SourceConnector {
  id: string;
  name: string;
  source_type: SourceType;
  region: string;
  cadence: "daily" | "weekly";
  checkpoint: string;
  status: "healthy" | "delayed";
}

export interface Entity {
  id: string;
  entity_name: string;
  canonical_name: string;
  city: string;
  neighborhood: string;
  address_line: string;
}

export interface SavedView {
  id: string;
  name: string;
  description: string;
  filters: {
    city?: string;
    signal_family?: SignalFamily;
    buyer_persona?: BuyerPersona;
    promotion_status?: PromotionStatus;
  };
}

export interface PromotionEvent {
  id: string;
  signal_id: string;
  previous_status: PromotionStatus;
  next_status: PromotionStatus;
  reason: string;
  created_at: string;
}

export interface DigestRun {
  id: string;
  title: string;
  generated_at: string;
  summary: string;
  top_signal_ids: string[];
  trend_summary: {
    label: string;
    value: string;
  }[];
}

export interface SignalFilters {
  city?: string;
  signal_family?: SignalFamily;
  buyer_persona?: BuyerPersona;
  promotion_status?: PromotionStatus;
  q?: string;
}

export interface IngestionRun {
  id: string;
  connector_id: string;
  started_at: string;
  completed_at: string | null;
  status: "running" | "succeeded" | "failed";
  records_fetched: number;
  signals_written: number;
  error_message: string | null;
}

export interface RawSourceRecord {
  id: string;
  connector_id: string;
  source_record_key: string;
  payload: Record<string, unknown>;
  fetched_at: string;
}
