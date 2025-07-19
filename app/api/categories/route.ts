import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        // Create server-side client with auth context
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Fetch categories from Supabase
        const { data: categories, error } = await supabase
            .from('categories')
            .select('id, name, desc, image')
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            return NextResponse.json({
                error: 'Failed to fetch categories',
                details: error.message
            }, { status: 500 });
        }

        // Enhance image URLs with public URLs if needed
        const categoriesWithImages = categories?.map(category => {
            if (category.image && !category.image.startsWith('http')) {
                const { data } = supabase.storage.from('category-images').getPublicUrl(category.image);
                return {
                    ...category,
                    image_url: data?.publicUrl || category.image
                };
            }
            return category;
        });

        return NextResponse.json({
            categories: categoriesWithImages || []
        });
    } catch (error: unknown) {
        console.error('Server error fetching categories:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
} 