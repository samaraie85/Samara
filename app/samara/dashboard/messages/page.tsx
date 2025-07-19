'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import styles from './messages.module.css';

interface Message {
    id: number;
    fullname: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'archived';
    created_at: string;
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        archived: 0
    });

    const fetchMessages = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            let query = supabase
                .from('messages')
                .select('*', { count: 'exact' });

            if (searchQuery) {
                query = query.ilike('subject', `%${searchQuery}%`);
            }
            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            const { data, error, count } = await query;
            if (error) throw error;

            const unread = data?.filter((msg) => msg.status === 'unread').length || 0;
            const archived = data?.filter((msg) => msg.status === 'archived').length || 0;

            setMessages(data || []);
            setStats({
                total: count || 0,
                unread,
                archived
            });
        } catch {
            setError('Failed to load messages. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, statusFilter]);

    const handleChangeStatus = async (id: number, status: 'read' | 'archived') => {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
            fetchMessages();
        } catch {
            setError('Failed to update message status. Please try again.');
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    return (
        <DashboardLayout
            title="Messages Management"
        >
            <div className={styles.content}>
                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}
                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search messages..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Messages</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Messages</h3>
                        <p>{stats.total}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Unread Messages</h3>
                        <p>{stats.unread}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Archived Messages</h3>
                        <p>{stats.archived}</p>
                    </div>
                </div>

                <div className={styles.messagesList}>
                    {isLoading ? (
                        <div className={styles.loading}>Loading messages...</div>
                    ) : messages.length > 0 ? (
                        <table className={styles.messagesTable}>
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Subject</th>
                                    <th>Message</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((msg) => (
                                    <tr key={msg.id}>
                                        <td>{msg.fullname}</td>
                                        <td>{msg.phone}</td>
                                        <td>{msg.email}</td>
                                        <td>{msg.subject}</td>
                                        <td>{msg.message}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[msg.status]}`}>{msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}</span>
                                        </td>
                                        <td>{new Date(msg.created_at).toLocaleString()}</td>
                                        <td>
                                            {msg.status !== 'read' && (
                                                <button
                                                    className={`${styles.statusButton} ${styles.markRead}`}
                                                    onClick={() => handleChangeStatus(msg.id, 'read')}
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                            {msg.status !== 'archived' && (
                                                <button
                                                    className={`${styles.statusButton} ${styles.archive}`}
                                                    onClick={() => handleChangeStatus(msg.id, 'archived')}
                                                >
                                                    Archive
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyState}>No messages found</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 