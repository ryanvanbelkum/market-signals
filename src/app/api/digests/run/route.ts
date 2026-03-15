import { NextResponse } from "next/server";

import { generateDigestRun, getDigestSignals } from "@/lib/market-signals/repository";

export async function POST() {
  try {
    const latestDigest = await generateDigestRun();

    return NextResponse.json({
      message: "Digest generation completed and persisted.",
      data: {
        ...latestDigest,
        signals: await getDigestSignals(latestDigest),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate digest.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
