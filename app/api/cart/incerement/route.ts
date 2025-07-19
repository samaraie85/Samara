import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    // Get query parameters from the URL
    const url = new URL(request.url);
    const user = url.searchParams.get('user');
    const product = url.searchParams.get('product');

    if (!user || !product) {
        return NextResponse.json(
            { message: 'Missing user or product ID' },
            { status: 400 }
        );
    }

    try {
        // First, get the current item to check its current quantity
        const { data: cartItem, error: fetchError } = await supabase
            .from('cart')
            .select('*')
            .eq('user', user)
            .eq('product', product)
            .single();

        if (fetchError) {
            return NextResponse.json(
                { message: 'Failed to fetch cart item', error: fetchError.message },
                { status: 500 }
            );
        }

        if (!cartItem) {
            return NextResponse.json(
                { message: 'Cart item not found' },
                { status: 404 }
            );
        }

        // Get the request body to see if quantity is specified
        const body = await request.json();
        const incrementBy = body.quantity ? Number(body.quantity) : 1;
        const newQty = (cartItem.qty || 0) + incrementBy;

        // Update the cart item with new quantity
        const { error: updateError } = await supabase
            .from('cart')
            .update({ qty: newQty })
            .eq('user', user)
            .eq('product', product);

        if (updateError) {
            return NextResponse.json(
                { message: 'Failed to update quantity', error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Quantity incremented successfully',
            newQuantity: newQty,
            incrementedBy: incrementBy
        });
    } catch (error) {
        console.error('Error incrementing cart item:', error);
        return NextResponse.json(
            { message: 'Failed to increment quantity', error: (error as Error).message },
            { status: 500 }
        );
    }
}
