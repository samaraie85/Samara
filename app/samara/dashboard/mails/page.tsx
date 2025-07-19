'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import styles from './mails.module.css';

interface EmailCampaign {
    id: number;
    subject: string;
    content: string;
    status: 'sent' | 'failed';
    sent_count: number;
    sent_at?: string;
    created_at: string;
}

export default function MailsPage() {
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        sent: 0,
        failed: 0
    });

    const [composeForm, setComposeForm] = useState({
        subject: '',
        content: ''
    });

    const fetchCampaigns = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            let query = supabase
                .from('email_campaigns')
                .select('*', { count: 'exact' });

            if (searchQuery) {
                query = query.ilike('subject', `%${searchQuery}%`);
            }
            if (statusFilter) {
                query = query.eq('status', statusFilter);
            }

            const { data, error, count } = await query;
            if (error) throw error;

            const sent = data?.filter((campaign) => campaign.status === 'sent').length || 0;
            const failed = data?.filter((campaign) => campaign.status === 'failed').length || 0;

            setCampaigns(data || []);
            setStats({
                total: count || 0,
                sent,
                failed
            });
        } catch {
            setError('Failed to load campaigns. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, statusFilter]);

    const handleSendCampaign = async () => {
        try {
            // Get all users from the database
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('email');

            if (usersError) throw usersError;

            const userEmails = users?.map(user => user.email).filter(Boolean) || [];

            // Create campaign record
            const { error: campaignError } = await supabase
                .from('email_campaigns')
                .insert([{
                    ...composeForm,
                    status: 'sent',
                    sent_count: userEmails.length,
                    sent_at: new Date().toISOString()
                }]);

            if (campaignError) throw campaignError;

            setShowComposeModal(false);
            setComposeForm({
                subject: '',
                content: ''
            });
            fetchCampaigns();
        } catch {
            setError('Failed to send campaign. Please try again.');
        }
    };

    const handleDeleteCampaign = async (id: number) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return;

        try {
            const { error } = await supabase
                .from('email_campaigns')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchCampaigns();
        } catch {
            setError('Failed to delete campaign. Please try again.');
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    return (
        <DashboardLayout title="Email Campaigns">
            <div className={styles.content}>
                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        onClick={() => setShowComposeModal(true)}
                        className={styles.composeButton}
                    >
                        ✉️ Send Email to All Users
                    </button>
                </div>

                <div className={styles.filters}>
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <select
                        className={styles.filterSelect}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Campaigns</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <h3>Total Campaigns</h3>
                        <p>{stats.total}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Sent</h3>
                        <p>{stats.sent}</p>
                    </div>
                    <div className={styles.statCard}>
                        <h3>Failed</h3>
                        <p>{stats.failed}</p>
                    </div>
                </div>

                <div className={styles.campaignsList}>
                    {isLoading ? (
                        <div className={styles.loading}>Loading campaigns...</div>
                    ) : campaigns.length > 0 ? (
                        <table className={styles.campaignsTable}>
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Sent Count</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id}>
                                        <td>{campaign.subject}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[campaign.status]}`}>
                                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>{campaign.sent_count}</td>
                                        <td>
                                            {campaign.sent_at
                                                ? new Date(campaign.sent_at).toLocaleDateString()
                                                : new Date(campaign.created_at).toLocaleDateString()
                                            }
                                        </td>
                                        <td>
                                            <button
                                                className={`${styles.actionButton} ${styles.view}`}
                                                onClick={() => {/* View campaign details */ }}
                                            >
                                                View
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.delete}`}
                                                onClick={() => handleDeleteCampaign(campaign.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.emptyState}>No campaigns found</p>
                    )}
                </div>

                {/* Compose Modal */}
                {showComposeModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <h2>Send Email to All Users</h2>
                            <div className={styles.modalContent}>
                                <input
                                    type="text"
                                    placeholder="Email Subject"
                                    value={composeForm.subject}
                                    onChange={e => setComposeForm({ ...composeForm, subject: e.target.value })}
                                    className={styles.modalInput}
                                />
                                <textarea
                                    placeholder="Email content (HTML supported)"
                                    value={composeForm.content}
                                    onChange={e => setComposeForm({ ...composeForm, content: e.target.value })}
                                    className={styles.modalTextarea}
                                    rows={10}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => setShowComposeModal(false)}
                                    className={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendCampaign}
                                    className={styles.sendButton}
                                    disabled={!composeForm.subject || !composeForm.content}
                                >
                                    Send to All Users
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
} 