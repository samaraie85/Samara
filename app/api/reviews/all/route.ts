import { NextResponse, NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '8', 10);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get total count
    const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

    // Get paginated reviews
    const { data, error } = await supabase
        .from('reviews')
        .select('id, rating, commnet, createdAt, app_users(full_name, image)')
        .order('createdAt', { ascending: false })
        .range(from, to);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data, total: count });
} 