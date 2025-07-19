import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Define TypeScript interfaces for our data structure
interface Product {
    name: string;
}

interface OrderItem {
    id: string;
    product: string;
    qty: number;
    price: number;
    total_price: number;
    products: Product;
}

interface Order {
    id: string;
    created_at: string;
    status: string;
    price: string;
    country: string;
    city: string;
    street: string;
    floor: string | null;
    landmark: string | null;
    promocode: string | null;
    discount: number | null;
    final_price: number;
    order_items: OrderItem[];
}

export async function GET(request: Request) {
    try {
        // Get query parameters
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '4');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Create server-side client with auth context
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // First get the total count of orders
        const { count, error: countError } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('user', userId);

        if (countError) {
            console.error('Count error:', countError);
            return NextResponse.json({
                error: 'Failed to count orders',
                details: countError.message
            }, { status: 500 });
        }

        // Then fetch paginated orders with their items
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                status,
                price,
                country,
                city,
                street,
                floor,
                landmark,
                promocode,
                discount,
                final_price,
                order_items (
                    id,
                    product,
                    qty,
                    price,
                    total_price,
                    products (
                        name
                    )
                )
            `)
            .eq('user', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (ordersError) {
            console.error('Orders error:', ordersError);
            return NextResponse.json({
                error: 'Failed to fetch orders',
                details: ordersError.message
            }, { status: 500 });
        }

        // Check if we have any orders
        if (!orders || orders.length === 0) {
            return NextResponse.json({
                orders: [],
                pagination: {
                    total: count || 0,
                    page,
                    limit,
                    totalPages: Math.ceil((count || 0) / limit)
                }
            });
        }

        // Transform the data to match the expected format in the frontend
        const formattedOrders = (orders as unknown as Order[]).map(order => {
            // Format items for display
            const items = Array.isArray(order.order_items) ? order.order_items.map((item, index) => {
                const productName = item.products ? item.products.name : 'Unknown Product';

                return {
                    id: index + 1,
                    quantity: item.qty,
                    name: productName,
                    size: ''
                };
            }) : [];

            // Calculate time difference for timestamp display
            const createdDate = new Date(order.created_at);
            const now = new Date();
            const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

            let timestamp;
            if (diffInSeconds < 60) {
                timestamp = `${diffInSeconds}sec Ago`;
            } else if (diffInSeconds < 3600) {
                timestamp = `${Math.floor(diffInSeconds / 60)}min Ago`;
            } else if (diffInSeconds < 86400) {
                timestamp = `${Math.floor(diffInSeconds / 3600)}hr Ago`;
            } else {
                timestamp = `${Math.floor(diffInSeconds / 86400)}days Ago`;
            }

            // Format prices with Euro symbol
            const orderPrice = order.final_price || order.price;
            const formattedPrice = `€${parseFloat(orderPrice.toString() || '0').toFixed(2)}`;

            // Create a formatted address string that includes all address components
            let formattedAddress = '';
            if (order.country) {
                const addressParts = [];
                if (order.street) addressParts.push(order.street);
                if (order.floor) addressParts.push(`Floor: ${order.floor}`);
                if (order.landmark) addressParts.push(`Near: ${order.landmark}`);
                if (order.city) addressParts.push(order.city);
                if (order.country) addressParts.push(order.country);

                if (addressParts.length > 0) {
                    formattedAddress = addressParts.join(', ');
                }
            }

            return {
                id: order.id,
                items,
                address: formattedAddress,
                phone: '', // Phone number now handled in the frontend
                price: formattedPrice,
                timestamp,
                status: order.status || 'Processing'
            };
        });

        return NextResponse.json({
            orders: formattedOrders,
            pagination: {
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error: unknown) {
        console.error('Error fetching orders:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Server error',
            details: errorMessage
        }, { status: 500 });
    }
} 