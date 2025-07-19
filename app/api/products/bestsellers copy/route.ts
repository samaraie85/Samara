import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        // Create server-side client with auth context
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Fetch categories first to have them available for lookup
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name');

        // Create a lookup map for category names
        const categoryMap = new Map();
        if (categories) {
            categories.forEach(cat => {
                categoryMap.set(cat.id, cat.name);
            });
        }

        // Fetch units for lookup
        const { data: units } = await supabase
            .from('units')
            .select('id, short_name');

        // Create a lookup map for unit names
        const unitMap = new Map();
        if (units) {
            units.forEach(unit => {
                unitMap.set(unit.id, unit.short_name);
            });
        }

        // Build the query for products
        const query = supabase
            .from('products')
            .select(`
                id,
                name,
                category,
                unit,
                price,
                image,
                qty_sold
            `, { count: 'exact' })
            .eq('is_active', 'Y')
            .order('qty_sold', { ascending: false })
            .limit(10);


        // Apply pagination
        const { data: rawProducts, error } = await query;

        if (error) {
            console.error('Error fetching products:', error);
            return NextResponse.json({
                error: 'Failed to fetch products',
                details: error.message
            }, { status: 500 });
        }

        // Process the results to include category name
        const products = (rawProducts || []).map(product => {
            return {
                id: product.id,
                name: product.name,
                category: product.category,
                categoryName: categoryMap.get(product.category) || 'Unknown',
                unit: product.unit,
                unitName: unitMap.get(product.unit) || '',
                price: product.price,
                image: product.image || '/placeholder.jpg'
            };
        });



        return NextResponse.json({
            products
        });

    } catch (error: unknown) {
        console.error('Server error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
} 