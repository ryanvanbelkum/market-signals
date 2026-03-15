import { NextResponse } from "next/server";

import {
  getSignal,
  listPromotionEvents,
  listSourceConnectors,
} from "@/lib/market-signals/repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const signal = await getSignal(id);

  if (!signal) {
    return NextResponse.json({ error: "Signal not found" }, { status: 404 });
  }

  const [sourceConnectors, promotionEvents] = await Promise.all([
    listSourceConnectors(),
    listPromotionEvents(signal.id),
  ]);

  return NextResponse.json({
    data: signal,
    connector: sourceConnectors.find((item) => item.id === signal.source_id),
    promotion_history: promotionEvents,
  });
}
