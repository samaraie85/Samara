'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import styles from './promocodes.module.css';

interface Promocode {
    id: number;
    created_at: string;
    promocode: string;
    max_uses: number;
    discount_percentage: number;
    is_active: string; // 'Y' or 'N'
    min_order_amount: number;
}

export default function PromocodesPage() {
    const [promocodes, setPromocodes] = useState<Promocode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [newPromocode, setNewPromocode] = useState({
        promocode: '',
        discount_percentage: '',
        min_order_amount: '',
        max_uses: '',
        is_active: 'Y',
    });

    const fetchPromocodes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('promocodes')
                .select('*');
            if (error) throw error;
            setPromocodes(data || []);
        } catch {
            setError('Failed to load promocodes. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromocodes();
    }, []);

    const handleAddPromocode = () => {
        setShowAddForm(true);
        setAddError(null);
        setNewPromocode({
            promocode: '',
            discount_percentage: '',
            min_order_amount: '',
            max_uses: '',
            is_active: 'Y',
        });
    };

    const handleAddPromocodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);
        // Validation
        if (!newPromocode.promocode.trim()) {
            setAddError('Promocode is required.');
            setAddLoading(false);
            return;
        }
        if (!newPromocode.discount_percentage || isNaN(Number(newPromocode.discount_percentage))) {
            setAddError('Discount percentage must be a number.');
            setAddLoading(false);
            return;
        }
        if (!newPromocode.min_order_amount || isNaN(Number(newPromocode.min_order_amount))) {
            setAddError('Min order amount must be a number.');
            setAddLoading(false);
            return;
        }
        if (!newPromocode.max_uses || isNaN(Number(newPromocode.max_uses))) {
            setAddError('Max uses must be a number.');
            setAddLoading(false);
            return;
        }
        try {
            const { error } = await supabase
                .from('promocodes')
                .insert([{
                    promocode: newPromocode.promocode.trim(),
                    discount_percentage: Number(newPromocode.discount_percentage),
                    min_order_amount: Number(newPromocode.min_order_amount),
                    max_uses: Number(newPromocode.max_uses),
                    is_active: newPromocode.is_active,
                }]);
            if (error) throw error;
            setShowAddForm(false);
            fetchPromocodes();
        } catch {
            setAddError('Failed to add promocode. Please try again.');
        } finally {
            setAddLoading(false);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'Y' ? 'N' : 'Y';
            const { error } = await supabase
                .from('promocodes')
                .update({ is_active: newStatus })
                .eq('id', id);
            if (error) throw error;
            fetchPromocodes();
        } catch {
            setError('Failed to update promocode status. Please try again.');
        }
    };

    return (
        <DashboardLayout
            title="Promocodes Management"
            actionButton={{
                label: "Add Promocode",
                onClick: handleAddPromocode
            }}
        >
            <div className={styles.content}>
                {showAddForm && (
                    <form className={styles.addForm} onSubmit={handleAddPromocodeSubmit}>
                        <input
                            type="text"
                            placeholder="Promocode"
                            value={newPromocode.promocode}
                            onChange={e => setNewPromocode({ ...newPromocode, promocode: e.target.value })}
                            className={styles.searchInput}
                            disabled={addLoading}
                        />
                        <input
                            type="number"
                            placeholder="Discount %"
                            value={newPromocode.discount_percentage}
                            onChange={e => setNewPromocode({ ...newPromocode, discount_percentage: e.target.value })}
                            className={styles.searchInput}
                            disabled={addLoading}
                        />
                        <input
                            type="number"
                            placeholder="Min Order Amount"
                            value={newPromocode.min_order_amount}
                            onChange={e => setNewPromocode({ ...newPromocode, min_order_amount: e.target.value })}
                            className={styles.searchInput}
                            disabled={addLoading}
                        />
                        <input
                            type="number"
                            placeholder="Max Uses"
                            value={newPromocode.max_uses}
                            onChange={e => setNewPromocode({ ...newPromocode, max_uses: e.target.value })}
                            className={styles.searchInput}
                            disabled={addLoading}
                        />
                        <select
                            value={newPromocode.is_active}
                            onChange={e => setNewPromocode({ ...newPromocode, is_active: e.target.value })}
                            className={styles.filterSelect}
                            disabled={addLoading}
                        >
                            <option value="Y">Active</option>
                            <option value="N">Inactive</option>
                        </select>
                        <button type="submit" className={styles.statusButton} disabled={addLoading}>
                            {addLoading ? 'Adding...' : 'Add Promocode'}
                        </button>
                        <button type="button" className={styles.statusButton} onClick={() => setShowAddForm(false)} disabled={addLoading}>
                            Cancel
                        </button>
                        {addError && <div className={styles.error}>{addError}</div>}
                    </form>
                )}
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search promocodes..."
                        className={styles.searchInput}
                    />
                    <select className={styles.filterSelect}>
                        <option value="">All Promocodes</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="upcoming">Upcoming</option>
                    </select>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Promocodes</h3>
                        <p>{promocodes.length}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Active Promocodes</h3>
                        <p>{promocodes.filter(p => p.is_active === 'Y').length}</p>
                    </div>
                    {/* <div className={styles.statCard}>
                        <h3>Total Usage</h3>
                        <p>0</p>
                    </div> */}
                </div>

                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.promocodesList}>
                    {isLoading ? (
                        <div className={styles.loading}>Loading promocodes...</div>
                    ) : promocodes.length > 0 ? (
                        <table className={styles.promocodesTable}>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Discount (%)</th>
                                    <th>Min Order Amount</th>
                                    <th>Max Uses</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promocodes.map((promo) => (
                                    <tr key={promo.id}>
                                        <td>{promo.promocode}</td>
                                        <td>{promo.discount_percentage}</td>
                                        <td>{promo.min_order_amount}</td>
                                        <td>{promo.max_uses}</td>
                                        <td>
                                            <span className={promo.is_active === 'Y' ? styles.active : styles.inactive}>
                                                {promo.is_active === 'Y' ? 'Active' : 'Inactive'}
                                            </span>
                                            <button
                                                className={styles.statusButton}
                                                style={{ marginLeft: '1rem' }}
                                                onClick={() => handleToggleStatus(promo.id, promo.is_active)}
                                            >
                                                {promo.is_active === 'Y' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                        <td>{new Date(promo.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyState}>No promocodes found</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 