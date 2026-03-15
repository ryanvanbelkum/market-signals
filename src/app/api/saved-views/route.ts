import { NextResponse } from "next/server";

import { createSavedView, listSavedViews } from "@/lib/market-signals/repository";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      name?: string;
      description?: string;
      filters?: Record<string, string>;
    };

    if (!payload.name || !payload.filters) {
      return NextResponse.json(
        { error: "name and filters are required" },
        { status: 400 },
      );
    }

    const savedView = await createSavedView({
      name: payload.name,
      description: payload.description,
      filters: payload.filters,
    });

    return NextResponse.json(
      {
        message: "Saved view persisted successfully.",
        data: savedView,
        existing: await listSavedViews(),
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to persist saved view.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
