import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    try {
        const { user, rating, commnet } = await req.json();
        if (!user || !rating || !commnet) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }
        const { data, error } = await supabase.from('reviews').insert([
            { user, rating, commnet }
        ]).select().single();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ review: data });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Server error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 