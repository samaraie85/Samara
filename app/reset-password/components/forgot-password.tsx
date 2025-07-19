'use client';

import React, { useState, useEffect } from 'react';
import styles from './forgot-password.module.css';
import Navbar from '@/app/shared_components/Navbar';
import logoImage from '../../assets/logo.png';
import brandImage from '../../assets/model-image.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ResetPassword = () => {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset states
        setError(null);
        setSuccessMessage(null);

        // Validation
        if (!password || !confirmPassword) {
            setError('Please enter both password fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            setLoading(true);

            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                setError(updateError.message);
                return;
            }

            // Password updated successfully
            setSuccessMessage('Your password has been updated successfully');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
            console.error('Password update error:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check if the user is authenticated with a recovery token
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error || !data.session) {
                // No valid session, redirect to forgot password
                setError('Invalid or expired password reset link. Please try again.');
                // Optional: Redirect after a timeout
                setTimeout(() => {
                    router.push('/forgot-password');
                }, 3000);
            }
        };

        checkSession();
    }, [router]);

    return (
        <section className={styles.loginContainer}>
            <Navbar />
            <div className={styles.loginLeft}>
                <h1 className={styles.loginTitle}>Create new password</h1>
                <div className={styles.loginCard}>
                    <h2 className={styles.loginTitle1}>Create new password</h2>
                    <p className={styles.loginSubtitle}>Please enter your new password</p>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className={styles.successMessage}>
                            {successMessage}
                        </div>
                    )}

                    <form className={styles.loginForm} onSubmit={handleUpdatePassword}>
                        <div className={`${styles.inputGroup} ${styles.inputGroup01}`}>
                            <span className={styles.inputIcon}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 13a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 12 13zm7-4h-1V7A6 6 0 0 0 6 7v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM8 7a4 4 0 0 1 8 0v2H8z" /></svg>
                            </span>
                            <input
                                type="password"
                                placeholder="New Password"
                                className={styles.textInput}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className={`${styles.inputGroup} ${styles.inputGroup01}`}>
                            <span className={styles.inputIcon}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 13a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 12 13zm7-4h-1V7A6 6 0 0 0 6 7v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM8 7a4 4 0 0 1 8 0v2H8z" /></svg>
                            </span>
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                className={styles.textInput}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.loginButton}
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
            <div className={styles.loginRight}>

                <Image src={logoImage} alt="Logo" width={300}
                    className={styles.bgLogo} priority />

                <div className={styles.logoContainer}>
                    <Image src={logoImage} alt="Logo" width={100}
                        className={styles.brandLogo} priority />

                    <h2 className={styles.brandText}>Brand Speaks Arabic</h2>


                </div>
                <div className={styles.brandContainer}>
                    <div className={styles.imageContainer}>
                        <Image src={brandImage} alt="Arabic Woman" width={350}
                            className={styles.brandImage} priority />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ResetPassword; 