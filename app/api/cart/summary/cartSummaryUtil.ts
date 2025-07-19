import { SupabaseClient } from '@supabase/supabase-js';

export async function getCartSummary(supabase: SupabaseClient, userId: string) {
    // Query cart items for this user
    const { data: cartItems, error } = await supabase
        .from('cart')
        .select(`*, products:product (id, price, discount_price)`)
        .eq('user', userId);

    if (error) {
        throw error;
    }

    // Calculate summary
    let subtotal = 0;
    let items = 0;
    cartItems.forEach(item => {
        subtotal += item.products.discount_price != 0 ? item.products.discount_price * item.qty : item.products.price * item.qty;
        items += item.qty;
    });

    // Fetch delivery price from DB
    let delivery = 0;
    try {
        const { data: deliveryData, error: deliveryError } = await supabase
            .from('delivery')
            .select('price')
            .eq('id', 1)
            .single();
        if (!deliveryError && deliveryData && deliveryData.price) {
            delivery = deliveryData.price;
        }
    } catch {
        delivery = 0;
    }

    const tax = 0;
    const total = subtotal + tax + delivery;

    return {
        subtotal,
        tax,
        delivery,
        total,
        items
    };
} 