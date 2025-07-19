import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        // Create server-side client with auth context
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore
        });

        // Get session data with more detailed logging
        console.log("Checking auth session on server...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error("Auth session error:", error);
            return NextResponse.json({
                authenticated: false,
                error: error.message
            }, { status: 500 });
        }

        console.log("Session data received:", data ? "Session exists" : "No session");

        if (!data.session) {
            console.log("No session found in server-side check");

            // Instead of giving up, try to get the user another way
            // This helps when the session cookie exists but isn't properly recognized
            try {
                const { data: userData } = await supabase.auth.getUser();

                if (userData?.user) {
                    console.log("User found through getUser() even though session is missing");
                    return NextResponse.json({
                        authenticated: true,
                        user: {
                            id: userData.user.id,
                            email: userData.user.email,
                            role: userData.user.app_metadata?.role || 'user',
                            last_sign_in: userData.user.last_sign_in_at,
                            note: "Retrieved via getUser() fallback"
                        }
                    });
                }
            } catch (userError) {
                console.error("Failed to retrieve user as fallback:", userError);
            }

            return NextResponse.json({
                authenticated: false,
                message: 'No active session found'
            });
        }

        // Return user info if authenticated
        return NextResponse.json({
            authenticated: true,
            user: {
                id: data.session.user.id,
                email: data.session.user.email,
                role: data.session.user.app_metadata?.role || 'user',
                last_sign_in: data.session.user.last_sign_in_at
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({
            authenticated: false,
            error: 'Failed to check authentication status'
        }, { status: 500 });
    }
} 