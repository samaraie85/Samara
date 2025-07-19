import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        // Log to verify the API is being called
        console.log('Register API called');

        const { userId, fullName, email } = await request.json();
        console.log('Received user data:', { userId, fullName, email });

        // Validate required fields
        if (!userId || !fullName || !email) {
            return NextResponse.json(
                { error: 'Missing required fields', details: { userId: !!userId, fullName: !!fullName, email: !!email } },
                { status: 400 }
            );
        }

        // Check if the table exists by making a simple query first
        const { error: tableCheckError } = await supabase
            .from('app_users')
            .select('id')
            .limit(1);

        if (tableCheckError) {
            console.error('Table check error:', tableCheckError);
            return NextResponse.json(
                {
                    error: 'Database table error',
                    details: tableCheckError.message,
                    hint: 'The users table may not exist - please create it first'
                },
                { status: 500 }
            );
        }

        // Insert user into the users table using admin privileges
        console.log('Attempting to insert user data with ID:', userId);
        const { data, error } = await supabase
            .from('app_users')
            .insert([
                {
                    id: userId,
                    full_name: fullName,
                    email: email,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('Database insertion error:', error);
            return NextResponse.json(
                {
                    error: 'Failed to create user profile',
                    details: error.message,
                    code: error.code,
                    hint: error.hint || 'Check if the users table schema matches the data being inserted'
                },
                { status: 500 }
            );
        }

        console.log('User created successfully:', data);
        return NextResponse.json({ success: true, data });

    } catch (error: unknown) {
        console.error('Server error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: errorMessage
            },
            { status: 500 }
        );
    }
} 