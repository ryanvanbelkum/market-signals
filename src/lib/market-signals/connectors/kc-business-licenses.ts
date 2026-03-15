import crypto from "node:crypto";

import { inferBusinessType, inferBuyerPersonas, scoreBusinessLicenseSignal } from "@/lib/market-signals/scoring";
import type { MarketSignal, RawSourceRecord, SourceConnector } from "@/lib/market-signals/types";

const CONNECTOR_ID = "kcmo-business-licenses";
const DEFAULT_BASE_URL = "https://data.kcmo.org";
const DEFAULT_DATASET_ID = "pnm4-68wg";

type SourceRow = Record<string, unknown>;

export function getKansasCityBusinessLicenseConnector(): SourceConnector {
  return {
    id: CONNECTOR_ID,
    name: "Kansas City Business License Holders",
    source_type: "business_license",
    region: "Kansas City, MO",
    cadence: "daily",
    checkpoint: new Date(0).toISOString(),
    status: "healthy",
  };
}

export async function fetchKansasCityBusinessLicenses(limit = 200) {
  const datasetId =
    process.env.MARKET_SIGNALS_KCMO_BUSINESS_LICENSES_DATASET_ID ??
    DEFAULT_DATASET_ID;
  const baseUrl =
    process.env.MARKET_SIGNALS_KCMO_BUSINESS_LICENSES_BASE_URL ??
    DEFAULT_BASE_URL;

  const url = new URL(`${baseUrl}/resource/${datasetId}.json`);
  url.searchParams.set("$limit", String(limit));

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(
      `Kansas City business license fetch failed with ${response.status}.`,
    );
  }

  const rows = (await response.json()) as SourceRow[];
  return rows;
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

export function normalizeKansasCityBusinessLicenses(rows: SourceRow[]) {
  return rows
    .map((row) => normalizeKansasCityBusinessLicense(row))
    .filter((signal): signal is MarketSignal => Boolean(signal));
}

function normalizeKansasCityBusinessLicense(row: SourceRow): MarketSignal | null {
  const entityName =
    readString(row, [
      "doing_business_as_name",
      "dba_name",
      "business_name",
      "company_name",
      "organization_name",
      "legal_name",
      "business_owner",
    ]) ?? "Unknown business";

  const signalDate =
    normalizeDateString(
      readString(row, [
        "license_start_date",
        "license_issue_date",
        "issue_date",
        "application_date",
        "created_date",
        "start_date",
      ]),
    ) ?? new Date().toISOString().slice(0, 10);

  const addressLine =
    firstNonEmpty([
      readString(row, ["full_address", "business_address", "address"]),
      buildAddress(row),
    ]) ?? "Address unavailable";

  const postalCode =
    readString(row, ["zip_code", "postal_code", "zipcode"]) ?? "64106";

  const neighborhood =
    readString(row, ["neighborhood", "council_district", "area"]) ??
    "Kansas City";

  const businessType = inferBusinessType(entityName, JSON.stringify(row));
  const buyerPersonas = inferBuyerPersonas(entityName, businessType);
  const score = scoreBusinessLicenseSignal({
    entityName,
    businessType,
    hasAddress: addressLine !== "Address unavailable",
    hasRecentDate: Boolean(signalDate),
  });

  const sourceRecordKey = chooseSourceRecordKey(row);
  const lat = readNumber(row, ["latitude", "lat"]) ?? 39.0997;
  const lng = readNumber(row, ["longitude", "lng", "lon"]) ?? -94.5786;
  const sourceUrl = sourceUrlForRecord(sourceRecordKey);
  const statusValue = readString(row, ["status", "license_status"]);

  return {
    id: `sig-${CONNECTOR_ID}-${sourceRecordKey}`,
    source_id: CONNECTOR_ID,
    source_type: "business_license",
    source_record_key: sourceRecordKey,
    entity_name: entityName,
    entity_type: businessType,
    address_line: addressLine,
    city: "Kansas City",
    state: "MO",
    postal_code: postalCode,
    lat,
    lng,
    neighborhood,
    signal_family: "new_business",
    signal_type: "business_license_issued",
    signal_date: signalDate,
    headline: `${entityName} appears in Kansas City business license activity`,
    description:
      "Detected from Kansas City open business-license data and normalized into the local-market signal feed.",
    source_url: sourceUrl,
    raw_status: normalizeRawStatus(statusValue),
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

function readNumber(row: SourceRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function firstNonEmpty(values: Array<string | null>) {
  return values.find((value) => value && value.trim()) ?? null;
}

function buildAddress(row: SourceRow) {
  const line1 = readString(row, ["address_line_1", "street_address", "street"]);
  const line2 = readString(row, ["address_line_2", "suite"]);

  if (!line1) {
    return null;
  }

  return line2 ? `${line1}, ${line2}` : line1;
}

function normalizeDateString(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function chooseSourceRecordKey(row: SourceRow) {
  return (
    readString(row, [
      "license_number",
      "license_no",
      "business_license_number",
      "account_number",
      "id",
    ]) ??
    crypto.createHash("sha1").update(JSON.stringify(row)).digest("hex").slice(0, 16)
  );
}

function sourceUrlForRecord(sourceRecordKey: string) {
  const datasetId =
    process.env.MARKET_SIGNALS_KCMO_BUSINESS_LICENSES_DATASET_ID ??
    DEFAULT_DATASET_ID;

  return `${DEFAULT_BASE_URL}/resource/${datasetId}.json?$limit=1&$where=${encodeURIComponent(
    `license_number='${sourceRecordKey}'`,
  )}`;
}

function normalizeRawStatus(value: string | null): MarketSignal["raw_status"] {
  const normalized = value?.toLowerCase();

  if (normalized?.includes("pending")) {
    return "pending";
  }

  if (normalized?.includes("issued") || normalized?.includes("active")) {
    return "issued";
  }

  return "active";
}
