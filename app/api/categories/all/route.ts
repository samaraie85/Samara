import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        // Create server-side client with auth context
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Fetch all categories
        const { data: categories, error } = await supabase
            .from('categories')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            return NextResponse.json({
                error: 'Failed to fetch categories',
                details: error.message
            }, { status: 500 });
        }

        return NextResponse.json({ categories: categories || [] });
    } catch (error: unknown) {
        console.error('Server error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
} 