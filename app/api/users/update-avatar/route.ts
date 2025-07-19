import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { userId, imageUrl } = await request.json();

        if (!userId || !imageUrl) {
            return NextResponse.json({ error: 'User ID and image URL are required' }, { status: 400 });
        }

        // Get auth cookie and create server-side client
        const cookieStore = cookies();
        const supabaseServer = createRouteHandlerClient({ cookies: () => cookieStore });

        // Update user metadata with new avatar using regular updateUser
        const { error: updateError } = await supabaseServer.auth.updateUser({
            data: { avatar_url: imageUrl }
        });

        if (updateError) {
            return NextResponse.json({
                error: 'Failed to update user metadata',
                details: updateError.message
            }, { status: 500 });
        }

        // Also update the avatar in the app_users table
        const { error: dbUpdateError } = await supabase
            .from('app_users')
            .update({ image: imageUrl })
            .eq('id', userId);

        if (dbUpdateError) {
            // Try with alternative column name if first attempt fails
            const { error: altDbError } = await supabase
                .from('app_users')
                .update({ avatar_url: imageUrl })
                .eq('id', userId);

            if (altDbError) {
                return NextResponse.json({
                    error: 'Failed to update profile image in database',
                    details: altDbError.message
                }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Avatar updated successfully'
        });

    } catch (error: unknown) {
        console.error('Error updating avatar:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
} 