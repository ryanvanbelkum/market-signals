import { NextResponse } from "next/server";

import { getDigestById, getDigestSignals } from "@/lib/market-signals/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const digest = getDigestById(id);

  if (!digest) {
    return NextResponse.json({ error: "Digest not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: digest,
    signals: getDigestSignals(digest),
  });
}
