"use client"

import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';
import logo from '../assets/logo.png';
import lang from '../assets/en.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faStarAndCrescent } from '@fortawesome/free-solid-svg-icons';
import { faBagShopping } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

const Navbar = () => {
    const pathname = usePathname();
    const [showTopBar, setShowTopBar] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    // Add useRef for dropdown and mobile menu
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Check if current path is an auth page
    useEffect(() => {
        if (pathname?.includes('login') || pathname?.includes('signup') || pathname?.includes('reset-password') ||
            pathname?.includes('forgot-password') || pathname?.includes('new-password') ||
            pathname?.includes('verify-email')) {
            setShowTopBar(false);
        } else {
            setShowTopBar(true);
        }
    }, [pathname]);

    // Check authentication status
    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        // Set up auth state listener
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, []);

    // Add effect for click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 992;
            setIsMobile(mobile);
            if (!mobile) setIsMobileMenuOpen(false); // Close menu if leaving mobile
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            // No need to redirect, auth listener will update state
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsSearchOpen(false);
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className={styles.navbar}>
            {showTopBar && (
                <div className={styles.topBar}>
                    <div className={styles.topBarContent}>
                        <div className={styles.leftLinks}>
                            <Link href="/our-policies">Our Policies</Link>
                            <Link href="/delivery-policies">Delivery Policies</Link>
                            <Link href="/profile">Bonus Wallet</Link>
                            <Link href="/50-discount-deal">50% discount deal</Link>
                            <Link href="/health">Health and wellbeing</Link>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.mainNav}>
                <button className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
                    <FontAwesomeIcon icon={faBars} />
                </button>

                <div className={styles.logo}>
                    <Link href="/">
                        <Image
                            src={logo}
                            alt="Samara Logo"
                            width={120}
                            height={60}
                            className={styles.logoImage}
                            priority
                        />
                    </Link>
                </div>

                {/* Side Drawer and Overlay for Mobile */}
                {isMobile && isMobileMenuOpen && (
                    <>
                        <div className={styles.menuOverlay} onClick={toggleMobileMenu} />
                        <nav
                            className={
                                `${styles.sideMenu} ${isMobileMenuOpen ? styles.active : ''}`
                            }
                            ref={mobileMenuRef}
                            aria-hidden={!isMobileMenuOpen}
                        >
                            {/* Logo at the top */}
                            <div className={styles.sideMenuLogoWrapper}>
                                <Image src={logo} alt="Samara Logo" width={120} height={100} className={styles.sideMenuLogo} />
                            </div>
                            {/* Main navigation links */}
                            <div className={styles.sideMenuSection}>
                                <Link href="/" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>Home</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                <Link href="/categories" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>Categories</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                <Link href="/category" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>Products</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                <Link href="/shopping-cart" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>Cart</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                <Link href="/profile" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>My Account</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                <Link href="/about" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>About</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                <Link href="/contact-us" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>Contact Us</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                            </div>
                            {/* Divider */}
                            <hr className={styles.sideMenuDivider} />
                            {/* Collapsible Information Section */}
                            <div className={styles.sideMenuSection}>
                                <button
                                    className={styles.collapseButton}
                                    onClick={() => setIsInfoOpen((prev) => !prev)}
                                    aria-expanded={isInfoOpen}
                                    aria-controls="info-section"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: 'none',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '1.4rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        width: '100%',
                                        padding: '5px 12px',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <span>Information</span>
                                    <FontAwesomeIcon icon={faChevronDown} style={{ transform: isInfoOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                </button>
                                {isInfoOpen && (
                                    <div id="info-section" className={styles.infosection}>
                                        <Link href="/reviews" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>Reviews</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                        <Link href="/our-policies" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>Our Policies</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                        <Link href="/delivery-policies" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>Delivery Policies</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                        <Link href="/profile" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>Bonus Wallet</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                        <Link href="/50-discount-deal" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>50% discount deal</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                        <Link href="/health" onClick={toggleMobileMenu} className={styles.sideMenuLink}><span>Health and wellbeing</span><FontAwesomeIcon icon={faChevronRight} className={styles.sideMenuArrow} /></Link>
                                    </div>
                                )}
                            </div>

                            {/* Logout button (if logged in) or Login button (if not) */}
                            {user ? (
                                <button className={styles.sideMenuLogout} onClick={() => { handleLogout(); toggleMobileMenu(); }}>Logout</button>
                            ) : (
                                <Link href="/login" className={styles.loginButton2} onClick={toggleMobileMenu}>
                                    Login
                                    <FontAwesomeIcon icon={faStarAndCrescent} />
                                </Link>
                            )}
                            {/* Decorative art at the bottom if available */}
                            <div className={styles.sideMenuBottomArtWrapper}>
                                {/* Replace with your art asset if available */}
                                {/* <Image src={bottomArt} alt="Decorative Art" width={220} height={80} className={styles.sideMenuBottomArt} /> */}
                            </div>
                        </nav>
                    </>
                )}

                {/* Desktop Main Links */}
                <div className={styles.mainLinks}>
                    <Link href="/">Home</Link>
                    <Link href="/categories">Categories</Link>
                    <Link href="/category">Products</Link>
                    <Link href="/about">About</Link>
                    <Link href="/contact-us">Contact Us</Link>
                </div>

                <div className={styles.rightSection}>
                    <button className={styles.mobileMenuButton} onClick={toggleSearch}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>

                    <div className={`${styles.searchBar} ${isSearchOpen ? styles.active : ''}`}>
                        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                        <input type="text" placeholder="Search" />
                    </div>

                    <button className={styles.langButton}>
                        <Image src={lang} alt="English" width={20} height={20} />
                        ENG
                    </button>

                    {
                        !loading && isMobile && (
                            user ? (
                                <Link href="/profile" className={styles.cartButton}>
                                    <FontAwesomeIcon icon={faUser} />
                                </Link>
                            ) : (
                                <Link href="/login" className={styles.cartButton}>
                                    <FontAwesomeIcon icon={faUser} />
                                </Link>
                            )
                        )
                    }

                    <Link href="/shopping-cart" className={styles.cartButton}>
                        <FontAwesomeIcon icon={faBagShopping} />
                    </Link>


                    {!loading && !isMobile && (
                        user ? (
                            <div
                                className={styles.userProfile}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                ref={dropdownRef}
                            >
                                <div className={styles.userAvatar}>
                                    {user.user_metadata?.avatar_url ? (
                                        <Image
                                            src={user.user_metadata.avatar_url}
                                            alt="Profile"
                                            width={40}
                                            height={40}
                                            className={styles.avatarImage}
                                        />
                                    ) : (
                                        <div className={styles.defaultAvatar}>
                                            {(user.user_metadata?.full_name || user.email || '').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.userInfo}>
                                    <span className={styles.welcomeText}>Welcome</span>
                                    <span className={styles.userName}>
                                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                                    </span>
                                </div>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.dropdownOpen : ''}`}
                                />

                                {isDropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        <Link href="/profile" className={styles.dropdownItem}>
                                            <FontAwesomeIcon icon={faUser} className={styles.dropdownItemIcon} />
                                            Profile
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLogout();
                                            }}
                                            className={styles.dropdownItem}
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className={styles.dropdownItemIcon} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (

                            <Link href="/login" className={styles.loginButton}>
                                Login
                                <FontAwesomeIcon icon={faStarAndCrescent} />
                            </Link>



                        )
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 