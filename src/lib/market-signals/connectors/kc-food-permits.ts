import crypto from "node:crypto";

import {
  inferBuyerPersonas,
  inferFoodServiceBusinessType,
  scoreFoodPermitSignal,
} from "@/lib/market-signals/scoring";
import type {
  MarketSignal,
  RawSourceRecord,
  SourceConnector,
} from "@/lib/market-signals/types";

const CONNECTOR_ID = "kcmo-food-permits";
const DEFAULT_BASE_URL = "https://data.kcmo.org";
const DEFAULT_DATASET_ID = "sz9c-c5ux";

type SourceRow = Record<string, unknown>;

export function getKansasCityFoodPermitConnector(): SourceConnector {
  return {
    id: CONNECTOR_ID,
    name: "Kansas City Food Permits",
    source_type: "health_inspection",
    region: "Kansas City, MO",
    cadence: "daily",
    checkpoint: new Date(0).toISOString(),
    status: "healthy",
  };
}

export async function fetchKansasCityFoodPermits(limit = 200) {
  const datasetId =
    process.env.MARKET_SIGNALS_KCMO_FOOD_PERMITS_DATASET_ID ?? DEFAULT_DATASET_ID;
  const baseUrl =
    process.env.MARKET_SIGNALS_KCMO_FOOD_PERMITS_BASE_URL ?? DEFAULT_BASE_URL;

  const url = new URL(`${baseUrl}/resource/${datasetId}.json`);
  url.searchParams.set("$limit", String(limit));
  url.searchParams.set(
    "$where",
    "facility_city = 'Kansas City' AND facility_state = 'MISSOURI'",
  );

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Kansas City food permit fetch failed with ${response.status}.`);
  }

  return (await response.json()) as SourceRow[];
}

export function toRawSourceRecords(rows: SourceRow[]): RawSourceRecord[] {
  const fetchedAt = new Date().toISOString();

  return rows.map((row) => {
    const sourceRecordKey = chooseSourceRecordKey(row);
    return {
      id: `raw-${CONNECTOR_ID}-${sourceRecordKey}`,
      connector_id: CONNECTOR_ID,
      source_record_key: sourceRecordKey,
      payload: row,
      fetched_at: fetchedAt,
    };
  });
}

export function normalizeKansasCityFoodPermits(rows: SourceRow[]) {
  return rows
    .map((row) => normalizeKansasCityFoodPermit(row))
    .filter((signal): signal is MarketSignal => Boolean(signal));
}

function normalizeKansasCityFoodPermit(row: SourceRow): MarketSignal | null {
  const permitType = readString(row, ["permit_type", "facility_type"]) ?? "Food permit";
  const entityName =
    readString(row, ["establishment_name", "facility_name"]) ?? "Unnamed food business";
  const addressLine =
    readString(row, ["facility_address"]) ??
    readLocationField(row, "address") ??
    "Address unavailable";
  const postalCode =
    readString(row, ["facility_zip"]) ?? readLocationField(row, "zip") ?? "Unknown";
  const operationalStatus =
    readString(row, ["operational_status", "business_status"]) ?? "Unknown";
  const businessType = inferFoodServiceBusinessType(entityName, permitType);
  const buyerPersonas = inferBuyerPersonas(entityName, businessType);
  const score = scoreFoodPermitSignal({
    entityName,
    permitType,
    operationalStatus,
    hasAddress: addressLine !== "Address unavailable",
  });
  const sourceRecordKey = chooseSourceRecordKey(row);
  const lat = readLocationCoordinate(row, "latitude");
  const lng = readLocationCoordinate(row, "longitude");
  const signalDate = new Date().toISOString().slice(0, 10);

  return {
    id: `sig-${CONNECTOR_ID}-${sourceRecordKey}`,
    source_id: CONNECTOR_ID,
    source_type: "health_inspection",
    source_record_key: sourceRecordKey,
    entity_name: entityName,
    entity_type: businessType,
    address_line: addressLine,
    city: "Kansas City",
    state: "MO",
    postal_code: postalCode,
    lat,
    lng,
    neighborhood: "Unknown area",
    signal_family: "commercial_activity",
    signal_type: "food_permit_active",
    signal_date: signalDate,
    headline: `${entityName} appears in Kansas City food permit activity`,
    description:
      "Detected from Kansas City open food permit data and normalized into the local-market signal feed.",
    source_url: sourceUrlForRecord(sourceRecordKey),
    raw_status: normalizeRawStatus(operationalStatus),
    buyer_personas: buyerPersonas,
    confidence_score: score.confidenceScore,
    lead_score: score.leadScore,
    promotion_status: score.promotionStatus,
    dedupe_group_id: crypto
      .createHash("sha1")
      .update(`${entityName.toLowerCase()}|${addressLine.toLowerCase()}`)
      .digest("hex")
      .slice(0, 16),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function readString(row: SourceRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function chooseSourceRecordKey(row: SourceRow) {
  return (
    readString(row, ["facility_permit"]) ??
    crypto.createHash("sha1").update(JSON.stringify(row)).digest("hex").slice(0, 16)
  );
}

function readLocationField(row: SourceRow, field: "address" | "city" | "state" | "zip") {
  const location = row.location_1;

  if (!location || typeof location !== "object" || !("human_address" in location)) {
    return null;
  }

  const humanAddress = location.human_address;
  if (typeof humanAddress !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(humanAddress) as Record<string, unknown>;
    const value = parsed[field];
    return typeof value === "string" && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

function readLocationCoordinate(row: SourceRow, field: "latitude" | "longitude") {
  const location = row.location_1;

  if (!location || typeof location !== "object") {
    return Number.NaN;
  }

  const value = (location as Record<string, unknown>)[field];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return Number.NaN;
}

function normalizeRawStatus(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("operational") || normalized.includes("open")) {
    return "active" as const;
  }

  if (normalized.includes("pending")) {
    return "pending" as const;
  }

  return "issued" as const;
}

function sourceUrlForRecord(sourceRecordKey: string) {
  const datasetId =
    process.env.MARKET_SIGNALS_KCMO_FOOD_PERMITS_DATASET_ID ?? DEFAULT_DATASET_ID;

  return `${DEFAULT_BASE_URL}/resource/${datasetId}.json?$limit=1&$where=${encodeURIComponent(
    `facility_permit='${sourceRecordKey}'`,
  )}`;
}
