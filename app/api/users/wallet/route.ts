import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET request to fetch user wallet balance
export async function GET(request: Request) {
    try {
        // Get user ID from query parameters
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get wallet data from the database
        const { data, error } = await supabase
            .from('app_users')
            .select('bonus')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // User not found, return default value
                return NextResponse.json({ points: 0 });
            }

            return NextResponse.json({
                error: 'Failed to fetch wallet data',
                details: error.message
            }, { status: 500 });
        }

        // Return the points balance (or 0 if not set)
        return NextResponse.json({
            points: data?.bonus || 0
        });

    } catch (error: unknown) {
        console.error('Error in wallet API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
} 