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
        const { selected, productIds } = body;

        // Input validation
        if (selected === undefined) {
            return NextResponse.json(
                { message: 'Selected state must be provided' },
                { status: 400 }
            );
        }

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json(
                { message: 'Product IDs must be provided as a non-empty array' },
                { status: 400 }
            );
        }

        // Update the selected state for all the specified items
        const { error } = await supabase
            .from('cart')
            .update({ selected })
            .eq('user', user)
            .in('product', productIds);

        if (error) {
            return NextResponse.json(
                { message: 'Failed to update items selection state', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: `${productIds.length} item(s) selection state updated successfully`,
            selected,
            affectedItems: productIds
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error: (error as Error).message },
            { status: 500 }
        );
    }
} 