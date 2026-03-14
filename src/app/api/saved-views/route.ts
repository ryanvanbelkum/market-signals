import { NextResponse } from "next/server";

import { savedViews } from "@/lib/market-signals/data";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    name?: string;
    filters?: Record<string, string>;
  };

  return NextResponse.json(
    {
      message:
        "Saved views are mocked in this MVP scaffold. Persist the submitted payload in Postgres next.",
      submitted: payload,
      existing: savedViews,
    },
    { status: 202 },
  );
}
