import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCartSummary } from '../../cart/summary/cartSummaryUtil';

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const userId = url.searchParams.get('userId');

        if (!code || !userId) {
            return NextResponse.json({
                valid: false,
                message: 'Code and user ID are required'
            }, { status: 400 });
        }

        // Check if promocode exists and is active
        const { data: promocode, error: promocodeError } = await supabase
            .from('promocodes')
            .select('*')
            .eq('promocode', code)
            .eq('is_active', "Y")
            .single();

        if (promocodeError || !promocode) {
            return NextResponse.json({
                valid: false,
                message: 'Invalid promo code'
            });
        }

        // Check if promocode is expired
        const now = new Date();
        const expiryDate = new Date(promocode.expiry_date);

        if (expiryDate < now) {
            return NextResponse.json({
                valid: false,
                message: 'Promo code has expired'
            });
        }

        // Check if user has already used this promocode
        const { data: existingUsage, error: usageError } = await supabase
            .from('orders')
            .select('id')
            .eq('user', userId)
            .eq('promocode', promocode.promocode)
            .limit(1);

        if (usageError) {
            console.error('Error checking promocode usage:', usageError);
            return NextResponse.json({
                valid: false,
                message: 'Failed to verify promo code usage'
            }, { status: 500 });
        }

        if (existingUsage && existingUsage.length > promocode.max_uses) {
            return NextResponse.json({
                valid: false,
                message: 'You have already used this promo code'
            });
        }

        // Check usage limit and count total usage
        let totalUsage = 0;
        if (promocode.max_uses) {
            const { count: usageCount, error: countError } = await supabase
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('promocode', promocode.promocode);

            if (countError) {
                console.error('Error checking promocode total usage:', countError);
                return NextResponse.json({
                    valid: false,
                    message: 'Failed to verify promo code'
                }, { status: 500 });
            }

            totalUsage = usageCount || 0;

            if (totalUsage >= promocode.max_uses) {
                return NextResponse.json({
                    valid: false,
                    message: 'Promo code usage limit reached',
                    total_usage: totalUsage,
                    max_uses: promocode.max_uses
                });
            }
        } else {
            // Count usage even if no max_uses limit is set
            const { count: usageCount, error: countError } = await supabase
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('promocode', promocode.promocode);

            if (!countError) {
                totalUsage = usageCount || 0;
            }
        }

        // --- New Step: Check order total against min_order_amount ---
        // Use shared cart summary utility
        const summary = await getCartSummary(supabase, userId);
        if (promocode.min_order_amount && summary.total < promocode.min_order_amount) {
            return NextResponse.json({
                valid: false,
                message: `Order total must be at least ${promocode.min_order_amount} to use this promo code.`
            });
        }

        // Promocode is valid
        return NextResponse.json({
            valid: true,
            message: 'Promo code is valid',
            discount_value: promocode.discount_percentage,
            min_order_amount: promocode.min_order_amount,
            total_usage: totalUsage,
            max_uses: promocode.max_uses || null
        });

    } catch (error) {
        console.error('Error verifying promocode:', error);
        return NextResponse.json({
            valid: false,
            message: 'Failed to verify promo code'
        }, { status: 500 });
    }
} 