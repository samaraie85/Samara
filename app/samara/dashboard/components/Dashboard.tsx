'use client';

import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import Link from 'next/link';
import Cookies from 'js-cookie';

interface AdminSession {
    id: string;
    username: string;
    expiresAt: string;
}

const Dashboard = () => {
    const [adminData, setAdminData] = useState<AdminSession | null>(null);

    useEffect(() => {
        // Check for admin session
        const sessionCookie = Cookies.get('adminSession');
        if (!sessionCookie) {
            // No session found, redirect to login
            window.location.href = '/samara/admin';
            return;
        }

        try {
            const sessionData = JSON.parse(sessionCookie) as AdminSession;

            // Check if session is expired
            if (new Date(sessionData.expiresAt) < new Date()) {
                Cookies.remove('adminSession');
                window.location.href = '/samara/admin';
                return;
            }

            setAdminData(sessionData);
        } catch (error) {
            console.error('Error parsing session:', error);
            Cookies.remove('adminSession');
            window.location.href = '/samara/admin';
        }
    }, []);

    if (!adminData) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <h1>Admin Panel</h1>
                <div className={styles.userInfo}>
                    <span>Welcome, {adminData.username}</span>
                    <button
                        onClick={() => {
                            Cookies.remove('adminSession');
                            window.location.href = '/samara/admin';
                        }}
                        className={styles.logoutButton}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.cardsGrid}>
                    <Link href="/samara/dashboard/products" className={styles.card}>
                        <div className={styles.cardIcon}>📦</div>
                        <h3>Products</h3>
                        <p>Manage your products inventory</p>
                    </Link>

                    <Link href="/samara/dashboard/orders" className={styles.card}>
                        <div className={styles.cardIcon}>🛒</div>
                        <h3>Orders</h3>
                        <p>View and manage customer orders</p>
                    </Link>

                    <Link href="/samara/dashboard/customers" className={styles.card}>
                        <div className={styles.cardIcon}>👥</div>
                        <h3>Customers</h3>
                        <p>Manage customer accounts</p>
                    </Link>

                    <Link href="/samara/dashboard/categories" className={styles.card}>
                        <div className={styles.cardIcon}>📑</div>
                        <h3>Categories</h3>
                        <p>Organize product categories</p>
                    </Link>

                    <Link href="/samara/dashboard/charity" className={styles.card}>
                        <div className={styles.cardIcon}>❤️</div>
                        <h3>Charity</h3>
                        <p>Manage charity programs and donations</p>
                    </Link>

                    <Link href="/samara/dashboard/cities" className={styles.card}>
                        <div className={styles.cardIcon}>🌆</div>
                        <h3>Cities</h3>
                        <p>Manage available delivery cities</p>
                    </Link>

                    <Link href="/samara/dashboard/delivery" className={styles.card}>
                        <div className={styles.cardIcon}>🚚</div>
                        <h3>Delivery</h3>
                        <p>Configure delivery options and zones</p>
                    </Link>

                    <Link href="/samara/dashboard/messages" className={styles.card}>
                        <div className={styles.cardIcon}>✉️</div>
                        <h3>Messages</h3>
                        <p>View and manage customer messages</p>
                    </Link>

                    <Link href="/samara/dashboard/promocodes" className={styles.card}>
                        <div className={styles.cardIcon}>🎟️</div>
                        <h3>Promocodes</h3>
                        <p>Create and manage discount codes</p>
                    </Link>

                    <Link href="/samara/dashboard/charts" className={styles.card}>
                        <div className={styles.cardIcon}>📊</div>
                        <h3>Charts</h3>
                        <p>View sales and analytics data</p>
                    </Link>




                </div>
            </main>
        </div>
    );
};

export default Dashboard; 