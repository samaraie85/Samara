'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from './orders.module.css';
import { supabase } from '@/lib/supabase';

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
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
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
                                    <th>Change Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
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
                                                            order.status === 'Delivered' ? styles.statusDelivered : ''
                                                }
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{order.final_price}</td>
                                        <td>
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 