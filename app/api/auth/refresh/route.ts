import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // Create server-side client with auth context
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore
        });

        // Try to refresh the session
        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
            console.error("Auth refresh error:", error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        // Check if refresh worked
        if (!data.session) {
            return NextResponse.json({
                success: false,
                message: 'No session available to refresh'
            });
        }

        // Return success
        return NextResponse.json({
            success: true,
            message: 'Session refreshed successfully',
            user: {
                id: data.session.user.id,
                email: data.session.user.email
            }
        });
    } catch (error) {
        console.error('Error refreshing session:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to refresh session'
        }, { status: 500 });
    }
} 