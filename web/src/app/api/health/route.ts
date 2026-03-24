import { NextResponse } from 'next/server';

/** K8s probes: путь без локали, вне next-intl (matcher исключает `api`). */
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
