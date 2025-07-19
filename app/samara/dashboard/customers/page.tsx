'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from './customers.module.css';
import { supabase } from '@/lib/supabase';

interface AppUser {
    id: string;
    created_at: string;
    full_name: string;
    email: string;
    image: string;
    DOB: string;
    phone: string;
    bonus: number;
    charity: string;
}

interface UserAddress {
    id: number;
    user: string;
    country: string;
    city: string;
    street: string;
    floor: string;
    landmark: string;
}

interface City {
    id: number;
    name: string;
    is_active?: 'Y' | 'N';
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<AppUser[]>([]);
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            let userQuery = supabase.from('app_users').select('*');
            if (search) {
                userQuery = userQuery.ilike('full_name', `%${search}%`);
            }
            const { data: users, error: userError } = await userQuery;
            const { data: addresses, error: addressError } = await supabase.from('user_address').select('*');
            const { data: cities, error: citiesError } = await supabase.from('cities').select('id, name');
            if (!userError && users) {
                setCustomers(users);
            } else {
                setCustomers([]);
            }
            if (!addressError && addresses) {
                setAddresses(addresses);
            } else {
                setAddresses([]);
            }
            if (!citiesError && cities) {
                setCities(cities);
            } else {
                setCities([]);
            }
            setLoading(false);
        };
        fetchData();
    }, [search]);

    const handleToggleCharity = async (customer: AppUser) => {
        const newValue = customer.charity === 'Y' ? 'N' : 'Y';
        const { error } = await supabase
            .from('app_users')
            .update({ charity: newValue })
            .eq('id', customer.id);
        if (!error) {
            setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, charity: newValue } : c));
        } else {
            alert('Failed to update charity status');
        }
    };

    return (
        <DashboardLayout
            title="Customers Management"
            actionButton={undefined}
        >
            <div className={styles.content}>
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className={styles.searchInput}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select className={styles.filterSelect}>
                        <option value="">All Customers</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="new">New</option>
                    </select>
                </div>

                <div className={styles.customersGrid}>
                    {loading ? (
                        <p className={styles.emptyState}>Loading customers...</p>
                    ) : customers.length === 0 ? (
                        <p className={styles.emptyState}>No customers found</p>
                    ) : (
                        <table className={styles.customersTable}>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Bonus</th>
                                    <th>Charity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => {
                                    const userAddresses = addresses.filter(a => a.user === customer.id);
                                    return (
                                        <React.Fragment key={customer.id}>
                                            <tr>
                                                <td>
                                                    <button
                                                        className={styles.expandBtn}
                                                        onClick={() => setExpanded(expanded === customer.id ? null : customer.id)}
                                                    >
                                                        {expanded === customer.id ? '-' : '+'}
                                                    </button>
                                                </td>
                                                <td>{customer.full_name}</td>
                                                <td>{customer.email}</td>
                                                <td>{customer.phone}</td>
                                                <td>{customer.bonus}</td>
                                                <td>
                                                    <span className={customer.charity === 'Y' ? styles.active : styles.inactive}>
                                                        {customer.charity === 'Y' ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                    <button
                                                        className={styles.charityToggleBtn}
                                                        onClick={() => handleToggleCharity(customer)}
                                                        style={{ marginLeft: 8 }}
                                                        aria-pressed={customer.charity === 'Y'}
                                                    >
                                                        {customer.charity === 'Y' ? 'Disable' : 'Enable'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expanded === customer.id && userAddresses.length > 0 && (
                                                <tr>
                                                    <td colSpan={7}>
                                                        <table className={styles.addressesTable}>
                                                            <thead>
                                                                <tr>
                                                                    <th>Country</th>
                                                                    <th>City</th>
                                                                    <th>Street</th>
                                                                    <th>Floor</th>
                                                                    <th>Landmark</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {userAddresses.map(address => {
                                                                    const cityName = cities.find(city => city.id === Number(address.city))?.name || address.city;
                                                                    return (
                                                                        <tr key={address.id}>
                                                                            <td>{address.country}</td>
                                                                            <td>{cityName}</td>
                                                                            <td>{address.street}</td>
                                                                            <td>{address.floor}</td>
                                                                            <td>{address.landmark}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 