import { NextResponse } from "next/server";

import { digests, getDigestSignals } from "@/lib/market-signals/data";

export async function POST() {
  const latestDigest = digests[0];

  return NextResponse.json({
    message: "Digest generation simulated successfully.",
    data: {
      ...latestDigest,
      signals: getDigestSignals(latestDigest),
    },
  });
}
