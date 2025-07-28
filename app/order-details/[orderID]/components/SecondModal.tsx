"use client";

import React, { useEffect, useState } from 'react';
import styles from './Modal.module.css';
import { useAuth } from '@/lib/authContext';
import confetti from 'canvas-confetti';

interface Props {
    onClose: () => void;
}

interface WalletData {
    balance: number;
    points: number;
}

const SecondModal: React.FC<Props> = ({ onClose }) => {

    const fireConfetti = () => {
        const end = Date.now() + 3 * 1000; // 3 seconds
        const colors = ["#CDA00D", "#ffffff", "#CDA00D", "#ffffff"];

        const frame = () => {
            if (Date.now() > end) return;

            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                startVelocity: 60,
                origin: { x: 0, y: 0.5 },
                colors: colors,
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                startVelocity: 60,
                origin: { x: 1, y: 0.5 },
                colors: colors,
            });

            requestAnimationFrame(frame);
        };

        frame();
    };


    const { user } = useAuth();
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [animatedPoints, setAnimatedPoints] = useState(0);
    const [boxOpen, setBoxOpen] = useState(false);
    const [showPoints, setShowPoints] = useState(false);

    useEffect(() => {
        const fetchWalletData = async () => {
            if (!user?.id) return;
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/users/wallet?userId=${user.id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch wallet data`);
                }
                const data = await response.json();
                setWalletData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load wallet data');
            } finally {
                setLoading(false);
            }
        };
        fetchWalletData();
    }, [user?.id]);

    // When box is opened, show points after animation
    useEffect(() => {
        if (boxOpen && walletData?.points !== undefined) {
            const timeout = setTimeout(() => {
                setShowPoints(true);
                // Animate points count up
                let current = 0;
                const target = walletData.points;
                const duration = 1200;
                const steps = 60;
                const increment = target / steps;
                const stepDuration = duration / steps;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        setAnimatedPoints(target);
                        clearInterval(timer);
                    } else {
                        setAnimatedPoints(Math.floor(current));
                    }
                }, stepDuration);
                return () => clearInterval(timer);
            }, 800); // Wait for box open animation
            return () => clearTimeout(timeout);
        }
    }, [boxOpen, walletData?.points]);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.closeButton}>×</button>
                <div className={styles.flexRowBoxLayout}>
                    <div className={styles.leftTextCol}>
                        <div className={styles.celebrationText}>
                            <p>🎉 <b>You’ve Earned Points!</b><br />Your purchase just got more rewarding.</p>
                            <p>✨ <b>Here’s what you unlocked:</b></p>
                            <ul style={{ margin: 0, paddingLeft: '1.2em' }}>
                                <li>🎁 A special gift just for you</li>
                                <li>🛒 Earned by shopping with Samara</li>
                                <li>⏳ Don’t wait! Redeem it before it’s gone</li>
                            </ul>
                            <p style={{ marginTop: '1em' }}>👉 <b>Check your rewards now and claim your gift!</b></p>
                        </div>

                    </div>
                    <div className={styles.rightBoxCol}>
                        <div
                            className={`${styles.board} ${styles.boxWrapper}`}
                            onClick={() => {
                                if (!boxOpen) {
                                    setBoxOpen(true);
                                    fireConfetti();
                                }
                            }}
                            style={{ cursor: boxOpen ? 'default' : 'pointer' }}
                        >
                            <div className={`${styles.box} ${boxOpen ? styles.open : ''}`}>
                                <div className={styles.lid}><span className={styles.ribbon}></span>&nbsp;</div>
                                <div className={styles.body}>&nbsp;</div>
                                <div className={styles.contents}>
                                    {showPoints ? (
                                        <>
                                            <span className={styles.bonusText}>{animatedPoints}</span>
                                            <span className={styles.bonusLabel}>Points</span>
                                        </>
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </div>
                            {showPoints && (
                                <>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {loading && <div className={styles.walletInfo}></div>}
                {error && <div className={styles.walletInfo}><p>Error loading wallet: {error}</p></div>}
            </div>
        </div>
    );
};

export default SecondModal; 