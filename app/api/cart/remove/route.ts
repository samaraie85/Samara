import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: Request) {
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
        // Delete the cart item
        const { error } = await supabase
            .from('cart')
            .delete()
            .eq('user', user)
            .eq('product', product);

        if (error) {
            return NextResponse.json(
                { message: 'Failed to remove item from cart', error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Item removed from cart successfully'
        });
    } catch (error) {
        console.error('Error removing cart item:', error);
        return NextResponse.json(
            { message: 'Failed to remove item from cart', error: (error as Error).message },
            { status: 500 }
        );
    }
}
