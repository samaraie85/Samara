'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabase';
import styles from './LoginForm.module.css';

export default function LoginForm() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (error) throw error;

            if (data) {
                 // Create session data
                const sessionData = {
                    id: data.id,
                    username: data.username,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
                };

                // Store session in cookie
                Cookies.set('adminSession', JSON.stringify(sessionData), {
                    expires: 1, // 1 day
                    path: '/',
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });

                // Redirect to dashboard
                router.push('/samara/dashboard');
                router.refresh();
            } else {
                setError('Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleAdminLogin} className={styles.loginForm} noValidate>
                <h1>Admin Dashboard</h1>
                    {error && (
                    <div className={styles.error} role="alert">
                            {error}
                        </div>
                    )}
                <div className={styles.formGroup}>
                    <label htmlFor="username">Username</label>
                            <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                                required
                        autoComplete="username"
                        disabled={isLoading}
                        aria-label="Username"
                            />
                        </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                            <input
                                type="password"
                        id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                                required
                        autoComplete="current-password"
                        disabled={isLoading}
                        aria-label="Password"
                            />
                        </div>
                        <button
                            type="submit"
                            className={styles.loginButton}
                    disabled={isLoading}
                    aria-label={isLoading ? "Logging in..." : "Login"}
                        >
                    {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
            </div>
    );
} 