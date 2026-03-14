import { NextRequest, NextResponse } from "next/server";

import { filterSignals } from "@/lib/market-signals/data";
import type { SignalFilters } from "@/lib/market-signals/types";

export function GET(request: NextRequest) {
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

  return NextResponse.json({
    data: filterSignals(filters),
    meta: {
      filters,
      total: filterSignals(filters).length,
    },
  });
}
