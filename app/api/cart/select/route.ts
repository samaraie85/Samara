import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    // Get query parameters from the URL
    const url = new URL(request.url);
    const user = url.searchParams.get('user');
    const product = url.searchParams.get('product');

    if (!user || !product) {
        return NextResponse.json(
            { message: 'Missing user or product' },
            { status: 400 }
        );
    }

    try {
        // Get the request body for selected state
        const body = await request.json();
        const { selected } = body;

        // Input validation
        if (selected === undefined) {
            return NextResponse.json(
                { message: 'Selected state must be provided' },
                { status: 400 }
            );
        }

        // Update the selected state for the item
        const { error } = await supabase
            .from('cart')
            .update({ selected })
            .eq('user', user)
            .eq('product', product);

        if (error) {
            return NextResponse.json(
                { message: 'Failed to update selected state', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Item selection state updated successfully',
            selected
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error: (error as Error).message },
            { status: 500 }
        );
    }
} 