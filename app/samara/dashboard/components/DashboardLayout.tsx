'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from './DashboardLayout.module.css';

interface AdminSession {
    id: number;
    username: string;
    expiresAt: string;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    actionButton?: {
        label: string;
        onClick: () => void;
    };
}

export default function DashboardLayout({ children, title, actionButton }: DashboardLayoutProps) {
    const router = useRouter();
    const [adminData, setAdminData] = useState<AdminSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = () => {
            const sessionData = Cookies.get('adminSession');
            if (!sessionData) {
                router.push('/samara/admin');
                return;
            }

            try {
                const session: AdminSession = JSON.parse(sessionData);
                if (new Date(session.expiresAt) < new Date()) {
                    Cookies.remove('adminSession');
                    router.push('/samara/admin');
                    return;
                }
                setAdminData(session);
            } catch (error) {
                console.error('Error parsing session data:', error);
                Cookies.remove('adminSession');
                router.push('/samara/admin');
            }
            setIsLoading(false);
        };

        checkSession();
    }, [router]);

    const handleLogout = () => {
        Cookies.remove('adminSession');
        router.push('/samara/admin');
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!adminData) {
        return null;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <button
                            onClick={() => router.push('/samara/dashboard')}
                            className={styles.backButton}
                        >
                            ← Back to Dashboard
                        </button>
                        <h1>{title}</h1>
                    </div>
                    <div className={styles.userSection}>
                        <div className={styles.userInfo}>
                            <span className={styles.welcome}>Welcome,</span>
                            <span className={styles.username}>{adminData.username}</span>
                        </div>
                        {actionButton && (
                            <button
                                onClick={actionButton.onClick}
                                className={styles.actionButton}
                            >
                                {actionButton.label}
                            </button>
                        )}
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
} 