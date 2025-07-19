import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await params;

        if (!productId || isNaN(Number(productId))) {
            return NextResponse.json(
                { error: 'Invalid product ID' },
                { status: 400 }
            );
        }

        // Fetch the product details
        const { data: product, error: productError } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .eq('is_active', 'Y')
            .single();

        if (productError) {
            return NextResponse.json(
                { error: 'Failed to fetch product details', message: productError.message },
                { status: 500 }
            );
        }

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Fetch associated images
        const { data: productImages, error: imagesError } = await supabase
            .from('product_images')
            .select('image')
            .eq('product', productId);

        if (imagesError) {
            console.error('Error fetching product images:', imagesError);
            // Continue without images rather than failing the request
        }

        // Fetch product plan/points info
        const { data: productPlan, error: planError } = await supabase
            .from('product_plan')
            .select('*')
            .eq('product', productId);

        if (planError) {
            console.error('Error fetching product plan:', planError);
            // Continue without plan rather than failing the request
        }

        // Get the category name
        let categoryName = '';
        if (product.category) {
            const { data: category } = await supabase
                .from('categories')
                .select('name')
                .eq('id', product.category)
                .single();

            if (category) {
                categoryName = category.name;
            }
        }

        // Get the unit name from the units table
        let unitName = '';
        if (product.unit) {
            const { data: unitData, error: unitError } = await supabase
                .from('units')
                .select('name, short_name')
                .eq('id', product.unit)
                .single();

            if (!unitError && unitData) {
                // Use short_name if available, otherwise use name
                unitName = unitData.short_name || unitData.name;
            }
        }

        // Format the product data with additional info
        const formattedProduct = {
            ...product,
            categoryName,
            images: productImages || [],
            plan: productPlan || [],
            unitName: unitName,
            unitPrice: product.price
        };

        return NextResponse.json({
            product: formattedProduct
        });
    } catch (error) {
        console.error('Error in get product API:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
} 