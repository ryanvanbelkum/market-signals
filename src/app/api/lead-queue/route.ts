import { NextResponse } from "next/server";

import { getLeadQueue } from "@/lib/market-signals/data";

export function GET() {
  const queue = getLeadQueue();

  return NextResponse.json({
    data: queue,
    meta: {
      total: queue.length,
    },
  });
}
