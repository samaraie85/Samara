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

        // Check if product exists
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id')
            .eq('id', productId)
            .single();

        if (productError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check if already in wishlist
        const { data: existingItem } = await supabase
            .from('wishlist')
            .select('id')
            .eq('user', userId)
            .eq('product', productId)
            .maybeSingle();

        if (existingItem) {
            return NextResponse.json({ message: 'Product already in wishlist' });
        }

        // Add to wishlist
        const { error: insertError } = await supabase
            .from('wishlist')
            .insert({
                user: userId,
                product: productId
            });

        if (insertError) {
            throw insertError;
        }

        return NextResponse.json({ success: true, message: 'Product added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }
} 