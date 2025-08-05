// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getMessages, createMessage } from '@/app/api/messages/controller';

export const GET = async (req: NextRequest) => {
  try {
    const messages = await getMessages();
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const message = await createMessage(body);
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
