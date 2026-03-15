import { NextResponse } from 'next/server';
import { signJwt } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const token = signJwt({ userId: 'u1', email: body.email });
  return NextResponse.json({ token, user: { id: 'u1', email: body.email } });
}
