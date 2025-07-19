import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({
                eligible: false,
                message: 'User ID is required'
            }, { status: 400 });
        }

        // Check if user has charity = 'Y'
        const { data: userData, error: userError } = await supabase
            .from('app_users')
            .select('charity')
            .eq('id', userId)
            .single();

        console.log('User data query result:', { userData, userError });

        if (userError || !userData) {
            console.log('User not found or error:', userError);
            return NextResponse.json({
                eligible: false,
                message: 'User not found'
            });
        }

        console.log('User charity status:', userData.charity);

        if (userData.charity !== 'Y') {
            console.log('User not eligible - charity is not Y:', userData.charity);
            return NextResponse.json({
                eligible: false,
                message: 'User not eligible for charity discount'
            });
        }

        // Check if user has already used charity discount this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        console.log('Checking charity usage between:', startOfMonth, 'and', endOfMonth);

        const { data: charityUse, error: charityError } = await supabase
            .from('charity_use')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', startOfMonth.toISOString())
            .lte('created_at', endOfMonth.toISOString())
            .limit(1);

        console.log('Charity use query result:', { charityUse, charityError });

        if (charityError) {
            console.error('Error checking charity usage:', charityError);
            return NextResponse.json({
                eligible: false,
                message: 'Failed to check charity usage'
            }, { status: 500 });
        }

        if (charityUse && charityUse.length > 0) {
            return NextResponse.json({
                eligible: false,
                message: 'Charity discount already used this month'
            });
        }

        // User is eligible for charity discount
        return NextResponse.json({
            eligible: true,
            message: 'User eligible for charity discount',
            discount_percentage: 50
        });

    } catch (error) {
        console.error('Error checking charity discount:', error);
        return NextResponse.json({
            eligible: false,
            message: 'Failed to check charity discount'
        }, { status: 500 });
    }
} 