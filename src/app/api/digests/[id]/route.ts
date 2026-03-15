import { NextResponse } from "next/server";

import { getDigest, getDigestSignals } from "@/lib/market-signals/repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const digest = await getDigest(id);

  if (!digest) {
    return NextResponse.json({ error: "Digest not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: digest,
    signals: getDigestSignals(digest),
  });
}
