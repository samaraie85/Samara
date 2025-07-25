"use client"

import styles from './Footer.module.css';
import Image from 'next/image';
import logo from '../assets/logo.png';
import lantern from '../assets/lantern.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTiktok, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NewsletterDialog from './NewsletterDialog';
import { useState } from 'react';

const Footer = () => {
    const pathname = usePathname();
    const [collapsedSections, setCollapsedSections] = useState({
        company: true,
        legal: true,
        shopDeals: true
    });
    const [showNewsletter, setShowNewsletter] = useState(false);

    const toggleSection = (section: 'company' | 'legal' | 'shopDeals') => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Check if current page is an auth page or admin page
    const isAuthPage = pathname?.includes('login')
        || pathname?.includes('signup')
        || pathname?.includes('forgot-password')
        || pathname?.includes('new-password')
        || pathname?.includes('reset-password')
        || pathname?.includes('verify-email')
        || pathname?.includes('samara'); // Added check for admin pages

    // Don't render footer on auth pages or admin pages
    if (isAuthPage) {
        return null;
    }

    return (
        <>
            <footer className={styles.footer}>
                <div className={styles.topSection}>
                    <Image src={lantern} alt="Lantern" width={250} className={styles.lantern} />

                    <div className={styles.left}>
                        <Image src={logo} alt="Samara Logo" width={120} />
                        <p className={styles.description}>
                            Samara is an Arabic brand,specializing in selling high quality Arabic products that are distinguished by their arabic authenticity.Samara Established in 2024 and its goal is to feel good and return to using our authentic arabic products.
                        </p>

                        <div
                            style={{
                                width: '100%',
                                height: '6px',
                                margin: '36px 0',
                                borderRadius: '8px',
                                background: 'linear-gradient(90deg, #FFD54A 0%, #fffbe6 50%, #FFD54A 100%)',
                                boxShadow: '0 0 18px 2px #FFD54A55, 0 2px 8px #FFD54A22',
                                opacity: 0.98,
                                position: 'relative',
                            }}
                        />

                        <p className={styles.newsletterText}>
                            <strong>Stay tuned!</strong>👀<br />
                            Add your email to our newsletter and be the first to know when our meat collection goes live — plus get exclusive updates and offers straight to your inbox!
                        </p>


                        <button
                            className={styles.newsletterButton}
                            onClick={() => setShowNewsletter(true)}
                        >
                            Subscribe to Newsletter
                        </button>
                        <div className={styles.right}>
                            <div className={styles.socialIcons}>
                                <a href="https://www.facebook.com/IrSamaraHub" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebookF} /></a>
                                <a href="https://www.instagram.com/irsamarahub" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} /></a>
                                <a href="https://www.tiktok.com/@irsamarahub" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faTiktok} /></a>
                            </div>
                        </div>
                    </div>
                    <div className={styles.footerLinksGrid}>
                        <div className={styles.footerLinksSection}>
                            <div
                                className={styles.linksTitle}
                                onClick={() => toggleSection('company')}
                            >
                                Company&nbsp;&nbsp;
                                <FontAwesomeIcon
                                    icon={collapsedSections.company ? faChevronDown : faChevronUp}
                                    className={styles.collapseIcon}
                                />
                            </div>
                            <ul className={styles.linksList} style={{
                                display: collapsedSections.company ? 'none' : 'block'
                            }}>
                                <li><Link href="/search">Search</Link></li>
                                <li><Link href="/profile">Your Account</Link></li>
                                <li><Link href="/delivery-coverage">Delivery Coverage</Link></li>
                                <li><Link href="/health">Health and wellbeing</Link></li>
                                <li><Link href="https://form.jotform.com/250564921892363">Careers</Link></li>
                                <li><Link href="/about">About us</Link></li>
                                <li><Link href="/contact-us">Contact us</Link></li>
                            </ul>
                        </div>
                        <div className={styles.footerDivider} />

                        <div className={styles.footerLinksSection}>
                            <div
                                className={styles.linksTitle}
                                onClick={() => toggleSection('legal')}
                            >
                                Legal&nbsp;&nbsp;
                                <FontAwesomeIcon
                                    icon={collapsedSections.legal ? faChevronDown : faChevronUp}
                                    className={styles.collapseIcon}
                                />
                            </div>
                            <ul className={styles.linksList} style={{
                                display: collapsedSections.legal ? 'none' : 'block'
                            }}>
                                <li><Link href="/delivery-policies">Delivery policy</Link></li>
                                <li><Link href="/refund-policy">Refund policy</Link></li>
                                <li><Link href="/our-policies">Privacy policy</Link></li>
                                <li><Link href="/terms">Terms and conditions</Link></li>
                                <li><Link href="/faqs">FAQs</Link></li>
                            </ul>
                        </div>
                        <div className={styles.footerDivider} />
                        <div className={styles.footerLinksSection}>
                            <div
                                className={styles.linksTitle}
                                onClick={() => toggleSection('shopDeals')}
                            >
                                Shop Deals&nbsp;&nbsp;
                                <FontAwesomeIcon
                                    icon={collapsedSections.shopDeals ? faChevronDown : faChevronUp}
                                    className={styles.collapseIcon}
                                />
                            </div>
                            <ul className={styles.linksList} style={{
                                display: collapsedSections.shopDeals ? 'none' : 'block'
                            }}>
                                <li><Link href="category/hot-deals">Hot deal</Link></li>
                                <li><Link href="/50-discount-deal">50% deal</Link></li>
                                <li><Link href="/points-deal">Points deal</Link></li>
                                <li><Link href="/delivery-deal">Delivery deal</Link></li>

                            </ul>
                        </div>
                    </div>
                </div>
                <div className={styles.bottomSection}>
                    Developed By Comma Creative Solutions
                </div>
            </footer>
            <NewsletterDialog isOpen={showNewsletter} onClose={() => setShowNewsletter(false)} />
        </>
    );
};

export default Footer; 