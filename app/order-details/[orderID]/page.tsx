'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Hero from './components/Hero';
import Policies from './components/Policies';
import Image from 'next/image';
import loading1 from '../../assets/loading_1.gif';
import OrderSuccessModal from './components/OrderSuccessModal';
import SecondModal from './components/SecondModal';

interface OrderItem {
    id: string;
    product: string;
    qty: number;
    price: number;
    total_price: number;
    products: {
        id: string;
        name: string;
        image: string;
        price: number;
        discount_price: number;
    };
}

interface Order {
    id: string;
    created_at: string;
    status: string;
    price: number;
    final_price: number;
    first_name: string;
    second_name: string;
    phone: string;
    email: string;
    country: string;
    city: string;
    street: string;
    floor: string;
    landmark: string;
    promocode: string | null;
    discount: number;
    donation: number;
    delivery: number;
    transacation: string;
    notes: string | null;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const orderId = params.orderID as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(true);
    const [showSecondModal, setShowSecondModal] = useState(false);

    console.log('Component rendered with orderId:', orderId); // Debug log

    useEffect(() => {
        console.log('useEffect triggered with orderId:', orderId); // Debug log

        const fetchOrder = async () => {
            if (!orderId) {
                setError('Order ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log('Fetching order with ID:', orderId); // Debug log

                const response = await fetch(`/api/orders/${orderId}`);
                console.log('Response status:', response.status); // Debug log

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData); // Debug log
                    throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch order`);
                }

                const data = await response.json();
                console.log('API Response:', data); // Debug log

                if (!data.order) {
                    throw new Error('No order data received from API');
                }

                setOrder(data.order);
                setOrderItems(data.orderItems || []);
                setError(null);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err instanceof Error ? err.message : 'Failed to load order');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) {
        return (
            <>
                <Hero />
                <div style={{
                    display: 'flex',
                    backgroundColor: '#1a1a1a',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh',
                    fontSize: '1.2rem'
                }}>
                    <Image src={loading1} alt="Loading" width={100} height={100} />
                </div>
            </>

        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh',
                fontSize: '1.2rem',
                color: 'red',
                gap: '10px'
            }}>
                <div>Error: {error}</div>
                <div>Order ID: {orderId}</div>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#CDA00D',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginBottom: '10px'
                    }}
                >
                    Retry
                </button>
                <button
                    onClick={async () => {
                        try {
                            console.log('Manual API test for orderId:', orderId);
                            const response = await fetch(`/api/orders/${orderId}`);
                            const data = await response.json();
                            console.log('Manual API test result:', data);
                            alert(`API Test Result: ${response.status} - ${JSON.stringify(data, null, 2)}`);
                        } catch (err) {
                            console.error('Manual API test error:', err);
                            alert(`API Test Error: ${err}`);
                        }
                    }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginBottom: '10px'
                    }}
                >
                    Test API
                </button>
                <button
                    onClick={async () => {
                        try {
                            console.log('Testing database connection...');
                            const response = await fetch('/api/test-order');
                            const data = await response.json();
                            console.log('Database test result:', data);
                            alert(`Database Test Result: ${response.status} - ${JSON.stringify(data, null, 2)}`);
                        } catch (err) {
                            console.error('Database test error:', err);
                            alert(`Database Test Error: ${err}`);
                        }
                    }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Test Database
                </button>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh',
                fontSize: '1.2rem'
            }}>
                Order not found
            </div>
        );
    }

    return (
        <>
            {showModal && (
                <OrderSuccessModal
                    onClose={() => {
                        setShowModal(false);
                        setShowSecondModal(true);
                    }}
                />
            )}
            {showSecondModal && (
                <SecondModal
                    onClose={() => setShowSecondModal(false)}
                />
            )}
            <Hero />
            <Policies order={order} orderItems={orderItems} />
        </>
    );
} 