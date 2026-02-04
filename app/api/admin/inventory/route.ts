import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ inventory: [] }, { status: 200 });
}

export async function PUT(request: NextRequest) {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}

