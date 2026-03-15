import { NextResponse } from 'next/server';

const mockMessages = [
  { id: 'm1', from: 'Ольга', to: 'Вы', text: 'Здравствуйте! Товар еще актуален?', createdAt: new Date().toISOString() }
];

export async function GET() {
  return NextResponse.json({ items: mockMessages });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: { id: crypto.randomUUID(), ...body, createdAt: new Date().toISOString() } }, { status: 201 });
}
