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
        const decrementBy = body.quantity ? Number(body.quantity) : 1;
        const currentQty = cartItem.qty || 0;
        const newQty = currentQty - decrementBy;

        if (newQty <= 0) {
            // Optionally, you could delete the item from the cart if qty <= 0
            const { error: deleteError } = await supabase
                .from('cart')
                .delete()
                .eq('user', user)
                .eq('product', product);

            if (deleteError) {
                return NextResponse.json(
                    { message: 'Failed to remove item from cart', error: deleteError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                message: 'Item removed from cart',
                newQuantity: 0
            });
        }

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
            message: 'Quantity decremented successfully',
            newQuantity: newQty,
            decrementedBy: decrementBy
        });
    } catch (error) {
        console.error('Error decrementing cart item:', error);
        return NextResponse.json(
            { message: 'Failed to decrement quantity', error: (error as Error).message },
            { status: 500 }
        );
    }
}
