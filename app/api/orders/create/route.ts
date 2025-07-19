import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface OrderData {
    userId: string;
    addressData: {
        country: string;
        city: string;
        street: string;
        floor: string;
        landmark?: string;
    };
    contactInfo: {
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
    };
    promoCode?: string | null;
    discount: number;
    charityDiscount: number;
    donation: number;
    notes?: string;
    transactionCode: string;
    orderSummary: {
        subtotal: number;
        tax: number;
        delivery: number;
        total: number;
        items: number;
    };
    finalTotal?: number;
}

export async function POST(request: Request) {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const orderData: OrderData = await request.json();

        // Validate required fields
        if (!orderData.userId || !orderData.addressData || !orderData.contactInfo || !orderData.orderSummary) {
            return NextResponse.json({
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Insert order into database
        const orderInsertData = {
            user: orderData.userId,
            price: orderData.orderSummary.subtotal,
            final_price: orderData.finalTotal || orderData.orderSummary.total,
            status: 'Preparing',
            first_name: orderData.contactInfo.firstName,
            second_name: orderData.contactInfo.lastName,
            phone: orderData.contactInfo.phone,
            email: orderData.contactInfo.email,
            country: orderData.addressData.country,
            city: orderData.addressData.city,
            street: orderData.addressData.street,
            floor: orderData.addressData.floor,
            landmark: orderData.addressData.landmark,
            promocode: orderData.promoCode,
            discount: orderData.discount,
            donation: orderData.donation,
            delivery: orderData.orderSummary.delivery,
            transacation: orderData.transactionCode,
            notes: orderData.notes || null
        };

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert(orderInsertData)
            .select('id')
            .single();

        if (orderError) {
            return NextResponse.json({
                error: 'Failed to create order',
                details: orderError.message
            }, { status: 500 });
        }

        // Get cart items for this user with product and unit details
        const { data: cartItems, error: cartError } = await supabase
            .from('cart')
            .select(`
                *,
                products:product (
                    id,
                    name,
                    price,
                    discount_price,
                    units:unit (
                        id,
                        name,
                        short_name
                    )
                )
            `)
            .eq('user', orderData.userId);

        if (cartError) {
            return NextResponse.json({
                error: 'Failed to fetch cart items',
                details: cartError.message
            }, { status: 500 });
        }

        // Create order items with proper pricing and unit information
        if (cartItems && cartItems.length > 0) {
            const orderItems = cartItems.map(item => {
                // Use discount price if available, otherwise use regular price
                const productPrice = item.products?.discount_price && item.products.discount_price > 0
                    ? item.products.discount_price
                    : item.products?.price || 0;

                return {
                    order: order.id,
                    product: item.product,
                    qty: item.qty,
                    price: productPrice,
                    total_price: productPrice * item.qty,
                    unit: item.products?.units?.id || item.unit
                };
            });

            const { error: orderItemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (orderItemsError) {
                return NextResponse.json({
                    error: 'Failed to create order items',
                    details: orderItemsError.message
                }, { status: 500 });
            }
        }

        // Clear the user's cart
        const { error: clearCartError } = await supabase
            .from('cart')
            .delete()
            .eq('user', orderData.userId);

        if (clearCartError) {
            // Don't fail the order creation if cart clearing fails
        }

        // Insert into charity_use table if charity discount was applied
        if (orderData.charityDiscount > 0) {
            const { error: charityUseError } = await supabase
                .from('charity_use')
                .insert({
                    user_id: orderData.userId,
                    order_id: order.id
                });

            if (charityUseError) {
                // Don't fail the order creation if charity use record fails
            }
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            message: 'Order created successfully'
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
} 