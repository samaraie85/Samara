import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        // Create server-side client
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore
        });

        // Get userId and productId from query parameters
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const productId = searchParams.get('productId');

        if (!userId || !productId) {
            return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
        }

        // Check if product is in user's wishlist
        const { data: wishlistItem, error: wishlistError } = await supabase
            .from('wishlist')
            .select('id')
            .eq('user', userId)
            .eq('product', productId)
            .maybeSingle();

        if (wishlistError) {
            console.error('Error checking wishlist:', wishlistError);
            return NextResponse.json({ error: 'Failed to check wishlist' }, { status: 500 });
        }

        const isInWishlist = !!wishlistItem;

        return NextResponse.json({ isInWishlist });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        return NextResponse.json({ error: 'Failed to check wishlist' }, { status: 500 });
    }
} 