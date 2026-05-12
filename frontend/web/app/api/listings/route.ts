import { NextResponse } from 'next/server';
import { listings } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({ items: listings });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(
    {
      item: {
        id: crypto.randomUUID(),
        ...body,
        createdAt: new Date().toISOString()
      }
    },
    { status: 201 }
  );
}
