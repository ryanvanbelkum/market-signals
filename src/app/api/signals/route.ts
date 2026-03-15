import { NextRequest, NextResponse } from "next/server";

import { listSignals } from "@/lib/market-signals/repository";
import type { SignalFilters } from "@/lib/market-signals/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filters: SignalFilters = {
    city: searchParams.get("city") ?? undefined,
    signal_family: (searchParams.get("signal_family") ??
      undefined) as SignalFilters["signal_family"],
    buyer_persona: (searchParams.get("buyer_persona") ??
      undefined) as SignalFilters["buyer_persona"],
    promotion_status: (searchParams.get("promotion_status") ??
      undefined) as SignalFilters["promotion_status"],
    q: searchParams.get("q") ?? undefined,
  };

  const data = await listSignals(filters);

  return NextResponse.json({
    data,
    meta: {
      filters,
      total: data.length,
    },
  });
}
