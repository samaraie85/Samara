'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './profile.module.css';
import { supabase } from '@/lib/supabase';
import ProfileInfo from './components/ProfileInfo';
import MyAddress from './components/MyAddress';
import MyOrders from './components/MyOrders';
import BonusWallet from './components/BonusWallet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import ProfileSidebar from './components/ProfileSidebar';
import Navbar from '../shared_components/Navbar';
import { User } from '@supabase/supabase-js';
import MyWishlist from './components/MyWishlist';
import Image from 'next/image';
import loadinga from '../assets/loading_1.gif';

interface UserData {
    full_name: string;
    email: string;
    phone: string;
    birthdate: string;
    image?: string;
}

const ProfilePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [activeTab, setActiveTab] = useState('profile-info');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);

                // Get authenticated user from Supabase
                console.log("Checking client-side auth session...");
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("Client auth error:", sessionError);
                    router.push('/login');
                    return;
                }

                console.log("Client session result:", session ? "Session exists" : "No session");

                if (!session?.user) {
                    // Redirect if not authenticated
                    console.log("No user in session, redirecting to login");
                    router.push('/login');
                    return;
                }

                console.log("User authenticated on client side:", session.user.id);
                setUser(session.user as User); // Type assertion to fix type error

                // Use API route to get user profile data
                const response = await fetch(`/api/users/profile?userId=${session.user.id}`);
                const result = await response.json();

                if (!response.ok) {
                    if (response.status === 404) {
                        // User not found in app_users table, create new entry
                        console.log('User not found in app_users table, creating entry...');

                        const createResponse = await fetch('/api/users/profile', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                userId: session.user.id,
                                userData: {
                                    full_name: session.user.user_metadata?.full_name || '',
                                    email: session.user.email,
                                    phone: session.user.user_metadata?.phone || '',
                                    dob: session.user.user_metadata?.birthdate || '',
                                }
                            }),
                        });

                        if (!createResponse.ok) {
                            throw new Error(`Failed to create user profile: ${(await createResponse.json()).error}`);
                        }

                        const newUserData = await createResponse.json();
                        setUserData(newUserData.data);
                    } else {
                        throw new Error(result.error || 'Failed to fetch user data');
                    }
                } else {
                    setUserData(result.data);
                }

            } catch (error) {
                console.error('Error fetching user data:', error instanceof Error ? error.message : JSON.stringify(error));

                // Log more details for debugging
                if (error instanceof Error) {
                    console.error('Error details:', {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    });
                } else {
                    console.error('Unknown error type:', typeof error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    // Display appropriate component based on active tab
    const renderTabContent = () => {
        if (loading) return <div className={styles.loading}><Image src={loadinga} alt="loading" width={100} height={100} /></div>;

        switch (activeTab) {
            case 'profile-info':
                return <ProfileInfo user={user!} userData={userData as UserData} />;
            case 'my-address':
                return <MyAddress user={user!} />;
            case 'my-orders':
                return <MyOrders user={user!} />;
            case 'bonus-wallet':
                return <BonusWallet user={user!} />;
            case 'wishlist':
                return <MyWishlist user={user!} />;
            default:
                return <ProfileInfo user={user!} userData={userData || { full_name: '', email: '', phone: '', birthdate: '' }} />;
        }
    };

    return (
        <main className={styles.profilePage}>
            <Navbar />

            <div className={styles.profileHeader}>
                <h1>Profile</h1>
                <div className={styles.breadcrumbs}>
                    <Link href="/">
                        <span>Home</span>
                    </Link>
                    <FontAwesomeIcon icon={faAngleRight} />
                    <span className={styles.active}>Profile</span>
                </div>
            </div>


            <div className={styles.profileContainer0}>

                {/* Dynamic Title */}
                <h2 className={styles.contentTitle}>
                    {activeTab === 'profile-info' && 'Profile '}
                    {activeTab === 'my-address' && 'My '}
                    {activeTab === 'my-orders' && 'My '}
                    {activeTab === 'bonus-wallet' && 'Bonus '}
                    {activeTab === 'wishlist' && 'My '}

                    <span className={styles.contentSubTitle}>
                        {activeTab === 'profile-info' && 'Info'}
                        {activeTab === 'my-address' && 'Address'}
                        {activeTab === 'my-orders' && 'Orders'}
                        {activeTab === 'bonus-wallet' && 'Wallet'}
                        {activeTab === 'wishlist' && 'Wishlist'}
                    </span>
                </h2>

                <div className={styles.profileContent}>
                    {/* Sidebar */}
                    <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

                    <div className={styles.mainContentContainer}>
                        {/* Main Content */}
                        <div className={styles.contentArea}>
                            {renderTabContent()}
                        </div>

                        {/* Content Description (only for bonus wallet) */}
                        {activeTab === 'bonus-wallet' && (
                            <div data-aos="fade-up" className={styles.contentDescription}>
                                <p data-aos="fade-up">Swipe. Earn. Repeat. Your points = money in the shopping bank! Earn points on every product and turn them into instant discount!</p>
                                <Link data-aos="fade-up" href="/products" className={styles.contentDescriptionButton}>
                                    <p>Explore Products</p>
                                    <svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.43171 12C8.43168 9.50828 9.41798 7.11784 11.1751 5.35112C12.9322 3.58439 15.3172 2.58503 17.8089 2.57143C16.123 1.50964 14.1834 0.919264 12.1919 0.861786C10.2004 0.804309 8.22986 1.28183 6.48561 2.24463C4.74136 3.20743 3.28714 4.62027 2.27443 6.33602C1.26171 8.05178 0.727539 10.0077 0.727539 12C0.727539 13.9923 1.26171 15.9482 2.27443 17.664C3.28714 19.3797 4.74136 20.7926 6.48561 21.7554C8.22986 22.7182 10.2004 23.1957 12.1919 23.1382C14.1834 23.0807 16.123 22.4904 17.8089 21.4286C15.3172 21.415 12.9322 20.4156 11.1751 18.6489C9.41798 16.8822 8.43168 14.4917 8.43171 12Z" fill="white" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M17.6203 6.92572L19.1803 10.0286H22.2832L19.9518 12.4286L20.6889 15.8571L17.6203 14.1429L14.6889 15.8571L15.306 12.4286L12.9746 10.0286H16.0775L17.6203 6.92572Z" fill="white" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>

                                </Link>
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </main>
    );
};

export default ProfilePage; 