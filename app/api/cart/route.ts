import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const user = url.searchParams.get('user');

    if (!user) {
        return NextResponse.json(
            { message: 'User ID is required' },
            { status: 400 }
        );
    }

    try {
        // Query cart items for this user, joining the unit table
        const { data: cartItems, error } = await supabase
            .from('cart')
            .select(`
                *,
                products:product (
                    id,
                    name,
                    image,
                    supplier,
                    price,
                    discount_price,
                    unit:units  (
                        id,
                        name,
                        short_name
                    ),
                    category,
                    qty_per_unit,
                    categories:category(id, name)
                )
            `)
            .eq('user', user);

        if (error) {
            throw error;
        }

        // Format the response to match our frontend expectations
        const formattedItems = cartItems.map(item => ({
            id: item.product,
            image: item.products.image,
            name: item.products.name,
            supplier: item.products.supplier,
            price: item.products.price,
            discount_price: item.products.discount_price,
            unit: item.products.unit?.id || '',
            unitShortName: item.products.unit?.short_name || '',
            qty_per_unit: item.products.qty_per_unit,
            quantity: item.qty,
            category: item.products.categories?.name || 'Unknown',
            categoryId: item.products.category,
            selected: item.selected || false // Include selected state
        }));

        return NextResponse.json(formattedItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        return NextResponse.json(
            { message: 'Failed to fetch cart items', error: (error as Error).message },
            { status: 500 }
        );
    }
}
