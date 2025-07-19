'use client';

import React, { useState } from 'react';
import styles from './forgot-password.module.css';
import Navbar from '@/app/shared_components/Navbar';
import Link from 'next/link';
import logoImage from '../../assets/logo.png';
import brandImage from '../../assets/model-image.png';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset states
        setError(null);
        setSuccessMessage(null);

        // Basic validation
        if (!email) {
            setError('Please enter your email');
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                setError(resetError.message);
                return;
            }

            // Password reset email sent successfully
            setSuccessMessage('Password reset instructions have been sent to your email');

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
            console.error('Password reset error:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.loginContainer}>
            <Navbar />
            <div className={styles.loginLeft}>
                <h1 className={styles.loginTitle}>Forgot Password</h1>
                <div className={styles.loginCard}>
                    <h2 className={styles.loginTitle1}>Forgot your password?</h2>
                    <p className={styles.loginSubtitle}>write your email to get it back</p>

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

                    <form className={styles.loginForm} onSubmit={handleResetPassword}>
                        <div className={styles.inputGroup}>
                            <span className={styles.inputIcon}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </span>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className={styles.textInput}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.loginButton}
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send mail'}
                        </button>
                    </form>
                    <div className={styles.signupText}>
                        <Link href="/login" className={styles.signupLink}>Go Back</Link>
                    </div>
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

export default ForgotPassword; 