import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    // Get query parameters from the URL
    const url = new URL(request.url);
    const user = url.searchParams.get('user');

    if (!user) {
        return NextResponse.json(
            { message: 'Missing user parameter' },
            { status: 400 }
        );
    }

    try {
        // Get the request body
        const body = await request.json();
        const { selected } = body;

        // Input validation
        if (selected === undefined) {
            return NextResponse.json(
                { message: 'Selected state must be provided' },
                { status: 400 }
            );
        }

        // Update all items for this user
        const { error, count } = await supabase
            .from('cart')
            .update({ selected })
            .eq('user', user);

        if (error) {
            return NextResponse.json(
                { message: 'Failed to update all items selection state', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: `All items selection state updated to ${selected}`,
            selected,
            affectedCount: count
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error: (error as Error).message },
            { status: 500 }
        );
    }
} 