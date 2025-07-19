import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
    // Check if the request is for a dashboard route
    if (request.nextUrl.pathname.startsWith('/samara/dashboard')) {
        try {
            // Get the admin session from cookies
            const adminSession = request.cookies.get('adminSession')?.value;

            if (!adminSession) {
                // No session found, redirect to login
                return NextResponse.redirect(new URL('/samara/admin', request.url));
            }

            // Parse the session data
            const sessionData = JSON.parse(adminSession);

            // Check if the session has expired
            if (new Date(sessionData.expiresAt) < new Date()) {
                // Session expired, redirect to login
                return NextResponse.redirect(new URL('/samara/admin', request.url));
            }

            // Verify the user exists in the database
            const { data, error } = await supabase
                .from('admin_users')
                .select('id, username')
                .eq('id', sessionData.id)
                .eq('username', sessionData.username)
                .single();

            if (error || !data) {
                // Invalid session, redirect to login
                return NextResponse.redirect(new URL('/samara/admin', request.url));
            }

            // Session is valid, allow the request to proceed
            return NextResponse.next();
        } catch {
            // Any error in the process, redirect to login
            return NextResponse.redirect(new URL('/samara/admin', request.url));
        }
    }

    // For non-dashboard routes, proceed normally
    return NextResponse.next();
}

// Configure which routes to run the middleware on
export const config = {
    matcher: [
        '/samara/admin/:path*',
        '/samara/dashboard/:path*'
    ]
}; 