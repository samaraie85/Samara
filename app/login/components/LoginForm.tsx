'use client';

import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import Navbar from '@/app/shared_components/Navbar';
import Link from 'next/link';
import logoImage from '../../assets/logo.png';
import brandImage from '../../assets/model-image.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

const LoginForm = () => {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset error state
        setError(null);

        // Basic validation
        if (!email || !password) {
            setError('Please enter both email and password');
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

            const { error: authError } = await signIn(email, password);

            if (authError) {
                setError('Invalid email or password');
                return;
            }

            // Successful login
            console.log('User logged in successfully');
            router.push('/'); // Redirect to home page or dashboard

        } catch {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.loginContainer}>
            <Navbar />
            <div className={styles.loginLeft}>
                <h1 className={styles.loginTitle}>Log in</h1>
                <div className={styles.loginCard}>
                    <h2 className={styles.loginTitle1}>Good to have you back!</h2>
                    <p className={styles.loginSubtitle}>Welcome Back</p>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <form className={styles.loginForm} onSubmit={handleLogin}>
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
                        <div className={`${styles.inputGroup} ${styles.inputGroup01}`}>
                            <span className={styles.inputIcon}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 13a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 12 13zm7-4h-1V7A6 6 0 0 0 6 7v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM8 7a4 4 0 0 1 8 0v2H8z" /></svg>
                            </span>
                            <input
                                type="password"
                                placeholder="Password"
                                className={styles.textInput}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        <Link href="/forgot-password" className={styles.forgotPassword}>Forgot Password</Link><br />

                        <button
                            type="submit"
                            className={styles.loginButton}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <div className={styles.signupText}>
                        <span className="text-gray-700">Don&apos;t have an account?</span>
                        <Link href="/signup" className={styles.signupLink}>Sign up</Link>
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

export default LoginForm; 