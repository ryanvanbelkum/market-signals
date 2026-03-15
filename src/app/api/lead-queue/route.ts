import { NextResponse } from "next/server";

import { listLeadQueue } from "@/lib/market-signals/repository";

export async function GET() {
  const queue = await listLeadQueue();

  return NextResponse.json({
    data: queue,
    meta: {
      total: queue.length,
    },
  });
}
