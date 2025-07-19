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

        // Get userId from query parameters
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Fetch user's wishlist items using Supabase
        const { data: wishlistItems, error: wishlistError } = await supabase
            .from('wishlist')
            .select(`
                product,
                products:product (
                    id,
                    name,
                    category,
                    unit,
                    price,
                    qty_per_unit,
                    discount_price,
                    image
                )
            `)
            .eq('user', userId);

        if (wishlistError) {
            console.error('Error fetching wishlist:', wishlistError);
            return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
        }

        // Fetch all categories and units for lookup
        const { data: categories } = await supabase.from('categories').select('id, name');

        const { data: units } = await supabase.from('units').select('id, short_name, name');

        const categoryMap = new Map();
        (categories || []).forEach(cat => categoryMap.set(cat.id, cat.name));
        
        const unitMap = new Map();
        (units || []).forEach(unit => unitMap.set(unit.id, unit.short_name || unit.name));

        // Attach categoryName and unitName to each product
        const formattedWishlist = (wishlistItems || []).map(item => ({
            ...item,
            products: {
                ...item.products,
                categoryName: categoryMap.get(item.products[0]?.category) || '',
                unitName: unitMap.get(item.products[0]?.unit) || '',
            }
        }));

        return NextResponse.json({ wishlist: formattedWishlist });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }
}

// Get wishlist items
// const fetchWishlist = async () => {
//     try {
//         const { data } = await wishlistOperations.getWishlist();
//         // Use the wishlist data
//         console.log(data);
//     } catch (error) {
//         console.error('Error fetching wishlist:', error);
//     }
// };

// Add to wishlist
// const addItem = async (productId: number) => {
//     try {
//         const result = await wishlistOperations.addToWishlist(productId.toString());
//         // Show success message
//         console.log(result.message);
//     } catch (error) {
//         console.error('Error adding to wishlist:', error);
//     }
// };

// Remove from wishlist
// const removeItem = async (productId: number) => {
//     try {
//         const result = await wishlistOperations.removeFromWishlist(productId.toString());
//         // Show success message
//         console.log(result.message);
//     } catch (error) {
//         console.error('Error removing from wishlist:', error);
//     }
// }; 