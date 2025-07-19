import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCartSummary } from './cartSummaryUtil';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const user = url.searchParams.get('user');

    if (!user) {
        return NextResponse.json(
            { message: 'User ID is required' },
            { status: 400 }
        );
    }

    try {
        const summary = await getCartSummary(supabase, user);
        return NextResponse.json(summary);
    } catch (error) {
        console.error('Error fetching cart summary:', error);
        return NextResponse.json(
            { message: 'Failed to fetch cart summary', error: (error as Error).message },
            { status: 500 }
        );
    }
} 