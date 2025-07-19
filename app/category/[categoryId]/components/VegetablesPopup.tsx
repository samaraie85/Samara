"use client";

import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faLeaf, faEnvelope, faHandshake } from '@fortawesome/free-solid-svg-icons';
import styles from './VegetablesPopup.module.css';

interface VegetablesPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onNewsletterSignup: () => void;
}

const VegetablesPopup: React.FC<VegetablesPopupProps> = ({ isOpen, onClose, onNewsletterSignup }) => {
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

    const handleNewsletterSignup = () => {
        // Close this popup and trigger newsletter signup
        onClose();
        onNewsletterSignup();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleBackdropClick}>
            <div className={styles.dialog}>
                <button className={styles.closeButton} onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <div className={styles.iconContainer}>
                            <FontAwesomeIcon icon={faLeaf} className={styles.icon} />
                        </div>
                        <h2 className={styles.title}>
                            Hey there, veggie lover! 🥦🍓
                        </h2>
                    </div>

                    <div className={styles.message}>
                        <p className={styles.mainText}>
                            Some of our farm-fresh fruits and veggies are only available by pre-order — that&apos;s how we keep things super fresh and seasonal! 🌱
                        </p>

                        <p className={styles.secondaryText}>
                            These goodies come and go quickly, so make sure to order in advance to reserve your share of the freshest picks.
                        </p>

                        <div className={styles.newsletterSection}>
                            <div className={styles.newsletterHeader}>
                                <FontAwesomeIcon icon={faEnvelope} className={styles.newsletterIcon} />
                                <h3 className={styles.newsletterTitle}>Want to stay in the loop?</h3>
                            </div>
                            <p className={styles.newsletterText}>
                                Join our newsletter and be the first to know when your favorite produce is back in stock, plus get early access to new arrivals, special deals, and more!
                            </p>
                        </div>

                        <div className={styles.callToAction}>
                            <FontAwesomeIcon icon={faHandshake} className={styles.ctaIcon} />
                            <span className={styles.ctaText}>Pre-order now and sign up to never miss a harvest!</span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.newsletterButton}
                            onClick={handleNewsletterSignup}
                        >
                            <FontAwesomeIcon icon={faEnvelope} />
                            Join Newsletter
                        </button>
                        <button
                            className={styles.closeButtonSecondary}
                            onClick={onClose}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VegetablesPopup; 