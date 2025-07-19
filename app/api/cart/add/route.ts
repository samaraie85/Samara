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
        // Get the request body
        const body = await request.json();
        const requestedQuantity = body.quantity || 1;

        // Check if product already exists for this user
        const { data, error: fetchError } = await supabase
            .from('cart')
            .select('*')
            .eq('user', user)
            .eq('product', product)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
            return NextResponse.json(
                { message: 'Failed to check existing cart item', error: fetchError.message },
                { status: 500 }
            );
        }

        if (data) {
            // Product exists, add new quantity to current quantity
            const newQty = (data.qty || 0) + requestedQuantity;
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
                message: 'Quantity updated successfully',
                newQuantity: newQty
            });
        } else {
            console.log('Product does not exist, inserting new entry with specified quantity');
            // Product doesn't exist, insert new entry with specified quantity
            const { error: insertError } = await supabase
                .from('cart')
                .insert([{
                    user,
                    product,
                    qty: requestedQuantity,
                }]);

            if (insertError) {
                return NextResponse.json(
                    { message: 'Failed to insert data', error: insertError.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                message: 'Item added to cart successfully',
                newQuantity: requestedQuantity
            });
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        return NextResponse.json(
            { message: 'Failed to add item to cart', error: (error as Error).message },
            { status: 500 }
        );
    }
}
