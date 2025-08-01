'use client'
import React, { useState, useEffect } from 'react';
import styles from './BonusWallet.module.css';
import { User } from '@supabase/supabase-js';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface BonusWalletProps {
    user: User;
}

const BonusWallet: React.FC<BonusWalletProps> = ({ user }) => {
    const [points, setPoints] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });
    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/users/wallet?userId=${user.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch wallet data');
                }

                setPoints(data.points);
            } catch (error) {
                console.error('Error fetching wallet data:', error);
                setError(error instanceof Error ? error.message : 'Failed to load wallet data');
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, [user.id]);

    return (
        <div data-aos="fade-up" className={styles.profileInfo}>
            <div data-aos="fade-up" className={styles.bonusWalletContainer}>
                <div data-aos="fade-up" className={styles.bonusWalletContent}>
                    {loading ? (
                        <div className={styles.loadingPoints}></div>
                    ) : error ? (
                        <div className={styles.errorPoints}>Error loading points</div>
                    ) : (
                        <h1 className={styles.bonusWalletAmount}>{points}</h1>
                    )}
                    <svg width="52" height="53" viewBox="0 0 82 83" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M36.209 28.4123L31.7421 37.346C31.133 38.5643 29.5087 39.7825 28.1551 39.9856L20.0673 41.3391C14.8897 42.219 13.6716 45.9414 17.394 49.6638L23.6882 55.958C24.7372 57.0071 25.3464 59.0713 25.008 60.5603L23.2144 68.3773C21.7931 74.5362 25.0756 76.9388 30.5238 73.724L38.104 69.2233C39.4915 68.4112 41.7249 68.4112 43.1123 69.2233L50.6925 73.724C56.1408 76.9388 59.4233 74.5362 58.002 68.3773L56.2084 60.5603C55.87 59.1052 56.4791 57.0409 57.5282 55.958L63.8224 49.6638C67.5448 45.9414 66.3266 42.1851 61.1491 41.3391L53.0613 39.9856C51.7077 39.7487 50.0834 38.5643 49.4742 37.346L45.0073 28.4123C42.6047 23.5732 38.6116 23.5732 36.209 28.4123Z" fill="white" />
                        <path opacity="0.4" d="M60.9122 33.962C62.2996 33.962 63.4502 32.8115 63.4502 31.424V7.73601C63.4502 6.34857 62.2996 5.19801 60.9122 5.19801C59.5248 5.19801 58.3742 6.34857 58.3742 7.73601V31.424C58.3742 32.8115 59.5248 33.962 60.9122 33.962Z" fill="white" />
                        <path opacity="0.4" d="M20.3038 33.962C21.6912 33.962 22.8418 32.8115 22.8418 31.424V7.73601C22.8418 6.34857 21.6912 5.19801 20.3038 5.19801C18.9164 5.19801 17.7658 6.34857 17.7658 7.73601V31.424C17.7658 32.8115 18.9164 33.962 20.3038 33.962Z" fill="white" />
                        <path d="M40.6075 17.042C41.9949 17.042 43.1455 15.8915 43.1455 14.504V7.73601C43.1455 6.34857 41.9949 5.19801 40.6075 5.19801C39.2201 5.19801 38.0695 6.34857 38.0695 7.73601V14.504C38.0695 15.8915 39.2201 17.042 40.6075 17.042Z" fill="white" />
                    </svg>

                </div>
                <h1 className={styles.bonusWalletTitle}>&nbsp;&nbsp;{points === 1 ? 'Point' : 'Points'}</h1>
            </div>
            <svg width="128" height="151" viewBox="0 0 158 181" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M94.9747 81.6633C94.4049 79.1624 95.4409 75.5896 97.254 73.8032L109.842 61.4006C113.779 57.5216 115.333 53.3874 114.193 49.8146C113.002 46.2418 109.324 43.7919 103.833 42.8732L87.6707 40.2192C85.3397 39.8109 82.4906 37.7693 81.4028 35.6766L72.4929 18.068C69.9029 13.0151 66.3804 10.2079 62.5471 10.2079C58.7138 10.2079 55.1913 13.0151 52.6012 18.068L43.6914 35.6766C43.018 37.0037 41.6193 38.2797 40.1171 39.1473L95.9071 94.117C96.6323 94.8315 97.8756 94.168 97.6684 93.1472L94.9747 81.6633Z" fill="white" />
                <path d="M27.84 73.8032C29.7048 75.6406 30.7409 79.1623 30.1192 81.6633L26.545 97.0262C25.0427 103.406 25.9751 108.204 29.1868 110.501C30.4819 111.419 32.0359 111.879 33.8489 111.879C36.4908 111.879 39.5989 110.909 43.0178 108.918L58.1956 100.038C60.5784 98.6595 64.5153 98.6595 66.8982 100.038L82.076 108.918C87.826 112.236 92.7471 112.797 95.907 110.501C97.0984 109.633 97.979 108.459 98.5488 106.928L35.5584 44.8638C33.1755 42.5159 29.8084 41.4441 26.545 42.0055L21.313 42.8732C15.8221 43.7919 12.1442 46.2418 10.9528 49.8146C9.81312 53.3874 11.3672 57.5216 15.3041 61.4006L27.84 73.8032Z" fill="white" />
                <path d="M141.876 159.67C141.574 158.364 142.123 156.497 143.082 155.564L149.746 149.085C151.831 147.059 152.653 144.899 152.05 143.033C151.419 141.166 149.472 139.887 146.565 139.407L138.009 138.02C136.775 137.807 135.267 136.74 134.691 135.647L129.974 126.449C128.602 123.809 126.738 122.343 124.708 122.343C122.679 122.343 120.814 123.809 119.443 126.449L114.726 135.647C114.369 136.34 113.629 137.007 112.833 137.46L142.369 166.176C142.753 166.549 143.411 166.202 143.302 165.669L141.876 159.67Z" fill="white" />
                <path d="M106.333 155.564C107.32 156.524 107.868 158.364 107.539 159.67L105.647 167.695C104.852 171.028 105.345 173.535 107.046 174.734C107.731 175.214 108.554 175.454 109.514 175.454C110.912 175.454 112.558 174.948 114.368 173.908L122.403 169.269C123.665 168.549 125.749 168.549 127.01 169.269L135.046 173.908C138.09 175.641 140.695 175.934 142.368 174.734C142.999 174.281 143.465 173.668 143.767 172.868L110.419 140.446C109.157 139.22 107.375 138.66 105.647 138.953L102.877 139.407C99.9701 139.886 98.023 141.166 97.3922 143.033C96.7889 144.899 97.6116 147.059 99.6958 149.085L106.333 155.564Z" fill="white" />
            </svg>

        </div>
    );
};

export default BonusWallet; 