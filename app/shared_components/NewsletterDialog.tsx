"use client"

import React, { useState, useEffect } from 'react';
import styles from './NewsletterDialog.module.css';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEnvelope, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { useAuth } from '@/lib/authContext';
import logo from '../assets/logo.png';

interface NewsletterDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewsletterDialog: React.FC<NewsletterDialogProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Close dialog when Escape key is pressed
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Close dialog when clicking outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset states
        setError(null);
        setSuccess(false);

        // Basic validation
        if (!email) {
            setError('Please enter your email address');
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

            const requestData = {
                email,
                audienceId: user?.id || null,
                firstName: user?.user_metadata?.full_name || null,
            };

            console.log('Sending newsletter subscription request:', requestData);

            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json();
            console.log('Newsletter API response:', { status: response.status, result });

            if (!response.ok) {
                console.error('Newsletter subscription failed:', result);
                setError(result.error || result.details || 'Failed to subscribe to newsletter');
                return;
            }

            // Success
            console.log('Newsletter subscription successful:', result);
            setSuccess(true);
            setEmail('');

            // Auto close after 3 seconds
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Newsletter subscription error:', error);
            setError('Failed to subscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.dialog}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className={styles.content}>
                    <div className={styles.leftSection}>
                        <div className={styles.logoSection}>
                            <Image
                                src={logo}
                                alt="Samara Logo"
                                width={80}
                                height={40}
                                className={styles.logo}
                            />
                        </div>

                        <h2 className={styles.title}>
                            Stay Updated with <span className={styles.highlight}>Samara</span>
                        </h2>

                        <p className={styles.description}>
                            Subscribe to our newsletter and be the first to know about:
                        </p>

                        <ul className={styles.benefits}>
                            <li>✨ Exclusive deals and discounts</li>
                            <li>🆕 New product launches</li>
                            <li>🎁 Special offers and promotions</li>
                            <li>📰 Health and wellness tips</li>
                            <li>🌙 Authentic Arabic products</li>
                        </ul>

                        <div className={styles.socialSection}>
                            <p className={styles.socialTitle}>Follow us on social media:</p>
                            <div className={styles.socialIcons}>
                                <a href="https://www.facebook.com/IrSamaraHub" target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faFacebookF} />
                                </a>
                                <a href="https://www.instagram.com/irsamarahub" target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faInstagram} />
                                </a>
                                <a href="https://www.tiktok.com/@irsamarahub" target="_blank" rel="noopener noreferrer">
                                    <FontAwesomeIcon icon={faTiktok} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className={styles.rightSection}>
                        <div className={styles.formContainer}>
                            {success ? (
                                <div className={styles.successMessage}>
                                    <FontAwesomeIcon icon={faCheck} className={styles.successIcon} />
                                    <h3>Thank you for subscribing!</h3>
                                    <p>You&apos;ll receive our latest updates and exclusive offers.</p>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.formHeader}>
                                        <FontAwesomeIcon icon={faEnvelope} className={styles.emailIcon} />
                                        <h3>Subscribe to Newsletter</h3>
                                        <p>Get exclusive offers and updates delivered to your inbox</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className={styles.form}>
                                        {error && (
                                            <div className={styles.errorMessage}>
                                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        <div className={styles.inputGroup}>
                                            <input
                                                type="email"
                                                placeholder="Enter your email address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={styles.emailInput}
                                                disabled={loading}
                                                required
                                            />
                                            <button
                                                type="submit"
                                                className={styles.subscribeButton}
                                                disabled={loading}
                                            >
                                                {loading ? 'Subscribing...' : 'Subscribe'}
                                            </button>
                                        </div>

                                        <p className={styles.privacyNote}>
                                            By subscribing, you agree to receive marketing emails from Samara.
                                            You can unsubscribe at any time.
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsletterDialog; 