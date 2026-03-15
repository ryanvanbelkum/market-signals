import { NextRequest, NextResponse } from "next/server";

import {
  fetchKansasCityFoodPermits,
  getKansasCityFoodPermitConnector,
  normalizeKansasCityFoodPermits,
  toRawSourceRecords,
} from "@/lib/market-signals/connectors/kc-food-permits";
import {
  completeIngestionRun,
  createIngestionRun,
  listIngestionRuns,
  updateConnectorCheckpoint,
  upsertMarketSignals,
  upsertRawSourceRecords,
} from "@/lib/market-signals/repository";

export async function POST(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 200;
  const connector = getKansasCityFoodPermitConnector();
  const run = await createIngestionRun(connector.id);

  try {
    const sourceRows = await fetchKansasCityFoodPermits(
      Number.isFinite(limit) ? limit : 200,
    );
    const rawRecords = toRawSourceRecords(sourceRows);
    const signals = normalizeKansasCityFoodPermits(sourceRows);

    await upsertRawSourceRecords(rawRecords);
    await upsertMarketSignals(signals);
    await updateConnectorCheckpoint(connector.id, {
      checkpoint: new Date().toISOString(),
      status: "healthy",
    });
    await completeIngestionRun(run.id, {
      status: "succeeded",
      recordsFetched: sourceRows.length,
      signalsWritten: signals.length,
      errorMessage: null,
    });

    return NextResponse.json({
      message: "Kansas City food permit sync completed.",
      meta: {
        connector: connector.id,
        records_fetched: sourceRows.length,
        signals_written: signals.length,
        run_id: run.id,
      },
      data: signals.slice(0, 10),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync connector.";

    await updateConnectorCheckpoint(connector.id, {
      checkpoint: new Date().toISOString(),
      status: "delayed",
    });
    await completeIngestionRun(run.id, {
      status: "failed",
      recordsFetched: 0,
      signalsWritten: 0,
      errorMessage: message,
    });

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({
    connector: getKansasCityFoodPermitConnector(),
    runs: await listIngestionRuns(),
  });
}
