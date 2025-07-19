'use client'
import React from 'react';
import styles from './ProfileSidebar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faMapMarkerAlt, faShoppingBag, faWallet, faHeart } from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';


interface ProfileSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, setActiveTab }) => {
    useEffect(() => {
        AOS.init({});
    }, []);
    useEffect(() => {
        AOS.refresh();
    });
    const menuItems = [
        {
            id: 'profile-info',
            label: 'Profile Info',
            icon: faUser
        },
        {
            id: 'my-address',
            label: 'My Address',
            icon: faMapMarkerAlt
        },
        {
            id: 'my-orders',
            label: 'My Orders',
            icon: faShoppingBag
        },
        {
            id: 'bonus-wallet',
            label: 'Bonus Wallet',
            icon: faWallet
        },
        {
            id: 'wishlist',
            label: 'Wishlist',
            icon: faHeart
        }
    ];

    return (
        <div data-aos="fade-right" className={styles.sidebar}>
            <ul className={styles.menu}>
                {menuItems.map((item) => (
                    <li
                        key={item.id}
                        className={`${styles.menuItem} ${activeTab === item.id ? styles.active : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <FontAwesomeIcon icon={item.icon} className={styles.menuIcon} />
                        <span>{item.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProfileSidebar; 