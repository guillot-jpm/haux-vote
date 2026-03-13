import { NextResponse } from 'next/server';
import { getElectionState } from '@/actions/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = await getElectionState();
    return NextResponse.json(state);
  } catch (error) {
    console.error('Error fetching election state:', error);
    return NextResponse.json({ error: 'Failed to fetch election state' }, { status: 500 });
  }
}
