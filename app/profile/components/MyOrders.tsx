'use client'
import React, { useState, useEffect, useCallback } from 'react';
import styles from './MyOrders.module.css';
import { User } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faEllipsisH, faSync, faEye } from '@fortawesome/free-solid-svg-icons';
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

interface DetailedOrderItem {
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
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({
        sortOrder: 'newest' as 'newest' | 'oldest',
        dateFrom: '',
        dateTo: ''
    });
    const [applyingFilters, setApplyingFilters] = useState(false);
    const [showItemsModal, setShowItemsModal] = useState(false);
    const [selectedOrderItems, setSelectedOrderItems] = useState<DetailedOrderItem[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [loadingItems, setLoadingItems] = useState(false);
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

            // Build query parameters
            const params = new URLSearchParams({
                userId: user.id,
                page: page.toString(),
                limit: pagination.limit.toString(),
                sort: appliedFilters.sortOrder
            });

            if (appliedFilters.dateFrom) {
                params.append('dateFrom', appliedFilters.dateFrom);
            }
            if (appliedFilters.dateTo) {
                params.append('dateTo', appliedFilters.dateTo);
            }

            const response = await fetch(`/api/users/orders?${params.toString()}`);

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
    }, [user.id, pagination.limit, appliedFilters]);

    useEffect(() => {
        fetchOrders(currentPage);
        fetchUserPhone();
    }, [user.id, currentPage, fetchOrders, fetchUserPhone]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleApplyFilters = () => {
        setApplyingFilters(true);
        setAppliedFilters({
            sortOrder,
            dateFrom,
            dateTo
        });
        setCurrentPage(1);

        // Simulate a small delay to show loading state
        setTimeout(() => {
            setApplyingFilters(false);
        }, 500);
    };

    const handleShowItems = async (orderId: string) => {
        setSelectedOrderId(orderId);
        setShowItemsModal(true);
        setLoadingItems(true);

        try {
            const response = await fetch(`/api/orders/${orderId}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedOrderItems(data.orderItems || []);
            } else {
                setSelectedOrderItems([]);
            }
        } catch (error) {
            console.error('Error fetching order items:', error);
            setSelectedOrderItems([]);
        } finally {
            setLoadingItems(false);
        }
    };

    const handleClearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setSortOrder('newest');
        setAppliedFilters({
            sortOrder: 'newest',
            dateFrom: '',
            dateTo: ''
        });
        setCurrentPage(1);
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
            {/* Filters Section */}
            <div className={styles.filtersSection}>
                <div className={styles.filtersPanel}>
                    <div className={styles.filterRow}>
                        <div className={styles.filterGroup}>
                            <label>Sort by:</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                className={styles.sortSelect}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>From Date:</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className={styles.dateInput}
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <label>To Date:</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className={styles.dateInput}
                            />
                        </div>

                        <button
                            className={styles.applyFiltersBtn}
                            onClick={handleApplyFilters}
                            disabled={applyingFilters}
                        >
                            {applyingFilters ? (
                                <>
                                    <div className={styles.loadingSpinner}></div>
                                    Applying...
                                </>
                            ) : (
                                'Apply Filters'
                            )}
                        </button>

                        <button
                            className={styles.clearFiltersBtn}
                            onClick={handleClearFilters}
                            disabled={applyingFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
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
                            <div className={styles.orderActions}>
                                <button
                                    className={styles.showItemsBtn}
                                    onClick={() => handleShowItems(order.id.toString())}
                                >
                                    <FontAwesomeIcon icon={faEye} /> View Items
                                </button>
                                <div className={styles.orderStatusContainer}>
                                    <span className={`${styles.orderStatus} ${order.status === 'Preparing' ? styles.statusPreparing :
                                        order.status === 'In Delivery' ? styles.statusDelivery :
                                            order.status === 'Delivered' ? styles.statusDelivered :
                                                order.status === 'Cancelled' ? styles.statusCancelled :
                                                    styles.statusDefault
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {pagination.totalPages > 1 && orders.length > 0 && renderPagination()}

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
                                                            <Image
                                                                src={item.products.image}
                                                                alt={item.products.name}
                                                                className={styles.productImage}
                                                                width={100}
                                                                height={100}
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
        </div>
    );
};

export default MyOrders; 