'use client';

import React, { useState } from 'react';
import styles from './Signup.module.css';
import Navbar from '@/app/shared_components/Navbar';
import Link from 'next/link';
import logoImage from '../../assets/logo.png';
import brandImage from '../../assets/model-image.png';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

const SignupForm = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset message and error states
        setError(null);
        setMessage(null);

        // Basic validation
        if (!fullName || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        // Name validation
        if (fullName.trim().length < 3) {
            setError('Full name must be at least 3 characters');
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Password validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);

            // Sign up with Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (signUpError) {
                throw signUpError;
            }

            // Check if email is already registered
            if (authData?.user?.identities?.length === 0) {
                setMessage('This email is already registered. Please login or use a different email address.');
                return;
            }

            if (authData?.user) {
                // Get the user ID from the authentication response
                const userId = authData.user.id;

                try {
                    // Call our API endpoint instead of direct database insertion
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId,
                            fullName,
                            email,
                        }),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        console.error('API error response:', result);
                        setError(result.error || 'Failed to create user profile');
                        setErrorDetails(result.details || result.hint || 'Unknown error occurred');
                        return;
                    }

                    // Success! Show success message
                    setMessage('Account created successfully! Please check your email to verify your account.');

                } catch (apiError) {
                    console.error('API call error:', apiError);
                    setError('Failed to create user profile');
                    setErrorDetails(apiError instanceof Error ? apiError.message : 'Unknown API error');
                }
            }

        } catch (error) {
            console.error('Signup error:', error);
            setError('Failed to create account');
            setErrorDetails(error instanceof Error ? error.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <section className={styles.loginContainer}>
            <Navbar />
            <div className={styles.loginLeft}>
                <h1 className={styles.loginTitle}>Sign up</h1>
                <div className={styles.loginCard}>
                    <h2 className={styles.loginTitle1}>Create your account</h2>
                    <p className={styles.loginSubtitle}>Join Samara</p>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                            {errorDetails && (
                                <div className={styles.errorDetails}>
                                    <details>
                                        <summary>Error Details</summary>
                                        <pre>{errorDetails}</pre>
                                    </details>
                                </div>
                            )}
                        </div>
                    )}

                    {message && (
                        <div className={styles.successMessage}>
                            {message}
                        </div>
                    )}

                    <form className={styles.loginForm} onSubmit={handleSignup}>
                        <div className={styles.inputGroup}>
                            <span className={styles.inputIcon}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Full Name"
                                className={styles.textInput}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
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
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className={styles.textInput}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                className={styles.eyeIcon}
                                onClick={togglePasswordVisibility}
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className={styles.loginButton}
                            disabled={loading}
                        >
                            {loading ? 'Signing up...' : 'Sign up'}
                        </button>
                    </form>

                    <div className={styles.signupText}>
                        <span className="text-gray-700">Already have an account?</span>
                        <Link href="/login" className={styles.signupLink}>Log in</Link>
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

export default SignupForm; 