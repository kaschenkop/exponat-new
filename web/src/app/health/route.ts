import { NextResponse } from "next/server";

/** Liveness/readiness для Kubernetes (Helm probes). */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
