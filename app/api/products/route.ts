import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    try {
        // Get query parameters
        const url = new URL(request.url);
        const categoryIds = url.searchParams.get('categoryIds');
        const minPrice = parseFloat(url.searchParams.get('minPrice') || '0');
        const maxPrice = parseFloat(url.searchParams.get('maxPrice') || '500');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '9');

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

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
        let query = supabase
            .from('products')
            .select(`
                id,
                name,
                category,
                unit,
                price,
                qty_per_unit,
                discount_price,
                image
            `, { count: 'exact' })
            .eq('is_active', 'Y')
            .order('createdAt', { ascending: false })
            .gte('price', minPrice)
            .lte('price', maxPrice);

        // Apply category filter if provided
        if (categoryIds) {
            const categoriesArray = categoryIds.split(',').map(Number);
            query = query.in('category', categoriesArray);
        }

        // Apply pagination
        const { data: rawProducts, error, count } = await query
            .order('id', { ascending: true })
            .range(offset, offset + limit - 1);

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
                qty_per_unit: product.qty_per_unit,
                discount_price: product.discount_price,
                image: product.image || '/placeholder.jpg'
            };
        });

        // Calculate total pages
        const totalPages = Math.ceil((count || 0) / limit);

        return NextResponse.json({
            products,
            pagination: {
                total: count || 0,
                page,
                limit,
                totalPages
            }
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