import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Define interfaces for our data
interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    category: number;
    unit?: number;
    min_qty?: number;
    step_qty?: number;
    qty_sold?: number;
    [key: string]: unknown;
}

export async function GET() {
    try {
        // Create server-side client with auth context
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        console.log('Fetching bestseller products...');

        // Fetch categories for lookup
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

        // Primary strategy: Sort by qty_sold field
        const { data: initialProducts, error: bestsellerError } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', 'Y')
            .order('qty_sold', { ascending: false })
            .limit(10);

        let bestsellingProducts = initialProducts;

        // If the primary strategy fails, try alternative strategies
        if (!bestsellingProducts || bestsellingProducts.length === 0 || bestsellerError) {
            console.log('Could not get products by qty_sold, trying featured products');

            // 1. Try to get products with is_featured flag if it exists
            const { data: featuredProducts, error: featuredError } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', 'Y')
                .eq('is_featured', true)
                .limit(10);

            // 2. If no featured products or error, try products with highest price (premium products)
            if (!featuredProducts || featuredProducts.length === 0 || featuredError) {
                console.log('No featured products found, using price-based selection');

                const { data: premiumProducts } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_active', 'Y')
                    .order('price', { ascending: false })
                    .limit(10);

                if (premiumProducts && premiumProducts.length > 0) {
                    bestsellingProducts = premiumProducts;
                } else {
                    // 3. If still nothing, try newest products (lowest IDs assuming auto-increment)
                    console.log('Falling back to newest products');
                    const { data: newestProducts } = await supabase
                        .from('products')
                        .select('*')
                        .eq('is_active', 'Y')
                        .order('id', { ascending: false })
                        .limit(10);

                    if (newestProducts && newestProducts.length > 0) {
                        bestsellingProducts = newestProducts;
                    }
                }
            } else {
                bestsellingProducts = featuredProducts;
            }
        }

        // If we still don't have products, get any 10 products
        if (!bestsellingProducts || bestsellingProducts.length === 0) {
            console.log('No strategies worked, fetching any available products');
            const { data: anyProducts, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', 'Y')
                .limit(10);

            if (error || !anyProducts || anyProducts.length === 0) {
                return NextResponse.json({
                    products: [],
                    count: 0,
                    note: 'No products available'
                });
            }

            bestsellingProducts = anyProducts;
        }

        // Process these products
        const products = bestsellingProducts.map((product: Product) => {
            return formatProduct(product, categoryMap, unitMap);
        });

        return NextResponse.json({
            products,
            count: products.length,
            source: bestsellerError ? 'fallback' : 'qty_sold'
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

// Helper function to format a product
function formatProduct(product: Product, categoryMap: Map<number, string>, unitMap: Map<number, string>) {
    return {
        id: product.id,
        name: product.name,
        category: product.category,
        categoryName: categoryMap.get(product.category) || 'Unknown',
        unit: product.unit,
        unitName: unitMap.get(product.unit || 0) || '',
        price: product.price,
        image: product.image || '/placeholder.jpg',
        qty_sold: product.qty_sold || 0,
        qty_per_unit: product.qty_per_unit || 1,
        discount_price: product.discount_price || 0
    };
} 