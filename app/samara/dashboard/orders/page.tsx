'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from './orders.module.css';
import { supabase } from '@/lib/supabase';

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
    units: {
        id: string;
        name: string;
        short_name: string;
    };
}

interface Order {
    id: number;
    created_at: string;
    user: string;
    price: number;
    promocode: string;
    discount: number;
    final_price: number;
    status: string;
    first_name: string;
    second_name: string;
    phone: string;
    email: string;
    country: string;
    city: string;
    street: string;
    floor: string;
    landmark: string;
    donation: number;
    delivery: number;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [showItemsModal, setShowItemsModal] = useState(false);
    const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [loadingItems, setLoadingItems] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            let query = supabase.from('orders').select('*');
            if (search) {
                query = query.ilike('user', `%${search}%`);
            }
            if (status) {
                query = query.eq('status', status);
            }
            const { data, error } = await query;
            if (!error && data) {
                setOrders(data);
            } else {
                setOrders([]);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [search, status]);

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        setUpdatingId(orderId);
        // Optimistic UI update
        setOrders(orders => orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
        // Update in backend
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        setUpdatingId(null);
    };

    const handleShowItems = async (orderId: number) => {
        setSelectedOrderId(orderId);
        setShowItemsModal(true);
        setLoadingItems(true);

        try {
            const { data: orderItems, error } = await supabase
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

            if (error) {
                console.error('Error fetching order items:', error);
                setSelectedOrderItems([]);
            } else {
                setSelectedOrderItems(orderItems || []);
            }
        } catch (error) {
            console.error('Error fetching order items:', error);
            setSelectedOrderItems([]);
        } finally {
            setLoadingItems(false);
        }
    };

    const totalFinalPrice = orders.reduce((sum, order) => sum + (order.final_price || 0), 0);
    const totalDonation = orders.reduce((sum, order) => sum + (order.donation || 0), 0);

    return (
        <DashboardLayout
            title="Orders Management"
            actionButton={undefined}
        >
            <div className={styles.content}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Orders Value</h3>
                        <p>{totalFinalPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Total Donations</h3>
                        <p>{totalDonation.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className={styles.searchInput}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className={styles.statusFilter}
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Preparing">Preparing</option>
                        <option value="In Delivery">In Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                <div className={styles.ordersList}>
                    {loading ? (
                        <p className={styles.emptyState}>Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <p className={styles.emptyState}>No orders found</p>
                    ) : (
                        <table className={styles.ordersTable}>
                            <thead>
                                <tr>
                                    <th>Items</th>
                                    <th>ID</th>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th>First Name</th>
                                    <th>Second Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Country</th>
                                    <th>City</th>
                                    <th>Street</th>
                                    <th>Floor</th>
                                    <th>Landmark</th>
                                    <th>Price</th>
                                    <th>Promocode</th>
                                    <th>Discount</th>
                                    <th>Donation</th>
                                    <th>Delivery</th>
                                    <th>Status</th>
                                    <th>Final Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <button
                                                className={styles.showItemsBtn}
                                                onClick={() => handleShowItems(order.id)}
                                            >
                                                Show Items
                                            </button>
                                        </td>
                                        <td>{order.id}</td>
                                        <td>{order.created_at}</td>
                                        <td>{order.user}</td>
                                        <td>{order.first_name}</td>
                                        <td>{order.second_name}</td>
                                        <td>{order.phone}</td>
                                        <td>{order.email}</td>
                                        <td>{order.country}</td>
                                        <td>{order.city}</td>
                                        <td>{order.street}</td>
                                        <td>{order.floor}</td>
                                        <td>{order.landmark}</td>
                                        <td>{order.price}</td>
                                        <td>{order.promocode}</td>
                                        <td>{order.discount}</td>
                                        <td>{order.donation}</td>
                                        <td>{order.delivery}</td>
                                        <td>
                                            <span
                                                className={
                                                    order.status === 'Preparing' ? styles.statusPreparing :
                                                        order.status === 'In Delivery' ? styles.statusDelivery :
                                                            order.status === 'Delivered' ? styles.statusDelivered :
                                                                order.status === 'Cancelled' ? styles.statusCancelled : ''
                                                }
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{order.final_price}</td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button
                                                    className={styles.statusBtn + ' ' + styles.statusPreparing}
                                                    disabled={order.status === 'Preparing' || updatingId === order.id}
                                                    onClick={() => handleStatusChange(order.id, 'Preparing')}
                                                >Preparing</button>
                                                <button
                                                    className={styles.statusBtn + ' ' + styles.statusDelivery}
                                                    disabled={order.status === 'In Delivery' || updatingId === order.id}
                                                    onClick={() => handleStatusChange(order.id, 'In Delivery')}
                                                >In Delivery</button>
                                                <button
                                                    className={styles.statusBtn + ' ' + styles.statusDelivered}
                                                    disabled={order.status === 'Delivered' || updatingId === order.id}
                                                    onClick={() => handleStatusChange(order.id, 'Delivered')}
                                                >Delivered</button>
                                                <button
                                                    className={styles.statusBtn + ' ' + styles.statusCancelled}
                                                    disabled={order.status === 'Cancelled   ' || updatingId === order.id}
                                                    onClick={() => handleStatusChange(order.id, 'Cancelled')}
                                                >Cancelled</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Order Items Modal */}
            {showItemsModal && (
                <div className={styles.modalOverlay} onClick={() => setShowItemsModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Order Items - Order #{selectedOrderId}</h3>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowItemsModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {loadingItems ? (
                                <p>Loading items...</p>
                            ) : selectedOrderItems.length === 0 ? (
                                <p>No items found for this order.</p>
                            ) : (
                                <table className={styles.itemsTable}>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Unit</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrderItems.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className={styles.productInfo}>
                                                        {item.products?.image && (
                                                            <img
                                                                src={item.products.image}
                                                                alt={item.products.name}
                                                                className={styles.productImage}
                                                            />
                                                        )}
                                                        <span>{item.products?.name || 'Unknown Product'}</span>
                                                    </div>
                                                </td>
                                                <td>{item.qty}</td>
                                                <td>{item.units?.short_name || 'N/A'}</td>
                                                <td>€{item.price?.toFixed(2) || '0.00'}</td>
                                                <td>€{item.total_price?.toFixed(2) || '0.00'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
} 