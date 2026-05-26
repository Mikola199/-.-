import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  // In a real monorepo, this would call the auth-service
  return NextResponse.json({
    token: "mock-token",
    user: { id: 'u1', email: body.email }
  });
}
