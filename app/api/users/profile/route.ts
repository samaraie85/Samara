import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET user profile data
export async function GET(request: Request) {
    try {
        // Get user ID from query parameters
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Get additional user data from the database
        const { data, error } = await supabase
            .from('app_users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // User not found in database, return empty result
                return NextResponse.json({
                    error: 'User profile not found',
                    code: 'NOT_FOUND'
                }, { status: 404 });
            }

            return NextResponse.json({
                error: 'Failed to fetch user profile',
                details: error.message
            }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error: unknown) {
        console.error('Error in profile API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
}

// POST to create or update user profile
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, userData } = body;

        if (!userId || !userData) {
            return NextResponse.json({ error: 'User ID and profile data required' }, { status: 400 });
        }

        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
            .from('app_users')
            .select('id')
            .eq('id', userId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            return NextResponse.json({
                error: 'Error checking user existence',
                details: checkError.message
            }, { status: 500 });
        }

        let result;

        // Update or insert based on whether user exists
        if (existingUser) {
            // Update existing user
            const { data, error } = await supabase
                .from('app_users')
                .update(userData)
                .eq('id', userId)
                .select();

            if (error) {
                return NextResponse.json({
                    error: 'Failed to update user profile',
                    details: error.message
                }, { status: 500 });
            }

            result = data;
        } else {
            // Create new user
            const { data, error } = await supabase
                .from('app_users')
                .insert([{
                    id: userId,
                    ...userData,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                return NextResponse.json({
                    error: 'Failed to create user profile',
                    details: error.message
                }, { status: 500 });
            }

            result = data;
        }

        return NextResponse.json({ data: result });
    } catch (error: unknown) {
        console.error('Error in profile API:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
} 