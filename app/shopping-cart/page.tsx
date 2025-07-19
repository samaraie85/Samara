"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import CartInfoHeader from './components/CartInfoHeader';
import CartItemList from './components/CartItemList';
import OrderSummary from './components/OrderSummary';
import styles from './Cart.module.css';
import Hero from './components/Hero';
import { supabase } from '@/lib/supabase';
import cartImage from '../assets/cart-image.png';
import AOS from 'aos';
import 'aos/dist/aos.css';


// Cart item type
interface CartItem {
    id: number;
    image: string;
    name: string;
    supplier: string;
    price: number;
    discount_price: number;
    unit: string;
    unitShortName: string;
    qty_per_unit: number;
    quantity: number;
    category: string;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [delivery, setDelivery] = useState(0);

    // Fetch user session and cart data
    useEffect(() => {
        const fetchUserAndCart = async () => {
            try {
                // Get current user session
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    setLoading(false);
                    return; // Not authenticated
                }

                setUserId(session.user.id);

                // Fetch cart items for this user
                const response = await fetch(`/api/cart?user=${session.user.id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch cart items');
                }

                const data = await response.json();
                setCartItems(data);
            } catch (error) {
                console.error('Error fetching cart data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndCart();
    }, []);

    // Fetch delivery price from the database
    useEffect(() => {
        const fetchDeliveryPrice = async () => {
            try {
                const response = await fetch('/api/delivery');
                if (response.ok) {
                    const data = await response.json();
                    setDelivery(data.price);
                } else {
                    console.error('Failed to fetch delivery price');
                    setDelivery(0);
                }
            } catch (error) {
                console.error('Error fetching delivery price:', error);
                setDelivery(0);
            }
        };

        fetchDeliveryPrice();
    }, []);

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });

    // Handlers with API calls
    const handleIncrement = async (id: number) => {
        if (!userId) return;

        // Find the item to get its step_qty
        const item = cartItems.find(item => item.id === id);
        if (!item) return;

        // Optimistically update UI
        setCartItems(items => items.map(item =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        ));

        try {
            // Update in backend
            await fetch(`/api/cart/incerement?user=${userId}&product=${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: 1 })
            });
        } catch (error) {
            console.error('Failed to increment item quantity:', error);
            // Revert the optimistic update on error
            setCartItems(items => items.map(item =>
                item.id === id ? { ...item, quantity: item.quantity - 1 } : item
            ));
        }
    };

    const handleDecrement = async (id: number) => {
        if (!userId) return;

        const item = cartItems.find(item => item.id === id);
        if (!item || item.quantity <= 1) return;

        // Optimistically update UI
        setCartItems(items => items.map(item =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        ));

        try {
            // Update in backend
            await fetch(`/api/cart/decerement?user=${userId}&product=${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: 1 })
            });
        } catch (error) {
            console.error('Failed to decrement item quantity:', error);
            // Revert the optimistic update on error
            setCartItems(items => items.map(item =>
                item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        }
    };

    const handleRemove = async (id: number) => {
        if (!userId) return;

        // Optimistically update UI
        const removedItem = cartItems.find(item => item.id === id);
        setCartItems(items => items.filter(item => item.id !== id));

        try {
            // Remove from backend
            await fetch(`/api/cart/remove?user=${userId}&product=${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Failed to remove item from cart:', error);
            // Revert the optimistic update on error
            if (removedItem) {
                setCartItems(prev => [...prev, removedItem]);
            }
        }
    };

    // Calculations
    // const totalItems = cartItems.length;
    const totalItems = cartItems.reduce((sum, item) => item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + (item.discount_price != 0 ? item.discount_price * item.quantity : item.price * item.quantity), 0);
    const tax = 0;
    const total = subtotal + tax + delivery;

    if (loading) {
        return (
            <div className={styles.cartPage}>
                <div className={styles.cartContainer} data-aos="fade-up">
                    <p>Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0 && !loading) {
        return (
            <>
                <Hero data-aos="fade-down" />
                <div className={styles.cartPage}>
                    <div className={styles.cartContainer} data-aos="fade-up">
                        <p>Your cart is empty. Start shopping to add items to your cart.</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Hero data-aos="fade-down" />
            <div className={styles.cartPage}>
                <div className={styles.cartContainer}>
                    <div className={styles.cartItemsSection} data-aos="fade-right">
                        <CartInfoHeader itemCount={totalItems} />
                        <CartItemList
                            items={cartItems}
                            onIncrement={handleIncrement}
                            onDecrement={handleDecrement}
                            onRemove={handleRemove}
                        />
                    </div>
                    <div className={styles.orderSummarySection} data-aos="fade-left">
                        <OrderSummary
                            totalItems={totalItems}
                            subtotal={subtotal}
                            tax={tax}
                            delivery={delivery}
                            total={total}
                        />
                    </div>
                </div>
                <Image className={styles.cartImage} src={cartImage} alt="cart-bg" width={1000} height={1000} />
                <Image className={styles.cartImage2} src={cartImage} alt="cart-bg" width={1000} height={1000} />
            </div>
        </>
    );
} 