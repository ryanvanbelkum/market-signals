import "server-only";

import crypto from "node:crypto";

import { getSql, isDatabaseConfigured } from "@/lib/postgres";
import { getKansasCityBusinessLicenseConnector } from "@/lib/market-signals/connectors/kc-business-licenses";
import { getKansasCityFoodPermitConnector } from "@/lib/market-signals/connectors/kc-food-permits";
import type {
  DigestRun,
  Entity,
  IngestionRun,
  MarketSignal,
  PromotionEvent,
  RawSourceRecord,
  SavedView,
  SignalFilters,
  SourceConnector,
} from "@/lib/market-signals/types";

type JsonRecord = Record<string, unknown>;

const globalForMarketSignals = globalThis as typeof globalThis & {
  __marketSignalsDatabaseReady?: boolean;
  __marketSignalsDatabaseReadyPromise?: Promise<boolean>;
};

function getDefaultSourceConnectors() {
  return [
    getKansasCityBusinessLicenseConnector(),
    getKansasCityFoodPermitConnector(),
  ];
}

async function initializeDatabase() {
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    const sql = getSql();
    await sql`
      create table if not exists market_signals (
        id text primary key,
        source_id text not null,
        source_type text not null,
        source_record_key text not null,
        entity_name text not null,
        entity_type text not null,
        address_line text not null,
        city text not null,
        state text not null,
        postal_code text not null,
        lat double precision not null,
        lng double precision not null,
        neighborhood text not null,
        signal_family text not null,
        signal_type text not null,
        signal_date text not null,
        headline text not null,
        description text not null,
        source_url text not null,
        raw_status text not null,
        buyer_personas jsonb not null default '[]'::jsonb,
        confidence_score double precision not null,
        lead_score integer not null,
        promotion_status text not null,
        dedupe_group_id text not null,
        created_at text not null,
        updated_at text not null
      )
    `;

    await sql`
      create table if not exists source_connectors (
        id text primary key,
        name text not null,
        source_type text not null,
        region text not null,
        cadence text not null,
        checkpoint text not null,
        status text not null
      )
    `;

    await sql`
      create table if not exists entities (
        id text primary key,
        entity_name text not null,
        canonical_name text not null,
        city text not null,
        neighborhood text not null,
        address_line text not null
      )
    `;

    await sql`
      create table if not exists saved_views (
        id text primary key,
        name text not null,
        description text not null,
        filters jsonb not null default '{}'::jsonb
      )
    `;

    await sql`
      create table if not exists promotion_events (
        id text primary key,
        signal_id text not null,
        previous_status text not null,
        next_status text not null,
        reason text not null,
        created_at text not null
      )
    `;

    await sql`
      create table if not exists digest_runs (
        id text primary key,
        title text not null,
        generated_at text not null,
        summary text not null,
        top_signal_ids jsonb not null default '[]'::jsonb,
        trend_summary jsonb not null default '[]'::jsonb
      )
    `;

    await sql`
      create table if not exists raw_source_records (
        id text primary key,
        connector_id text not null,
        source_record_key text not null,
        payload jsonb not null,
        fetched_at text not null
      )
    `;

    await sql`
      create table if not exists ingestion_runs (
        id text primary key,
        connector_id text not null,
        started_at text not null,
        completed_at text,
        status text not null,
        records_fetched integer not null default 0,
        signals_written integer not null default 0,
        error_message text
      )
    `;

    for (const connector of getDefaultSourceConnectors()) {
      await sql`
        insert into source_connectors (id, name, source_type, region, cadence, checkpoint, status)
        values (
          ${connector.id},
          ${connector.name},
          ${connector.source_type},
          ${connector.region},
          ${connector.cadence},
          ${connector.checkpoint},
          ${connector.status}
        )
        on conflict (id) do update
        set
          name = excluded.name,
          source_type = excluded.source_type,
          region = excluded.region,
          cadence = excluded.cadence,
          status = excluded.status
      `;
    }

    globalForMarketSignals.__marketSignalsDatabaseReady = true;
    return true;
  } catch (error) {
    console.warn("Market Signals database unavailable.", error);
    return false;
  }
}

export async function ensureDatabase() {
  if (globalForMarketSignals.__marketSignalsDatabaseReady) {
    return true;
  }

  if (!globalForMarketSignals.__marketSignalsDatabaseReadyPromise) {
    globalForMarketSignals.__marketSignalsDatabaseReadyPromise =
      initializeDatabase().finally(() => {
        globalForMarketSignals.__marketSignalsDatabaseReadyPromise = undefined;
      });
  }

  return globalForMarketSignals.__marketSignalsDatabaseReadyPromise;
}

function normalizeSignal(row: JsonRecord): MarketSignal {
  return {
    id: String(row.id),
    source_id: String(row.source_id),
    source_type: row.source_type as MarketSignal["source_type"],
    source_record_key: String(row.source_record_key),
    entity_name: String(row.entity_name),
    entity_type: row.entity_type as MarketSignal["entity_type"],
    address_line: String(row.address_line),
    city: row.city as MarketSignal["city"],
    state: row.state as MarketSignal["state"],
    postal_code: String(row.postal_code),
    lat: Number(row.lat),
    lng: Number(row.lng),
    neighborhood: String(row.neighborhood),
    signal_family: row.signal_family as MarketSignal["signal_family"],
    signal_type: String(row.signal_type),
    signal_date: String(row.signal_date),
    headline: String(row.headline),
    description: String(row.description),
    source_url: String(row.source_url),
    raw_status: row.raw_status as MarketSignal["raw_status"],
    buyer_personas: (row.buyer_personas ?? []) as MarketSignal["buyer_personas"],
    confidence_score: Number(row.confidence_score),
    lead_score: Number(row.lead_score),
    promotion_status: row.promotion_status as MarketSignal["promotion_status"],
    dedupe_group_id: String(row.dedupe_group_id),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function normalizeDigest(row: JsonRecord): DigestRun {
  return {
    id: String(row.id),
    title: String(row.title),
    generated_at: String(row.generated_at),
    summary: String(row.summary),
    top_signal_ids: (row.top_signal_ids ?? []) as string[],
    trend_summary: (row.trend_summary ?? []) as DigestRun["trend_summary"],
  };
}

function normalizeSavedView(row: JsonRecord): SavedView {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    filters: (row.filters ?? {}) as SavedView["filters"],
  };
}

function normalizeConnector(row: JsonRecord): SourceConnector {
  return {
    id: String(row.id),
    name: String(row.name),
    source_type: row.source_type as SourceConnector["source_type"],
    region: String(row.region),
    cadence: row.cadence as SourceConnector["cadence"],
    checkpoint: String(row.checkpoint),
    status: row.status as SourceConnector["status"],
  };
}

function normalizePromotionEvent(row: JsonRecord): PromotionEvent {
  return {
    id: String(row.id),
    signal_id: String(row.signal_id),
    previous_status: row.previous_status as PromotionEvent["previous_status"],
    next_status: row.next_status as PromotionEvent["next_status"],
    reason: String(row.reason),
    created_at: String(row.created_at),
  };
}

function normalizeEntity(row: JsonRecord): Entity {
  return {
    id: String(row.id),
    entity_name: String(row.entity_name),
    canonical_name: String(row.canonical_name),
    city: String(row.city),
    neighborhood: String(row.neighborhood),
    address_line: String(row.address_line),
  };
}

function normalizeIngestionRun(row: JsonRecord): IngestionRun {
  return {
    id: String(row.id),
    connector_id: String(row.connector_id),
    started_at: String(row.started_at),
    completed_at: row.completed_at ? String(row.completed_at) : null,
    status: row.status as IngestionRun["status"],
    records_fetched: Number(row.records_fetched),
    signals_written: Number(row.signals_written),
    error_message: row.error_message ? String(row.error_message) : null,
  };
}

export async function listSignals(filters: SignalFilters = {}) {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<JsonRecord[]>`
    select *
    from market_signals
    where (${filters.city ?? null}::text is null or city = ${filters.city ?? null})
      and (
        ${filters.signal_family ?? null}::text is null
        or signal_family = ${filters.signal_family ?? null}
      )
      and (
        ${filters.promotion_status ?? null}::text is null
        or promotion_status = ${filters.promotion_status ?? null}
      )
    order by signal_date desc, lead_score desc
  `;

  return rows.map(normalizeSignal).filter((signal) => {
    if (
      filters.buyer_persona &&
      !signal.buyer_personas.includes(filters.buyer_persona)
    ) {
      return false;
    }

    if (filters.q) {
      const query = filters.q.toLowerCase();
      return [
        signal.entity_name,
        signal.headline,
        signal.description,
        signal.neighborhood,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    }

    return true;
  });
}

export async function getSignal(id: string) {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    return null;
  }

  const sql = getSql();
  const rows = await sql<JsonRecord[]>`
    select * from market_signals where id = ${id} limit 1
  `;

  return rows[0] ? normalizeSignal(rows[0]) : null;
}

export async function listLeadQueue() {
  const rows = await listSignals({ promotion_status: "lead_queue" });
  return rows.sort((a, b) => b.lead_score - a.lead_score);
}

export async function listSavedViews() {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<JsonRecord[]>`
    select * from saved_views order by name asc
  `;

  return rows.map(normalizeSavedView);
}

export async function createSavedView(input: {
  name: string;
  description?: string;
  filters: SavedView["filters"];
}) {
  const databaseReady = await ensureDatabase();

  const view: SavedView = {
    id: `view-${crypto.randomUUID()}`,
    name: input.name,
    description: input.description ?? "Custom saved view",
    filters: input.filters,
  };

  if (!databaseReady) {
    throw new Error("Database is unavailable.");
  }

  const sql = getSql();
  await sql`
    insert into saved_views (id, name, description, filters)
    values (
      ${view.id},
      ${view.name},
      ${view.description},
      ${sql.json(view.filters)}
    )
  `;

  return view;
}

export async function listDigests() {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<JsonRecord[]>`
    select * from digest_runs order by generated_at desc
  `;

  return rows.map(normalizeDigest);
}

export async function getDigest(id: string) {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    return null;
  }

  const sql = getSql();
  const rows = await sql<JsonRecord[]>`
    select * from digest_runs where id = ${id} limit 1
  `;

  return rows[0] ? normalizeDigest(rows[0]) : null;
}

export async function generateDigestRun() {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    throw new Error("Database is unavailable.");
  }

  const leadQueue = await listLeadQueue();
  const topSignals = leadQueue.slice(0, 3);
  const allSignals = await listSignals();
  const latestDigest: DigestRun = {
    id: `digest-${new Date().toISOString().slice(0, 10)}`,
    title: "Market Signals Automated Brief",
    generated_at: new Date().toISOString(),
    summary:
      "Automated daily/weekly digest generated from the highest-confidence local sales triggers currently in the system.",
    top_signal_ids: topSignals.map((signal) => signal.id),
    trend_summary: [
      { label: "Tracked signals", value: `${allSignals.length}` },
      { label: "Lead queue", value: `${leadQueue.length}` },
      {
        label: "Top neighborhood",
        value: topSignals[0]?.neighborhood ?? "No promotions yet",
      },
    ],
  };

  const sql = getSql();
  await sql`
    insert into digest_runs (id, title, generated_at, summary, top_signal_ids, trend_summary)
    values (
      ${latestDigest.id},
      ${latestDigest.title},
      ${latestDigest.generated_at},
      ${latestDigest.summary},
      ${sql.json(latestDigest.top_signal_ids)},
      ${sql.json(latestDigest.trend_summary)}
    )
    on conflict (id) do update
    set
      title = excluded.title,
      generated_at = excluded.generated_at,
      summary = excluded.summary,
      top_signal_ids = excluded.top_signal_ids,
      trend_summary = excluded.trend_summary
  `;

  return latestDigest;
}

export async function getDigestSignals(digest: DigestRun) {
  const records = await Promise.all(
    digest.top_signal_ids.map((signalId) => getSignal(signalId)),
  );

  return records.filter((record): record is MarketSignal => Boolean(record));
}

export async function listPromotionEvents(signalId: string) {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<JsonRecord[]>`
    select *
    from promotion_events
    where signal_id = ${signalId}
    order by created_at desc
  `;

  return rows.map(normalizePromotionEvent);
}

export async function listSourceConnectors() {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<JsonRecord[]>`
    select * from source_connectors order by name asc
  `;

  return rows.map(normalizeConnector);
}

export async function upsertMarketSignals(signals: MarketSignal[]) {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    throw new Error("Database is unavailable.");
  }

  const sql = getSql();

  for (const signal of signals) {
    await sql`
      insert into market_signals (
        id,
        source_id,
        source_type,
        source_record_key,
        entity_name,
        entity_type,
        address_line,
        city,
        state,
        postal_code,
        lat,
        lng,
        neighborhood,
        signal_family,
        signal_type,
        signal_date,
        headline,
        description,
        source_url,
        raw_status,
        buyer_personas,
        confidence_score,
        lead_score,
        promotion_status,
        dedupe_group_id,
        created_at,
        updated_at
      )
      values (
        ${signal.id},
        ${signal.source_id},
        ${signal.source_type},
        ${signal.source_record_key},
        ${signal.entity_name},
        ${signal.entity_type},
        ${signal.address_line},
        ${signal.city},
        ${signal.state},
        ${signal.postal_code},
        ${signal.lat},
        ${signal.lng},
        ${signal.neighborhood},
        ${signal.signal_family},
        ${signal.signal_type},
        ${signal.signal_date},
        ${signal.headline},
        ${signal.description},
        ${signal.source_url},
        ${signal.raw_status},
        ${sql.json(signal.buyer_personas)},
        ${signal.confidence_score},
        ${signal.lead_score},
        ${signal.promotion_status},
        ${signal.dedupe_group_id},
        ${signal.created_at},
        ${signal.updated_at}
      )
      on conflict (id) do update
      set
        entity_name = excluded.entity_name,
        entity_type = excluded.entity_type,
        address_line = excluded.address_line,
        city = excluded.city,
        state = excluded.state,
        postal_code = excluded.postal_code,
        lat = excluded.lat,
        lng = excluded.lng,
        neighborhood = excluded.neighborhood,
        signal_family = excluded.signal_family,
        signal_type = excluded.signal_type,
        signal_date = excluded.signal_date,
        headline = excluded.headline,
        description = excluded.description,
        source_url = excluded.source_url,
        raw_status = excluded.raw_status,
        buyer_personas = excluded.buyer_personas,
        confidence_score = excluded.confidence_score,
        lead_score = excluded.lead_score,
        promotion_status = excluded.promotion_status,
        dedupe_group_id = excluded.dedupe_group_id,
        updated_at = excluded.updated_at
    `;
  }
}

export async function upsertRawSourceRecords(records: RawSourceRecord[]) {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    throw new Error("Database is unavailable.");
  }

  const sql = getSql();

  for (const record of records) {
    await sql`
      insert into raw_source_records (id, connector_id, source_record_key, payload, fetched_at)
      values (
        ${record.id},
        ${record.connector_id},
        ${record.source_record_key},
        ${sql.json(JSON.parse(JSON.stringify(record.payload)))},
        ${record.fetched_at}
      )
      on conflict (id) do update
      set
        payload = excluded.payload,
        fetched_at = excluded.fetched_at
    `;
  }
}

export async function createIngestionRun(connectorId: string) {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    throw new Error("Database is unavailable.");
  }

  const run: IngestionRun = {
    id: `ing-${crypto.randomUUID()}`,
    connector_id: connectorId,
    started_at: new Date().toISOString(),
    completed_at: null,
    status: "running",
    records_fetched: 0,
    signals_written: 0,
    error_message: null,
  };

  const sql = getSql();
  await sql`
    insert into ingestion_runs (
      id,
      connector_id,
      started_at,
      completed_at,
      status,
      records_fetched,
      signals_written,
      error_message
    )
    values (
      ${run.id},
      ${run.connector_id},
      ${run.started_at},
      ${run.completed_at},
      ${run.status},
      ${run.records_fetched},
      ${run.signals_written},
      ${run.error_message}
    )
  `;

  return run;
}

export async function completeIngestionRun(
  runId: string,
  input: {
    status: IngestionRun["status"];
    recordsFetched: number;
    signalsWritten: number;
    errorMessage?: string | null;
  },
) {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    throw new Error("Database is unavailable.");
  }

  const sql = getSql();
  await sql`
    update ingestion_runs
    set
      completed_at = ${new Date().toISOString()},
      status = ${input.status},
      records_fetched = ${input.recordsFetched},
      signals_written = ${input.signalsWritten},
      error_message = ${input.errorMessage ?? null}
    where id = ${runId}
  `;
}

export async function updateConnectorCheckpoint(
  connectorId: string,
  input: {
    checkpoint: string;
    status: SourceConnector["status"];
  },
) {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    throw new Error("Database is unavailable.");
  }

  const sql = getSql();
  await sql`
    update source_connectors
    set checkpoint = ${input.checkpoint}, status = ${input.status}
    where id = ${connectorId}
  `;
}

export async function listIngestionRuns() {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<JsonRecord[]>`
    select * from ingestion_runs order by started_at desc limit 20
  `;

  return rows.map(normalizeIngestionRun);
}

export async function listEntities() {
  const databaseReady = await ensureDatabase();

  if (!databaseReady) {
    return [];
  }

  const sql = getSql();
  const rows = await sql<JsonRecord[]>`
    select * from entities order by canonical_name asc
  `;

  return rows.map(normalizeEntity);
}

export async function getTrendCards() {
  const [allSignals, leadQueue] = await Promise.all([
    listSignals(),
    listLeadQueue(),
  ]);

  const kcCount = allSignals.filter((signal) => signal.city === "Kansas City").length;
  const stjCount = allSignals.filter((signal) => signal.city === "St. Joseph").length;

  return [
    { label: "Tracked signals", value: String(allSignals.length), tone: "strong" },
    { label: "Lead queue", value: String(leadQueue.length), tone: "warm" },
    { label: "Kansas City", value: String(kcCount), tone: "cool" },
    { label: "St. Joseph", value: String(stjCount), tone: "cool" },
  ] as const;
}

export async function getNeighborhoodActivity() {
  const allSignals = await listSignals();
  const tally = new Map<string, number>();

  for (const signal of allSignals) {
    tally.set(signal.neighborhood, (tally.get(signal.neighborhood) ?? 0) + 1);
  }

  return [...tally.entries()]
    .map(([neighborhood, count]) => ({ neighborhood, count }))
    .sort((a, b) => b.count - a.count);
}
