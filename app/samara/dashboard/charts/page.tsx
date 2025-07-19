'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import styles from './charts.module.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface ChartData {
    totalOrders: number;
    grossRevenue: number;
    netRevenue: number;
    totalDonations: number;
    totalProducts: number;
    totalCustomers: number;
    monthlyGrossRevenue: number[];
    monthlyNetRevenue: number[];
    monthlyDonations: number[];
    monthlyOrders: number[];
    categoryDistribution: number[];
    categoryLabels: string[];
    productNames: string[];
    productQtySold: number[];
    customerNames: string[];
    customerOrderCounts: number[];
}

export default function ChartsPage() {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const [chartData, setChartData] = useState<ChartData>({
        totalOrders: 0,
        grossRevenue: 0,
        netRevenue: 0,
        totalDonations: 0,
        totalProducts: 0,
        totalCustomers: 0,
        monthlyGrossRevenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        monthlyNetRevenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        monthlyDonations: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        monthlyOrders: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        categoryDistribution: [0, 0, 0, 0, 0],
        categoryLabels: [],
        productNames: [],
        productQtySold: [],
        customerNames: [],
        customerOrderCounts: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startMonth, setStartMonth] = useState(currentMonth);
    const [endMonth, setEndMonth] = useState(currentMonth);

    const fetchChartData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch orders data
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*');

            if (ordersError) throw ordersError;

            // Filter orders by selected month range
            const filteredOrders = (ordersData || []).filter(order => {
                const orderMonth = new Date(order.created_at).getMonth();
                return orderMonth >= startMonth && orderMonth <= endMonth;
            });

            // Fetch products data
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*');

            if (productsError) throw productsError;

            // Fetch users data
            const { data: usersData, error: usersError } = await supabase
                .from('app_users')
                .select('*');

            if (usersError) throw usersError;

            // Fetch categories data
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('id, name');
            if (categoriesError) throw categoriesError;

            // Calculate category distribution
            let categoryLabels: string[] = [];
            let categoryDistribution: number[] = [];
            if (categoriesData && productsData) {
                categoryLabels = categoriesData.map(cat => cat.name);
                categoryDistribution = categoriesData.map(cat =>
                    productsData.filter(prod => prod.category === cat.id).length
                );
            }

            // Fetch order_items data
            const { data: orderItemsData, error: orderItemsError } = await supabase
                .from('order_items')
                .select('product, qty');
            if (orderItemsError) throw orderItemsError;

            // Prepare data for quantity sold per product chart from order_items
            let productNames: string[] = [];
            let productQtySold: number[] = [];
            if (productsData && orderItemsData) {
                // Create a map of productId to total qty sold (only for filtered orders)
                const filteredOrderIds = new Set(filteredOrders.map((order: { id: number }) => order.id));
                const qtyMap = new Map<number, number>();
                orderItemsData.forEach((item: { product: number, qty: number, order?: number }) => {
                    // If order_items has an 'order' field, filter by order id
                    if (!item.order || filteredOrderIds.has(item.order)) {
                        qtyMap.set(item.product, (qtyMap.get(item.product) || 0) + (item.qty || 0));
                    }
                });
                productNames = productsData.map((prod: { id: number, name: string }) => prod.name);
                productQtySold = productsData.map((prod: { id: number }) => qtyMap.get(prod.id) || 0);
            }

            // Calculate statistics from filtered data
            const totalOrders = filteredOrders.length;
            const grossRevenue = filteredOrders.reduce((sum, order) => sum + (order.final_price || 0), 0) || 0;
            const totalDonations = filteredOrders.reduce((sum, order) => sum + (order.donation || 0), 0) || 0;
            const netRevenue = grossRevenue - totalDonations;
            const totalProducts = productsData?.length || 0;
            const totalCustomers = usersData?.length || 0;

            // Calculate monthly data for revenue chart (for all months, but only fill in selected range)
            const monthlyGrossRevenue = Array(12).fill(0);
            const monthlyNetRevenue = Array(12).fill(0);
            const monthlyDonations = Array(12).fill(0);
            const monthlyOrders = Array(12).fill(0);

            filteredOrders.forEach(order => {
                const orderDate = new Date(order.created_at);
                const month = orderDate.getMonth();
                monthlyOrders[month]++;
                const gross = order.final_price || 0;
                const donation = order.donation || 0;
                const net = gross - donation;
                monthlyGrossRevenue[month] += gross;
                monthlyDonations[month] += donation;
                monthlyNetRevenue[month] += net;
            });

            // Prepare data for top 10 customers by order count (filtered)
            let customerNames: string[] = [];
            let customerOrderCounts: number[] = [];
            if (filteredOrders && usersData) {
                // Count orders per user
                const orderCountMap = new Map<string, number>();
                filteredOrders.forEach((order: { user: string }) => {
                    orderCountMap.set(order.user, (orderCountMap.get(order.user) || 0) + 1);
                });
                // Get user id to name map
                const userNameMap = new Map<string, string>();
                usersData.forEach((user: { id: string, full_name: string, email: string }) => {
                    userNameMap.set(user.id, user.full_name || user.email || user.id);
                });
                // Sort users by order count and take top 10
                const sorted = Array.from(orderCountMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);
                customerNames = sorted.map(([userId]) => userNameMap.get(userId) || userId);
                customerOrderCounts = sorted.map(([, count]) => count);
            }

            setChartData({
                totalOrders,
                grossRevenue,
                netRevenue,
                totalDonations,
                totalProducts,
                totalCustomers,
                monthlyGrossRevenue,
                monthlyNetRevenue,
                monthlyDonations,
                monthlyOrders,
                categoryDistribution,
                categoryLabels,
                productNames,
                productQtySold,
                customerNames,
                customerOrderCounts,
            });

        } catch (err) {
            console.error('Error fetching chart data:', err);
            setError('Failed to load chart data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [startMonth, endMonth]);

    useEffect(() => {
        fetchChartData();
    }, [fetchChartData]);

    const salesChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Gross Revenue',
                data: chartData.monthlyGrossRevenue,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
            },
            {
                label: 'Net Revenue',
                data: chartData.monthlyNetRevenue,
                borderColor: 'rgb(255, 205, 86)',
                backgroundColor: 'rgba(255, 205, 86, 0.2)',
                tension: 0.4,
            },
            {
                label: 'Donations',
                data: chartData.monthlyDonations,
                borderColor: 'rgb(128, 255, 99)',
                backgroundColor: 'rgba(128, 255, 99, 0.2)',
                tension: 0.4,
            },
        ],
    };

    const ordersChartColors = [
        'rgba(251 ,191 ,36, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(79 ,70 ,229, 0.8)',
        'rgba(255, 99, 71, 0.8)',
        'rgba(60, 179, 113, 0.8)',
        'rgba(100, 149, 237, 0.8)',
        'rgba(255, 215, 0, 0.8)',
        'rgba(16 ,185, 129, 0.8)',
        'rgba(45, 212, 191, 0.8)'
    ];

    const ordersChartData = {
        labels: monthLabels,
        datasets: [
            {
                label: 'Number of Orders',
                data: chartData.monthlyOrders,
                backgroundColor: ordersChartColors,
                borderWidth: 1,
            },
        ],
    };



    const qtySoldChartData = {
        labels: chartData.productNames,
        datasets: [
            {
                label: 'Quantity Sold',
                data: chartData.productQtySold,
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                borderColor: 'rgb(255, 159, 64)',
                borderWidth: 1,
            },
        ],
    };

    const topCustomersChartData = {
        labels: chartData.customerNames,
        datasets: [
            {
                label: 'Total Orders',
                data: chartData.customerOrderCounts,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#f3f4f6',
                },
            },
            title: {
                display: true,
                color: '#f3f4f6',
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#9ca3af',
                },
                grid: {
                    color: '#374151',
                },
            },
            y: {
                ticks: {
                    color: '#9ca3af',
                },
                grid: {
                    color: '#374151',
                },
            },
        },
    };

    const handleRefresh = () => {
        fetchChartData();
    };

    return (
        <DashboardLayout
            title="Analytics Dashboard"
            actionButton={{
                label: "Refresh Data",
                onClick: handleRefresh
            }}
        >
            <div className={styles.content}>
                <div className={styles.filters} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#252525',
                    borderRadius: '0.75rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                }}>
                    <label htmlFor="startMonth" style={{ fontWeight: 500, color: '#f3f4f6', marginRight: 4 }}>Start Month:</label>
                    <select
                        id="startMonth"
                        value={startMonth}
                        onChange={e => {
                            const value = Number(e.target.value);
                            if (value <= endMonth) setStartMonth(value);
                        }}
                        className={styles.filterSelect}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #fff',
                            background: '#1a1a1a',
                            color: '#f3f4f6',
                            fontWeight: 500,
                        }}
                    >
                        {monthLabels.map((label, idx) => (
                            <option key={label} value={idx}>{label}</option>
                        ))}
                    </select>
                    <label htmlFor="endMonth" style={{ fontWeight: 500, color: '#f3f4f6', marginRight: 4 }}>End Month:</label>
                    <select
                        id="endMonth"
                        value={endMonth}
                        onChange={e => {
                            const value = Number(e.target.value);
                            if (value >= startMonth) setEndMonth(value);
                        }}
                        className={styles.filterSelect}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #fff',
                            background: '#1a1a1a',
                            color: '#f3f4f6',
                            fontWeight: 500,
                        }}
                    >
                        {monthLabels.map((label, idx) => (
                            <option key={label} value={idx}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Orders</h3>
                        <p>{chartData.totalOrders.toLocaleString()}</p>
                    </div>

                    <div className={styles.statCard}>
                        <h3>Gross Revenue</h3>
                        <p>${chartData.grossRevenue.toLocaleString()}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Net Revenue</h3>
                        <p>${chartData.netRevenue.toLocaleString()}</p>
                    </div>

                    <div className={styles.statCard}>
                        <h3>Total Donations</h3>
                        <p>${chartData.totalDonations.toLocaleString()}</p>
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {isLoading ? (
                    <div className={styles.loading}>Loading analytics data...</div>
                ) : (
                    <div className={styles.chartsGrid}>
                        <div className={styles.chartCard}>
                            <h3>Sales Revenue Trend</h3>
                            <div className={styles.chartContainer}>
                                <Line data={salesChartData} options={chartOptions} />
                            </div>
                        </div>

                        <div className={styles.chartCard}>
                            <h3>Orders Volume</h3>
                            <div className={styles.chartContainer}>
                                <Bar data={ordersChartData} options={chartOptions} />
                            </div>
                        </div>

                        <div className={styles.chartCard}>
                            <h3>Quantity Sold per Product</h3>
                            <div className={styles.chartContainer}>
                                <Bar data={qtySoldChartData} options={chartOptions} />
                            </div>
                        </div>

                        <div className={styles.chartCard}>
                            <h3>Top 10 Customers by Orders</h3>
                            <div className={styles.chartContainer}>
                                <Bar data={topCustomersChartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>


                )}
            </div>
        </DashboardLayout>
    );
}
