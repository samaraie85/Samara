'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import styles from './charity.module.css';

interface CharityUse {
    id: number;
    created_at: string;
    user_id: string;
    order_id: string;
}

export default function CharityPage() {
    const [charityUses, setCharityUses] = useState<CharityUse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCharityUses = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('charity_use')
                .select('*');
            if (error) throw error;
            setCharityUses(data || []);
        } catch {
            setError('Failed to load charity use data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCharityUses();
    }, []);

    return (
        <DashboardLayout
            title="Charity Management"
            actionButton={undefined}
        >
            <div className={styles.content}>
                <div className={styles.programsList}>
                    {error && <div className={styles.error}>{error}</div>}
                    {isLoading ? (
                        <div className={styles.loading}>Loading charity use data...</div>
                    ) : charityUses.length > 0 ? (
                        <table className={styles.programsTable}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Created At</th>
                                    <th>User ID</th>
                                    <th>Order ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {charityUses.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{new Date(item.created_at).toLocaleString()}</td>
                                        <td>{item.user_id}</td>
                                        <td>{item.order_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyState}>No charity use records found</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 