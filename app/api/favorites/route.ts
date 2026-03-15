import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ items: ['1', '2'] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true, listingId: body.listingId }, { status: 201 });
}
