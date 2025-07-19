'use client'
import React, { useState, useEffect, useCallback } from 'react';
import styles from './MyOrders.module.css';
import { User } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faEllipsisH, faSync } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Image from 'next/image';
import loadinga from '../../assets/loading_1.gif';

interface OrderItem {
    id: number;
    quantity: number;
    name: string;
    size: string;
}

interface Order {
    id: number;
    items: OrderItem[];
    address: string;
    phone: string;
    price: string;
    timestamp: string;
    status: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface MyOrdersProps {
    user: User;
}

const MyOrders: React.FC<MyOrdersProps> = ({ user }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [userPhone, setUserPhone] = useState<string>('');
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 4,
        totalPages: 0
    });

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });
    const fetchUserPhone = useCallback(async () => {
        try {
            // Get the phone number directly from the provided user prop
            const phone = user?.user_metadata?.phone || '';
            setUserPhone(phone);
        } catch (error) {
            console.error('Error accessing user phone number:', error);
        }
    }, [user?.user_metadata?.phone]);

    const fetchOrders = useCallback(async (page: number) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));

            const response = await fetch(`/api/users/orders?userId=${user.id}&page=${page}&limit=${pagination.limit}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data.orders);
            setPagination(data.pagination);
            setError(null);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error instanceof Error ? error.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [user.id, pagination.limit]);

    useEffect(() => {
        fetchOrders(currentPage);
        fetchUserPhone();
    }, [user.id, currentPage, fetchOrders, fetchUserPhone]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        const pageNumbers = [];
        for (let i = 1; i <= pagination.totalPages; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`${styles.pageButton} ${currentPage === i ? styles.activePage : ''}`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div data-aos="fade-up" className={styles.pagination}>
                <button
                    className={styles.pageArrow}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {pageNumbers}
                {pagination.totalPages > 5 && (
                    <button className={styles.pageButton}>
                        <FontAwesomeIcon icon={faEllipsisH} />
                    </button>
                )}
                <button
                    className={styles.pageArrow}
                    onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
        );
    };

    if (loading && orders.length === 0) {
        return <div className={styles.loading}><Image src={loadinga} alt="loading" width={100} height={100} /></div>;

    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.error}>Error: {error}</div>
                <button
                    className={styles.retryButton}
                    onClick={() => fetchOrders(currentPage)}
                >
                    <FontAwesomeIcon icon={faSync} /> Retry
                </button>
            </div>
        );
    }

    if (orders.length === 0 && !loading && !error) {
        return (
            <div className={styles.noOrders}>
                <p>You have no orders yet.</p>
            </div>
        );
    }

    return (
        <div data-aos="fade-up" className={styles.ordersContainer}>
            {orders.map((order) => (
                <div key={order.id} className={styles.orderCard} data-aos="fade-up">
                    <div className={styles.orderHeader}>
                        <div className={styles.orderNumber}>
                            <span className={styles.numberCircle}>{order.id}</span>
                        </div>
                        <div className={styles.orderTitle}>
                            <h3>Order : {order.items.map(item => (
                                <span key={item.id} className={styles.orderItem}>
                                    <span className={styles.itemQuantity}>{item.quantity}</span> {item.name} {item.size}
                                    {item.id !== order.items.length ? ' , ' : ''}
                                </span>
                            ))}</h3>
                        </div>
                        <div className={styles.orderTimestamp}>{order.timestamp}</div>
                    </div>

                    <div className={styles.orderDetails}>
                        <div className={styles.addressInfo}>
                            <p>Adress: {order.address}</p>
                            {userPhone && userPhone.trim() !== '' && (
                                <p>Phone Number: {userPhone}</p>
                            )}
                        </div>

                        <div className={styles.orderFooter}>
                            <div className={styles.orderPrice}>{order.price}</div>
                            <div className={styles.orderStatusContainer}>
                                <span className={styles.orderStatus}>{order.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {pagination.totalPages > 1 && orders.length > 0 && renderPagination()}
        </div>
    );
};

export default MyOrders; 