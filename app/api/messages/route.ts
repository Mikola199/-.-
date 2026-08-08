import { NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';

const mockMessages = [
  { id: 'm1', from: 'Ольга', to: 'Вы', text: 'Здравствуйте! Товар еще актуален?', createdAt: new Date().toISOString() }
];

export async function GET() {
  return NextResponse.json({ items: mockMessages });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid token format' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const payload = verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized: Token is invalid or has expired' }, { status: 401 });
  }

  const body = await request.json();

  // Derive message sender from verified token
  const senderId = payload.userId;

  // Reject request if client is trying to spoof the sender
  if (body.from && body.from !== senderId && body.from !== payload.email) {
    return NextResponse.json({ error: 'Forbidden: Cannot send message as another user' }, { status: 403 });
  }

  const newMessage = {
    id: crypto.randomUUID(),
    from: senderId,
    to: body.to || 'system',
    text: body.text || '',
    createdAt: new Date().toISOString()
  };

  return NextResponse.json({ message: newMessage }, { status: 201 });
}
