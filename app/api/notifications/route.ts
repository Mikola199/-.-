import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    items: [
      { id: 'n1', type: 'message', text: 'У вас новое сообщение', read: false },
      { id: 'n2', type: 'rating', text: 'Вам поставили 5 звезд', read: false }
    ]
  });
}
