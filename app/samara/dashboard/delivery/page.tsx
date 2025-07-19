'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import DashboardLayout from '../components/DashboardLayout';
import styles from './delivery.module.css';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface DeliverySettings {
    id: number;
    price: number;
    updated_at: string;
}

export default function DeliveryPage() {
    const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedPrice, setEditedPrice] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDeliverySettings();
    }, []);

    const fetchDeliverySettings = async () => {
        try {
            const { data, error } = await supabase
                .from('delivery')
                .select('*')
                .single();

            if (error) throw error;

            if (data) {
                setDeliverySettings(data);
                setEditedPrice(data.price);
            } else {
                // If no settings exist, create default settings
                const { data: newSettings, error: createError } = await supabase
                    .from('delivery')
                    .insert([{ price: 200 }])
                    .select()
                    .single();

                if (createError) throw createError;
                setDeliverySettings(newSettings);
                setEditedPrice(newSettings.price);
            }
        } catch (error) {
            console.error('Error fetching delivery settings:', error);
            setError('Failed to load delivery settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deliverySettings) return;

        try {
            const { error } = await supabase
                .from('delivery')
                .update({
                    price: editedPrice,
                    updated_at: new Date().toISOString()
                })
                .eq('id', deliverySettings.id);

            if (error) throw error;

            setDeliverySettings(prev => prev ? {
                ...prev,
                price: editedPrice,
                updated_at: new Date().toISOString()
            } : null);
            setIsEditing(false);
            setError(null);
        } catch (error) {
            console.error('Error updating delivery price:', error);
            setError('Failed to update delivery price');
        }
    };

    const handleCancel = () => {
        if (deliverySettings) {
            setEditedPrice(deliverySettings.price);
        }
        setIsEditing(false);
        setError(null);
    };

    return (
        <DashboardLayout
            title="Delivery Price Settings"
        >
            <div className={styles.content}>
                <div className={styles.settingsCard}>
                    <h2>Global Delivery Price</h2>
                    {isLoading ? (
                        <p>Loading delivery settings...</p>
                    ) : error ? (
                        <p className={styles.error}>{error}</p>
                    ) : deliverySettings ? (
                        <div className={styles.priceSettings}>
                            {isEditing ? (
                                <form onSubmit={handleSave} className={styles.editForm}>
                                    <div className={styles.priceInput}>
                                        <input
                                            type="number"
                                            value={editedPrice}
                                            onChange={(e) => setEditedPrice(Number(e.target.value))}
                                            min="0"
                                            step="1"
                                            required
                                        />
                                        <span className={styles.currency}>€</span>
                                    </div>
                                    <div className={styles.editActions}>
                                        <button type="submit" className={styles.saveButton}>
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className={styles.cancelButton}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className={styles.priceInfo}>
                                        <div className={styles.price}>
                                            {deliverySettings.price} €
                                        </div>
                                        <div className={styles.lastUpdated}>
                                            Last updated: {new Date(deliverySettings.updated_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className={styles.actions}>
                                        <button
                                            onClick={handleEdit}
                                            className={styles.editButton}
                                        >
                                            Edit Price
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <p>No delivery settings found</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
} 