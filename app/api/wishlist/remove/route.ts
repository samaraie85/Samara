import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Create server-side client
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore
        });

        // Extract data from request
        const { productId, userId } = await request.json();

        if (!productId || !userId) {
            return NextResponse.json({ error: 'Product ID and User ID are required' }, { status: 400 });
        }

        // Remove from wishlist
        const { error: deleteError } = await supabase
            .from('wishlist')
            .delete()
            .eq('user', userId)
            .eq('product', productId);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }
} 