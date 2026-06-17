import { NextResponse } from 'next/server';
import { signJwt } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const token = signJwt({ userId: 'u-new', email: body.email });
  return NextResponse.json({ token, user: { id: 'u-new', email: body.email, name: body.name } }, { status: 201 });
}
