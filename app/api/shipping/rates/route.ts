import { NextRequest, NextResponse } from "next/server";
import { getShippingRates } from "@/lib/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zone = (searchParams.get("zone") ?? "FR").toUpperCase();
  const rates = await getShippingRates(zone);
  return NextResponse.json({ rates });
}
