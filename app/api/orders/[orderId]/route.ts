import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const resolvedParams = await params;
        console.log('API Route called with orderId:', resolvedParams.orderId); // Debug log

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const orderId = resolvedParams.orderId;

        if (!orderId) {
            console.log('No orderId provided'); // Debug log
            return NextResponse.json({
                error: 'Order ID is required'
            }, { status: 400 });
        }

        console.log('Fetching order details for ID:', orderId); // Debug log

        // Test database connection
        const { error: testError } = await supabase
            .from('orders')
            .select('count')
            .limit(1);

        if (testError) {
            console.error('Database connection test failed:', testError);
        } else {
            console.log('Database connection test successful');
        }

        // Test units table
        const { data: unitsTest, error: unitsTestError } = await supabase
            .from('units')
            .select('id, name, short_name')
            .limit(3);

        if (unitsTestError) {
            console.error('Units table test failed:', unitsTestError);
        } else {
            console.log('Units table test successful:', unitsTest);
        }

        // Fetch order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError) {
            console.error('Order fetch error:', orderError); // Debug log
            return NextResponse.json({
                error: 'Order not found',
                details: orderError.message
            }, { status: 404 });
        }

        console.log('Order found:', order); // Debug log

        // Test order_items table structure
        const { data: testItems, error: testItemsError } = await supabase
            .from('order_items')
            .select('*')
            .limit(1);

        if (testItemsError) {
            console.error('Order items table test failed:', testItemsError);
        } else {
            console.log('Order items table test successful, sample structure:', testItems?.[0]);
            console.log('Available fields in order_items:', Object.keys(testItems?.[0] || {}));
        }


        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select(`
                *,
                products:product (
                    id,
                    name,
                    image,
                    price,
                    discount_price
                ),
                units:unit (
                    id,
                    name,
                    short_name
                )
            `)
            .eq('"order"', orderId);

        if (itemsError) {
            console.error('Order items fetch error:', itemsError); // Debug log
            return NextResponse.json({
                error: 'Failed to fetch order items',
                details: itemsError.message
            }, { status: 500 });
        }

        console.log('Order items found:', orderItems); // Debug log

        // Debug: Check the structure of the first order item
        if (orderItems && orderItems.length > 0) {
            console.log('First order item structure:', JSON.stringify(orderItems[0], null, 2));
        }

        return NextResponse.json({
            success: true,
            order,
            orderItems: orderItems || []
        });

    } catch (error: unknown) {
        console.error('API Route error:', error); // Debug log
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
} 