import { NextResponse } from "next/server";

import { getSignalById, promotionEvents, sourceConnectors } from "@/lib/market-signals/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const signal = getSignalById(id);

  if (!signal) {
    return NextResponse.json({ error: "Signal not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: signal,
    connector: sourceConnectors.find((item) => item.id === signal.source_id),
    promotion_history: promotionEvents.filter((item) => item.signal_id === signal.id),
  });
}
