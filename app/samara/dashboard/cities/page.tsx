'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import styles from './cities.module.css';

interface City {
    id: number;
    name: string;
    is_active: 'Y' | 'N';
}

export default function CitiesPage() {
    const [cities, setCities] = useState<City[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0
    });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCityName, setNewCityName] = useState('');
    const [newCityStatus, setNewCityStatus] = useState<'Y' | 'N'>('Y');
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    const fetchCities = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            let query = supabase
                .from('cities')
                .select('*', { count: 'exact' });

            // Apply search filter if exists
            if (searchQuery) {
                query = query.ilike('name', `%${searchQuery}%`);
            }

            // Apply status filter if exists
            if (statusFilter) {
                if (statusFilter === 'active') {
                    query = query.eq('is_active', 'Y');
                } else if (statusFilter === 'inactive') {
                    query = query.eq('is_active', 'N');
                }
            }

            const { data, error, count } = await query;

            if (error) throw error;

            // Calculate statistics
            const activeCities = data?.filter(city => city.is_active === 'Y') || [];

            setCities(data || []);
            setStats({
                total: count || 0,
                active: activeCities.length
            });
        } catch (err) {
            console.error('Error fetching cities:', err);
            setError('Failed to load cities. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        fetchCities();
    }, [fetchCities]);

    const handleAddCity = () => {
        setShowAddForm(true);
        setAddError(null);
        setNewCityName('');
        setNewCityStatus('Y');
    };

    const handleAddCitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);
        if (!newCityName.trim()) {
            setAddError('City name is required.');
            setAddLoading(false);
            return;
        }
        try {
            const { error } = await supabase
                .from('cities')
                .insert([{ name: newCityName.trim(), is_active: newCityStatus }]);
            if (error) throw error;
            setShowAddForm(false);
            setNewCityName('');
            setNewCityStatus('Y');
            fetchCities();
        } catch {
            setAddError('Failed to add city. Please try again.');
        } finally {
            setAddLoading(false);
        }
    };

    const handleStatusToggle = async (cityId: number, currentStatus: 'Y' | 'N') => {
        try {
            const newStatus = currentStatus === 'Y' ? 'N' : 'Y';
            const { error } = await supabase
                .from('cities')
                .update({ is_active: newStatus })
                .eq('id', cityId);

            if (error) throw error;

            // Refresh the cities list
            fetchCities();
        } catch (err) {
            console.error('Error updating city status:', err);
            setError('Failed to update city status. Please try again.');
        }
    };

    return (
        <DashboardLayout
            title="Cities Management"
            actionButton={{
                label: "Add New City",
                onClick: handleAddCity
            }}
        >
            <div className={styles.content}>
                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}

                {showAddForm && (
                    <form className={styles.addForm} onSubmit={handleAddCitySubmit}>
                        <input
                            type="text"
                            placeholder="City name"
                            value={newCityName}
                            onChange={e => setNewCityName(e.target.value)}
                            className={styles.searchInput}
                            disabled={addLoading}
                        />
                        <select
                            value={newCityStatus}
                            onChange={e => setNewCityStatus(e.target.value as 'Y' | 'N')}
                            className={styles.filterSelect}
                            disabled={addLoading}
                        >
                            <option value="Y">Active</option>
                            <option value="N">Inactive</option>
                        </select>
                        <button type="submit" className={styles.statusButton} disabled={addLoading}>
                            {addLoading ? 'Adding...' : 'Add City'}
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
                        placeholder="Search cities..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Cities</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Cities</h3>
                        <p>{stats.total}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Active Cities</h3>
                        <p>{stats.active}</p>
                    </div>
                </div>

                <div className={styles.citiesList}>
                    {isLoading ? (
                        <div className={styles.loading}>Loading cities...</div>
                    ) : cities.length > 0 ? (
                        <table className={styles.citiesTable}>
                            <thead>
                                <tr>
                                    <th>City Name</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cities.map((city) => (
                                    <tr key={city.id}>
                                        <td>{city.name}</td>
                                        <td>
                                            <span className={`${styles.status} ${city.is_active === 'Y' ? styles.active : styles.inactive}`}>
                                                {city.is_active === 'Y' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleStatusToggle(city.id, city.is_active)}
                                                className={`${styles.statusButton} ${city.is_active === 'Y' ? styles.deactivate : styles.activate}`}
                                            >
                                                {city.is_active === 'Y' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyState}>No cities found</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 